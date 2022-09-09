import fs from "fs";
import path from "path";
import { Item, Unit } from "../../types/items";
import { CIVILIZATIONS } from "../config/civs";
import { FOLDERS, ITEM_TYPES } from "../config";

export async function getAllItems<T extends Item>(type: ITEM_TYPES) {
  const items: Promise<T>[] = [];
  [...Object.values(CIVILIZATIONS).map((c) => c.slug), "common"].forEach((folder) => {
    console.info(`Reading ${type.toLowerCase()} from ${folder} folder`);
    const dir = path.join(FOLDERS[type].DATA, folder);
    if (!fs.existsSync(dir)) return console.info(`${dir} does not exist`);
    fs.readdirSync(dir).forEach((file) => {
      if (file.endsWith(".json")) {
        const item = readJsonFile(path.join(dir, file));
        if (item) items.push(item as Promise<T>);
      }
    });
  });
  return Promise.all(items);
}

export async function readJsonFile(file: string) {
  const data = await fs.promises.readFile(file, "utf8");
  return JSON.parse(data);
}
