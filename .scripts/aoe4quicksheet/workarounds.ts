import { CIVILIZATIONS } from "../lib/config/civs";
import { civAbbr } from "../lib/types/civs";
import { Technology } from "../lib/types/units";
import { transformRomanAgeToNumber } from "../lib/utils/game";
import { MappedSheetItem } from "./types";
const civAbbrs = Object.keys(CIVILIZATIONS);

export function transformSheetUnitWithWorkaround(i: MappedSheetItem) {
  if (typeof i.displayName == "string") {
    // 1. Fix duplicate villager entries.
    if (i.displayName == "Villager") {
      // Assigning English as unique because ranged attack
      if (i.en) i.strongId = `villager-${transformRomanAgeToNumber(i.age as string)}-english`;
      // Assingning French as unique across all ages because better economy,
      else if (i.fr) i.strongId = `villager-${transformRomanAgeToNumber(i.age as string)}-french`;
      // Renaming // assiging HRE age 4 build in Swabia as unique because faster production
      else if (i.hr && i.age == "IV") i.strongId = `villager-4-palace-of-swabia`;
      // Leaving regular age 1 villagers all remaining civs.  if (u.displayName == "Villager") {
    }

    // 2. Fix Abbassid traders showing first, give special name like villagers
    else if (i.displayName == "Trader" && i.ab) i.strongId = `trader-${transformRomanAgeToNumber(i.age as string)}-abbasid`;
    // 3. Rename all units produced at Ovoo
    else if (i.mo && i.displayName.includes("(x2)")) i.displayName = i.displayName.replace("(Early)", "").replace("(x2)", "(Ovoo)");
    // 4. Remove chinese Dynasties from Spirit Way units
    else if (i.ch && i.displayName.includes("(Spirit Way)")) i.displayName = i.displayName.replace("(Song)", "").replace("(Yuan)", "").replace("(Ming)", "");
    // 5. Rename Armored Beast to Armored Beasts
    else if (i.displayName.includes("Armored Beast ")) i.displayName = "Armored Beasts";
    // 6. Rename "Economy Wing" to "Economic Wing"
    else if (i.displayName.includes("Economy Wing")) i.displayName = i.displayName.replace("Economy Wing", "Economic Wing");
  }

  // 7. Rename "Mining Camp/Ger €", "Milll/Hunting Cabin/Ger", etc to "Mining Camp" and "Mill"
  ["Mining Camp", "Mill", "Monastary", "Lumber Camp", "University"].forEach((p) => (i.producedBy as string).includes(p) && (i.producedBy = p));

  // 8. Label cheaper common upgrades as civ variation
  if (i.genre == "Technology") {
    if (civExclusive(i, "de") && i.occurance != "Unique") i.displayName += " (Delhi)";
    if (civExclusive(i, "fr") && i.occurance != "Unique") i.displayName += " (French)";
    if (civExclusive(i, "ch") && i.occurance != "Unique") i.displayName += " (Chinese)";
  }
  return i;
}

// First we map/normalize production buildings above, then this creates an array of buildings
export function mapItemProducedBy(data: MappedSheetItem, producedBy: string[]): Technology["producedBy"] {
  if (data.ru && data.producedBy == "Mill") producedBy.push("hunting-cabin", "high-trade-house");

  if (data.mo && (data.displayName as string).includes("(Improved)") && ["Mining Camp", "Mill", "Lumber Camp"].includes(data.producedBy as string))
    producedBy = ["ger", "steppe-redoubt"];
  else if (data.mo && ["Mining Camp", "Mill", "Lumber Camp"].includes(data.producedBy as string)) producedBy.push("ger", "steppe-redoubt");

  if (data.de && data.producedBy == "University") producedBy.push("madrasa");

  if (data.hr && (data.producedBy as string).includes("Blacksmith")) producedBy.push("meinwerk-palace");
  if (data.hr && (data.producedBy as string).includes("Barracks")) producedBy.push("burgrave-palace");

  if (data.fr && (data.producedBy as string).includes("Stable")) producedBy.push("school-of-cavalry");
  if (data.fr && (data.producedBy as string).includes("Keep")) producedBy.push("red-palace");

  if (data.en && (data.producedBy as string).includes("Blacksmith") && (data.displayName as string).includes("Villager")) producedBy.push("kings-palace");

  // if (data.mo && data.producedBy == "University") item.producedBy.push("blacksmith");
  // Whep, this doesn't really map well, since it can only be produced by blacksmith for mongols.
  // Splitting the tech of into a unique one also does not realy make sense here
  if (data.mo && data.producedBy == "Monastery") producedBy.push("prayer-tent");
  if ((data.ab || data.de) && data.producedBy == "Monastery") producedBy.push("mosque");
  return producedBy;
}

export function filterOutUnsupportedRows(u: MappedSheetItem) {
  return (
    ["Land Unit", "Technology", "Water Unit"].includes(u.genre as string) &&
    // Filter out Burgrave Palace units because there's nothing special about them
    !(u.displayName as string).includes("(5 units)") &&
    // Filter out Khaganate spawn as it is not a unit
    // !(u.displayName as string).includes("Khaganate Units") &&
    !(u.strongId as string)?.endsWith("-ovoo") &&
    !(u.strongId as string)?.endsWith("-ovoo-stable") &&
    !(u.strongId as string)?.endsWith("-5-units") &&
    !(u.strongId as string)?.endsWith("-school-of-cavalry") &&
    !(u.strongId as string)?.endsWith("-keep-influence") &&
    !(u.strongId as string)?.endsWith("-spirit-way") &&
    !(u.strongId as string)?.endsWith("-high-armory") &&
    !(u.strongId as string)?.endsWith("-meinwerk-palace")
  );
}

export const ignoredIds = [
  "khaganate-units-4",
  "wynguard-army-4",
  "villager-2-english",
  "scout-1-stable", // Duplicate ovoo scout entries that can also be created at stable
  "scout-2-1", // Duplicate ovoo scout entries that can also be created at stable
  "scout-3-1",
  "scout-4-1",

  // Added as alt production building
  "chivalry-2-school-of-cavalry",
  "cantled-saddles-3-school-of-cavalry",
  "enlistment-incentives-4-red-palace",
];

function civExclusive(i: MappedSheetItem, civ: civAbbr) {
  return civAbbrs.every((x) => x == civ || i[x] == "");
}
