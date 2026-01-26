/** A configuration of technology ids and their modiying effects. */

import { captureCallContext } from "../lib/utils/processors";
import { Item, Modifier, Selector } from "../types/items";

interface EffectsFactory {
  call(format: string | undefined, values: number[], item: Item): Modifier[];
}

class ModifierHandler implements EffectsFactory {
  helptext: string[] | null;
  handler: (values: number[], item: Item) => Modifier[];
  context: string;

  constructor(helptext: string | string[] | null, handler: (values: number[], item: Item) => Modifier[], context: string | null) {
    this.helptext = helptext !== null ? [helptext].flat() : null;
    this.handler = handler;
    this.context = context || captureCallContext(1);
  }

  call(helptext: string | undefined, values: number[], item: Item) {
    this.verifyHelptext(helptext);
    return this.handler(values, item);
  }

  verifyHelptext(helptext?: string) {
    if (this.helptext === null) {
      return;
    }

    if (!helptext) {
      console.log(`[Warning] ${this.context}: AOEParser: Modifier has no helptext (Expected: ${JSON.stringify(this.helptext)})`);
      return;
    }

    helptext = helptext.trim().replace(/(?:\\r|\\n)+/mg, '\n');
    helptext = helptext.replace(/%(\d+)%/mg, "{$1}").replace(/%%/mg, "%");

    if (this.helptext[0] === "") {
      console.log(`[Info] ${this.context}: AOEParser: Modifier with missing expected helptexts (Found: ${JSON.stringify(helptext)})`);
    } else if (!this.helptext.includes(helptext)) {
      console.log(`[Error] ${this.context}: AOEParser: Modifier help text changed (Found: ${JSON.stringify(helptext)}) (Expected: ${JSON.stringify(this.helptext)})`);
    }
  }
}

function standardAbility(helptext: string | string[] | null, handler: (values: number[], item: Item) => Modifier[]) {
  return new ModifierHandler(
    helptext,
    handler,
    captureCallContext(1, 1)
  );
}

function placeholderAbility(helptext: string | string[] | null, select: Selector): EffectsFactory {
  return new ModifierHandler(
    helptext,
    (values: number[], item: Item): Modifier[] => {
      return [
        {
          property: "unknown",
          select,
          effect: "change",
          value: 0,
          type: "ability"
        }
      ]
    },
    captureCallContext(1, 1)
  );
}

// This helper converts the abilities that don't yet use standardAbility/placeholderAbility
function sanitizeModifierGenerator(hash: Record<string, EffectsFactory | ((values: number[], item: Item) => Modifier[])>): Record<string, EffectsFactory> {

  for (const key of Object.keys(hash)) {
    if (typeof hash[key] === 'function') {
      hash[key] = new ModifierHandler("", hash[key], key);
    }
  }
  return hash as Record<string, EffectsFactory>;
}

// Common class/id presets
const common = {
  allMeleeUnitsExceptSiege: { class: [["melee"]] } as Required<Modifier>["select"],
  allNonSiegeUnits: { class: [["infantry"], ["cavalry"], ["worker"], ["religious"], ["camel"]] } as Required<Modifier>["select"],
  allMilitaryLand: { class: [["infantry"], ["cavalry", "melee"], ["cavalry", "ranged"], ["siege"]] } as Required<Modifier>["select"],
  allLandUnitsExceptReligiousTrader: { class: [["melee"], ["ranged"], ["siege"]], id: ["villager"] } as Required<Modifier>["select"],
  allLand: { class: [["melee"], ["ranged"], ["siege"], ["cavalry"]], id: ["villager", "trader", "dragon-villager"] } as Required<Modifier>["select"],
  allRangedUnitsAndBuildingsExceptSiege: {
    class: [
      ["ranged", "cavalry"],
      ["archer", "ship"],
    ],
    id: [
      "longbowman",
      "zhuge-nu",
      "archer",
      "arbaletrier",
      "crossbowman",
      "wynguard-ranger",
      "javelin-thrower",
      "gilded-crossbowman",
      "gilded-archer",
      "yumi-ashigaru",
      "zhuge-nu",
      "bedouin-skirmisher",
      "desert-raider",
      "yumi-bannerman",
    ],
  } as Required<Modifier>["select"],
  allMillitaryShips: { class: [["naval_military"]] } as Required<Modifier>["select"],
  allKeepLikeLandmarks: { id: ["berkshire-palace", "elzbach-palace", "kremlin", "spasskaya-tower", "red-palace", "the-white-tower"] } as Required<Modifier>["select"],
  allReligiousUnits: {
    id: ["monk", "scholar", "imam", "dervish", "warrior-monk", "shaman", "prelate", "shinto-priest", "buddhist-monk", "shaolin-monk"],
  } as Required<Modifier>["select"],
  allFishingShips: { id: ["fishing-boat", "lodya-fishing-boat"] } as Required<Modifier>["select"],
  allCamelUnits: { id: ["camel-archer", "camel-rider", "camel-lancer", "desert-raider", "atabeg", "dervish"] } as Required<Modifier>["select"],
  jeannes: {
    all: {
      id: [
        "jeanne-darc-peasant",
        "jeanne-darc-woman-at-arms",
        "jeanne-darc-hunter",
        "jeanne-darc-mounted-archer",
        "jeanne-darc-knight",
        "jeanne-darc-markswoman",
        "jeanne-darc-blast-cannon",
      ],
    } as Required<Modifier>["select"],
    heroes: {
      id: ["jeanne-darc-woman-at-arms", "jeanne-darc-hunter", "jeanne-darc-mounted-archer", "jeanne-darc-knight", "jeanne-darc-markswoman", "jeanne-darc-blast-cannon"],
    } as Required<Modifier>["select"],
    lvl3: { id: ["jeanne-darc-mounted-archer", "jeanne-darc-knight", "jeanne-darc-markswoman", "jeanne-darc-blast-cannon"] } as Required<Modifier>["select"],
    lvl4: { id: ["jeanne-darc-markswoman", "jeanne-darc-blast-cannon"] } as Required<Modifier>["select"],
    archer: { id: ["jeanne-darc-hunter", "jeanne-darc-mounted-archer", "jeanne-darc-markswoman"] } as Required<Modifier>["select"],
    warrior: { id: ["jeanne-darc-woman-at-arms", "jeanne-darc-knight", "jeanne-darc-blast-cannon"] } as Required<Modifier>["select"],
  },
} as const;

const toPercent = (percent: number) => (percent == 33 ? 1 / 3 : Math.abs(percent) / 100);
const increaseByPercent = (n: number, percent: number) => round(n * (1 + toPercent(percent)));
const decreaseByPercent = (n: number, percent: number) => round(n * (1 - toPercent(percent)));
const increaseByPercentImproved = (n: number, percent: number, delta: number) => round((n * (1 + toPercent(percent))) / (1 + (Math.abs(percent) - Math.abs(delta)) / 100));
const decreaseByPercentImproved = (n: number, percent: number, delta: number) => round((n * (1 - toPercent(percent))) / (1 - (Math.abs(percent) - Math.abs(delta)) / 100));
const increaseSpeedByPercent = (speed: number, percent: number) => round(speed / (1 + toPercent(percent)) / 10) * 10;
const increaseAttackSpeedByPercent = (percent: number) => round(1 / (1 + percent / 100));
const round = (n: number) => Math.round(n * 100) / 100; //(100/(100-33))

export const abilityModifiers: Record<string, EffectsFactory> = {
  "ability-ring-the-town-bell": placeholderAbility(
    "Alerts and orders all nearby Villagers to automatically seek shelter in the nearest garrisonable building.",
    { id: ["capital-town-center", "town-center"] }
  ),

  "ability-fortress-influence": placeholderAbility(
    "The Templar Headquarters and Fortresses grant Stone Walls in influence +{1}% health and an arrowslit emplacement.",
    { id: ["capital-town-center", "fortress"] }
  ),

  "ability-lancaster-castle": standardAbility(
    "Manors gain +{1} health and an arrowslit emplacement when in influence of the Lancaster Castle.",
    ([h]) => [
      {
        property: "hitpoints",
        select: { id: ["lancaster-castle"] },
        target: { id: ["manor"] },
        effect: "change",
        value: h,
        type: "influence",
      },
    ]
  ),

  "ability-treasure-caravans": placeholderAbility(
    "Select a neutral Trade Post to periodically spawn Treasure Caravans from that location. Caravans can convert into a Trade Ship when instructed to reach Trade Posts over water.",
    { id: ["castle-of-the-crow"] }
  ),

  "ability-deflective-armor": placeholderAbility(
    "Deflective Armor charge can block one melee or ranged attack. Recharges while out of combat for {1} seconds.",
    { id: ["samurai", "mounted-samurai", "yumi-bannerman", "katana-bannerman", "uma-bannerman"] }
  ),

  "ability-kabura-ya": standardAbility(
    "Onna-Musha fire a whistling arrow when an enemy is seen, increasing move speed for {1} seconds.",
    ([d]) => [
      {
        property: "moveSpeed",
        select: { id: ["onna-musha"] },
        effect: "change",
        value: 0,
        type: "ability",
        duration: d,
      },
    ]
  ),

  "ability-katana-bannerman-aura": standardAbility(
    "",
    ([i]) => [
    // Aura that increases melee infantry damage by +15%.\nBanner drops on death and lasts for 30 seconds providing the same aura.
    {
      property: "meleeAttack",
      select: { class: [["melee", "infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "ability-yumi-bannerman-aura": standardAbility(
    "",
    ([i]) => [
    // Aura that increases ranged infantry damage by +15%.\nBanner drops on death and lasts for 30 seconds providing the same aura.
    {
      property: "rangedAttack",
      select: { class: [["ranged", "infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "ability-uma-bannerman-aura": standardAbility(
    "Aura that increases cavalry unit damage by +{1}%.\nBanner drops on death and lasts for {2} seconds providing the same aura.",
    ([i]) => [
      {
        property: "meleeAttack",
        select: { class: [["cavalry"]] },
        effect: "multiply",
        value: increaseByPercent(1, i),
        type: "ability",
      },
    ]
  ),

  "ability-spy": placeholderAbility(
    "Target a visible enemy unit or structure to disguise the Shinobi as a Villager of that player.",
    { id: ["shinobi"] }
  ),

  "ability-shunshin": placeholderAbility(
    "Drop a smoke bomb and reappear at a selected location.",
    { id: ["shinobi"] }
  ),

  "ability-sabotage": placeholderAbility(
    "Target a visible enemy building to deal {1} damage, disable its production, and set it on fire for {2} seconds.",
    { id: ["shinobi"] }
  ),

  "ability-place-yorishiro": standardAbility(
    "",
    () => [
    {
      // Place a Yorishiro in buildings to receive bonuses and increase line of sight.\nTown Center: +25% Production speed\nFarmhouse: +75 Food per minute\nLumber Camp: +75 Wood per minute\nForge: +75 Gold per minute\nMilitary and Docks: +200% Work rate\nWonder: +4000 Health
      property: "unknown",
      select: {
        id: [
          "farmhouse",
          // "outpost",
          "barracks",
          "lumber-camp",
          "dock",
          "forge",
          "archery-range",
          // "market",
          "stable",
          "capital-town-center",
          "siege-workshop",
          // "shinto-shrine",
          // "buddhist-temple",
          "tanegashima-gunsmith",
          "castle-of-the-crow",
          // "castle",
          "tokugawa-shrine",
          "town-center",
        ],
      },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-soheis-sutra": standardAbility(
    "",
    ([r, d]) => [
    // Reduces enemy damage by 50% for 60 seconds.
    {
      property: "unknown",
      select: { id: ["buddhist-monk"] },
      effect: "change",
      value: 0,
      type: "ability",
      duration: d,
    },
  ]
  ),

  "ability-talented-builder": placeholderAbility(
    "Jeanne constructs buildings {1}% faster.\nUpon reaching level 2, Jeanne shares her talents with nearby builders.",
    { id: ["jeanne-darc-peasant"] }
  ),
  "ability-journey-of-a-hero": placeholderAbility(
    "Jeanne generates experience for completing tasks such as gathering resources, constructing buildings, hunting boar, capturing Sacred Sites, and participating in combat. Jeanne also gains a small trickle of experience over time.\nAfter earning sufficient experience Jeanne can level up, becoming more powerful and gaining access to unique abilities.",
    { id: ["jeanne-darc-peasant"] }
  ),
  "ability-return-of-the-saint": placeholderAbility(
    "Pay tribute and instantly return Jeanne to the battlefield.",
    { id: ["capital-town-center"] }
  ),
  "ability-construct-the-kingdom": placeholderAbility(
    "Nearby Villagers construct buildings {1}% faster.",
    { id: ["villager"] }
  ),
  "ability-honorable-heart": placeholderAbility(
     "Jeanne regenerates {1}/{2}/{3}/{4} health per second while out of combat based on her current level.\nAt level 3 Jeanne takes {5}% less damage from ranged attacks; at level 4 this is increased to {6}%.",
    common.jeannes.all
  ),
  "ability-consecrate": placeholderAbility(
    "Jeanne consecrates a production building, reducing the Food cost of units by -{1}%.\nNo Cooldown\nRecharge Time: {2} Seconds.\nMax Charges: {3}.",
    common.jeannes.heroes
  ),
  "ability-divine-restoration": placeholderAbility(
    "Jeanne and nearby allies are blessed, instantly healing for {1}% of their missing health.\nCooldown: {2} Seconds.",
    common.jeannes.heroes
  ),
  "ability-divine-arrow": placeholderAbility(
    "",
    common.jeannes.archer
  ),
  "ability-holy-wrath": placeholderAbility(
    "",
    common.jeannes.warrior
  ),
  "ability-jeannes-companions": placeholderAbility(  //keep
    "Achieve level 3 with Jeanne d'Arc to select between Champions and Riders to be trained at the keep.",
    { id: ["keep", "red-palace"] }
  ),
  "ability-galvanize-the-righteous": placeholderAbility(
    "Companions close to Jeanne gain +{1}/{1} armor and +{2}% damage.",
    common.jeannes.lvl3
  ),
  "ability-riders-ready": placeholderAbility(
    "Jeanne calls {1} Riders to her side.\nCooldown: {3} Seconds.",
    common.jeannes.lvl3
  ),
  "ability-to-arms-men": placeholderAbility(
    "Jeanne calls {1} Champions to her side.\nCooldown: {3} Seconds.",
    common.jeannes.lvl3
  ),
  "ability-strength-of-heaven": placeholderAbility(
    "Jeanne chooses a unit to bless, bestowing them with incredible strength and durability. The chosen warrior gains {1} health, {2} Melee and Ranged Armor, and +{3}% damage.\nJeanne may only bless one unit at a time.\nCooldown: {4} Seconds.",
    common.jeannes.lvl4
  ),
  "ability-valorous-inspiration": placeholderAbility(
    "Increases the attack speed of all units within {1} tiles by {2}% for {3} seconds.\nCooldown: {4} Seconds.",
    common.jeannes.lvl4
  ),

  "ability-camel-unease": placeholderAbility(
    "Camels cause enemy horse cavalry units to deal 20% less damage.",
    common.allCamelUnits
  ),
  "ability-atabeg-supervision": placeholderAbility(
    "Garrison inside of a military production building to grant +{1}% health to newly trained units. Cannot garrison in Docks.",
    { id: ["atabeg"], class: [["building", "military"]] }
  ),
  "ability-desert-raider-blade": placeholderAbility(
    "Swap to a melee Sword weapon.",
    { id: ["desert-raider"] }
  ),
  "ability-desert-raider-bow": placeholderAbility(
    "Swap to a ranged Bow weapon.",
    { id: ["desert-raider"] }
  ),
  "ability-mass-heal": placeholderAbility(
    "Heals all nearby units. Heals +{1}% times faster when carrying a relic.",
    common.allLand
  ),
  "ability-tactical-charge": placeholderAbility(
    "Camel Lancers charge faster, more often, and for longer distances than other heavy cavalry. Camel Lancers deals -{1}% less baseline charge damage. Each second spent charging increases the charge damage (up to +{2}%).",
    { id: ["camel-lancer"] }
  ),
  "ability-swap-weapon-kinetic": placeholderAbility(
    "Switch to solid ammunition, which deals higher damage.",
    { id: ["manjaniq"] }
  ),
  "ability-swap-weapon-incendiary": placeholderAbility(
    "Switch to incendiary ammunition, which deals damage in an increased area.",
    { id: ["manjaniq"] }
  ),
  "ability-quick-strike": placeholderAbility(
    "Quickly deals a second hit after finishing an attack.",
    { id: ["ghulam"] }
  ),
  "ability-structural-reinforcements": standardAbility(
    "Siege unit gains +{1} melee armor and +{2} fire armor for {3} seconds.\nCosts {4} Wood to activate, only useable on one unit at a time.",
    ([m, f, d]) => [
      {
        property: "meleeArmor",
        select: { class: [["siege"]] },
        effect: "change",
        value: m,
        type: "ability",
        duration: d,
      },
      {
        property: "fireArmor",
        select: { class: [["siege"]] },
        effect: "change",
        value: f,
        type: "ability",
        duration: d,
      },
    ]
  ),

  "ability-bounty-of-solitude": placeholderAbility(
    "Generates resources depending on the type of resources nearby. Enemy units within {1} tiles reduce the rate at which resources are generated.",
    { id: ["meditation-gardens"] }
  ),

  "ability-divine-charge": standardAbility(
    "",
    ([d]) => [
    // Cavalry units deal +20% damage.
    {
      property: "meleeAttack",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: increaseByPercent(1, 20),
      type: "ability",
      duration: d,
    },
  ]
  ),

  "ability-divine-defense": standardAbility(
    "",
    ([d]) => [
    // Gunpowder units and defensive structures gain +1 range.
    {
      property: "maxRange",
      select: { class: [["gunpowder"]], id: ["outpost", "keep", "stone-wall-tower"] },
      effect: "change",
      value: 1,
      type: "ability",
      duration: d,
    },
    {
      property: "unknown",
      select: { id: ["temple-of-the-sun"] },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-divine-haste": standardAbility(
    "",
    ([m]) => [
    // Infantry units move 15% faster.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]] },
      effect: "change",
      value: m,
      type: "ability",
    },
    {
      property: "unknown",
      select: { id: ["temple-of-the-sun"] },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-divine-vitality": standardAbility(
    "",
    ([h]) => [
    // Units out of combat heal 2 health per second.
    {
      property: "healingRate",
      select: common.allLand,
      effect: "change",
      value: h,
      type: "ability",
    },
    {
      property: "unknown",
      select: { id: ["temple-of-the-sun"] },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-ascetic-recovery": placeholderAbility(
    "The Shaolin Monk regains health when out of combat.",
    { id: ["shaolin-monk"] }
  ),

  "ability-body-of-iron": placeholderAbility(
    "The Shaolin Monk hardens his body and reduces incoming ranged damage by {1}% for {2} seconds.",
    { id: ["shaolin-monk"] }
  ),

  "ability-supervise": placeholderAbility(
    "Supervise a research, production, or drop-off building with an Imperial Official to make it work {1}% faster. Resource drop-off buildings receive {2}% more resources. Cannot be used on Landmarks, Town Centers, or Docks.",
    { id: ["imperial-official"] }
  ),

  // Arm nearby Villagers with stronger weapons and increase their armor by +2 for 30 seconds.
  "ability-akritoi-defense": standardAbility(
    "",
    ([a, d]) => [
    {
      property: "meleeArmor",
      select: { id: ["villager"] },
      effect: "change",
      value: a,
      type: "ability",
      duration: d,
    },
    {
      property: "rangedArmor",
      select: { id: ["villager"] },
      effect: "change",
      value: a,
      type: "ability",
      duration: d,
    },
  ]
  ),

  "ability-automatic-pilgrim-flask-off": placeholderAbility(
    "Toggle on to activate automatic drinking when low health, rapidly increasing health regeneration by {1} per second for {2} seconds.",
    common.allNonSiegeUnits
  ),

  "ability-pilgrim-flask": placeholderAbility(
    "Activate to drink, rapidly increasing health regeneration by {1} per second for {2} seconds.\nFlasks available: {3}",
    common.allNonSiegeUnits
  ),

  "ability-conscriptio": placeholderAbility(
    "Military unit production rate increased +{1}%/+{2}%/+{3}%/+{4}%/+{5}% by Water Level while within the influence of a Cistern.",
    { class: [["military", "building"]] }
  ),

  "ability-dialecticus": placeholderAbility(
    "Research rate increased +{1}%/+{2}%/+{3}%/+{4}%/+{5}% by Water Level while within the influence of a Cistern.",
    { class: [["building"]] }
  ),

  "ability-praesidium": placeholderAbility(
    "Building damage taken decreased by -{1}%/-{2}%/-{3}%/-{4}%/-{5}% by Water Level while within the influence of a Cistern.",
    { class: [["building"]] }
  ),

  // Line of sight increased by 7 tiles. (on houses)
  "ability-border-settlement": standardAbility(
    "Line of sight increased by {1} tiles.",
    ([los]) => [
    {
      property: "lineOfSight",
      select: { id: ["house"] },
      effect: "change",
      value: los,
      type: "ability",
    },
  ]
  ),

  // Consume all Supply Points to increase cavalry damage by +25%, move speed by +10%, and health regeneration by +2. \nEach Supply Point increases Triumph's duration by 1.5 seconds. A maximum of 40 Supply Points can be collected.
  "ability-triumph": standardAbility(
    "",
    ([d, m, h]) => [
    {
      property: "meleeAttack",
      select: { class: [["cavalry"]] },
      effect: "change",
      value: 4,
      type: "ability",
    },
    {
      property: "moveSpeed",
      select: { class: [["cavalry"]] },
      effect: "change",
      value: m,
      type: "ability",
    },
    {
      property: "healingRate",
      select: { class: [["cavalry"]] },
      effect: "change",
      value: h,
      type: "ability",
    },
  ]
  ),

  // Varangian Guard swap to their two-handed weapon and deal +6 damage for 30 seconds. Armor is reduced by -4.
  "ability-berserking": standardAbility(
    "",
    ([d, du, a]) => [
    {
      property: "meleeAttack",
      select: { id: ["varangian-guard"] },
      effect: "change",
      value: du,
      type: "ability",
      duration: d,
    },
    {
      property: "meleeArmor",
      select: { id: ["varangian-guard"] },
      effect: "change",
      value: a,
      type: "ability",
      duration: d,
    },
  ]
  ),

  // Charge through enemy units in your path, dealing 10 damage to each one. cataphract
  "ability-trample": standardAbility(
    "",
    ([d]) => [
    {
      property: "meleeAttack",
      select: { id: ["cataphract"] },
      effect: "change",
      value: d,
      type: "ability",
    },
  ]
  ),

  // Enter a defensive stance, decreasing move speed by -25%, attack speed by -25%, and ranged damage taken by -50% .
  "ability-shield-wall": standardAbility(
    "",
    ([d, m, a]) => [
    {
      property: "moveSpeed",
      select: { id: ["limitanei"] },
      effect: "change",
      value: m,
      type: "ability",
      duration: d,
    },
    {
      property: "attackSpeed",
      select: { id: ["limitanei"] },
      effect: "change",
      value: a,
      type: "ability",
      duration: d,
    },
    {
      property: "rangedArmor",
      select: { id: ["limitanei"] },
      effect: "change",
      value: a,
      type: "ability",
      duration: d,
    },
  ]
  ),

  // Torch damage improved by a nearby Scout. (25%)
  "ability-improved-torch": standardAbility(
    "",
    ([d]) => [
    {
      property: "fireAttack",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: increaseByPercent(1, 25),
      type: "ability",
    },
  ]
  ),

  "ability-irrigated": placeholderAbility(
    "Villager gathering rate increased +{1}% by a nearby Cistern.",
    { id: ["villager", "fishing-boat"] }
  ),

  // Villagers generate +10% Olive Oil when fishing.
  "ability-oil-commerce": placeholderAbility(
    "Fishing Boats generate Olive Oil equal to {1}% of Food gathered when fishing.",
    { id: ["trader", "trade-ship"] }
  ),

  "ability-synergistic-crops": placeholderAbility(
    "Farmers and Foragers generate +{1}% Olive Oil around the Grand Winery.",
    { id: ["villager"] }
  ),

  "ability-naval-deployment": placeholderAbility(
    "Increased movement speed after unloading from a Transport Ship.",
    common.allMilitaryLand
  ),

  "ability-field-stones": placeholderAbility(
    "Earn various amounts of Stone from every building constructed.",
    { id: ["villager"] }
  ),

  "ability-arrow-volley": standardAbility(
    "",
    ([s, t]) => [
    // Longbowmen gain Arrow Volley, an activated ability that reduces their time to attack by +1 second for a duration of 6 seconds.
    {
      property: "attackSpeed",
      select: { id: ["longbowman"] },
      effect: "change",
      value: -1 * s,
      type: "ability",
      duration: t,
    },
  ]
  ),

  "ability-setup-camp": standardAbility(
    "",
    ([s]) => [
    // Place a Campfire which increases sight range of nearby units by 30%.
    {
      property: "lineOfSight",
      select: { id: ["scout"] },
      effect: "multiply",
      value: increaseByPercent(1, s),
      type: "ability",
    },
  ]
  ),

  "ability-network-of-castles": standardAbility(
    "When enemies are nearby, this building sounds an alarm, causing nearby units to get a +{1}% increase to attack speed.",
    ([i]) => [
    {
      property: "attackSpeed",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "multiply",
      value: decreaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "ability-network-of-citadels": standardAbility(
    "",
    ([i]) => [
    // When enemies are nearby, this building sounds an alarm, causing nearby units to get a +40% increase to attack speed.
    {
      property: "attackSpeed",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "multiply",
      value: decreaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),


  "ability-the-long-wall": standardAbility(
    "",
    ([]) => [
    // All units standing on Walls gain +25% ranged damage.
    {
      property: "rangedAttack",
      select: { class: [["ranged", "infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, 25),
      type: "ability",
    },
  ]
  ),

  "ability-spirit-way": standardAbility(
    "",
    ([]) => [
    // When a dynasty unit is killed, nearby units receive +20% attack speed and +20 health over 10 seconds.
    {
      property: "attackSpeed",
      select: { id: ["zhuge-nu", "fire-lancer", "grenadier"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(20),
      type: "ability",
      duration: 10,
    },
    {
      property: "healingRate",
      select: { id: ["zhuge-nu", "fire-lancer", "grenadier"] },
      effect: "change",
      value: 2,
      type: "ability",
      duration: 10,
    },
  ]
  ),

  "ability-saints-blessing": standardAbility(
    "",
    ([]) => [
    // After striking an enemy, the Warrior Monk increases the armor and damage of nearby allied Rus military units for a duration.
    // Manual testing produces a default of +1 range and melee armor and +2 damage for 10 second duration and 2 tile range
    // Can be upgraded by two techs for additional +1 damage, +10 second duration, and +5 tile range
    // Ability timer does not reset; has to end and then can restart
    {
      property: "rangedAttack",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "change",
      value: 2,
      type: "ability",
      duration: 10,
    },
    {
      property: "meleeAttack",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "change",
      value: 2,
      type: "ability",
      duration: 10,
    },
    {
      property: "fireAttack",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "change",
      value: 2,
      type: "ability",
      duration: 10,
    },
    {
      property: "siegeAttack",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "change",
      value: 2,
      type: "ability",
      duration: 10,
    },
    {
      property: "rangedArmor",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "change",
      value: 1,
      type: "ability",
      duration: 10,
    },
    {
      property: "meleeArmor",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "change",
      value: 1,
      type: "ability",
      duration: 10,
    },
  ]
  ),

  "ability-high-armory-production-bonus": standardAbility(
    "",
    ([i]) => [
    // The cost of siege engines in nearby Siege Workshops is decreased by 20%.
    {
      property: "goldCost",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: decreaseByPercent(1, i),
      type: "ability",
    },
    {
      property: "woodCost",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: decreaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "ability-static-deployment": standardAbility(
    "",
    ([i]) => [
    // Streltsy gain +30% (i) attack speed after remaining stationary for 10 (j not implemented yet) seconds.
    {
      property: "attackSpeed",
      select: { id: ["streltsy"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(i),
      type: "ability",
    },
  ]
  ),

  "ability-gallop": standardAbility(
    "",
    ([]) => [
    // Activate to move at maximum speed with +2 tile weapon range for 8 seconds.
    {
      property: "moveSpeed",
      select: { id: ["horse-archer"] },
      effect: "change",
      value: 0.38,
      type: "ability",
      duration: 8,
    },
    {
      property: "maxRange",
      select: { id: ["horse-archer"] },
      effect: "change",
      value: 2,
      type: "ability",
      duration: 8,
    },
  ]
  ),

  "ability-kurultai-healing-aura-mon": standardAbility(
    "",
    ([]) => [
    // Nearby units within its aura heal +1 health every 1 second and gain an additional +20% damage.
    // also works for ally but dont have props to capture this yet
    {
      property: "rangedAttack",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "multiply",
      value: increaseByPercent(1, 20),
      type: "ability",
    },
    {
      property: "meleeAttack",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "multiply",
      value: increaseByPercent(1, 20),
      type: "ability",
    },
    {
      property: "fireAttack",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "multiply",
      value: increaseByPercent(1, 20),
      type: "ability",
    },
    {
      property: "siegeAttack",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "multiply",
      value: increaseByPercent(1, 20),
      type: "ability",
    },
    {
      property: "healingRate",
      select: common.allLandUnitsExceptReligiousTrader,
      effect: "change",
      value: 1,
      type: "ability",
    },
  ]
  ),

  "ability-battle-veteran": standardAbility(
    "",
    ([]) => [
    // Heals after every attack performed
    {
      property: "healingRate",
      select: { id: ["keshik"] },
      effect: "change",
      value: 3,
      type: "ability",
    },
  ]
  ),

  "ability-maneuver-arrow": standardAbility(
    "",
    ([i, j]) => [
    // Fire a Signal Arrow that increases the movement speed of nearby units (including the Khan) by +33% for 5 seconds. Does not affect Villagers.
    {
      property: "moveSpeed",
      select: common.allMilitaryLand,
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
      duration: j,
    },
  ]
  ),

  "ability-attack-speed-arrow": standardAbility(
    "",
    ([i, j]) => [
    // Fires a Signal Arrow that increases the attack speed of nearby ranged units (including the Khan) by +50% for 5 seconds.
    {
      property: "attackSpeed",
      select: { class: [["ranged"]] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(i),
      type: "ability",
      duration: j,
    },
  ]
  ),

  "ability-defense-arrow": standardAbility(
    "",
    ([i, j]) => [
    // Fires a Signal Arrow that increases the armor of nearby units (including the Khan) by +2 for 5 seconds
    {
      property: "meleeArmor",
      select: common.allMilitaryLand,
      effect: "change",
      value: i,
      type: "ability",
      duration: j,
    },
    {
      property: "rangedArmor",
      select: common.allMilitaryLand,
      effect: "change",
      value: i,
      type: "ability",
      duration: j,
    },
  ]
  ),

  "ability-yam": standardAbility(
    "",
    ([i]) => [
    // Cavalry and Traders near an Outpost get +15% speed for 10 seconds.
    // does not seem to have a duration outside of the tower aura
    {
      property: "moveSpeed",
      select: { class: [["cavalry"]], id: ["trader"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "ability-outpost-speed-improved-mon": standardAbility(
    "",
    ([]) => [
    // Yam speed aura applies to all units instead of just Traders and cavalry units. Does not apply to siege engines.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]], id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 15),
      type: "ability",
    },
  ]
  ),

  "ability-mehter-speed-bonus": standardAbility(
    "",
    ([i]) => [
    // Movement speed bonus +15%
    {
      property: "moveSpeed",
      select: common.allMilitaryLand,
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "ability-attack-drums-off": standardAbility(
    "",
    ([s]) => [
    // Mehter drums that increase the attack speed of nearby units by +15%.
    {
      property: "attackSpeed",
      select: common.allMilitaryLand,
      effect: "multiply",
      value: increaseAttackSpeedByPercent(s),
      type: "ability",
    },
  ]
  ),

  "ability-melee-defense-drums-off": standardAbility(
    "",
    ([s]) => [
    // Mehter drums that increase the melee armor of nearby units by +2.
    {
      property: "meleeArmor",
      select: common.allMilitaryLand,
      effect: "change",
      value: s,
      type: "ability",
    },
  ]
  ),

  "ability-ranged-defense-drums-off": standardAbility(
    "",
    ([s]) => [
    // Mehter drums that increase the ranged armor of nearby units by +1.
    {
      property: "rangedArmor",
      select: common.allMilitaryLand,
      effect: "change",
      value: s,
      type: "ability",
    },
  ]
  ),

  "ability-fortitude": standardAbility(
    "",
    ([i, j, k]) => [
    // Gain +50% attack speed and receive +50% damage from melee weapons for 10 seconds.
    // activation recharge starts after ability ends...
    {
      property: "attackSpeed",
      select: { id: ["sipahi"] },
      effect: "change",
      value: increaseAttackSpeedByPercent(i),
      type: "ability",
      duration: k,
    },
    {
      property: "unknown",
      select: { id: ["sipahi"] },
      effect: "multiply",
      value: increaseByPercent(1, j),
      type: "ability",
      duration: k,
    },
  ]
  ),

  "ability-blacksmith-and-university-influence": standardAbility(
    "",
    ([s, t, u, v]) => [
    // Military unit production rate increased +20%/+30%/+40% by Age while within the influence of a Blacksmith or University. The Istanbul Observatory increases the bonus to +60%.
    // need another way to handle this
    {
      property: "productionSpeed",
      select: common.allMilitaryLand,
      effect: "multiply",
      value: decreaseByPercent(1, s),
      type: "ability",
    },
    {
      property: "productionSpeed",
      select: common.allMilitaryLand,
      effect: "multiply",
      value: decreaseByPercent(1, t),
      type: "ability",
    },
    {
      property: "productionSpeed",
      select: common.allMilitaryLand,
      effect: "multiply",
      value: decreaseByPercent(1, u),
      type: "ability",
    },
    {
      property: "productionSpeed",
      select: common.allMilitaryLand,
      effect: "multiply",
      value: decreaseByPercent(1, v),
      type: "ability",
    },
  ]
  ),

  "ability-tower-of-victory-aura": standardAbility(
    "",
    ([s]) => [
    // Melee and ranged infantry who move near this Landmark permanently gain +20% attack speed.
    {
      property: "attackSpeed",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(s),
      type: "ability",
    },
  ]
  ),

  "ability-forced-march": standardAbility(
    "",
    ([i, j]) => [
    // Activate to move 100% faster for 10 seconds, deactivates early when dealing damage.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
      duration: j,
    },
  ]
  ),

  "ability-royal-knight-charge-damage": standardAbility(
    "",
    ([damage, seconds]) => [
    // Every description is inaccurate or incomplete...
    {
      property: "meleeAttack",
      select: { id: ["royal-knight"] },
      effect: "change",
      value: 3,
      type: "ability",
      duration: 5,
    },
  ]
  ),

  "ability-deploy-pavise": standardAbility(
    "",
    ([i, j, k]) => [
    // Activate to increase weapon range by +1 tile and gain +5 ranged armor.\nRemains active for 30 seconds or until the Arbalétrier moves away
    {
      property: "maxRange",
      select: { id: ["arbaletrier"] },
      effect: "change",
      value: i,
      type: "ability",
      duration: k,
    },
    {
      property: "rangedArmor",
      select: { id: ["arbaletrier"] },
      effect: "change",
      value: j,
      type: "ability",
      duration: k,
    },
  ]
  ),

  "ability-keep-influence": standardAbility(
    "",
    ([r]) => [
    // Archery Ranges and Stables within influence have unit costs decreased by 20%.
    {
      property: "goldCost",
      select: { class: [["cavalry", "melee"], ["ranged"]] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "ability",
    },
    {
      property: "foodCost",
      select: { class: [["cavalry", "melee"], ["ranged"]] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "ability",
    },
    {
      property: "woodCost",
      select: { class: [["cavalry", "melee"], ["ranged"]] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "ability",
    },
  ]
  ),

  "ability-artillery-shot": standardAbility(
    "",
    ([]) => [
    // Loads this Cannon for an Artillery Shot, next shot has greatly increased Area of Effect but no bonus against buildings.
    {
      property: "areaOfEffect",
      select: { id: ["cannon", "royal-cannon"] },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-activate-stealth": standardAbility(
    "",
    ([i]) => [
    // Enter Stealth for 20 seconds.\nWhile in Stealth, units are invisible until they are revealed by enemy Scouts, Outposts, Landmark Town Centers, or they engage in combat.
    {
      property: "unknown",
      select: { id: ["musofadi-gunner", "musofadi-warrior"] },
      effect: "change",
      value: 0,
      type: "ability",
      duration: i,
    },
  ]
  ),

  "ability-first-strike": standardAbility(
    "",
    ([]) => [
    // Deals increased damage on next hit.
    {
      property: "meleeAttack",
      select: { id: ["musofadi-warrior"] },
      effect: "multiply",
      value: increaseByPercent(1, 100),
      type: "ability",
    },
    {
      property: "rangedAttack",
      select: { id: ["musofadi-gunner"] },
      effect: "multiply",
      value: increaseByPercent(1, 100),
      type: "ability",
    },
  ]
  ),

  "ability-huntress-stealth": standardAbility(
    "",
    ([]) => [
    // Malian infantry within range enter Stealth. While in Stealth, units are invisible until they are revealed by enemy Scouts, Outposts, or when they engage in combat.
    {
      property: "unknown",
      select: { class: [["infantry"]] },
      effect: "change",
      value: 0,
      type: "ability",
      duration: 30,
    },
  ]
  ),

  "ability-camel-support": standardAbility(
    "",
    ([]) => [
    // Infantry gain armor when near a camel unit. / Camels increase the armor of nearby infantry by +2.
    {
      property: "meleeArmor",
      select: { class: [["infantry"]] },
      effect: "change",
      value: 2,
      type: "ability",
    },
    {
      property: "rangedArmor",
      select: { class: [["infantry"]] },
      effect: "change",
      value: 2,
      type: "ability",
    },
  ]
  ),

  "ability-proselytize": standardAbility(
    "",
    ([]) => [
    // Attempts to convert a single enemy unit within range of this Imam to your control.
    {
      property: "unknown",
      select: { id: ["imam"] },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-inspired": standardAbility(
    "",
    ([a, b]) => [
    // Military units deal +15% damage and gain +1 armor. //tested to 60 second duration
    {
      property: "rangedArmor",
      select: common.allMilitaryLand,
      effect: "change",
      value: b,
      type: "ability",
      duration: 60,
    },
    {
      property: "meleeArmor",
      select: common.allMilitaryLand,
      effect: "change",
      value: b,
      type: "ability",
      duration: 60,
    },
    {
      property: "meleeAttack",
      select: { class: [["melee"]] },
      effect: "multiply",
      value: increaseByPercent(1, a),
      type: "ability",
      duration: 60,
    },
    {
      property: "fireAttack",
      select: { class: [["melee"]] },
      effect: "multiply",
      value: increaseByPercent(1, a),
      type: "ability",
      duration: 60,
    },
    {
      property: "rangedAttack",
      select: { class: [["ranged"]], id: ["culverin"] },
      effect: "multiply",
      value: increaseByPercent(1, a),
      type: "influence",
      duration: 60,
    },
    {
      property: "siegeAttack",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseByPercent(1, a),
      type: "influence",
      duration: 60,
    },
  ]
  ),

  "ability-house-of-wisdom-influence": standardAbility(
    "",
    ([i]) => [
    // Buildings within influence gain +5 Fire Armor.\nStructures built within House of Wisdom influence area help progress to the Golden Age.
    {
      property: "fireArmor",
      select: { class: [["building"]] },
      effect: "change",
      value: i,
      type: "ability",
    },
  ]
  ),

  "ability-imperial-spies": standardAbility(
    "",
    ([i]) => [
    // Reveal location of enemy workers for 10 seconds.
    {
      property: "unknown",
      select: { id: ["imperial-palace"] },
      effect: "change",
      value: 0,
      type: "ability",
      duration: i,
    },
  ]
  ),

  "ability-abbey-healing": standardAbility(
    "",
    ([i, j]) => [
    // Heals nearby out of combat units by 6 every 1 seconds.
    {
      property: "healingRate",
      select: common.allLand,
      effect: "change",
      value: i / j,
      type: "ability",
    },
  ]
  ),

  "ability-mill-influence": standardAbility(
    "",
    ([i, j, k, l]) => [
    // Farm harvest rate increased +15%/+20%/+25%/+30% by Age while within the influence of a Mill.
    {
      property: "foodGatherRate",
      select: { id: ["farm", "mill"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "ability-place-palings": standardAbility(
    "",
    ([du, dmg]) => [
    // Enemy cavalry are stunned for 2.5 seconds and take 25 damage.
    {
      property: "meleeAttack",
      select: { id: ["longbowman"] },
      target: { class: [["cavalry"]] },
      effect: "change",
      value: dmg,
      type: "ability",
      duration: du,
    },
  ]
  ),

  "ability-man-the-sails": standardAbility(
    "Activate to move {1}% faster for {2} seconds, deactivates early when dealing damage.",
    ([ms, d]) => [
    {
      property: "moveSpeed",
      select: { class: [["ship", "springald"]] },
      effect: "change",
      value: ms,
      type: "ability",
      duration: d,
    },
  ]
  ),

  "ability-detonate": placeholderAbility(
    "Detonate the ship.",
    { class: [["ship", "incendiary"]] }
  ),

  "ability-conversion": placeholderAbility(
    "Attempts to convert enemy units within range of this Monk to your control.\nCooldown: {1} Seconds.",
    common.allReligiousUnits
  ),

  "ability-golden-age-tier-1": standardAbility(
    "",
    ([]) => [
    // Tier 1: Villager gather rate +15%
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 15),
      type: "ability",
    },
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 15),
      type: "ability",
    },
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 15),
      type: "ability",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 15),
      type: "ability",
    },
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 15),
      type: "ability",
    },
    {
      property: "unknown",
      select: { id: ["house-of-wisdom"] },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-golden-age-tier-2": standardAbility(
    "",
    ([]) => [
    // Tier 2: Research speed +15%
    {
      property: "researchSpeed",
      select: { class: [["building"]] },
      effect: "multiply",
      value: increaseByPercent(1, 15),
      type: "ability",
    },
    {
      property: "unknown",
      select: { id: ["house-of-wisdom"] },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-golden-age-tier-3": standardAbility(
    "",
    ([]) => [
    // Tier 2: Production speed +20%, +5% extra Research speed, +5% extra Villager gather rate
    {
      property: "productionSpeed",
      select: { class: [["building"]] },
      effect: "multiply",
      value: increaseByPercent(1, 20),
      type: "ability",
    },
    {
      property: "researchSpeed",
      select: { class: [["building"]] },
      effect: "multiply",
      value: increaseByPercent(1, 5),
      type: "ability",
    },
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 5),
      type: "ability",
    },
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 5),
      type: "ability",
    },
    {
      property: "goldGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 5),
      type: "ability",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 5),
      type: "ability",
    },
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, 5),
      type: "ability",
    },
    {
      property: "unknown",
      select: { id: ["house-of-wisdom"] },
      effect: "change",
      value: 0,
      type: "ability",
    },
  ]
  ),

  "ability-medical-centers": placeholderAbility(
    "Heals nearby units.",
    { id: ["keep", "town-center", "capital-town-center"] }
  ),

  "ability-fiefdom": standardAbility(
    "",
    ([i]) => [
    // Town Center production and research speed increased by +10%.\nBonus increases further in later Ages
    {
      property: "productionSpeed",
      select: { id: ["town-center", "capital-town-center"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "ability-emergency-repairs": standardAbility(
    "Building repairs itself by {1} health every {2} second for {3} seconds.",
    ([i, j, k]) => [
    // Building repairs itself by 150 health every 1 second for 20 seconds.
    {
      property: "repairRate",
      select: { class: [["building"]] },
      effect: "change",
      value: i / j,
      type: "ability",
      duration: k,
    },
  ]
  ),

  // "ability-relic-garrisoned-dock": standardAbility(
  // "",
  // ([s]) => [
  //   // Increasing attack speed of military ships by +5%.
  //   {
  //     property: "attackSpeed",
  //     select: common.allMillitaryShips,
  //     effect: "multiply",
  //     value: increaseAttackSpeedByPercent(s),
  //     type: "ability",
  //   },
  // ],

  // "ability-relic-garrisoned-keep": ([s, t, u, v]) => [
  // Yank workaround that matches two different abilities and adds both of the effects sets, split out in a workaround later
  "ability-relic-garrisoned": standardAbility(
    "", // "• Armor increased by +{1}%\n• Damage increased by +{2}%\n• Sight range increased by +{3}%\n• Weapon range increased by +{4}%"
    ([s, t, u, v]) => [
      // Increasing attack speed of military ships by +5%.
      // Dock
      {
        property: "attackSpeed",
        select: common.allMillitaryShips,
        effect: "multiply",
        value: increaseAttackSpeedByPercent(s),
        type: "ability",
      },
      // Armor increased by +50% Damage increased by +35% Sight range increased by +25% Weapon range increased by +20%"
      // Keeps etc
      {
        property: "fireArmor",
        select: { id: ["outpost", "stone-wall-tower", "keep", "elzbach-palace"] },
        effect: "multiply",
        value: increaseAttackSpeedByPercent(s),
        type: "ability",
      },
      {
        property: "rangedArmor",
        select: { id: ["outpost", "stone-wall-tower", "keep", "elzbach-palace"] },
        effect: "multiply",
        value: increaseAttackSpeedByPercent(s),
        type: "ability",
      },
      {
        property: "rangedAttack",
        select: { id: ["outpost", "stone-wall-tower", "keep", "elzbach-palace"] },
        effect: "multiply",
        value: increaseAttackSpeedByPercent(t),
        type: "ability",
      },
      {
        property: "maxRange",
        select: { id: ["outpost", "stone-wall-tower", "keep", "elzbach-palace"] },
        effect: "multiply",
        value: increaseAttackSpeedByPercent(v),
        type: "ability",
      },
      {
        property: "lineOfSight",
        select: { id: ["outpost", "stone-wall-tower", "keep", "elzbach-palace"] },
        effect: "multiply",
        value: increaseAttackSpeedByPercent(u),
        type: "ability",
      },
    ]
  ),

  "ability-food-festival": standardAbility(
    "",
    ([i, j]) => [
    // Increase Food gather rate by +50% for 30 seconds.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
      duration: j,
    },
  ]
  ),

  "ability-military-festival": standardAbility(
    "",
    ([i, j]) => [
    // Increase military unit production speed by +50% for 30 seconds.
    {
      property: "productionSpeed",
      select: { class: [["military"], ["building"]], id: ["farimba-garrison"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
      duration: j,
    },
  ]
  ),

  "ability-siege-festival": standardAbility(
    "",
    ([i, j]) => [
    // Increase siege and torch damage for all units by +50% for 30 seconds.
    {
      property: "fireAttack",
      select: { class: [["melee"], ["calvary"]], id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
      duration: j,
    },
    {
      property: "siegeAttack",
      select: { id: ["battering-ram", "counterweight-trebuchet", "bombard"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
      duration: j,
    },
  ]
  ),

  "ability-trade-protection": standardAbility(
    "",
    ([i, j, k]) => [
    // Traders and Trade Ships near Keeps receive +30% move speed and +8 armor for 20 seconds.
    {
      property: "moveSpeed",
      select: { id: ["trader", "trade-ship"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
      duration: k,
    },
    {
      property: "meleeArmor",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: j,
      type: "ability",
      duration: k,
    },
    {
      property: "rangedArmor",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: j,
      type: "ability",
      duration: k,
    },
  ]
  ),

  "ability-coastal-navigation": standardAbility(
    "",
    ([]) => [
    // Ships near a Docks get +15% speed for 25 seconds.
    {
      property: "moveSpeed",
      select: { class: [["ship"]] },
      effect: "multiply",
      value: increaseByPercent(1, 15),
      type: "ability",
      duration: 25,
    },
  ]
  ),

  "ability-extra-materials": placeholderAbility(
    "Towers and Keeps repair nearby walls and gates for +{1} health per second.",
    { id: ["outpost", "stone-wall-tower"] }
  )
};

export const technologyModifiers: Record<string, EffectsFactory> = {
  "arrow-volley": standardAbility(
    "",
    ([s]) => [
    // Longbowmen gain Arrow Volley, an activated ability that reduces their time to attack by +1 second for a duration of 6 seconds.
    {
      property: "attackSpeed",
      select: { id: ["longbowman"] },
      effect: "change",
      value: -1 * s,
      type: "ability",
    },
  ]
  ),

  "steeled-arrow": standardAbility(
    "Increase the ranged damage of all arrows and bolts by +{1}.",
    ([d]) => [
    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "balanced-projectiles": standardAbility(
    "Increase the ranged damage of all arrows and bolts by +{1}.",
    ([d]) => [
    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "platecutter-point": standardAbility(
    "Increase the ranged damage of all arrows and bolts by +{1}.",
    ([d]) => [
    {
      property: "rangedAttack",
      select: common.allRangedUnitsAndBuildingsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "iron-undermesh": standardAbility(
    "Increase the ranged armor of all non-siege units by +{1}.",
    ([a]) => [
    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ]
  ),

  "wedge-rivets": standardAbility(
    "Increase the ranged armor of all non-siege units by +{1}.",
    ([a]) => [
    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ]
  ),
  "angled-surfaces": standardAbility(
    "Increase the ranged armor of all non-siege units by +{1}.",
    ([a]) => [
    {
      property: "rangedArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ]
  ),

  "fitted-leatherwork": standardAbility(
    "Increase the melee armor of all non-siege units by +{1}.",
    ([a]) => [
    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ]
  ),

  "insulated-helm": standardAbility(
    "Increase the melee armor of all non-siege units by +{1}.",
    ([a]) => [
    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ]
  ),

  "master-smiths": standardAbility(
    "Increase the melee armor of all non-siege units by +{1}.",
    ([a]) => [
    {
      property: "meleeArmor",
      select: common.allNonSiegeUnits,
      effect: "change",
      value: a,
      type: "passive",
    },
  ]
  ),

  "bloomery": standardAbility(
    "Increase the melee damage of all non-siege units by +{1}.",
    ([d]) => [
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "damascus-steel": standardAbility(
    "Increase the melee damage of all non-siege units by +{1}.",
    ([d]) => [
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "decarbonization": standardAbility(
    "Increase the melee damage of all non-siege units by +{1}.",
    ([d]) => [
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "military-academy": standardAbility(
    "",
    ([i]) => [
    // Increase the production speed of infantry, cavalry, siege, and transport units at buildings by 33%.
    // Does not affect religious units or other support units.
    {
      property: "buildTime",
      select: { class: [["infantry"], ["melee", "cavalry"], ["ranged", "cavalry"], ["siege"], ["transport"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "military-academy-improved": standardAbility(
    "",
    ([reduction, additional]) => [
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
  ]
  ),

  /// Common economic tecnologies –––––––––––––––––––––––––––––––––

  "crosscut-saw": standardAbility(
    "Increase Villagers' gathering rate for Wood by {1}% and Wood gatherers carry capacity by +{2}.",
    ([i]) => [
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "crosscut-saw-improved": standardAbility(
    "",
    ([i, d]) => [
    //  Increase Villagers' gathering rate for Wood by +20%.
    // If Crosscut Saw has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "cupellation": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  "cupellation-improved": standardAbility(
    "",
    ([i, d]) => [
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
  ]
  ),

  "double-broadax": standardAbility(
    "Increase Villagers' gathering rate for Wood by {1}%.",
    ([i]) => [
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "double-broadax-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase Villagers' gathering rate for Wood by +20%.
    // If Double Broadaxe has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "drift-nets": standardAbility(
    "",
    ([r, c, s]) => [
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
  ]
  ),

  "extended-lines": standardAbility(
    "",
    ([i, c]) => [
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
  ]
  ),

  "horticulture": standardAbility(
    "Increase Villagers' gathering rate for Food by {1}%. Does not apply to hunted meat.",
    ([i]) => [
    // Increase Villagers' gathering rate for Food by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "horticulture-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Horticulture has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "fertilization": standardAbility(
    "Increase Villagers' gathering rate for Food by {1}%. Does not apply to hunted meat.",
    ([i]) => [
    // Increase Villagers' gathering rate for Food by +15%.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "fertilization-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Fertilization has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "forestry": standardAbility(
    "Double the rate at which Villagers chop down trees.",
    ([]) => [
    // Double the rate at which Villagers chop down trees.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 2,
      type: "passive",
    },
  ]
  ),

  "forestry-improved": standardAbility(
    "",
    ([]) => [
    // Villagers fell trees in a single chop.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: 4, // ??
      type: "passive",
    },
  ]
  ),

  "acid-distillation": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  "acid-distillation-improved": standardAbility(
    "",
    ([i, d]) => [
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
  ]
  ),

  "specialized-pick": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  "specialized-pick-improved": standardAbility(
    "",
    ([i, d]) => [
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
  ]
  ),

  "survival-techniques": standardAbility(
    "Increase Villagers' hunted meat gather rate by +{1}%.",
    ([i]) => [
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "survival-techniques-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase Villagers' hunted meat gather rate by +20%.
    // If Survival Techniques has already been researched, increase hunted meat gather rate by +5% instead.
    {
      property: "huntGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "wheelbarrow": standardAbility(
    "Increase the carry capacity of Villagers by +{1} and their movement speed by +{2}%.",
    ([c, s]) => [
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
  ]
  ),

  "wheelbarrow-improved": standardAbility(
    "",
    ([c, s, d]) => [
    // Increase Villagers' resource carry capacity by +7 and movement speed by  +15%.
    // If Wheelbarrow has already been researched, increase carry capacity by + 2 instead.
    {
      property: "carryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "lumber-preservation": standardAbility(
    "Increase Villagers' gathering rate for Wood by {1}%.",
    ([i]) => [
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "lumber-preservation-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase Villagers' gathering rate for Wood by +20%.
    // If Lumber Preservation has already been researched, increase it by + 5 % instead.
    {
      property: "woodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "precision-cross-breeding": standardAbility(
   "Increase Villagers' gathering rate for Food by {1}%. Does not apply to hunted meat.",
    ([i]) => [
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "precision-cross-breeding-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase Villagers' gathering rate for Food by +20%.
    // If Precision Crossbreeding has already been researched, increase it by + 5 % instead.
    {
      property: "foodGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "ancient-techniques": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  /// Unit technologies –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  "armor-clad": standardAbility(
    "",
    ([a]) => [
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
  ]
  ),

  "enclosures": standardAbility(
    "",
    ([g, s]) => [
    // Each Farm Enclosure being worked by a Villager generates +1 Gold every  3.5 seconds.
    {
      property: "goldGatherRate",
      select: { id: ["villager", "farm"] },
      effect: "change",
      value: round(g / s),
      type: "influence",
    },
  ]
  ),

  "network-of-citadels": standardAbility(
    "",
    ([o, i]) => [
    // Increase the Network of Castles attack speed bonus from +20% to 40%.
    {
      property: "attackSpeed",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i - o),
      type: "bonus",
    },
  ]
  ),

  "shattering-projectiles": standardAbility(
    "",
    ([]) => [
    // Trebuchet projectiles shatter on impact, increasing their area of effect.
    {
      property: "areaOfEffect",
      select: { id: ["counterweight-trebuchet"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "admirality": standardAbility(
    "",
    ([r]) => [
    // Increases the range of all combat ships by +1.
    {
      property: "maxRange",
      select: { id: ["galley", "hulk", "carrack"] },
      effect: "change",
      value: r,
      type: "passive",
    },
  ]
  ),

  "shipwrights": standardAbility(
    "",
    ([h, a]) => [
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
  ]
  ),

  "springald-crews": standardAbility(
    "",
    ([r, s]) => [
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
      value: increaseAttackSpeedByPercent(s),
      type: "passive",
    },
  ]
  ),

  "swivel-cannon": standardAbility(
    "",
    ([]) => [
    // Springald Ships gain an additional Cannon which fires in 360 degrees.
    // (Adds a Swivel Cannon to the Springald Ship, which deals 15 damage and can fire in 360 degrees.)
    {
      property: "rangedAttack",
      select: { class: [["springald", "ship"]] },
      effect: "change",
      value: 15,
      type: "passive",
    },
  ]
  ),

  "devoutness": standardAbility(
    "",
    ([g, c]) => [
    // "Inspired Villagers gather resources +10% faster and construct buildings and defenses +25% quicker.
    {
      property: "goldGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: increaseByPercent(1, g),
      type: "influence",
    },
    {
      property: "foodGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: increaseByPercent(1, g),
      type: "influence",
    },
    {
      property: "woodGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: increaseByPercent(1, g),
      type: "influence",
    },
    {
      property: "stoneGatherRate",
      select: { id: ["villagers"] },
      effect: "multiply",
      value: increaseByPercent(1, g),
      type: "influence",
    },
    {
      property: "buildTime", // Todo, branch out?
      select: { class: [["building"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, c),
      type: "influence",
    },
  ]
  ),

  "fire-stations": standardAbility(
    "",
    ([i, s]) => [
    // Military Ships regenerate +1 health every 2 seconds when out of combat.
    {
      property: "healingRate",
      select: common.allMillitaryShips,
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "heavy-maces": standardAbility(
    "",
    ([i]) => [
    // Men-at-Arms wield maces, increasing their bonus damage against heavy targets by +6.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms"] },
      target: { class: [["heavy"]] },
      effect: "change",
      value: i,
      type: "bonus",
    },
  ]
  ),

  "inspired-warriors": standardAbility(
    "",
    ([mv, a, d]) => [
    // Prelates increase their move speed by 10% and can inspire military units, improving their armor by +1, and damage by +15%.
    {
      property: "moveSpeed",
      select: { id: ["prelate"] },
      effect: "multiply",
      value: increaseByPercent(1, mv),
      type: "passive",
    },
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
  ]
  ),

  "marching-drills": standardAbility(
    "",
    ([i]) => [
    // Increase the movement speed of infantry and prelates by +10%.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "reinforced-defenses": standardAbility(
    "",
    ([i]) => [
    // Increase the health of walls, towers, and gates by +40%.
    {
      property: "hitpoints",
      select: { class: [["wall"], ["tower"], ["gate"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "riveted-chain-mail": standardAbility(
    "",
    ([i]) => [
    // Increase the melee armor of Spearmen and Horsemen by +2
    {
      property: "meleeArmor",
      select: { id: ["spearman", "horseman"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "steel-barding": standardAbility(
    "",
    ([melee, ranged]) => [
    // Grants Knights +2 melee and +2 ranged armor.
    {
      property: "meleeArmor",
      select: { id: ["knight"] },
      effect: "change",
      value: melee,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { id: ["knight"] },
      effect: "change",
      value: ranged,
      type: "passive",
    },
  ]
  ),

  "siege-engineering": standardAbility(
    "",
    ([]) => [
    // Melee and ranged infantry can construct Siege Towers and Battering Rams in the field.
    {
      property: "unknown",
      select: { class: [["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ]
  ),

  "siege-engineering-improved": standardAbility(
    "",
    ([]) => [
    // Melee and ranged infantry can construct Siege Towers and Battering Rams in the field.
    // Improved Siege Engineering allows for the construction of Mangonels, Springalds and Trebuchets as well.
    {
      property: "unknown",
      select: { class: [["infantry"]] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ]
  ),

  "slate-and-stone-construction": standardAbility(
    "",
    ([i]) => [
    // All buildings gain +5 fire armor.
    {
      property: "fireArmor",
      select: { class: [["building"]] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "two-handed-weapons": standardAbility(
    "",
    ([i]) => [
    // Men-at-Arms wield two-handed weapons, increasing their damage by +2.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "cantled-saddles": standardAbility(
    "",
    ([o, n]) => [
    // Increase Royal Knights' bonus damage after a charge from +3 to +10.
    {
      property: "meleeAttack",
      select: { id: ["royal-knight"] },
      target: { class: [["infantry"], ["cavalry"]] },
      effect: "change",
      value: n - 0,
      type: "bonus",
    },
  ]
  ),

  "chivalry": standardAbility(
    "",
    ([i]) => [
    // Royal Knights regenerate +1 health every  1s seconds when out of combat.
    {
      property: "healingRate",
      select: { id: ["royal-knight"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "crossbow-stirrups": standardAbility(
    "",
    ([r]) => [
    // Reduce the reload time of Arbalétriers by -25%.
    {
      property: "attackSpeed",
      select: { id: ["arbaletrier"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, r),
      type: "passive",
    },
  ]
  ),

  "enlistment-incentives": standardAbility(
    "",
    ([r]) => [
    // Improves the French influence by reducing unit costs by a further -10%.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["ranged"]] },
      effect: "change",
      value: r,
      type: "influence",
    },
  ]
  ),

  "gambesons": standardAbility(
    "",
    ([i]) => [
    // Increase Arbalétrier melee armor by +5.
    {
      property: "meleeArmor",
      select: { id: ["arbaletrier"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "long-guns": standardAbility(
    "",
    ([i]) => [
    // Increase the damage of naval cannons by +10%.
    {
      property: "rangedAttack",
      select: { class: [["warship"]], id: ["galleass"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "royal-bloodlines": standardAbility(
    "",
    ([i]) => [
    // Increase the health of all cavalry by +35%.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "merchant-guilds": standardAbility(
    "",
    ([i]) => [
    // Active Traders generate 1 gold every 6 seconds.
    {
      property: "goldGatherRate",
      select: { id: ["trader"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "battle-hardened": standardAbility(
    "Increase the health of Palace Guards by +{1}.",
    ([i]) => [
    {
      property: "hitpoints",
      select: { id: ["palace-guard"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "explosives": standardAbility(
    "Increase the damage of Incendiary Ships by +{1}%.",
    ([i]) => [
    {
      property: "siegeAttack",
      select: { class: [["incendiary", "ship"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "incendiaries": standardAbility(
    "",
    ([i]) => [
    // Incendiary Ships gain +20% explosion range.
    {
      property: "maxRange",
      select: { class: [["incendiary", "ship"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "naval-arrowslits": standardAbility(
    "",
    ([i]) => [
    // Add a defensive arrowslit to this Dock which only attacks ships.
  ]
  ),

  // Technically this would increase burst by +1  but we don't have a way to represent that.
  "extra-hammocks": standardAbility(
    "",
    ([i]) => [
    // Increases the number of arrows fired by Archer Ships by +1.
    {
      property: "rangedAttack",
      select: { class: [["archer", "ship"]] },
      effect: "multiply",
      value: 1 + i / 5, // 5 is the default number of arrows
      type: "passive",
    },
  ]
  ),

  "heated-shot": standardAbility(
    "",
    ([i]) => [
    // Archer Ship arrows light enemy Ships on fire, dealing damage over time.
    // (Arrow Ships set enemy ships on fire dealing 30 damage over 10 seconds (not stacking with each arrow).)
    {
      property: "rangedAttack",
      select: { class: [["archer", "ship"]] },
      effect: "change",
      value: 30 / 5, // 5 is the default number of arrows
      type: "passive",
    },
  ]
  ),

  "extra-materials": standardAbility(
    "",
    ([i]) => [
    // Stone Wall Towers and Outposts repair nearby damaged Stone Walls. A single section is repaired at a time for +20 health per second.
    {
      property: "healingRate",
      select: { id: ["outpost", "stone-wall-tower"] },
      effect: "change",
      value: i,
      type: "influence",
    },
  ]
  ),

  "imperial-examinations": standardAbility(
    "",
    ([o, n]) => [
    // Increase the maximum amount of Gold carried by Imperial Officials from +40 to +80
    {
      property: "carryCapacity",
      select: { id: ["imperial-official"] },
      effect: "change",
      value: n - o,
      type: "passive",
    },
  ]
  ),

  "pyrotechnics": standardAbility(
    "",
    ([i]) => [
    // Increase the range of gunpowder units by 1.5 tiles.
    {
      property: "maxRange",
      select: { id: ["handcannoneer"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "reload-drills": standardAbility(
    "",
    ([i]) => [
    // Increase the attack speed of Bombards by +33%
    {
      property: "attackSpeed",
      select: { id: ["bombard"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(i),
      type: "passive",
    },
  ]
  ),

  "thunderclap-bombs": standardAbility(
    "",
    ([i]) => [
    // Warships fire a Nest of Bees attack.
    {
      property: "siegeAttack",
      select: { class: [["warship"]] },
      effect: "change",
      value: (8 * 8) / 3, // 8 damage of 8 nest of bees arrows / burst
      type: "passive",
    },
  ]
  ),

  "additional-barrels": standardAbility(
    "",
    ([d]) => [
    // Nest of Bees receive 2 additional Rocket Arrows.
    {
      property: "burst",
      select: { id: ["nest-of-bees", "clocktower-nest-of-bees"] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "adjustable-crossbars": standardAbility(
    "",
    ([i]) => [
    // Increase the attack speed of Mangonels by +25%
    {
      property: "attackSpeed",
      select: { id: ["mangonel"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(i),
      type: "passive",
    },
  ]
  ),

  "adjustable-crossbars-improved": standardAbility(
    "",
    ([i, d]) => [
    // "Reduce the reload time of Mangonels by -35%.
    // If Adjustable Crossbars has already been researched, increase attack speed by +10% instead.
    {
      property: "attackSpeed",
      select: { id: ["mangonel"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(d),
      type: "passive",
    },
  ]
  ),

  "all-seeing-eye": standardAbility(
    "",
    ([i]) => [
    // Increase the sight range of Scholars by +100%.
    {
      property: "lineOfSight",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "armored-beasts": standardAbility(
    "",
    ([hp, armor]) => [
    // Grant +25% health and +4 ranged armor to War Elephants.
    {
      property: "rangedArmor",
      select: { id: ["war-elephant"] },
      effect: "change",
      value: armor,
      type: "passive",
    },
    {
      property: "hitpoints",
      select: { id: ["war-elephant"] },
      effect: "multiply",
      value: increaseByPercent(1, hp),
      type: "passive",
    },
  ]
  ),

  "armored-hull": standardAbility(
    "",
    ([h, a]) => [
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
  ]
  ),

  "biology": standardAbility(
    "",
    ([i]) => [
    // Increase the health of all cavalry by +20%.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "biology-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase the health of all cavalry by +30%.
    // If Biology has already been researched, increase it by + 10 % instead.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "boiling-oil": standardAbility(
    "",
    ([]) => [
    // Towers and Keeps gain a boiling oil attack against nearby units that deals  damage.
    {
      property: "unknown",
      select: { id: ["stone-wall-tower", "keep", ...common.allKeepLikeLandmarks.id!] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "chemistry": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  "court-architects": standardAbility(
    "Patronage of the finest builders increases all building health by +{1}%.",
    ([i]) => [
    {
      property: "hitpoints",
      select: { class: [["building"], ["landmark"], ["wonder"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "efficient-production": standardAbility(
    "",
    ([i]) => [
    // Allow Scholars to garrison in military buildings, boosting production speed by +100%.
    {
      property: "productionSpeed",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "elite-army-tactics": standardAbility(
    "",
    ([h, d]) => [
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
  ]
  ),

  "elite-army-tactics-improved": standardAbility(
    "",
    ([h, d, delta]) => [
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
  ]
  ),

  "forced-march": standardAbility(
    "",
    ([i, d]) => [
    // Infantry units gain the Forced March ability.
    // This ability makes them move +100% faster for  10 seconds, but they cannot attack while it is active.
    {
      property: "moveSpeed",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "geometry": standardAbility(
    "",
    ([i]) => [
    // Increase the damage of Rams and Trebuchets +30%.
    {
      property: "siegeAttack",
      select: { id: ["huihui-pao", "counterweight-trebuchet", "traction-trebuchet"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "lightweight-beams": standardAbility(
    "",
    ([speed, time]) => [
    // Increase Battering Ram attack speed by +40% and reduce their field construction time by -50%.
    {
      property: "attackSpeed",
      select: { id: ["battering-ram", "clocktower-battering-ram", "cheirosiphon"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(speed),
      type: "passive",
    },
    {
      property: "buildTime",
      select: { id: ["battering-ram", "clocktower-battering-ram", "cheirosiphon"] },
      effect: "multiply",
      value: decreaseByPercent(1, time),
      type: "passive",
    },
  ]
  ),

  "greased-axles": standardAbility(
    "",
    ([i]) => [
    // Increase the movement speed of siege engines by +15%.
    {
      property: "moveSpeed",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "greased-axles-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase the movement speed of siege engines by +25%.
    // If Greased Axles has already been researched, increase it by + 10 % instead.
    {
      property: "moveSpeed",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseByPercent(1, d - i),
      type: "passive",
    },
  ]
  ),

  "hearty-rations": standardAbility(
    "",
    ([i]) => [
    // Increase the carrying capacity of Villagers by +5.
    {
      property: "carryCapacity",
      select: { id: ["villager"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "herbal-medicine": standardAbility(
    "",
    ([i]) => [
    // Increase the healing rate of religious units by +60%.
    {
      property: "healingRate",
      select: common.allReligiousUnits,
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "herbal-medicine-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase the healing rate of religious units by +120%.
    // If Herbal Medicine has already been researched, increase it by + 60 % instead.
    {
      property: "healingRate",
      select: common.allReligiousUnits,
      effect: "multiply",
      value: increaseByPercent(1, d),
      type: "passive",
    },
  ]
  ),

  "honed-blades": standardAbility(
    "",
    ([i]) => [
    // Increase the melee damage of Men-at-Arms and Knights by +3.
    {
      property: "meleeAttack",
      select: { id: ["man-at-arms", "knight", "lancer"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "manuscript-trade": standardAbility(
    "",
    ([i]) => [
    // Scholars garrisoned in Docks provide +20% faster production speed and contribute to global research.
    {
      property: "productionSpeed",
      select: { id: ["dock"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "incendiary-arrows": standardAbility(
    "", // "Flammable munitions grant non-gunpowder ranged units a siege arrow or bolt when attacking buildings and increase their damage by +{1}%."
    ([i]) => [
    // Increase the damage of ranged units and buildings by +20%. Does not apply to gunpowder units.
    {
      property: "rangedAttack",
      select: {
        id: [
          "longbowman",
          "wynguard-ranger",
          "zhuge-nu",
          "archer",
          "arbaletrier",
          "crossbowman",
          "tower-elepahnt",
          "mangudai",
          "khaganate-elite-mangudai",
          "khaganate-horse-archer",
          "horse-archer",
          "camel-archer",
          "khan",
          // And other ranged buildings
          "town-center",
          "keep",
          "outpost",
          "stone-wall-tower",
          "barbican-of-the-sun",
          ...common.allRangedUnitsAndBuildingsExceptSiege.id!,
          ...common.allKeepLikeLandmarks.id!,
        ],
      },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "lookout-towers": standardAbility(
    "",
    ([sight, range]) => [
    // Increase the sight range of Outposts by 50% and weapon range by +1.
    {
      property: "lineOfSight",
      select: { id: ["outpost"] },
      effect: "multiply",
      value: increaseByPercent(1, sight),
      type: "passive",
    },
    {
      property: "maxRange",
      select: { id: ["outpost"] },
      effect: "change",
      value: range,
      type: "passive",
    },
  ]
  ),

  "piety": standardAbility(
    "",
    ([i]) => [
    // Increase the health of religious units by +40.
    {
      property: "hitpoints",
      select: common.allReligiousUnits,
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "piety-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase the health of religious units by +60.
    // If Piety has already been researched, increase it by + 20 instead.
    {
      property: "hitpoints",
      select: common.allReligiousUnits,
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "professional-scouts": standardAbility(
    "Scouts gain the ability to carry animal carcasses and +{1}% damage against wild animals.\nScouts move -{2}% slower while carrying and cannot pick up Boar.",
    ([i]) => [
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
  ]
  ),

  "professional-scouts-improved": standardAbility(
    "",
    ([i, d]) => [
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
  ]
  ),

  "reinforced-foundations": standardAbility(
    "Villagers and Infantry can garrison inside Houses for protection. Houses gain garrison arrows and +{1}% Health.",
    ([hp]) => [
    // Villagers and Infantry can garrison inside Houses for protection. Houses gain garrison arrows and +50% Health.
    {
      property: "hitpoints",
      select: { id: ["house"] },
      effect: "multiply",
      value: increaseByPercent(1, hp),
      type: "passive",
    },
  ]
  ),

  "roller-shutter-triggers": standardAbility(
    "Increases Springald attack speed by +{1}% and grants +{2}% Ranged Resistance.",
    ([s, r]) => [
    {
      property: "attackSpeed",
      select: { id: ["springald"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(s),
      type: "passive",
    },
    {
      property: "rangedResistance",
      select: { id: ["springald"] },
      effect: "change",
      value: r,
      type: "passive",
    },
  ]
  ),

  "roller-shutter-triggers-improved": standardAbility(
    "Increases Springald attack speed by +{1}% and grants +{2}% Ranged Resistance.\nIf Roller Shutter Triggers has already been researched, increase by {3}% instead.",
    ([s, r, si]) => [
    {
      property: "attackSpeed",
      select: { id: ["springald"] },
      effect: "multiply",
      value: decreaseByPercentImproved(1, s, s - si),
      type: "passive",
    },
    {
      property: "rangedResistance",
      select: { id: ["springald"] },
      effect: "change",
      value: 0, // Improved doesn't apply additional bonus to resistance over the base research
      type: "passive",
    },
  ]
  ),

  "spyglass": standardAbility(
    "",
    ([i]) => [
    // Increase the sight radius of Scouts by 30%.
    {
      property: "lineOfSight",
      select: { id: ["scout", "warrior-scout"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "sanctity": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  "howdahs": standardAbility(
    "",
    ([hp, armor]) => [
    // Upgrade Tower Elephants to have Elite Crossbowmen as riders instead of Archers. Tower Elephants gain +30% health and +4 ranged armor.
    {
      property: "rangedAttack",
      target: { class: [["heavy"]] },
      select: { id: ["tower-elephant"] },
      effect: "change",
      value: 11,
      type: "bonus",
    },
    {
      property: "rangedArmor",
      select: { id: ["tower-elephant", "sultans-elite-tower-elephant"] },
      effect: "change",
      value: armor,
      type: "passive",
    },
    {
      property: "hitpoints",
      select: { id: ["tower-elephant", "sultans-elite-tower-elephant"] },
      effect: "multiply",
      value: increaseByPercent(1, hp),
      type: "passive",
    },
  ]
  ),

  "siege-works": standardAbility(
    "New carpentry techniques increase the health of siege units by +{1}%.",
    ([h]) => [
    {
      property: "hitpoints",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseByPercent(1, h),
      type: "passive",
    },
  ]
  ),

  "siege-works-improved": standardAbility(
    "New carpentry techniques increase the health of siege engines by +{1}%.\nIf Siege Works has already been researched, increase their health by +{2}% instead.",
    ([h, hi]) => [
    {
      property: "hitpoints",
      select: { class: [["siege"]] },
      effect: "multiply",
      value: increaseByPercentImproved(1, h, h - hi),
      type: "passive",
    },
  ]
  ),

  "slow-burning-defenses": standardAbility(
    "Increase the fire armor of Stone Wall Towers, Keeps, and Outposts by +{1}.",
    ([i]) => [
    {
      property: "fireArmor",
      select: { id: ["stone-wall-tower", "keep", "outpost"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "swiftness": standardAbility(
    "Increases the movement speed of Scholars by +{1}%.",
    ([i]) => [
    {
      property: "moveSpeed",
      select: { id: ["scholar"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "textiles": standardAbility(
    "Increase Villagers' health by +{1}%.",
    ([i]) => [
    {
      property: "hitpoints",
      select: { id: ["villager"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "textiles-improved": standardAbility(
    "Increase Villagers' health by +{1}%.\nIf Textiles has already been researched, increase health by +{2}% instead.",
    ([i, ii]) => [
    {
      property: "hitpoints",
      select: { id: ["villager"] },
      effect: "change",
      value: ii,
      type: "passive",
    },
  ]
  ),

  "tithe-barns": standardAbility(
    "Relics placed in eligible buildings provide an income of +{1} Food, +{2} Wood, and +{3} Stone every minute.",
    ([f, w, s]) => [
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: f,
      type: "influence",
    },
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: w,
      type: "influence",
    },
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: s,
      type: "influence",
    },
  ]
  ),

  "tithe-barns-improved": standardAbility(
    "Relics placed in a Prayer Tent provide an income of +{1} Food, +{2} Wood, and +{3} Stone every minute.\nIf Tithe Barns has already been researched, increase the income of Food and Wood by +{4} and Stone by +{5} instead.",
    ([f, w, s, fi, wi, si]) => [
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: fi,
      type: "influence",
    },
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: wi,
      type: "influence",
    },
    {
      property: "unknown",
      select: { id: ["monastery", "mosque", "prayer-tent", "regnitz-cathedral"] },
      effect: "change",
      value: si,
      type: "influence",
    },
  ]
  ),

  "tranquil-venue": standardAbility(
    "Mosques restore +{1} health every second to units that are out of combat.",
    ([i]) => [
    {
      property: "healingRate",
      select: { id: ["mosque"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "village-fortresses": standardAbility(
    "Keeps act like Town Centers, including unit production, population capacity, and technology.",
    ([]) => [
    {
      property: "unknown",
      select: { id: ["keep"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "zeal": standardAbility(
    "",
    ([i, d]) => [
    // Units healed by Scholars gain +50% attack speed for  3 seconds.
    {
      property: "attackSpeed",
      select: { class: [["infantry"], ["cavalry"]], id: ["scholar"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "influence",
    },
  ]
  ),

  "agriculture": standardAbility(
    "Improve Villagers' gathering rate from Farms by +{1}%.",
    ([i]) => [
    {
      property: "foodGatherRate",
      select: { id: ["villager", "farm"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "armored-caravans": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  "boot-camp": standardAbility(
    "",
    ([i]) => [
    // Increase the health of all infantry by +15%.
    {
      property: "hitpoints",
      select: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "camel-rider-barding": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  "camel-handling": standardAbility(
    "",
    ([i]) => [
    // Increase the movement speed of camel units by +15%.
    {
      property: "moveSpeed",
      select: { id: ["camel-rider", "camel-archer"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "camel-rider-shields": standardAbility(
    "",
    ([i]) => [
    // Grant Camel Riders shields, improving their melee armor by +3.
    {
      property: "meleeArmor",
      select: { id: ["camel-rider"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "camel-support": standardAbility(
    "",
    ([i]) => [
    // Camels increase the armor of nearby infantry by +2.
    {
      property: "meleeArmor",
      select: { class: [["infantry"]], id: ["camel-rider", "camel-archer"] },
      effect: "change",
      value: i,
      type: "influence",
    },
  ]
  ),

  "composite-bows": standardAbility(
    "",
    ([r]) => [
    // Increase the attack speed of Archers by +33%.
    {
      property: "attackSpeed",
      select: { id: ["archer"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(r),
      type: "passive",
    },
  ]
  ),

  "culture-wing": standardAbility(
    "",
    ([]) => [
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
  ]
  ),

  "economic-wing": standardAbility(
    "",
    ([]) => [
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
  ]
  ),

  "faith": standardAbility(
    "",
    ([]) => [
    // Imams can convert units without holding a Relic, but can only target a single unit.
    {
      property: "unknown",
      select: { id: ["imam"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ]
  ),

  "fresh-foodstuffs": standardAbility(
    "",
    ([r]) => [
    // Reduce the cost to produce Villagers by -50%.
    {
      property: "foodCost",
      select: { id: ["villager"] },
      effect: "multiply",
      value: decreaseByPercent(1, r),
      type: "passive",
    },
  ]
  ),

  "fertile-crescent": standardAbility(
    "",
    ([i]) => [
    // Reduce the cost of Economy buildings and Houses by 25%.
    {
      property: "foodCost",
      select: { id: ["house", "mill", "lumber-camp", "dock", "mining-camp"] },
      effect: "multiply",
      value: decreaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "grand-bazaar": standardAbility(
    "",
    ([i]) => [
    // Traders also return with a secondary resource. This resource is 0.25 the base Gold value and is set at the market.
    {
      property: "unknown",
      select: { id: ["trader"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "improved-processing": standardAbility(
    "",
    ([i]) => [
    // Villagers drop off +8% more resources.
    {
      property: "unknown",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "medical-centers": standardAbility(
    "",
    ([h]) => [
    // Keeps heal nearby units for +2 health every  1s second.
    {
      property: "healingRate",
      select: { id: ["keep"] },
      effect: "change",
      value: h,
      type: "influence",
    },
  ]
  ),

  "military-wing": standardAbility(
    "",
    ([]) => [
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
  ]
  ),

  "phalanx": standardAbility(
    "",
    ([i]) => [
    // Increase the attack range of Spearmen by +100%.
    {
      property: "maxRange",
      select: { id: ["spearman"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "preservation-of-knowledge": standardAbility(
    "",
    ([r]) => [
    // Reduce the cost of all technology by -30%.
    {
      property: "goldCost",
      select: { class: [["technology"]] }, // TODO: This probably breaks after the ebpClass change, but we need to check whether it applies to type=technology, or also type=upgrade.
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
  ]
  ),

  "spice-roads": standardAbility(
    "",
    ([i]) => [
    // Increase the Gold income from Traders by +30%.
    {
      property: "goldGatherRate",
      select: { id: ["traders"] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "teak-masts": standardAbility(
    "",
    ([i]) => [
    // Increase the health of military ships +10%
    {
      property: "hitpoints",
      select: common.allMillitaryShips,
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "trade-wing": standardAbility(
    "",
    ([]) => [
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
  ]
  ),

  "canoe-tactics": standardAbility(
    "",
    ([i]) => [
    // Archer Ships fire an additional 2 Javelin weapons.
    // Not in tooltip but in patch notes 'now also gives arrow ships +20 bonus damage when attacking fire ships.'
    {
      property: "rangedAttack",
      select: { class: [["archer", "ship"]] },
      effect: "change",
      value: (2 * 4) / 5, // 4 damage of 2 javelins / default burst
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: { class: [["archer", "ship"]] },
      target: { class: [["incendiary", "ship"]] },
      effect: "change",
      value: 20,
      type: "bonus",
    },
  ]
  ),

  "farima-leadership": standardAbility(
    "",
    ([i]) => [
    // Sofa increase the movement speed of nearby infantry by +15%.
    {
      property: "moveSpeed",
      select: { id: ["sofa"] },
      target: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "influence",
    },
  ]
  ),

  "imported-armor": standardAbility(
    "",
    ([i]) => [
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
  ]
  ),

  "local-knowledge": standardAbility(
    "",
    ([i]) => [
    // Musofadi units heal while in Stealth for +2 every 1 seconds.
    {
      property: "healingRate",
      select: { id: ["musofadi-gunner", "musofadi-warrior"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "poisoned-arrows": standardAbility(
    "",
    ([d]) => [
    // Archer arrows deal an additional 3 damage over 6 seconds.
    {
      property: "rangedAttack",
      select: { id: ["archer"] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "precision-training": standardAbility(
    "",
    ([donso, archer, javelin]) => [
    // Increase ranged damage of Donso by +6, Archers by +2, and Javelin Throwers by +3.
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
  ]
  ),

  "advanced-academy": standardAbility(
    "",
    ([]) => [
    // Outfits Military Schools with the ability to produce Knights and Janissaries.
  ]
  ),

  "anatolian-hills": standardAbility(
    "",
    ([s, i]) => [
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
  ]
  ),

  "fast-training": standardAbility(
    "",
    ([i]) => [
    // Increase production of Military Schools by +25%.

    {
      property: "productionSpeed",
      select: { id: ["military-school"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "field-work": standardAbility(
    "",
    ([imam, i]) => [
    // Spawn 2 Imams at the Landmark Town Center. Imams area heal nearby units for 1 health every second.
    // Increases to 2 health in Castle Age and 3 health in Imperial Age.
    {
      property: "healingRate",
      select: { id: ["imam"] },
      target: { class: [[]] },
      effect: "change",
      value: imam,
      type: "influence",
    },
  ]
  ),

  "imperial-fleet": standardAbility(
    "",
    ([p, m]) => [
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
  ]
  ),

  "janissary-company": standardAbility(
    "",
    ([i]) => [
    // Spawn 2 Janissaries for each of your Military Schools at the Landmark Town Center.
  ]
  ),

  "janissary-guns": standardAbility(
    "",
    ([i]) => [
    // Increase Janissary gun damage by +3.
    {
      property: "rangedAttack",
      select: { id: ["janissary"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "mehter-drums": standardAbility(
    "",
    ([mether, i]) => [
    // Spawn 1 Mehter at the Landmark Town Center. Mehters increase move speed to units in the same formation by +15%.
    {
      property: "moveSpeed",
      select: { id: ["mehter"] },
      target: { class: [[]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "influence",
    },
  ]
  ),

  "military-campus": standardAbility(
    "",
    ([i]) => [
    // Increase Military Schools that can be built by +1.
  ]
  ),

  // Todo, add improved version

  "additional-torches": standardAbility(
    "Increase the torch damage of all infantry and cavalry by +{1}.",
    ([i]) => [
    {
      property: "fireAttack",
      select: { class: [["infantry"], ["cavalry", "melee"]] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "additional-torches-improved": standardAbility(
    "Increase the torch damage of all infantry and cavalry by +{1}.\nIf Additional Torches has already been researched, increase the torch damage from all infantry and cavalry by +{2}.",
    ([i, d]) => [
    {
      property: "fireAttack",
      select: { class: [["infantry"], ["cavalry", "melee"]] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "geometry-improved": standardAbility(
    "",
    ([i, d]) => [
    // Increase damage of Trebuchets by +20%.\nIf Geometry has already been researched, increase their damage by +10% instead.
    {
      property: "rangedAttack",
      select: { id: ["huihui-pao", "trebuchet"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, i, d),
      type: "passive",
    },
  ]
  ),

  "lightweight-beams-improved": standardAbility(
    "",
    ([as, ct, asd, ctd]) => [
    // Increase Battering Ram attack speed by +40% and reduce their field construction time by -50%.\nIf Lightweight Beams has already been researched, increase attack speed by +60% and reduce field construction time by -75% instead.
    {
      property: "attackSpeed",
      select: { id: ["battering-ram"] },
      effect: "multiply",
      value: increaseByPercentImproved(1, as, asd),
      type: "passive",
    },
    {
      property: "buildTime",
      select: { id: ["battering-ram"] },
      effect: "multiply",
      value: decreaseByPercentImproved(1, ct, ctd),
      type: "passive",
    },
  ]
  ),

  "monastic-shrines": standardAbility(
    "",
    ([]) => [
    // Monasteries allow Improved Production in their districts even without an Ovoo.
    {
      property: "unknown",
      select: { id: ["prayer-tent"] },
      effect: "change",
      value: 1,
      type: "influence",
    },
  ]
  ),

  // Todo, improve
  "piracy": standardAbility(
    "",
    ([b]) => [
    // Gain +50 Wood and  +50 Gold when sinking an enemy ship.
    {
      property: "unknown",
      select: { id: ["light-junk", "explosive-junk", "war-junk", "baochuan"] },
      effect: "change",
      value: b,
      type: "ability",
    },
  ]
  ),

  "raid-bounty": standardAbility(
    "Increase the raid income for igniting a building to +{1} Food and Gold.",
    ([b]) => [
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: b,
      type: "ability",
    },
  ]
  ),

  "raid-bounty-improved": standardAbility(
    "Increase the raid income for igniting a building to +{1} Food and Gold.\nIf Raid Bounty has already been researched, increase the raid income for igniting a building by +{2} Food and Gold.",
    ([i, d]) => [
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: i - d,
      type: "ability",
    },
  ]
  ),

  "siha-bow-limbs": standardAbility(
    "",
    ([i]) => [
    // Increase the ranged damage of Mangudai and the Khan by +1.
    {
      property: "rangedAttack",
      select: { id: ["khan", "mangudai", "khaganate-elite-mangudai"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "siha-bow-limbs-improved": standardAbility(
    "",
    ([i, d]) => [
    // ncrease the ranged damage of Mangudai and the Khan by +2.
    // If Siha Bow Limbs has already been researched, increase the ranged damage of Mangudai and the Khan by + 1.
    {
      property: "rangedAttack",
      select: { id: ["khan", "mangudai", "khaganate-elite-mangudai"] },
      effect: "change",
      value: i - d,
      type: "passive",
    },
  ]
  ),

  "stone-bounty": standardAbility(
    "Add +{1} Stone to the raid income for igniting a building.",
    ([b]) => [
    // Add +75 Stone to the raid income for igniting a building.
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: b,
      type: "ability",
    },
  ]
  ),

  "stone-bounty-improved": standardAbility(
    "Add +{1} Stone to the raid income for igniting a building.\nIf Stone Bounty has already been researched, add +{2} Stone to the raid income for igniting a building.",
    ([i, d]) => [
    {
      property: "unknown",
      select: { class: [["cavalry"], ["infantry"]] },
      effect: "change",
      value: i - d,
      type: "ability",
    },
  ]
  ),

  "stone-commerce": standardAbility(
    "Traders supply +{1}% Stone to their trades",
    ([]) => [
    {
      property: "unknown",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "stone-commerce-improved": standardAbility(
    "",
    ([]) => [
    // Traders supply +20% Stone to their trades
    // if Stone Commerce has already been researched, supply +10% Stone instead
    {
      property: "unknown",
      select: { id: ["trader", "trade-ship"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "superior-mobility": standardAbility(
    "",
    ([i]) => [
    // Packed buildings move and pack/unpack 50% faster.
    {
      property: "unknown",
      select: { class: [["building"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, i),
      type: "ability",
    },
  ]
  ),

  "whistling-arrows": standardAbility(
    "Increase the Khan's Signal Arrow duration by +{1} seconds and range by +{2} tiles.",
    ([]) => [
    {
      property: "unknown",
      select: { id: ["khan"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ]
  ),

  "whistling-arrows-improved": standardAbility(
    "Increase the Khan's Signal Arrow duration by +{1} seconds and range by +{2} tiles.\nIf Whistling Arrows has already been researched, increase the Khan's Signal Arrow duration by +{3} seconds and range by +{4} tile.",
    ([]) => [
    {
      property: "unknown",
      select: { id: ["khan"] },
      effect: "change",
      value: 1,
      type: "ability",
    },
  ]
  ),

  "yam-network": standardAbility(
    "Yam speed aura applies to all units instead of just Traders and cavalry units.",
    ([]) => [
    {
      property: "unknown",
      select: { class: [["infantry"], ["siege"]] },
      effect: "change",
      value: 1,
      type: "influence",
    },
  ]
  ),

  "yam-network-improved": standardAbility(
    "",
    ([hp, s]) => [
    // Yam speed aura applies to all units instead of just Traders and cavalry units.
    // Improved Yam Network allows Traders to regenerate 1 health every 2 seconds while in Yam's aura."
    {
      property: "healingRate",
      select: { class: [["infantry"], ["siege"]] },
      effect: "change",
      value: hp,
      type: "influence",
    },
  ]
  ),

  "steppe-lancers": standardAbility(
    "",
    ([h, r]) => [
    // Increase Keshik healing by +1 Health per attack and attack speed by +10%.
    {
      property: "healingRate",
      select: { id: ["keshik"] },
      effect: "change",
      value: h,
      type: "passive",
    },
    {
      property: "attackSpeed",
      select: { id: ["keshik"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(r),
      type: "passive",
    },
  ]
  ),

  "steppe-lancers-improved": standardAbility(
    "",
    ([oh, or, h, r]) => [
    // Increase Keshik healing by +1 Health per attack and attack speed by +10%.
    // If Steppe Lancers has already been researched, increase Keshik healing by +20 Health per attack and attack speed by +10%.
    {
      property: "healingRate",
      select: { id: ["keshik"] },
      effect: "change",
      value: h,
      type: "passive",
    },
    {
      property: "attackSpeed",
      select: { id: ["keshik"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(r),
      type: "passive",
    },
  ]
  ),

  "banded-arms": standardAbility(
    "",
    ([r]) => [
    // Increase the range of Springald by +0.5 tiles.
    {
      property: "maxRange",
      select: { id: ["springald"] },
      effect: "change",
      value: r,
      type: "passive",
    },
  ]
  ),

  "divine-light": standardAbility(
    "",
    ([d]) => [
    // Increase the duration of Saint's Blessing by 10 seconds.
    {
      property: "unknown",
      select: { id: ["warrior-monk"] },
      effect: "change",
      value: d,
      type: "influence",
    },
  ]
  ),

  "boyars-fortitude": standardAbility(
    "",
    ([h]) => [
    // Increase the health of Rus cavalry by +20.
    {
      property: "hitpoints",
      select: { class: [["cavalry"]] },
      effect: "change",
      value: h,
      type: "passive",
    },
  ]
  ),

  "adaptable-hulls": standardAbility(
    "",
    ([i]) => [
    // Converting between Lodya Ship types is 50% faster and no longer has a cost penalty.
    {
      property: "unknown",
      select: { id: ["lodya-galley", "lodya-attack-ship", "lodya-fishing-boat", "lodya-trade-ship"] },
      effect: "change",
      value: i,
      type: "ability",
    },
  ]
  ),

  "cedar-hulls": standardAbility(
    "",
    ([health, armor]) => [
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
  ]
  ),

  "clinker-construction": standardAbility(
    "",
    ([h]) => [
    // Increase the health of Lodya Attack Ships by +200.
    {
      property: "hitpoints",
      select: { id: ["lodya-attack-ship"] },
      effect: "change",
      value: h,
      type: "passive",
    },
  ]
  ),

  "mounted-guns": standardAbility(
    "",
    ([]) => [
    // Replaces Springald Ship weaponry with Cannons which provide greater range and damage.
  ]
  ),

  "fine-tuned-guns": standardAbility(
    "",
    ([d, bd]) => [
    // Increase damage of Bombards by +20%. Bombards gain +50% damage vs Infantry.
    {
      property: "siegeAttack",
      select: { id: ["bombard"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, d),
      type: "passive",
    },
    {
      property: "siegeAttack",
      select: { id: ["bombard"] },
      target: { class: [["infantry"]] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, bd),
      type: "bonus",
    },
  ]
  ),

  "fervor": standardAbility(
    "",
    ([tiles, damage]) => [
    //Improve the range of Saint's Blessing by +5 tiles and the damage granted by Saint's Blessing by +1.
    {
      property: "unknown",
      select: { id: ["warrior-monk"] },
      effect: "change",
      value: tiles,
      type: "ability",
    },
    {
      property: "meleeAttack",
      select: { class: [["infantry"], ["cavalry"]] },
      effect: "change",
      value: damage,
      type: "influence",
    },
    {
      property: "rangedAttack",
      select: { class: [["infantry"], ["cavalry"]] },
      effect: "change",
      value: damage,
      type: "influence",
    },
  ]
  ),

  "saints-veneration": standardAbility(
    "",
    ([d]) => [
    // Increase the health of Warrior Monks by +100.
    {
      property: "hitpoints",
      select: { id: ["warrior-monk"] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "knight-poleaxes": standardAbility(
    "",
    ([d]) => [
    // Knights equip a poleax, increasing their melee damage by +4.
    {
      property: "meleeAttack",
      select: { id: ["knight"] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "mounted-training": standardAbility(
    "",
    ([r]) => [
    // Increase weapon range of Horse Archers by +1 and unlock the Gallop ability.
    // \nGallop: Activate to move at maximum speed with +2 tile weapon range for 8 seconds.
    {
      property: "maxRange",
      select: { id: ["horse-archer"] },
      effect: "change",
      value: r,
      type: "passive",
    },
  ]
  ),

  "siege-crew-training": standardAbility(
    "",
    ([]) => [
    // Setup and teardown speed of Trebuchets and Magonels is instant.
    {
      property: "attackSpeed",
      select: { id: ["counterweight-trebuchet", "mangonel", "bombard"] },
      effect: "change",
      value: 0, // Todo, figure out real timings
      type: "passive",
    },
  ]
  ),

  "wandering-town": standardAbility(
    "",
    ([d, hp, s]) => [
    // Ram damage increased by +50%. Rams heal 2 health every 1 second.
    {
      property: "siegeAttack",
      select: { id: ["battering-ram"] },
      effect: "multiply",
      value: increaseByPercent(1, d),
      type: "passive",
    },
    {
      property: "healingRate",
      select: { id: ["battering-ram"] },
      effect: "change",
      value: hp,
      type: "passive",
    },
  ]
  ),

  "castle-turret": standardAbility(
    "Increase the damage of arrows fired from this Wooden Fortress by +{1}.",
    ([i]) => [
    {
      property: "rangedAttack",
      select: { id: ["wooden-fortress"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "castle-watch": standardAbility(
    "Increase the sight range of this Wooden Fortress by {1} tiles.",
    ([i]) => [
    {
      property: "lineOfSight",
      select: { id: ["wooden-fortress"] },
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  // Todo, these weapons are already on the building, this just unlocks them
  "arrowslits": standardAbility(
    [
      "Add defensive arrowslits to this structure and increase garrison arrow range by +{1}.",
      "Add defensive arrowslits to this structure and increase garrison arrow range by +{1}. Only one weapon emplacement can be added."
    ],
    ([]) => [
    {
      property: "unknown",
      select: { id: ["wooden-fortress", "outpost"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "handcannon-slits": standardAbility(
    "Add defensive handcannon slits to this structure and increases garrison arrow range by +{1}. Only one weapon emplacement can be added.",
    ([]) => [
    {
      property: "unknown",
      select: { id: ["outpost"] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "springald-emplacement": standardAbility(
    "",
    ([]) => [
    // Add a defensive springald emplacement to this structure.
    {
      property: "unknown",
      select: { id: ["wooden-fortress", "outpost", "keep", ...common.allKeepLikeLandmarks.id!] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "cannon-emplacement": standardAbility(
    "",
    ([]) => [
    // Add a defensive cannon emplacement to this structure.
    {
      property: "unknown",
      select: { id: ["outpost", "keep", ...common.allKeepLikeLandmarks.id!] },
      effect: "change",
      value: 1,
      type: "passive",
    },
  ]
  ),

  "fortify-outpost": standardAbility(
    "Add +{1} health and +{2} fire armor to this Outpost.",
    ([hp, a]) => [
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
  ]
  ),

  "towara": standardAbility(
    "",
    ([c, s, r]) => [
    // Increase the carry capacity of Villagers by +3, their movement speed by +7%, and +25% gather rate from Berry Bushes.
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
      value: increaseSpeedByPercent(1, s),
      type: "passive",
    },
    {
      property: "berryGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, r),
      type: "passive",
    },
  ]
  ),
  "takezaiku": standardAbility(
    "Increase the carry capacity of Villagers by +{1}, their movement speed by +{2}%, and +{3}% gather rate from Berry Bushes.",
    ([c, s, r]) => [
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
      value: increaseSpeedByPercent(1, s),
      type: "passive",
    },
    {
      property: "berryGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, r),
      type: "passive",
    },
  ]
  ),
  "fudasashi": standardAbility(
    "Increase the carry capacity of Villagers by +{1}, their movement speed by +{2}%, and +{3}% gather rate from Berry Bushes.",
    ([c, s, r]) => [
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
      value: increaseSpeedByPercent(1, s),
      type: "passive",
    },
    {
      property: "berryGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, r),
      type: "passive",
    },
  ]
  ),

  "copper-plating": standardAbility(
    "",
    ([i]) => [
    //Improves the fire and ranged armor of ships by +2%.

    {
      property: "fireArmor",
      select: { class: [["ship"], ["warship"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: { class: [["ship"], ["warship"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "tatara": standardAbility(
    "",
    ([i]) => [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "hizukuri": standardAbility(
    "",
    ([i]) => [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "kobuse-gitae": standardAbility(
    "",
    ([i]) => [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "yaki-ire": standardAbility(
    "",
    ([i]) => [
    // Increase the melee damage of all non-siege units by +1.
    {
      property: "meleeAttack",
      select: common.allMeleeUnitsExceptSiege,
      effect: "change",
      value: i,
      type: "passive",
    },
  ]
  ),

  "oda-tactics": standardAbility(
    "",
    ([i]) => [
    // Increase health, damage, and torch damage of melee infantry by 20%.

    {
      property: "hitpoints",
      select: { class: [["infantry", "melee"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: { class: [["infantry", "melee"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
    {
      property: "fireAttack",
      select: { class: [["infantry", "melee"]] },
      effect: "multiply",
      value: increaseByPercent(1, i),
      type: "passive",
    },
  ]
  ),

  "daimyo-manor": standardAbility(
    "",
    ([b, hp, fhr]) => [
    // Increases the production cap of Bannerman Samurai by +1 and provides a free Villager.
    // Increases Town Center health by +1000, adds an additional arrow slit, and adds an aura which enhances Villagers harvest rate from Farms by +25%.
    {
      property: "hitpoints",
      select: { id: ["town-center", "capital-towncenter"] },
      effect: "change",
      value: hp,
      type: "passive",
    },
    {
      property: "farmGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, fhr),
      type: "passive",
    },
  ]
  ),

  "daimyo-palace": standardAbility(
    "",
    ([b, hp, fa, fhr]) => [
    // Increases the production cap of Bannerman Samurai by +2 and provides a free Villager.
    // Increases Town Center health by +2000, fire armor by +2, adds an additional arrow slit, and adds an aura which enhances Villagers harvest rate from Farms by +50%.
    {
      property: "hitpoints",
      select: { id: ["town-center", "capital-towncenter"] },
      effect: "change",
      value: hp,
      type: "passive",
    },
    {
      property: "fireArmor",
      select: { id: ["town-center", "capital-towncenter"] },
      effect: "change",
      value: fa,
      type: "passive",
    },
    {
      property: "farmGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, fhr),
      type: "passive",
    },
  ]
  ),

  "shogunate-castle": standardAbility(
    "",
    ([b, hp, fa, fhr]) => [
    // Increases the production cap of Bannerman Samurai by +3 and provides a free Villager.
    // Increases Town Center health by +3000, fire armor by +3, adds an aura which enhances Villagers harvest rate from Farms by +75%, and equips a Rocket Emplacement.
    {
      property: "hitpoints",
      select: { id: ["town-center", "capital-towncenter"] },
      effect: "change",
      value: hp,
      type: "passive",
    },
    {
      property: "fireArmor",
      select: { id: ["town-center", "capital-towncenter"] },
      effect: "change",
      value: fa,
      type: "passive",
    },
    {
      property: "farmGatherRate",
      select: { id: ["villager"] },
      effect: "multiply",
      value: increaseByPercent(1, fhr),
      type: "passive",
    },
  ]
  ),

  "kabura-ya-whistling-arrow": standardAbility(
    "",
    ([d]) => [
    // Onna-Musha fire a whistling arrow when an enemy is seen, increasing move speed for 10 seconds.
    {
      property: "moveSpeed",
      select: { id: ["onna-musha"] },
      effect: "change",
      value: d,
      type: "ability",
    },
  ]
  ),

  "odachi": standardAbility(
    "",
    ([d]) => [
    // Equip Samurai with an Odachi, a long sword that deals +4 bonus damage against infantry.
    {
      property: "meleeAttack",
      select: { id: ["samurai", "katana-bannerman"] },
      target: { class: [["infantry"]] },
      effect: "change",
      value: d,
      type: "passive",
    },
  ]
  ),

  "do-maru-armor": standardAbility(
    "",
    ([d]) => [
    // Increase Mounted Samurai move speed by +10% while Deflective Armor is active.
    {
      property: "moveSpeed",
      select: { id: ["mounted-samurai"] },
      effect: "change",
      value: d,
      type: "ability",
    },
  ]
  ),

  "nagae-yari": standardAbility(
    "",
    ([r, d]) => [
    // Spearmen are equipped with a stronger spear that increases weapon range by +20% and damage against cavalry by +20%.
    {
      property: "maxRange",
      select: { id: ["spearman"] },
      effect: "multiply",
      value: increaseByPercent(1, r),
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: { id: ["spearman"] },
      target: { class: [["cavalry"]] },
      effect: "change",
      value: round(toPercent(d) * 28) + 5, // total bonus vs cav for elite, + elite bonus damage
      type: "bonus",
    },
  ]
  ),

  "war-horses": standardAbility(
    "",
    ([d]) => [
    // Gilded Knights take -25% damage while charging.
    {
      property: "unknown",
      select: { id: ["gilded-knight"] },
      effect: "multiply",
      value: decreaseByPercent(1, d),
      type: "passive",
    },
  ]
  ),

  "dragon-fire": standardAbility(
    "",
    ([d]) => [
    // Gilded Spearman torches deal area of effect damage.
    {
      property: "unknown",
      select: { id: ["gilded-spearman"] },
      effect: "change",
      value: d,
      type: "ability",
    },
  ]
  ),

  "golden-cuirass": standardAbility(
    "",
    ([hp, d]) => [
    // Gilded Men-at-Arms who fall below 20% health take -20% damage.
    {
      property: "unknown",
      select: { id: ["gilded-man-at-arms"] },
      effect: "multiply",
      value: decreaseByPercent(1, d),
      type: "passive",
    },
  ]
  ),

  "dragon-scale-leather": standardAbility(
    "",
    ([r]) => [
    // Increase the ranged armor of Gilded Archers by +3.
    {
      property: "rangedArmor",
      select: { id: ["gilded-archer"] },
      effect: "change",
      value: r,
      type: "passive",
    },
  ]
  ),

  "zornhau": standardAbility(
    "",
    ([dot, dur]) => [
    // Gilded Landsknecht equip a halberd weapon that wounds enemies. When struck by this weapon, a unit will bleed for 2 damage every second. Lasts 10 seconds.
    // Any healing effect will remove the bleed.
    {
      property: "unknown",
      select: { id: ["gilded-landsknecht"] },
      effect: "change",
      value: dot,
      type: "ability",
    },
  ]
  ),

  "bodkin-bolts": standardAbility(
    "",
    ([d]) => [
    // Gilded Crossbowmen deal +10 damage against Siege units.
    {
      property: "rangedAttack",
      select: { id: ["gilded-crossbowman"] },
      target: { class: [["siege"]] },
      effect: "change",
      value: d,
      type: "bonus",
    },
  ]
  ),

  // Zhu xi

  "advanced-administration": standardAbility(
    "",
    ([hp, carryCapacity]) => [
    // Imperial Officials gain 150 health and their maximum Gold carried is increased by +80. Imperial Official limit increased by +2.
    {
      property: "hitpoints",
      select: { id: ["imperial-official"] },
      effect: "change",
      value: hp,
      type: "passive",
    },
    {
      property: "carryCapacity",
      select: { id: ["imperial-official"] },
      effect: "change",
      value: carryCapacity,
      type: "passive",
    },
  ]
  ),

  "cloud-of-terror": placeholderAbility(
    "Adds area of effect damage to Bombards.",
    { id: ["bombard"] }
  ),

  "roar-of-the-dragon": placeholderAbility(
    "Spearmen and Horsemen gain a Fire Lance when charging.",
    { id: ["spearman", "horseman"] }
  ),

  "dynastic-protectors": placeholderAbility(
    "Allows production of unique cavalry units, the Imperial Guard, and the Yuan Raider.",
    { id: ["yuan-raider", "imperial-guard", "stable"] }
  ),

  // Increase House line of sight by 7 tiles and improve their construction speed by 500%.
  "border-settlements": standardAbility(
    "Increase House line of sight by {1} tiles and improve their construction speed by {2}%.",
    ([los, speed]) => [
    {
      property: "lineOfSight",
      select: { id: ["house"] },
      effect: "change",
      value: los,
      type: "passive",
    },
  ]
  ),

  //Horseman damage vs. Workers increased by +2. Workers killed by your Horsemen reward +20 Gold.
  "expilatores": standardAbility(
    "",
    ([d]) => [
    {
      property: "meleeAttack",
      select: { id: ["horseman"] },
      target: { class: [["worker"]] },
      effect: "change",
      value: d,
      type: "bonus",
    },
  ]
  ),

  // Varangian Guard increase their move speed by +30% when activating Berserking.
  "ferocious-speed": standardAbility(
    "",
    ([ms]) => [
    {
      property: "moveSpeed",
      select: { id: ["varangian-guard"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, ms),
      type: "ability",
    },
  ]
  ),

  // Counterweight Trebuchets deal +30% increased damage and engulf their target with Greek Fire, dealing area damage.
  "greek-fire-projectiles": standardAbility(
    "",
    ([d]) => [
    {
      property: "siegeAttack",
      select: { id: ["counterweight-trebuchet"] },
      effect: "multiply",
      value: increaseByPercent(1, d),
      type: "passive",
    },
  ]
  ),

  // Upgrade all Dromons to leave Greek Fire on the surface or ground where they attack. Man The Sails cooldown also reduced to 1 seconds.
  "heavy-dromon": placeholderAbility(
    "",
    { id: ["dromon"] }
  ),

  // Demolition ships deal full damage to all enemies in explosion radius.
  "liquid-explosives": placeholderAbility(
    "",
    { id: ["demolition-ship"] }
  ),

  // Add a defensive mangonel emplacement to this structure.
  "mangonel-emplacement": placeholderAbility(
    "Add a defensive springald emplacement to this structure. Only one weapon emplacement can be added.",
    { id: ["keep"] }
  ),

  // Enemy units hit by Trample become vulnerable and receive +20% increased damage for 12 seconds.
  numeri: placeholderAbility(
    "",
    { id: ["cataphract"] }
  ),

  // Increase the armor of Cataphracts by +1, move speed of Limitanei by +15%, and attack speed of Varangian Guard by +15%.
  "teardrop-shields": standardAbility(
    "",
    ([a, ms, as]) => [
    {
      property: "meleeArmor",
      select: { id: ["cataphract"] },
      effect: "change",
      value: a,
      type: "passive",
    },
    {
      property: "moveSpeed",
      select: { id: ["limitanei"] },
      effect: "multiply",
      value: increaseByPercent(1, ms),
      type: "passive",
    },
    {
      property: "attackSpeed",
      select: { id: ["varangian-guard"] },
      effect: "multiply",
      value: increaseAttackSpeedByPercent(as),
      type: "passive",
    },
  ]
  ),

  // Increase Jeanne d'Arc's health and damage by 25% and gain +1 armor. Increase the health and damage of Jeanne's Companions by 20%.
  "companion-equipment": standardAbility(
    "",
    ([jeanne, armor, companions]) => [
    {
      property: "hitpoints",
      select: { id: ["jeannes-champion", "jeannes-rider"] },
      effect: "multiply",
      value: increaseByPercent(1, companions),
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: { id: ["jeannes-companion", "jeannes-rider"] },
      effect: "multiply",
      value: increaseByPercent(1, companions),
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: common.jeannes.lvl3,
      effect: "multiply",
      value: increaseByPercent(1, jeanne),
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: common.jeannes.lvl3,
      effect: "multiply",
      value: increaseByPercent(1, jeanne),
      type: "passive",
    },
    {
      property: "hitpoints",
      select: common.jeannes.lvl3,
      effect: "multiply",
      value: increaseByPercent(1, jeanne),
      type: "passive",
    },
    {
      property: "meleeArmor",
      select: common.jeannes.lvl3,
      effect: "change",
      value: armor,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: common.jeannes.lvl3,
      effect: "change",
      value: armor,
      type: "passive",
    },
    {
      property: "rangedAttack",
      select: common.jeannes.lvl4,
      effect: "multiply",
      value: increaseByPercent(1, jeanne),
      type: "passive",
    },
    {
      property: "meleeAttack",
      select: common.jeannes.lvl4,
      effect: "multiply",
      value: increaseByPercent(1, jeanne),
      type: "passive",
    },
    {
      property: "hitpoints",
      select: common.jeannes.lvl4,
      effect: "multiply",
      value: increaseByPercent(1, jeanne),
      type: "passive",
    },
    {
      property: "meleeArmor",
      select: common.jeannes.lvl4,
      effect: "change",
      value: armor,
      type: "passive",
    },
    {
      property: "rangedArmor",
      select: common.jeannes.lvl4,
      effect: "change",
      value: armor,
      type: "passive",
    },
  ]
  ),

  // Increases Shinto Priest health by +40, healing rate by +60%, and movement speed by +15%.
  "shinto-rituals": standardAbility(
    "",
    ([hp, hr, ms]) => [
    {
      property: "hitpoints",
      select: { id: ["shinto-priest"] },
      effect: "change",
      value: hp,
      type: "passive",
    },
    {
      property: "healingRate",
      select: { id: ["shinto-priest"] },
      effect: "multiply",
      value: increaseByPercent(1, hr),
      type: "passive",
    },
    {
      property: "moveSpeed",
      select: { id: ["shinto-priest"] },
      effect: "multiply",
      value: increaseSpeedByPercent(1, ms),
      type: "passive",
    },
  ]
  ),

  // Increases the maximum number of Yorishiro by +2. Immediately spawns 2 Yorishiro at the Floating Gate.
  "bunrei": standardAbility(
    "",
    ([b]) => [
    {
      property: "unknown",
      select: { id: ["floating-gate"] },
      effect: "change",
      value: b,
      type: "ability",
    },
  ]
  ),

  // Increases the Line of Sight of all buildings by +2 tiles. Every 3 minutes, all economic units heal for 100% of their health over 3 seconds.
  "gion-festival": standardAbility(
    "",
    ([los]) => [
    {
      property: "lineOfSight",
      select: { class: [["building"]] },
      effect: "change",
      value: los,
      type: "passive",
    },
  ]
  ),

  // Buddhist Monks generate 25 gold every 60 seconds.
  "zen": standardAbility(
    "",
    ([g]) => [
    {
      property: "goldGeneration",
      select: { id: ["buddhist-monk"] },
      effect: "change",
      value: g,
      type: "passive",
    },
  ]
  ),

  // Buddhist Temples cast Sohei Sutra on a nearby enemy every 6 seconds.
  "five-mountain-ministries": placeholderAbility(
    "",
    { id: ["buddhist-temple", "temple-of-equality"] }
  ),

  // Upgrades Buddhist Conversion to Nehan Conversion, which has a 25% shorter cooldown and additionally improves nearby allied units movement speed by +25% when cast.
  "nehan": placeholderAbility(
    "",
    { id: ["buddhist-monk"] }
  ),

};
