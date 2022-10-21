import path from "path";
import fs from "fs/promises";
import { isDeepStrictEqual } from "util";
import { FOLDERS } from "../../lib/config";
import { CIVILIZATIONS } from "../../lib/config/civs";
import { readJsonFile } from "../../lib/files/readData";
import { mergeJsonFile } from "../../lib/files/writeData";
import { technologyModifiers } from "./technologies";
import { existsSync } from "fs";

(async () => {
  for (const folder of [...Object.values(CIVILIZATIONS).map((c) => c.slug), "common"]) {
    const dir = path.join(FOLDERS.TECHNOLOGIES.DATA, folder);
    if (!existsSync(dir)) return console.info(`${dir} does not exist`);
    for (const file of await fs.readdir(dir)) {
      if (file.endsWith(".json")) {
        const tech = await readJsonFile(path.join(dir, file));
        const modifier = technologyModifiers[tech.baseId];
        if (modifier && !isDeepStrictEqual(modifier, tech.effects)) {
          console.log(`Updating ${tech.id} effects`);
          tech.effects = modifier;
          await mergeJsonFile(path.join(dir, file), tech);
        }
      }
    }
  }
})();
