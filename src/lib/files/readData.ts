import fs from "fs";
import path from "path";
import { Item, Unit } from "../../types/items";
import { CIVILIZATIONS } from "../config/civs";
import { FOLDERS, ITEM_TYPES } from "../config";

export async function getAllItems<T extends Item>(type: ITEM_TYPES) {
  const items: Promise<T>[] = [];
  for (const folder of [...Object.values(CIVILIZATIONS).map((c) => c.slug)]) {
    console.info(`Reading ${type.toLowerCase()} from ${folder} folder`);
    const dir = path.join(FOLDERS[type].DATA, folder);
    if (!fs.existsSync(dir)) return console.info(`${dir} does not exist`);
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".json")) {
        const item = await readJsonFile(path.join(dir, file));
        if (item) items.push(item as Promise<T>);
      }
    }
  }
  return Promise.all(items);
}

export async function getItem<T extends Item>(type: ITEM_TYPES, id: string) {
  try {
    const item = await readJsonFile(path.join(FOLDERS[type].DATA, "common", `${id}.json`));
    if (item) return item as T;
  } catch (e) {}
  for (const civ of Object.values(CIVILIZATIONS)) {
    try {
      const item = await readJsonFile(path.join(FOLDERS[type].DATA, civ.slug, `${id}.json`));
      if (item) return item as T;
    } catch (err) {
      // console.error(err);
    }
  }
  throw new Error(`Could not find ${type} with id ${id}`);
}

export async function readJsonFile(file: string) {
  try {
    const data = await fs.promises.readFile(file, "utf8");
    return JSON.parse(data);
  } catch (e) {
    console.error(`Could not read file ${file}`, e);
  }
}
