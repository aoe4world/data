import path from "path";
import { ATTRIB_FOLDER, ESSENCE_FOLDER, SOURCE_FOLDER } from "./config";
import { getXmlData, logJson } from "./xml";
import fs from "fs/promises";
import type { RunContext } from "./run";
import { existsSync } from "fs";

// To be documented, below is a forceful way to get the by Essence formatted json to fit the shape of our own normalized format
// Some hardcoded keys and values are used to define behavior, and it is a bit slow, but it works for now

const parseAsValue = ["parent_pbg", "upgrade_bag", "weapon_bag"];

export async function getEssenceData<T = NormalizedAttrib>(file: string, base: string = ESSENCE_FOLDER, context: RunContext): Promise<T | undefined> {
  const bestMatch = await guessAppropriateEssenceFile(file, context.race, base);
  if (!bestMatch) return undefined;
  let filePath = path.join(base, bestMatch);
  if (filePath.endsWith(".xml")) filePath = filePath.replace(".xml", ".json");
  if (!filePath.endsWith(".json")) filePath += ".json";

  const fileData: EssenceData = await fs.readFile(filePath, "utf-8").then(JSON.parse);

  let result: any = { extensions: [] };
  for (const { key, value } of (fileData.data[0].value as any as EssenceItem[]) ?? fileData.data) {
    if (parseAsValue.includes(key)) result[key] = formatValue(value);
    else if (typeof value == "object") {
      result.extensions.push(parseItemAsExt({ key, value }));
    } else {
      result[key] = value;
    }
  }

  logJson(result, bestMatch + ".essence");
  return { version: 4, description: null, template: null, source: "AOE4MODS.Essence", ...result };
}

function getExtKey(ext: string) {
  if (ext.startsWith("sbpextensions/squad_")) return "squadexts";
  else return "exts";
}

function parseItemAsExt({ key, value }: EssenceItem) {
  let values = formatValue(value);
  if (typeof values === "string") return { [getExtKey(values)]: values };
  if (values == null) return null;
  if (values.value) {
    values = { [getExtKey(values.value)]: values.value, ...values };
    delete values.value;
  }
  return values;
}

export async function guessAppropriateEssenceFile(file: string, race: string, base = path.join(SOURCE_FOLDER, "/attrib")) {
  if (file.endsWith(".xml")) file = file.replace(".xml", ".json");
  if (!file.endsWith(".json")) file += ".json";
  let matchedFile = file;
  const attemptPaths = [
    insertRaceToPath(race, file),
    insertRaceToPath("common", file),
    ...(file.includes("unit") ? [insertRaceToPath(race + "/units", file), insertRaceToPath("common/units", file)] : []),
    ...(file.includes("building")
      ? [
          insertRaceToPath(race + "/buildings", file),
          insertRaceToPath(race + "/buildings/" + file.split("/").pop()?.replace(".json", ""), file),
          insertRaceToPath("common/buildings", file),
          insertRaceToPath("common/buildings/" + file.split("/").pop()?.replace(".json", ""), file),
        ]
      : []),
    ...(file.includes("upgrade")
      ? [
          insertRaceToPath(race + "/research", file),
          insertRaceToPath(race + "/research/economy", file),
          insertRaceToPath(race + "/research/naval", file),
          insertRaceToPath(race + "/research/unit", file),
          insertRaceToPath(race + "/units", file),
          insertRaceToPath("common/research", file),
          insertRaceToPath("common/research/economy", file),
          insertRaceToPath("common/research/naval", file),
          insertRaceToPath("common/research/unit", file),
          insertRaceToPath("common/units", file),
          `upgrades/races/abbasid_ha_01/research/house_of_wisdom/${path}`,
          `upgrades/races/byzantine/research/mercenary_upgrades/${path}`,
          `upgrades/races/byzantine/mercenary_contracts/${path}`,
        ]
      : []),
    ...(file.includes("weapon")
      ? [insertRaceToPath(race + "/ranged", file), insertRaceToPath(race + "/melee", file), insertRaceToPath("common/melee", file), insertRaceToPath("common/ranged", file)]
      : []),
    ...(file.includes("abilities")
      ? ((file) => {
          const path = file.replace("abilities/", "");
          return [
            `abilities/${path}`,
            `abilities/always_on_abilities/${path}`,
            `abilities/modal_abilities/${path}`,
            `abilities/timed_abilities/${path}`,
            `abilities/toggle_abilities/${path}`,
            `abilities/toggle_abilities/byzantine/cistern_abilities/${path}`,
            insertRaceToPath("abilities/always_on_abilities", path),
            insertRaceToPath("abilities/modal_abilities", path),
            insertRaceToPath("abilities/timed_abilities", path),
            insertRaceToPath("abilities/toggle_abilities", path),
          ];
        })(file)
      : []),
  ].filter(Boolean) as string[];
  const x = [...attemptPaths, file];
  while (!existsSync(path.join(base, matchedFile)) && attemptPaths.length) matchedFile = attemptPaths.shift()!;

  if (!existsSync(path.join(base, matchedFile))) {
    const [folder, filename] = file.split("/");
    const found = await findMatchingFileInFolder(path.join(base, folder), filename);
    if (found) {
      //   console.log(`Found essence file: ${file}`, found);
      return [folder, found.split(folder + "/").pop()!].join("/").replace(".json", "");
    }
  }

  if (!existsSync(path.join(base, matchedFile))) {
    console.log(`Missing essence file: ${file}`, x);
    return;
  }
  return matchedFile.replace(".json", "");
}

async function findMatchingFileInFolder(folder: string, file: string) {
  // inside folder, recuresively walk over all folders and files, until a match is found
  // if no match is found, return undefined
  const files = await fs.readdir(folder);
  for (const f of files) {
    const filePath = path.join(folder, f);
    const stat = await fs.stat(filePath).catch(() => null);
    if (stat?.isDirectory()) {
      const result = await findMatchingFileInFolder(filePath, file);
      if (result) return result;
    }
    if (stat?.isFile() && f === file) return filePath;
  }
}

const valuesAsArray = [
  "*_list",
  "*_types",
  "*_items",
  //   "*_table",
  "weapon_table",
  "requirement_table",
  "target_type_table",
  "*_path",
  "*_upgrades",
  "*_options",
  "*_groups",
  "*_classes",
  "*_mapping",
  "*_caching",
  "*_properties",
  "*_arguments",
  "*state_trees",
  "*upgrade_type",
  "unit_attachments",
  "requirements",
  "roads",
  "hardpoints",
  "abilities",
  "ui_extra_infos",
  "attack_target_restriction_on_victim",
  "global_traits_summary",
  "starting_buildings",
  "starting_units",
];

function parseValues(values: EssenceItem[]) {
  if (values.length === 0) return [];
  let result: any = {};
  const valuesMap = Object.fromEntries(values.map((v) => [v.key, v.value]));
  if (values.length === 1 && valuesMap["$REF"]) return formatValue(valuesMap["$REF"]);
  if (values.length === 2 && valuesMap["$PBGMAP"] && valuesMap["$PBGNAME"]) return formatValue(`${valuesMap["$PBGMAP"]}/${valuesMap["$PBGNAME"]}`);
  if (values.length === 2 && Object.keys(valuesMap).includes("$PBGMAP")) return null;
  for (const { key, value } of values) {
    if (key === "$REF") result.value = formatValue(value);
    else if (valuesAsArray.some((v) => (v.startsWith("*") ? key.endsWith(v.slice(1)) : key === v))) {
      result[key] = Array.isArray(value) ? (value as EssenceItem[])?.map((i) => formatValue(i.value)) : [formatValue(value)];
    } else result[key] = formatValue(value);
  }

  return result;
}

function formatValue(value: EssenceValue) {
  if (Array.isArray(value)) return parseValues(value as EssenceItem[]);
  else if (value === "") return null;
  else if (typeof value == "string") return value.replace(/\\/g, "/");
  else return value;
}

type EssenceItem = {
  key: string;
  value: EssenceValue;
};
type EssenceValue = boolean | number | string | EssenceItem[];
type EssenceData = {
  data: EssenceItem[];
};

export type NormalizedAttrib = {
  pbgid: number;
  extensions: ({ exts: string } & Record<string, any>)[];
};

export function insertRaceToPath(race: string, path: string) {
  if (!path) return undefined;
  if (path.includes(race)) return path;
  const segments = path.split("/");
  return [...segments.slice(0, -1), "races", race, segments.at(-1)].join("/");
}
