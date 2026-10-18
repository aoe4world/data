import fs from "fs";
import path from "path";
import { LOCALES } from "../src/lib/config/locales";
import { getAvailableLocales } from "../src/attrib/translations";

const overridesPath = path.join(__dirname, "../src/attrib/locale-overrides.json");
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8")) as Record<string, Record<string, string | null>>;

const configuredLocales = Object.keys(LOCALES).filter((l) => l !== "en");
const discoveredLocales = getAvailableLocales();
const allLocales = Array.from(new Set([...configuredLocales, ...discoveredLocales])).sort();

const updated: Record<string, Record<string, string | null>> = {};
const missingStats: Record<string, number> = {};
for (const loc of allLocales) missingStats[loc] = 0;

const sortedKeys = Object.keys(overrides).sort((a, b) => a.localeCompare(b));

for (const key of sortedKeys) {
  const entry = overrides[key];
  const newEntry: Record<string, string | null> = {
    en: entry.en ?? null,
  };

  for (const loc of allLocales) {
    const val = entry[loc] !== undefined ? entry[loc] : null;
    newEntry[loc] = val;
    if (val === null) {
      missingStats[loc]++;
    }
  }

  updated[key] = newEntry;
}

fs.writeFileSync(overridesPath, JSON.stringify(updated, null, 2) + "\n");

console.log(`Synced ${Object.keys(updated).length} keys across ${allLocales.length} locales in locale-overrides.json\n`);
console.log("Missing (null) translations per locale:");
for (const [loc, count] of Object.entries(missingStats)) {
  const filled = Object.keys(updated).length - count;
  console.log(`  ${loc.padEnd(8)}: ${filled}/${Object.keys(updated).length} translated (${count} null)`);
}
