import { civAbbr } from "./civs";

export type ItemClass =
  | "light"
  | "heavy"
  | "infantry"
  | "cavalry"
  | "naval"
  | "ranged"
  | "siege"
  | "melee"
  | "fire"
  | "structure"
  | "transport"
  | "support"
  | "wall"
  | "tower"
  | "gate";

export type Item = {
  id: ItemId;
  baseId: ItemId;
  type: "unit" | "structure" | "technology" | "upgrade";
  civs: civAbbr[];
  classes: ItemClass[];

  name: string;
  age: number;

  description: string;
  icon?: string;

  unique: boolean;

  producedBy: string[];

  costs: {
    food: number;
    wood: number;
    gold: number;
    stone: number;
    time: number;
    popcap?: number;
    total: number;
  };
};

export type Object = Item & {
  weapons: Weapon[];
  armor: Armor[];

  hitpoints: number;

  sight: {
    line: number;
    height: number;
  };
};

export type Unit = Object & {
  type: "unit";
  movement: {
    speed: number;
  };
};

// Todo, may add material properties, units/objects that can be garrisoned, etc.
export type Structure = Object & {
  type: "structure";
  garrison?: {
    capacity: number;
  };
};

export type Technology = Item & {
  type: "technology";
  effects?: Modifier;
};

export type Upgrade = Item & {
  type: "upgrade";
  unlocks: ItemId;
};

export type Weapon = {
  id?: ItemId;
  type: "melee" | "charge" | "ranged" | "siege" | "fire";
  damage: number;
  speed: number;
  modifiers?: Modifier[];
  range?: {
    min: number;
    max: number;
  };
};

export type Modifier = {
  property: ModifyableProperty;
  target?: { class?: ItemClass[][]; id?: ItemId[] };
  select?: { class?: ItemClass[][]; id?: ItemId[] };
  effect: "multiply" | "change";
  value: number;
  type: "passive" | "ability" | "influence";
};

export type Armor = {
  type: "melee" | "ranged" | "fire";
  value: number;
};

export type ItemId = string;

export type ModifyableProperty =
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
  | "stoneCost"
  | "stoneGatherRate"
  | "woodCost"
  | "woodGatherRate"
  | "populationCost"
  | "healingRate"
  | "repairRate"
  | "buildTime";

export type UnifiedItem<T extends Item = Item> = {
  id: ItemId;
  name: string;
  civs: civAbbr[];
  variations: T[];
  classes: ItemClass[];
  icon?: string;
  description?: string;
};
