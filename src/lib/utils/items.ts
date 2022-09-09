import { Item, ItemId, UnifiedItem } from "../../types/items";
import { uniqueArray } from "./array";

export function unifyItems(items: Item[]): UnifiedItem[] {
  return Object.values(
    items.reduce((acc, item) => {
      const id = item.baseId;
      if (!acc[id])
        acc[id] = {
          id: id,
          name: item.name,
          type: item.type,
          civs: item.civs,
          unique: item.civs.length == 1,
          displayClasses: item.displayClasses ?? [],
          classes: item.classes,
          minAge: item.age,
          icon: item.icon,
          description: item.description,
          variations: [item],
        };
      else {
        acc[id].variations.push(item);
        acc[id].civs = uniqueArray([...acc[id].civs, ...item.civs]);
        acc[id].classes = uniqueArray([...acc[id].classes, ...item.classes]);
        acc[id].displayClasses = uniqueArray([...acc[id].displayClasses, ...(item.displayClasses ?? [])]);
        acc[id].minAge = Math.min(acc[id].minAge, item.age);
        acc[id].unique = acc[id].unique && item.civs.length == 1;
      }

      return acc;
    }, {} as Record<ItemId, UnifiedItem>)
  );
}
