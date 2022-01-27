import fs from "fs";
import path from "path";
import { CDN_HOST, FOLDERS } from "../lib/config";
import { getAllUnits } from "../lib/files/readUnitData";
import { mergeUnit } from "../lib/files/writeUnitData";

(async () => {
  const notFound: string[] = [];
  const units = await getAllUnits();
  units.forEach((unit) => {
    let imageAttempts = [`${unit.id}.png`, `${unit.baseId}.png`, ...[1, 2, 3, 4].map((i) => `${unit.baseId}-${i}.png`)];
    while (!imageExists(imageAttempts[0] + "") && imageAttempts.length > 0) imageAttempts.shift();

    if (imageAttempts.length > 0) {
      const image = imageAttempts[0];
      console.log(`Found image for ${unit.id} => ${image}`);
      unit.icon = `${CDN_HOST}/images/units/${image}`;
      mergeUnit(unit);
    } else {
      console.log(`Could not find image for ${unit.id}`);
      notFound.push(unit.id);
    }
  });
  if (notFound.length > 0) {
    console.log(`Could not find images for:`);
    console.log(notFound);
  }
})();

function imageExists(image: string) {
  return fs.existsSync(path.join(FOLDERS.UNITS.IMG, image));
}
