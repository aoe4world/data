/** A configuration of technology ids and their modiying effects. */

import { Modifier } from "../types/items";

// Common class/id presets
const common = {
  allMeleeUnitsExceptSiege: { class: [["melee"]] } as Modifier["select"],
  allNonSiegeUnits: { class: [["infantry"], ["cavalry"]] } as Modifier["select"],
  allRangedUnitsAndBuildingsExceptSiege: {
    class: [
      ["ranged", "cavalry"],
      ["archer", "ship"],
    ],
    id: ["longbowman", "zhuge-nu", "archer", "arbaletrier", "crossbowman"],
  } as Modifier["select"],
  allMillitaryShips: { class: [["ship", "springald"], ["ship", "archer"], ["ship", "incendiary"], ["warship"]], id: ["galleass", "grand-galley"] } as Modifier["select"],
  allKeepLikeLandmarks: { id: ["berkshire-palace", "elzbach-palace", "kremlin", "spasskaya-tower", "red-palace", "the-white-tower"] },
  allReligiousUnits: { id: ["prelate", "monk", "scholar", "shaman", "imam", "warrior-monk"] } as Modifier["select"],
  allFishingShips: { id: ["fishing-boat", "lodya-fishing-boat"] } as Modifier["select"],
};

const increaseByPercent = (n: number, percent: number) => round(n * (1 + Math.abs(percent) / 100));
const decreaseByPercent = (n: number, percent: number) => round(n * (1 - Math.abs(percent) / 100));
const increaseByPercentImproved = (n: number, percent: number, delta: number) => round((n * (1 + Math.abs(percent) / 100)) / (1 + (Math.abs(percent) - Math.abs(delta)) / 100));
const decreaseByPercentImproved = (n: number, percent: number, delta: number) => round((n * (1 - Math.abs(percent) / 100)) / (1 - (Math.abs(percent) - Math.abs(delta)) / 100));
const increaseSpeedByPercent = (speed: number, percent: number) => round(speed / (1 + percent / 100) / 10) * 10;
const round = (n: number) => Math.round(n * 100) / 100;

export const technologyModifiers: Record<string, (values: number[]) => Modifier[]> = {
  "arrow-volley": ([increase]) => [
    // Longbowmen gain Arrow Volley, an activated ability that increases Longbowmen attack speed by +70%.
    {
      property: "attackSpeed",
      select: { id: ["longbowman"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, increase),
      type: "ability",
    },
  ],

  "steeled-arrow": ([d]) => [
    // Increase the ranged damage of all non-siege units and buildings by +1.
    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "balanced-projectiles": ([d]) => [
    // Increase the ranged damage of all non-siege units and buildings by +1.
    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "platecutter-point": ([d]) => [
    // Increase the ranged damage of all non-siege units and buildings by +1.

    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "iron-undermesh": ([a]) => [
    // Increase the ranged armor of all non-siege units by +1.

    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  "wedge-rivets": ([a]) => [
    // Increase the ranged armor of all non-siege units by +1.

    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ],
  "angled-surfaces": ([a]) => [
    // Increase the ranged armor of all non-siege units by +1.
    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  "fitted-leatherwork": ([a]) => [
    // Increase the melee armor of all non-siege units by +1.

    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  "insulated-helm": ([a]) => [
    // Increase the melee armor of all non-siege units by +1.

    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  "master-smiths": ([a]) => [
    // Increase the melee armor of all non-siege units by +1.
    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  bloomery: ([d]) => [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "damascus-steel": ([d]) => [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  decarbonization: ([d]) => [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "military-academy": ([i]) => [
    // Increase the production speed of infantry, cavalry, siege, and transport units at buildings by 33%.
    // Does not affect religious units or other support units.
    {
      property: "buildTime",
      select: { class: [["infantry"], ["melee", "cavalry"], ["ranged", "cavalry"], ["siege"], ["transport"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
  ],

  "military-academy-improved": ([reduction, additional]) => [
    // Reduce the time it takes to produce infantry, cavalry, siege, and transport units at buildings by -35%.
    // Does not affect religious units or other support units.
    // If Military Academy has already been researched, reduce the time by  -10% instead.
    {
      property: "buildTime",
      select: { class: [["infantry"], ["melee", "cavalry"], ["ranged", "cavalry"], ["siege"], ["transport"]] },
      effect: "multiply",
      value: decreaseByPercentImproved(1, reduction, additional),
      type: "passive",
    },
  ],

  /// Common economic tecnologies ––––––––––––––––––––––––––––––––––––

  "crosscut-saw": ([i]) => [
    // Increase Villagers' gathering rate for Wood by +15%.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "crosscut-saw-improved": ([i, d]) => [
    //  Increase Villagers' gathering rate for Wood by +20%.
    // If Crosscut Saw has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  cupellation: ([i]) => [
    // Increase Villagers' gathering rate for Gold and Stone by +15%.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "cupellation-improved": ([i, d]) => [
    //  ncrease Villagers' gathering rate for Gold by +20%.
    // If Cupellation has already been researched, increase it by + 5 % instead.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  "double-broadax": ([i]) => [
    // Increase Villagers' gathering rate for Wood by +15%.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "double-broadax-improved": ([i, d]) => [
    // Increase Villagers' gathering rate for Wood by +20%.
    // If Double Broadaxe has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  "drift-nets": ([r, c, s]) => [
    // Increase the gathering rate of Fishing Ships by +15%, carry capacity by +20 and move speed by +10%.
    {
      property: "foodGatherRate",
      select: common.allFishingShips,
      effect: "multiply",
      value: increaseByPercent(1, r),
      type: "passive",
    },
    {
      property: "carryCapacity",
      select: common.allFishingShips,
      effect: "change",
      value: c,
      type: "passive",
    },
    {
      property: "moveSpeed",
      select: common.allFishingShips,
      effect: "multiply",
      value: increaseByPercent(1, s),
      type: "passive",
    },
  ],

  "extended-lines": ([i, c]) => [
    // Increase the gathering rate of Fishing Ships by +20% and their carry capacity by  +10.
    {
      property: "foodGatherRate",
      select: common.allFishingShips,
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "carryCapacity",
      select: common.allFishingShips,
      effect: "change",
      value: c,
      type: "passive",
    },
  ],

  horticulture: ([i]) => [
    // Increase Villagers' gathering rate for Food by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "horticulture-improved": ([i, d]) => [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Horticulture has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  fertilization: ([i]) => [
    // Increase Villagers' gathering rate for Food by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "fertilization-improved": ([i, d]) => [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Fertilization has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  forestry: ([]) => [
    // Double the rate at which Villagers chop down trees.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "forestry-improved": ([]) => [
    // Villagers fell trees in a single chop.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 4, // ??
      type: "passive",
    },
  ],

  "acid-distillation": ([i]) => [
    // Increase Villagers' gathering rate for Gold and Stone by +15%.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "acid-distillation-improved": ([i, d]) => [
    // Increase Villagers' gathering rate for Gold by +20%.
    // If Acid Distillation has already been researched, increase it by + 5 % instead.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  "specialized-pick": ([i]) => [
    // Increase Villagers' gathering rate for Gold and Stone by +15%.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "specialized-pick-improved": ([i, d]) => [
    // Increase Villagers' gathering rate for Gold by +20%.
    // If Specialized Pick has already been researched, increase it by + 5 % instead.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  "survival-techniques": ([i]) => [
    // Increase Villagers' hunted meat gather rate by  +15%.
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "survival-techniques-improved": ([i, d]) => [
    // Increase Villagers' hunted meat gather rate by +20%.
    // If Survival Techniques has already been researched, increase hunted meat gather rate by +5% instead.
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  wheelbarrow: ([c, s]) => [
    // Increase the carry capacity of Villagers by +5 and their movement speed by  +15%.
    {
      property: "carryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: c,
      type: "passive",
    },
    {
      property: "moveSpeed",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, s),
      type: "passive",
    },
  ],

  "wheelbarrow-improved": ([c, s, d]) => [
    // Increase Villagers' resource carry capacity by +7 and movement speed by  +15%.
    // If Wheelbarrow has already been researched, increase carry capacity by + 2 instead.
    {
      property: "carryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "lumber-preservation": ([i]) => [
    // Increase Villagers' gathering rate for Wood by +15%.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "lumber-preservation-improved": ([i, d]) => [
    // Increase Villagers' gathering rate for Wood by +20%.
    // If Lumber Preservation has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  "precision-cross-breeding": ([i]) => [
    // Increase Villagers' gathering rate for Food by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "precision-cross-breeding-improved": ([i, d]) => [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Precision Crossbreeding has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  "ancient-techniques": ([i]) => [
    // Increase the gathering rate of Villagers by +5% for each dynasty achieved.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  /// Unit technologies –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  "setup-camp": ([h]) => [
    // Longbowmen gain the ability to Setup Camp, which heals them for +1 health every 1 seconds.
    {
      property: "healingRate",
      select: { id: ["longbowman"] },
      effect: "change",
      value: h,
      type: "ability",
    },
  ],

  "armor-clad": ([a]) => [
    // Increase the ranged and melee armor of Men-at-Arms by +2.
    {
      property: "rangedArmor",
      select: { id: ["man-at-arms"] },
      effect: "change",
      value: a,
      type: "passive",
    },
    {
      property: "meleeArmor",
      select: { id: ["man-at-arms"] },
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  enclosures: ([g, s]) => [
    // Each Farm Enclosure being worked by a Villager generates +1 Gold every  3.5 seconds.
    {
      property: "goldGatherRate",
      select: { id: ["villager", "farm"] },
      effect: "change",
      value: round(g / s),
      type: "influence",
    },
  ],

  "network-of-citadels": ([o, i]) => [
    // Increase the Network of Castles attack speed bonus from +25% to 50%.
    {
      property: "attackSpeed",
      select: { class: [["infantry"]] },
      target: { class: [["infantry"], ["cavalry"], ["building"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "bonus",
    },
  ],

  "shattering-projectiles": ([]) => [
    // Trebuchet projectiles shatter on impact, increasing their area of effect.
    {
      property: "areaOfEffect",
      select: { id: ["counterweight-trebuchet"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  admirality: ([r]) => [
    // Increases the range of all combat ships by +1.
    {
      property: "maxRange",
      select: { id: ["galley", "hulk", "carrack"] },
      effect: "change",
      value: r,
      type: "passive",
    },
  ],

  shipwrights: ([h, a]) => [
    // Increase the health of all military ships by +20% and ranged armor by +1.
    {
      property: "hitpoints",
      select: common.allMillitaryShips,
      effect: "multiply",
      value: increaseByPercent(1, h),
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: common.allMillitaryShips,
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  "springald-crews": ([r, s]) => [
    // Springald Ships gain +1 range and attack 20% faster.
    {
      property: "maxRange",
      select: { class: [["springald", "ship"]] },
      effect: "change",
      value: r,
      type: "passive",
    },
    {
      property: "attackSpeed",
      select: { class: [["springald", "ship"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, s),
      type: "passive",
    },
  ],

  "swivel-cannon": ([]) => [
    // Springald Ships gain an additional Cannon which fires in 360 degrees.
    // (Adds a Swivel Cannon to the Springald Ship, which deals 15 damage and can fire in 360 degrees.)
    {
      property: "rangedAttack",
      select: { class: [["springald", "ship"]] },
      effect: "change",
      value: 15,
      type: "passive",
    },
  ],

  benediction: ([i]) => [
    // Inspired Villagers construct +15% faster.
    {
      property: "buildTime", // Todo, branch out?
      select: { class: [["building"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "influence",
    },
  ],

  devoutness: ([i]) => [
    // Inspired Villagers gather resources +10% faster.
    {
      property: "goldGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "influence",
    },
    {
      property: "foodGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "influence",
    },
    {
      property: "woodGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "influence",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "influence",
    },
  ],

  "fire-stations": ([i, s]) => [
    // Military Ships regenerate +1 health every 2 seconds when out of combat.
    {
      property: "healingRate",
      select: common.allMillitaryShips,
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "heavy-maces": ([i]) => [
    // Men-at-Arms wield maces, increasing their bonus damage against heavy targets by +6.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms"] },
      target: { class: [["heavy"]] },
      effect: "change",
      value: i,
      type: "bonus",
    },
  ],

  "inspired-warriors": ([a, d]) => [
    // Prelates can inspire military units, improving their armor by +1 and damage by  +15%.
    {
      property: "rangedArmor",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: a,
      type: "influence",
    },
    {
      property: "meleeArmor",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: a,
      type: "influence",
    },
    {
      property: "meleeAttack",
      select: {
        class: [
          ["cavalry", "melee"],
          ["infantry", "melee"],
        ],
      },
      effect: "multiply",
      value: increaseByPercent(1, d),
      type: "influence",
    },
    {
      property: "rangedAttack",
      select: {
        class: [
          ["cavalry", "ranged"],
          ["infantry", "ranged"],
        ],
      },
      effect: "multiply",
      value: increaseByPercent(1, d),
      type: "influence",
    },
  ],

  "marching-drills": ([i]) => [
    // Increase the movement speed of infantry and prelates by +10%.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]], id: ["prelate"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "reinforced-defenses": ([i]) => [
    // Increase the health of walls, towers, and gates by +40%.
    {
      property: "hitpoints",
      select: { class: [["wall"], ["tower"], ["gate"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "riveted-chain-mail": ([i]) => [
    // Increase the melee armor of Spearmen by +3.
    {
      property: "meleeArmor",
      select: { id: ["spearman"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "siege-engineering": ([]) => [
    // Melee and ranged infantry can construct Siege Towers and Battering Rams in the field.
    {
      property: "unknown",
      select: { class: [["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "siege-engineering-improved": ([]) => [
    // Melee and ranged infantry can construct Siege Towers and Battering Rams in the field.
    // Improved Siege Engineering allows for the construction of Mangonels, Springalds and Trebuchets as well.
    {
      property: "unknown",
      select: { class: [["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "slate-and-stone-construction": ([i]) => [
    // All buildings gain +5 fire armor.
    {
      property: "fireArmor",
      select: { class: [["building"]] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "two-handed-weapons": ([i]) => [
    // Men-at-Arms wield two-handed weapons, increasing their damage by +2.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "cantled-saddles": ([o, n]) => [
    // Increase Royal Knights' bonus damage after a charge from +3 to +10.
    {
      property: "meleeAttack",
      select: { id: ["royal-knight"] },
      target: { class: [["infantry"], ["cavalry"]] },
      effect: "change",
      value: n - 0,
      type: "bonus",
    },
  ],

  chivalry: ([i]) => [
    // Royal Knights regenerate +1 health every  1s seconds when out of combat.
    {
      property: "healingRate",
      select: { id: ["royal-knight"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "crossbow-stirrups": ([r]) => [
    // Reduce the reload time of Arbalétriers by -25%.
    {
      property: "attackSpeed",
      select: { id: ["arbaletrier"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, r),
      type: "passive",
    },
  ],

  "enlistment-incentives": ([r]) => [
    // Improves the French influence by reducing unit costs by a further -10%.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["ranged"]] },
      effect: "change",
      value: r,
      type: "influence",
    },
  ],

  gambesons: ([i]) => [
    // Increase Arbalétrier melee armor by +5.
    {
      property: "meleeArmor",
      select: { id: ["arbaletrier"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "long-guns": ([i]) => [
    // Increase the damage of naval cannons by +10%.
    {
      property: "rangedAttack",
      select: { class: [["warship"]], id: ["galleass"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "royal-bloodlines": ([i]) => [
    // Increase the health of all cavalry by +35%.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "battle-hardened": ([i]) => [
    // Increase the health of Palace Guards by +30.
    {
      property: "hitpoints",
      select: { id: ["palace-guard"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  explosives: ([i]) => [
    // Increase the damage of Incendiary Ships by +40%.
    {
      property: "fireAttack",
      select: { class: [["incendiary", "ship"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  incendiaries: ([i]) => [
    // Incendiary Ships gain +20% explosion range.
    {
      property: "maxRange",
      select: { class: [["incendiary", "ship"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "naval-arrowslits": ([i]) => [
    // Add a defensive arrowslit to this Dock which only attacks ships.
  ],

  // Technically this would increase burst by +1  but we don't have a way to represent that.
  "extra-hammocks": ([i]) => [
    // Increases the number of arrows fired by Archer Ships by +1.
    {
      property: "rangedAttack",
      select: { class: [["archer", "ship"]] },
      effect: "multiply",
      value: 1 + i / 5, // 5 is the default number of arrows
      type: "passive",
    },
  ],

  "heated-shot": ([i]) => [
    // Archer Ship arrows light enemy Ships on fire, dealing damage over time.
    // (Arrow Ships set enemy ships on fire dealing 30 damage over 10 seconds (not stacking with each arrow).)
    {
      property: "rangedAttack",
      select: { class: [["archer", "ship"]] },
      effect: "change",
      value: 30 / 5, // 5 is the default number of arrows
      type: "passive",
    },
  ],

  "extra-materials": ([i]) => [
    // Stone Wall Towers and Outposts repair nearby damaged Stone Walls. A single section is repaired at a time for +20 health per second.
    {
      property: "healingRate",
      select: { id: ["outpost", "stone-wall-tower"] },
      effect: "change",
      value: i,
      type: "influence",
    },
  ],

  "imperial-examinations": ([o, n]) => [
    // Increase the maximum amount of Gold carried by Imperial Officials from +40 to +80
    {
      property: "carryCapacity",
      select: { id: ["imperial-official"] },
      effect: "change",
      value: n - o,
      type: "passive",
    },
  ],

  pyrotechnics: ([i]) => [
    // Increase the range of gunpowder units by 1.5 tiles.
    {
      property: "maxRange",
      select: { id: ["handcannoneer"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "reload-drills": ([i]) => [
    // Increase attack speed of Bombards by -33%
    {
      property: "attackSpeed",
      select: { id: ["bombard"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
  ],

  "thunderclap-bombs": ([i]) => [
    // Warships fire a Nest of Bees attack.
    {
      property: "siegeAttack",
      select: { class: [["warship"]] },
      effect: "change",
      value: (8 * 8) / 3, // 8 damage of 8 nest of bees arrows / burst
      type: "passive",
    },
  ],

  "reusable-barrels": ([d]) => [
    // Reduce the cost of Nest of Bees by -25%.
    {
      property: "woodCost",
      select: { id: ["nest-of-bees"] },
      effect: "multiply",
      value: decreaseByPercent(1, d),
      type: "passive",
    },
    {
      property: "goldCost",
      select: { id: ["nest-of-bees"] },
      effect: "multiply",
      value: decreaseByPercent(1, d),
      type: "passive",
    },
  ],

  "adjustable-crossbars": ([i]) => [
    // Reduce the reload time of Mangonels by -25%.
    {
      property: "attackSpeed",
      select: { id: ["mangonel"] },
      effect: "multiply",
      value: decreaseByPercent(1, i),
      type: "passive",
    },
  ],

  "adjustable-crossbars-improved": ([i, d]) => [
    // "Reduce the reload time of Mangonels by -35%.
    // If Adjustable Crossbars has already been researched, reduce reload time by - 10 % instead.
    {
      property: "attackSpeed",
      select: { id: ["mangonel"] },
      effect: "multiply",
      value: decreaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  "all-seeing-eye": ([i]) => [
    // Increase the sight range of Scholars by +100%.
    {
      property: "lineOfSight",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "armored-beasts": ([i]) => [
    // Grant +2 armor to War Elephants and Tower War Elephants.
    {
      property: "meleeArmor",
      select: { id: ["war-elephant"] },
      effect: "change",
      value: i,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["war-elephant"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "armored-hull": ([h, a]) => [
    // Increase the health of all military ships by +20% and ranged armor by +1.
    {
      property: "hitpoints",
      select: common.allMillitaryShips,
      effect: "multiply",
      value: increaseByPercent(1, h),
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: common.allMillitaryShips,
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  biology: ([i]) => [
    // Increase the health of all cavalry by +20%.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "biology-improved": ([i, d]) => [
    // Increase the health of all cavalry by +30%.
    // If Biology has already been researched, increase it by + 10 % instead.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ],

  "boiling-oil": ([]) => [
    // Towers and Keeps gain a boiling oil attack against nearby units that deals  damage.
    {
      property: "unknown",
      select: { id: ["stone-wall-tower", "keep", ...common.allKeepLikeLandmarks.id] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  chemistry: ([i]) => [
    // Increase the damage of gunpowder units by +20%.
    {
      property: "rangedAttack",
      select: { class: [["gunpowder"], ["warship"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "siegeAttack",
      select: { class: [["gunpowder"], ["warship"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "court-architects": ([i]) => [
    // Increase the health of all buildings by +30%.
    {
      property: "hitpoints",
      select: { class: [["building"], ["landmark"], ["wonder"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "efficient-production": ([i]) => [
    // Allow Scholars to garrison in military buildings, boosting production speed by +100%.
    {
      property: "productionSpeed",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "elite-army-tactics": ([h, d]) => [
    // Increase the health of all melee infantry by +20% and their damage by 20%.
    {
      property: "hitpoints",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, h),
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, d),
      type: "passive",
    },
  ],

  "elite-army-tactics-improved": ([h, d, delta]) => [
    //  Increase the health of all melee infantry by +30% and their damage by  +30%.
    // If Elite Army Tactics has already been researched, increase health and damage by + 10 % instead.
    {
      property: "hitpoints",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: increaseByPercentImproved(1, h, delta),
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: increaseByPercentImproved(1, d, delta),
      type: "passive",
    },
  ],

  "forced-march": ([i, d]) => [
    // Infantry units gain the Forced March ability.
    // This ability makes them move +100% faster for  10 seconds, but they cannot attack while it is active.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
    },
  ],

  geometry: ([i]) => [
    // Increase the damage of Rams and Trebuchets +30%.
    {
      property: "siegeAttack",
      select: { id: ["battering-ram", "counterweight-trebuchet", "traction-trebuchet"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "greased-axles": ([i]) => [
    // Increase the movement speed of siege engines by +15%.
    {
      property: "moveSpeed",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
  ],

  "greased-axles-improved": ([i, d]) => [
    // Increase the movement speed of siege engines by +25%.
    // If Greased Axles has already been researched, increase it by + 10 % instead.
    {
      property: "moveSpeed",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, d - i),
      type: "passive",
    },
  ],

  "hearty-rations": ([i]) => [
    // Increase the carrying capacity of Villagers by +5.
    {
      property: "carryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "herbal-medicine": ([i]) => [
    // Increase the healing rate of religious units by +60%.
    {
      property: "healingRate",
      select: common.allReligiousUnits,
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "herbal-medicine-improved": ([i, d]) => [
    // Increase the healing rate of religious units by +120%.
    // If Herbal Medicine has already been researched, increase it by + 60 % instead.
    {
      property: "healingRate",
      select: common.allReligiousUnits,
      effect: "multiply",
      value: increaseByPercent(1, d),
      type: "passive",
    },
  ],

  "honed-blades": ([i]) => [
    // Increase the melee damage of Men-at-Arms and Knights by +3.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms", "knight", "lancer"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "manuscript-trade": ([i]) => [
    // Scholars garrisoned in Docks provide +20% faster production speed and contribute to global research.
    {
      property: "productionSpeed",
      select: { id: ["dock"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "incendiary-arrows": ([i]) => [
    // Increase the damage of ranged units and buildings by +20%. Does not apply to gunpowder units.
    {
      property: "rangedAttack",
      select: {
        class: [["ranged", "cavalry"]],
        // Below is essentally the same a ["ranged", "infantry"] minus gunpowder units
        id: [
          "longbowman",
          "zhuge-nu",
          "archer",
          "arbaletrier",
          "crossbowman",
          // And other ranged buildings
          "town-center",
          "keep",
          "outpost",
          "stone-wall-tower",
          "barbican-of-the-sun",
          ...common.allKeepLikeLandmarks.id,
        ],
      },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "lookout-towers": ([i]) => [
    // Increase the sight range of Outposts by 50%.
    {
      property: "lineOfSight",
      select: { id: ["outpost"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  piety: ([i]) => [
    // Increase the health of religious units by +40.
    {
      property: "hitpoints",
      select: common.allReligiousUnits,
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "piety-improved": ([i, d]) => [
    // Increase the health of religious units by +60.
    // If Piety has already been researched, increase it by + 20 instead.
    {
      property: "hitpoints",
      select: common.allReligiousUnits,
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "professional-scouts": ([i]) => [
    // Scouts gain the ability to carry animal carcasses and +200% damage against wild animals.
    {
      property: "huntCarryCapacity",
      select: { id: ["scout"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
    {
      property: "rangedAttack",
      target: { class: [["hunt"]] },
      select: { id: ["scout"] },
      effect: "change",
      value: increaseByPercent(1, i),
      type: "bonus",
    },
  ],

  "professional-scouts-improved": ([i, d]) => [
    // Scouts gain the ability to carry animal carcasses and +300% damage against wild animals.
    // If Professional Scouts has already been researched, increase increase ranged damage against wild animals by  +100% instead
    {
      property: "huntCarryCapacity",
      select: { id: ["scout"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
    {
      property: "rangedAttack",
      target: { class: [["hunt"]] },
      select: { id: ["scout"] },
      effect: "change",
      value: increaseByPercent(1, d),
      type: "bonus",
    },
  ],

  "reinforced-foundations": ([i]) => [
    // Houses and Town Centers grant an additional +5 maximum Population.
    {
      property: "maxPopulation",
      select: { id: ["house", "town-center"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "roller-shutter-triggers": ([r, t]) => [
    // Increase the weapon range of Springalds by +2 tiles and reduce their reload time by  +25%.
    {
      property: "maxRange",
      select: { id: ["springald"] },
      effect: "change",
      value: r,
      type: "passive",
    },
    {
      property: "attackSpeed",
      select: { id: ["springald"] },
      effect: "multiply",
      value: decreaseByPercent(1, t),
      type: "passive",
    },
  ],

  "roller-shutter-triggers-improved": ([r, t, ri, ti]) => [
    // Increase the weapon range of Springalds by +3 tiles and reduce their reload time by  +35%.
    // If Roller Shutter Triggers has already been researched, increase the weapon range of Springalds by +1 tile and reduce their reload time by  +10%.
    {
      property: "maxRange",
      select: { id: ["springald"] },
      effect: "change",
      value: ri,
      type: "passive",
    },
    {
      property: "attackSpeed",
      select: { id: ["springald"] },
      effect: "multiply",
      value: decreaseByPercentImproved(1, t, t - ti),
      type: "passive",
    },
  ],

  sanctity: ([i]) => [
    // Allow Scholars to capture Sacred Sites before the Castle Age (III). Sacred Sites generate +100% more Gold.
    {
      property: "goldGeneration",
      select: { id: ["sacred-site"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "unknown",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: 1,
      type: "ability",
    },
  ],

  // todo .... ??
  "siege-elephant": ([i]) => [
    // Upgrade Tower War Elephants to have Elite Crossbowmen as riders instead of Archers.
    {
      property: "rangedAttack",
      target: { class: [["heavy"]] },
      select: { id: ["tower-elephant"] },
      effect: "change",
      value: 11,
      type: "bonus",
    },
  ],

  "siege-works": ([h, a]) => [
    // Increase the health of siege engines by +20% and their ranged armor by  +10.
    {
      property: "hitpoints",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseByPercent(1, h),
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { class: [["siege"]] },
      effect: "change",
      value: a,
      type: "passive",
    },
  ],

  "siege-works-improved": ([h, a, hi, ai]) => [
    // Increase the health of siege engines by +30% and their ranged armor by  +4.
    // If Siege Works has already been researched, increase their health by  +10% and ranged armor by  +1 instead.
    {
      property: "hitpoints",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseByPercentImproved(1, h, h - hi),
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { class: [["siege"]] },
      effect: "change",
      value: ai,
      type: "passive",
    },
  ],

  "slow-burning-defenses": ([i]) => [
    // Increase the fire armor of Stone Wall Towers, Keeps, and Outposts by +10.
    {
      property: "fireArmor",
      select: { id: ["stone-wall-tower", "keep", "outpost"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  swiftness: ([i]) => [
    // Increase the movement speed of Scholars by +100%.
    {
      property: "moveSpeed",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  textiles: ([i]) => [
    // Increase Villagers' health by +25.
    {
      property: "hitpoints",
      select: { id: ["villager"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "textiles-improved": ([i, ii]) => [
    // Increase Villagers' health by +50, if already researched by +25.
    {
      property: "hitpoints",
      select: { id: ["villager"] },
      effect: "change",
      value: ii,
      type: "passive",
    },
  ],

  "tithe-barns": ([i]) => [
    // Relics placed in a Monastery provide an income of +30 Food, undefined Wood, and undefined Stone every minute.
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: i,
      type: "influence",
    },
  ],

  "tithe-barns-improved": ([i]) => [
    //  Relics placed in a Prayer Tent provide an income of +20 Food, +20 Wood, and +20 Stone every minute.
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: i,
      type: "influence",
    },
  ],

  "tranquil-venue": ([i]) => [
    // Mosques restore +1 health to nearby unit every second.
    {
      property: "healingRate",
      select: { id: ["mosque"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "village-fortresses": ([]) => [
    // Keeps act like Town Centers, including unit production, population capacity, and technology.
    {
      property: "unknown",
      select: { id: ["keep"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  zeal: ([i, d]) => [
    // Units healed by Scholars gain +50% attack speed for  3 seconds.
    {
      property: "attackSpeed",
      select: { class: [["infantry"], ["cavalry"]], id: ["scholar"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "influence",
    },
  ],

  agriculture: ([i]) => [
    // Improve Villagers' gathering rate from Farms by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager", "farm"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "armored-caravans": ([i]) => [
    // Grant +5 armor to Traders and Trade Ships.
    {
      property: "meleeArmor",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: i,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "boot-camp": ([i]) => [
    // Increase the health of all infantry by +15%.
    {
      property: "hitpoints",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "camel-rider-barding": ([i]) => [
    // Increase the armor of camel riders by +2.
    {
      property: "meleeArmor",
      select: { id: ["camel-rider"] },
      effect: "change",
      value: i,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["camel-rider"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "camel-handling": ([i]) => [
    // Increase the movement speed of camel units by +15%.
    {
      property: "moveSpeed",
      select: { id: ["camel-rider", "camel-archer"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "camel-rider-shields": ([i]) => [
    // Grant Camel Riders shields, improving their melee armor by +3.
    {
      property: "meleeArmor",
      select: { id: ["camel-rider"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "camel-support": ([i]) => [
    // Camels increase the armor of nearby infantry by +2.
    {
      property: "meleeArmor",
      select: { class: [["infantry"]], id: ["camel-rider", "camel-archer"] },
      effect: "change",
      value: i,
      type: "influence",
    },
  ],

  "composite-bows": ([r]) => [
    // Reduce the reload time of Archers by -25%.
    {
      property: "attackSpeed",
      select: { id: ["archer"] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "passive",
    },
  ],

  "culture-wing": ([]) => [
    // Constructs the Culture Wing.
    // The following cultural technologies become available:
    // • Preservation of Knowledge (Feudal Age)
    // • Medical Centers (Castle Age)
    // • Faith (Imperial Age)
    {
      property: "hitpoints",
      select: { id: ["house-of-wisdom"] },
      effect: "change",
      value: 5000,
      type: "passive",
    },
  ],

  "economic-wing": ([]) => [
    // Constructs the Economic Wing.
    // The following economic technologies become available:
    // • Fresh Foodstuffs (Feudal Age)
    // • Agriculture (Castle Age)
    // • Improved Processing (Imperial Age)
    {
      property: "hitpoints",
      select: { id: ["house-of-wisdom"] },
      effect: "change",
      value: 5000,
      type: "passive",
    },
  ],

  faith: ([]) => [
    // Imams can convert units without holding a Relic, but can only target a single unit.
    {
      property: "unknown",
      select: { id: ["imam"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "fresh-foodstuffs": ([r]) => [
    // Reduce the cost to produce Villagers by -50%.
    {
      property: "foodCost",
      select: { id: ["villager"] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "passive",
    },
  ],

  "grand-bazaar": ([i]) => [
    // Traders also return with a secondary resource. This resource is 0.25 the base Gold value and is set at the market.
    {
      property: "unknown",
      select: { id: ["trader"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "improved-processing": ([i]) => [
    // Villagers drop off +8% more resources.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "medical-centers": ([h]) => [
    // Keeps heal nearby units for +2 health every  1s second.
    {
      property: "healingRate",
      select: { id: ["keep"] },
      effect: "change",
      value: h,
      type: "influence",
    },
  ],

  "military-wing": ([]) => [
    // Constructs the Military Wing.
    // The following military technologies become available:
    // • Camel Support (Feudal Age)
    // • Camel Rider Shields (Castle Age)
    // • Boot Camp (Imperial Age)
    {
      property: "hitpoints",
      select: { id: ["house-of-wisdom"] },
      effect: "change",
      value: 5000,
      type: "passive",
    },
  ],

  phalanx: ([i]) => [
    // Increase the attack range of Spearmen by +100%.
    {
      property: "maxRange",
      select: { id: ["spearman"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "preservation-of-knowledge": ([r]) => [
    // Reduce the cost of all technology by -30%.
    {
      property: "goldCost",
      select: { class: [["technology"]] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "passive",
    },
    {
      property: "foodCost",
      select: { class: [["technology"]] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "passive",
    },
    {
      property: "woodCost",
      select: { class: [["technology"]] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "passive",
    },
  ],

  "spice-roads": ([i]) => [
    // Increase the Gold income from Traders by +30%.
    {
      property: "goldGatherRate",
      select: { id: ["traders"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ],

  "teak-masts": ([i]) => [
    // Increase the move speed of military ships +10%
    {
      property: "moveSpeed",
      select: common.allMillitaryShips,
      effect: "change",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
  ],

  "trade-wing": ([]) => [
    // Constructs the Trade Wing.
    // The following trade technologies become available:
    // • Spice Roads (Feudal Age)
    // • Armored Caravans (Castle Age)
    // • Grand Bazaar (Imperial Age)
    {
      property: "hitpoints",
      select: { id: ["house-of-wisdom"] },
      effect: "change",
      value: 5000,
      type: "passive",
    },
  ],

  "canoe-tactics": ([i]) => [
    // Archer Ships fire an additional 2 Javelin weapons.
    {
      property: "rangedAttack",
      select: { class: [["archer", "ship"]] },
      effect: "change",
      value: (2 * 4) / 5, // 4 damage of 2 javelins / default burst
      type: "passive",
    },
  ],

  "farima-leadership": ([i]) => [
    // Sofa increase the movement speed of nearby infantry by +15%.
    {
      property: "moveSpeed",
      select: { id: ["sofa"] },
      target: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "influence",
    },
  ],

  "imported-armor": ([i]) => [
    // Increase armor of Sofa by +2.
    {
      property: "meleeArmor",
      select: { id: ["sofa"] },
      effect: "change",
      value: i,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["sofa"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "local-knowledge": ([i]) => [
    // Musofadi units heal while in Stealth for +2 every 1 seconds.
    {
      property: "healingRate",
      select: { id: ["musofadi-gunner", "musofadi-warrior"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "poisoned-arrows": ([d]) => [
    // Archer arrows deal an additional 3 damage over 6 seconds.
    {
      property: "rangedAttack",
      select: { id: ["archer"] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "precision-training": ([donso, archer, javelin]) => [
    // Increase ranged damage of Donso by +6, Archers by +2, and Javelin Throwers by +2.
    {
      property: "rangedAttack",
      select: { id: ["donso"] },
      effect: "change",
      value: donso,
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: { id: ["archer"] },
      effect: "change",
      value: archer,
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: { id: ["javelin-thrower"] },
      effect: "change",
      value: javelin,
      type: "passive",
    },
  ],

  "advanced-academy": ([]) => [
    // Outfits Military Schools with the ability to produce Knights and Janissaries.
  ],

  "anatolian-hills": ([s, i]) => [
    // Spawn 8 sheep at the Landmark Town Center and increase Villager mining speed by +10%.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
  ],

  "fast-training": ([i]) => [
    // Increase production of Military Schools by +25%.

    {
      property: "productionSpeed",
      select: { id: ["military-school"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
  ],

  "field-work": ([imam, i]) => [
    // Spawn 2 Imams at the Landmark Town Center. Imams area heal nearby units for 1 health every second.
    {
      property: "healingRate",
      select: { id: ["imam"] },
      target: { class: [[]] },
      effect: "change",
      value: imam,
      type: "influence",
    },
  ],

  "imperial-fleet": ([p, m]) => [
    // Increase the production speed of Gunpowder Ships by 15% and their movement speed by 15%.
    {
      property: "productionSpeed",
      select: { id: ["carrack", "grand-galley"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, p),
      type: "passive",
    },
    {
      property: "moveSpeed",
      select: { id: ["carrack", "grand-galley"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, m),
      type: "passive",
    },
  ],

  "janissary-company": ([i]) => [
    // Spawn 2 Janissaries for each of your Military Schools at the Landmark Town Center.
  ],

  "janissary-guns": ([i]) => [
    // Increase Janissary gun damage by +3.
    {
      property: "rangedAttack",
      select: { id: ["janissary"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "mehter-drums": ([mether, i]) => [
    // Spawn 1 Mehter at the Landmark Town Center. Mehters increase move speed to units in the same formation by +15%.
    {
      property: "moveSpeed",
      select: { id: ["mehter"] },
      target: { class: [[]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "influence",
    },
  ],

  "military-campus": ([i]) => [
    // Increase Military Schools that can be built by +1.
  ],

  // Todo, add improved version

  "additional-torches": ([i]) => [
    // Increase the torch damage of all infantry and cavalry by +3.
    {
      property: "fireAttack",
      select: { class: [["infantry"], ["cavalry", "melee"]] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "additional-torches-improved": ([i, d]) => [
    // Increase the torch damage of all infantry and cavalry by +5.
    // If Additional Torches has already been researched, increase the torch damage from all infantry and cavalry by  +2.
    {
      property: "fireAttack",
      select: { class: [["infantry"], ["cavalry", "melee"]] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "monastic-shrines": ([]) => [
    // Monasteries allow Improved Production in their districts even without an Ovoo.
    {
      property: "unknown",
      select: { id: ["prayer-tent"] },
      effect: "change",
      value: 1,
      type: "influence",
    },
  ],

  // Todo, improve
  piracy: ([b]) => [
    // Gain +50 Wood and  +50 Gold when sinking an enemy ship.
    {
      property: "unknown",
      select: { id: ["light-junk", "explosive-junk", "war-junk", "baochuan"] },
      effect: "change",
      value: b,
      type: "ability",
    },
  ],

  "raid-bounty": ([b]) => [
    // Increase the raid income for igniting a building to +25 Food and Gold.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: b,
      type: "ability",
    },
  ],

  "raid-bounty-improved": ([i, d]) => [
    // Increase the raid income for igniting a building to +50 Food and Gold.
    // If Raid Bounty has already been researched, increase the raid income for igniting a building by  +25 Food and Gold.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: i - d,
      type: "ability",
    },
  ],

  "siha-bow-limbs": ([i]) => [
    // Increase the ranged damage of Mangudai and the Khan by +1.
    {
      property: "rangedAttack",
      select: { id: ["khan", "mangudai"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "siha-bow-limbs-improved": ([i, d]) => [
    // ncrease the ranged damage of Mangudai and the Khan by +2.
    // If Siha Bow Limbs has already been researched, increase the ranged damage of Mangudai and the Khan by + 1.
    {
      property: "rangedAttack",
      select: { id: ["khan", "mangudai"] },
      effect: "change",
      value: i - d,
      type: "passive",
    },
  ],

  "stone-bounty": ([b]) => [
    // Add +75 Stone to the raid income for igniting a building.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: b,
      type: "ability",
    },
  ],

  "stone-bounty-improved": ([i, d]) => [
    // Add +125 Stone to the raid income for igniting a building.
    // If Stone Bounty has already been researched, add  +50 Stone to the raid income for igniting a building.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: i - d,
      type: "ability",
    },
  ],

  "stone-commerce": ([]) => [
    // Having 9 or more active Traders causes them to supply of Stone as well as Gold.
    {
      property: "unknown",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "stone-commerce-improved": ([]) => [
    // Having 9 or more active Traders causes them to supply an increased amount of Stone as well as Gold.
    {
      property: "unknown",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "superior-mobility": ([i]) => [
    // Packed buildings move and pack/unpack 50% faster.
    {
      property: "unknown",
      select: { class: [["building"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "ability",
    },
  ],

  "whistling-arrows": ([]) => [
    // Increase the Khan's Signal Arrow duration by +5 seconds and range by  +2 tiles.
    {
      property: "unknown",
      select: { id: ["khan"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "whistling-arrows-improved": ([]) => [
    // Increase the Khan's Signal Arrow duration by +7 seconds and range by  +3 tiles.
    // If Whistling Arrows has already been researched, increase the Khan's Signal Arrow duration by  +2 seconds and range by  +1 tile.
    {
      property: "unknown",
      select: { id: ["khan"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "yam-network": ([]) => [
    // Yam speed aura applies to all units instead of just Traders and cavalry units.
    {
      property: "unknown",
      select: { class: [["infantry"], ["siege"]] },
      effect: "change",
      value: 1,
      type: "influence",
    },
  ],

  "banded-arms": ([r]) => [
    // Increase the range of Springald by +0.5 tiles.
    {
      property: "maxRange",
      select: { id: ["springald"] },
      effect: "change",
      value: r,
      type: "passive",
    },
  ],

  "blessing-duration": ([d]) => [
    // Increase the duration of Saint's Blessing by 10 seconds.
    {
      property: "unknown",
      select: { id: ["warrior-monk"] },
      effect: "change",
      value: d,
      type: "influence",
    },
  ],

  "boyars-fortitude": ([h]) => [
    // Increase the health of Rus cavalry by +20.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "change",
      value: h,
      type: "passive",
    },
  ],

  "adaptable-hulls": ([i]) => [
    // Converting between Lodya Ship types is 50% faster and no longer has a cost penalty.
    {
      property: "unknown",
      select: { id: ["lodya-galley", "lodya-attack-ship", "lodya-fishing-boat", "lodya-trade-ship"] },
      effect: "change",
      value: i,
      type: "ability",
    },
  ],

  "cedar-hulls": ([health, armor]) => [
    // Increase the health of Lodya Attack Ships by +200 and their ranged armor by  +1.
    {
      property: "hitpoints",
      select: { id: ["lodya-attack-ship"] },
      effect: "change",
      value: health,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["lodya-attack-ship"] },
      effect: "change",
      value: armor,
      type: "passive",
    },
  ],

  "clinker-construction": ([h]) => [
    // Increase the health of Lodya Attack Ships by +200.
    {
      property: "hitpoints",
      select: { id: ["lodya-attack-ship"] },
      effect: "change",
      value: h,
      type: "passive",
    },
  ],

  "mounted-guns": ([]) => [
    // Replaces Springald Ship weaponry with Cannons which provide greater range and damage.
  ],

  "double-time": ([s, d]) => [
    // Streltsy gain the Double Time ability, which increases their movement speed by +30% for  10 seconds.
    {
      property: "moveSpeed",
      select: { id: ["streltsy"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, s),
      type: "ability",
    },
  ],

  "fine-tuned-guns": ([r]) => [
    // Reduce the reload time of Bombards by -20%.
    {
      property: "attackSpeed",
      select: { id: ["bombard"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, r),
      type: "passive",
    },
  ],

  "improved-blessing": ([d]) => [
    // Improve the damage granted by Saint's Blessing by +1.
    {
      property: "unknown",
      select: { class: [["infantry"], ["cavalry"]], id: ["warrior-monk"] },
      effect: "change",
      value: d,
      type: "ability",
    },
  ],

  "knight-sabers": ([d]) => [
    // Increase the melee damage of Knights by +4.
    {
      property: "meleeAttack",
      select: { id: ["knight"] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ],

  "mounted-precision": ([r]) => [
    // Increases the Horse Archers weapon range by 1.
    {
      property: "maxRange",
      select: { id: ["horse-archer"] },
      effect: "change",
      value: r,
      type: "passive",
    },
  ],

  "saints-reach": ([]) => [
    // Increase the range of Saint's Blessing by 3 tiles.
    {
      property: "unknown",
      select: { id: ["warrior-monk"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "siege-crew-training": ([]) => [
    // Setup and teardown speed of Trebuchets and Magonels is instant.
    {
      property: "attackSpeed",
      select: { id: ["counterweight-trebuchet", "mangonel"] },
      effect: "change",
      value: 0, // Todo, figure out real timings
      type: "passive",
    },
  ],

  "wandering-town": ([d]) => [
    // Ram damage increased by +100%.
    {
      property: "siegeAttack",
      select: { id: ["battering-ram"] },
      effect: "multiply",
      value: increaseByPercent(1, d),
      type: "passive",
    },
  ],

  "castle-turret": ([i]) => [
    // Increase the damage of arrows fired from this Wooden Fortress by +2.
    {
      property: "rangedAttack",
      select: { id: ["wooden-fortress"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  "castle-watch": ([i]) => [
    // Increase the sight range of this Wooden Fortress by 6 tiles.
    {
      property: "lineOfSight",
      select: { id: ["wooden-fortress"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ],

  // Todo, these weapons are already on the building, this just unlocks them
  arrowslits: ([]) => [
    // Add defensive arrowslits to this structure.
    {
      property: "unknown",
      select: { id: ["wooden-fortress", "outpost"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "handcannon-slits": ([]) => [
    // Add defensive handcannon slits to this structure.
    {
      property: "unknown",
      select: { id: ["outpost"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "springald-emplacement": ([]) => [
    // Add a defensive springald emplacement to this structure.
    {
      property: "unknown",
      select: { id: ["wooden-fortress", "outpost", "keep", ...common.allKeepLikeLandmarks.id] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "cannon-emplacement": ([]) => [
    // Add a defensive cannon emplacement to this structure.
    {
      property: "unknown",
      select: { id: ["outpost", "keep", ...common.allKeepLikeLandmarks.id] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "fortify-outpost": ([hp, a]) => [
    // Add +1000 health and  +5 fire armor to this Outpost.
    {
      property: "hitpoints",
      select: { id: ["outpost"] },
      effect: "change",
      value: hp,
      type: "passive",
    },
    {
      property: "fireArmor",
      select: { id: ["outpost"] },
      effect: "change",
      value: a,
      type: "passive",
    },
  ],
};
