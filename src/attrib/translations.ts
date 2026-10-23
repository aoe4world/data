import path from "path";
import fs from "fs";
import { LOCALES_FOLDER } from "./config";

const dictionary = new Map<string, Map<number, string>>();
export const NO_TRANSLATION_FOUND = "(translation not found)";
export const MIN_LOCSTRING_ID = 1_000_000;

let targetLocales: string[] = [];

export function setTargetLocales(locales: string[]) {
  targetLocales = locales.filter((l) => l && l !== "en");
}

export function getTargetLocales(): string[] {
  return targetLocales;
}

export function getAvailableLocales(): string[] {
  if (!fs.existsSync(LOCALES_FOLDER)) return [];
  try {
    return fs
      .readdirSync(LOCALES_FOLDER, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== "en")
      .map((e) => e.name)
      .filter((locale) => fs.existsSync(path.join(LOCALES_FOLDER, locale, `cardinal.${locale}.ucs`)));
  } catch {
    return [];
  }
}

interface TranslationFormatter {
  formatter: number;
  formatter_arguments?: any[];
}

export function resolveTranslationParam(x: any, locale = "en"): any {
  if (typeof x === "number") {
    if (x >= MIN_LOCSTRING_ID) {
      const locStr = getTranslationRaw(x, locale);
      if (locStr) return getTranslation(x, [], locale);
    }
    return x;
  }
  if (x && typeof x === "object") {
    if ("locstring_value" in x) return getTranslation(x.locstring_value, [], locale);
    if (x.key === "locstring_value") return getTranslation(x.value, [], locale);
    const val = Object.values(x)[0];
    if (typeof val === "number" && val >= MIN_LOCSTRING_ID) {
      const locStr = getTranslationRaw(val, locale);
      if (locStr) return getTranslation(val, [], locale);
    }
    return val ?? x;
  }
  return x;
}

export function getLocale(locale: string) {
  if (!dictionary.has(locale)) {
    const filePath = path.join(LOCALES_FOLDER, locale, `cardinal.${locale}.ucs`);
    if (!fs.existsSync(filePath)) return undefined;
    const file = fs.readFileSync(filePath, "utf16le");
    const strings = file.split("\r\n").map((s) => s.split("\t"));
    const map = new Map<number, string>();
    for (const [id, string] of strings) if (id && string !== undefined) map.set(+id, string);
    dictionary.set(locale, map);
  }
  return dictionary.get(locale);
}

export function getTranslationRaw(id: number, locale = "en") {
  return getLocale(locale)?.get(id);
}

export function getTranslation(id: number, args: any[] = [], locale = "en") {
  const translation = getLocale(locale)?.get(id);
  if (!translation) return NO_TRANSLATION_FOUND + ` (${id})`;
  return interpolateString(translation, args);
}

export function getTranslationFormatter(formatter: TranslationFormatter | number, locale = "en") {
  if (typeof formatter === "object") {
    const translationParams = formatter?.formatter_arguments?.map((x) => resolveTranslationParam(x, locale)) ?? [];
    return getTranslation(formatter?.formatter, translationParams, locale);
  } else {
    return getTranslation(formatter, [], locale);
  }
}

export function interpolateString(str: string, values: any[]) {
  values = [...values];
  return str
    // de writes some placeholders with a space before the closing %: "%1 %%%".
    .replace(/%(\d+)(\.\d+)* ?%/g, (_, x) => values[+x[0] - 1] ?? values.shift() ?? "???")
    .replace(/%+/g, "%")
    .replace(/(\\+[nr]+)+/g, "\n")
    .trim();
}
