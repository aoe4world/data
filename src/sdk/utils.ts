import { civAbbr, civConfig, CIVILIZATION_BY_SLUG } from "../types/civs";
import { Item, UnifiedItem } from "../types/items";

export type CivSlug = keyof typeof CIVILIZATION_BY_SLUG;
export type CivAbbr = civAbbr;
export type ItemGroup<T extends Item> = UnifiedItem<T>;

type NumberKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];

export function getAbbr(civ: CivAbbr | CivSlug | civConfig): CivAbbr {
  if (typeof civ === "string") return civ.length == 2 ? civ : CIVILIZATION_BY_SLUG[civ];
  return civ.abbr;
}

export function getAllValuesForProperty<T extends Item, P extends keyof T>(item: ItemGroup<T>, property: P): T[P][] {
  return item.variations.reduce((acc, variation) => (variation[property] ? [...acc, variation[property]] : acc), [] as T[P][]);
}

export class ItemList<T extends Item> extends Array<ItemGroup<T>> {
  where(args: { civilization?: CivSlug | CivAbbr; age?: 1 | 2 | 3 | 4; producedAt?: string }) {
    return new ItemList<T>(
      ...this.reduce((list, x) => {
        const variations = x.variations.filter((v) => {
          if (args.age && v.age > args.age) return false;
          if (args.producedAt && !v.producedBy.includes(args.producedAt)) return false;
          if (args.civilization && !v.civs.includes(getAbbr(args.civilization))) return false;
          return true;
        });
        if (variations.length > 0) list.push({ ...x, variations });
        return list;
      }, [] as ItemGroup<T>[])
    );
  }

  order(...keys: NumberKeys<T>[]) {
    const sorted = new ItemList<T>(...this).sort((a, b) => b.civs.length - a.civs.length);
    for (const key of keys) {
      sorted.sort((a, b) => Math.min(...(getAllValuesForProperty(a, key) as unknown[] as number[])) - Math.min(...(getAllValuesForProperty(b, key) as unknown[] as number[])));
    }
    return sorted;
  }

  get(id: string | number) {
    if (typeof id === "number") return this.find((x) => x.variations.some((v) => v.pbgid === id));
    return this.find((x) => x.id === id);
  }
}
