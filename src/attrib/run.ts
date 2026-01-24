import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { FOLDERS, ITEM_TYPE_MAP, ITEM_TYPES } from "../lib/config";
import { CIVILIZATIONS } from "../lib/config/civs";
import { writeJson } from "../lib/files/writeData";
import { getAllItems } from "../lib/files/readData";
import { optimizeItems, unifyItems } from "../lib/utils/items";
import { CIVILIZATION_BY_SLUG, CivConfig, CivSlug } from "../types/civs";
import { Item } from "../types/items";
import { hardcodedDiscovery, hardcodedDiscoveryCommon } from "./config";
import { workarounds } from "./workarounds";
import { parseItemFromAttribFile, maybeOnKey } from "./parse";
import { getTranslation as t } from "./translations";
import { getEssenceData, guessAppropriateEssenceFile } from "./essence";
import { copyIcon } from "./icons";

if (process.argv.some((arg) => arg === "--essence")) {
  console.log(`Warning: --essence is obsolete since it's now the default, and xml parsing is no longer supported`);
}

if (process.argv.some((arg) => arg === "--civ")) {
  throw Error(`--civ is no longer allowed since it could mess up icon conflict resolution`);
}

const getData = getEssenceData;

export type RunContext = {
  debug: boolean;
  getData: typeof getEssenceData;
  race: string;
};

// 1. For each civ, start at their army file
// 2. Then, follow the villager construction options
// 3. Then, for each building in their, folllow the building/research options
// 4. Make a list of all to import items, starting at buildings

interface CivTechTree {
  items: Item[];
  civ: CivConfig;
  civOverview: any;
}


async function buildTechTree(
  civ: CivConfig,
  context: RunContext = { debug: false, getData, race: civ.attribName! }
) : Promise<CivTechTree> {
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
    file = (await guessAppropriateEssenceFile(file)) ?? file;
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

  function fetchTree(id, depth = 0) {
    if (depth > 10 || (id === "villager-1" && depth > 0)) return null;
    const tree = {};
    depth++;
    for (const produces of techtree[id] ?? []) if (!!produces) tree[produces] = fetchTree(produces, depth);
    return Object.keys(tree).length ? tree : null;
  }

  civOverview.techtree = fetchTree(["villager-1"]);

  return {
    civ,
    civOverview,
    items: [...items.values()]
  }
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

function groupBy<T>(list: T[], func:(x:T)=>string | undefined): Map<string, T[]> {
  const result = new Map<string, T[]>();

  list.forEach(item => {
    const key = func(item);
    if (key === undefined)
      return;
    const collection = result.get(key);
    if (collection) {
      collection.push(item);
    } else {
      result.set(key, [item]);
    }
  });

  return result;
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

const meta = {
  __note__: "This is file is autogenerated, do not edit it manually. For more info https://data.aoe4world.com/",
  __version__: "0.0.2",
};

/** Creates index files for units */
async function compile(type: ITEM_TYPES) {
  const items = await getAllItems(type);
  if (!items) return;
  const unified = unifyItems(items);
  const baseIds = items.reduce((s, item) => { s[item.baseId] = item.name; return s; }, {});

  writeJson(path.join(FOLDERS[type].DATA, "all.json"), { ...meta, data: items });
  writeJson(path.join(FOLDERS[type].DATA, "all-unified.json"), { ...meta, data: unified });
  writeJson(path.join(FOLDERS[type].DATA, "all-optimized.json"), { ...meta, data: optimizeItems(unified) });
  //writeJson(path.join(FOLDERS[type].DATA, "all-baseids.json"), { ...meta, data: baseIds });
  unified.forEach((u) => writeJson(path.join(FOLDERS[type].DATA, `unified/${u.id}.json`), Object.assign({}, meta, u), { log: false }));

  Object.values(CIVILIZATIONS).forEach((civ) => {
    const civItems = items.filter((u) => u.civs.includes(civ.abbr));
    const unified = unifyItems(civItems);
    writeJson(path.join(FOLDERS[type].DATA, `${civ.slug}.json`), { ...meta, civ: civ, data: civItems });
    writeJson(path.join(FOLDERS[type].DATA, `${civ.slug}-unified.json`), { ...meta, civ: civ, data: unified });
    writeJson(path.join(FOLDERS[type].DATA, `${civ.slug}-optimized.json`), { ...meta, civ: civ, data: optimizeItems(unified) });
  });
}

(async () => {
  ensureFolderStructure();

  // Build all the civ tech trees in memory
  const civTechTreeMap = new Map<string, CivTechTree>();
  for (const civ of Object.values(CIVILIZATIONS)) {
    civTechTreeMap.set(civ.abbr, await buildTechTree(civ, undefined));
  }

  // Detect icon conflicts (and potentially resolve)
  let iconMap = groupBy([...civTechTreeMap.values()].map(v => v.items).flat(), item => item.icon);
  for (const [icon_dest, variations] of iconMap) {
    const icon_srcs = [...new Set(variations.map((v) => v.icon_src).filter(v => v))];
    if (icon_srcs.length > 1) {
      resolveIconConflict(icon_dest, variations);
    }
  }
  iconMap = groupBy([...civTechTreeMap.values()].map(v => v.items).flat(), item => item.icon);

  // Copy Icons
  for (const [icon_dest, variations] of iconMap) {
    const icon_src = variations.map(v => v.icon_src).filter(v => v)[0];
    const newIcon = await copyIcon(icon_src, icon_dest);
    variations.forEach(v => {
      if (v.icon) {
        v.icon = newIcon;
      }
      delete v['icon_src'];
    });
  }

  // Persist Items & Civ
  for (const [civ, techTree] of civTechTreeMap) {
    console.log(`Persisting ${techTree.civ.name}...`);
    techTree.items.forEach(item => {
      persistItem(item, techTree.civ);
    });
    
    writeJson(`${FOLDERS.CIVILIZATIONS.DATA}/${techTree.civ.slug}.json`, techTree.civOverview, { log: false });
  }

  [ITEM_TYPES.UNITS, ITEM_TYPES.TECHNOLOGIES, ITEM_TYPES.BUILDINGS, ITEM_TYPES.UPGRADES, ITEM_TYPES.ABILITIES].forEach((type) => compile(type));
})();

function resolveIconConflict(icon_dest: string, variations: Item[]) {
  let groups = {};
  variations.forEach(v => {
    if (!v.icon_src)
      return;
    else if (groups[v.icon_src])
      groups[v.icon_src].push(v);
    else
      groups[v.icon_src] = [v];
  });
  console.log(`Icon conflict at ${icon_dest} by: ${JSON.stringify(Object.keys(groups))}`);
  /*for (const variation of variations) {
    const civ_abbr = variation.civs[0];
    const civ = Object.values(CIVILIZATIONS).find((c) => c.abbr === civ_abbr);
    if (civ && variation.icon) {
      const path = variation.icon.split("/");
      path.splice(path.length - 1, 0, civ.slug);
      variation.icon = path.join("/");
    }
  }*/
}
