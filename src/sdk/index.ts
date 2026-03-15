import type { CivAbbr, CivSlug } from "../types/civs";
import { getAbbr, ItemSlug } from "./utils";
import { CivInfo, CivConfig } from "../types/civs";
import { DataRegistry } from "./data";

const { units, buildings, technologies, upgrades, abilities } = DataRegistry;

const civilizations: Record<CivAbbr, CivInfo> & { Get: typeof GetCiv; list: CivInfo[] } = {
  ...DataRegistry.civilizations,
  Get: GetCiv,
} as Record<CivAbbr, CivInfo> & { Get: typeof GetCiv; list: CivInfo[] };

function GetCiv(slug: CivSlug | CivAbbr | CivConfig) {
  if (typeof slug !== "string") slug = slug.abbr;
  const items = {
    units: units.where({ civilization: slug }),
    buildings: buildings.where({ civilization: slug }),
    technologies: technologies.where({ civilization: slug }),
    upgrades: upgrades.where({ civilization: slug }),
    abilities: abilities.where({ civilization: slug }),
  };
  return {
    info: civilizations[getAbbr(slug)!],
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

const Data = { Get, civilizations, units, buildings, technologies, upgrades, abilities };
