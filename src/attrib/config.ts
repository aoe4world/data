import path from "path";
import { ITEM_TYPES } from "../lib/config";
import { CivSlug } from "../sdk/utils";

export const SOURCE_FOLDER = path.join(__dirname, "../../source/");
export const ATTRIB_FOLDER = path.join(SOURCE_FOLDER, "/attrib");
export const ICON_FOLDER = path.join(SOURCE_FOLDER, "/icons");
export const LOCALES_FOLDER = path.join(SOURCE_FOLDER, "/locale");

// Unit files not discovered by sync.ts
export const hardcodedDiscovery = {
  mongols: ["sbps/races/mongol/unit_khan_2_mon", "sbps/races/mongol/unit_khan_3_mon", "sbps/races/mongol/unit_khan_4_mon"],
  ottomans: [
    "upgrade/races/ottoman/research/upgrade_anatolian_hills_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_blacksmith_stockpile_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_janissary_company_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_manned_siege_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_mehter_drums_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_military_campus_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_military_training_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_monk_formation_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_trader_capacity_ott",
  ],
};

export const ignoreForNow = [
  "ebps/races/mongol/buildings/building_town_center_dummy_start",
  "ebps/races/mongol/units/campaign/unit_great_trebuchet_cmp_mon",
  "sbps/races/english/unit_wynguard_",
  "ebps/dev/units/unit_siege_cart",
  "_double_mon", // all double produced units
  "sbps/races/mongol/unit_knight_2_mon", // is listed in khagenate palace but does not exist in feudal
];

// Map a4w slug to race id
export const racesMap: Record<CivSlug, string> = {
  abbasid: "abbasid",
  chinese: "chinese",
  delhi: "sultanate",
  english: "english",
  french: "french",
  hre: "hre",
  malians: "malian",
  mongols: "mongol",
  ottomans: "ottoman",
  rus: "rus",
};

export const attribTypes = {
  [ITEM_TYPES.BUILDINGS]: {
    location: "/ebps/races/",
    plural: "buildings",
    singular: "building",
    type: "building",
  },
  [ITEM_TYPES.UNITS]: {
    location: "/ebps/races/",
    plural: "units",
    singular: "unit",
    type: "unit",
  },
  [ITEM_TYPES.TECHNOLOGIES]: {
    location: "/upgrade/races",
    plural: "research",
    singular: "upgrade",
    type: "technology",
  },
} as Record<ITEM_TYPES, { location: string; plural: string; singular: string; type: string }>;

export function attribFile(...paths: string[]) {
  paths[paths.length - 1] = paths.at(-1)?.endsWith(".xml") ? paths.at(-1)! : `${paths.at(-1)}.xml`;
  return path.join(...[ATTRIB_FOLDER, "instances", ...paths]);
}
