import type { CivAbbr, CivSlug, CivConfig, CivInfo } from "../types/civs";
import { CIVILIZATIONS, CIVILIZATION_BY_SLUG } from "../lib/config/civs";
import { Item, ItemType, ItemTranslation, Modifier, UnifiedItem } from "../types/items";
import { slugify } from "../lib/utils/string";

export type { CivSlug, CivAbbr };
export type ItemGroup<T extends Item> = UnifiedItem<T>;

type NumberKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];
export type ItemSlug = `${"units" | "buildings" | "technologies" | "upgrades" | "abilities"}/${string}`;

const loadedBundles = new Map<string, {
  units?: Record<string, any>;
  buildings?: Record<string, any>;
  technologies?: Record<string, any>;
  upgrades?: Record<string, any>;
  abilities?: Record<string, any>;
  civilizations?: Record<string, any>;
  weapons?: Record<string, any>;
  items?: Record<string, any>;
}>();

export function loadLocaleBundle(locale: string, bundle?: Record<string, any>) {
  if (bundle) {
    loadedBundles.set(locale, bundle);
    return;
  }
  if (!loadedBundles.has(locale) && locale !== "en") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const data = require(`../../locales/${locale}.json`);
      loadedBundles.set(locale, data);
    } catch {
      // Not present or not bundled
    }
  }
}

export function localizeCiv(civ: CivConfig, locale: string): CivConfig;
export function localizeCiv(civ: CivConfig | undefined, locale: string): CivConfig | undefined;
export function localizeCiv(civ: CivConfig | undefined, locale: string): CivConfig | undefined {
  if (!civ || !locale || locale === "en") return civ;
  if (!loadedBundles.has(locale)) loadLocaleBundle(locale);
  const bundle = loadedBundles.get(locale);
  const t = bundle?.civilizations?.[civ.slug];
  if (t?.name) {
    return {
      ...civ,
      name: t.name,
    };
  }
  return civ;
}

export function localizeCivInfo(info: CivInfo, locale: string): CivInfo;
export function localizeCivInfo(info: CivInfo | undefined, locale: string): CivInfo | undefined;
export function localizeCivInfo(info: CivInfo | undefined, locale: string): CivInfo | undefined {
  if (!info || !locale || locale === "en") return info;
  if (!loadedBundles.has(locale)) loadLocaleBundle(locale);
  const bundle = loadedBundles.get(locale);
  const t = bundle?.civilizations?.[info.slug];
  if (!t) return info;
  return {
    ...info,
    ...(t.name ? { name: t.name } : {}),
    ...(t.classes ? { classes: t.classes } : {}),
    ...(t.description ? { description: t.description } : {}),
    ...(t.overview ? { overview: t.overview } : {}),
  };
}

export function getCivConfig(civ: undefined, locale?: string): undefined;
export function getCivConfig(civ: CivAbbr | CivSlug | CivConfig, locale?: string): CivConfig;
export function getCivConfig(civ: CivAbbr | CivSlug | CivConfig | string | undefined, locale?: string): CivConfig | undefined;
export function getCivConfig(civ: CivAbbr | CivSlug | CivConfig | string | undefined, locale?: string): CivConfig | undefined {
  let config: CivConfig | undefined;
  if (!civ) {
    return undefined;
  } else if (typeof civ === "string") {
    config =
      CIVILIZATIONS[civ as CivAbbr] ??
      CIVILIZATION_BY_SLUG[civ as CivSlug] ??
      Object.values(CIVILIZATIONS).find((c) => c.name.toLowerCase() === civ.toLowerCase() || c.slug === civ || c.abbr === civ);
  } else {
    config = civ;
  }
  return locale ? localizeCiv(config, locale) : config;
}

export function getCivName(civ: CivAbbr | CivSlug | CivConfig | string | undefined, locale?: string): string {
  return getCivConfig(civ, locale)?.name ?? "";
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

const ITEM_TYPE_TO_CATEGORY: Record<string, "units" | "buildings" | "technologies" | "upgrades" | "abilities"> = {
  unit: "units",
  building: "buildings",
  technology: "technologies",
  upgrade: "upgrades",
  ability: "abilities",
};

export function getItemTranslation(
  item: Item | UnifiedItem | { id: string; type?: string; baseId?: string } | undefined,
  locale: string
): ItemTranslation | undefined {
  if (!item || !locale || locale === "en") return undefined;

  if (!loadedBundles.has(locale)) loadLocaleBundle(locale);
  const bundle = loadedBundles.get(locale);
  if (!bundle) return (item as any).translations?.[locale];

  const categoryKey = item.type ? ITEM_TYPE_TO_CATEGORY[item.type] : undefined;
  const categoryMap = categoryKey ? bundle[categoryKey] : undefined;
  const baseId = "baseId" in item ? (item as any).baseId : undefined;

  if (categoryMap) {
    return (
      categoryMap[item.id] ??
      (baseId ? categoryMap[baseId] : undefined) ??
      (item as any).translations?.[locale]
    );
  }

  return (
    bundle.units?.[item.id] ??
    bundle.buildings?.[item.id] ??
    bundle.technologies?.[item.id] ??
    bundle.upgrades?.[item.id] ??
    bundle.abilities?.[item.id] ??
    (baseId
      ? (bundle.units?.[baseId] ??
         bundle.buildings?.[baseId] ??
         bundle.technologies?.[baseId] ??
         bundle.upgrades?.[baseId] ??
         bundle.abilities?.[baseId])
      : undefined) ??
    (item as any).translations?.[locale]
  );
}

export function getItemName(
  item: (Item | UnifiedItem | { id: string; name: string; type?: string; baseId?: string }) | undefined,
  locale?: string
): string {
  if (!item) return "";
  if (!locale || locale === "en") return item.name ?? "";
  return getItemTranslation(item, locale)?.name ?? item.name ?? "";
}

export function getItemDescription(
  item: (Item | UnifiedItem | { id: string; description: string; type?: string; baseId?: string }) | undefined,
  locale?: string
): string {
  if (!item) return "";
  if (!locale || locale === "en") return item.description ?? "";
  return getItemTranslation(item, locale)?.description ?? item.description ?? "";
}

export function getItemDisplayClasses(
  item: (Item | UnifiedItem | { id: string; displayClasses: string[]; type?: string; baseId?: string }) | undefined,
  locale?: string
): string[] {
  if (!item) return [];
  if (!locale || locale === "en") return item.displayClasses ?? [];
  return getItemTranslation(item, locale)?.displayClasses ?? item.displayClasses ?? [];
}

export function getItemInfluences(
  item: (Item | UnifiedItem | { id: string; influences?: string[]; type?: string; baseId?: string }) | undefined,
  locale?: string
): string[] {
  if (!item) return [];
  if (!locale || locale === "en") return (item as any).influences ?? [];
  return getItemTranslation(item, locale)?.influences ?? (item as any).influences ?? [];
}

export function getWeaponName(
  weapon: { id?: string; name: string } | string | undefined,
  locale?: string
): string {
  if (!weapon) return "";
  const name = typeof weapon === "string" ? weapon : weapon.name;
  const id = typeof weapon === "string" ? undefined : weapon.id;
  if (!locale || locale === "en") return name ?? "";

  if (!loadedBundles.has(locale)) loadLocaleBundle(locale);
  const bundle = loadedBundles.get(locale);
  if (!bundle?.weapons) return name ?? "";

  return (
    (id ? bundle.weapons[id]?.name : undefined) ??
    bundle.weapons[slugify(name)]?.name ??
    name ??
    ""
  );
}
