import { civAbbr } from "./civs";

export type StandardUnitFormat = {
  id: string;
  baseId: string;

  name: string;
  age: number;

  description: string;

  icon?: string;

  civs: civAbbr[];

  class: string;
  classes: string[];
  unique: boolean;

  producedBy: string[];

  costs: {
    food: number;
    wood: number;
    gold: number;
    stone: number;
    time: number;
    popcap: number;
    total: number;
  };

  hitpoints: number;

  movement: {
    speed: number;
  };
  attack: {
    ranged: number;
    melee: number;
    siege: number;
    fire: number;

    speed: number;
    dps: number;
  };

  range: {
    min: number;
    max: number;
  };

  vision: {
    lineOfSight: number;
    heightOfSight: number;
  };

  armor: {
    melee: number;
    ranged: number;
    fire: number;
  };
};
