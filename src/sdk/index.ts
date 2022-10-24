import { ItemList, CivSlug, CivAbbr, getAbbr } from "./utils";
import allUnits from "../../units/all-optimized.json";
import allBuildings from "../../buildings/all-optimized.json";
import allTechnologies from "../../technologies/all-optimized.json";
import allUpgrades from "../../upgrades/all-optimized.json";
import { Building, Technology, Unit, Upgrade } from "../types/items";
import ab from "../../civilizations/abbasid.json";
import ch from "../../civilizations/chinese.json";
import de from "../../civilizations/delhi.json";
import en from "../../civilizations/english.json";
import fr from "../../civilizations/french.json";
import hr from "../../civilizations/hre.json";
import mo from "../../civilizations/mongols.json";
import ru from "../../civilizations/rus.json";
import { CivInfo } from "../types/civs";
import { Optimized, optimizedToUnified } from "../lib/utils/items";

const units = new ItemList<Unit>(...optimizedToUnified(allUnits.data as unknown as Optimized<Unit>[]));
const buildings = new ItemList<Building>(...optimizedToUnified(allBuildings.data as unknown as Optimized<Building>[]));
const technologies = new ItemList<Technology>(...optimizedToUnified(allTechnologies.data as unknown as Optimized<Technology>[]));
const upgrades = new ItemList<Upgrade>(...optimizedToUnified(allUpgrades.data as unknown as Optimized<Upgrade>[]));

const civilizations: Record<CivAbbr, CivInfo> & { Get: typeof GetCiv; list: CivInfo[] } = {
  ab,
  ch,
  de,
  en,
  fr,
  hr,
  mo,
  ru,
  Get: GetCiv,
  list: [ab, ch, de, en, fr, hr, mo, ru],
};

function GetCiv(slug: CivSlug | CivAbbr) {
  return {
    info: civilizations[getAbbr(slug)],
    Units: units.where({ civilization: slug }),
    Buildings: buildings.where({ civilization: slug }),
    Technologies: technologies.where({ civilization: slug }),
    Upgrades: upgrades.where({ civilization: slug }),
  };
}

function Get(id: number | `${"units" | "buildings" | "technologies" | "upgrades"}/${string}`) {
  if (typeof id === "number") {
    return units.get(id) || buildings.get(id) || technologies.get(id) || upgrades.get(id);
  }

  const [type, slug] = id.split("/");
  if (type == "units") return units.get(slug);
  if (type == "buildings") return buildings.get(slug);
  if (type == "technologies") return technologies.get(slug);
  if (type == "upgrades") return upgrades.get(slug);
}

export { Get, civilizations, units, buildings, technologies, upgrades };
