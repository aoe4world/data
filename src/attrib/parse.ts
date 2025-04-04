import { ITEM_TYPES } from "../lib/config";
import { getTranslation, getTranslationRaw, NO_TRANSLATION_FOUND } from "./translations";
import { parseWeapons } from "./weapons";
import { ignoreForNow } from "./config";
import { slugify } from "../lib/utils/string";
import { Armor, Building, Item, ItemClass, ModifyableProperty, Technology, Unit, Upgrade, Ability } from "../types/items";
import { CivConfig } from "../types/civs";
import { prepareIcon } from "./icons";
import { technologyModifiers, abilityModifiers } from "./modifiers";
import { RunContext, writeTemp } from "./run";

export async function parseItemFromAttribFile(file: string, data: any, civ: CivConfig, context: RunContext) {
  const type = guessType(file, data);
  const { debug, getData } = context;

  if (ignoreForNow.some((i) => (typeof i == "function" ? i(file) : file.includes(i)))) {
    if (debug) console.log(`Ignoring ${file} for now`);
    return undefined;
  }

  if (!type) {
    if (debug) console.log(`Skipping ${file} because it is of an unsupported type`);
    return undefined;
  }

  if (debug) writeTemp(data, file.split("/").join("_"));

  try {
    let ebpextensions = data.extensions;

    const loadout = maybeOnKey(findExt(data, "squadexts", "sbpextensions/squad_loadout_ext")?.unit_list[0], "loadout_data");
    const unitEbps = loadout?.type;
    if (unitEbps) {
      const ebps = await getData(unitEbps, context);
      if (debug) writeTemp(ebps, unitEbps.split("/").join("_"));
      ebpextensions = ebps?.extensions;
    }

    const ebpExts = Object.fromEntries(ebpextensions?.map((e) => [e.exts?.replace("ebpextensions/", ""), e]) ?? []);

    const isBuff = file.includes("buff_info/");

    let ui_ext;
    let ability_data = type == ITEM_TYPES.ABILITIES && !isBuff ? data.ability_bag ?? data.extensions[0] : undefined;

    if (type === ITEM_TYPES.BUILDINGS) ui_ext = ebpExts.ui_ext;
    else if (type === ITEM_TYPES.TECHNOLOGIES || type === ITEM_TYPES.UPGRADES) ui_ext = data.upgrade_bag.ui_info;
    else if (type === ITEM_TYPES.ABILITIES && !isBuff) ui_ext = Object.assign({}, ability_data.ui_info, { ui_contextual_info: ability_data.ui_contextual_info?.context });
    else if (type === ITEM_TYPES.ABILITIES && isBuff) ui_ext = data.info ?? data.extensions[0] ?? data.ui_info ?? {};
    else if (type === ITEM_TYPES.UNITS) {
      ui_ext = maybeOnKey(data.extensions.find((e) => e.squadexts === "sbpextensions/squad_ui_ext")?.race_list[0], "race_data")?.info;
    }
    if (!ui_ext && type === ITEM_TYPES.UNITS && ebpExts.ui_ext) ui_ext = ebpExts.ui_ext;

    let name = getTranslation(ui_ext?.ui_contextual_info?.screen_name ?? ui_ext?.screen_name ?? ui_ext.title);
    if (name === NO_TRANSLATION_FOUND) name = file.split("/").pop()!;
    const description = parseDescription(ui_ext);
    const attribName = file.split("/").pop()!.replace(".xml", "").replace(".json", "");
    const age = parseAge(attribName, ebpExts?.requirement_ext?.requirement_table ?? data.upgrade_bag?.requirements ?? ability_data?.requirements, data.parent_pbg);
    const baseId = getBasedId(name, type, description);
    const id = `${baseId}-${age}`;

    const displayClasses = getTranslation(ui_ext.extra_text)
      .split(",")
      .map((x) => x.trim());

    const classes = displayClasses.flatMap((x) => x.toLowerCase().split(" ")) as ItemClass[];

    const unique = parseUnique(ui_ext);

    let costs;
    if (isBuff) costs = {};
    else if (type === ITEM_TYPES.ABILITIES) costs = parseCosts(ability_data.cost_to_player, ability_data.recharge_cost, 0);
    else
      costs = parseCosts(
        ebpExts?.cost_ext?.time_cost?.cost || data.upgrade_bag?.time_cost?.cost,
        ebpExts?.cost_ext?.time_cost?.time_seconds || data.upgrade_bag?.time_cost?.time_seconds,
        ebpExts?.population_ext?.personnel_pop
      );

    const icon_name = isBuff ? ui_ext.icon?.slice(6) : (ui_ext.icon_name ?? ui_ext.icon);
    const [icon_src, icon] = await prepareIcon(icon_name, type, id);
    if (!icon) console.log(`undefined icon for ${file}`, ui_ext.icon_name ?? ui_ext.icon);

    const pbgid = data.pbgid;

    let item: Item = {
      id: id,
      baseId,
      type: "unit",
      name,
      pbgid,
      attribName,
      age,
      civs: [civ.abbr],
      description,
      classes,
      displayClasses,
      unique,
      costs,
      producedBy: [],
      icon_src,
      icon,
    };

    if (type === ITEM_TYPES.ABILITIES) {
      const translationFormatter = (isBuff ? ui_ext.description_formatter : ui_ext.help_text_formatter);
      const translationFormat = getTranslationRaw(translationFormatter?.formatter || ui_ext.help_text);
      const translationParams = translationFormatter?.formatter_arguments?.map((x) => Object.values(x)[0] ?? x) ?? [];
      const effectsFactory = abilityModifiers[baseId];
      const effects = effectsFactory?.call(translationFormat, translationParams, item) ?? [];

      if (isBuff) {
        const ability: Ability = {
          ...item,
          type: "ability",
          displayClasses: [],
          classes: [],
          effects,
        };

        delete ability["unique"];
        return ability;
      }

      const ability: Ability = {
        ...item,
        type: "ability",
        displayClasses: [],
        classes: [],
        active: parseAbilityActivation(file),
        auraRange: ability_data.range / 4,
        cooldown: ability_data.recharge_time,
        toggleGroup: ability_data.toggle_ability_group,
        effects,
      };
      delete ability["unique"];
      if (!ability["toggleGroup"]) delete ability["toggleGroup"];
      if (!ability["cooldown"]) delete ability["cooldown"];

      return ability;
    }

    if (type === ITEM_TYPES.BUILDINGS) {
      let influences = parseInfluences(ui_ext);

      const building: Building = {
        ...item,
        type: "building",
        hitpoints: parseHitpoints(ebpExts?.health_ext),
        weapons: await parseWeapons(ebpExts.combat_ext, context),
        armor: parseArmor(ebpExts?.health_ext),
        sight: parseSight(ebpExts?.sight_ext),
        garrison: parseGarrison(ebpExts?.hold_ext),
        influences,
      } as any;

      return building;
    }

    if (type === ITEM_TYPES.UNITS) {
      const weapons = await parseWeapons(ebpExts.combat_ext, context);

      const loadoutUnits = loadout?.unit_attachments?.map((x) => (x.unit ?? x).type);
      if (loadoutUnits)
        for (const luFile of loadoutUnits) {
          if (ignoreForNow.includes(luFile)) continue;
          try {
            const luEbps = await getData(luFile, context);
            if (debug) writeTemp(luEbps, "ebps_" + luFile.split("/").pop()!);
            const luWeapons = await parseWeapons(
              luEbps?.extensions.find((ex) => ex.exts === "ebpextensions/combat_ext"),
              context
            );
            if (luWeapons) weapons.push(...luWeapons);
          } catch (e) {
            console.log("Error parsing loadout unit", luFile, e);
          }
        }

      const unit: Unit = {
        ...item,
        type: "unit",
        hitpoints: parseHitpoints(ebpExts?.health_ext),
        weapons,
        armor: parseArmor(ebpExts?.health_ext),
        sight: parseSight(ebpExts?.sight_ext),
        movement: parseMovement(ebpExts?.moving_ext),
        garrison: parseGarrison(ebpExts?.hold_ext),
      };

      return unit;
    }

    if (type === ITEM_TYPES.TECHNOLOGIES) {
      const translationFormatter = ui_ext.help_text_formatter;
      const translationFormat = getTranslationRaw(translationFormatter?.formatter || ui_ext.help_text);
      const translationParams =translationFormatter?.formatter_arguments?.map((x) => Object.values(x)[0] ?? x) ?? [];
      const effectsFactory = technologyModifiers[baseId];
      const effects = effectsFactory?.call(translationFormat, translationParams, item) ?? [];

      // if (item.id == "upgrade-militia-4-4") {
      if (effects.length == 0) {
        const addEffect = (property: ModifyableProperty, value: number, effect: "change" | "multiply" = "change", type: "passive" | "ability" = "passive") =>
          effects.push({ property, value, effect, type });

        for (let { id, value } of data?.upgrade_bag?.float_properties ?? []) {
          const effect = value < 1 ? "multiply" : "change";
          if (effect == "multiply") value = 1 + value;
          if (id === "health_max") addEffect("hitpoints", value, effect);
          else if (id === "melee_damage") addEffect("meleeAttack", value, effect);
          else if (id === "charge_damage") addEffect("meleeAttack", value, effect, "ability");
          else if (id === "armor_fire") addEffect("fireArmor", value, effect);
          else if (id === "armor_melee") addEffect("meleeArmor", value, effect);
          else if (id === "armor_range") addEffect("rangedArmor", value, effect);
          else if (id === "damage") {
            addEffect("meleeAttack", value, effect);
            addEffect("rangedAttack", value, effect);
            addEffect("siegeAttack", value, effect);
            addEffect("fireAttack", value, effect);
          } else if (id === "multiplier") {
            // ignore
          } else console.log("Unknown float property", id, value, item.attribName, item.id);
        }
      }
      const tech: Technology = {
        ...item,
        type: "technology",
        effects,
      };

      return tech;
    }

    if (type === ITEM_TYPES.UPGRADES) {
      const upgrade: Upgrade = {
        ...item,
        type: "upgrade",
        unlocks: "",
      };

      return upgrade;
    }
  } catch (e) {
    console.error(`src/attrib/.dev/${file}.essence.json`, e);
    return undefined;
  }
}

function guessType(file: string, data: any) {
  const fileName = file.split("/").pop()!;
  if (fileName.startsWith("building_")) return ITEM_TYPES.BUILDINGS;
  if (fileName.startsWith("unit_")) return ITEM_TYPES.UNITS;
  if (fileName.startsWith("herdable_")) return undefined;
  if (fileName.startsWith("gaia_")) return undefined;

  // below is too hacky for my taste, it filters out some wonky things we would call technologies like wheelbarrow and herbal medicine
  if (fileName.startsWith("upgrade_unit") && data?.upgrade_bag?.global_max_limit == 1 && data?.upgrade_bag?.requirements?.length) return ITEM_TYPES.UPGRADES;
  if (fileName.startsWith("upgrade_")) return ITEM_TYPES.TECHNOLOGIES;
  if (fileName.startsWith("merc_")) return ITEM_TYPES.TECHNOLOGIES;
  if (file.startsWith("abilities")) return ITEM_TYPES.ABILITIES;
  if (file.startsWith("info/buff_info")) return ITEM_TYPES.ABILITIES;
  return undefined;
}

function getBasedId(name: string, type: ITEM_TYPES, description) {
  let baseId = slugify(name).trim();
  if (type === ITEM_TYPES.UPGRADES && description != NO_TRANSLATION_FOUND) baseId = slugify(description).trim().split("-to-").pop()!;
  if (type === ITEM_TYPES.UNITS) baseId = baseId.replace(/^(early|vanguard|veteran|elite|hardened)\-/, "");
  if (type === ITEM_TYPES.ABILITIES) return `ability-${baseId}`;
  return baseId;
}

function findExt(data: any, key: string, value: string) {
  return data?.extensions?.find((x) => x[key] === value);
}

function parseDescription(ui_ext: any) {
  if (!ui_ext) return `not-found-${Math.random()}`;

  const { formatter, formatter_arguments } = !!ui_ext.help_text_formatter?.formatter
    ? ui_ext.help_text_formatter
    : !!ui_ext.ui_contextual_info?.help_text_formatter?.formatter
    ? ui_ext.ui_contextual_info.help_text_formatter
    : !!ui_ext.description_formatter?.formatter
    ? ui_ext.description_formatter
    : { formatter: ui_ext.help_text ?? ui_ext.description, formatter_arguments: [] };

  const translation = getTranslation(
    formatter,
    formatter_arguments.map((x) => (typeof x === "number" ? x : Object.values(x)[0] ?? x))
  );

  if (translation === NO_TRANSLATION_FOUND) return `not-found-${Math.random()}`; // throw new Error("No translation found for " + ui_ext.help_text);
  return translation;
}

function parseHitpoints(health_ext: any) {
  return health_ext?.hitpoints;
}

function parseCosts(cost: any, time: any, popcap = 0) {
  const { food, wood, gold, stone, command: vizier, merc_byz: oliveoil } = cost as Record<"food" | "wood" | "gold" | "stone" | "popcap" | "merc_byz" | "command", number>;
  const costs = { food, wood, stone, gold, vizier, oliveoil, total: food + wood + gold + stone + oliveoil, popcap, time };
  return costs;
}

function parseAge(name: string, requirements: any, parent_pbg: string) {
  const ageUpLandmark = [
    { parent: "/building_wonder_age3", age: 3 },
    { parent: "/building_wonder_age2", age: 2 },
    { parent: "/building_wonder_age1", age: 1 },
  ];
  const ageup = ageUpLandmark.find((x) => typeof parent_pbg === "string" && parent_pbg?.endsWith(x.parent));
  if (ageup) return ageup.age;
  let age = 1;
  const requiredUpgrade = requirements?.find((x) => String(x?.upgrade_name).endsWith("_age"))?.upgrade_name;
  if (requiredUpgrade?.endsWith("dark_age")) age = 1;
  else if (requiredUpgrade?.endsWith("feudal_age")) age = 2;
  else if (requiredUpgrade?.endsWith("castle_age")) age = 3;
  else if (requiredUpgrade?.endsWith("imperial_age")) age = 4;
  else {
    const nameParts = name!.split("/")!.shift()!.split("_")!;
    for (const p of nameParts.reverse()) {
      if (p.startsWith("0")) continue; // variant civs
      const n = parseFloat(p);
      if (!isNaN(n)) {
        age = n;
        break;
      }
    }
  }
  return age;
}

function parseSight(sight_ext: any) {
  const {
    inner_height = 0,
    inner_radius = 0,
    outer_height = 0,
    outer_radius = 0
  } = sight_ext?.sight_package || {};
  // It's a cone and outer_height is negative (which leads to units seeing further from elevation)
  // Calculate the radius at 0 height
  const base = outer_height === inner_height ? outer_radius : (outer_radius - outer_height * (inner_radius - outer_radius) / (inner_height - outer_height));
  return {
    inner_height,
    inner_radius,
    outer_height,
    outer_radius,
    base,
    line: outer_radius,
    height: inner_height,
  };
}

export const damageMap = {
  "True Damage": "siege",
  Melee: "melee",
  Ranged: "ranged",
  Fire: "fire",
};
const armorSort = ["melee", "ranged", "siege", "fire"];
function parseArmor(health_ext): Armor[] {
  if (!health_ext?.armor_scaler_by_damage_type) return [];
  return (
    Object.entries<number>(health_ext?.armor_scaler_by_damage_type)
      ?.filter(([k, v]) => v > 0)
      .map(([k, v]) => ({ type: damageMap[k], value: v }))
      .sort((a, b) => armorSort.indexOf(a.type) - armorSort.indexOf(b.type)) ?? []
  );
}

function parseMovement(moving_ext: any) {
  return {
    speed: moving_ext?.speed_scaling_table.default_speed / 4,
  };
}

function parseGarrison(hold_ext: any) {
  return hold_ext?.num_slots
    ? {
        capacity: hold_ext?.num_slots,
        classes: hold_ext?.acceptable_types?.map((x) => (typeof x == "string" ? x : x.acceptable_type).replace("hold_", "").replace(/\_/g, " ")) ?? [],
      }
    : undefined;
}

function parseUnique(ui_ext: any) {
  return ui_ext.is_unique_to_race || ui_ext.is_unique || ["UniqueBuildingUpgradeDataTemplate", "BuildingImprovedUpgradeDataTemplate"].includes(ui_ext.tooltip_data_template);
}

function parseInfluences(ui_ext: any) {
  if (ui_ext.ui_extra_infos)
    return ui_ext.ui_extra_infos?.reduce((inf, x) => {
      const str = getTranslation(
        x.description || x.description_formatter.formatter,
        x.description_formatter?.formatter_arguments?.map((x) => Object.values(x)[0] ?? x)
      );
      if (["influence_buff", "influence_decorator"].includes(x.icon)) inf.push(str);
      return inf;
    }, [] as string[]);
}

export function maybeOnKey(obj: any, key: string) {
  return obj?.[key] ?? obj;
}

function parseAbilityActivation(filename: string) {
  if (filename.includes("timed") || filename.includes("modal")) return "manual";
  if (filename.includes("toggle")) return "toggle";
  return "always";
}
