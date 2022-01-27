import { civAbbr } from "./civs";

type ItemClass = "light" | "heavy" | "infantry" | "cavalry" | "naval" | "ranged" | "siege" | "melee" | "fire";

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

type Object = Item & {
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

type Weapon = {
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

type Modifier = {
  property: ModifyableProperty;
  target: { class: ItemClass[]; id: ItemId[] };
  effect: "multiply" | "increase" | "decrease";
  value: number;
};

export type Armor = {
  type: "melee" | "ranged" | "fire";
  value: number;
};

type ItemId = string;

type ModifyableProperty =
  | "hitpoints"
  | "meleeArmor"
  | "rangedArmor"
  | "fireArmor"
  | "moveSpeed"
  | "attackSpeed"
  | "minRange"
  | "maxRange"
  | "heightOfSight"
  | "lineOfSight"
  | "carryCapacity"
  | "foodCost"
  | "foodGatherRate"
  | "goldCost"
  | "goldGatherRate"
  | "stoneCost"
  | "stoneGatherRate"
  | "woodCost"
  | "woodGatherRate"
  | "populationCost"
  | "buildTime";
