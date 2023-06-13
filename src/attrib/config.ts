import path from "path";
import { ITEM_TYPES } from "../lib/config";
import { CivSlug } from "../sdk/utils";

export const SOURCE_FOLDER = path.join(__dirname, "../../source/");
export const ATTRIB_FOLDER = path.join(SOURCE_FOLDER, "/attrib");
export const ICON_FOLDER = path.join(SOURCE_FOLDER, "/icons");
export const LOCALES_FOLDER = path.join(SOURCE_FOLDER, "/locale");
export const ESSENCE_FOLDER = path.join(SOURCE_FOLDER, "/essence/attrib");

// Unit files not discovered by sync.ts
export const hardcodedDiscovery = {
  rus: ["sbps/races/rus/unit_militia_2_rus", "upgrade/races/rus/units/upgrade_militia_3", "upgrade/races/rus/units/upgrade_militia_4"],
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
  english: [
    "upgrade/races/english/units/upgrade_abbey_king_castle_1",
    "upgrade/races/english/units/upgrade_abbey_king_imp_2",
    "/sbps/races/english/unit_ranger_wynguard_4_eng",
    "/sbps/races/english/unit_footman_wynguard_4_eng",
  ],
};

export const ignoreForNow: (string | ((file: string) => boolean))[] = [
  "ebps/races/mongol/buildings/building_town_center_dummy_start",
  "ebps/races/mongol/units/campaign/unit_great_trebuchet_cmp_mon",

  // age I/unconstructable versions of walls and infantry buildable walls
  "palisade_bastion",
  "_wall_bastion",
  "_wall_infantry",
  "_wall_gate_infantry",
  "_wing_imperial",
  "_wing_castle",
  "_wing_feudal",

  // Field constructed versions of siege, prefer the Siege Workshop version
  "unit_mangonel_3_buildable_abb",
  "unit_mangonel_3_field_construct_mon",
  "unit_springald_3_buildable_abb",
  "unit_springald_3_field_construct_mon",
  "unit_siege_tower_3_abb",
  "ebps/dev/units/unit_siege_cart",
  "ebps/dev/units/unit_siege_cart",

  "unit_naval_scout_2_ott", // not actually available in game
  "_moving_mon", // packed version
  "_double_mon", // all double produced units
  "building_unit_religious_district_mon", // Monasteric shrines version of prayer tent
  "sbps/races/mongol/unit_knight_2_mon", // is listed in khagenate palace but does not exist in feudal

  // Research variations available at landmarks, that do not differ
  "upgrade_landmark_cavalry_cantled_saddle_fre",
  "upgrade_landmark_ranged_crossbow_drills_fre",
  (file) => file.split("/").pop()!.startsWith("upgrade_unit") && file.endsWith("farimba_mal"),

  // Prefer the vanilla keep emplacement versions over landmark and outposts, except mongols
  "upgrade_barbican_cannon_chi",
  "upgrade_barbican_springald_chi",
  "upgrade_wooden_castle_springald_rus",
  "upgrade_outpost_landmark_",
  (file) => file.includes("upgrade_outpost_cannon") && !file.includes("upgrade_outpost_cannon_mon"),
  (file) => file.includes("upgrade_outpost_springald") && !file.includes("upgrade_outpost_springald_mon"),
  (file) => file.includes("unit_ram_3") && !file.includes("workshop") && !file.includes("clocktower"),
  "unit_trade_cart_chamber_of_commerce_fre",
  "unit_trade_cart_free_abb",
  "unit_trade_cart_free_2_abb",
  "unit_trade_cart_free_3_abb",
  "unit_trade_cart_free_4_abb",
  "unit_military_2_free_abb",
  "unit_military_3_free_abb",
  "unit_military_4_free_abb",
  "upgrade_landmark_siege_weapon_speed",
  "upgrade_landmark_siege_works",
  "unit_siege_tower_3_eng",
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

// Could be looked up from ebps/races/mongol/buildings/building_wonder_age3_khanbaliq_mon.xml
export const KHAGANTE_SPAWN_COUNTS = {
  "huihui-pao": 1,
  "nest-of-bees": 1,
  "warrior-monk": 2,
  knight: 3,
  "horse-archer": 5,
  magudai: 5,
  "palace-guard": 5,
};

export function attribFile(...paths: string[]) {
  paths[paths.length - 1] = paths.at(-1)?.endsWith(".xml") ? paths.at(-1)! : `${paths.at(-1)}.xml`;
  return path.join(...paths);
}
