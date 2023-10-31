import { ItemList, CivSlug, CivAbbr, getAbbr, ItemSlug } from "./utils";
import allUnits from "../../units/all-optimized.json";
import allBuildings from "../../buildings/all-optimized.json";
import allTechnologies from "../../technologies/all-optimized.json";
import allUpgrades from "../../upgrades/all-optimized.json";
import allAbilities from "../../abilities/all-optimized.json";
import { Building, Technology, Unit, Upgrade, Ability } from "../types/items";
import ab from "../../civilizations/abbasid.json";
import ch from "../../civilizations/chinese.json";
import de from "../../civilizations/delhi.json";
import en from "../../civilizations/english.json";
import fr from "../../civilizations/french.json";
import hr from "../../civilizations/hre.json";
import ma from "../../civilizations/malians.json";
import mo from "../../civilizations/mongols.json";
import ot from "../../civilizations/ottomans.json";
import ru from "../../civilizations/rus.json";
import { CivInfo, civConfig } from "../types/civs";
import { Optimized, optimizedToUnified } from "../lib/utils/items";

const units = new ItemList<Unit>(...optimizedToUnified(allUnits.data as unknown as Optimized<Unit>[]));
const buildings = new ItemList<Building>(...optimizedToUnified(allBuildings.data as unknown as Optimized<Building>[]));
const technologies = new ItemList<Technology>(...optimizedToUnified(allTechnologies.data as unknown as Optimized<Technology>[]));
const upgrades = new ItemList<Upgrade>(...optimizedToUnified(allUpgrades.data as unknown as Optimized<Upgrade>[]));
const abilities = new ItemList<Ability>(...optimizedToUnified(allAbilities.data as unknown as Optimized<Ability>[]));

const civilizations: Record<CivAbbr, CivInfo> & { Get: typeof GetCiv; list: CivInfo[] } = {
  ab,
  ch,
  de,
  en,
  fr,
  hr,
  ma,
  mo,
  ot,
  ru,
  Get: GetCiv,
  list: [ab, ch, de, en, fr, hr, ma, mo, ot, ru],
};

function GetCiv(slug: CivSlug | CivAbbr | civConfig) {
  if (typeof slug !== "string") slug = slug.abbr;
  const items = {
    units: units.where({ civilization: slug }),
    buildings: buildings.where({ civilization: slug }),
    technologies: technologies.where({ civilization: slug }),
    upgrades: upgrades.where({ civilization: slug }),
    abilities: abilities.where({ civilization: slug }),
  };
  return {
    info: civilizations[getAbbr(slug)],
    ...items,
    Get: (id: number | ItemSlug) => Get(id, items),
  };
}

function Get(id: number | ItemSlug, data = { units, buildings, technologies, upgrades, abilities }) {
  if (typeof id === "number") {
    return data.units.get(id) || data.buildings.get(id) || data.technologies.get(id) || data.upgrades.get(id) || data.abilities.get(id);
  }

  const [type, slug] = id.split("/");
  if (type == "units") return data.units.get(slug);
  if (type == "buildings") return data.buildings.get(slug);
  if (type == "technologies") return data.technologies.get(slug);
  if (type == "upgrades") return data.upgrades.get(slug);
  if (type == "abilities") return data.abilities.get(slug);
}

export { Get, civilizations, units, buildings, technologies, upgrades, abilities };
