import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { FOLDERS, ITEM_TYPES } from "../lib/config";
import { CIVILIZATIONS } from "../lib/config/civs";
import { writeJson } from "../lib/files/writeData";
import { civConfig } from "../types/civs";
import { Item } from "../types/items";
import { attribFile, hardcodedDiscovery, hardcodedDiscoveryCommon, racesMap } from "./config";
import { workarounds } from "./workarounds";
import { parseItemFromAttribFile, maybeOnKey } from "./parse";
import { getTranslation as t } from "./translations";
import { getXmlData, parseXmlFile } from "./xml";
import { getEssenceData, guessAppropriateEssenceFile } from "./essence";

let getData = getXmlData;
if (process.argv[2] === "--essence") getData = getEssenceData;

export type RunContext = {
  debug: boolean;
  getData: typeof getXmlData | typeof getEssenceData;
  race: string;
};

// 1. For each civ, start at their army file
// 2. Then, follow the villager construction options
// 3. Then, for each building in their, folllow the building/research options
// 4. Make a list of all to import items, starting at buildings

async function buildTechTree(civ: civConfig, context: RunContext = { debug: false, getData, race: racesMap[civ.slug] }) {
  const techtree = {};
  const files = new Set<string>();
  const items = new Map<string, Item>();
  const filesToItemId = new Map<string, string>();
  const produces = new Map<string, Set<string>>();
  const { debug, getData, race } = context;

  const army: any = await parseXmlFile(attribFile(`army/standard_mode/normal_${race}`), context);
  const bps = await parseXmlFile(attribFile(`racebps/${race}`), context);

  const civOverview = getCivInfo(army.army_bag, bps);

  for (const b of army?.army_bag?.starting_buildings) files.add(b.starting_building.building);
  for (const u of army?.army_bag?.starting_units) files.add(u.squad);
  for (const file of hardcodedDiscovery[civ.slug] ?? []) files.add(file);
  for (const file of hardcodedDiscoveryCommon?? []) files.add(file);

  async function parseFilesRecursively(file: string) {
    if (!files.has(file)) files.add(file);
    if (filesToItemId.has(file)) return;
    const data = await getData(attribFile(file), undefined, context);
    if (debug) writeTemp(data, file);

    const item = await parseItemFromAttribFile(file, data, civ, context);
    if (!item) return;

    for (const [override, { predicate, mutator, validator }] of workarounds)
      if (predicate(item)) {
        mutator(item);
        debug && console.info(`Overriding ${item.id} with ${override}`);
        if (validator && !validator(item)) {
          console.error(`Invalid item ${item.id} after override ${override}`, item);
          throw new Error("Error during workarounds");
        }
      }

    // Workarounds can set this flag
    if ((item as any)._skip) {
      debug && console.error(`Skip`, item.id);
      return;
    }

    if (items.has(item.id)) {
      if (items.get(item.id)!.type == item.type) {
        throw new Error(`Duplicate item id ${item.id} in ${file} conflicts with ${items.get(item.id)!.attribName}`);
      }
    }

    items.set(item.id, item);
    filesToItemId.set(file, item.id);

    const itemProduces = produces.get(item?.baseId!) ?? produces.set(item?.baseId!, new Set()).get(item?.baseId!)!;
    const discovered = await tryFindFile(race, [findConstructables(data), findUpgrades(data), findUnits(data)].flat());
    for (const d of discovered) {
      await parseFilesRecursively(d);
      const dId = filesToItemId.get(d)!;
      const dItem = items.get(dId);
      if (dItem && !Object.isFrozen(dItem.producedBy)) {
        dItem.producedBy ??= [];
        dItem.producedBy = [...new Set(dItem.producedBy).add(item.baseId)];
        itemProduces.add(dItem.baseId);
      }
    }
    techtree[item.id] = discovered.map((d) => filesToItemId.get(d)!);
  }

  for (const f of files) await parseFilesRecursively(f);
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

async function tryFindFile(race: string, paths: string[]) {
  return (
    await Promise.all(
      paths.map((path) => {
        if (!path) return undefined;
        if (path.split("/").length <= 2) return guessAppropriateEssenceFile(path, race);
        return path;
      })
    )
  ).filter(Boolean) as string[];
}

function getCivInfo(army_bag: any, bps: any) {
  if (!army_bag || !bps) return;
  const overview = army_bag.ui?.global_traits_summary.map((x) => {
    const title = t(x.trait.title);
    const description = t(x.trait.description);
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
    name: t(bps.race_bag.name),
    description: t(bps.race_bag.description),
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

function persistItem(item: Item, civ: civConfig) {
  writeJson(`${FOLDERS[itemTypeMap[item.type]].DATA}/${civ.slug}/${item.id}.json`, item, { log: false });
}

ensureFolderStructure();
for (const civ of Object.values(CIVILIZATIONS)) buildTechTree(civ);
// buildTechTree(CIVILIZATIONS.en);
