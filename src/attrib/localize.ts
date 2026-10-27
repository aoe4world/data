import fs from "fs";
import path from "path";
import { Item, ItemTranslation } from "../types/items";
import { CivInfo, CivTranslation } from "../types/civs";
import { getTranslation, getTranslationRaw, getTargetLocales, MIN_LOCSTRING_ID, NO_TRANSLATION_FOUND } from "./translations";
import { cleanDescription } from "../lib/utils/string";
import { LOCALES } from "../lib/config/locales";
import rawOverrides from "./locale-overrides.json";

type LocaleOverrideEntry = Record<string, string>;
const overrides = rawOverrides as Record<string, LocaleOverrideEntry>;

// Index of English text -> override key for direct string matching
const englishToOverrideKey = new Map<string, string>();
for (const [key, map] of Object.entries(overrides)) {
  if (map.en) englishToOverrideKey.set(map.en, key);
}

// Regex patterns for overrides with {0}, {1}, etc.
const parameterizedPatterns: {
  key: string;
  regex: RegExp;
  paramCount: number;
}[] = [];

for (const [key, map] of Object.entries(overrides)) {
  if (map.en && /\{(\d+)\}/.test(map.en)) {
    // Only use for reverse pattern matching if template has at least 3 fixed letters.
    // Pure composition templates like "{1} {0}" must never match arbitrary strings globally.
    const literalLetters = map.en.replace(/\{(\d+)\}/g, "").replace(/[^a-zA-Z]/g, "");
    if (literalLetters.length < 3) continue;

    const placeholders = [...map.en.matchAll(/\{(\d+)\}/g)].map((m) => +m[1]);
    const paramCount = Math.max(...placeholders) + 1;
    const tokenized = map.en.replace(/\{(\d+)\}/g, "___PARAM$1___");
    const escaped = tokenized.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
    const regexPattern = escaped.replace(/___PARAM\d+___/g, "([\\s\\S]+?)");
    parameterizedPatterns.push({
      key,
      regex: new RegExp(`^${regexPattern}$`),
      paramCount,
    });
  }
}

export function recordWeaponTranslation(id: string, locale: string, localizedName: string) {
  if (!id || !localizedName) return;
  const bundle = getOrCreateBundle(locale);
  bundle.weapons[id] = { name: localizedName };
}

export type LocalizationSource =
  | number
  | { id: number; args?: (string | number)[] }
  | { key: string; args?: (string | number)[] }
  | string;

export function resolveOverride(
  key: string,
  args: (string | number | { id: number })[] = [],
  locale: string
): string | undefined {
  const entry = overrides[key];
  if (!entry) return undefined;
  const template = entry[locale] ?? entry.en;
  if (!template) return undefined;

  const resolvedArgs = args.map((arg) => {
    if (typeof arg === "number" && arg >= MIN_LOCSTRING_ID) {
      const locStr = getTranslationRaw(arg, locale);
      if (locStr) return getTranslation(arg, [], locale);
    }
    if (typeof arg === "object" && arg && "id" in arg) {
      return getTranslation(arg.id, [], locale);
    }
    return arg;
  });

  return template.replace(/\{(\d+)\}/g, (_, idx) => String(resolvedArgs[+idx] ?? ""));
}

/**
 * Translatable Field Mutator
 * Updates both the base English field and all active locale translations synchronously.
 */
export function setLocalized(
  item: Item,
  field: "name" | "description",
  source: LocalizationSource
): void {
  const targetLocales = getTargetLocales();

  if (typeof source === "number") {
    source = { id: source, args: [] };
  }

  if (typeof source === "object" && "id" in source) {
    const enText = getTranslation(source.id, source.args ?? [], "en");
    if (enText !== NO_TRANSLATION_FOUND) item[field] = enText;

    if (targetLocales.length > 0) {
      if (!item.translations) item.translations = {};
      for (const locale of targetLocales) {
        const locText = getTranslation(source.id, source.args ?? [], locale);
        if (locText && locText !== NO_TRANSLATION_FOUND && locText !== enText) {
          if (!item.translations[locale]) item.translations[locale] = {};
          item.translations[locale][field] = locText;
        }
      }
    }
    return;
  }

  if (typeof source === "object" && "key" in source) {
    const enText = resolveOverride(source.key, source.args ?? [], "en");
    if (enText) item[field] = enText;

    if (targetLocales.length > 0) {
      if (!item.translations) item.translations = {};
      for (const locale of targetLocales) {
        const locText = resolveOverride(source.key, source.args ?? [], locale);
        if (locText && locText !== enText) {
          if (!item.translations[locale]) item.translations[locale] = {};
          item.translations[locale][field] = locText;
        }
      }
    }
    return;
  }

  if (typeof source === "string") {
    item[field] = source;
    if (targetLocales.length > 0) {
      const overrideKey = englishToOverrideKey.get(source);
      if (overrideKey) {
        if (!item.translations) item.translations = {};
        for (const locale of targetLocales) {
          const locText = overrides[overrideKey]?.[locale];
          if (locText && locText !== source) {
            if (!item.translations[locale]) item.translations[locale] = {};
            item.translations[locale][field] = locText;
          }
        }
      }
    }
  }
}

/**
 * Copies a localizable field (e.g. "description" or "name") from a source item to a target item,
 * copying both the base English text and all translations.
 */
export function copyLocalized(
  from: Item | undefined,
  to: Item,
  field: "name" | "description"
): void {
  if (!from || !from[field]) return;

  to[field] = from[field];

  if (from.translations) {
    if (!to.translations) to.translations = {};
    for (const [locale, t] of Object.entries(from.translations)) {
      if (t[field]) {
        if (!to.translations[locale]) to.translations[locale] = {};
        to.translations[locale][field] = t[field];
      }
    }
  }
}

/**
 * Appends localized text to a field (such as description) across English and all active translations.
 */
export function appendLocalized(
  item: Item,
  field: "description",
  source: LocalizationSource,
  separator = "\n\n"
): void {
  const targetLocales = getTargetLocales();
  let enAppend = "";

  if (typeof source === "number") {
    enAppend = getTranslation(source, [], "en");
  } else if (typeof source === "object" && "id" in source) {
    enAppend = getTranslation(source.id, source.args ?? [], "en");
  } else if (typeof source === "object" && "key" in source) {
    enAppend = resolveOverride(source.key, source.args ?? [], "en") ?? "";
  } else if (typeof source === "string") {
    enAppend = source;
  }

  if (enAppend && enAppend !== NO_TRANSLATION_FOUND) {
    item[field] = item[field] ? `${item[field]}${separator}${enAppend}` : enAppend;
  }

  if (targetLocales.length > 0) {
    if (!item.translations) item.translations = {};
    for (const locale of targetLocales) {
      let locAppend = "";
      if (typeof source === "number") {
        locAppend = getTranslation(source, [], locale);
      } else if (typeof source === "object" && "id" in source) {
        locAppend = getTranslation(source.id, source.args ?? [], locale);
      } else if (typeof source === "object" && "key" in source) {
        locAppend = resolveOverride(source.key, source.args ?? [], locale) ?? enAppend;
      } else if (typeof source === "string") {
        locAppend = localizeTextViaOverrides(source, locale) ?? source;
      }

      if (locAppend && locAppend !== NO_TRANSLATION_FOUND) {
        if (item.translations[locale]?.[field]) {
          item.translations[locale][field] = `${item.translations[locale][field]}${separator}${locAppend}`;
        } else if (!item[field]) {
          if (!item.translations[locale]) item.translations[locale] = {};
          item.translations[locale][field] = locAppend;
        }
      }
    }
  }
}

/**
 * Mutates a localized field across the base English value and all active translations.
 * Does not create translations for locales where the field was not originally translated.
 */
export function mutateLocalized(
  item: Item,
  field: "name" | "description",
  transform: (currentValue: string, locale: string) => string
): void {
  item[field] = transform(item[field], "en");
  if (item.translations) {
    for (const [locale, t] of Object.entries(item.translations)) {
      if (t[field]) {
        t[field] = transform(t[field], locale);
      }
    }
  }
}

/**
 * Transforms a field using a parameterized override key where {0} is the current localized value.
 * (e.g. key "khaganate_prefix" where en: "Khaganate {0}", de: "{0} (Khaganat)").
 */
export function transformLocalized(
  item: Item,
  field: "name" | "description",
  source: { key: string; args?: (string | number)[] }
): void {
  const targetLocales = getTargetLocales();
  const extraArgs = source.args ?? [];

  const enVal = resolveOverride(source.key, [item[field], ...extraArgs], "en");
  if (enVal) item[field] = enVal;

  if (targetLocales.length > 0) {
    if (!item.translations) item.translations = {};
    for (const locale of targetLocales) {
      const curLoc = item.translations[locale]?.[field] ?? item[field];
      const locVal = resolveOverride(source.key, [curLoc, ...extraArgs], locale) ?? enVal;
      if (locVal) {
        if (!item.translations[locale]) item.translations[locale] = {};
        item.translations[locale][field] = locVal;
      }
    }
  }
}

/**
 * Adds a displayClass in English and active translations.
 */
export function addDisplayClass(item: Item, source: string | { key: string }): void {
  const targetLocales = getTargetLocales();
  const key = typeof source === "object" ? source.key : englishToOverrideKey.get(source);
  const enClass = typeof source === "string" ? source : resolveOverride(source.key, [], "en") ?? source.key;

  if (!item.displayClasses) item.displayClasses = [];
  item.displayClasses.push(enClass);

  if (targetLocales.length > 0) {
    if (!item.translations) item.translations = {};
    for (const locale of targetLocales) {
      const locClass = key ? overrides[key]?.[locale] : localizeTextViaOverrides(enClass, locale);
      if (locClass) {
        if (!item.translations[locale]) item.translations[locale] = {};
        if (!item.translations[locale].displayClasses) {
          item.translations[locale].displayClasses = [];
        }
        item.translations[locale].displayClasses!.push(locClass);
      }
    }
  }
}

export function localizeTextViaOverrides(text: string, locale: string): string | undefined {
  if (!text || locale === "en") return undefined;

  // 1. Exact match on English text
  const overrideKey = englishToOverrideKey.get(text);
  if (overrideKey && overrides[overrideKey]?.[locale]) {
    return overrides[overrideKey][locale];
  }

  // 2. Parameterized pattern match
  for (const { key, regex } of parameterizedPatterns) {
    const match = text.match(regex);
    if (match) {
      const parts = match.slice(1);
      const translated = resolveOverride(key, parts, locale);
      if (translated) return translated;
    }
  }

  // 3. Multi-paragraph match
  const paragraphs = text.split("\n\n");
  if (paragraphs.length > 1) {
    const translatedParagraphs = paragraphs.map((p) => localizeTextViaOverrides(p, locale) ?? p);
    if (translatedParagraphs.some((p, i) => p !== paragraphs[i])) {
      return translatedParagraphs.join("\n\n");
    }
  }

  return undefined;
}

/**
 * Applies semantic overrides to an item after workarounds have run.
 * Checks if workarounds set names or descriptions that match override entries.
 */
export function applyOverrides(item: Item): void {
  const targetLocales = getTargetLocales();
  if (targetLocales.length === 0) return;

  for (const locale of targetLocales) {
    if (!item.translations?.[locale]?.name) {
      const locName = localizeTextViaOverrides(item.name, locale);
      if (locName) {
        if (!item.translations) item.translations = {};
        if (!item.translations[locale]) item.translations[locale] = {};
        item.translations[locale].name = locName;
      }
    }

    if (!item.translations?.[locale]?.description) {
      const locDesc = localizeTextViaOverrides(item.description, locale);
      if (locDesc) {
        if (!item.translations) item.translations = {};
        if (!item.translations[locale]) item.translations[locale] = {};
        item.translations[locale].description = locDesc;
      }
    }

    if (item.displayClasses?.length) {
      // Keep the game translation the parser already recorded for a class without an override:
      // the list is rebuilt as a whole once any class has one (e.g. "Khaganate Unit" added by a workaround).
      const existing = item.translations?.[locale]?.displayClasses;
      const translatedClasses = item.displayClasses.map((dc, i) => localizeTextViaOverrides(dc, locale) ?? existing?.[i] ?? dc);
      if (translatedClasses.some((tc, i) => tc !== item.displayClasses[i])) {
        if (!item.translations) item.translations = {};
        if (!item.translations[locale]) item.translations[locale] = {};
        item.translations[locale].displayClasses = translatedClasses;
      }
    }
  }
}

export type LocaleBundle = {
  code: string;
  name: string;
  label: string;
  units: Record<string, ItemTranslation>;
  buildings: Record<string, ItemTranslation>;
  technologies: Record<string, ItemTranslation>;
  upgrades: Record<string, ItemTranslation>;
  abilities: Record<string, ItemTranslation>;
  civilizations: Record<string, CivTranslation>;
  weapons: Record<string, { name: string }>;
  crucible: {
    perks: Record<string, ItemTranslation>;
    boons: Record<string, { name?: string; tiers?: Record<string, string> }>;
    mutators: Record<string, ItemTranslation>;
    talents: Record<string, Record<string, string>>;
  };
};

const localeBundles = new Map<string, LocaleBundle>();

function getOrCreateBundle(locale: string): LocaleBundle {
  let bundle = localeBundles.get(locale);
  if (!bundle) {
    const config = LOCALES[locale];
    bundle = {
      code: locale,
      name: config?.name ?? locale,
      label: config?.label ?? locale,
      units: {},
      buildings: {},
      technologies: {},
      upgrades: {},
      abilities: {},
      civilizations: {},
      weapons: {},
      crucible: {
        perks: {},
        boons: {},
        mutators: {},
        talents: {},
      },
    };
    localeBundles.set(locale, bundle);
  }
  return bundle;
}

export const ITEM_TYPE_TO_CATEGORY: Record<string, "units" | "buildings" | "technologies" | "upgrades" | "abilities"> = {
  unit: "units",
  building: "buildings",
  technology: "technologies",
  upgrade: "upgrades",
  ability: "abilities",
};

export function getItemCategory(type?: string): "units" | "buildings" | "technologies" | "upgrades" | "abilities" | undefined {
  return type ? ITEM_TYPE_TO_CATEGORY[type] : undefined;
}

export function recordItemBundle(item: Item): void {
  if (!item.translations) return;
  const categoryKey = getItemCategory(item.type);

  if (!categoryKey) return;

  for (const [locale, translation] of Object.entries(item.translations)) {
    const bundle = getOrCreateBundle(locale);
    const cleanTranslation = {
      ...translation,
      ...(translation.description ? { description: cleanDescription(translation.description) } : {}),
    };
    bundle[categoryKey][item.id] = { ...(bundle[categoryKey][item.id] ?? {}), ...cleanTranslation };
    if (item.baseId && item.baseId !== item.id && !bundle[categoryKey][item.baseId]) {
      bundle[categoryKey][item.baseId] = { ...cleanTranslation };
    }
  }
}

export function recordCivBundle(civOverview: any, slug: string): void {
  if (!civOverview?.translations) return;
  for (const [locale, translation] of Object.entries(civOverview.translations as Record<string, CivTranslation>)) {
    const bundle = getOrCreateBundle(locale);
    bundle.civilizations[slug] = { ...(bundle.civilizations[slug] ?? {}), ...translation };
  }
}

export function recordCruciblePerk(baseId: string, locale: string, translation: ItemTranslation): void {
  if (!baseId || !locale) return;
  const bundle = getOrCreateBundle(locale);
  const cleanTranslation = {
    ...translation,
    ...(translation.description ? { description: cleanDescription(translation.description) } : {}),
  };
  bundle.crucible.perks[baseId] = { ...(bundle.crucible.perks[baseId] ?? {}), ...cleanTranslation };
}

export function recordCrucibleBoon(
  baseId: string,
  locale: string,
  name?: string,
  tierKey?: string,
  tierDesc?: string
): void {
  if (!baseId || !locale) return;
  const bundle = getOrCreateBundle(locale);
  if (!bundle.crucible.boons[baseId]) {
    bundle.crucible.boons[baseId] = {};
  }
  if (name) bundle.crucible.boons[baseId].name = name;
  if (tierKey && tierDesc) {
    if (!bundle.crucible.boons[baseId].tiers) {
      bundle.crucible.boons[baseId].tiers = {};
    }
    bundle.crucible.boons[baseId].tiers![tierKey] = cleanDescription(tierDesc) ?? "";
  }
}

export function recordCrucibleMutator(baseId: string, locale: string, translation: ItemTranslation): void {
  if (!baseId || !locale) return;
  const bundle = getOrCreateBundle(locale);
  const cleanTranslation = {
    ...translation,
    ...(translation.description ? { description: cleanDescription(translation.description) } : {}),
  };
  bundle.crucible.mutators[baseId] = { ...(bundle.crucible.mutators[baseId] ?? {}), ...cleanTranslation };
}

export function recordCrucibleTalent(civSlug: string, level: number, locale: string, name: string): void {
  if (!civSlug || !level || !locale || !name) return;
  const bundle = getOrCreateBundle(locale);
  if (!bundle.crucible.talents[civSlug]) {
    bundle.crucible.talents[civSlug] = {};
  }
  bundle.crucible.talents[civSlug][String(level)] = name;
}

export function getLocaleBundles(): Map<string, LocaleBundle> {
  for (const bundle of localeBundles.values()) {
    bundle.weapons = Object.fromEntries(
      Object.entries(bundle.weapons).sort(([a], [b]) => a.localeCompare(b))
    );
  }
  return localeBundles;
}
