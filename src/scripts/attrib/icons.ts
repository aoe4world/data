import { CDN_HOST, FOLDERS, IMAGE_FOLDER, ITEM_TYPES } from "../../lib/config";
import { ICON_FOLDER } from "./config";
import fs from "fs/promises";
import path from "path";
import { constants } from "fs";

export async function useIcon(icon: string, type: ITEM_TYPES, id: string, overwrite = false) {
  // 1. First see if an icon exists in /images/{type} called {id}.png
  // 2. If it does, return the path to it
  // 3. If it doesn't, or overwrite is true, find the file in {iconFolder}, copy it to /images/{type}/{id}.png, and return the path to it
  // 4. If the file doesn't exist in {iconFolder}, return null and log an error

  const iconFolder = FOLDERS[type].IMG;
  const iconFile = `${id}.png`;
  const iconPath = path.join(iconFolder, iconFile);
  const relativeIconPath = path.join(IMAGE_FOLDER, FOLDERS[type].SLUG, iconFile);
  const sourcePath = path.join(ICON_FOLDER, `${icon}.png`);

  if (overwrite || !(await fs.stat(iconPath).catch(() => null))) {
    const iconPath = path.join(iconFolder, iconFile);
    const sourceExists = await fs
      .access(sourcePath)
      .then(() => true)
      .catch(() => false);
    if (sourceExists) {
      await fs.copyFile(sourcePath, iconPath, constants.COPYFILE_EXCL);
    } else {
      console.error(`Icon ${icon} does not exist in ${ICON_FOLDER}`);
      return undefined;
    }
  }

  return `${CDN_HOST}/${relativeIconPath}`;
}
