import path from "path";
import { ITEM_TYPES } from "../lib/config";
import { CivSlug } from "../sdk/utils";

export const SOURCE_FOLDER = path.join(__dirname, "../../source/latest");
export const ATTRIB_FOLDER = path.join(SOURCE_FOLDER, "/attrib");
export const ICON_FOLDER = path.join(SOURCE_FOLDER, "/art/icons");
export const LOCALES_FOLDER = path.join(SOURCE_FOLDER, "/locale");
export const ESSENCE_FOLDER = path.join(SOURCE_FOLDER, "/attrib");

// Unit files not discovered by sync.ts
export const hardcodedDiscovery = {
  rus: [
    "sbps/races/rus/unit_militia_2_rus",
    "upgrade/races/rus/units/upgrade_militia_3",
    "upgrade/races/rus/units/upgrade_militia_4",
    "abilities/always_on_abilities/rus/saints_blessing_rus", //misses auto discovery ; how to handle upgrades
    // "abilities/always_on_abilities/rus/high_armory_production_aura_rus",
    "abilities/always_on_abilities/rus/streltsy_static_deployment_ability_rus", //misses auto discovery
    "abilities/timed_abilities/rus/horse_archer_mounted_training_gallop_rus", //misses auto discovery
    // "abilities/timed_abilities/rus/kremlin_levy", //misses auto discovery
  ],
  mongols: [
    "sbps/races/mongol/unit_khan_2_mon",
    "sbps/races/mongol/unit_khan_3_mon",
    "sbps/races/mongol/unit_khan_4_mon",
    "abilities/always_on_abilities/mongol/lancer_healing_mon", //misses auto discovery
    // "abilities/always_on_abilities/mongol/kurultai_healing_aura_mon",
    "abilities/timed_abilities/mongol/khan_attack_speed_signal_arrow_mon", //khan-1 is discovered in starting army, so khan abilities miss auto discovery
    "abilities/timed_abilities/mongol/khan_defensive_signal_arrow_mon",
    "abilities/timed_abilities/mongol/khan_maneuver_signal_arrow_mon", //whistling arrow is an ability upgrade; how do techs upgrade an ability
    //"abilities/timed_abilities/mongol/scout_falcon_sight_mon",
    // "abilities/always_on_abilities/mongol/ortoo_outpost_speed_aura_mon",
    "info/buff_info/races/mongol/outpost_speed_improved_mon",
  ],
  ottomans: [
    "upgrade/races/ottoman/research/upgrade_anatolian_hills_ott",
    //"upgrade/races/ottoman/research/upgrade_imperial_blacksmith_stockpile_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_janissary_company_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_manned_siege_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_mehter_drums_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_military_campus_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_military_training_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_monk_formation_ott",
    "upgrade/races/ottoman/research/upgrade_imperial_trader_capacity_ott",
    "abilities/toggle_abilities/ottoman/mehter_attack_buff_ott", //misses auto discovery
    "abilities/toggle_abilities/ottoman/mehter_melee_armor_buff_ott", //misses auto discovery
    "abilities/toggle_abilities/ottoman/mehter_ranged_armor_buff_ott", //misses auto discovery
    "info/buff_info/races/ottoman/mehter_default_formation_ott",
    // "abilities/always_on_abilities/ottoman/university_blacksmith_influence_ott", //need another way to handle the progression by age
    "abilities/timed_abilities/ottoman/sipahi_stamina_ott", //misses auto discovery; activation recharge starts after ability ends, or +10 to recharge time; are others like this? pavise is not
  ],
  english: [
    "upgrade/races/english/units/upgrade_abbey_king_castle_1",
    "upgrade/races/english/units/upgrade_abbey_king_imp_2",
    "sbps/races/english/unit_ranger_wynguard_4_eng",
    "sbps/races/english/unit_footman_wynguard_4_eng",
    "abilities/timed_abilities/english/longbow_rate_of_fire_ability", //misses auto discovery; range is weird but does it matter? //convert to ability from tech
    "abilities/timed_abilities/english/deploy_campfire_eng", //misses auto discovery;
    // "abilities/always_on_abilities/english/tower_outpost_alert_aura_eng",  //how to handle upgrade,  tower outpost has context to upgrade to citadels or tech has the context to upgrade buff or do a workaround
    "abilities/timed_abilities/civ_core/deploy_palings",
  ],
  chinese: [
    "info/buff_info/races/chinese/great_wall_buff_chi", //needs trigger/standing on a wall?
    "abilities/always_on_abilities/chinese/spirit_way", //misses auto discovery with no link; needs trigger/unitDeath?        does not stack, but timer resets upon next death
  ],
  abbasid: [
    "abilities/always_on_abilities/abbasid/camel_support_aura_abb", //misses auto discovery; camel support tech needs both ranged and melee armor, so handling this here, and it can be modified when interfacing techs that unlock abilities
    "abilities/timed_abilities/abbasid/monk_conversion_faith_abb", //misses auto discovery;
    "abilities/always_on_abilities/abbasid/mamluke_anti_cavalry_aura_abb", //determine how to handle debuff
    "abilities/always_on_abilities/abbasid/ghulam_attack_abb",
  ],
  ayyubids: [
    "abilities/toggle_abilities/mamluk_swap_to_bow_weapon",
    "abilities/toggle_abilities/mamluk_swap_to_sword_weapon",
    "abilities/always_on_abilities/abbasid/mamluke_anti_cavalry_aura_abb",
    "abilities/modal_abilities/abbasid_ha_01/production_building_enhance_abb",
    "abilities/timed_abilities/abbasid_ha_01/monk_aoe_heal",
    "abilities/timed_abilities/abbasid_ha_01/siege_carpentry_abb_ha_01",
    "abilities/always_on_abilities/abbasid/ghulam_attack_abb",
    "abilities/always_on_abilities/abbasid/proxy_placement_gristmill_abb",
    "abilities/always_on_abilities/abbasid_ha_01/camel_knight_charge_damage",
    "sbps/races/abbasid_ha_01/unit_javelin_2_abb_ha_01", // Bedouin Skirmisher
    "sbps/races/abbasid_ha_01/unit_pirate_abb_ha_01", // Bedouin Swordsman

    "abilities/toggle_abilities/mangonel_swap_to_incendiary_weapon",
    "abilities/toggle_abilities/mangonel_swap_to_kinetic_weapon",
  ],
  byzantines: [
    // "abilities/always_on_abilities/byzantine/cistern_villager_buff_byz",
    "abilities/always_on_abilities/byzantine/field_stone_buff_info_byz",
    "abilities/always_on_abilities/byzantine/varangian_landmark_aura_byz",
    // "abilities/always_on_abilities/byzantine/winery_aura_byz",
    // "abilities/always_on_abilities/byzantine/winery_villager_buff_byz",
    // "abilities/always_on_abilities/byzantine/cistern_auras/cistern_gather_aura_byz",
    // "abilities/always_on_abilities/byzantine/cistern_auras/landmark_cistern_gather_aura_byz",
    "abilities/modal_abilities/byzantine/cataphract_trample_byz",
    "abilities/timed_abilities/byzantine/activate_akritoi_byz",
    // "abilities/timed_abilities/byzantine/cannon_swap_byz",
    "abilities/timed_abilities/byzantine/pilgrim_flask_byz",
    "abilities/timed_abilities/byzantine/varangian_berserk_byz",
    "abilities/toggle_abilities/byzantine/toggle_spearman_shield_wall_on_byz",

    "info/buff_info/races/byzantine/cistern_influence_gathering_bonus_1_byz",
    "info/buff_info/races/byzantine/hippodrome_scout_torch_byz",
    "info/buff_info/races/byzantine/naval_transport_movespeed_unload_byz",
    "info/buff_info/races/byzantine/oil_berry_dropoff_byz",
    "info/buff_info/races/byzantine/oil_farm_dropoff_byz",
    "info/buff_info/races/byzantine/oil_fish_dropoff_byz",
    "info/buff_info/races/byzantine/oil_villager_fish_dropoff_byz",
    "info/buff_info/races/byzantine/varangian_berserking_byz",
    // "info/buff_info/races/byzantine/varangian_berserking_fear_debuff_byz",
    "info/buff_info/races/byzantine/varangian_landmark_armor_aura_byz",
    "info/buff_info/races/byzantine/winery_food_dropoff_imp_byz",

    "upgrade/races/byzantine/mercenary_contracts/merc_contract_01_byz",
    "upgrade/races/byzantine/mercenary_contracts/merc_contract_02_byz",
    "upgrade/races/byzantine/mercenary_contracts/merc_contract_03_byz",
    "abilities/timed_abilities/civ_core/deploy_palings",
    "abilities/timed_abilities/french/cannon_swap_fre", //misses auto discovery
    "info/buff_info/races/french/lancer_charge_bonus_damage",
    // "ebps/races/byzantine/buildings/dummy_trade_mercenary_house_byz",

    // upgrade/races/byzantine/research/mercenary_upgrades unsure what to do with these
  ],
  french: [
    "info/buff_info/races/french/lancer_charge_bonus_damage",
    // "abilities/always_on_abilities/french/keep_influence_fre",
    "abilities/modal_abilities/french/deploy_pavise_fre", //misses auto discovery
    "abilities/timed_abilities/french/cannon_swap_fre", //misses auto discovery
  ],
  hre: [
    "abilities/always_on_abilities/hre/inspired_infantry_hre", //misses auto discovery; convert to ability from tech
  ],
  japanese: [
    "abilities/always_on_abilities/japanese/kaburya_arrow_jpn", //misses auto discovery;
    "abilities/always_on_abilities/japanese/samurai_shield_jpn", //misses auto discovery;
    "abilities/always_on_abilities/japanese/bannerman_aura_cavalry_jpn", //misses auto discovery;
    "abilities/always_on_abilities/japanese/bannerman_aura_melee_jpn", //misses auto discovery;
    "abilities/always_on_abilities/japanese/bannerman_aura_range_jpn", //misses auto discovery;
    "abilities/modal_abilities/japanese/shinobi_blink_jpn", //misses auto discovery;
    "abilities/modal_abilities/japanese/shinobi_sabotage_jpn", //misses auto discovery;
    "abilities/modal_abilities/japanese/shinobi_spy_jpn", //misses auto discovery;
    "abilities/modal_abilities/japanese/monk_shinto_deposit_sacred_object_jpn", //misses auto discovery;
    "abilities/modal_abilities/japanese/monk_debuff_target_jpn", //misses auto discovery;

    "upgrade/races/japanese/units/upgrade_unit_shinobi_3",
    "upgrade/races/japanese/units/upgrade_unit_shinobi_4",
  ],
  malians: [
    //"abilities/always_on_abilities/malian/sofa_speed_aura_mal", //convert to ability from tech
    "info/buff_info/races/malian/gbeto_ambush_buff_mal",
    "abilities/timed_abilities/malian/activate_stealth_mal", //misses auto discovery
    // "abilities/always_on_abilities/malian/stealth_landmark_aura_mal", // unknown property
    //"abilities/always_on_abilities/malian/passives/donso_javelin_throw_mal //charge may be entirely a property of unit
    //"info/buff_info/races/malian/archer_poisoned_arrow_mal" //handle as debuff, found no upper limit
  ],
  delhi: [
    "abilities/timed_abilities/sultanate/infantry_forced_march_sul", //misses auto discovery with no link
    "abilities/always_on_abilities/sultanate/district_effects/tower_of_victory_aura_sul", //misses auto discovery with no link
    //zeal? //convert to ability from tech
  ],
  jeannedarc: [
    "abilities/always_on_abilities/french_ha_01/jeanne_companion_keep_dummy_keep",
    //"abilities/always_on_abilities/french_ha_01/jeanne_d_arc_ability_charges_consecrate_fre_ha_01",
    //"abilities/always_on_abilities/french_ha_01/jeanne_d_arc_ability_charges_melee_fre_ha_01",
    //"abilities/always_on_abilities/french_ha_01/jeanne_d_arc_ability_charges_ranged_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_buff_follower_aura_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_cleaving_attack_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_construction_aura_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_divine_restoration_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_experience_gain_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_honorable_heart_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_influence_building_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_inspired_ally_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_journey_of_a_hero_archer_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_journey_of_a_hero_commander_monarch_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_journey_of_a_hero_crossbow_companions_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_journey_of_a_hero_gunpowder_monarch_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_journey_of_a_hero_manatarms_companions_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_journey_of_a_hero_womanatarms_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_rallying_call_archers_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_rallying_call_cannon_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_rallying_call_crossbows_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_rallying_call_knights_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_rallying_call_manatarms_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_rallying_call_spearmen_fre_ha_01",
    // "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_rallying_call_units_timer_fre_ha_01",
    // "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_ranged_attack_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_talented_builder_fre_ha_01",
    "abilities/always_on_abilities/french_ha_01/jeanne_d_arc_valorous_inspiration_fre_ha_01",

    "abilities/modal_abilities/french_ha_01/jeanne_d_arc_aoe_damage_ability_fre_ha_01",
    "abilities/modal_abilities/french_ha_01/jeanne_d_arc_buyback_1_fre_ha_01",
    "abilities/modal_abilities/french_ha_01/jeanne_d_arc_buyback_2_fre_ha_01",
    "abilities/modal_abilities/french_ha_01/jeanne_d_arc_buyback_3_fre_ha_01",
    "abilities/modal_abilities/french_ha_01/jeanne_d_arc_buyback_4_fre_ha_01",
    "abilities/modal_abilities/french_ha_01/jeanne_d_arc_ranged_damage_ability_fre_ha_01",

    "sbps/races/french_ha_01/unit_jeanne_d_arc_2_archer_fre_ha_01",
    "sbps/races/french_ha_01/unit_jeanne_d_arc_2_womanatarms_fre_ha_01",
    "sbps/races/french_ha_01/unit_jeanne_d_arc_3_melee_knight_fre_ha_01",
    "sbps/races/french_ha_01/unit_jeanne_d_arc_3_ranged_knight_fre_ha_01",
    "sbps/races/french_ha_01/unit_jeanne_d_arc_4_melee_monarch_fre_ha_01",
    "sbps/races/french_ha_01/unit_jeanne_d_arc_4_ranged_monarch_fre_ha_01",
    "info/buff_info/races/french/lancer_charge_bonus_damage",
  ],
  zhuxi: [
    "abilities/always_on_abilities/shaolin_monk_ranged_damage_reduction",
    "abilities/always_on_abilities/shaolin_monk_passive_heal_self",
    "abilities/modal_abilities/chinese/official_supervise_building_target_chi",
    "upgrade/races/chinese_ha_01/research/upgrade_dynasty_econ_bonus_chi_ha_01",
  ],
};

export const hardcodedDiscoveryCommon = [
  "abilities/timed_abilities/civ_core/naval_man_the_sails",
  "abilities/timed_abilities/civ_core/monk_conversion",
  "abilities/timed_abilities/civ_core/fireship_self_detonate",
]; //"info/buff_info/races/abbasid/camel_debuff_aura","info/buff_info/races/malian/archer_poisoned_arrow_mal"

export const ignoreForNow: (string | ((file: string) => boolean))[] = [
  "toggle_cistern_influence_2_byz",
  "galata_merc_generation_byz",
  "galata_spawner_toggle_on_byz",
  "cistern_gather_aura_byz",
  "winery_aura_byz",

  "building_placeholder_religious_choice_jpn",

  "ebps/races/mongol/buildings/building_town_center_dummy_start",
  "ebps/races/mongol/units/campaign/unit_great_trebuchet_cmp_mon",

  // age I/unconstructable versions of walls and infantry buildable walls
  "palisade_bastion",
  "_wall_bastion",
  "_wall_infantry",
  "_wall_gate_infantry",

  (file) => file.includes("_wing_feudal") && !file.includes("abb_ha_01"),
  (file) => file.includes("_wing_castle") && !file.includes("abb_ha_01"),
  (file) => file.includes("_wing_imperial") && !file.includes("abb_ha_01"),

  // Field constructed versions of siege, prefer the Siege Workshop version
  "unit_mangonel_3_buildable_abb",
  "unit_mangonel_3_field_construct_mon",
  "unit_springald_3_buildable_abb",
  "unit_springald_3_field_construct_mon",
  "unit_siege_tower_3_abb",
  "ebps/dev/units/unit_siege_cart",
  "ebps/dev/units/unit_siege_cart",

  "unit_naval_scout_2_ott", // not actually available in game
  "_moving_mon", // packed version
  "_double_mon", // all double produced units
  "building_unit_religious_district_mon", // Monasteric shrines version of prayer tent

  // Research variations available at landmarks, that do not differ
  "upgrade_landmark_cavalry_cantled_saddle_fre",
  "upgrade_landmark_ranged_crossbow_drills_fre",
  "upgrade_landmark_naval_long_guns_fre",
  "upgrade_landmark_market_trickle_fre",
  (file) => file.split("/").pop()!.startsWith("upgrade_unit") && file.endsWith("farimba_mal"),
  "landmarkvariant",
  (file) => file.includes("upgrade_unit_") && file.includes("spirit_way_chi"),

  // Crusador mode landmarks
  (file) => file.includes("_cru"),
  (file) => file.includes("crusader_cmp"),

  // Prefer the vanilla keep emplacement versions over landmark and outposts, except mongols
  "upgrade_barbican_cannon_chi",
  "upgrade_barbican_springald_chi",
  "upgrade_wooden_castle_springald_rus",
  "upgrade_outpost_landmark_",
  (file) => file.includes("upgrade_outpost_cannon") && !file.includes("upgrade_outpost_cannon_mon"),
  (file) => file.includes("upgrade_outpost_springald") && !file.includes("upgrade_outpost_springald_mon"),
  (file) => file.includes("unit_ram_3") && !file.includes("workshop") && !file.includes("clocktower"),
  "unit_trade_cart_chamber_of_commerce_fre",
  "unit_trade_cart_free",
  "unit_military_2_free_abb",
  "unit_military_3_free_abb",
  "unit_military_4_free_abb",
  "upgrade_landmark_siege_weapon_speed",
  "upgrade_landmark_siege_works",
  "unit_siege_tower_3_eng",

  "unit_abbey_king_free_2", //free king on abbey completion

  "_tanegashima_4_jpn",
  "upgrade_econ_resource_wood_harvest_rate_1_kura_jpn",
  "upgrade_econ_resource_wood_harvest_rate_2_kura_jpn",
  "upgrade_econ_resource_wood_harvest_rate_3_kura_jpn",
  "upgrade_econ_resource_wood_harvest_rate_4_kura_jpn",
  "upgrade_econ_resource_wood_fell_rate_1_kura_jpn",
  "treasure_landmark_spawn_jpn", // 2127465
  "shinto_landmark_sacred_object_spawner_jpn", // 2142557
  "shinto_sacred_object_buff_jpn", // 2141773
  "varangian_landmark_aura_byz", // 2104872
  "tanegashima_stockpile_jpn", // 2138250
  "tanegashima_buff_jpn",
  "storehouse_rice_field_spawn_jpn", //2127424
  "daimyo_level_manager_jpn",

  //uninteresting abilities to place into data
  "military_neutralize_holy_site",
  "abilities/civ_core/core_",
  "abilities/core/age_up_",
  "return_to_work",
  "abilities/modal_abilities/abbasid/age_up_",
  "toggle_trade_resource",
  "proxy_placement_gristmill",
  "golden_age_passive_abb",
  "golden_age_bonus_", //ignore whichever is not as complete, the other is "golden_age_tier_"
  // "abilities/always_on_abilities/abbasid/medical_centers_abb",
  // "tower_repair_nearby_walls_chi",
  "academy_influence_chi",
  "building_granary_aura_chi", //unknown why error: .../building_granary_aura_chi TypeError: Cannot read properties of undefined (reading 'screen_name')
  "building_generate_tax_chi",
  "toggle_spawn_hold_sul",
  "hisar_academy_sul",
  "mosque_influence_sul",
  "dock_upgrade_aura",
  "scholar_research_behavior_sul",
  "palace_of_the_sultan_elephant_spawner_toggle_on_sul",
  "palace_of_the_sultan_elephant_spawner_sul",
  "chamber_of_commerce_ability_fre",
  "guild_hall_collect_resources_fre",
  "toggle_guild_hall_resource",
  "influence_elzbach_palace_hre",
  "influence_auto_repair_buff_tc_hre",
  "aachen_inspire_aoe_hre",
  "spotters_hre", //non-existent ability
  "cattle_landmark_passive_food_mal",
  "open_pit_mine_influence_gen_mal",
  "trade_cart_taxation_aura_mal",
  "toggle_pit_mine_resource",
  "khaganate_khan_aura_mon",
  "white_stupa_stone_generation_mon",
  "pack_building_mon",
  "packing_building_mon",
  "abilities/toggle_abilities/ottoman/military_school_",
  "abilities/toggle_abilities/ottoman/tophane_armory_",
  "toggle_spawn_hold_ott",
  "tophane_production_mod_ott",
  "cifte_minareli_berry_spawn_ott",
  "sultan_han_caravanseri_ott",
  "topkapi_palace_imperial_council_exp_ott",
  "istanbul_observatory_active_ott",
  "mehter_formation_ott", //inaccurate/old/changed
  "keep_trader_speed_boost_aura_ott_dummy", //dummy/duplicate
  "abilities/timed_abilities/rus/buy",
  "abilities/timed_abilities/rus/sell",
  "hunting_cabin_gold_generation",
  "wooden_fortress_influence_rus",
  "abilities/timed_abilities/rus/kremlin_levy",
  "upgrade_stable_unit_mamluk_4_abb_ha_01",
  "upgrade_stable_unit_mamluk_3_abb_ha_01",
  "monk_debuff_target_jpn_five_mountain_landmark_version",
  "abilities/always_on_abilities/ottoman/galleass_production_buff_ott",
  "upgrade_free_abbey_trinity_global_discount_rus",

  "military_school_production_mod_ott", // Advanced Academy bonus to military school production speed

  (file) => file.includes("unit_") && file.includes("_free_abb_ha_01"),
];

export const attribTypes = {
  [ITEM_TYPES.BUILDINGS]: {
    location: "/ebps/races/",
    plural: "buildings",
    singular: "building",
    type: "building",
  },
  [ITEM_TYPES.UNITS]: {
    location: "/ebps/races/",
    plural: "units",
    singular: "unit",
    type: "unit",
  },
  [ITEM_TYPES.TECHNOLOGIES]: {
    location: "/upgrade/races",
    plural: "research",
    singular: "upgrade",
    type: "technology",
  },
} as Record<ITEM_TYPES, { location: string; plural: string; singular: string; type: string }>;

// Could be looked up from ebps/races/mongol/buildings/building_wonder_age3_khanbaliq_mon.xml
export const KHAGANTE_SPAWN_COUNTS = {
  "huihui-pao": 1,
  "nest-of-bees": 1,
  "warrior-monk": 2,
  knight: 3,
  "horse-archer": 5,
  magudai: 5,
  "palace-guard": 5,
};
