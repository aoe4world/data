import { Item, ItemId, UnifiedItem } from "../types/units";
import { uniqueArray } from "./array";

export function unifyItems(items: Item[]): UnifiedItem[] {
  return Object.values(
    items.reduce((acc, item) => {
      const id = item.baseId;
      if (!acc[id])
        acc[id] = {
          id: id,
          name: item.name,
          civs: item.civs,
          classes: item.classes,
          icon: item.icon,
          description: item.description,
          variations: [item],
        };
      else {
        acc[id].variations.push(item);
        acc[id].civs = uniqueArray([...acc[id].civs, ...item.civs]);
        acc[id].classes = uniqueArray([...acc[id].classes, ...item.classes]);
      }

      return acc;
    }, {} as Record<ItemId, UnifiedItem>)
  );
}
