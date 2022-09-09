/** A configuration of technology ids and their modiying effects. */

import { Modifier } from "../../types/items";

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
  allMillitaryShips: { class: [["ship", "attack"], ["ship", "archer"], ["ship", "incendiary"], ["warship"]], id: ["galleass"] } as Modifier["select"],
  allKeepLikeLandmarks: { id: ["berkshire-palace", "elzbach-palace", "kremlin", "spasskaya-tower", "red-palace", "the-white-tower"] },
  allReligiousUnits: { id: ["prelate", "monk", "scholar", "shaman", "imam", "warrior-monk"] } as Modifier["select"],
};

export const technologyModifiers: Record<string, Modifier[]> = {
  "arrow-volley": [
    // Longbowmen gain Arrow Volley, an activated ability that increases Longbowmen attack speed by +70%.
    {
      property: "attackSpeed",
      select: { id: ["longbowman"] },
      effect: "multiply",
      value: 1.7,
      type: "ability",
    },
  ],

  "steeled-arrow": [
    // Increase the ranged damage of all non-siege units and buildings by +1.
    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "balanced-projectiles": [
    // Increase the ranged damage of all non-siege units and buildings by +1.
    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "platecutter-point": [
    // Increase the ranged damage of all non-siege units and buildings by +1.

    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "iron-undermesh": [
    // Increase the ranged armor of all non-siege units by +1.

    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "wedge-rivets": [
    // Increase the ranged armor of all non-siege units by +1.

    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],
  "angled-surfaces": [
    // Increase the ranged armor of all non-siege units by +1.
    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "fitted-leatherwork": [
    // Increase the melee armor of all non-siege units by +1.

    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "insulated-helm": [
    // Increase the melee armor of all non-siege units by +1.

    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "master-smiths": [
    // Increase the melee armor of all non-siege units by +1.
    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  bloomery: [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "damascus-steel": [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  decarbonization: [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "military-academy": [
    // Reduce the time it takes to produce infantry, cavalry, siege, and transport units at buildings by -25%.
    // Does not affect religious units or other support units.
    {
      property: "buildTime",
      select: { class: [["infantry"], ["melee", "cavalry"], ["ranged", "cavalry"], ["siege"], ["transport"]] },
      effect: "multiply",
      value: 0.75,
      type: "passive",
    },
  ],

  "military-academy-improved": [
    // Reduce the time it takes to produce infantry, cavalry, siege, and transport units at buildings by -35%.
    // Does not affect religious units or other support units.
    // If Military Academy has already been researched, reduce the time by  -10% instead.
    {
      property: "buildTime",
      select: { class: [["infantry"], ["melee", "cavalry"], ["ranged", "cavalry"], ["siege"], ["transport"]] },
      effect: "multiply",
      value: 0.8666, // 0.65 / 0.75
      type: "passive",
    },
  ],

  /// Common economic tecnologies ––––––––––––––––––––––––––––––––––––

  "crosscut-saw": [
    // Increase Villagers' gathering rate for Wood by +15%.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "crosscut-saw-improved": [
    //  Increase Villagers' gathering rate for Wood by +20%.
    // If Crosscut Saw has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
  ],

  cupellation: [
    // Increase Villagers' gathering rate for Gold and Stone by +15%.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "cupellation-improved": [
    //  ncrease Villagers' gathering rate for Gold by +20%.
    // If Cupellation has already been researched, increase it by + 5 % instead.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
  ],

  "double-broadaxe": [
    // Increase Villagers' gathering rate for Wood by +15%.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "double-broadaxe-improved": [
    // Increase Villagers' gathering rate for Wood by +20%.
    // If Double Broadaxe has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
  ],

  "drift-nets": [
    // Increase the gathering rate of Fishing Ships by +15% and their carry capacity by  +20.
    {
      property: "goldGatherRate",
      select: { id: ["ships"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "extended-lines": [
    // Increase the gathering rate of Fishing Ships by +20% and their carry capacity by  +10.
    {
      property: "foodGatherRate",
      select: { id: ["fishing-boat", "lodya-fishing-boat"] },
      effect: "multiply",
      value: 1.2,
      type: "passive",
    },
    {
      property: "carryCapacity",
      select: { id: ["fishing-boat", "lodya-fishing-boat"] },
      effect: "multiply",
      value: 1.1,
      type: "passive",
    },
  ],

  horticulture: [
    // Increase Villagers' gathering rate for Food by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "horticulture-improved": [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Horticulture has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
  ],

  fertilization: [
    // Increase Villagers' gathering rate for Food by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "fertilization-improved": [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Fertilization has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
  ],

  forestry: [
    // Double the rate at which Villagers chop down trees.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "forestry-improved": [
    // Villagers fell trees in a single chop.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 4, // ??
      type: "passive",
    },
  ],

  "acid-distilization": [
    // Increase Villagers' gathering rate for Gold and Stone by +15%.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "acid-distilization-improved": [
    // Increase Villagers' gathering rate for Gold by +20%.
    // If Acid Distillation has already been researched, increase it by + 5 % instead.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434,
      type: "passive",
    },
  ],

  "specialized-pick": [
    // Increase Villagers' gathering rate for Gold and Stone by +15%.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "specialized-pick-improved": [
    // Increase Villagers' gathering rate for Gold by +20%.
    // If Specialized Pick has already been researched, increase it by + 5 % instead.
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434,
      type: "passive",
    },
  ],

  "survival-techniques": [
    // Increase Villagers' hunted meat gather rate by  +15%.
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "survival-techniques-improved": [
    // Increase Villagers' hunted meat carry capacity by +20 and hunted meat gather rate by  +20%.
    // If Survival Techniques has already been researched, increase Villagers' hunted meat carry capacity by  +10, and hunted meat gather rate by  +5% instead.
    {
      property: "huntCarryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: 10,
      type: "passive",
    },
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
  ],

  wheelbarrow: [
    // Increase the carry capacity of Villagers by +5 and their movement speed by  +15%.
    {
      property: "carryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: 5,
      type: "passive",
    },
    {
      property: "moveSpeed",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "wheelbarrow-improved": [
    // Increase Villagers' resource carry capacity by +7 and movement speed by  +15%.
    // If Wheelbarrow has already been researched, increase carry capacity by + 2 instead.
    {
      property: "carryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: 2,
      type: "passive",
    },
  ],

  "lumber-preservation": [
    // Increase Villagers' gathering rate for Wood by +15%.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "lumber-preservation-improved": [
    // Increase Villagers' gathering rate for Wood by +20%.
    // If Lumber Preservation has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
  ],

  "precision-cross-breeding": [
    // Increase Villagers' gathering rate for Food by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "precision-cross-breeding-improved": [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Precision Crossbreeding has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.0434, // 1.2 / 1.15
      type: "passive",
    },
  ],

  "ancient-techniques": [
    // Increase the gathering rate of Villagers by +5% for each dynasty achieved.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.05,
      type: "passive",
    },
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.05,
      type: "passive",
    },
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.05,
      type: "passive",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.05,
      type: "passive",
    },
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.05,
      type: "passive",
    },
  ],

  /// Unit technologies –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  "setup-camp": [
    // Longbowmen gain the ability to Setup Camp, which heals them for +1 health every 1 seconds.
    {
      property: "hitpoints",
      select: { id: ["longbowman"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "armor-clad": [
    // Increase the ranged and melee armor of Men-at-Arms by +2.
    {
      property: "rangedArmor",
      select: { id: ["man-at-arms"] },
      effect: "change",
      value: 2,
      type: "passive",
    },
    {
      property: "meleeArmor",
      select: { id: ["man-at-arms"] },
      effect: "change",
      value: 2,
      type: "passive",
    },
  ],

  enclosures: [
    // Each Farm Enclosure being worked by a Villager generates +1 Gold every  3.5 seconds.
    {
      property: "goldGatherRate",
      select: { id: ["villager", "farm"] },
      effect: "change",
      value: 0.29,
      type: "influence",
    },
  ],

  "network-of-citadels": [
    // Increase the Network of Castles attack speed bonus from +25% to 50%.
    {
      property: "attackSpeed",
      select: { class: [["infantry"]] },
      target: { class: [["infantry"], ["cavalry"], ["building"]] },
      effect: "change",
      value: 1.2, // 1.25 * 1.2 = 1.5
      type: "bonus",
    },
  ],

  "shattering-projectiles": [
    // Trebuchet projectiles shatter on impact, increasing their area of effect.
    {
      property: "areaOfEffect",
      select: { id: ["trebuchet"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  admirality: [
    // Increases the range of all combat ships by +1.
    {
      property: "maxRange",
      select: { id: ["galley", "hulk", "carrack"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  // Now a civ bonus
  shipwrights: [
    // Reduce the cost of ships by -10%.
    {
      property: "woodCost",
      select: { class: [["ship"], ["warship"]] },
      effect: "multiply",
      value: 0.9,
      type: "passive",
    },
    {
      property: "goldCost",
      select: { class: [["ship"], ["warship"]] },
      effect: "multiply",
      value: 0.9,
      type: "passive",
    },
  ],

  benediction: [
    // Inspired Villagers construct +15% faster.
    {
      property: "buildTime", // Todo, branch out?
      select: { class: [["building"]] },
      effect: "multiply",
      value: 1.15,
      type: "influence",
    },
  ],

  devoutness: [
    // Inspired Villagers gather resources +10% faster.
    {
      property: "goldGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: 1.1,
      type: "influence",
    },
    {
      property: "foodGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: 1.1,
      type: "influence",
    },
    {
      property: "woodGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: 1.1,
      type: "influence",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: 1.1,
      type: "influence",
    },
  ],

  "fire-stations": [
    // Increase the repair rate of Docks by +100%.
    {
      property: "repairRate",
      select: { id: ["dock"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "heavy-maces": [
    // Men-at-Arms wield maces, increasing their bonus damage against heavy targets by +6.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms"] },
      target: { class: [["heavy"]] },
      effect: "change",
      value: 6,
      type: "bonus",
    },
  ],

  "inspired-warriors": [
    // Prelates can inspire military units, improving their armor by +1 and damage by  +15%.
    {
      property: "rangedArmor",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: 1,
      type: "influence",
    },
    {
      property: "meleeArmor",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: 1,
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
      value: 1.15,
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
      value: 1.15,
      type: "influence",
    },
  ],

  "marching-drills": [
    // Increase the movement speed of infantry and prelates by +10%.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]], id: ["prelate"] },
      effect: "multiply",
      value: 1.1,
      type: "passive",
    },
  ],

  "reinforced-defenses": [
    // Increase the health of walls, towers, and gates by +40%.
    {
      property: "hitpoints",
      select: { class: [["wall"], ["tower"], ["gate"]] },
      effect: "multiply",
      value: 1.4,
      type: "passive",
    },
  ],

  "riveted-chain-mail": [
    // Increase the melee armor of Spearmen by +3.
    {
      property: "meleeArmor",
      select: { id: ["spearman"] },
      effect: "change",
      value: 3,
      type: "passive",
    },
  ],

  "siege-engineering": [
    // Melee and ranged infantry can construct Siege Towers and Battering Rams in the field.
    {
      property: "unknown",
      select: { class: [["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "siege-engineering-improved": [
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

  "slate-and-stone-construction": [
    // All buildings gain +5 fire armor.
    {
      property: "fireArmor",
      select: { class: [["building"]] },
      effect: "change",
      value: 5,
      type: "passive",
    },
  ],

  "two-handed-weapon": [
    // Men-at-Arms wield two-handed weapons, increasing their damage by +2.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms"] },
      effect: "change",
      value: 2,
      type: "passive",
    },
  ],

  "cantled-saddles": [
    // Increase Royal Knights' bonus damage after a charge by +10.
    {
      property: "meleeAttack",
      select: { id: ["royal-knight"] },
      target: { class: [["infantry"], ["cavalry"]] },
      effect: "change",
      value: 10,
      type: "bonus",
    },
  ],

  chivalry: [
    // Royal Knights regenerate +1 health every  1s seconds when out of combat.
    {
      property: "healingRate",
      select: { id: ["royal-knight"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "crossbow-stirrups": [
    // Reduce the reload time of Arbalétriers by -25%.
    {
      property: "attackSpeed",
      select: { id: ["arbaletrier"] },
      effect: "multiply",
      // Attackspeed after technology 2 -> 1.69, so boils down to 0.845 instead of 0.75
      value: 0.845,
      type: "passive",
    },
  ],

  //   "enlistment-incentives": [
  //     // Improves the French influence by reducing unit costs by a further -10%.
  //     {
  //       property: "",
  //       select: { class: [[]] },
  //       effect: "change",
  //       value: 1,
  //     },
  //   ],

  gambesons: [
    // Increase Arbalétrier melee armor by +5.
    {
      property: "meleeArmor",
      select: { id: ["arbaletrier"] },
      effect: "change",
      value: 5,
      type: "passive",
    },
  ],

  "long-guns": [
    // Increase the damage of naval cannons by +10%.
    {
      property: "rangedAttack",
      select: { class: [["warship"]], id: ["galleass"] },
      effect: "multiply",
      value: 1.1,
      type: "passive",
    },
  ],

  "royal-bloodlines": [
    // Increase the health of all cavalry by +35%.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: 1.35,
      type: "passive",
    },
  ],

  "additional-sails": [
    // Increase the movement speed of all ships by +15%.
    {
      property: "moveSpeed",
      select: { class: [["ship"], ["warship"]] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "battle-hardened": [
    // Increase the health of Palace Guards by +30.
    {
      property: "hitpoints",
      select: { id: ["palace-guard"] },
      effect: "change",
      value: 30,
      type: "passive",
    },
  ],

  "chaser-cannons": [
    // Increase the weapon range of Warships by +1 tiles.
    {
      property: "maxRange",
      select: { class: [["warship"]] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  explosives: [
    // Increase the damage of Incendiary Ships by +40%.
    {
      property: "fireAttack",
      select: { class: [["incendiary", "ship"]] },
      effect: "multiply",
      value: 1.4,
      type: "passive",
    },
  ],

  // TODO: In reality is adding an extra weapon, not modifiying the existing one.
  "extra-ballista": [
    // Adds a swivel ballista to Attack Ships.
    // Swivel ballistae can fire in any direction and deal 15 damage.
    {
      property: "rangedAttack",
      select: { class: [["attack", "ship"]] },
      effect: "change",
      value: 15,
      type: "passive",
    },
  ],

  // This comes down to 200%  "Shoots 2x2 arrows (burst) per atk, arrow = 8 dmg. 1 atk = 4 arrows, 4x8 = 32 dmg."
  "extra-hammocks": [
    // Junks of the Archer Ship type gain additional crew, allowing them to fire two more arrows in each volley.
    {
      property: "rangedAttack",
      select: { id: ["junk"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "extra-materials": [
    // Stone Wall Towers and Outposts repair nearby damaged Stone Walls. A single section is repaired at a time for +20 health per second.
    {
      property: "healingRate",
      select: { id: ["outpost", "stone-wall-tower"] },
      effect: "change",
      value: 20,
      type: "influence",
    },
  ],

  "imperial-examination": [
    // Increase the maximum amount of Gold carried by Imperial Officials from +40 to +80
    {
      property: "carryCapacity",
      select: { id: ["imperial-official"] },
      effect: "change",
      value: 40,
      type: "passive",
    },
  ],

  "navigator-lookout": [
    // Increase the sight range of military ships by +4.
    {
      property: "lineOfSight",
      select: common.allMillitaryShips,
      effect: "change",
      value: 4,
      type: "passive",
    },
  ],

  pyrotechnics: [
    // Increase the range of gunpowder units by 1.5 tiles.
    {
      property: "maxRange",
      select: { id: ["handcannoneer"] },
      effect: "change",
      value: 1.5,
      type: "passive",
    },
  ],

  "reload-drills": [
    // Reduce the reload time of Bombards by -33%.
    {
      property: "attackSpeed",
      select: { id: ["bombard"] },
      effect: "multiply",
      value: 0.67,
      type: "passive",
    },
  ],

  "reusable-barrels": [
    // Reduce the cost of Nest of Bees by -25%.
    {
      property: "woodCost",
      select: { id: ["nest-of-bees"] },
      effect: "multiply",
      value: 0.75,
      type: "passive",
    },
    {
      property: "goldCost",
      select: { id: ["nest-of-bees"] },
      effect: "multiply",
      value: 0.75,
      type: "passive",
    },
  ],

  "adjustable-crossbars": [
    // Reduce the reload time of Mangonels by -25%.
    {
      property: "attackSpeed",
      select: { id: ["mangonel"] },
      effect: "multiply",
      value: 0.75,
      type: "passive",
    },
  ],

  "adjustable-crossbars-improved": [
    // "Reduce the reload time of Mangonels by -35%.
    // If Adjustable Crossbars has already been researched, reduce reload time by - 10 % instead.
    {
      property: "attackSpeed",
      select: { id: ["mangonel"] },
      effect: "multiply",
      value: 0.8666, // 0.65 / 0.75
      type: "passive",
    },
  ],

  "all-seeing-eye": [
    // Increase the sight range of Scholars by +100%.
    {
      property: "lineOfSight",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "armored-beasts": [
    // Grant +2 armor to War Elephants and Tower War Elephants.
    {
      property: "meleeArmor",
      select: { id: ["war-elephant"] },
      effect: "change",
      value: 3,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["war-elephant"] },
      effect: "change",
      value: 3,
      type: "passive",
    },
  ],

  "armored-hull": [
    // Increase the armor of all military ships by +2.
    {
      property: "rangedArmor",
      select: common.allMillitaryShips,
      effect: "change",
      value: 2,
      type: "passive",
    },
    {
      property: "meleeArmor",
      select: common.allMillitaryShips,
      effect: "change",
      value: 2,
      type: "passive",
    },
  ],

  biology: [
    // Increase the health of all cavalry by +20%.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: 1.2,
      type: "passive",
    },
  ],

  "biology-improved": [
    // Increase the health of all cavalry by +30%.
    // If Biology has already been researched, increase it by + 10 % instead.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: 1.083, // 1.3 / 1.2
      type: "passive",
    },
  ],

  "boiling-oil": [
    // Towers and Keeps gain a boiling oil attack against nearby units that deals  damage.
    {
      property: "unknown",
      select: { id: ["stone-wall-tower", "keep", ...common.allKeepLikeLandmarks.id] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  chemistry: [
    // Increase the damage of gunpowder units by +20%.
    {
      property: "rangedAttack",
      select: { class: [["gunpowder"], ["warship"]] },
      effect: "multiply",
      value: 1.2,
      type: "passive",
    },
    {
      property: "siegeAttack",
      select: { class: [["gunpowder"], ["warship"]] },
      effect: "multiply",
      value: 1.2,
      type: "passive",
    },
  ],

  "court-architects": [
    // Increase the health of all buildings by +30%.
    {
      property: "hitpoints",
      select: { class: [["building"], ["landmark"], ["wonder"]] },
      effect: "multiply",
      value: 1.3,
      type: "passive",
    },
  ],

  "efficient-production": [
    // Allow Scholars to garrison in military buildings, boosting production speed by +100%.
    {
      property: "productionSpeed",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "elite-army-tactics": [
    // Increase the health of all melee infantry by +20% and their damage by 20%.
    {
      property: "hitpoints",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: 1.2,
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: 1.2,
      type: "passive",
    },
  ],

  "elite-army-tactics-improved": [
    //  Increase the health of all melee infantry by +30% and their damage by  +30%.
    // If Elite Army Tactics has already been researched, increase health and damage by + 10 % instead.
    {
      property: "hitpoints",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: 1.083, // 1.3 / 1.2
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: 1.083, // 1.3 / 1.2
      type: "passive",
    },
  ],

  "forced-march": [
    // Infantry units gain the Forced March ability.
    // This ability makes them move +100% faster for  10 seconds, but they cannot attack while it is active.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: 2,
      type: "ability",
    },
  ],

  geometry: [
    // Increase the damage of Rams and Trebuchets +30%.
    {
      property: "siegeAttack",
      select: { id: ["battering-ram", "trebuchet"] },
      effect: "multiply",
      value: 1.3,
      type: "passive",
    },
  ],

  "greased-axles": [
    // Increase the movement speed of siege engines by +15%.
    {
      property: "moveSpeed",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "greased-axles-improved": [
    // Increase the movement speed of siege engines by +25%.
    // If Greased Axles has already been researched, increase it by + 10 % instead.
    {
      property: "moveSpeed",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: 1.086, // 1.3 / 1.2
      type: "passive",
    },
  ],

  "hearty-rations": [
    // Increase the carrying capacity of Villagers by +5.
    {
      property: "carryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: 5,
      type: "passive",
    },
  ],

  "herbal-medicine": [
    // Increase the healing rate of religious units by +100%.
    {
      property: "healingRate",
      select: common.allReligiousUnits,
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "herbal-medicine-improved": [
    // Increase the healing rate of religious units by +150%.
    // If Herbal Medicine has already been researched, increase it by + 50 % instead.
    {
      property: "healingRate",
      select: common.allReligiousUnits,
      effect: "multiply",
      value: 1.333, // 2 / 1.5
      type: "passive",
    },
  ],

  "honed-blades": [
    // Increase the melee damage of Men-at-Arms and Knights by +3.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms", "knight", "lancer"] },
      effect: "change",
      value: 3,
      type: "passive",
    },
  ],

  "incendiary-arrows": [
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
      value: 1.2,
      type: "passive",
    },
  ],

  "lookout-towers": [
    // Increase the sight range of Outposts by 50%.
    {
      property: "lineOfSight",
      select: { id: ["outpost"] },
      effect: "multiply",
      value: 1.5,
      type: "passive",
    },
  ],

  "patchwork-repairs": [
    // Increase the repair rate of Fishing Ships by +100%.
    {
      property: "repairRate",
      select: { id: ["fishing-boat", "lodya-fishing-boat"] },
      effect: "multiply",
      value: 1,
      type: "passive",
    },
  ],

  piety: [
    // Increase the health of religious units by +40.
    {
      property: "hitpoints",
      select: common.allReligiousUnits,
      effect: "change",
      value: 40,
      type: "passive",
    },
  ],

  "piety-improved": [
    // Increase the health of religious units by +60.
    // If Piety has already been researched, increase it by + 20 instead.
    {
      property: "hitpoints",
      select: common.allReligiousUnits,
      effect: "change",
      value: 20,
      type: "passive",
    },
  ],

  "professional-scouts": [
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
      value: 9, // 3 + 200% *2
      type: "bonus",
    },
  ],

  "professional-scouts-improved": [
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
      value: 2, // 100% *2
      type: "bonus",
    },
  ],

  "reinforced-foundations": [
    // Houses and Town Centers grant an additional +5 maximum Population.
    {
      property: "maxPopulation",
      select: { id: ["house", "town-center"] },
      effect: "change",
      value: 5,
      type: "passive",
    },
  ],

  "roller-shutter-triggers": [
    // Increase the weapon range of Springalds by +2 tiles and reduce their reload time by  +25%.
    {
      property: "maxRange",
      select: { id: ["springald"] },
      effect: "change",
      value: 2,
      type: "passive",
    },
    {
      property: "attackSpeed",
      select: { id: ["springald"] },
      effect: "multiply",
      value: 0.75,
      type: "passive",
    },
  ],

  "roller-shutter-triggers-improved": [
    // Increase the weapon range of Springalds by +3 tiles and reduce their reload time by  +35%.
    // If Roller Shutter Triggers has already been researched, increase the weapon range of Springalds by +1 tile and reduce their reload time by  +10%.
    {
      property: "maxRange",
      select: { id: ["springald"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
    {
      property: "attackSpeed",
      select: { id: ["springald"] },
      effect: "multiply",
      value: 0.8666, // 0.65 / 0.75
      type: "passive",
    },
  ],

  sanctity: [
    // Allow Scholars to capture Sacred Sites before the Castle Age (III). Sacred Sites generate +100% more Gold.
    {
      property: "goldGeneration",
      select: { id: ["sacred-site"] },
      effect: "multiply",
      value: 1.5,
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

  "siege-elephant": [
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

  "siege-works": [
    // Increase the health of siege engines by +20% and their ranged armor by  +10.
    {
      property: "hitpoints",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: 1.2,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { class: [["siege"]] },
      effect: "change",
      value: 10,
      type: "passive",
    },
  ],

  "siege-works-improved": [
    // Increase the health of siege engines by +30% and their ranged armor by  +4.
    // If Siege Works has already been researched, increase their health by  +10% and ranged armor by  +1 instead.
    {
      property: "hitpoints",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: 1.0833, // 1.3 / 1.2
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { class: [["siege"]] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "slow-burning-defenses": [
    // Increase the fire armor of Stone Wall Towers, Keeps, and Outposts by +10.
    {
      property: "fireArmor",
      select: { id: ["stone-wall-tower", "keep", "outpost"] },
      effect: "change",
      value: 10,
      type: "passive",
    },
  ],

  swiftness: [
    // Increase the movement speed of Scholars by +100%.
    {
      property: "moveSpeed",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  textiles: [
    // Increase Villagers' health by +25.
    {
      property: "hitpoints",
      select: { id: ["villager"] },
      effect: "change",
      value: 25,
      type: "passive",
    },
  ],

  "textiles-improved": [
    // Increase Villagers' health by +50, if already researched by +25.
    {
      property: "hitpoints",
      select: { id: ["villager"] },
      effect: "change",
      value: 25,
      type: "passive",
    },
  ],

  // Todo, unsure if it also applies to regnitz catherdral
  // Todo encode
  "tithe-barns": [
    // Relics placed in a Monastery provide an income of +30 Food, undefined Wood, and undefined Stone every minute.
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: 30,
      type: "influence",
    },
  ],

  "tithe-barns-improved": [
    //  Relics placed in a Prayer Tent provide an income of +20 Food, +20 Wood, and +20 Stone every minute.
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: 20,
      type: "influence",
    },
  ],

  "tranquil-venue": [
    // Mosques restore +1 health to nearby unit every second.
    {
      property: "healingRate",
      select: { id: ["mosque"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "village-fortresses": [
    // Keeps act like Town Centers, including unit production, population capacity, and technology.
    {
      property: "unknown",
      select: { id: ["keep"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  zeal: [
    // Units healed by Scholars gain +50% attack speed for  3 seconds.
    {
      property: "attackSpeed",
      select: { class: [["infantry"], ["cavalry"]], id: ["scholar"] },
      effect: "multiply",
      value: 1.5,
      type: "influence",
    },
  ],

  agriculture: [
    // Improve Villagers' gathering rate from Farms by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager", "farm"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "armored-caravans": [
    // Grant +5 armor to Traders and Trade Ships.
    {
      property: "meleeArmor",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: 5,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: 5,
      type: "passive",
    },
  ],

  "boot-camp": [
    // Increase the health of all infantry by +15%.
    {
      property: "hitpoints",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "camel-barding": [
    // Increase the armor of camel riders by +2.
    {
      property: "meleeArmor",
      select: { id: ["camel-rider"] },
      effect: "change",
      value: 2,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["camel-rider"] },
      effect: "change",
      value: 2,
      type: "passive",
    },
  ],

  "camel-handling": [
    // Increase the movement speed of camel units by +15%.
    {
      property: "moveSpeed",
      select: { id: ["camel-rider", "camel-archer"] },
      effect: "multiply",
      value: 1.15,
      type: "passive",
    },
  ],

  "camel-rider-shields": [
    // Grant Camel Riders shields, improving their melee armor by +3.
    {
      property: "meleeArmor",
      select: { id: ["camel-rider"] },
      effect: "change",
      value: 3,
      type: "passive",
    },
  ],

  "camel-support": [
    // Camels increase the armor of nearby infantry by +2.
    {
      property: "meleeArmor",
      select: { class: [["infantry"]], id: ["camel-rider", "camel-archer"] },
      effect: "change",
      value: 2,
      type: "influence",
    },
  ],

  "composite-bows": [
    // Reduce the reload time of Archers by -25%.
    {
      property: "attackSpeed",
      select: { id: ["archer"] },
      effect: "multiply",
      value: 0.75,
      type: "passive",
    },
  ],

  //   "culture-wing": [
  //     // Constructs the Culture Wing.
  //     // The following cultural technologies become available:
  //     // • Preservation of Knowledge (Feudal Age)
  //     // • Medical Centers (Castle Age)
  //     // • Faith (Imperial Age)
  //     {
  //       property: "",
  //       select: { class: [[]] },
  //       effect: "change",
  //       value: 1,
  //     },
  //   ],

  //   "economic-wing": [
  //     // Constructs the Economic Wing.
  //     // The following economic technologies become available:
  //     // • Fresh Foodstuffs (Feudal Age)
  //     // • Agriculture (Castle Age)
  //     // • Improved Processing (Imperial Age)
  //     {
  //       property: "",
  //       select: { class: [[]] },
  //       effect: "change",
  //       value: 1,
  //     },
  //   ],

  faith: [
    // Imams can convert units without holding a Relic, but can only target a single unit.
    {
      property: "unknown",
      select: { id: ["imam"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "fresh-foodstuffs": [
    // Reduce the cost to produce Villagers by -50%.
    {
      property: "foodCost",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 0.5,
      type: "passive",
    },
  ],

  "grand-bazaar": [
    // Traders also return with a secondary resource. This resource is 0.25 the base Gold value and is set at the market.
    {
      property: "unknown",
      select: { id: ["trader"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "improved-processing": [
    // Villagers drop off +8% more resources.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 1.08,
      type: "passive",
    },
  ],

  "medical-centers": [
    // Keeps heal nearby units for +2 health every  1s second.
    {
      property: "healingRate",
      select: { id: ["keep"] },
      effect: "change",
      value: 2,
      type: "influence",
    },
  ],

  //   "military-wing": [
  //     // Constructs the Military Wing.
  //     // The following military technologies become available:
  //     // • Camel Support (Feudal Age)
  //     // • Camel Rider Shields (Castle Age)
  //     // • Boot Camp (Imperial Age)
  //     {
  //       property: "",
  //       select: { class: [[]] },
  //       effect: "change",
  //       value: 1,
  //     },
  //   ],

  phalanx: [
    // Increase the attack range of Spearmen by +100%.
    {
      property: "maxRange",
      select: { id: ["spearman"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "preservation-of-knowledge": [
    // Reduce the cost of all technology by -30%.
    {
      property: "goldCost",
      select: { class: [["technology"]] },
      effect: "multiply",
      value: 0.7,
      type: "passive",
    },
    {
      property: "woodCost",
      select: { class: [["technology"]] },
      effect: "multiply",
      value: 0.7,
      type: "passive",
    },
  ],

  "spice-roads": [
    // Increase the Gold income from Traders by +30%.
    {
      property: "goldGatherRate",
      select: { id: ["traders"] },
      effect: "multiply",
      value: 1.3,
      type: "passive",
    },
  ],

  "teak-masts": [
    // Increase the health of Dhows by +100.
    {
      property: "hitpoints",
      select: { id: ["dhow"] },
      effect: "change",
      value: 100,
      type: "passive",
    },
  ],

  //   "trade-wing": [
  //     // Constructs the Trade Wing.
  //     // The following trade technologies become available:
  //     // • Spice Roads (Feudal Age)
  //     // • Armored Caravans (Castle Age)
  //     // • Grand Bazaar (Imperial Age)
  //     {
  //       property: "",
  //       select: { class: [[]] },
  //       effect: "change",
  //       value: 1,
  //     },
  //   ],

  // Todo, add improved version

  "additional-torches": [
    // Increase the torch damage of all infantry and cavalry by +3.
    {
      property: "fireAttack",
      select: { class: [["infantry"], ["cavalry", "melee"]] },
      effect: "change",
      value: 3,
      type: "passive",
    },
  ],

  "additional-torches-improved": [
    // Increase the torch damage of all infantry and cavalry by +5.
    // If Additional Torches has already been researched, increase the torch damage from all infantry and cavalry by  +2.
    {
      property: "fireAttack",
      select: { class: [["infantry"], ["cavalry", "melee"]] },
      effect: "change",
      value: 2,
      type: "passive",
    },
  ],

  // Increase the torch damage of all infantry and cavalry by +5.\nIf Additional Torches has already been researched, increase the torch damage from all infantry and cavalry by  +2.

  "monastic-shrines": [
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
  piracy: [
    // Gain +50 Wood and  +50 Gold when sinking an enemy ship.
    {
      property: "unknown",
      select: { id: ["light-junk", "explosive-junk", "war-junk", "baochuan"] },
      effect: "change",
      value: 50,
      type: "ability",
    },
  ],

  "raid-bounty": [
    // Increase the raid income for igniting a building to +25 Food and Gold.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "raid-bounty-improved": [
    // Increase the raid income for igniting a building to +50 Food and Gold.
    // If Raid Bounty has already been researched, increase the raid income for igniting a building by  +25 Food and Gold.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "siha-bow-limbs": [
    // Increase the ranged damage of Mangudai and the Khan by +1.
    {
      property: "rangedAttack",
      select: { id: ["khan", "mangudai"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "siha-bow-limbs-improved": [
    // ncrease the ranged damage of Mangudai and the Khan by +2.
    // If Siha Bow Limbs has already been researched, increase the ranged damage of Mangudai and the Khan by + 1.
    {
      property: "rangedAttack",
      select: { id: ["khan", "mangudai"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "stone-bounty": [
    // Add +75 Stone to the raid income for igniting a building.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "stone-bounty-improved": [
    // Add +125 Stone to the raid income for igniting a building.
    // If Stone Bounty has already been researched, add  +50 Stone to the raid income for igniting a building.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "stone-commerce": [
    // Having 9 or more active Traders causes them to supply of Stone as well as Gold.
    {
      property: "unknown",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "stone-commerce-improved": [
    // Having 9 or more active Traders causes them to supply an increased amount of Stone as well as Gold.
    {
      property: "unknown",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "superior-mobility": [
    // Packed buildings move and pack/unpack 50% faster.
    {
      property: "moveSpeed",
      select: { class: [["building"]] },
      effect: "multiply",
      value: 1.5,
      type: "ability",
    },
  ],

  "whistling-arrows": [
    // Increase the Khan's Signal Arrow duration by +5 seconds and range by  +2 tiles.
    {
      property: "unknown",
      select: { id: ["khan"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "whistling-arrows-improved": [
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

  "yam-network": [
    // Yam speed aura applies to all units instead of just Traders and cavalry units.
    {
      property: "unknown",
      select: { class: [["infantry"], ["siege"]] },
      effect: "change",
      value: 1,
      type: "influence",
    },
  ],

  "banded-arms": [
    // Increase the range of Springald by +0.5 tiles.
    {
      property: "maxRange",
      select: { id: ["springald"] },
      effect: "change",
      value: 0.5,
      type: "passive",
    },
  ],

  "blessing-duration": [
    // Increase the duration of Saint's Blessing by 10 seconds.
    {
      property: "unknown",
      select: { id: ["warrior-monk"] },
      effect: "change",
      value: 10,
      type: "influence",
    },
  ],

  "boyars-fortitude": [
    // Increase the health of Rus cavalry by +20.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "change",
      value: 20,
      type: "passive",
    },
  ],

  "cedar-hulls": [
    // Increase the health of Lodya Attack Ships by +200 and their ranged armor by  +1.
    {
      property: "hitpoints",
      select: { id: ["lodya-attack-ship"] },
      effect: "change",
      value: 200,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["lodya-attack-ship"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "clinker-construction": [
    // Increase the health of Lodya Attack Ships by +200.
    {
      property: "hitpoints",
      select: { id: ["lodya-attack-ship"] },
      effect: "change",
      value: 200,
      type: "passive",
    },
  ],

  "double-time": [
    // Streltsy gain the Double Time ability, which increases their movement speed by +30% for  10 seconds.
    {
      property: "moveSpeed",
      select: { id: ["streltsy"] },
      effect: "multiply",
      value: 1.3,
      type: "ability",
    },
  ],

  "fine-tuned-guns": [
    // Reduce the reload time of Bombards by -20%.
    {
      property: "attackSpeed",
      select: { id: ["bombard"] },
      effect: "multiply",
      value: 0.8,
      type: "passive",
    },
  ],

  "improved-blessing": [
    // Improve the damage granted by Saint's Blessing by +1.
    {
      property: "unknown",
      select: { class: [["infantry"], ["cavalry"]], id: ["warrior-monk"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "knight-sabers": [
    // Increase the melee damage of Knights by +4.
    {
      property: "meleeAttack",
      select: { id: ["knight"] },
      effect: "change",
      value: 4,
      type: "passive",
    },
  ],

  "mounted-precision": [
    // Increases the Horse Archers weapon range by 1.
    {
      property: "maxRange",
      select: { id: ["horse-archer"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "saints-reach": [
    // Increase the range of Saint's Blessing by 3 tiles.
    {
      property: "unknown",
      select: { id: ["warrior-monk"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ],

  "siege-crew-training": [
    // Setup and teardown speed of Trebuchets and Magonels is instant.
    {
      property: "attackSpeed",
      select: { id: ["trebuchet", "mangonel"] },
      effect: "change",
      value: 0, // Todo, figure out real timings
      type: "passive",
    },
  ],

  "wandering-town": [
    // Ram damage increased by +100%.
    {
      property: "siegeAttack",
      select: { id: ["battering-ram"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ],

  "castle-turret": [
    // Increase the damage of arrows fired from this Wooden Fortress by +2.
    {
      property: "rangedAttack",
      select: { id: ["wooden-fortress"] },
      effect: "change",
      value: 2,
      type: "passive",
    },
  ],

  "castle-watch": [
    // Increase the sight range of this Wooden Fortress by 6 tiles.
    {
      property: "lineOfSight",
      select: { id: ["wooden-fortress"] },
      effect: "change",
      value: 6,
      type: "passive",
    },
  ],

  "arrow-slits": [
    // Add defensive arrowslits to this structure.
    {
      property: "rangedAttack",
      select: { id: ["wooden-fortress", "outpost"] },
      effect: "change",
      value: 10,
      type: "passive",
    },
    {
      property: "maxRange",
      select: { id: ["wooden-fortress", "outpost"] },
      effect: "change",
      value: 8,
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: { id: ["wooden-fortress", "outpost"] },
      target: { class: [["ship"]] },
      effect: "change",
      value: 25,
      type: "bonus",
    },
    {
      property: "attackSpeed",
      select: { id: ["wooden-fortress", "outpost"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ],

  "handcannon-slits": [
    // Add defensive handcannon slits to this structure.
    {
      property: "rangedAttack",
      select: { id: ["outpost"] },
      effect: "change",
      value: 25,
      type: "passive",
    },
    {
      property: "maxRange",
      select: { id: ["outpost"] },
      effect: "change",
      value: 8,
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: { id: ["outpost"] },
      target: { class: [["ship"]] },
      effect: "change",
      value: 25,
      type: "bonus",
    },
    {
      property: "attackSpeed",
      select: { id: ["outpost"] },
      effect: "change",
      value: 3,
      type: "passive",
    },
  ],

  "springald-emplacement": [
    // Add a defensive springald emplacement to this structure.
    {
      property: "rangedAttack",
      select: { id: ["wooden-fortress", "outpost", "keep"] },
      effect: "change",
      value: 40,
      type: "passive",
    },
    {
      property: "maxRange",
      select: { id: ["wooden-fortress", "outpost", "keep"] },
      effect: "change",
      value: 9,
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: { id: ["wooden-fortress", "outpost", "keep"] },
      target: { class: [["ship"]] },
      effect: "change",
      value: 40,
      type: "bonus",
    },
    {
      property: "attackSpeed",
      select: { id: ["wooden-fortress", "outpost", "keep"] },
      effect: "change",
      value: 4.5,
      type: "passive",
    },
  ],

  "cannon-emplacement": [
    // Add a defensive cannon emplacement to this structure.
    {
      property: "rangedAttack",
      select: { id: ["outpost", "keep"] },
      effect: "change",
      value: 70,
      type: "passive",
    },
    {
      property: "maxRange",
      select: { id: ["outpost", "keep"] },
      effect: "change",
      value: 10,
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: { id: ["outpost", "keep"] },
      target: { class: [["ship"]] },
      effect: "change",
      value: 70,
      type: "bonus",
    },
    {
      property: "attackSpeed",
      select: { id: ["outpost", "keep"] },
      effect: "change",
      value: 7,
      type: "passive",
    },
  ],

  "fortify-outpost": [
    // Add +1000 health and  +5 fire armor to this Outpost.
    {
      property: "hitpoints",
      select: { id: ["outpost"] },
      effect: "change",
      value: 1000,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["outpost"] },
      effect: "change",
      value: 5,
      type: "passive",
    },
    {
      property: "meleeArmor",
      select: { id: ["outpost"] },
      effect: "change",
      value: 5,
      type: "passive",
    },
  ],
};
