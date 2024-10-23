import path from "path";
import { ATTRIB_FOLDER, ESSENCE_FOLDER, SOURCE_FOLDER } from "./config";
import { getXmlData, logJson } from "./xml";
import fs from "fs";
import type { RunContext } from "./run";
import { existsSync } from "fs";

// To be documented, below is a forceful way to get the by Essence formatted json to fit the shape of our own normalized format
// Some hardcoded keys and values are used to define behavior, and it is a bit slow, but it works for now

const parseAsValue = ["parent_pbg", "upgrade_bag", "weapon_bag"];

// In Essence, files are unique within the pbgmap, regardless of their directory structure.
// So easiest is to build an index of all pbgmaps we need.
const pbgmaps = {};

function initEssencePBGMap(pbgmap, folder) {
  if (!pbgmaps[pbgmap])
    pbgmaps[pbgmap] = {};
  const files = fs.readdirSync(folder);
  for (const f of files) {
    const filePath = path.join(folder, f);
    const stat = fs.statSync(filePath);
    if (stat?.isDirectory())
      initEssencePBGMap(pbgmap, filePath);
    if (stat?.isFile() && filePath.endsWith('.json')) {
      const pbgname = f.replace('.json', '');
      const fullname = path.relative(ESSENCE_FOLDER, filePath).replace(/\\/g, '/').replace('.json', '')
      pbgmaps[pbgmap][pbgname] = fullname;
    }
  }
}

export async function getEssenceData<T = NormalizedAttrib>(file: string, context: RunContext): Promise<T | undefined> {
  let fullname = await guessAppropriateEssenceFile(file);
  if (!fullname) {
    throw new Error(`EssenceData not found ${file}`);
  }

  let filePath = path.join(ESSENCE_FOLDER, fullname + '.json');

  const fileData: EssenceData = await fs.promises.readFile(filePath, "utf-8").then(JSON.parse).catch(e => {
    console.log(filePath, e);
    throw e;
  });

  let result: any = { extensions: [] };
  let dataDefault = fileData.data.filter(d => d.key == 'default')[0]?.value;
  if (!dataDefault) {
    throw new Error(`No default data ${file}`);
  }
  for (const { key, value } of (dataDefault as any as EssenceItem[]) ?? fileData.data) {
    if (parseAsValue.includes(key)) result[key] = formatValue(value);
    else if (typeof value == "object") {
      result.extensions.push(parseItemAsExt({ key, value }));
    } else {
      result[key] = value;
    }
  }

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

export async function guessAppropriateEssenceFile(file: string) {
  // name can be 'pbgmap/pbgname' or already a fullname 'pbgmap/*/pbgname'
  const split = file.split('/');
  const pbgmap = split[0];
  const pbgname = split.at(-1) as string;

  if (!pbgmaps[pbgmap]) {
    initEssencePBGMap(pbgmap, path.join(ESSENCE_FOLDER, pbgmap));
  }

  let filePath = pbgmaps[pbgmap][pbgname];

  if (!filePath) {
    throw new Error(`EssenceData not found ${file}`);
  }

  return filePath;
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
