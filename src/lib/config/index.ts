import path from "path";

export const IMAGE_FOLDER = "images";
export const ROOT_FOLDER = path.join(__dirname, "../../../");
export const IMG_PATH = path.join(ROOT_FOLDER, IMAGE_FOLDER);
export const CDN_HOST = "https://data.aoe4world.com";

export const FOLDERS = {
  UNITS: {
    SLUG: "units",
    DATA: path.join(ROOT_FOLDER, "units"),
    IMG: path.join(IMG_PATH, "units"),
  },
  TECHNOLOGIES: {
    SLUG: "technologies",
    DATA: path.join(ROOT_FOLDER, "technologies"),
    IMG: path.join(IMG_PATH, "technologies"),
  },
  BUILDINGS: {
    SLUG: "buildings",
    DATA: path.join(ROOT_FOLDER, "buildings"),
    IMG: path.join(IMG_PATH, "buildings"),
  },
  UPGRADES: {
    SLUG: "upgrades",
    DATA: path.join(ROOT_FOLDER, "upgrades"),
    IMG: path.join(IMG_PATH, "upgrades"),
  },
  CIVILIZATIONS: {
    SLUG: "civilizations",
    DATA: path.join(ROOT_FOLDER, "civilizations"),
    IMG: path.join(IMG_PATH, "civilizations"),
  },
};

export enum ITEM_TYPES {
  UNITS = "UNITS",
  TECHNOLOGIES = "TECHNOLOGIES",
  BUILDINGS = "BUILDINGS",
  UPGRADES = "UPGRADES",
}
