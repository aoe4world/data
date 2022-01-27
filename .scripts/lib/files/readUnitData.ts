import fs from "fs";
import path from "path";
import { StandardUnitFormat } from "../types/units";
import { CIVILIZATIONS } from "../config/civs";
import { FOLDERS } from "../config";

export async function getAllUnits() {
  const units: Promise<StandardUnitFormat>[] = [];
  [...Object.values(CIVILIZATIONS).map((c) => c.slug), "common"].forEach((folder) => {
    console.info(`Reading units from ${folder} folder`);
    const dir = path.join(FOLDERS.UNITS.DATA, folder);
    if (!fs.existsSync(dir)) return console.info(`${dir} does not exist`);
    fs.readdirSync(dir).forEach((file) => {
      if (file.endsWith(".json")) {
        const unit = readJsonFile(path.join(dir, file));
        if (unit) units.push(unit as Promise<StandardUnitFormat>);
      }
    });
  });
  return Promise.all(units);
}

export async function readJsonFile(file: string) {
  const data = await fs.promises.readFile(file, "utf8");
  return JSON.parse(data);
}
