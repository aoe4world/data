import fs from "fs";
import path from "path";
import { Item } from "../types/items";
import { getRecordedTranslation, TARGET_LOCALE } from "./translations";

/**
 * Text that the game files do not provide, written by hand in workarounds.ts, keyed by the English text.
 * One file per locale in ./locale-overrides; a missing entry stays English and is reported.
 *
 * A key may hold placeholders for text that workarounds build up from parts:
 *   {n} a number, copied as is
 *   {t} any text, itself localized
 * The value refers to them in order as {1}, {2}, ...
 */
const overrides: Record<string, string> = (() => {
  const file = path.join(__dirname, "locale-overrides", `${TARGET_LOCALE}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
})();

const escapeRegExp = (s: string) => s.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
const patterns = Object.entries(overrides)
  .filter(([key]) => /\{[nt]\}/.test(key))
  .map(([key, value]) => {
    const kinds = [...key.matchAll(/\{([nt])\}/g)].map((m) => m[1]);
    const source = key
      .split(/\{[nt]\}/)
      .map(escapeRegExp)
      .reduce((re, part, i) => re + (i ? (kinds[i - 1] === "n" ? "([\\d.,]+)" : "([\\s\\S]+?)") : "") + part, "");
    return { regex: new RegExp(`^${source}$`), kinds, value };
  });

const untranslated = new Map<string, Set<string>>();

export function localizeString(english: string, scope?: string, where = "?"): string {
  if (TARGET_LOCALE === "en" || !english) return english;
  const translated = translate(english, scope);
  if (translated !== undefined) return translated;
  (untranslated.get(english) ?? untranslated.set(english, new Set()).get(english)!).add(where);
  return english;
}

function translate(english: string, scope: string | undefined, depth = 0): string | undefined {
  if (depth > 4) return undefined;
  // Numbers, ages and other text without letters need no translation.
  if (!/\p{L}/u.test(english)) return english;
  const exact = (overrides[english] ?? getRecordedTranslation(english, scope))?.toString();
  if (exact !== undefined) return exact;

  for (const { regex, kinds, value } of patterns) {
    const match = english.match(regex);
    if (!match) continue;
    const parts = match.slice(1).map((part, i) => (kinds[i] === "n" ? part : translate(part, scope, depth + 1)));
    if (parts.every((p) => p !== undefined)) return value.replace(/\{(\d+)\}/g, (_, i) => parts[+i - 1]!);
  }

  // Workarounds append paragraphs to game text: translate each on its own.
  const paragraphs = english.split("\n\n");
  if (paragraphs.length > 1) {
    const translated = paragraphs.map((p) => translate(p, scope, depth + 1));
    if (translated.every((t) => t !== undefined)) return translated.join("\n\n");
  }
  return undefined;
}

export function localizeItem(item: Item, scope?: string) {
  if (TARGET_LOCALE === "en") return;
  const where = item.id;
  item.name = localizeString(item.name, scope, where);
  item.description = localizeString(item.description, scope, where);
  item.displayClasses = item.displayClasses?.map((x) => localizeString(x, scope, where));
  const any = item as any;
  if (Array.isArray(any.influences)) any.influences = any.influences.map((x: string) => localizeString(x, scope, where));
  if (Array.isArray(any.weapons)) for (const w of any.weapons) if (w?.name) w.name = localizeString(w.name, scope, where);
}

export function reportUntranslated() {
  if (TARGET_LOCALE === "en") return;
  const out = [...untranslated].map(([text, items]) => ({ text, items: [...items].sort() })).sort((a, b) => a.text.localeCompare(b.text));
  const file = path.join(__dirname, ".temp", `untranslated.${TARGET_LOCALE}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`${out.length} strings left in English for ${TARGET_LOCALE}, see ${path.relative(process.cwd(), file)}`);
}
