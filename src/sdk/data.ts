import { ItemList } from "./utils";
import allUnits from "../../units/all-optimized.json";
import allBuildings from "../../buildings/all-optimized.json";
import allTechnologies from "../../technologies/all-optimized.json";
import allUpgrades from "../../upgrades/all-optimized.json";
import allAbilities from "../../abilities/all-optimized.json";
import { Building, Technology, Unit, Upgrade, Ability } from "../types/items";
import { CivInfo, CivAbbr } from "../types/civs";
import { Optimized, optimizedToUnified } from "../lib/utils/items";

import ab from "../../civilizations/abbasid.json";
import ay from "../../civilizations/ayyubids.json";
import by from "../../civilizations/byzantines.json";
import ch from "../../civilizations/chinese.json";
import de from "../../civilizations/delhi.json";
import en from "../../civilizations/english.json";
import fr from "../../civilizations/french.json";
import hl from "../../civilizations/lancaster.json";
import hr from "../../civilizations/hre.json";
import ja from "../../civilizations/japanese.json";
import je from "../../civilizations/jeannedarc.json";
import kt from "../../civilizations/templar.json";
import ma from "../../civilizations/malians.json";
import mo from "../../civilizations/mongols.json";
import od from "../../civilizations/orderofthedragon.json";
import ot from "../../civilizations/ottomans.json";
import ru from "../../civilizations/rus.json";
import zx from "../../civilizations/zhuxi.json";

import sen from "../../civilizations/sengoku.json";
import tug from "../../civilizations/tughlaq.json";
import gol from "../../civilizations/goldenhorde.json";
import mac from "../../civilizations/macedonian.json";

import jin from "../../civilizations/jindynasty.json";

const units = new ItemList<Unit>(...optimizedToUnified(allUnits.data as unknown as Optimized<Unit>[]));
const buildings = new ItemList<Building>(...optimizedToUnified(allBuildings.data as unknown as Optimized<Building>[]));
const technologies = new ItemList<Technology>(...optimizedToUnified(allTechnologies.data as unknown as Optimized<Technology>[]));
const upgrades = new ItemList<Upgrade>(...optimizedToUnified(allUpgrades.data as unknown as Optimized<Upgrade>[]));
const abilities = new ItemList<Ability>(...optimizedToUnified(allAbilities.data as unknown as Optimized<Ability>[]));

const list = [ab, ay, by, ch, de, en, fr, hl, hr, ja, je, kt, ma, mo, od, ot, ru, zx, sen, tug, gol, mac, jin] as CivInfo[];

const civilizations = {
  ab,
  ay,
  by,
  ch,
  de,
  en,
  fr,
  hl,
  hr,
  ja,
  je,
  kt,
  ma,
  mo,
  od,
  ot,
  ru,
  zx,
  sen,
  tug,
  gol,
  mac,
  jin,
  list
} as Record<CivAbbr, CivInfo> & { list: CivInfo[] };

export const DataRegistry = {
  units,
  buildings,
  technologies,
  upgrades,
  abilities,
  civilizations,
};
