# AoE4 World Data

Hosted data and icons on all AoE 4 units in a developer friendly format.

[ [GitHub](https://github.com/aoe4world/data) ]

## Goal

Provide statically hosted data on all units, buildings, technologies, upgrades and other games objects in a json format which developers can use. Use these files to speed up your creation of awesome tools, charts and other apps!

Both the format and the data itself are open source, anyone can improve/correct it or add other useful properties. Additionally, automations and scripts could update data by reading game files or other sources.

### Example

[man-at-arms-4.json](./units/common/man-at-arms-4.json)

```json
{
  "id": "man-at-arms-4",
  "baseId": "man-at-arms",
  "type": "unit",
  "name": "Man-at-Arms",
  "age": 4,
  "civs": ["en", "hr", "fr", "de", "ab", "mo", "ru"],
  "description": "Tough infantry with good damage.\n\n+ High armor\n\n- Slow movement",
  "icon": "https://data.aoe4world.com/images/units/man-at-arms-4.png",
  "producedBy": ["barrack", "burgrave-palace"],
  "classes": ["Heavy Melee Infantry"],
  "unique": false,
  "hitpoints": 180,
  "movement": {
    "speed": 1.13
  },
  "costs": {
    "food": 100,
    "wood": 0,
    "stone": 0,
    "gold": 20,
    "total": 120,
    "popcap": 1,
    "time": 22
  },
  "weapons": [
    {
      "type": "melee",
      "damage": 14,
      "speed": 1.25,
      "range": {
        "min": 0,
        "max": 0.3
      }
    }
  ],
  "armor": [
    {
      "type": "ranged",
      "value": 5
    },
    {
      "type": "melee",
      "value": 5
    }
  ],
  "sight": {
    "line": 36,
    "height": 10
  }
}
```

> **Important**
> This project is in its early days. The data format might change slightly, we recommend downloading the JSON files or reference a specific commit if you're including them at runtime ([example](https://raw.githubusercontent.com/aoe4world/data/e99075d09c6d825919a740302982d8879c7bed7d/units/all.json))

## Coverage

| Category                                                | Status                   |
| ------------------------------------------------------- | ------------------------ |
| [Land Units](https://data.aoe4world.com/units/all.json) | ✅ Done                  |
| Naval Units                                             | ✅ Done                  |
| Buildings                                               | ✅ Done                  |
| Technologies                                            | ✅ Done, pending effects |
| Upgrades                                                |                          |
| Passive Civ Bonuses                                     |                          |

### Conventions

The format in which data is stored follows the following conventions:

- All units and each unit variations are stored in their own file as a json object.
- Each object has an `id` (string) which is unique across the project and the same as the file name, see [naming](#naming). Units of the same type share the same `baseId`.
- Each file includes a `civs` array which contains the abbreviated civ names which the unit is available for.
- All objects have an `age` field, a number 1-4 representing dark - imperial.
- All stats such as ranged armor, movement speed, etc. are using the numbers are they are displayed in the game UI (which is different from the game files).
- Objects are nested and grouped in logical ways, rather than having a flat list.

#### Naming

- All **unit names** follow the consistent `{base-name}-{age}(-{variation})` format. For example, the base archer is called `archer-2`, the Veteran Archer is just `archer-3`.
- **Improved units** (i.e. more damage or hp) results in a **variation**. For example, while most civs have the `villager-1`, the English has the `villager-1-english` variant, which has ranged attack, while HRE has faster produced and cheaper `villager-4-palace-of-swabia`. In the same way, the Chinese has the buffed `bombard-4-clocktower` unit.
- All commonly available or shared units are stored in the common folder, i.e. `/units/common/villager-1.json`, only **truly unique units** or variations are stored in the civ specific folder, i.e. `/units/mongols/mangudai-2.json`.

### Unified Units

While there may be variations of units (i.e. a stronger unit in each age) you may want to refer by them as their core unit. All units are stored in a unified format, which contains info on the unit with a `variations` array of all different versions of that unit.

Unified units are generated from their variations and stored in [./units/unified](./units/unified)

### Collections

For convenience we create a few bigger JSON files that group units of the same civ together, in both a normal array and a unified format.

| Collection            | List                                 | Unified                                              |
| --------------------- | ------------------------------------ | ---------------------------------------------------- |
| All units in the game | [all.json](./units/all.json)         | [all-unified.json](./units/all-unified.json)         |
| Abbasid               | [abbasid.json](./units/abbasid.json) | [abbasid-unified.json](./units/abbasid-unified.json) |
| Chinese               | [chinese.json](./units/chinese.json) | [chinese-unified.json](./units/chinese-unified.json) |
| Delhi Sultanate       | [delhi.json](./units/delhi.json)     | [delhi-unified.json](./units/delhi-unified.json)     |
| English               | [english.json](./units/english.json) | [english-unified.json](./units/english-unified.json) |
| French                | [french.json](./units/french.json)   | [french-unified.json](./units/french-unified.json)   |
| Holy Roman Empire     | [hre.json](./units/hre.json)         | [hre-unified.json](./units/hre-unified.json)         |
| Mongols               | [mongols.json](./units/mongols.json) | [mongols-unified.json](./units/mongols-unified.json) |
| Rus                   | [rus.json](./units/rus.json)         | [rus-unified.json](./units/rus-unified.json)         |

---

## Contributing and development

Feel free to open PRs or issues for data that is incorrect or missing, if possible please provide a rationale or source. Even more helpful, add automations or scripts inside the `./.scripts` folder which can update the data automatically. At the games current state, data is in a large part gathered by playing the game. For this reason, any automations for now are tools to help us create the files rather than a single source of truth.

#### AOE 4 Quicksheet Sync

Currently data is pulled in from the manually curated [AOE 4 Quicksheet](https://docs.google.com/spreadsheets/d/1LG0We2pTFZsbFm_k1SKLix8gxSq_9n5R_Ic3G2tVzBg/edit?pli=1#gid=1093682765). To sync the data you will need to a (free) [Google API Key](https://developers.google.com/sheets/api/guides/authorizing#APIKey) which you can set using the environment variable `AOE4_GOOGLE_SHEET_API_KEY`. Then run `yarn install && yarn run sync-quicksheet` to update the data.

- `.scripts/aoe4-quicksheet/sync.ts` contains the main mapping of data to our standard format.
- `.scripts/aoe4-quicksheet/workarounds.ts` contain unit specific transformations

#### Image Sync Script

`yarn sync-images` loops over all unit files and sees if an image with a similair name exists in `/images`, if it does, it will set the icon field for that unit with the hosted url location and update the json file.

#### Compile Script

`yarn build` will compile index and bulk json files based on the unit files.

### Adding new scripts

Can be added in a subfolder of `.scripts`, ideally using TypeScript. Common functionalitiy is stored in `.scripts/lib`

---

## Credits

Initial data genoursly provided and collected by [u/-MugenNoSora-](https://www.reddit.com/u/-MugenNoSora-) in the [AOE 4 Quicksheet](https://docs.google.com/spreadsheets/d/1LG0We2pTFZsbFm_k1SKLix8gxSq_9n5R_Ic3G2tVzBg/edit?pli=1#gid=1093682765) with help from [u/massrieen](https://www.reddit.com/user/massrieen). Repository created and maintained by [Robert van Hoesel](https://github.com/robertvanhoesel).

## License and rights

All of this data is open source, you may use it in your projects, websites and apps. However, Microsoft owns the Copyright on the game, and for this reason you can't use this data in commercial contexts, excepts as described in Microsoft's [Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules). Whenever you are using the data in this repository or other media from Age of Empires 4, please make sure to abide by the rules.

> Age Of Empires 4 © Microsoft Corporation.
> Aoe4world/data was created under Microsoft's "[Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules)" using assets from Age Of Empires 4, and it is not endorsed by or affiliated with Microsoft.

### Related projects

- [aoemods/attrib](https://github.com/aoemods/attrib)
- [AlexOcampos/aoe4treetechstatic](https://github.com/AlexOcampos/aoe4treetechstatic)
