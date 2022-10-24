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
          unique: item.unique,
          displayClasses: item.displayClasses ?? [],
          classes: item.classes,
          minAge: item.age,
          icon: item.icon,
          description: item.description,
          variations: [item],
        };
      else {
        if (item.name.length < acc[id].name.length) acc[id].name = item.name;
        acc[id].variations.push(item);
        acc[id].civs = uniqueArray([...acc[id].civs, ...item.civs]).sort();
        acc[id].classes = uniqueArray([...acc[id].classes, ...item.classes]);
        acc[id].displayClasses = uniqueArray([...acc[id].displayClasses, ...(item.displayClasses ?? [])]);
        acc[id].minAge = Math.min(acc[id].minAge, item.age);
        acc[id].unique = acc[id].unique;
      }

      return acc;
    }, {} as Record<ItemId, UnifiedItem>)
  );
}

export type Optimized<T extends Item> = UnifiedItem<T> & {
  shared: Record<string, Partial<T>>;
  variations: Partial<T>[];
};

export function optimizeItems<T extends Item>(items: UnifiedItem<T>[]): Optimized<T>[] {
  // const unified = unifyItems(items);

  return items.map((item) => {
    if (item.variations.length <= 1) return { ...item, shared: {} as Optimized<T> };
    let ageBase = [] as Partial<T>[];
    let optimizedVariations: Partial<T>[] = []; // = item.variations.map((variation) => ({ ...variation } as Partial<T>))
    for (const age of [1, 2, 3, 4]) {
      const ageId = `${item.id}-${age}`;
      let ageVariations: Partial<T>[] = item.variations.filter((v) => v.id == ageId) ?? [];
      if (ageVariations.length == 0) continue;
      const { common, variations } = optimizeItemValues(ageVariations);
      common.id = ageId;
      ageBase.push(common);
      optimizedVariations.push(...variations);
    }

    const { common, variations } = optimizeItemValues(ageBase, ageBase.length > 1 ? ["weapons", "armor", "name"] : []);
    const shared = {};

    for (const variation of variations) if (Object.entries(variation).filter(([k, v]) => !!v && k != "id").length > 1) shared[variation.id as string] = variation;

    return {
      ...item,
      ...common,
      shared,
      variations: optimizedVariations,
    } as any;
  }) as Optimized<T>[];
}

function optimizeItemValues<T extends Item>(items: Partial<T>[], ignoreKeys: string[] = []): { common: Partial<T>; variations: Partial<T>[] } {
  let common: Partial<T> = {};
  let variations: Partial<T>[] = items.map((v) => ({ ...v } as Partial<T>));
  for (const key of Object.keys(items[0])) {
    if (["pbgid", "id", "attribName", "civs", ...ignoreKeys].includes(key)) continue;
    // for each key, compare all variation values, and take the one that is most common as base value
    // for all variations, remove the value from the optimized variation if it is the same as the base value
    // if the value is an object, compare using JSON stringify
    // in all other cases compare with a simple ===

    const usage = new Map<string, number>();
    const comparableValues = variations.map((variation) => [JSON.stringify(variation[key]), variation[key]]);
    for (const [key] of comparableValues) usage.set(key, (usage.get(key) ?? 0) + 1);

    const [mostCommonKey] = [...usage.entries()].sort((a, b) => b[1] - a[1])[0];
    const mostCommonValue = comparableValues.find(([key]) => key === mostCommonKey)![1];

    comparableValues.forEach(([ckey], i) => {
      if (ckey === mostCommonKey) variations[i][key] = undefined;
    });

    common[key] = mostCommonValue;
  }

  return {
    common,
    variations,
  };
}

export function optimizedToUnified<T extends Item>(items: Optimized<T>[]): UnifiedItem<T>[] {
  return items.map((item) => {
    const variations = item.variations.map((variation) => Object.assign({}, item, item.shared[variation.id as string], variation, { shared: undefined, variations: undefined }));
    return {
      ...item,
      variations,
    };
  });
}
