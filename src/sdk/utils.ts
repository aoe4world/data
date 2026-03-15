import type { CivAbbr, CivSlug, CivConfig } from "../types/civs";
import { CIVILIZATIONS, CIVILIZATION_BY_SLUG } from "../lib/config/civs";
import { Item, ItemType, Modifier, UnifiedItem } from "../types/items";

export { CivSlug, CivAbbr };
export type ItemGroup<T extends Item> = UnifiedItem<T>;

type NumberKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];
export type ItemSlug = `${"units" | "buildings" | "technologies" | "upgrades" | "abilities"}/${string}`;

export function getCivConfig(civ: undefined): undefined;
export function getCivConfig(civ: CivAbbr | CivSlug | CivConfig): CivConfig;
export function getCivConfig(civ: CivAbbr | CivSlug | CivConfig | string | undefined): CivConfig | undefined;
export function getCivConfig(civ: CivAbbr | CivSlug | CivConfig | string | undefined): CivConfig | undefined {
  if (!civ) {
    return undefined;
  } else if (typeof civ === "string") {
    return CIVILIZATIONS[civ as CivAbbr] ?? CIVILIZATION_BY_SLUG[civ as CivSlug];
  } else {
    return civ;
  }
}

export function getAbbr(civ: undefined): undefined;
export function getAbbr(civ: CivAbbr | CivSlug | CivConfig): CivAbbr;
export function getAbbr(civ: CivAbbr | CivSlug | CivConfig | string | undefined): CivAbbr | undefined;
export function getAbbr(civ: CivAbbr | CivSlug | CivConfig | string | undefined): CivAbbr | undefined {
  return getCivConfig(civ)?.abbr;
}

export function getSlug(civ: undefined): undefined;
export function getSlug(civ: CivAbbr | CivSlug | CivConfig): CivSlug;
export function getSlug(civ: CivAbbr | CivSlug | CivConfig | string | undefined): CivSlug | undefined;
export function getSlug(civ: CivAbbr | CivSlug | CivConfig | string | undefined): CivSlug | undefined {
  return getCivConfig(civ)?.slug;
}

export function getAllValuesForProperty<T extends Item, P extends keyof T>(item: ItemGroup<T>, property: P): T[P][] {
  return item.variations.reduce((acc, variation) => (variation[property] ? [...acc, variation[property]] : acc), [] as T[P][]);
}

export class ItemList<T extends Item> extends Array<ItemGroup<T>> {
  where(args: { civilization?: CivSlug | CivAbbr; age?: 1 | 2 | 3 | 4; producedAt?: string; affects?: ItemGroup<ItemType> | ItemType }) {
    return new ItemList<T>(
      ...this.reduce((list, x) => {
        const variations = x.variations.filter((v) => {
          if (args.age && v.age > args.age) return false;
          if (args.producedAt && !v.producedBy.includes(args.producedAt)) return false;
          if (args.civilization && !v.civs.includes(getAbbr(args.civilization))) return false;
          if (args.affects && "effects" in v) {
            const effects = v.effects as Modifier[];
            const maybeGroupedItem = args.affects;
            if (!maybeGroupedItem) return false;
            const affectedItem = "variations" in maybeGroupedItem ? maybeGroupedItem.variations[0] : maybeGroupedItem;

            return effects.some((e) => {
              const matcher = e.select;
              const matchesId = matcher?.id?.includes(affectedItem.id) || matcher?.id?.includes((affectedItem as Item).baseId);
              const matchesClass = matcher?.class?.some((cl) => cl?.every((c) => affectedItem.classes.includes(c)));
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

  get(id: string | number| undefined): ItemGroup<T> | undefined {
    if (typeof id === "number") return this.find((x) => x.variations.some((v) => v.pbgid === id));
    return this.find((x) => x.id === id);
  }
}
