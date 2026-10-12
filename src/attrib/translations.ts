import path from "path";
import fs from "fs";
import { LOCALES_FOLDER } from "./config";
const dictionary = new Map<string, Map<number, string>>();
export const NO_TRANSLATION_FOUND = "(translation not found)";

/**
 * The parser always resolves strings in English: ids are slugs of English names and the workarounds match on English text.
 * The target locale (AOE4_LOCALE) is resolved alongside, and every English string produced is recorded with its
 * counterpart, so localize.ts can swap the text after the workarounds have run.
 */
export const TARGET_LOCALE = process.env.AOE4_LOCALE ?? "en";

interface TranslationFormatter {
  formatter: number;
  formatter_arguments?: any[];
}

/** English string -> target locale string, per scope (the attrib file being parsed) and across all scopes. */
const recordedByScope = new Map<string, Map<string, string>>();
const recordedGlobal = new Map<string, string | null>(); // null: the same English text has differing translations
let currentScope: string | undefined;

export function setTranslationScope(scope: string | undefined) {
  currentScope = scope;
}

export function getRecordedTranslation(english: string, scope?: string): string | undefined {
  const scoped = scope ? recordedByScope.get(scope)?.get(english) : undefined;
  return scoped ?? recordedGlobal.get(english) ?? getGameStringTranslation(english);
}

let englishIndex: Map<string, string | null> | undefined;

/** Any game string with exactly this English text, when all of them agree on the translation. Covers text workarounds set by hand that the game has after all. */
function getGameStringTranslation(english: string): string | undefined {
  if (!englishIndex) {
    englishIndex = new Map();
    const target = getLocale(TARGET_LOCALE)!;
    for (const [id, text] of getLocale("en")!) {
      const localized = target.get(id);
      if (!localized) continue;
      const en = interpolateString(text, []);
      const loc = interpolateString(localized, []);
      const existing = englishIndex.get(en);
      if (existing === undefined) englishIndex.set(en, loc);
      else if (existing !== null && existing !== loc) englishIndex.set(en, null);
    }
  }
  return englishIndex.get(english) ?? undefined;
}

function record(english: string, localized: string) {
  if (TARGET_LOCALE === "en") return;
  recordOne(english, localized);
  // Callers split some strings further: displayClasses on commas, workarounds take the first line of a description
  // and split "Trade Wing: Advisors" into its parts.
  for (const separator of ["\n", ",", ": "]) {
    const en = english.split(separator);
    const loc = localized.split(separator);
    if (en.length > 1 && en.length === loc.length) en.forEach((part, i) => recordOne(part.trim(), loc[i].trim()));
  }
}

function recordOne(english: string, localized: string) {
  if (currentScope) {
    const scoped = recordedByScope.get(currentScope) ?? recordedByScope.set(currentScope, new Map()).get(currentScope)!;
    scoped.set(english, localized);
  }
  const existing = recordedGlobal.get(english);
  if (existing === undefined) recordedGlobal.set(english, localized);
  else if (existing !== null && existing !== localized) recordedGlobal.set(english, null);
}

export function getLocale(locale: string) {
  if (!dictionary.has(locale)) {
    const file = fs.readFileSync(path.join(LOCALES_FOLDER, locale, `cardinal.${locale}.ucs`), "utf16le");
    const strings = file.split("\r\n").map((s) => s.split("\t"));
    const map = new Map<number, string>();
    for (const [id, string] of strings) map.set(+id, string);
    dictionary.set(locale, map);
  }
  return dictionary.get(locale);
}

export function getTranslationRaw(id: number, locale = "en") {
  const translation = getLocale(locale)?.get(id);
  return translation;
}

export function getTranslation(id: number, args: string[] = [], locale = "en") {
  const translation = getLocale(locale)?.get(id);
  if (!translation) return NO_TRANSLATION_FOUND + ` (${id})`;
  const result = interpolateString(translation, args);
  if (locale === "en" && TARGET_LOCALE !== "en") {
    const localized = getLocale(TARGET_LOCALE)?.get(id);
    if (localized) record(result, interpolateString(localized, args));
  }
  return result;
}

export function getTranslationFormatter(formatter: TranslationFormatter | number, locale = "en") {
  if (typeof formatter === 'object') {
    const translationParams = formatter?.formatter_arguments?.map((x) => Object.values(x)[0] ?? x) ?? [];
    return getTranslation(formatter?.formatter, translationParams, locale);
  } else {
    return getTranslation(formatter, [], locale);
  }
}

function interpolateString(str: string, values: string[]) {
  values = [...values];
  return str
    .replace(/%(\d+)(\.\d+)*%/g, (_, x, index) => values[+x[0] - 1] ?? values.shift() ?? "???")
    .replace(/%+/g, "%")
    .replace(/(\\+[nr]+)+/g, "\n")
    .trim();
}
