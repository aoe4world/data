import fs from "fs";
import path from "path";
import { ITEM_TYPES, CDN_HOST, IMAGE_FOLDER, FOLDERS } from "../../lib/config";
import { getAllItems } from "../../lib/files/readData";
import { mergeItem } from "../../lib/files/writeData";

(async () => {
  [ITEM_TYPES.UNITS, ITEM_TYPES.TECHNOLOGIES, ITEM_TYPES.BUILDINGS, ITEM_TYPES.UPGRADES].forEach((type) => syncImages(type));
})();

async function syncImages(type: ITEM_TYPES) {
  const notFound: string[] = [];
  const units = await getAllItems(type);
  units.forEach((item) => {
    let imageAttempts = [
      `${item.id}.png`,
      `${item.id.replace("upgrade-", "")}.png`,
      `${item.baseId.replace("upgrade-", "")}.png`,
      `${item.baseId.replace("-improved", "")}.png`,
      `${item.baseId}.png`,
      ...[1, 2, 3, 4].map((i) => `${item.baseId}-${i}.png`),
    ];

    while (!imageExists(imageAttempts[0] + "", type) && imageAttempts.length > 0) imageAttempts.shift();

    if (imageAttempts.length > 0) {
      const image = imageAttempts[0];
      // console.log(`Found image for ${item.id} => ${image}`);
      item.icon = `${CDN_HOST}/${IMAGE_FOLDER}/${FOLDERS[type].SLUG}/${image}`;
      mergeItem(item, type);
    } else {
      console.log(`Could not find image for ${item.id} // ${item.baseId}`);
      notFound.push(item.id);
    }
  });
  if (notFound.length > 0) {
    console.log(`Could not find images for:`);
    console.log(notFound.sort().join("\n"));
  }
}

function imageExists(image: string, type: ITEM_TYPES) {
  return fs.existsSync(path.join(FOLDERS[type].IMG, image));
}
