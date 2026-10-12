import path from "path";

export const IMAGE_FOLDER = "images";
const REPO_FOLDER = path.join(__dirname, "../../../");
// English data stays where it always was; any other locale gets a folder of its own under locales/.
// Icons are the same in every locale and stay in the repo root.
const LOCALE = process.env.AOE4_LOCALE ?? "en";
export const ROOT_FOLDER = LOCALE === "en" ? REPO_FOLDER : path.join(REPO_FOLDER, "locales", LOCALE);
export const IMG_PATH = path.join(REPO_FOLDER, IMAGE_FOLDER);
export const CDN_HOST = "https://data.aoe4world.com";

export const FOLDERS = {
  UNITS: {
    TYPE: "unit",
    SLUG: "units",
    DATA: path.join(ROOT_FOLDER, "units"),
    IMG: path.join(IMG_PATH, "units"),
  },
  TECHNOLOGIES: {
    TYPE: "technology",
    SLUG: "technologies",
    DATA: path.join(ROOT_FOLDER, "technologies"),
    IMG: path.join(IMG_PATH, "technologies"),
  },
  BUILDINGS: {
    TYPE: "building",
    SLUG: "buildings",
    DATA: path.join(ROOT_FOLDER, "buildings"),
    IMG: path.join(IMG_PATH, "buildings"),
  },
  UPGRADES: {
    TYPE: "upgrade",
    SLUG: "upgrades",
    DATA: path.join(ROOT_FOLDER, "upgrades"),
    IMG: path.join(IMG_PATH, "upgrades"),
  },
  CIVILIZATIONS: {
    TYPE: "civilization",
    SLUG: "civilizations",
    DATA: path.join(ROOT_FOLDER, "civilizations"),
    IMG: path.join(IMG_PATH, "civilizations"),
  },
  ABILITIES: {
    TYPE: "ability",
    SLUG: "abilities",
    DATA: path.join(ROOT_FOLDER, "abilities"),
    IMG: path.join(IMG_PATH, "abilities"),
  },
};

export const ITEM_TYPE_MAP = Object.keys(FOLDERS).reduce((memo,key) => { memo[FOLDERS[key].TYPE] = key; return memo; }, {});

export enum ITEM_TYPES {
  UNITS = "UNITS",
  TECHNOLOGIES = "TECHNOLOGIES",
  BUILDINGS = "BUILDINGS",
  UPGRADES = "UPGRADES",
  ABILITIES = "ABILITIES",
}
