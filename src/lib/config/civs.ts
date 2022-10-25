import { civConfig, civAbbr } from "../../types/civs";

export const CIVILIZATIONS: Record<civAbbr, civConfig> = {
  en: {
    name: "English",
    abbr: "en",
    slug: "english",
  },
  hr: {
    name: "Holy Roman Empire",
    abbr: "hr",
    slug: "hre",
  },
  fr: {
    name: "French",
    abbr: "fr",
    slug: "french",
  },
  ch: {
    name: "Chinese",
    abbr: "ch",
    slug: "chinese",
  },
  de: {
    name: "Delhi Sultanate",
    abbr: "de",
    slug: "delhi",
  },
  ab: {
    name: "Abbasid Dynasty",
    abbr: "ab",
    slug: "abbasid",
  },
  ma: {
    name: "Malians",
    abbr: "ma",
    slug: "malians",
  },
  mo: {
    name: "Mongols",
    abbr: "mo",
    slug: "mongols",
  },
  ot: {
    name: "Ottomans",
    abbr: "ot",
    slug: "ottomans",
  },
  ru: {
    name: "Rus",
    abbr: "ru",
    slug: "rus",
  },
};

export enum CIV_ABBR {
  EN = "en",
  HR = "hr",
  FR = "fr",
  CH = "ch",
  DE = "de",
  AB = "ab",
  MO = "mo",
  MA = "ma",
  OT = "ot",
  RU = "ru",
}

export const CIVILIZATION_BY_SLUG = {
  english: CIVILIZATIONS.en,
  hre: CIVILIZATIONS.hr,
  french: CIVILIZATIONS.fr,
  chinese: CIVILIZATIONS.ch,
  delhi: CIVILIZATIONS.de,
  abbasid: CIVILIZATIONS.ab,
  malians: CIVILIZATIONS.ma,
  mongols: CIVILIZATIONS.mo,
  ottomans: CIVILIZATIONS.ot,
  rus: CIVILIZATIONS.ru,
};
