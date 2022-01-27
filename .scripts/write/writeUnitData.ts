import fs from "fs";
import path from "path";

import { StandardUnitFormat } from "../types/units";
import { CIVILIZATIONS } from "../config/civs";

const unitsFolder = "../../units";

export async function mergeUnit(unit: StandardUnitFormat) {
  if (unit.unique) {
    unit.civs.forEach((c) => {
      const dir = path.join(__dirname, unitsFolder, CIVILIZATIONS[c].slug);
      makeDir(dir);
      mergeJsonFile(path.join(dir, `${unit.id}.json`), unit);
    });
  } else {
    const dir = path.join(__dirname, unitsFolder);
    makeDir(dir);
    mergeJsonFile(path.join(dir, `${unit.id}.json`), unit);
  }
}

async function mergeJsonFile(file: string, data: any) {
  if (fs.existsSync(file)) {
    data = merge(await readJsonFile(file), data);
  }
  fs.writeFile(file, JSON.stringify(data, null, 2), { encoding: "utf8" }, (err) => {
    if (err) throw err;
  });
}

async function readJsonFile(file: string) {
  const data = await fs.promises.readFile(file, "utf8");
  return JSON.parse(data);
}

function makeDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function merge(target = {}, source = {}) {
  const isObject = (obj: any): obj is Object => obj && typeof obj === "object";
  if (!isObject(target) || !isObject(source)) return source;

  Object.entries(source).forEach(([key, sourceValue]) => {
    const targetValue = target[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) target[key] = targetValue.concat(sourceValue.filter((item) => !targetValue.includes(item)));
    else if (isObject(targetValue) && isObject(sourceValue)) target[key] = merge(Object.assign({}, targetValue), sourceValue);
    else target[key] = sourceValue;
  });

  return target;
}
