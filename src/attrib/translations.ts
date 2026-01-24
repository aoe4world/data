import path from "path";
import fs from "fs";
import { LOCALES_FOLDER } from "./config";
const dictionary = new Map<string, Map<number, string>>();
export const NO_TRANSLATION_FOUND = "(translation not found)";

interface TranslationFormatter {
  formatter: number;
  formatter_arguments?: any[];
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
  return interpolateString(translation, args);
}

export function getTranslationFormatter(formatter: TranslationFormatter | number, locale = "en") {
  if (typeof formatter === 'object') {
    const translationParams = formatter?.formatter_arguments?.map((x) => Object.values(x)[0] ?? x) ?? [];
    return getTranslation(formatter?.formatter, translationParams);
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
