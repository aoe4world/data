import { assert } from "console";
import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { FOLDERS, ITEM_TYPES } from "../../lib/config";
import { CIVILIZATIONS } from "../../lib/config/civs";
import { writeJson } from "../../lib/files/writeData";
import { civConfig } from "../../types/civs";
import { Item } from "../../types/items";
import { attribFile, hardcodedDiscovery, racesMap } from "./config";
import { workarounds } from "./overrides";
import { parseItemFromAttribFile } from "./parse";
import { getTranslation as t } from "./translations";
import { parseXmlFile } from "./xml";

// 1. For each civ, start at their army file
// 2. Then, follow the villager construction options
// 3. Then, for each building in their, folllow the building/research options
// 4. Make a list of all to import items, starting at buildings

async function buildTechTree(civ: civConfig, debug = false) {
  const files = new Set<string>();
  const items = new Map<string, Item>();
  const filesToItemId = new Map<string, string>();
  const produces = new Map<string, Set<string>>();

  const race = racesMap[civ.slug];
  const army = await parseXmlFile(attribFile(`army/${race}`));
  const bps = await parseXmlFile(attribFile(`racebps/${race}`));

  const civOverview = getCivInfo(army.army_bag, bps);
  if (civOverview?.overview) writeJson(`${FOLDERS.CIVILIZATIONS.DATA}/${civ.slug}.json`, civOverview, { log: false });

  for (const b of army?.army_bag?.starting_buildings) {
    files.add(b.starting_building.building);
    for (const s of b.starting_building.starting_squads) files.add(s.starting_squad.squad);
  }

  for (const file of hardcodedDiscovery[civ.slug] ?? []) files.add(file);

  async function parseFilesRecursively(file: string) {
    if (!files.has(file)) files.add(file);
    if (filesToItemId.has(file)) return;
    const data = await parseXmlFile(attribFile(file));
    if (debug) writeTemp(data, file);

    const item = await parseItemFromAttribFile(file, data, civ);
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

    items.set(item.id, item);
    filesToItemId.set(file, item.id);

    const itemProduces = produces.get(item?.baseId!) ?? produces.set(item?.baseId!, new Set()).get(item?.baseId!)!;
    const discovered = [findConstructables(data), findUpgrades(data), findUnits(data)].flat();
    for (const d of discovered) {
      await parseFilesRecursively(d);
      const dId = filesToItemId.get(d)!;
      const dItem = items.get(dId);
      if (dItem) {
        dItem.producedBy ??= [];
        dItem.producedBy = [...new Set(dItem.producedBy).add(item.baseId)];
        itemProduces.add(d.baseId);
      }
    }
  }

  for (const f of files) await parseFilesRecursively(f);
  for (const i of items.values()) persistItem(i, civ);
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
  return data?.extensions?.find((x) => x.exts === "ebpextensions/spawner_ext")?.spawn_items?.map((s) => s.spawn_item.squad) ?? [];
}

function findUpgrades(data: any) {
  return data?.extensions?.find((x) => x.exts === "ebpextensions/upgrade_ext")?.standard_upgrades?.flatMap((u) => u.upgrade) ?? [];
}

function findConstructables(data: any) {
  return (
    data?.extensions
      ?.find((x) => x.squadexts === "sbpextensions/squad_engineer_ext")
      ?.construction_groups.flatMap((g) => g.construction_group.construction_items.map((i) => i.construction_item.ebp)) ?? []
  );
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
  };
}

const itemTypeMap = {
  unit: ITEM_TYPES.UNITS,
  building: ITEM_TYPES.BUILDINGS,
  technology: ITEM_TYPES.TECHNOLOGIES,
  upgrade: ITEM_TYPES.UPGRADES,
};

function persistItem(item: Item, civ: civConfig) {
  writeJson(`${FOLDERS[itemTypeMap[item.type]].DATA}/${civ.slug}/${item.id}.json`, item, { log: false });
}

ensureFolderStructure();
for (const civ of Object.values(CIVILIZATIONS)) buildTechTree(civ);
