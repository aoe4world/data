import { Get } from ".";
import type { CivAbbr, CivSlug, CivConfig } from "../types/civs";
import { CIVILIZATION_BY_SLUG } from "../types/civs";
import { Item, ItemType, Modifier, UnifiedItem } from "../types/items";

export { CivSlug, CivAbbr };
export type ItemGroup<T extends Item> = UnifiedItem<T>;

type NumberKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];
export type ItemSlug = `${"units" | "buildings" | "technologies" | "upgrades" | "abilities"}/${string}`;

export function getAbbr(civ: CivAbbr | CivSlug | CivConfig): CivAbbr {
  if (typeof civ === "string") return civ.length == 2 ? civ : CIVILIZATION_BY_SLUG[civ];
  return civ.abbr;
}

export function getSlug(civ: CivAbbr | CivSlug | CivConfig): CivSlug {
  if (typeof civ === "string") return civ.length == 2 ? civ : CIVILIZATION_BY_SLUG[civ];
  return civ.slug;
}

export function getAllValuesForProperty<T extends Item, P extends keyof T>(item: ItemGroup<T>, property: P): T[P][] {
  return item.variations.reduce((acc, variation) => (variation[property] ? [...acc, variation[property]] : acc), [] as T[P][]);
}

export class ItemList<T extends Item> extends Array<ItemGroup<T>> {
  where(args: { civilization?: CivSlug | CivAbbr; age?: 1 | 2 | 3 | 4; producedAt?: string; affects?: ItemGroup<ItemType> | ItemSlug | ItemType }) {
    return new ItemList<T>(
      ...this.reduce((list, x) => {
        const variations = x.variations.filter((v) => {
          if (args.age && v.age > args.age) return false;
          if (args.producedAt && !v.producedBy.includes(args.producedAt)) return false;
          if (args.civilization && !v.civs.includes(getAbbr(args.civilization))) return false;
          if (args.affects && "effects" in v) {
            const effects = v.effects as Modifier[];
            const maybeGroupedItem = typeof args.affects === "string" ? Get(args.affects) : args.affects;
            if (!maybeGroupedItem) return false;
            const affectedItem = "variations" in maybeGroupedItem ? maybeGroupedItem.variations[0] : maybeGroupedItem;

            return effects.some((e) => {
              const matcher = e.select!;
              const matchesId = matcher.id?.includes(affectedItem.id) || matcher.id?.includes((affectedItem as Item).baseId);
              const matchesClass = matcher.class?.some((cl) => cl?.every((c) => affectedItem.classes.includes(c)));
              return matchesId || matchesClass;
            });
          }
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
