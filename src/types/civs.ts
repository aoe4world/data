// @deprecated These types used to live here, use lib/config/civs directly in the data submodule, or ./src/config in explorer itself
export { type CivAbbr, type CivSlug, type CivConfig } from "../lib/config/civs";

export type CivInfo = {
  name: string;
  classes: string;
  description: string;
  // backdrop?: string;
  overview: { title: string; description?: string; list?: string[] }[];
};
