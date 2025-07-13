import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { FOLDERS, ITEM_TYPE_MAP, ITEM_TYPES } from "../lib/config";
import { CIVILIZATIONS } from "../lib/config/civs";
import { writeJson } from "../lib/files/writeData";
import { CIVILIZATION_BY_SLUG, CivConfig } from "../types/civs";
import { Item } from "../types/items";
import { hardcodedDiscovery, hardcodedDiscoveryCommon } from "./config";
import { workarounds } from "./workarounds";
import { parseItemFromAttribFile, maybeOnKey } from "./parse";
import { getTranslation as t } from "./translations";
import { getXmlData, parseXmlFile } from "./xml";
import { getEssenceData, guessAppropriateEssenceFile } from "./essence";
import { copyIcon } from "./icons";

const runType = process.argv.some((arg) => arg === "--essence") ? "essence" : "xml";
let runCiv: CivConfig | undefined;
if (process.argv.some((arg) => arg === "--civ")) {
  const runCivString = process.argv[process.argv.findIndex((arg) => arg === "--civ") + 1];
  runCiv = runCivString?.length == 2 ? CIVILIZATIONS[runCivString] : CIVILIZATION_BY_SLUG[runCivString?.toLowerCase()];
  if (!runCiv) throw Error(`Could not find civ ${runCivString}, valid options are ${Object.keys(CIVILIZATION_BY_SLUG).join(", ")} or the 2 letter abbreviation`);
}

const getData = runType == "essence" ? getEssenceData : getXmlData;

export type RunContext = {
  debug: boolean;
  getData: typeof getXmlData | typeof getEssenceData;
  race: string;
  runner: "xml" | "essence";
};

// 1. For each civ, start at their army file
// 2. Then, follow the villager construction options
// 3. Then, for each building in their, folllow the building/research options
// 4. Make a list of all to import items, starting at buildings

async function buildTechTree(civ: CivConfig, context: RunContext = { debug: false, getData, race: civ.attribName, runner: runType }) {
  const techtree = {};
  const files = new Set<string>();
  const items = new Map<string, Item>();
  const filesToItemId = new Map<string, string>();
  const produces = new Map<string, Set<string>>();
  const { debug, getData, race } = context;

  const army: any = await getData(`army/normal_${race}`, context);
  const bps = await getData(`racebps/${race}`, context);

  const army_extensions = army?.extensions?.[0] ?? army.army_bag;
  const civOverview = getCivInfo(army_extensions, bps?.extensions?.[0]);

  async function addFile(file: string) {
    if (!file) return;
    if (context.runner == "essence") file = (await guessAppropriateEssenceFile(file)) ?? file;
    files.add(file);
    return file;
  }

  for (const b of army_extensions?.starting_buildings) await addFile(b.starting_building);
  for (const u of army_extensions?.starting_units) await addFile(u);
  for (const file of hardcodedDiscovery[civ.slug] ?? []) await addFile(file);
  for (const file of hardcodedDiscoveryCommon ?? []) await addFile(file);

  async function parseFileRecursively(file: string) {
    const matchedFile = await addFile(file);
    if (!matchedFile) return;
    file = matchedFile;
    if (filesToItemId.has(file)) return items.get(filesToItemId.get(file)!);
    const data = await getData(file, context);
    if (debug) writeTemp(data, file);

    const item = await parseItemFromAttribFile(file, data, civ, context);
    if (!item) return;

    for (const [override, { predicate, mutator, validator, callContext }] of workarounds)
      if (predicate(item)) {
        mutator(item);
        debug && console.info(`Overriding ${item.id} with ${override}`);
        if (validator && !validator(item)) {
          console.error(`Invalid item ${item.id} after override ${override}`, item);
          throw new Error("Error during workarounds: " + callContext);
        }
      }

    // Workarounds can set this flag
    if ((item as any)._skip) {
      debug && console.error(`Skip`, item.id);
      return;
    }

    if (item.icon && !item.icon.startsWith("http")) {
      // Ideally i'd use useIcon, but the original files use the original 'age' and thus would end up with different filenames now. So instead we let workarounds deal with it case-by-case as they can override 'icon' before it's used here.
      // But leaving this here so we can opt for having all icon stuff done after mutations are done.
      //const icon_url = await useIcon(item.icon, ITEM_TYPE_MAP[item.type], item.id);
      const icon_url = await copyIcon(item.icon_src, item.icon);

      if (icon_url) {
        item.icon = icon_url;
      } else {
         console.log(`undefined icon for ${file}`, item.icon);
         item.icon = undefined;
      }
    }
    item.icon_src = undefined;

    if (items.has(item.id) && items.get(item.id)!.type == item.type) {
      console.error(
        `Duplicate item id ${item.id} in ${file} conflicts with ${items.get(item.id)!.attribName} ${[...files.values()]
          .filter((x) => x?.includes(items.get(item.id)!.attribName!))
          .join(", ")}`
      );
    }

    items.set(item.id, item);
    filesToItemId.set(file, item.id);

    const itemProduces = produces.get(item?.baseId!) ?? produces.set(item?.baseId!, new Set()).get(item?.baseId!)!;
    const discovered = await tryFindFile(race, [findConstructables(data), findUpgrades(data), findUnits(data), findEbpAbilities(data), findSbpAbilities(data)].flat());
    for (const d of discovered) {
      const dItem = await parseFileRecursively(d);
      if (dItem && !Object.isFrozen(dItem.producedBy)) {
        dItem.producedBy ??= [];
        dItem.producedBy = [...new Set(dItem.producedBy).add(item.baseId)];
        sortProducedBy(dItem);
        itemProduces.add(dItem.baseId);
      }
    }
    techtree[item.id] = discovered.map((d) => filesToItemId.get(d)!);

    // const itemProduces = produces.get(item?.id!) ?? produces.set(item?.id!, new Set()).get(item?.id!)!;
    // const discovered = await tryFindFile(race, [findConstructables(data), findUpgrades(data), findUnits(data), findEbpAbilities(data), findSbpAbilities(data)].flat());
    // for await (const d of discovered) {
    //   const dItem = await parseFileRecursively(d);
    //   if (dItem) {
    //     dItem.producedBy = [...new Set(dItem.producedBy).add(item.baseId)];
    //     itemProduces.add(dItem.id);
    //   }
    // }
    // techtree[item.id] = discovered.map((d) => filesToItemId.get(d)!);

    return item;
  }

  for (const f of files) await parseFileRecursively(f);
  for (const i of items.values()) persistItem(i, civ);

  function fetchTree(id, depth = 0) {
    if (depth > 10 || (id === "villager-1" && depth > 0)) return null;
    const tree = {};
    depth++;
    for (const produces of techtree[id] ?? []) if (!!produces) tree[produces] = fetchTree(produces, depth);
    return Object.keys(tree).length ? tree : null;
  }

  civOverview.techtree = fetchTree(["villager-1"]);
  writeJson(`${FOLDERS.CIVILIZATIONS.DATA}/${civ.slug}.json`, civOverview, { log: false });
}

function ensureFolderStructure() {
  for (const folder of Object.values(FOLDERS)
    .map((x) => [x.DATA, x.IMG])
    .flat())
    !existsSync(folder) && mkdirSync(folder, { recursive: true });
}

export function writeTemp(data: any, name: string) {
  fs.writeFile(path.join(__dirname, ".temp", `${name.split("/").pop()}.json`), JSON.stringify(data, null, 2));
}

function sortProducedBy(item: any) {
  if (item.producedBy && Array.isArray(item.producedBy)) {
    item.producedBy.sort((a: string, b: string) => a.localeCompare(b));
  }
  return item;
}

function findUnits(data: any) {
  return data?.extensions?.find((x) => x.exts === "ebpextensions/spawner_ext")?.spawn_items?.map((s) => (s.spawn_item ?? s).squad) ?? [];
}

function findUpgrades(data: any) {
  return data?.extensions?.find((x) => x.exts === "ebpextensions/upgrade_ext")?.standard_upgrades?.flatMap((u) => u.upgrade ?? u) ?? [];
}

function findConstructables(data: any) {
  return (
    data?.extensions
      ?.find((x) => x.squadexts === "sbpextensions/squad_engineer_ext")
      ?.construction_groups.flatMap((g) => (g.construction_group ?? g).construction_items.map((i) => (i.construction_item ?? i).ebp)) ?? []
  );
}

//issue in these functions in that if the item was found with sbp then ebp wont discover, and vise versa
function findEbpAbilities(data: any) {
  const foundAbilities = data?.extensions?.find((x) => x.exts === "ebpextensions/ability_ext")?.abilities?.flatMap((u) => u.ability ?? u) ?? [];
  return foundAbilities;
}

function findSbpAbilities(data: any) {
  const foundAbilities = data?.extensions?.find((x) => x.exts === "sbpextensions/squad_ability_ext")?.abilities?.flatMap((u) => u.ability ?? u) ?? [];
  return foundAbilities;
}

async function tryFindFile(race: string, paths: string[]) {
  return (
    await Promise.all(
      paths.map((path) => {
        if (!path) return undefined;
        return guessAppropriateEssenceFile(path) ?? path;
      })
    )
  ).filter(Boolean) as string[];
}

function getCivInfo(army_bag: any, bps_race_bag: any) {
  if (!army_bag || !bps_race_bag) return;
  const overview = army_bag.ui?.global_traits_summary.map((x) => {
    const title = t(x.title);
    const description = x.description_formatter?.value ? t(x.description_formatter.formatter, x.description_formatter.formatter_arguments) : t(x.description);
    const list = description.startsWith("• ")
      ? description
          .split("• ")
          .map((x) => x.trim())
          .filter(Boolean)
      : undefined;
    if (list) return { title, list };
    return { title, description };
  });
  return {
    name: t(bps_race_bag.name),
    description: t(bps_race_bag.description),
    classes: t(army_bag.ui?.one_liner),
    overview,
  } as any;
}

const itemTypeMap = {
  unit: ITEM_TYPES.UNITS,
  building: ITEM_TYPES.BUILDINGS,
  technology: ITEM_TYPES.TECHNOLOGIES,
  upgrade: ITEM_TYPES.UPGRADES,
  ability: ITEM_TYPES.ABILITIES,
};

function persistItem(item: Item, civ: CivConfig) {
  writeJson(`${FOLDERS[itemTypeMap[item.type]].DATA}/${civ.slug}/${item.id}.json`, item, { log: false });
}

ensureFolderStructure();
if (runCiv) buildTechTree(runCiv);
else for (const civ of Object.values(CIVILIZATIONS)) buildTechTree(civ);
