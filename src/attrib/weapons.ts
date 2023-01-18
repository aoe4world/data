import path from "path";
import fs from "fs";
import { Weapon } from "../types/items";
import { getTranslation } from "./translations";
import { parseXmlFile } from "./xml";
import { attribFile } from "./config";
import { damageMap } from "./parse";
import { RunContext } from "./run";

export function parseWeapons(combat_ext: any, context: RunContext): Promise<Weapon[]> {
  const weaponList = (combat_ext?.hardpoints.flatMap((h) =>
    (h.hardpoint?.weapon_table ?? h.weapon_table)?.map((w) => ({
      weapon: (w.weapon ?? w).non_entity_weapon_wrapper?.non_entity_weapon_wrapper_pbg,
      attach: (w.weapon?.weapon_entity_attachment ?? w.weapon ?? w)?.entity_attach_data?.ebp,
    }))
  ) ?? []) as { weapon?: string; attach?: string }[];

  const weapons = weaponList.map(async (ref) => {
    if (ref?.weapon) return parseWeapon(ref.weapon, context);
    if (ref?.attach) {
      const file = await context.getData(attribFile(ref.attach), undefined, context);
      const weaponFile = file!.extensions.find((x) => x.exts == "ebpextensions/weapon_ext")?.weapon;
      return parseWeapon(weaponFile, context);
    }
    return undefined;
  }, [] as Promise<Weapon>[]);

  return oneWeaponPerType(weapons);
}

async function parseWeapon(file: string, context: RunContext): Promise<Weapon> {
  const weapon: any = await context.getData(attribFile(file), undefined, context);
  if (context.debug) fs.writeFileSync(path.join(__dirname, "/.temp", file.split("/").pop()! + ".json"), JSON.stringify(weapon ?? {}, null, 2));

  const name = getTranslation(weapon.weapon_bag.ui_name);

  const type = damageMap[weapon.weapon_bag.damage.damage_type];

  const damage = weapon.weapon_bag.damage.max;

  const modifiers = weapon.weapon_bag.target_type_table.map((x) => ({
    property: `${type}Attack`,
    target: {
      class: [(x.target_unit_type_multipliers ?? x).unit_type?.split("_")],
    },
    effect: "change",
    value: (x.target_unit_type_multipliers ?? x).base_damage_modifier,
    type: "passive",
  }));

  const burstInfo = weapon.weapon_bag.burst.can_burst ? weapon.weapon_bag.burst : undefined;
  const burstDuration = burstInfo?.duration ? minMaxAvg(burstInfo?.duration) : 0;
  const burst = burstInfo && { count: minMaxAvg(burstInfo.duration) * minMaxAvg(burstInfo.rate_of_fire) };

  const durations = {
    aim: minMaxAvg(weapon.weapon_bag.aim.fire_aim_time),
    windup: weapon.weapon_bag.fire.wind_up,
    attack: Math.max(burstDuration, 0.125), // Always at least one tick
    winddown: weapon.weapon_bag.fire.wind_down,
    reload: minMaxAvg(weapon.weapon_bag.reload.duration),
    setup: weapon.weapon_bag.setup.duration,
    teardown: weapon.weapon_bag.teardown.duration,
    cooldown: minMaxAvg(weapon.weapon_bag.cooldown.duration),
  };

  const speed = ["aim", "windup", "attack", "winddown", "reload", "cooldown"].reduce((a, b) => a + durations[b], 0);

  const range = {
    min: weapon.weapon_bag.range.min / 4,
    max: weapon.weapon_bag.range.max / 4,
  };

  return {
    name,
    type,
    damage,
    speed,
    range,
    modifiers,
    durations,
    burst,
    attribName: file.split("/").pop()!,
    pbgid: weapon.pbgid,
  };
}

// Temp workaround to dedupe and narrow down the abundance of weapons and variations to just one
// obviously this is not a good solution, but there's no reasoning to which weapons are actually
// used in the game, so this is the best we can do for now
async function oneWeaponPerType(weapons: Promise<Weapon | undefined>[]): Promise<Weapon[]> {
  const wps = await Promise.all(weapons);
  const types = new Set(
    wps
      .filter(Boolean)
      .reverse()
      .map((w) => w!.type)
  );
  return wps.filter(Boolean) as Weapon[];
}

function minMaxAvg(x: { min: number; max: number }) {
  return (x.min + x.max) / 2;
}
