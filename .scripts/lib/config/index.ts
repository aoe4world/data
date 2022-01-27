import path from "path";

export const ROOT_FOLDER = path.join(__dirname, "../../../");
export const IMG_FOLDER = path.join(ROOT_FOLDER, "/images");
export const CDN_HOST = "https://data.aoe4world.com";
export const FOLDERS = {
  UNITS: {
    DATA: path.join(ROOT_FOLDER, "units"),
    IMG: path.join(IMG_FOLDER, "units"),
  },
};
