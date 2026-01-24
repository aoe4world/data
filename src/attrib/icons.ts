import { CDN_HOST, FOLDERS, IMG_PATH, IMAGE_FOLDER, ITEM_TYPES } from "../lib/config";
import { ICON_FOLDER } from "./config";
import fs from "fs/promises";
import path from "path";
import { constants } from "fs";
import pixelmatch from "pixelmatch";
import {PNG} from 'pngjs';
import { CivConfig } from "../types/civs";

const MAX_ICON_PIXEL_DIFF = 5;

async function imageDifferent(img1Path: string, img2Path: string): Promise<boolean> {
  const img1 = PNG.sync.read(await fs.readFile(img1Path));
  const img2 = PNG.sync.read(await fs.readFile(img2Path));
  const {width, height} = img1;
  
  if (img1.width !== img2.width || img1.height !== img2.height) {
    return true;
  }

  const pixels = pixelmatch(img1.data, img2.data, undefined, width, height);

  if (pixels > MAX_ICON_PIXEL_DIFF)
    console.log(`Diffing ${img1Path} and ${img2Path}: ${pixels} pixels`);

  return pixels > MAX_ICON_PIXEL_DIFF;
}

export async function prepareIcon(icon: string, type: ITEM_TYPES, baseId: string, id: string, civ: CivConfig) {

  if (!icon) {
    return [];
  }

  const civSpecific = false; //['villager', 'scout', 'horsearcher'].includes(baseId) && !icon.includes("/common/");
  const civId = civ.slug + "/" + id;

  const iconFile = civSpecific ? `${civId}.png` : `${id}.png`;
  const sourcePath = path.join(ICON_FOLDER, `${icon}.png`);
  const relativeIconPath = `${FOLDERS[type].SLUG}/${iconFile}`;

  return [sourcePath, relativeIconPath];
}

export async function copyIcon(sourcePath, relativeIconPath, overwrite = false) {
  // 1. First see if an icon exists in /images/{type} called {id}.png
  // 2. If it does, return the path to it
  // 3. If it doesn't, or overwrite is true, find the file in {iconFolder}, copy it to /images/{type}/{id}.png, and return the path to it
  // 4. If the file doesn't exist in {iconFolder}, return null and log an error

  if (!relativeIconPath) {
    return undefined;
  }

  const iconPath = path.join(IMG_PATH, relativeIconPath);
  const sourceExists = sourcePath && await fs.access(sourcePath).then(() => true).catch(() => false);
  const destExists = await fs.access(iconPath).then(() => true).catch(() => false);

  if (overwrite || !destExists || (!overwrite && sourceExists && destExists && await imageDifferent(sourcePath, iconPath))) {
    console.log(`[Info] Copying icon '${sourcePath}' to '${iconPath}'`);
    const dirName = path.dirname(iconPath);
    if (!await fs.access(dirName).then(() => true).catch(() => false)) {
      await fs.mkdir(dirName);
    }
    await fs.copyFile(sourcePath, iconPath);
  } else if (!destExists) {
    console.error(`Icon ${sourcePath} does not exist for ${iconPath}`);
    return undefined;
  }

  return `${CDN_HOST}/${IMAGE_FOLDER}/${relativeIconPath}`;
}

export async function useIcon(icon: string, type: ITEM_TYPES, id: string, overwrite = false) {
  // 1. First see if an icon exists in /images/{type} called {id}.png
  // 2. If it does, return the path to it
  // 3. If it doesn't, or overwrite is true, find the file in {iconFolder}, copy it to /images/{type}/{id}.png, and return the path to it
  // 4. If the file doesn't exist in {iconFolder}, return null and log an error

  if (!icon) {
    return icon;
  }

  const iconFolder = FOLDERS[type].IMG;
  const iconFile = `${id}.png`;
  const iconPath = path.join(iconFolder, iconFile);
  const relativeIconPath = path.join(IMAGE_FOLDER, FOLDERS[type].SLUG, iconFile).replace(/\\/g, '/');
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
