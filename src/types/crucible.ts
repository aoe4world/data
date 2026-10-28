import { CivSlug } from "./civs";

export interface CruciblePerkLevel {
  level: number;
  favorCost: number;
  pbgid: number;
  attribName: string;
  effect?: string;
  description?: string;
}

export interface CruciblePerk {
  index: number;
  id: string;
  baseId: string;
  name: string;
  attribName: string;
  pbgid: number;
  description: string;
  icon: string;
  levels: CruciblePerkLevel[];
}

export interface CrucibleTalentLevel {
  level: number;
  talent_points: number;
  name: string;
  pbgid: number;
  attribName: string;
  description?: string;
}

export interface CrucibleCivTalents {
  civ: CivSlug;
  talents: CrucibleTalentLevel[];
}

export interface CrucibleBoonTier {
  index: number;
  tier: number;
  isAscended: boolean;
  id: string;
  attribName: string;
  pbgid: number;
  description: string;
}

export interface CrucibleBoon {
  id: string;
  baseId: string;
  name: string;
  attribName: string;
  category: "standard" | "epic" | "cursed";
  categoryWeight: number;
  weight: number;
  icon: string;
  index: number;
  tiers: CrucibleBoonTier[];
}

export interface CrucibleMutator {
  index: number;
  id: string;
  baseId: string;
  name: string;
  attribName: string;
  pbgid: number;
  action_pbgid?: number;
  description: string;
  durability: number;
  icon: string;
}
