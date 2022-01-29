import fs, { mkdir } from "fs";
import path from "path";
import { Item, Unit } from "../types/units";
import { CIVILIZATIONS } from "../config/civs";
import { FOLDERS, ITEM_TYPES } from "../config";
import { readJsonFile } from "./readData";

export async function mergeItem(item: Item, type: ITEM_TYPES, { merge, log }: { merge: boolean; log: boolean } = { merge: true, log: true }) {
  if (item.unique) {
    item.civs.forEach((c) => {
      const dir = path.join(FOLDERS[type].DATA, CIVILIZATIONS[c].slug);
      makeDir(dir);
      (merge ? mergeJsonFile : writeJson)(path.join(dir, `${item.id}.json`), item, { log });
    });
  } else {
    const dir = path.join(FOLDERS[type].DATA, "common");
    makeDir(dir);
    (merge ? mergeJsonFile : writeJson)(path.join(dir, `${item.id}.json`), item, { log });
  }
}

async function mergeJsonFile(file: string, data: any) {
  if (fs.existsSync(file)) {
    data = merge(await readJsonFile(file), data);
  }
  writeJson(file, data, { log: false });
}

function makeDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function merge(target = {}, source = {}) {
  const isObject = (obj: any): obj is Object => obj && typeof obj === "object";
  if (!isObject(target) || !isObject(source)) return source;

  Object.entries(source).forEach(([key, sourceValue]) => {
    const targetValue = target[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      const targetValues = targetValue.map((x) => JSON.stringify(x));
      target[key] = targetValue.concat(sourceValue.filter((x) => !targetValues.includes(JSON.stringify(x))));
    } else if (isObject(targetValue) && isObject(sourceValue)) target[key] = merge(Object.assign({}, targetValue), sourceValue);
    else target[key] = sourceValue;
  });

  return target;
}

export function writeJson(file: string, data: any, { log }: { log: boolean } = { log: true }) {
  makeDir(path.dirname(file));
  return fs.writeFile(file, JSON.stringify(data, null, 2), { encoding: "utf8" }, (err) => {
    if (err) throw err;
    else if (log) console.info(`Wrote ${file}`);
  });
}
