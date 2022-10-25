import { Building, Item, ItemType, Technology, Unit } from "../../types/items";

const workarounds = new Map<string, Override>();

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

workaround("Increase the Berkshire Palace range, and double set the garrison burst to 6", {
  predicate: (item) => item.baseId === "berkshire-palace",
  mutator: (item) => {
    item = item as Building;
    const bow = item.weapons.find((x) => x.name === "Bow")!;
    bow.burst = { count: 6 };
    bow.range!.max = bow.range!.max * 2;
    item.weapons = [bow];
  },
  validator: (item) => (item as Building).weapons.filter((w) => w.type == "ranged" && w.burst?.count == 6 && w.range?.max == 16).length == 1,
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

workaround("Make English and HRE Hulk available from Castle Age", {
  ...overrideAge(["hulk"], 3, ["en", "hr"]),
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

workaround("Make Abbasid Teak Masts available from Castle Age", {
  ...overrideAge(["teak-masts"], 3, ["ab"]),
});

workaround("Make Delhi Village Fortresses available from Castle Age", {
  ...overrideAge(["village-fortress"], 3, ["de"]),
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
    item.weapons = item.weapons.filter((w) => w.name !== "Spearwall");
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
  predicate: (item) => item.type === "unit" && item.baseId === "scout",
  mutator: (item) => {
    item = item as Unit;
    item.weapons = [item.weapons.find((w) => w.type === "melee" && w.attribName?.startsWith("weapon_scout_"))!];
  },
  validator: (item) => (item as Unit).weapons.filter((w) => w.type == "melee" && w.damage > 0).length == 1,
});

workaround("Remove charge attack from Horseman, except for mongols, who only have charge", {
  predicate: (item) => item.type === "unit" && item.baseId === "horseman",
  mutator: (item) => {
    item = item as Unit;
    item.weapons = item.weapons.filter((w) => !w.attribName!.endsWith("_charge"));
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
    const ballista = item.weapons.find((w) => w.attribName == "weapon_naval_combat_ship_springald")!;
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
      if (!wps.some((wp) => w.name == wp.name)) wps.push(w);
      return wps;
    }, [] as Unit["weapons"]);
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
  predicate: (item) => item.civs.includes("ch") && item.attribName!.startsWith("building_"),
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
  predicate: (item) => item.civs.includes("hr") && item.displayClasses.includes("Weapon Emplacement"),
  mutator(item) {
    item.costs = discountCosts(item.costs, 0.75);
  },
});

const NO_COSTS = { gold: 0, wood: 0, food: 0, stone: 0, total: 0, time: 0 };

function discountCosts(costs: Item["costs"], discount: number) {
  const newCosts = {
    gold: Math.ceil(costs.gold * discount),
    wood: Math.ceil(costs.wood * discount),
    food: Math.ceil(costs.food * discount),
    stone: Math.ceil(costs.stone * discount),
  };
  return {
    ...newCosts,
    total: newCosts.gold + newCosts.wood + newCosts.food + newCosts.stone,
    time: costs.time,
  };
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
