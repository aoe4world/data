import { CIVILIZATIONS } from "../lib/config/civs";
import { Building, Technology, Unit, Upgrade } from "./items";

export type civAbbr = "en" | "hr" | "fr" | "ch" | "de" | "ab" | "mo" | "ru";

export type civConfig = {
  name: string;
  abbr: civAbbr;
  slug: string;
};

export const CIVILIZATION_BY_SLUG = {
  english: CIVILIZATIONS.en,
  hre: CIVILIZATIONS.hr,
  french: CIVILIZATIONS.fr,
  chinese: CIVILIZATIONS.ch,
  delhi: CIVILIZATIONS.de,
  abbasid: CIVILIZATIONS.ab,
  mongols: CIVILIZATIONS.mo,
  rus: CIVILIZATIONS.ru,
};

export type CivInfo = {
  name: string;
  classes: string;
  description: string;
  backdrop?: string;
  overview: { title: string; description?: string; list?: string[] }[];
};
