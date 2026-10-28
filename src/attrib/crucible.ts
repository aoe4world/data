import fs from "fs/promises";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { CDN_HOST, IMAGE_FOLDER, ROOT_FOLDER } from "../lib/config";
import { CIVILIZATIONS } from "../lib/config/civs";
import { writeJson } from "../lib/files/writeData";
import { cleanDescription, slugify } from "../lib/utils/string";
import {
  CrucibleBoon,
  CrucibleBoonTier,
  CrucibleCivTalents,
  CrucibleMutator,
  CruciblePerk,
  CruciblePerkLevel,
  CrucibleTalentLevel,
} from "../types/crucible";
import { ATTRIB_FOLDER, SOURCE_FOLDER } from "./config";
import { copyIcon } from "./icons";
import {
  recordCrucibleBoon,
  recordCrucibleMutator,
  recordCruciblePerk,
  recordCrucibleTalent,
} from "./localize";
import { RunContext } from "./run";
import {
  getTargetLocales,
  getTranslation,
  NO_TRANSLATION_FOUND,
  resolveTranslationParam,
} from "./translations";

function findNodeByKey(obj: any, targetKey: string): any {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const res = findNodeByKey(item, targetKey);
      if (res) return res;
    }
  } else if (obj && typeof obj === "object") {
    if (obj.key === targetKey) return obj;
    for (const v of Object.values(obj)) {
      const res = findNodeByKey(v, targetKey);
      if (res) return res;
    }
  }
  return null;
}

function parseUiDescription(ui: any[], locale = "en"): string {
  if (!ui) return "";
  const descFmt = ui.find((v) => v.key === "help_text_formatter")?.value;
  const fmtId = descFmt?.find((v: any) => v.key === "formatter")?.value;
  const rawArgs = descFmt?.find((v: any) => v.key === "formatter_arguments")?.value ?? [];
  const args = rawArgs.map((x: any) => resolveTranslationParam(x, locale));
  const helpId = ui.find((v) => v.key === "help_text")?.value;
  const idToUse = fmtId ?? helpId;
  if (!idToUse) return "";
  const raw = getTranslation(idToUse, args, locale);
  if (raw.startsWith(NO_TRANSLATION_FOUND)) return "";
  return cleanDescription(raw) ?? "";
}

function parseUiName(ui: any[], locale = "en"): string {
  if (!ui) return "";
  const nameId = ui.find((v) => v.key === "screen_name")?.value;
  if (!nameId) return "";
  const raw = getTranslation(nameId, [], locale);
  if (raw.startsWith(NO_TRANSLATION_FOUND)) return "";
  return raw.trim();
}

function findFilesRecursive(dir: string, ext = ".json"): string[] {
  let results: string[] = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findFilesRecursive(full, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

async function extractPerks(context: RunContext | undefined, tp: any): Promise<CruciblePerk[]> {
  const favorNode = findNodeByKey(tp, "favor_system")?.value;
  const perksNode = favorNode?.find((v: any) => v.key === "perks")?.value;
  const perkEntries: string[] =
    perksNode
      ?.filter((v: any) => v.key === "perk")
      .map((v: any) => v.value.find((x: any) => x.key === "$PBGNAME")?.value) ?? [];

  const targetLocales = getTargetLocales();
  const perks: CruciblePerk[] = [];

  for (let idx = 0; idx < perkEntries.length; idx++) {
    const pbgName = perkEntries[idx];
    const filePath = path.join(
      ATTRIB_FOLDER,
      "rogue_mode/persistent_perks/persistent_perk_desc",
      `${pbgName}.json`
    );
    if (!existsSync(filePath)) {
      console.warn(`[Crucible] Perk file not found: ${filePath}`);
      continue;
    }

    const json = JSON.parse(await fs.readFile(filePath, "utf8"));
    const bag = json.data[0].value.find((v: any) => v.key === "perk_desc_bag")?.value ?? [];
    const pbgid = json.data[0].value.find((v: any) => v.key === "pbgid")?.value;
    const ui = bag.find((v: any) => v.key === "ui_info")?.value ?? [];

    const name = parseUiName(ui, "en");
    const baseId = slugify(name);
    const description = parseUiDescription(ui, "en");

    // Copy Perk Image
    const image = bag.find((v: any) => v.key === "image")?.value;
    const iconPath = `crucible/perks/${baseId}.png`;
    let iconUrl = `${CDN_HOST}/${IMAGE_FOLDER}/${iconPath}`;
    if (image) {
      const sourceImage = path.join(SOURCE_FOLDER, "ui/images", `${image}.png`);
      const copied = await copyIcon(sourceImage, iconPath);
      if (copied) iconUrl = copied;
    }

    // Parse levels
    const levelsNode = bag.find((v: any) => v.key === "levels")?.value ?? [];
    const levels: CruciblePerkLevel[] = [];

    for (let lIdx = 0; lIdx < levelsNode.length; lIdx++) {
      const lvlBag = levelsNode[lIdx].value ?? [];
      const favorCost = lvlBag.find((v: any) => v.key === "favor_cost")?.value ?? 0;
      const actionNode = lvlBag.find((v: any) => v.key === "action")?.value ?? [];
      const actionPbgName = actionNode.find((v: any) => v.key === "$PBGNAME")?.value;
      const actionPbgMap = actionNode.find((v: any) => v.key === "$PBGMAP")?.value;

      let actionPbgid = 0;
      let effect = "";
      if (actionPbgName && actionPbgMap) {
        const actionFile = path.join(ATTRIB_FOLDER, actionPbgMap, pbgName, `${actionPbgName}.json`);
        if (existsSync(actionFile)) {
          const aJson = JSON.parse(await fs.readFile(actionFile, "utf8"));
          actionPbgid = aJson.data[0].value.find((v: any) => v.key === "pbgid")?.value ?? 0;
          const aBag = aJson.data[0].value.find((v: any) => v.key === "perk_action_bag")?.value ?? [];
          const aEffect = aBag.find((v: any) => v.key === "effect")?.value ?? [];
          const aFmt = aEffect.find((v: any) => v.key === "effect_text_formatter")?.value ?? [];
          const aFmtId = aFmt.find((v: any) => v.key === "formatter")?.value;
          const rawArgs = aFmt.find((v: any) => v.key === "formatter_arguments")?.value ?? [];
          const args = rawArgs.map((x: any) => resolveTranslationParam(x, "en"));
          if (aFmtId) {
            const rawEffect = getTranslation(aFmtId, args, "en");
            if (!rawEffect.startsWith(NO_TRANSLATION_FOUND)) effect = rawEffect.trim();
          }
        }
      }

      // Determine level description
      let levelDesc = "";
      const levelRegex = new RegExp(`Level\\s*${lIdx + 1}[:.]\\s*([^\\r\\n]+)`, "i");
      const levelMatch = description.match(levelRegex);
      if (levelMatch) {
        levelDesc = levelMatch[1].trim();
      } else if (effect) {
        levelDesc = `${effect} ${name}`;
      } else {
        levelDesc = `${name} Level ${lIdx + 1}`;
      }

      levels.push({
        level: lIdx + 1,
        favorCost,
        pbgid: actionPbgid,
        attribName: actionPbgName ?? `${pbgName}_${lIdx + 1}`,
        effect: effect || undefined,
        description: levelDesc,
      });
    }

    perks.push({
      index: idx,
      id: baseId,
      baseId,
      name,
      attribName: pbgName,
      pbgid,
      description,
      icon: iconUrl,
      levels,
    });

    // Record translations
    for (const locale of targetLocales) {
      const locName = parseUiName(ui, locale);
      const locDesc = parseUiDescription(ui, locale);
      if (locName || locDesc) {
        recordCruciblePerk(baseId, locale, {
          ...(locName ? { name: locName } : {}),
          ...(locDesc ? { description: locDesc } : {}),
        });
      }
    }
  }

  return perks;
}

async function extractTalents(context: RunContext | undefined, tp: any): Promise<Record<string, CrucibleCivTalents>> {
  const talentGroupsNode = findNodeByKey(tp, "talent_groups")?.value ?? [];
  const raceTalentEntries = talentGroupsNode
    .filter((v: any) => v.key === "race_talent_info")
    .map((v: any) => {
      const r = v.value.find((y: any) => y.key === "race")?.value?.find((z: any) => z.key === "$PBGNAME")?.value;
      const t = v.value.find((y: any) => y.key === "talent_perk")?.value?.find((z: any) => z.key === "$PBGNAME")?.value;
      return { race: r, talentPerk: t };
    });

  const talentLevelsNode = findNodeByKey(tp, "talent_levels")?.value ?? [];
  const talentPointsList: number[] = talentLevelsNode
    .filter((v: any) => v.key === "talent_points")
    .map((v: any) => v.value);

  const targetLocales = getTargetLocales();
  const result: Record<string, CrucibleCivTalents> = {};

  for (const { race, talentPerk } of raceTalentEntries) {
    if (!race || !talentPerk) continue;

    const civ = Object.values(CIVILIZATIONS).find((c) => c.attribName === race);
    if (!civ) {
      console.warn(`[Crucible] No civilization configuration matching race '${race}'`);
      continue;
    }
    const civSlug = civ.slug;

    const levels: CrucibleTalentLevel[] = [];
    for (let l = 1; l <= 15; l++) {
      const pad = String(l).padStart(2, "0");
      const actionFile = path.join(
        ATTRIB_FOLDER,
        "rogue_mode/persistent_perks/persistent_perk_action/_talents",
        talentPerk,
        `talent_${pad}_${talentPerk}.json`
      );

      if (existsSync(actionFile)) {
        const aJson = JSON.parse(await fs.readFile(actionFile, "utf8"));
        const aBag = aJson.data[0].value.find((v: any) => v.key === "perk_action_bag")?.value ?? [];
        const aPbgid = aJson.data[0].value.find((v: any) => v.key === "pbgid")?.value ?? 0;
        const aUi = aBag.find((v: any) => v.key === "ui_info")?.value ?? [];

        const name = parseUiName(aUi, "en");
        const description = parseUiDescription(aUi, "en");
        const talentPoints = talentPointsList[l - 1] ?? 0;

        levels.push({
          level: l,
          talent_points: talentPoints,
          name,
          pbgid: aPbgid,
          attribName: `talent_${pad}_${talentPerk}`,
          ...(description ? { description } : {}),
        });

        for (const locale of targetLocales) {
          const locName = parseUiName(aUi, locale);
          if (locName) {
            recordCrucibleTalent(civSlug, l, locale, locName);
          }
        }
      }
    }

    result[civSlug] = {
      civ: civSlug,
      talents: levels,
    };
  }

  return result;
}

async function extractMutators(context: RunContext | undefined, tp: any): Promise<CrucibleMutator[]> {
  const mutatorListNode = findNodeByKey(tp, "mutator_list")?.value ?? [];
  const mutatorEntries: string[] =
    mutatorListNode
      ?.filter((v: any) => v.key === "mutator")
      .map((v: any) => v.value.find((x: any) => x.key === "$PBGNAME")?.value) ?? [];

  const targetLocales = getTargetLocales();
  const mutators: CrucibleMutator[] = [];

  for (let idx = 0; idx < mutatorEntries.length; idx++) {
    const mName = mutatorEntries[idx];
    const filePath = path.join(
      ATTRIB_FOLDER,
      "rogue_mode/persistent_perks/persistent_perk_desc/mutators",
      `${mName}.json`
    );
    if (!existsSync(filePath)) {
      console.warn(`[Crucible] Mutator file not found: ${filePath}`);
      continue;
    }

    const json = JSON.parse(await fs.readFile(filePath, "utf8"));
    const bag = json.data[0].value.find((v: any) => v.key === "perk_desc_bag")?.value ?? [];
    const pbgid = json.data[0].value.find((v: any) => v.key === "pbgid")?.value;
    const ui = bag.find((v: any) => v.key === "ui_info")?.value ?? [];

    const name = parseUiName(ui, "en");
    const baseId = slugify(name);
    const description = parseUiDescription(ui, "en");
    const durability = bag.find((v: any) => v.key === "durability")?.value ?? 0;

    // Extract action PBGID from levels
    const levelsNode = bag.find((v: any) => v.key === "levels")?.value ?? [];
    let actionPbgid: number | undefined;
    for (const lvl of levelsNode) {
      const lvlBag = lvl.value ?? [];
      const actionNode = lvlBag.find((v: any) => v.key === "action")?.value ?? [];
      const actionPbgName = actionNode.find((v: any) => v.key === "$PBGNAME")?.value;
      if (actionPbgName) {
        const actionFile = path.join(
          ATTRIB_FOLDER,
          "rogue_mode/persistent_perks/persistent_perk_action/_mutators",
          `${actionPbgName}.json`
        );
        if (existsSync(actionFile)) {
          const aJson = JSON.parse(await fs.readFile(actionFile, "utf8"));
          actionPbgid = aJson.data[0].value.find((v: any) => v.key === "pbgid")?.value;
        }
      }
    }

    const image = bag.find((v: any) => v.key === "image")?.value;

    const iconPath = `crucible/mutators/${baseId}.png`;
    let iconUrl = `${CDN_HOST}/${IMAGE_FOLDER}/${iconPath}`;

    if (image) {
      const sourceImage = path.join(SOURCE_FOLDER, "ui/images", `${image}.png`);
      const copied = await copyIcon(sourceImage, iconPath);
      if (copied) iconUrl = copied;
    }

    mutators.push({
      index: idx,
      id: baseId,
      baseId,
      name,
      attribName: mName,
      pbgid,
      ...(actionPbgid ? { action_pbgid: actionPbgid } : {}),
      description,
      durability,
      icon: iconUrl,
    });

    for (const locale of targetLocales) {
      const locName = parseUiName(ui, locale);
      const locDesc = parseUiDescription(ui, locale);
      if (locName || locDesc) {
        recordCrucibleMutator(baseId, locale, {
          ...(locName ? { name: locName } : {}),
          ...(locDesc ? { description: locDesc } : {}),
        });
      }
    }
  }

  return mutators;
}

async function extractBoons(context: RunContext | undefined, tp: any): Promise<CrucibleBoon[]> {
  const boonsDir = path.join(ATTRIB_FOLDER, "rogue_mode/rogue_boon");
  const allBoonFiles = findFilesRecursive(boonsDir);

  const boonFilesWithPbgid = allBoonFiles
    .map((filePath) => {
      const content = JSON.parse(readFileSync(filePath, "utf8"));
      const pbgid = content.data[0].value.find((v: any) => v.key === "pbgid")?.value ?? 0;
      return { name: path.basename(filePath, ".json"), pbgid };
    })
    .sort((a, b) => a.pbgid - b.pbgid);

  const boonIndexMap = new Map<string, number>();
  boonFilesWithPbgid.forEach((b, idx) => {
    boonIndexMap.set(b.name, idx);
  });

  const singleAscMap = new Map<string, string>();
  const tieredAscMap = new Map<string, string>();

  function walkAscension(v: any) {
    if (Array.isArray(v)) {
      for (const item of v) walkAscension(item);
    } else if (v && typeof v === "object") {
      if (v.key === "ascension" && Array.isArray(v.value)) {
        const baseNode = v.value.find((x: any) => x.key === "base");
        const ascNode = v.value.find((x: any) => x.key === "ascended");
        const basePbg = baseNode?.value?.find((x: any) => x.key === "$PBGNAME")?.value;
        const ascPbg = ascNode?.value?.find((x: any) => x.key === "$PBGNAME")?.value;
        if (basePbg && ascPbg) singleAscMap.set(basePbg, ascPbg);
      }
      if (v.key === "ascension_tiered" && Array.isArray(v.value)) {
        const baseNode = v.value.find((x: any) => x.key === "base");
        const ascNode = v.value.find((x: any) => x.key === "ascended");
        const baseBoons = baseNode?.value
          ?.filter((x: any) => x.key === "boon")
          ?.map((x: any) => x.value?.find((y: any) => y.key === "$PBGNAME")?.value);
        const ascBoons = ascNode?.value
          ?.filter((x: any) => x.key === "boon")
          ?.map((x: any) => x.value?.find((y: any) => y.key === "$PBGNAME")?.value);
        if (baseBoons && ascBoons) {
          for (let i = 0; i < baseBoons.length; i++) {
            if (baseBoons[i] && ascBoons[i]) tieredAscMap.set(baseBoons[i], ascBoons[i]);
          }
        }
      }
      for (const k of Object.keys(v)) walkAscension(v[k]);
    }
  }
  walkAscension(tp);

  if (!singleAscMap.has("equilibrium")) {
    singleAscMap.set("equilibrium", "equilibrium_upgraded");
  }

  const ascendedPbgs = new Set<string>([
    ...singleAscMap.values(),
    ...tieredAscMap.values(),
    ...allBoonFiles.map((f) => path.basename(f, ".json")).filter((n) => n.includes("_ascended")),
  ]);

  const tieredBoonBases = new Set<string>([
    "cache_of_food",
    "cache_of_oil",
    "cache_of_stone",
    "cache_of_wood",
    "cornucopia",
    "mercenary_crossbowmen",
    "mercenary_spearmen",
    "there_can_only_be_one",
  ]);

  const targetLocales = getTargetLocales();
  const boons: CrucibleBoon[] = [];

  for (const f of allBoonFiles) {
    const pbgName = path.basename(f, ".json");
    if (ascendedPbgs.has(pbgName)) continue;

    const matchTier = pbgName.match(/^(.+)_(\d+)$/);
    const isTiered = matchTier && tieredBoonBases.has(matchTier[1]);
    if (isTiered && matchTier[2] !== "1") {
      continue;
    }

    const baseName = isTiered ? matchTier[1] : pbgName;
    const content = JSON.parse(await fs.readFile(f, "utf8"));
    const bag = content.data[0].value.find((v: any) => v.key === "rogue_boon_bag")?.value ?? [];
    const issuable = bag.find((v: any) => v.key === "issuable")?.value ?? [];
    const upgName = issuable.find((v: any) => v.key === "$PBGNAME")?.value;

    const categoryNode = bag.find((v: any) => v.key === "category")?.value ?? [];
    const categoryName = categoryNode.find((v: any) => v.key === "$PBGNAME")?.value as
      | "standard"
      | "epic"
      | "cursed";
    const category: "standard" | "epic" | "cursed" = categoryName ?? "standard";
    const categoryWeight = category === "standard" ? 80 : 10;
    const weight = bag.find((v: any) => v.key === "weight")?.value ?? 1;

    // Read upgrade file for name and icon
    const upgFile = path.join(ATTRIB_FOLDER, "upgrade/dev/rogue/boons", `${upgName}.json`);
    if (!existsSync(upgFile)) {
      console.warn(`[Crucible] Boon upgrade file not found: ${upgFile}`);
      continue;
    }
    const upgJson = JSON.parse(await fs.readFile(upgFile, "utf8"));
    const upgBag = upgJson.data[0].value.find((v: any) => v.key === "upgrade_bag")?.value ?? [];
    const upgUi = upgBag.find((v: any) => v.key === "ui_info")?.value ?? [];

    const name = parseUiName(upgUi, "en");
    const baseId = slugify(name);
    const iconName = upgUi.find((v: any) => v.key === "icon_name")?.value;

    // Copy icons
    const iconPath = `crucible/boons/${baseId}.png`;
    const iconBigPath = `crucible/boons/big/${baseId}.png`;
    let iconUrl = `${CDN_HOST}/${IMAGE_FOLDER}/${iconPath}`;

    if (iconName) {
      const normalSource = path.join(SOURCE_FOLDER, "ui/icons", `${iconName}.png`);
      const iconBase = path.basename(iconName);
      let bigSource = path.join(
        SOURCE_FOLDER,
        "ui/icons/races/crucible_mode/boons/boons_big",
        `${iconBase}.png`
      );
      if (!existsSync(bigSource)) {
        const altBig = path.join(
          SOURCE_FOLDER,
          "ui/icons/races/crucible_mode/boons/boons_big",
          `${pbgName}.png`
        );
        if (existsSync(altBig)) bigSource = altBig;
      }

      const copiedNormal = await copyIcon(normalSource, iconPath);
      if (copiedNormal) iconUrl = copiedNormal;
      await copyIcon(bigSource, iconBigPath);
    }

    // Collect tiers
    const tiers: CrucibleBoonTier[] = [];

    async function processTier(
      tierNum: number,
      isAscended: boolean,
      tierPbgName: string
    ) {
      const tierFile = allBoonFiles.find((x) => path.basename(x, ".json") === tierPbgName);
      if (!tierFile) return;

      const tContent = JSON.parse(await fs.readFile(tierFile, "utf8"));
      const tBag = tContent.data[0].value.find((v: any) => v.key === "rogue_boon_bag")?.value ?? [];
      const tIssuable = tBag.find((v: any) => v.key === "issuable")?.value ?? [];
      const tUpgName = tIssuable.find((v: any) => v.key === "$PBGNAME")?.value;

      const tUpgFile = path.join(ATTRIB_FOLDER, "upgrade/dev/rogue/boons", `${tUpgName}.json`);
      if (!existsSync(tUpgFile)) return;

      const tUpgJson = JSON.parse(await fs.readFile(tUpgFile, "utf8"));
      const tPbgid = tUpgJson.data[0].value.find((v: any) => v.key === "pbgid")?.value ?? 0;
      const tUpgBag = tUpgJson.data[0].value.find((v: any) => v.key === "upgrade_bag")?.value ?? [];
      const tUpgUi = tUpgBag.find((v: any) => v.key === "ui_info")?.value ?? [];

      const description = parseUiDescription(tUpgUi, "en");
      const tierId = isAscended ? `${baseId}-${tierNum}-ascended` : `${baseId}-${tierNum}`;
      const tierIndex = boonIndexMap.get(tierPbgName) ?? 0;

      tiers.push({
        index: tierIndex,
        tier: tierNum,
        isAscended,
        id: tierId,
        attribName: tUpgName,
        pbgid: tPbgid,
        description,
      });

      // Record translations
      for (const locale of targetLocales) {
        const locDesc = parseUiDescription(tUpgUi, locale);
        const locName = parseUiName(tUpgUi, locale);
        const tierKey = isAscended ? `${tierNum}_ascended` : String(tierNum);
        recordCrucibleBoon(baseId, locale, locName || undefined, tierKey, locDesc || undefined);
      }
    }

    if (isTiered) {
      // Process regular tiers 1..5
      for (let t = 1; t <= 5; t++) {
        const regName = `${baseName}_${t}`;
        await processTier(t, false, regName);
      }
      // Process ascended tiers 1..5
      for (let t = 1; t <= 5; t++) {
        const regName = `${baseName}_${t}`;
        const ascName = tieredAscMap.get(regName) || `${baseName}_${t}_ascended`;
        await processTier(t, true, ascName);
      }
    } else {
      // Single boon: tier 1 regular
      await processTier(1, false, pbgName);
      // tier 1 ascended
      const ascName = singleAscMap.get(pbgName) || `${pbgName}_ascended`;
      await processTier(1, true, ascName);
    }

    boons.push({
      id: baseId,
      baseId,
      name,
      attribName: baseName,
      category,
      categoryWeight,
      weight,
      icon: iconUrl,
      index: tiers[0]?.index ?? 0,
      tiers,
    });
  }

  return boons;
}

export async function extractCrucible(context?: RunContext): Promise<void> {
  console.log("[Crucible] Extracting Crucible data (perks, talents, mutators, boons)...");
  const crucibleDir = path.join(ROOT_FOLDER, "crucible");
  await fs.mkdir(crucibleDir, { recursive: true });

  const tpPath = path.join(ATTRIB_FOLDER, "tuning_presentation/tuning_presentation.json");
  const tp = JSON.parse(await fs.readFile(tpPath, "utf8"));

  const perks = await extractPerks(context, tp);
  writeJson(path.join(crucibleDir, "perks.json"), perks);
  console.log(`[Crucible] Wrote ${perks.length} perks to crucible/perks.json`);

  const talents = await extractTalents(context, tp);
  writeJson(path.join(crucibleDir, "talent_perks.json"), talents);
  console.log(`[Crucible] Wrote ${Object.keys(talents).length} civilizations to crucible/talent_perks.json`);

  const mutators = await extractMutators(context, tp);
  writeJson(path.join(crucibleDir, "mutators.json"), mutators);
  console.log(`[Crucible] Wrote ${mutators.length} mutators to crucible/mutators.json`);

  const boons = await extractBoons(context, tp);
  writeJson(path.join(crucibleDir, "boons.json"), boons);
  console.log(`[Crucible] Wrote ${boons.length} boons to crucible/boons.json`);
}
