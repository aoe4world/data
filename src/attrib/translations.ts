import path from "path";
import fs from "fs";
import { LOCALES_FOLDER } from "./config";
const dictionary = new Map<string, Map<number, string>>();
export const NO_TRANSLATION_FOUND = "(translation not found)";

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

export function getTranslation(id: number, args: string[] = [], locale = "en") {
  const translation = getLocale(locale)?.get(id);
  if (!translation) return NO_TRANSLATION_FOUND;
  return interpolateString(translation, args);
}

function interpolateString(str: string, values: string[]) {
  values = [...values];
  return str
    .replace(/%(\d+)%/g, (_, x, index) => values.shift() ?? "???")
    .replace(/%%/g, "%")
    .replace(/(\\+[nr]+)+/g, "\n")
    .trim();
}
