import { ItemList, CivSlug, CivAbbr, getAbbr } from "./utils";
import allUnits from "../../units/all-unified.json";
import allBuildings from "../../buildings/all-unified.json";
import allTechnologies from "../../technologies/all-unified.json";
import allUpgrades from "../../upgrades/all-unified.json";
import { Building, Item, Technology, UnifiedItem, Unit } from "../types/items";
import ab from "../../civilizations/ab.json";
import ch from "../../civilizations/ch.json";
import de from "../../civilizations/de.json";
import en from "../../civilizations/en.json";
import fr from "../../civilizations/fr.json";
import hr from "../../civilizations/hr.json";
import mo from "../../civilizations/mo.json";
import ru from "../../civilizations/ru.json";
import { civConfig, CivInfo } from "../types/civs";

const units = new ItemList<Unit>(...(allUnits.data as UnifiedItem<Unit>[]));
const buildings = new ItemList<Building>(...(allBuildings.data as UnifiedItem<Building>[]));
const technologies = new ItemList<Technology>(...(allTechnologies.data as UnifiedItem<Technology>[]));
const upgrades = new ItemList<Item>(...(allUpgrades.data as UnifiedItem<Item>[]));
const civilizations: Record<CivAbbr, CivInfo> & { Get: typeof GetCiv; list: CivInfo[] } = { ab, ch, de, en, fr, hr, mo, ru, Get: GetCiv, list: [ab, ch, de, en, fr, hr, mo, ru] };

function GetCiv(slug: CivSlug | CivAbbr) {
  return {
    info: civilizations[getAbbr(slug)],
    Units: units.where({ civilization: slug }),
    Buildings: buildings.where({ civilization: slug }),
    Technologies: technologies.where({ civilization: slug }),
    Upgrades: upgrades.where({ civilization: slug }),
  };
}

function Get(id: /* number | */ `${"units" | "buildings" | "technologies" | "upgrades"}/${string}`) {
  // Todo: Reference by unit ID
  //   if (typeof id === "number") return {};

  const [type, slug] = id.split("/");
  if (type == "units") return units.get(slug);
  if (type == "buildings") return buildings.get(slug);
  if (type == "technologies") return technologies.get(slug);
  if (type == "upgrades") return upgrades.get(slug);
}

export { Get, civilizations, units, buildings, technologies, upgrades };
