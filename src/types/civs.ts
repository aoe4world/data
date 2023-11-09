import { CIVILIZATIONS } from "../lib/config/civs";

export type CivAbbr = keyof typeof CIVILIZATIONS;
export type CivSlug = typeof CIVILIZATIONS[CivAbbr]["slug"];

export type CivConfig = {
  name: string;
  abbr: CivAbbr;
  slug: CivSlug;
  attribName?: string;
};

export type CivInfo = {
  name: string;
  classes: string;
  description: string;
  // backdrop?: string;
  overview: { title: string; description?: string; list?: string[] }[];
};

export const CIVILIZATION_BY_SLUG: Record<CivSlug, CivConfig> = Object.values(CIVILIZATIONS).reduce((acc, civ) => ({ ...acc, [civ.slug]: civ }), {} as Record<CivSlug, CivConfig>);
