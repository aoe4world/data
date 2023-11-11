import { ItemSlug } from "../sdk/utils";
import { Ability, Building, Item, ItemType, Modifier, Selector, Technology, Unit, Upgrade } from "../types/items";
import { KHAGANTE_SPAWN_COUNTS, attribFile } from "./config";

const workarounds = new Map<string, Override>();
const NO_COSTS = { food: 0, wood: 0, stone: 0, gold: 0, vizier: 0, oliveoil: 0, total: 0, time: 0, popcap: 0 };

// –––––– Building Emplacements and Garrisons ––––––

workaround("Remove weapons from Chinese Village", {
  predicate: (item) => item.type === "building" && item.baseId === "village" && item.civs.includes("ch"),
  mutator: (item) => {
    item = item as Building;
    item.weapons = [];
  },
});

workaround("Remove all garrison weapons and from additional town centers and town center-like landmarks", {
  predicate: (item) => ["town-center", "kings-palace", "palace-of-swabia"].includes(item.baseId),
  mutator: (item) => ((item as Building).weapons = []),
});

workaround("Remove all garrison and emplacement weapons from Outposts and Wooden Fortresses", {
  predicate: (item) => ["outpost", "wooden-fortress"].includes(item.baseId),
  mutator: (item) => ((item as Building).weapons = []),
});

workaround("Remove all emplacements except springald from Stone Wall towers", {
  predicate: (item) => item.baseId === "stone-wall-tower",
  mutator: (item) => ((item as Building).weapons = [(item as Building).weapons.find((w) => w.name === "Springald")!]),
});

workaround("Remove all emplacement except default arrow from the Kremlin", {
  predicate: (item) => item.baseId === "kremlin",
  mutator: (item) => ((item as Building).weapons = [(item as Building).weapons.find((w) => w.name === "Bow" && w.damage == 10)!]),
});

workaround("Remove all garrison and emplacement weapons from capital town center, keeps and regular keep-like landmarks, leave the passive arrow emplacement as a 3x burst", {
  predicate: (item) =>
    ["capital-town-center", "keep", "the-white-tower", "palace-of-swabia", "elzbach-palace", "saharan-trade-network", "fort-of-the-huntress", "sea-gate-castle"].includes(
      item.baseId
    ),
  mutator: (item) => {
    item = item as Building;
    const bow = item.weapons.find((x) => x.name === "Bow");
    if (bow) {
      bow.burst = { count: 3 };
      if (item.baseId === "capital-town-center" && item.civs.every((c) => c == "en")) bow.burst.count = 6;
      item.weapons = [bow];
    } else item.weapons = [];
  },
});

workaround("Remove all garrison and emplacement weapons from the Red Palace, set 2x burst on default arbalest", {
  predicate: (item) => item.baseId === "red-palace",
  mutator: (item) => {
    item = item as Building;
    const arbalest = item.weapons.find((x) => x.name === "Arbalest")!;
    arbalest.burst = { count: 2 };
    item.weapons = [arbalest];
  },
  validator: (item) => (item as Building).weapons.length == 1 && (item as Building).weapons.filter((w) => w.type == "ranged" && w.damage == 60 && w.burst?.count == 2).length == 1,
});

workaround("Remove all garrison and emplacement weapons from the Japanese Castle except the Rocket", {
  predicate: (item) => item.baseId === "castle" && item.civs.includes("ja"),
  mutator: (item) => {
    item = item as Building;
    const rocket = item.weapons.find((x) => x.name === "Rocket")!;
    item.weapons = [rocket];
  },
});

workaround("Fix incorrect description from 'great bombard' used on regular cannon emplacements", {
  predicate: (item) => item.baseId === "cannon-emplacement" && item.description.includes("Great Bombard"),
  mutator: (item) => {
    item.description = "Add a defensive cannon emplacement to this structure.";
  },
});

workaround("Increase the Berkshire Palace range to 15, and double set the garrison burst to 6", {
  predicate: (item) => item.baseId === "berkshire-palace",
  mutator: (item) => {
    item = item as Building;
    const bow = item.weapons.find((x) => x.name === "Bow")!;
    bow.burst = { count: 6 };
    bow.range!.max = 15;
    item.weapons = [bow];
  },
  validator: (item) => (item as Building).weapons.filter((w) => w.type == "ranged" && w.burst?.count == 6 && w.range?.max == 15).length == 1,
});

workaround("Remove all weapons from the Spasskaya Tower, pick the Cannon as listed ranged weapon even though the Springald is technically also in place", {
  predicate: (item) => item.baseId === "spasskaya-tower",
  mutator: (item) => {
    item = item as Building;
    item.weapons = [item.weapons.find((x) => x.name === "Cannon")!];
  },
  validator: (item) => (item as Building).weapons.length == 1,
});

workaround("Remove naval arrow slits emplacement from the Dock", {
  predicate: (item) => item.baseId === "dock",
  mutator: (item) => ((item as Building).weapons = (item as Building).weapons.filter((w) => w.attribName !== "weapon_dock_arrows")),
});

// –––– Age availabiity ––––
// The below workarounds may have more to do with how we currently
// parse out the available ages and could potentially be fixed
// in some cases, we probably can't like research being marked in age 1
// but only being able to be clicked in the UI in age 3

workaround("Make Battering Ram and Siege Tower available from the feudal age", {
  ...overrideAge(["battering-ram", "siege-tower"], 2),
});

workaround("Make Abbasid Battering Ram and Siege Tower available from the dark age", {
  ...overrideAge(["battering-ram", "siege-tower"], 1, ["ab"]),
});

workaround("Make Nest of Bees available from Castle Age", {
  ...overrideAge(["nest-of-bees", "clocktower-nest-of-bees"], 3),
});

workaround("Make Counterweight Trebuchet available from Castle Age", {
  ...overrideAge(["counterweight-trebuchet", "clocktower-counterweight-trebuchet"], 3),
});

workaround("Make trade ships available from Feudal Age", {
  ...overrideAge(["trade-ship", "lodya-trade-ship"], 2),
});

workaround("Make Galley and Junk available from Feudal Age", {
  ...overrideAge(["galley", "junk"], 2),
});

workaround("Make Baglah, War Junk and Galleass available from Castle Age", {
  ...overrideAge(["baglah", "war-junk", "galleass"], 3),
});

workaround("Make Rus Blessing Duration available from Castle Age", {
  ...overrideAge(["blessing-duration"], 3, ["ru"]),
});

workaround("Make Rus Castle Turret and Castle Watch available from Fuedal Age", {
  ...overrideAge(["castle-turret", "castle-watch"], 2, ["ru"]),
});

workaround("Make Rus Mounted Precision available from Imperial Age", {
  ...overrideAge(["mounted-precision"], 4, ["ru"]),
});

workaround("Make Rus Stone Walls available from Imperial Age", {
  ...overrideAge(["stone-wall", "stone-wall-tower", "stone-wall-gate"], 4, ["ru"]),
});

workaround("Make Abbasid Teak Masts available from Castle Age", {
  ...overrideAge(["teak-masts"], 3, ["ab"]),
});

workaround("Make Delhi Village Fortresses available from Castle Age", {
  ...overrideAge(["village-fortress"], 3, ["de"]),
});

workaround("Make English Wynguard Forces available from Imperial Age", {
  ...overrideAge(["wynguard-army", "wynguard-footmen", "wynguard-raiders", "wynguard-rangers"], 4, ["en"]),
});

//could do this by creating dependency from techs that unlock abilities, but doing workaround for the time being

workaround("Make Ability Arrow Volley available in Imperial Age", {
  ...overrideAge(["ability-arrow-volley"], 4, ["en"]),
});

workaround("Make Ability Saints Blessing available in Castle Age", {
  ...overrideAge(["ability-saints-blessing"], 3, ["ru"]),
});

workaround("Make Ability High Armory Production Bonus available in Imperial Age", {
  ...overrideAge(["ability-high-armory-production-bonus"], 4, ["ru"]),
});

workaround("Make Ability Static Deployment available in Imperial Age", {
  ...overrideAge(["ability-static-deployment"], 4, ["ru"]),
});

workaround("Make Ability Gallop available in Imperial Age", {
  ...overrideAge(["ability-gallop"], 4, ["ru"]),
});

workaround("Make Ability Fortitude available in Feudal Age", {
  ...overrideAge(["ability-fortitude"], 2, ["ot"]),
});

workaround("Make Ability blacksmith-and-university-influence available in Feudal Age", {
  ...overrideAge(["ability-blacksmith-and-university-influence"], 2, ["ot"]),
});

workaround("Make Ability Tower of Victory available in Feudal Age", {
  ...overrideAge(["ability-tower-of-victory-aura"], 2, ["de"]),
});

workaround("Make Ability Forced March available in Castle Age", {
  ...overrideAge(["ability-forced-march"], 3, ["de"]),
});

workaround("Make Ability Deploy Pavis available in Castle Age", {
  ...overrideAge(["ability-deploy-pavise"], 3, ["fr"]),
});

workaround("Make Ability Keep Influence available in Castle Age", {
  ...overrideAge(["ability-keep-influence"], 3, ["fr"]),
});

workaround("Make Ability activate-stealth available in Feudal Age", {
  ...overrideAge(["ability-activate-stealth"], 2, ["ma"]),
});

workaround("Make Ability huntress-stealth available in Imperial Age", {
  ...overrideAge(["ability-huntress-stealth"], 4, ["ma"]),
});

workaround("Make Ability camel-support available in Imperial Age", {
  ...overrideAge(["ability-camel-support"], 4, ["ab"]),
});

workaround("Make Proselytize available in Imperial Age", {
  ...overrideAge(["ability-proselytize"], 4, ["ab"]),
});

workaround("Make Artilery Shot available in Imperial Age", {
  ...overrideAge(["ability-artillery-shot"], 4, ["ab"]),
});

workaround("Make Imperial Spies available in Castle Age", {
  ...overrideAge(["ability-imperial-spies"], 3, ["ch"]),
});

workaround("Make Abbey Healing available in Feudal Age", {
  ...overrideAge(["ability-abbey-healing"], 2, ["en"]),
});

workaround("Make Food Festival available in Imperial Age", {
  ...overrideAge(["ability-food-festival"], 4, ["ma"]),
});

workaround("Make Military Festival available in Imperial Age", {
  ...overrideAge(["ability-military-festival"], 4, ["ma"]),
});

workaround("Make Siege Festival available in Imperial Age", {
  ...overrideAge(["ability-siege-festival"], 4, ["ma"]),
});

workaround("Make Trade Protection available in Imperial Age", {
  ...overrideAge(["ability-trade-protection"], 4, ["ot"]),
});

// ---- Abilities ----

// workaround("..", {
//   predicate: (item) => item.type === "ability" && item.attribName === "jeanne_d_arc_rallying_call_manatarms_fre_ha_01",
//   mutator: (item) => {
//     item = item as Ability;
//     item.age = 3;
//     item.id = `${item.baseId}-${item.age}`;
//   },
// });

workaround("Fix age and add ability props for great_wall_buff", {
  predicate: (item) => item.type === "ability" && item.attribName === "great_wall_buff_chi",
  mutator: (item) => {
    item = item as Ability;
    item.age = 4;
    item.id = `${item.baseId}-${item.age}`;
    item.active = "always";
    item.auraRange = 0;
    item.costs = { ...NO_COSTS, popcap: 0 };
    item.unlockedBy = ["buildings/great-wall-gatehouse"];
    item.activatedOn = ["buildings/stone-wall"];
  },
});

workaround("Fix age and add missing info for spirit_way", {
  predicate: (item) => item.type === "ability" && item.attribName === "spirit_way",
  mutator: (item) => {
    item = item as Ability;
    item.age = 4;
    item.baseId = "ability-spirit-way";
    item.id = `${item.baseId}-${item.age}`;
    item.name = "Spirit Way Ancestors";
    item.description = "When a dynasty unit is killed, nearby units receive +20% attack speed and +20 health over 10 seconds.";
    item.icon = "https://data.aoe4world.com/images/buildings/spirit-way-3.png";
    item.unlockedBy = ["buildings/spirit-way"];
  },
});

workaround("Add Saints Blessing requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-saints-blessing",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["units/warrior-monk"];
  },
});

workaround("Add High Armory Bonus requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-high-armory-production-bonus",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/siege-workshop", "buildings/high-armory"];
    item.unlockedBy = ["buildings/high-armory"];
  },
});

workaround("Add Gallop requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-gallop",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["technologies/mounted-training"];
  },
});

workaround("Fix age and add missing info for kurultai_healing_aura_mon", {
  predicate: (item) => item.type === "ability" && item.attribName === "kurultai_healing_aura_mon",
  mutator: (item) => {
    item.age = 3;
    item.baseId = "ability-kurultai-aura";
    item.id = `${item.baseId}-${item.age}`;
    item.name = "Kurultai Aura";
    item.description = "Nearby units within its aura heal +1 health every 1 second and gain an additional +20% damage.";
    item.icon = "https://data.aoe4world.com/images/buildings/kurultai-2.png";
  },
});

workaround("Fix age and add missing info for Keshik", {
  predicate: (item) => item.type === "ability" && item.attribName === "lancer_healing_mon",
  mutator: (item) => {
    item.age = 2;
    item.id = `${item.baseId}-${item.age}`;
    item.name = "Keshik Healing";
  },
});

workaround("Set conditions for Trade Protection", {
  predicate: (item) => item.type === "ability" && item.id.includes("trade-protection"),
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/keep", "buildings/sea-gate-castle"];
    item.unlockedBy = ["buildings/sea-gate-castle"];
  },
});

workaround("Set Prosteletize conditions", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-proselytize",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["technologies/proselytization"];
  },
});

workaround("Add Artillery Shot requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-artillery-shot",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["buildings/college-of-artillery"];
  },
});

workaround("Add toggle group and requirements for Khan abilities", {
  predicate: (item) =>
    item.type === "ability" &&
    (item.attribName === "khan_maneuver_signal_arrow_mon" || item.attribName === "khan_attack_speed_signal_arrow_mon" || item.attribName === "khan_defensive_signal_arrow_mon"),
  mutator: (item) => {
    item = item as Ability;
    item.toggleGroup = "khan_signal_ability_available";
    item.activatedOn = ["units/khan"];
  },
});

workaround("Add requirements for Yam", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-yam",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/outpost"];
    item.unlockedBy = ["technologies/yam-network", "buildings/deer-stones"];
  },
});

workaround("Fix age and add missing info for Yam Network", {
  predicate: (item) => item.type === "ability" && item.attribName === "outpost_speed_improved_mon",
  mutator: (item) => {
    item = item as Ability;
    item.baseId = "ability-yam-network-improved";
    item.age = 2;
    item.id = `${item.baseId}-${item.age}`;
    item.name = "Yam Network (Improved)";
    item.auraRange = 12.5;
    item.active = "always";
    item.description = "Yam speed aura applies to all units instead of just Traders and cavalry units. Does not apply to siege engines.";
    item.costs = { ...NO_COSTS, popcap: 0 };
    item.activatedOn = ["buildings/outpost"];
    item.unlockedBy = ["technologies/yam-network-improved"];
  },
});

workaround("Fix age and add missing info for Camel Support", {
  predicate: (item) => item.type === "ability" && item.attribName === "camel_support_aura_abb",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["units/camel-rider", "units/camel-archer"];
    item.unlockedBy = ["technologies/camel-support"];
  },
});

workaround("Add ability info to Mehter speed formation", {
  predicate: (item) => item.type === "ability" && item.attribName === "mehter_default_formation_ott",
  mutator: (item) => {
    item = item as Ability;
    item.baseId = "ability-mehter-speed-bonus";
    item.id = `${item.baseId}-${item.age}`;
    item.auraRange = 6;
    item.active = "always";
    item.description = "Units move +15% faster when in formation.";
    item.costs = { ...NO_COSTS, popcap: 0 };
    item.activatedOn = ["units/mehter"];
    item.unlockedBy = ["technologies/mehter-drums"];
  },
});

workaround("Change names of Mehter abilities", {
  predicate: (item) => item.type === "ability" && !!item.attribName?.includes("mehter"),
  mutator: (item) => {
    item = item as Ability;
    item.baseId = item.baseId.replace("-off", "");
    item.id = `${item.baseId}-${item.age}`;
    item.name = item.name.replace(" (Off)", "");
    item.activatedOn = ["units/mehter"];
  },
});

workaround("Fix inaccurate ability info lancer_charge_bonus_damage", {
  predicate: (item) => item.type === "ability" && item.attribName === "lancer_charge_bonus_damage",
  mutator: (item) => {
    item = item as Ability;
    item.age = 2;
    item.id = `${item.baseId}-${item.age}`;
    item.description = "Gain +3 melee attack damage for 5 seconds after charging.";
    item.active = "always";
    item.costs = { ...NO_COSTS, popcap: 0 };
  },
});

workaround("Fix inaccurate ability info First Strike", {
  predicate: (item) => item.type === "ability" && item.attribName === "gbeto_ambush_buff_mal",
  mutator: (item) => {
    item = item as Ability;
    item.baseId = "ability-first-strike";
    item.age = 4;
    item.id = `${item.baseId}-${item.age}`;
    item.description = "Musofadi Warriors and Musofadi Gunners deal double damage on their first attack when breaking stealth.";
    item.active = "always";
    item.costs = { ...NO_COSTS, popcap: 0 };
    item.activatedOn = ["units/musofadi-warrior", "units/musofadi-gunner"];
    item.unlockedBy = ["buildings/fort-of-the-huntress"];
  },
});

workaround("Add requirements to Huntress' Stealth", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-huntress-stealth",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/fort-of-the-huntress"];
  },
});

workaround("Add requirements to Griot Bara Festivals", {
  predicate: (item) => item.type === "ability" && item.baseId.includes("festival") && item.civs.includes("ma"),
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["buildings/griot-bara"];
  },
});

workaround("Add requirements to Coastal Navigation", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-coastal-navigation",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/dock"];
  },
});

workaround("Fix inaccurate ability info inspired_infantry_hre", {
  predicate: (item) => item.type === "ability" && item.attribName === "inspired_infantry_hre",
  mutator: (item) => {
    item = item as Ability;
    item.baseId = "ability-inspired-warriors";
    item.age = 3;
    item.id = `${item.baseId}-${item.age}`;
    item.name = "Inspired Warriors";
    item.activatedOn = ["units/prelate"];
  },
});

workaround("Add requirements to Emergency Repair", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-emergency-repair",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["buildings/capital-town-center", "buildings/town-center", "buildings/elzbach-palace"];
  },
});

workaround("Fix id ability on dock garrison bonus", {
  predicate: (item) => item.type === "ability" && item.attribName === "relic_dock_bonus_hre",
  mutator: (item) => {
    item = item as Ability;
    item.baseId = "ability-relic-garrisoned-dock";
    item.age = 3;
    item.id = `${item.baseId}-${item.age}`;
    item.name = "Relic Garrisoned in Docks";
    // ability-relic-garrisoned contains both effects for Dock and Defensive structures, this splits them up
    item.effects = item.effects?.filter((e) => e.property === "attackSpeed");
  },
});

workaround("Fix id ability on land garrison bonus", {
  predicate: (item) => item.type === "ability" && item.attribName === "relic_tower_keep_bonus_hre",
  mutator: (item) => {
    item = item as Ability;
    item.baseId = "ability-relic-garrisoned-keep";
    item.age = 3;
    item.id = `${item.baseId}-${item.age}`;
    item.name = "Relic Garrisoned in Defensive Structures";
    // ability-relic-garrisoned contains both effects for Dock and Defensive structures, this splits them up
    item.effects = item.effects?.filter((e) => e.property !== "attackSpeed");
  },
});

workaround("Split French Town Center Production Bonus", {
  predicate: (item) => item.type === "ability" && item.attribName?.includes("town_center_production_age")!,
  mutator: (item) => {
    item = item as Ability;
    const age = +(item.attribName?.match(/age(\d)/)?.[1] ?? 1);
    const ageName = ["Dark", "Feudal", "Castle", "Imperial"][age - 1];
    item.baseId = `ability-town-center-production-speed-${ageName.toLowerCase()}-age`;
    item.age = age;
    item.id = `${item.baseId}-${age}`;
    item.name = `${ageName} Age Town Center Production Speed`;
    item.icon = `https://data.aoe4world.com/images/buildings/town-center.png`;
  },
});

workaround("Add Abbey Healing requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-abbey-healing",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/abbey-of-kings"];
  },
});

workaround("Add requirements to Network of Castles", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-network-of-castles",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = [
      "buildings/outpost",
      "buildings/stone-wall-tower",
      "buildings/town-center",
      "buildings/capital-town-center",
      "buildings/the-white-tower",
      "buildings/kings-palace",
      "buildings/keep",
      "buildings/berkshire-palace",
    ];
  },
});

workaround("Add requirements to Mill Influence", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-mill-influence",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/mill"];
  },
});

workaround("Fix missing info Golden Age Tier 1", {
  predicate: (item) => item.type === "ability" && item.attribName === "golden_age_tier_1",
  mutator: (item) => {
    item.baseId = "ability-golden-age-tier-1";
    item.id = `${item.baseId}-${item.age}`;
    item.description = "+15% Resource Gathering Rate";
    item.name = "Golden Age Tier 1";
    item.icon = "https://data.aoe4world.com/images/abilities/ability-golden-age-tier-1.png";
  },
});

workaround("Fix missing info Golden Age Tier 2", {
  predicate: (item) => item.type === "ability" && item.attribName === "golden_age_tier_2",
  mutator: (item) => {
    item.age = 1;
    item.baseId = "ability-golden-age-tier-2";
    item.id = `${item.baseId}-${item.age}`;
    item.description = "+15% Research Speed";
    item.name = "Golden Age Tier 2";
    item.icon = "https://data.aoe4world.com/images/abilities/ability-golden-age-tier-2.png";
  },
});

workaround("Fix missing info Golden Age Tier 3", {
  predicate: (item) => item.type === "ability" && item.attribName === "golden_age_tier_3",
  mutator: (item) => {
    item.age = 1;
    item.baseId = "ability-golden-age-tier-3";
    item.id = `${item.baseId}-${item.age}`;
    item.description = "+20% Production Speed, additional +5% Research Speed, additional +5% Resource Gathering Rate";
    item.name = "Golden Age Tier 3";
    item.icon = "https://data.aoe4world.com/images/abilities/ability-golden-age-tier-3.png";
  },
});

workaround("Set Medical Center requirements", {
  predicate: (item) => item.baseId === "ability-medical-centers",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["technologies/medical-centers"];
    item.description = "Heals nearby units for +2 health every 1 second";
  },
});

workaround("Remove Medical Center from Ayyubids", {
  predicate: (item) => item.civs[0] == "ay" && item.baseId === "ability-medical-centers" && item.civs.includes("ay"),
  mutator: (item) => {
    (item as any)._skip = true;
  },
});

workaround("Remove Extra Materials from any civs that's not China", {
  predicate: (item) => item.baseId === "ability-extra-materials" && item.civs[0] !== "ch",
  mutator: (item) => {
    (item as any)._skip = true;
  },
});

const jeanneHeroLevels = {
  1: ["jeanne-darc-peasant"],
  2: ["jeanne-darc-hunter", "jeanne-darc-woman-at-arms"],
  3: ["jeanne-darc-mounted-archer", "jeanne-knight"],
  4: ["jeanne-darc-markswoman", "jeanne-darc-blast-cannon"],
};

const jeanneHeroes = Object.values(jeanneHeroLevels).flat();

const jeanneReturnOfSaintCosts = {
  1: generateCosts({ gold: 100, popcap: 1 }),
  2: generateCosts({ gold: 250, popcap: 1 }),
  3: generateCosts({ gold: 500, popcap: 1 }),
  4: generateCosts({ gold: 1000, popcap: 1 }),
};

workaround("Set Jeanne buyback costs on heroes", {
  predicate: (item) => item.type === "unit" && jeanneHeroes.includes(item.baseId),
  mutator: (item) => {
    item = item as Ability;
    item.costs = jeanneReturnOfSaintCosts[Object.keys(jeanneHeroLevels).find((x) => jeanneHeroLevels[x].includes(item.baseId))!];
  },
});

workaround("Add 'Hero' class to Jeanne heroes", {
  predicate: (item) => item.type === "unit" && jeanneHeroes.includes(item.baseId),
  mutator: (item) => {
    item = item as Ability;
    item.displayClasses.push("Hero");
    item.classes.push("hero");
  },
});

workaround("Fix bad info in Coastal Navigation where this is only place where location string is used instead of integer in formatter_arguments", {
  predicate: (item) => item.type === "ability" && item.attribName === "docks_speed_bonus_mal",
  mutator: (item) => {
    item.description = "Ships near a Docks get +15% speed for 25 seconds.";
  },
});

workaround("Mark Consecrate as manual ability", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-consecrate",
  mutator: (item) => {
    item = item as Ability;
    item.active = "manual";
  },
});

workaround("Mark Divine Restoration as manual ability", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-divine-restoration",
  mutator: (item) => {
    item = item as Ability;
    item.active = "manual";
  },
});
const jeanneLevels = [
  ["ability-path-of-the-warrior", "ability-path-of-the-archer"],
  ["ability-champion-companions", "ability-rider-companions"],
  ["ability-field-commander", "ability-gunpowder-monarch"],
];
const jeanneLevelUps = jeanneLevels.flat();
workaround("Change Jeanne d'Arc Level Choices to Technology", {
  predicate: (item) => item.type === "ability" && jeanneLevelUps.includes(item.baseId),
  mutator: (item) => {
    item = item as Technology;
    item.type = "technology";

    const level = jeanneLevels.findIndex((x) => x.includes(item.baseId)) + 2;
    item.age = 0;
    item.baseId = item.baseId.replace("ability-", `level-${level}-`);
    item.displayClasses = ["Hero Level Up Choice"];
    item.classes = ["hero", "level-up-choice"];
    item.description = `Level ${level} option\n\n${item.description}\n\nRequires 500XP`;
    item.id = `${item.baseId}-${item.age}`;
  },
});

workaround("Set Jeanne d'Arc ability requirements", {
  predicate: (item) => item.type === "ability" && item.civs[0] == "je",
  mutator: (item) => {
    item = item as Ability;
    const required = {
      // "holy-wrath": ["level-2-path-of-the-warrior"],
      // "divine-arrow": ["level-2-path-of-the-archer"],
      // "divine-blast": ["level-2-path-of-the-archer"],
      // consecrate: ["level-2-path-of-the-warrior", "level-2-path-of-the-archer"],
      // "divine-restoration": ["level-2-path-of-the-warrior", "level-2-path-of-the-archer"],
      "to-arms-men": ["level-3-champion-companions"],
      "riders-ready": ["level-3-rider-companions"],
      "galvenize-the-righteous": ["level-3-champion-companions", "level-3-rider-companions"],
      "strength-of-heaven": ["level-4-field-commander"],
      "valorous-inspiration": ["level-4-gunpowder-monarch"],
    };

    const id = item.baseId.replace("ability-", "");
    if (Object.keys(required).includes(id)) {
      item.unlockedBy = required[id].map((x) => `technologies/${x}`);
      item.active = "manual";
    }
  },
});

workaround("Merge Elite Champion", {
  predicate: (item) => item.type === "unit" && item.baseId === "jeannes-elite-champion",
  mutator: (item) => {
    item.baseId = "jeannes-champion";
    item.id = `${item.baseId}-${item.age}`;
  },
});

workaround("Merge Elite Rider", {
  predicate: (item) => item.type === "unit" && item.baseId === "jeannes-elite-rider",
  mutator: (item) => {
    item.baseId = "jeannes-rider";
    item.id = `${item.baseId}-${item.age}`;
  },
});

workaround("Add auto upgrade info to companions", {
  predicate: (item) => item.type === "unit" && ["jeannes-champion", "jeannes-rider"].includes(item.baseId),
  mutator: (item) => {
    item.description += `\n\nUpgrades to Elite when Jeanne reaches level 4.`;
  },
});

// Set Dragon Fire Age to 3
workaround("Set Dragon Fire Age to 3", { ...overrideAge(["dragon-fire"], 3) });

workaround("Set Desert Raider abilities to manual", {
  predicate: (item) => item.type === "ability" && item.baseId.startsWith("ability-desert-raider"),
  mutator: (item) => {
    item = item as Ability;
    item.active = "manual";
  },
});

workaround("Fix missing info Ayyubid Golden Age Tiers", {
  predicate: (item) => item.type === "ability" && item.civs[0] === "ay" && item.attribName?.startsWith("golden_age_tier_")! && item.attribName?.endsWith("_ha_01")!,
  mutator: (item) => {
    item = item as Ability;
    const createEffects = (property: string, value: number, select: Selector) => [
      {
        property: "unknown",
        select,
        effect: "multiply",
        value,
        type: "influence",
      },
      {
        property: "unknown",
        select: { id: ["house-of-wisdom"] },
        effect: "change",
        value: 0,
        type: "ability",
      },
    ];
    const tier = item.attribName?.match(/tier_(\d)/)?.[1] ?? 1;
    const tiers = {
      1: { description: "10 Structures: Villager gathering rate +10% for all resources.", effects: createEffects("gatherRate", 1.1, { id: ["villager"] }) },
      2: { description: "20 Structures: Research Speeds +50%", effects: createEffects("researchSpeed", 1.5, { class: [["building"]] }) },
      3: { description: "30 Structures: Production Speeds +20%", effects: createEffects("productionSpeed", 1.2, { class: [["building"]] }) },
      4: { description: "50 Structures: Siege units cost 20% less resources to produce.", effects: createEffects("cost", 0.8, { class: [["siege"]] }) },
      5: { description: "75 Structures: Camel units attack 20% faster.", effects: createEffects("attackSpeed", 0.83, { id: ["camel-lancer", "desert-raider"] }) },
    } as const;

    item.name = `Golden Age Tier ${tier}`;
    item.baseId = `ability-golden-age-tier-${tier}`;
    item.id = `${item.baseId}-${item.age}`;
    item.description = tiers[tier].description;
    item.effects = tiers[tier].effects;
    item.unlockedBy = ["buildings/house-of-wisdom"];
    item.icon = `https://data.aoe4world.com/images/abilities/ability-golden-age-tier-${tier}.png`;
  },
});

workaround("Set Atabag Buff requirements", {
  predicate: (item) => item.type === "ability" && item.attribName === "production_building_enhance_abb",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["units/atabeg", "technologies/feudal-trade-wing-advisors"];
  },
});

workaround("Set Dervish Mass Heal requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-mass-heal",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["units/dervish"];
  },
});

workaround("Set Structural Reinforcement requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-structural-reinforcements",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["technologies/siege-carpentry"];
  },
});

workaround("Set Bedouin units requirements", {
  predicate: (item) => item.type === "unit" && ["bedouin-swordsman", "bedouin-skirmisher"].includes(item.baseId),
  mutator: (item) => {
    item = item as Unit;
    item.unlockedBy = ["technologies/feudal-trade-wing-bazaar", "technologies/castle-trade-wing-bazaar", "technologies/imperial-trade-wing-bazaar"];
    item.description += `\n\nRequires the Trade Wing - Bazaar`;
  },
});

workaround("Ayyubid House of Wisdom Wings", {
  predicate: (item) => item.civs[0] == "ay" && item.type === "technology" && item.baseId.includes("-wing-"),
  mutator: (item) => {
    if (item.classes.includes("ii")) item.age = 1;
    if (item.classes.includes("iii")) item.age = 2;
    if (item.classes.includes("iv")) item.age = 3;
    if (item.classes.includes("bonuses")) item.age = 4;
    item.baseId = ["", "feudal-", "castle-", "imperial-", "bonus-"][item.age] + item.baseId;
    const [wing, name] = item.name.split(": ");
    item.name = `${name}\n(${["", "Feudal", "Castle", "Imperial", "Bonus"][item.age]} ${wing})`;
    item.id = `${item.baseId}-${item.age}`;
  },
});

workaround("Make Military Affairs Bureau available from Feudal Age", {
  ...overrideAge(["military-affairs-bureau"], 2, ["zh"]),
});

workaround("Make Regional Inspection available from Castle Age", {
  ...overrideAge(["regional-inspection"], 3, ["zh"]),
});

workaround("Make Single Whip Reform available from Castle Age", {
  ...overrideAge(["single-whip-reform"], 3, ["zh"]),
});

workaround("Make Imperial Red Seals available from Imperial Age", {
  ...overrideAge(["imperial-red-seals"], 4, ["zh"]),
});

workaround("Temple of the sun toggle Abilities", {
  predicate: (item) => item.type === "ability" && item.civs[0] == "zx" && item.baseId.startsWith("ability-divine-"),
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/temple-of-the-sun"];
  },
});

// zx units imperial-guard and yuan-raider: Add to description "\n\n Requires Dynastic Protectors researched at Zhu Xi's Library."
workaround("Add requirements to Imperial Guard and Yuan Raider", {
  predicate: (item) => item.type === "unit" && ["imperial-guard", "yuan-raider"].includes(item.baseId),
  mutator: (item) => {
    item = item as Unit;
    item.description += `\n\nRequires Dynastic Protectors researched at Zhu Xi's Library.`;
  },
});

workaround("Set Body of Iron active to manual", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-body-of-iron",
  mutator: (item) => {
    item = item as Ability;
    item.active = "manual";
  },
});

workaround("Remove Ancient Techniques from Zhu Xi", {
  predicate: (item) => item.type === "technology" && item.civs[0] == "zx" && item.baseId === "ancient-techniques",
  mutator: (item) => {
    (item as any)._skip = true;
  },
});

// add select: { id: ['zhuge-nu', 'crossbow'] } to every effects on technology 10000-bolts
workaround("Set 10000 Bolts requirements", {
  predicate: (item) => item.type === "technology" && item.baseId === "10000-bolts",
  mutator: (item) => {
    item = item as Technology;
    item.effects = item.effects?.map((e) => ({ ...e, select: { id: ["zhuge-nu", "crossbow"] } }));
  },
});

// add 'cistern' to ability-akritoi-defense prdoucedBy, set activatedOn to buildings cistern-of-the-first-hill and cistern
workaround("Set Akritoi Defense requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-akritoi-defense",
  mutator: (item) => {
    item = item as Ability;
    item.producedBy.push("cistern");
    item.activatedOn = ["buildings/cistern-of-the-first-hill", "buildings/cistern"];
  },
});

// add cistern-of-the-first-hill to ability-automatic-pilgrim-flask-off activatedOn
workaround("Set Automatic Pilgrim Flask requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-automatic-pilgrim-flask-off",
  mutator: (item) => {
    item = item as Ability;
    item.name = item.name.split(" (")[0];
    item.activatedOn = ["buildings/cistern-of-the-first-hill"];
    item.baseId = "ability-automatic-pilgrim-flask";
    item.id = `${item.baseId}-${item.age}`;
  },
});

// remove last line from description of ability-pilgrim-flask and requirement to cistern-of-the-first-hill
workaround("Set Pilgrim Flask requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-pilgrim-flask",
  mutator: (item) => {
    item = item as Ability;
    item.description = item.description.split("\n")[0];
    item.unlockedBy = ["buildings/cistern-of-the-first-hill"];
  },
});

// Set border-settlements tech as requirement fro ability-border-settlement
workaround("Set Border Settlement requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-border-settlement",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["technologies/border-settlements"];
  },
});

// set ability-triumph activation on imperial-hippodrome
workaround("Set Triumph requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-triumph",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/imperial-hippodrome"];
    item.description = item.description.replace("damage by +25%", "damage by +4");
    item.auraRange = 0;
  },
});

// set ability-dialecticus, ability-conscriptio, ability-praesidium to be activatedOn cistern-of-the-first-hill
workaround("Set Dialecticus, Conscriptio, Praesidium requirements", {
  predicate: (item) => item.type === "ability" && ["ability-dialecticus", "ability-conscriptio", "ability-praesidium"].includes(item.baseId),
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/cistern", "buildings/cistern-of-the-first-hill"];
  },
});

// set ability-shield-wall-1 to manual
workaround("Set Shield Wall requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-shield-wall",
  mutator: (item) => {
    item = item as Ability;
    item.active = "manual";
  },
});

// ability-irrigated set activatedOn cistern and cistern of hill
// Villager gathering rate increased +???% by a nearby Cistern.

workaround("Set Irrigated requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-irrigated",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["buildings/cistern", "buildings/cistern-of-the-first-hill"];
    item.description = `Villager gathering rate increased by 5/10/15/20/25% (depening on water level)`;
  },
});

// ability-improved-torch set acitivatedOn to scout
workaround("Set Improved Torch requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-improved-torch",
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = ["units/scout"];
  },
});

// require Great Winery for ability-synergistic-crops
workaround("Set Synergistic Crops requirements", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-synergistic-crops",
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["buildings/grand-winery"];
  },
});

// chainge ability-oil-harvest description
workaround("Set Oil Harvest description to all modes", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-oil-harvest",
  mutator: (item) => {
    item = item as Ability;
    item.description =
      "Villagers generate +50% Olive Oil when gathering Food from Berry Bushes, +20% from Olive Groves, and +10% from Shore Fish. Fishing Boats generate +20% Olive Oil from fish.";
  },
});

// chainge ability-oil-commerce description
workaround("Set Oil Commerce description ", {
  predicate: (item) => item.type === "ability" && item.baseId === "ability-oil-commerce",
  mutator: (item) => {
    item = item as Ability;
    item.description = "Traders provide +20% Olive Oil on trades.";
  },
});

// change mercenary upgrades to technology
// veteran-mercenaries, elite-mercenaries
workaround("Set Mercenary Upgrades to technologies", {
  predicate: (item) => item.type === "upgrade" && ["veteran-mercenaries", "elite-mercenaries"].includes(item.baseId),
  mutator: (item) => {
    item = item as Technology;
    item.type = "technology";
    item.producedBy = ["mercenary-house", "golden-horn-tower"];
  },
});

workaround("Add Mercenary Contracts to mercenary House", {
  predicate: (item) => item.type === "technology" && item.baseId.endsWith("-mercenary-contract"),
  mutator: (item) => {
    item = item as Technology;
    item.producedBy = ["mercenary-house", "golden-horn-tower"];
  },
});

workaround("Fix Trapezites description", {
  predicate: (item) => item.type === "technology" && item.baseId === "trapezites",
  mutator: (item) => {
    item.description = "Scouts enhance the torch damage of nearby units by 25%";
  },
});

workaround("Remove Tower of The Sultan from Byzantines", {
  predicate: (item) => item.civs[0] == "by" && item.type === "unit" && item.baseId === "tower-of-the-sultan",
  mutator: (item) => {
    (item as any)._skip = true;
  },
});

workaround("Set Mercenary requirements", {
  predicate: (item) => item.type === "unit" && item.civs[0] == "by" && (item.attribName?.endsWith("_merc_byz")! || ["sipahi"].includes(item.baseId)),
  mutator: (item) => {
    item = item as Unit;

    const mercenaries: Record<string, [number, ItemSlug[]]> = {
      keshik: [2, ["technologies/eastern-mercenary-contract"]],
      ghulam: [3, ["technologies/eastern-mercenary-contract", "technologies/veteran-contract"]],
      "tower-elephant": [1, ["technologies/eastern-mercenary-contract", "technologies/elite-contract"]],
      longbowman: [5, ["technologies/western-mercenary-contract"]],
      landsknecht: [3, ["technologies/western-mercenary-contract", "technologies/veteran-contract"]],
      streltsy: [3, ["technologies/western-mercenary-contract", "technologies/veteran-contract"]],
      javelin: [4, ["technologies/silk-road-contract"]],
      "camel-rider": [2, ["technologies/silk-road-contract", "technologies/veteran-contract"]],
      grenadier: [2, ["technologies/silk-road-contract", "technologies/elite-contract"]],
      //roll 1
      "desert-raider": [3, ["buildings/trade-post"]],
      mangudai: [3, ["buildings/trade-post"]],
      // roll 2
      "royal-knight": [2, ["buildings/trade-post"]],
      "horse-archer": [3, ["buildings/trade-post", "technologies/veteran-contract"]],
      // roll 3
      sipahi: [3, ["buildings/trade-post"]],
      arbaletrier: [4, ["buildings/trade-post", "technologies/veteran-contract"]],
      // roll 4
      "war-elephant": [1, ["buildings/trade-post", "technologies/elite-contract"]],
      "zhuge-nu": [5, ["buildings/trade-post"]],
      // rol 5
      "camel-archer": [2, ["buildings/trade-post"]],
      "musofadi-warrior": [5, ["buildings/trade-post"]],
      // foreign-engineering-company
      "nest-of-bees": [1, ["buildings/foreign-engineering-company"]],
      "huihui-pao": [1, ["buildings/foreign-engineering-company"]],
      "royal-cannon": [1, ["buildings/foreign-engineering-company"]],
    };
    if (!Object.keys(mercenaries).includes(item.baseId)) return;
    const [count, unlockedBy] = mercenaries[item.baseId];
    item.unlockedBy = unlockedBy;
    // item.costs.popcap = item.costs.popcap! * count;
    // item.costs.oliveoil = item.costs.oliveoil! * count;
    if (count > 1) item.description += `\n\nMercenary that can be purchased per ${count} units for a total of ${item.costs.oliveoil! * count} Olive Oil.`;
    else item.description += `\n\nMercenary that can be purchased for ${item.costs.oliveoil!} Olive Oil.`;
    if (unlockedBy.includes("technologies/silk-road-contract")) item.description += `\n\nRequires the Silk Road Contract.`;
    else if (unlockedBy.includes("technologies/eastern-mercenary-contract")) item.description += `\n\nRequires the Eastern Mercenary Contract.`;
    else if (unlockedBy.includes("technologies/western-mercenary-contract")) item.description += `\n\nRequires the Western Mercenary Contract.`;
    if (unlockedBy.includes("buildings/trade-post"))
      item.description += `\n\nThis Mercenary can only be purchased on Mercenary Houses built near a neutral Trade Post that list this unit. The chance of this unit being available on a Trade Post is 20%.`;
  },
});

// –––– Unit weapons ––––

workaround("Remove daggers from ranged units", {
  predicate: (item) => item.type === "unit" && (item.classes.includes("ranged") || item.baseId == "janissary") && item.weapons.some((w) => w.name === "Dagger"),
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => w.name !== "Dagger");
  },
});

workaround("Remove spearwall attack from spearman, until we can nicely display secondary weapons", {
  predicate: (item) => item.type === "unit" && item.attribName!.includes("unit_spearman") && item.weapons.some((w) => w.name === "Spearwall"),
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => !["Spearwall", "Nagae Yari"].includes(w.name!));
  },
});

workaround("Remove palings and incendiary arrowfrom Longbowman, as they are behing an ability and until we can nicely display secondary weapons", {
  predicate: (item) => item.type === "unit" && item.baseId === "longbowman",
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => w.attribName?.startsWith("weapon_archer_") && w.type === "ranged");
  },
});

workaround("Remove melee attack from Streltsy, until we can nicely display secondary weapons", {
  predicate: (item) => item.type === "unit" && item.baseId === "streltsy",
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => w.type !== "melee");
  },
});

workaround("Remove charge attack from knights and lancers, until we can nicely display secondary weapons", {
  predicate: (item) => item.type === "unit" && ["knight", "royal-knight", "lancer"].includes(item.baseId),
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => !w.attribName!.includes("_charge"));
  },
});

workaround("Remove torch bonus vs siege from all units except villagers", {
  predicate: (item) => item.type === "unit" && !item.attribName?.includes("unit_villager") && item.weapons.some((w) => w.name === "Torch"),
  mutator: (item) => {
    item = item as Unit;
    item.weapons.find((w) => w.name === "Torch")!.modifiers = [];
  },
});

workaround("Remove all weapons but the knife and torch from the villagers, except English", {
  predicate: (item) => item.type === "unit" && item.baseId === "villager" && !item.civs.includes("en"),
  mutator: (item) => {
    item = item as Unit;
    const torch = item.weapons.find((w) => w.name === "Torch")!;
    const knife = item.weapons.find((w) => w.name === "Knife")!;
    item.weapons = [torch, knife];
  },
  validator: (item) => (item as Unit).weapons.length == 2,
});

workaround("Remove all weapons but the bow and torch from the English villager", {
  predicate: (item) => item.type === "unit" && item.baseId === "villager" && item.civs.includes("en"),
  mutator: (item) => {
    item = item as Unit;
    const bow = item.weapons.find((w) => w.attribName === "weapon_villager_militarized_2_eng")!;
    const torch = item.weapons.find((w) => w.name === "Torch")!;
    item.weapons = [bow, torch];
  },
  validator: (item) => (item as Unit).weapons.length == 2,
});

workaround("Remove all weapons except one melee from Scouts", {
  predicate: (item) => item.type === "unit" && (item.baseId === "scout" || item.attribName?.startsWith("unit_scout_")!),
  mutator: (item) => {
    item = item as Unit;
    item.weapons = [item.weapons.find((w) => w.type === "melee" && w.attribName?.startsWith("weapon_scout_"))!];
  },
  validator: (item) => (item as Unit).weapons.filter((w) => w.type == "melee" && w.damage > 0).length == 1,
});

workaround("Scout scaling", {
  predicate: (item) => item.type === "unit" && item.baseId !== "scout" && item.attribName?.startsWith("unit_scout_")!,
  mutator: (item) => {
    item = item as Unit;
    item.baseId = "scout";
    item.id = `scout-${item.age}`;
  },
});

workaround("Remove charge attack from Horseman and Ghazi Raider, except for mongols, who only have charge", {
  predicate: (item) => item.type === "unit" && ["horseman", "ghazi-raider"].includes(item.baseId),
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => !w.attribName!.includes("_charge") && !w.attribName!.includes("hippodrome_byz"));
  },
  validator: (item) => (item as Unit).weapons.filter((w) => w.type === "melee").length == 1,
});

workaround("Remove torch from Tower Elephant", {
  predicate: (item) => item.baseId == "tower-elephant",
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => w.attribName != "weapon_torch_elephant_archer_sul");
  },
});

workaround("Remove crossbow, archer and torch from Sultan's Elite Tower Elephant, set burst of 2 to Handcannoneers", {
  predicate: (item) => item.baseId == "sultans-elite-tower-elephant",
  mutator: (item) => {
    item = item as Unit;
    const handcannon = item.weapons.find((w) => w.attribName == "weapon_war_elephant_tower_handcannon_4_sul");
    handcannon!.burst = { count: 2 };
    item.weapons = [...item.weapons.filter((w) => w.type != "ranged" && w.type != "fire"), handcannon!];
  },
  validator: (item) => (item as Unit).weapons.length == 2,
});

workaround("Change the individuals cannons on Warships to just 1 with a burst of half the total cannons (one side)", {
  predicate: (item) => ["carrack", "xebec", "baochuan"].includes(item.baseId),
  mutator: (item) => {
    item = item as Unit;
    const cannons = item.weapons.filter((w) => w.attribName?.startsWith("weapon_naval_warship_cannon_"));
    const cannon = cannons[0]!;
    cannon.burst = { count: cannons.length / 2 };
    item.weapons = [cannon];
  },
  validator: (item) => (item as Unit).weapons.length == 1,
});

workaround("Remove the unused cannons and upgradable swivel cannon from Springald Ships, keep only one ballista", {
  predicate: (item) => ["hulk", "baghlah", "war-junk", "war-canoe", "lodya-attack-ship"].includes(item.baseId),
  mutator: (item) => {
    item = item as Unit;
    const ballista = item.weapons.find((w) => w.attribName?.includes("weapon_naval_combat_ship_springald"))!;
    item.weapons = item.weapons.filter((w) => !["weapon_naval_swivel_cannon", "weapon_naval_mounted_gun"].includes(w.attribName!));
    item.weapons = [ballista];
  },
  validator: (item) => (item as Unit).weapons.length == 1,
});

workaround("Remove the upgrade locked Javelin from the Hunting Canoe", {
  predicate: (item) => item.baseId == "hunting-canoe",
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => w.attribName != "weapon_naval_javelin_burst");
  },
  validator: (item) => (item as Unit).weapons.length == 1,
});

// This is both the most questionable and most effective way to ensure a simple
// weapon structure, removing any duplicates and keeping the first
// for units with volleys, the burst shoudld have been added in a workaround
workaround("Deduplicating unit weapons with the same name, keeping the first", {
  predicate: (item) => item.type === "unit" && item.weapons.length > 1,
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.reduce((wps, w) => {
      wps = wps.filter(Boolean);
      if (!wps.some((wp) => w.name == wp.name)) wps.push(w);
      return wps;
    }, [] as Unit["weapons"]);
  },
});

workaround("Modify King scaling to be more descriptive", {
  predicate: (item) => item.attribName?.startsWith("upgrade_abbey_king_") || false,
  mutator: (item) => {
    const base: Partial<Item> = {
      classes: ["king", "scaling", "technology"],
      displayClasses: ["King Scaling Technology"],
      icon: "https://data.aoe4world.com/images/units/king-2.png",
    };
    const castle: Partial<Item> = {
      id: "upgrade-king-3",
      baseId: "upgrade-king-3",
      name: "Castle Age King",
      description: "Increases the health, attack and armor of the King when reaching Castle Age.",
      age: 3,
    };
    const imperial: Partial<Item> = {
      id: "upgrade-king-4",
      baseId: "upgrade-king-4",
      name: "Imperial Age King",
      description: "Increases the health, attack and armor of the King when reaching Imperial Age.",
      age: 4,
    };
    Object.assign(item, base, item.attribName?.includes("_castle") ? castle : imperial);
    (item as Technology).effects?.forEach((e) => (e.select = { id: ["king"], class: [] }));
  },
});

workaround("Modify Militia cost to 20", {
  predicate: (item) => item.baseId == "militia",
  mutator: (item) => {
    item.costs = MILITIA_COSTS;
  },
});

workaround("Modify Militia scaling to be more descriptive", {
  predicate: (item) => item.attribName?.startsWith("upgrade_militia_") || false,
  mutator: (item) => {
    const base: Partial<Item> = {
      classes: ["Militia", "scaling", "technology"],
      displayClasses: ["Militia Scaling Technology"],
      icon: "https://data.aoe4world.com/images/units/militia-2.png",
    };
    const castle: Partial<Item> = {
      id: "upgrade-militia-3",
      baseId: "upgrade-miltia-3",
      name: "Castle Age Militia",
      description: "Increases the health, attack and armor of Militia when reaching Castle Age.",
    };
    const imperial: Partial<Item> = {
      id: "upgrade-militia-4",
      baseId: "upgrade-militia-4",
      name: "Imperial Age Militia",
      description: "Increases the health, attack and armor of Militia when reaching Imperial Age.",
    };
    Object.assign(item, base, item.age == 3 ? castle : imperial);
    (item as Technology).effects = (item as Technology).effects
      ?.filter((e) => ["meleeAttack", "hitpoints", "fireAttack"].includes(e.property))
      .map((e) => ({ ...e, select: { id: ["militia"] } }));
  },
});

workaround("Highlight Khaganate units", {
  predicate: (item) => item.type === "unit" && item.civs[0] == "mo" && item.attribName?.startsWith("unit_khaganate")!,
  mutator: (item) => {
    const spawnCount = KHAGANTE_SPAWN_COUNTS[item.baseId];
    item.description = `${item.description}\n\nRandomly spawns ${spawnCount > 1 ? `${spawnCount} at the time ` : ""}from the Khaganate Palace.`;
    item.age = 4;
    if (item.baseId != "huihui-pao") {
      item.name = `Khaganate ${item.name}`;
      item.id = `khaganate-${item.id}`;
      item.baseId = `khaganate-${item.baseId}`;
    }
    if (spawnCount > 1) (item as Unit).costs.popcap = spawnCount;
    item.classes.push("khaganate");
    item.displayClasses.push("Khaganate Unit");
  },
});

workaround("Remove Mongol lancer from Khaganate Palace (still lingering in attrib file)", {
  predicate: (item) => item.baseId == "lancer" && item.civs.includes("mo"),
  mutator: (item) => {
    item.producedBy = ["stable"];
    Object.freeze(item.producedBy);
  },
});

workaround("Remove china field constructed Siege Tower from Mongol tech tree (parsed from Khaganate Palace Guard)", {
  predicate: (item) => item.attribName === "unit_siege_tower_3_chi" && item.civs.includes("mo"),
  mutator: (item) => {
    (item as any)._skip = true;
  },
});

workaround("Apply Meinwerk 40% cost reduction bonus to unique meinwork technologies", {
  predicate: (item) => ["steel-barding", "riveted-chain-mail"].includes(item.baseId),
  mutator: (item) => {
    item.costs = discountCosts(item.costs, 0.6);
  },
});

workaround("Add Lumber Camp technologies to Japanese Kura Storehouse", {
  predicate: (item) =>
    item.civs.includes("ja") && (item.displayClasses[0]?.startsWith("Wood Gathering Technology") || item.displayClasses[0]?.startsWith("Woodcutting Technology")),
  mutator: (item) => {
    item.producedBy = ["kura-storehouse", "lumber-camp"];
    Object.freeze(item.producedBy);
  },
});

workaround("Add bannerman requirements", {
  predicate: (item) => item.type === "ability" && item.baseId.includes("bannerman-aura"),
  mutator: (item) => {
    item = item as Ability;
    item.activatedOn = [item.baseId.replace("ability-", "units/").replace("-aura", "") as any];
  },
});

workaround("Add Kabura-ya requirements", {
  predicate: (item) => item.type === "ability" && item.baseId.includes("kabura-ya"),
  mutator: (item) => {
    item = item as Ability;
    item.unlockedBy = ["technologies/kabura-ya-whistling-arrow"];
  },
});

workaround("Mention Shinobi heal passively in description", {
  predicate: (item) => item.type === "unit" && item.baseId === "shinobi",
  mutator: (item) => {
    item = item as Unit;
    item.description += `\n\nHeals passively.`;
  },
});

workaround("Modify Shinobi scaling to be more descriptive", {
  predicate: (item) => item.attribName?.startsWith("upgrade_unit_shinobi_") || false,
  mutator: (item) => {
    const base: Partial<Item> = {
      classes: ["shinobi", "scaling", "technology"],
      displayClasses: ["Shinobi Scaling Technology"],
      icon: "https://data.aoe4world.com/images/units/shinobi-2.png",
    };
    const castle: Partial<Item> = {
      id: "upgrade-shinobi-3",
      baseId: "upgrade-shinobi-3",
      name: "Castle Age Shinobi",
      description: "Increases the health and damage of Shinobi when reaching Castle Age.",
    };
    const imperial: Partial<Item> = {
      id: "upgrade-shinobi-4",
      baseId: "upgrade-shinobi-4",
      name: "Imperial Age Shinobi",
      description: "Increases the health and damage of of Shinobi when reaching Imperial Age.",
    };
    Object.assign(item, base, item.age == 3 ? castle : imperial);
    (item as Technology).effects = (item as Technology).effects
      ?.filter((e) => ["meleeAttack", "hitpoints", "fireAttack"].includes(e.property))
      .map((e) => ({ ...e, select: { id: ["shinobi"] } }));
  },
});

// –––– Misc –––– //

workaround("Change Mongol Superior Mobility type from upgrade to technology", {
  predicate: (item) => item.type === "upgrade" && item.attribName === "upgrade_unit_town_center_faster_packing_1_mon",
  mutator: (item) => {
    item = item as Technology;
    item.type = "technology";
    item.baseId = "superior-mobility";
    item.id = `${item.baseId}-${item.age}`;
  },
});

workaround("Give capital town centers unique id and clear name", {
  predicate: (item) => item.attribName!.startsWith("building_town_center_capital_"),
  mutator: (item) => {
    item.name = "Capital Town Center";
    item.costs = NO_COSTS;
    item.baseId = "capital-town-center";
    item.id = "capital-town-center-1";
  },
});

workaround("Remove costs from Mongol Khan", {
  predicate: (item) => item.baseId === "khan",
  mutator: (item) => {
    const { time } = item.costs;
    item.costs = { ...NO_COSTS, time };
  },
});

workaround("Rename Malian Scout to Warrior Scout", {
  predicate: (item) => item.civs.includes("ma") && item.baseId === "scout" && item.age > 1,
  mutator: (item) => {
    item.baseId = "warrior-scout";
    item.id = `${item.baseId}-${item.age}`;
  },
});

workaround("Prefix Malian Scout to Warrior Scout upgrade id so it does not clash with the Warrior Scout Unit", {
  predicate: (item) => item.type === "upgrade" && item.attribName === "upgrade_unit_scout_mal_2",
  mutator: (item) => {
    item = item as Upgrade;
    item.baseId = "upgrade-warrior-scout";
    item.id = `${item.baseId}-${item.age}`;
  },
});

// –––– Civ Bonuses –––– //

workaround("French Civ Bonus: 'Economic technology 30% cheaper.'", {
  predicate: (item) => item.civs.includes("fr") && item.attribName!.startsWith("upgrade_econ_"),
  mutator(item) {
    item.costs = discountCosts(item.costs, 0.7);
  },
});

workaround("French Civ Bonus: 'Faster Villager and Scout production per Age (10%, 10%, 15%, 20%).'", {
  predicate: (item) => item.civs.includes("fr") && (item.baseId === "villager" || item.baseId === "scout"),
  mutator(item) {
    if (item.age === 1) item.costs.time = Math.ceil(item.costs.time / (1 + 0.1));
    if (item.age === 2) item.costs.time = Math.ceil(item.costs.time / (1 + 0.1));
    if (item.age === 3) item.costs.time = Math.ceil(item.costs.time / (1 + 0.15));
    if (item.age === 4) item.costs.time = Math.ceil(item.costs.time / (1 + 0.2));
  },
});

workaround("French Civ Bonus: 'Melee damage techs are researched for free.'", {
  predicate: (item) => item.civs.includes("fr") && item.attribName!.startsWith("upgrade_melee_damage"),
  mutator(item) {
    item.costs = NO_COSTS;
  },
});

workaround("English Civ Bonus: 'Naval units are 10% cheaper.'", {
  predicate: (item) => item.civs.includes("en") && item.attribName!.startsWith("unit_naval_"),
  mutator(item) {
    item.costs = discountCosts(item.costs, 0.9);
  },
});

workaround("Chinese Civ Bonus: 'Villagers construct defenses 50% faster and all other buildings 100% faster.'", {
  predicate: (item) => item.civs.includes("ch") && item.attribName!.startsWith("building_") && !["stone-wall", "palisade-wall", "keep", "outpost"].includes(item.baseId), // walls have a custom balanced build time set
  mutator(item) {
    if (item.attribName!.startsWith("building_defense_")) item.costs.time = Math.ceil(item.costs.time / (1 + 0.5));
    else item.costs.time = Math.ceil(item.costs.time / (1 + 1));
  },
});

workaround("Chinese Civ Bonus: 'Docks work 20% faster.'", {
  predicate: (item) => item.civs.includes("ch") && item.attribName!.startsWith("unit_naval_"),
  mutator(item) {
    item.costs.time = Math.ceil(item.costs.time / (1 + 0.2));
  },
});

workaround("Chinese Civ Bonus: 'Chemistry technology granted for free when advancing to the Imperial Age (IV).'", {
  predicate: (item) => item.civs.includes("ch") && item.attribName!.startsWith("upgrade_siege_chemistry"),
  mutator(item) {
    item.costs = NO_COSTS;
  },
});

workaround("HRE Civ Bonus: 'Cost of emplacements on Outposts, Wall Towers, and Keeps reduced by 25%.':", {
  predicate: (item) => item.civs.includes("hr") && item.displayClasses?.includes("Weapon Emplacement"),
  mutator(item) {
    item.costs = discountCosts(item.costs, 0.75);
  },
});

const MILITIA_COSTS = generateCosts({ food: 20 });

function discountCosts(costs: Item["costs"], discount: number) {
  const newCosts = {
    food: Math.ceil(costs.food * discount),
    wood: Math.ceil(costs.wood * discount),
    stone: Math.ceil(costs.stone * discount),
    gold: Math.ceil(costs.gold * discount),
  };
  return {
    ...costs,
    ...newCosts,
    total: newCosts.gold + newCosts.wood + newCosts.food + newCosts.stone,
    popcap: costs.popcap,
    time: costs.time,
  };
}

function generateCosts(costs: Partial<Item["costs"]>, addTo: Item["costs"] = NO_COSTS) {
  const newCosts = Object.entries(addTo).reduce((acc, [key, value]) => ({ ...acc, [key]: value + (costs[key] || 0) }), {} as Item["costs"]);
  newCosts.total = newCosts.gold + newCosts.wood + newCosts.food + newCosts.stone + (newCosts.oliveoil ?? 0);
  return newCosts;
}

function overrideAge(ids: string[], age: number, civs?: string[]) {
  return {
    predicate: (item) => ids.includes(item.baseId) && (!civs || item.civs.some((c) => civs.includes(c))),
    mutator(item) {
      item.age = age;
      item.id = item.id.split("-").slice(0, -1).join("-") + "-" + age;
    },
  };
}

interface Override {
  predicate: (item: ItemType) => boolean;
  mutator: (item: ItemType) => void;
  validator?: (item: ItemType) => boolean;
}

function workaround(description: string, override: Override) {
  workarounds.set(description, override);
}

console.log(`Total workarounds: ${workarounds.size}`);
export { workarounds };
