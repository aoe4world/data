// @deprecated These types used to live here, use lib/config/civs directly in the data submodule, or ./src/config in explorer itself
import type { CivAbbr, CivSlug, CivConfig } from "../lib/config/civs";
import { CIVILIZATIONS, CIVILIZATION_BY_SLUG } from "../lib/config/civs";
export { type CivAbbr, type CivSlug, type CivConfig, CIVILIZATIONS, CIVILIZATION_BY_SLUG };

export type CivOverviewItem = {
  title: string;
  description?: string;
  list?: string[];
};

export type CivTranslation = {
  name?: string;
  classes?: string;
  description?: string;
  overview?: CivOverviewItem[];
};

export type CivInfo = {
  id: string;
  name: string;
  abbr: CivAbbr;
  slug: CivSlug;
  classes: string;
  description: string;
  // backdrop?: string;
  overview: CivOverviewItem[];
};
