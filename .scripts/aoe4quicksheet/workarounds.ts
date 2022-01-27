import { transformRomanAgeToNumber } from "../lib/utils/game";
import { MappedSheetUnit } from "./types";

export function transformSheetUnitWithWorkaround(u: MappedSheetUnit) {
  if (typeof u.displayName == "string") {
    // 1. Fix duplicate villager entries.
    if (u.displayName == "Villager") {
      // Assigning English as unique because ranged attack
      if (u.en) u.strongId = `villager-${transformRomanAgeToNumber(u.age as string)}-english`;
      // Assingning French as unique across all ages because better economy,
      else if (u.fr) u.strongId = `villager-${transformRomanAgeToNumber(u.age as string)}-french`;
      // Renaming // assiging HRE age 4 build in Swabia as unique because faster production
      else if (u.hr && u.age == "IV") u.strongId = `villager-4-palace-of-swabia`;
      // Leaving regular age 1 villagers all remaining civs.  if (u.displayName == "Villager") {
    }

    // 2. Fix Abbassid traders showing first, give special name like villagers
    else if (u.displayName == "Trader" && u.ab) u.strongId = `trader-${transformRomanAgeToNumber(u.age as string)}-abbasid`;
    // 3. Rename all units produced at Ovoo
    else if (u.mo && u.displayName.includes("(x2)")) u.displayName = u.displayName.replace("(Early)", "").replace("(x2)", "(Ovoo)");
    // 4. Remove chinese Dynasties from Spirit Way units
    else if (u.ch && u.displayName.includes("(Spirit Way)")) u.displayName = u.displayName.replace("(Song)", "").replace("(Yuan)", "").replace("(Ming)", "");
  }
  return u;
}

export function filterOutUnsupportedRows(u: MappedSheetUnit) {
  return u.genre == "Land Unit";
}

export const ignoredIds = [
  "villager-2-english",
  "scout-2-1", // Duplicate ovoo scout entries that can also be created at stable
  "scout-3-1",
  "scout-4-1",
  "khaganate-units-4",
];
