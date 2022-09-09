import { isDeepStrictEqual } from "util";
import { ITEM_TYPES } from "../../lib/config";
import { getAllItems } from "../../lib/files/readData";
import { mergeItem } from "../../lib/files/writeData";
import { Technology } from "../../types/items";
import { technologyModifiers } from "./technologies";

(async () => {
  ((await getAllItems(ITEM_TYPES.TECHNOLOGIES)) as Technology[]).forEach(appendTechnologyModifier);
})();

async function appendTechnologyModifier(tech: Technology) {
  const modifier = technologyModifiers[tech.baseId];
  if (modifier && !isDeepStrictEqual(modifier, tech.effects)) {
    console.log(`Updating ${tech.id} effects`);
    tech.effects = modifier;
    mergeItem(tech, ITEM_TYPES.TECHNOLOGIES);
  }
}
