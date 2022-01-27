import fetch from "node-fetch";
import { StandardUnitFormat } from "../lib/types/units";
import { civAbbr } from "../lib/types/civs";
import { CIVILIZATIONS } from "../lib/config/civs";
import { COLUMN_MAP, SHEET_ID, SHEET_TAB_NAME, SHEET_API_KEY } from "./config";
import { MappedSheetColumn, MappedSheetUnit } from "./types";
import { mergeUnit } from "../lib/files/writeUnitData";
import { slugify, getStringWithAlphanumericLike, getStringOutsideParenthesis, getStringBetweenParenthesis } from "../lib/utils/string";
import { transformRomanAgeToNumber, interpolateGameString } from "../lib/utils/game";
import { filterOutUnsupportedRows, ignoredIds, transformSheetUnitWithWorkaround } from "./workarounds";
import { round } from "../lib/utils/number";

getUnitData().then((data) => {
  data
    .filter(filterOutUnsupportedRows)
    .map(transformSheetUnitWithWorkaround)
    .map(mapSheetUnitToStandardFormat)
    .filter((x) => !ignoredIds.includes(x.id))
    .forEach((unit) => {
      console.log(`Imported ${unit.id}`);
      mergeUnit(unit);
    });
});

async function getUnitData(): Promise<MappedSheetUnit[]> {
  try {
    if (!SHEET_API_KEY) throw new Error("No sheet api key provided, set as env variable `AOE4_GOOGLE_SHEET_API_KEY`");
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_TAB_NAME}?key=${SHEET_API_KEY ?? "sdfs"}&valueRenderOption=UNFORMATTED_VALUE&majorDimension=ROWS`
    );
    if (!res.ok) {
      try {
        const { error } = await res.json();
        throw new Error(error?.message);
      } catch (e) {
        throw new Error(`Could not fetch sheet ${res.statusText}`);
      }
    }

    const data = await res.json();
    const columns = data["values"][0];

    if (!COLUMN_MAP.every((x, i) => x == columns[i] || x[0] == columns[i]))
      throw new Error("Column config does not match columns in sheet, please review and update the positions of columns in ./config.ts");

    return data["values"]
      .slice(1) //exclude header row
      .map((row: (string | number)[]): MappedSheetUnit => {
        let unitData: Record<MappedSheetColumn, string | number> = {} as any;
        columns.forEach((_, index: number) => {
          // If the collumn is configured to be mapped, take the data out
          if (Array.isArray(COLUMN_MAP[index])) unitData[COLUMN_MAP[index][1] as MappedSheetColumn] = row[index];
        });
        return unitData;
      });
  } catch (e) {
    throw new Error(`Failed to import sheet ${e}`);
  }
}

function mapSheetUnitToStandardFormat(unitData: MappedSheetUnit): StandardUnitFormat {
  const classes = (unitData.gameClassification as string).split(",").map((x) => x.trim());
  const normalizedName = getStringWithAlphanumericLike(getStringOutsideParenthesis(unitData.displayName));
  const civs = Object.values(CIVILIZATIONS).reduce((acc, civ) => ((unitData[civ.abbr as MappedSheetColumn] as string)?.length > 1 ? [...acc, civ.abbr] : acc), [] as civAbbr[]);
  const age = transformRomanAgeToNumber(unitData.age as string);
  const id = getUniqueID(unitData, normalizedName);

  let unit: StandardUnitFormat = {
    id: id,
    baseId: slugify(normalizedName),
    name: normalizedName,
    age,
    civs,
    description: interpolateGameString(unitData.description as string, String(unitData.descriptionValues ?? "")?.split(",")),
    class: String(unitData.class),
    classes,
    unique: ["Unique"].includes(unitData.occurance as string) || civs.length == 1,

    hitpoints: +unitData.hitpoints,

    movement: {
      speed: round(+unitData.moveSpeed, 2),
    },

    costs: {
      food: +unitData.food,
      wood: +unitData.wood,
      stone: +unitData.stone,
      gold: +unitData.gold,
      total: +unitData.totalCost,
      popcap: +unitData.population,
      time: +unitData.buildTime,
    },

    attack: {
      melee: unitData.attackType == "Melee" ? +unitData.totalAttack : 0,
      ranged: unitData.attackType == "Ranged" ? +unitData.totalAttack : 0,
      siege: unitData.attackType == "True" ? +unitData.totalAttack : 0,
      fire: +unitData.torchAttack,
      speed: round(+unitData.attackSpeed, 2),
      dps: round(+unitData.damagePerSecond, 1),
    },

    range: {
      min: round(+unitData.minRange, 1),
      max: round(+unitData.maxRange, 1),
    },

    vision: {
      lineOfSight: +unitData.lineOfSight,
      heightOfSight: +unitData.heightOfSight,
    },

    armor: {
      melee: +unitData.meleeArmor,
      ranged: +unitData.rangedArmor,
      fire: +unitData.fireArmor,
    },

    producedBy: [slugify(getStringWithAlphanumericLike(unitData.producedBy))],
  };

  return unit;
}

const ids = new Set<string>();

function getUniqueID(u: MappedSheetUnit, normalizedName: string) {
  const baseId =
    (u.strongId as string) ?? // strongly provided ID from sheet or transformation, always attempt this first
    `${slugify(normalizedName)}-${transformRomanAgeToNumber(u.age as string)}`; // Otherwise format id using lowercase-slugified-{age} 'horse-archer-3
  if (ids.has(baseId)) {
    // If we already have this unit, attempt some variations
    let id = baseId;
    const variation = getStringWithAlphanumericLike(getStringBetweenParenthesis(u.displayName));
    if (variation.length) id = `${baseId}-${slugify(variation)}`;
    // 'bombard-2-clocktower`
    else id = `${baseId}-${slugify(getStringWithAlphanumericLike(u.producedBy))}`; // `trader-2-silver-tree`

    if (ids.has(id)) {
      // otherwise we're out of options, use 'horse-archer-3-2'
      console.warn(`Duplicate id ${id}`);
      let i = 1;
      while (ids.has(id)) {
        id = `${baseId}-${i}`;
        i++;
      }
      console.log(`Using ${id} instead`);
    }
    ids.add(id);
    return id;
  } else {
    ids.add(baseId);
    return baseId;
  }
}
