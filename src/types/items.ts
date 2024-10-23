import { CivAbbr, ItemSlug } from "../sdk/utils";

export type ItemClass =
  | "light"
  | "heavy"
  | "infantry"
  | "cavalry"
  | "ship"
  | "archer"
  | "springald"
  | "attack"
  | "incendiary"
  | "warship"
  | "ranged"
  | "siege"
  | "melee"
  | "fire"
  | "religious"
  | "gunpowder"
  | "structure"
  | "building"
  | "transport"
  | "support"
  | "wall"
  | "tower"
  | "gate"
  | "landmark"
  | "wonder"
  | "military"
  | "technology"
  | "hunt"
  | "defensive"
  | "worker"
  | string;

export interface Item {
  id: ItemId;
  baseId: ItemId;
  type: "unit" | "building" | "technology" | "upgrade" | "ability";
  civs: CivAbbr[];
  classes: ItemClass[];
  displayClasses: string[];

  name: string;
  age: number;

  description: string;
  icon_src?: string;
  icon?: string;

  unique: boolean;

  producedBy: string[];

  costs: {
    food: number;
    wood: number;
    gold: number;
    stone: number;
    oliveoil?: number;
    vizier?: number;
    time: number;
    popcap?: number;
    total: number;
  };

  pbgid?: number;
  attribName?: string;
}

export interface PhysicalItem extends Item {
  weapons: Weapon[];
  armor: Armor[];

  hitpoints: number;

  sight: {
    line: number;
    height: number;
  };

  garrison?: {
    capacity: number;
    classes: string[];
  };

  unlockedBy?: ItemSlug[];
}

export interface Unit extends PhysicalItem {
  type: "unit";
  movement: {
    speed: number;
  };
}

// Todo, may add material properties, units/objects that can be garrisoned, etc.
export interface Building extends PhysicalItem {
  type: "building";
  influences?: string[];
  popcapIncrease?: number;
}

export interface Technology extends Item {
  type: "technology";
  effects?: Modifier[];
}

export interface Upgrade extends Item {
  type: "upgrade";
  unlocks: ItemId;
}

export interface Weapon {
  name?: string;
  id?: ItemId;
  type: "melee" | "charge" | "ranged" | "siege" | "fire";
  damage: number;
  speed: number;
  modifiers?: Modifier[];
  range?: {
    min: number;
    max: number;
  };
  durations?: Record<string, number>;
  burst?: { count: number };
  attribName?: string;
  pbgid?: number;
}

export interface Ability extends Item {
  type: "ability";
  active?: "always" | "manual" | "toggle";
  auraRange?: number;
  cooldown?: number;
  toggleGroup?: string;
  effects?: Modifier[];
  unlockedBy?: ItemSlug[];
  activatedOn?: ItemSlug[];
}

export type Selector = { class?: ItemClass[][]; id?: ItemId[] };

export type Modifier = {
  property: ModifyableProperty;
  target?: Selector;
  select?: Selector;
  effect: "multiply" | "change";
  value: number;
  type: "passive" | "ability" | "influence" | "bonus";
  duration?: number;
};

export type Armor = {
  type: "melee" | "ranged" | "fire";
  value: number;
};

export type ItemId = string;

export type ItemType = Building | Unit | Technology | Upgrade | Ability;

export type ModifyableProperty =
  | "unknown" // Complex effects not easily incoded in buffed stats
  | "burst"
  | "hitpoints"
  | "meleeArmor"
  | "rangedArmor"
  | "meleeAttack"
  | "rangedAttack"
  | "siegeAttack"
  | "fireAttack"
  | "fireArmor"
  | "moveSpeed"
  | "attackSpeed"
  | "minRange"
  | "maxRange"
  | "heightOfSight"
  | "lineOfSight"
  | "carryCapacity"
  | "huntGatherRate"
  | "huntCarryCapacity"
  | "foodCost"
  | "foodGatherRate"
  | "goldCost"
  | "goldGatherRate"
  | "goldGeneration"
  | "stoneCost"
  | "stoneGatherRate"
  | "woodCost"
  | "woodGatherRate"
  | "berryGatherRate"
  | "farmGatherRate"
  | "populationCost"
  | "healingRate"
  | "repairRate"
  | "maxPopulation"
  | "buildTime"
  | "productionSpeed"
  | "researchSpeed"
  | "areaOfEffect";

export interface UnifiedItem<T extends Item = Item> {
  id: ItemId;
  name: string;
  civs: CivAbbr[];
  unique: boolean;
  variations: T[];
  type: T["type"];
  minAge: number;
  classes: ItemClass[];
  displayClasses: string[];
  icon?: string;
  description?: string;
}

export enum ITEMS {
  UNITS = "units",
  BUILDINGS = "buildings",
  TECHNOLOGIES = "technologies",
  UPGRADES = "upgrades",
}

export type ItemTypes = {
  [ITEMS.UNITS]: Unit;
  [ITEMS.TECHNOLOGIES]: Technology;
  [ITEMS.BUILDINGS]: Building;
  [ITEMS.UPGRADES]: Upgrade;
};
