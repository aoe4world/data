# AoE4 World Data

Parsed stats on units, buildings and technologies from Age of Empires 4 in a developer friendly format.

[ [GitHub](https://github.com/aoe4world/data) ]

## About

This project hosts data on all units, buildings, technologies, upgrades and other AoE4 game objects in an opinionated json format ready for developers to use in any project. The data is parsed from game files and reflects what players can read on in-game tooltips.

<details>
<summary>
 Example ./units/english/man-at-arms-2.json
</summary>

```json
{
  "id": "man-at-arms-2",
  "baseId": "man-at-arms",
  "type": "unit",
  "name": "Early Man-at-Arms",
  "pbgid": 166404,
  "attribName": "unit_manatarms_2_eng",
  "age": 2,
  "civs": ["en"],
  "description": "Tough infantry with good damage.\n+ High armor\n- Slow movement\n- Countered by Knights, Lancers, and Crossbowmen",
  "classes": ["heavy", "melee", "infantry"],
  "displayClasses": ["Heavy Melee Infantry"],
  "unique": false,
  "costs": {
    "food": 100,
    "wood": 0,
    "stone": 0,
    "gold": 20,
    "total": 120,
    "popcap": 1,
    "time": 15
  },
  "producedBy": ["barracks", "the-white-tower", "keep", "berkshire-palace"],
  "icon": "https://data.aoe4world.com/images/units/man-at-arms-2.png",
  "hitpoints": 120,
  "weapons": [
    {
      "name": "Sword",
      "type": "melee",
      "damage": 10,
      "speed": 1.375,
      "range": {
        "min": 0,
        "max": 0.295
      },
      "modifiers": [],
      "durations": {
        "aim": 0,
        "windup": 0.5,
        "attack": 0.125,
        "winddown": 0.75,
        "reload": 0,
        "setup": 0,
        "teardown": 0,
        "cooldown": 0
      },
      "attribName": "weapon_manatarms_2",
      "pbgid": 129615
    },
    {
      "name": "Torch",
      "type": "fire",
      "damage": 10,
      "speed": 2.125,
      "range": {
        "min": 0,
        "max": 1.25
      },
      "modifiers": [],
      "durations": {
        "aim": 0,
        "windup": 0.75,
        "attack": 0.125,
        "winddown": 0,
        "reload": 0,
        "setup": 0,
        "teardown": 0,
        "cooldown": 1.25
      },
      "attribName": "weapon_torch",
      "pbgid": 123518
    }
  ],
  "armor": [
    {
      "type": "melee",
      "value": 3
    },
    {
      "type": "ranged",
      "value": 3
    }
  ],
  "sight": {
    "line": 36,
    "height": 10
  },
  "movement": {
    "speed": 1.125
  }
}
```
</details>


### Formats

All units, buildings and technologies are individually available for each civilization that has access to them. Additionally, there's an 'unified' format, that groups together variations of the same item in one file.

| Example File                     | Description                                                      |
| -------------------------------- | ---------------------------------------------------------------- |
| `/units/english/horseman-2.json` | The English horseman available in Feudal Age                     |
| `/units/unified/horseman.json`   | All horsemen from all civilizations and all ages                 |
| `/units/all.json`                | All units from all civilizations and all ages in one list        |
| `/units/all-unified.json`        | All units from all civilizations and all ages, grouped by unit   |
| `/buildings/**`                  | Buildings and landmarks                                          |
| `/technologies/**`               | Technologies, like blacksmith upgrades, uniqiue improvments, etc |
| `/upgrade/**`                    | Unit upgrades, i.e. veteran horseman to elite horseman           |

---

## Development
The logic to parse game files and output them in our desired format resides in `src/attrib`.

> Requirements: Node, .Net Core

### Contributing and development

Feel free to open PRs or issues for data that is incorrect or missing, if possible please provide a rationale or source. One-off corrections to data are encoded in [src/attrib/workarounds.ts](.src/attrib/workarounds.ts) and technology effects in [src/attrib/technologies.ts](./src/attrib/technologies.ts)

### Updating the data from game files
You will need raw parsed game files to build and update the data. Those files are not included in the repository due to licensing and copyright issues (you will need your own copy of AoE4). First we unpack the so called Archives (SGA) and then parse them using scripts we wrote to JSON files. 

**Prerequisites**

1. Download and install the latest version of [AOEMods.Essence](https://github.com/aoemods/AOEMods.Essence/releases), extract into `./source/AOEMods.Essence`
2. Locate the game files, typically located in `C:\Program Files (x86)\Steam\steamapps\common\Age of Empires IV\`. When you play the gam through XBox, the process is a bit more [involved](https://answers.microsoft.com/en-us/xbox/forum/all/where-do-xbox-gamepass-games-install-to-on-pcs/845ceb04-fea7-4fde-b001-8b63fa52df7b#:~:text=yes%20its%20normal,the%20hidden%20folders) as the game is installed in the hidden and secure `windowsapps` folder.

**Automatic process**

The powershell script `Extract-AOE4Patch.ps1` supports various methodologies. But the main procedure is:

Run in a powershell window:

1. `.\Extract-AOE4Patch.ps1 -GamePath 'C:\Program Files (x86)\Steam\steamapps\common\Age of Empires IV\'`
2. Done

All Parameters:
- `-ArchivesPath`: Use instead of `-GamePath`. Specify the directory containing the Attrib.sga, UIArt.sga and LocaleEnglish.sga files.
- `-OutputPath`: Simply where to put the output, defaults to `./source`.
- `-DataStore` + `-Patch`: Can be used to keep an archive of all game patches & exports. It uses a `patches/12.2.1234` subdir structure, in my case on a zfs storage for dedup reasons. But that requires local changes in config.ts too.
- `-ExtractXml`: Switch to also convert attrib to xml format in another directory.
- `-ExtractExtraImages`: Extracts all icons instead of only races, also extracts civ flags & map images.
- `-RemoveTemp`: Removes the extracted sga content after conversion (attrib-raw and uiart-raw dirs)
- `-AOEModsEssenceDir`: Specify an alternative dir containing `AOEMods.Essence.CLI.dll`; defaults to `./source/AOEMods.Essence`

**Manual process**

*Note: Make any of the specified directories as needed*

1. Copy the following files/folders into `/source`
   - `cardinal\archives\Attrib.sga` for all stats and attributes
   - `cardinal\archives\UIArt.sga` for the icons (optional if you want to update icons)
   - `cardinal\archives\LocaleEnglish.sga` for the names and descriptions
2. Unpack and convert the Attrib archive
   - `dotnet AOEMods.Essence.CLI.dll sga-unpack ./source/Attrib.sga ./source/attrib-raw`
   - `dotnet AOEMods.Essence.CLI.dll  rgd-decode ./source/attrib-raw ./source/ -b -f json`
3. Unpack the locale file using AOEMods.Essence, i.e.
   - `dotnet AOEMods.Essence.CLI.dll sga-unpack ./source/LocaleEnglish.sga ../source/locale`
4. Unpack the UIArt file using AOEMods.Essence, and convert the icons into PNG files, i.e.
   - `dotnet AOEMods.Essence.CLI.dll sga-unpack ./source/UIArt.sga ./source/uiart-raw`
   - `dotnet AOEMods.Essence.CLI.dll rrtex-decode ./source/uiart-raw/ui/icons/races ./source/ui/icons/races -b`
5. You should end up with a folder structure like this:
   ```
   source
   ├── attrib
   │   ├── instances
   │   ├── templates
   │   └── etc...
   ├── ui
   |   └── icons
   │       └── races
   │           ├── abbasid
   │           ├── chinese
   │           └── etc...
   └── locale
       └── en
           └── cardinal.en.ucs
   ```
7. Run `yarn install && yarn parse` to update the data.
8. Verify the changes. Specifically, the technology effects are currently compiled from translation parameters, of which the order may change. This can easily be spotted by changes in any technology description field. If they changed, update the parameter order or implementation in `effect.ts`.
9. Run `yarn build` to update the optimzed json files and library.

#### Just parse one civ
Parsing can be relatively slow due to the total amount of files involved. If you're just working on data for a specific civ you can add an additional flag to the the parse command to only parse a specific civ. I.e. `yarn parse --civ japanese`

Note: It's not slow anymore, but the option still exists.

## Credits

Created and maintained by [Robert van Hoesel](https://github.com/robertvanhoesel) from [AoE4 World](https://github.com/aoe4world) 

## License and rights

All of this data is open source, you may use it in your projects, websites and apps. However, Microsoft owns the Copyright on the game, and for this reason you can't use this data in commercial contexts, excepts as described in Microsoft's [Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules). Whenever you are using the data in this repository or other media from Age of Empires 4, please make sure to abide by the rules.

> Age Of Empires 4 © Microsoft Corporation.
> Aoe4world/data was created under Microsoft's "[Game Content Usage Rules](https://www.xbox.com/en-US/developers/rules)" using assets from Age Of Empires 4, and it is not endorsed by or affiliated with Microsoft.

### Related projects

- [aoemods/attrib](https://github.com/aoemods/attrib)
- [AlexOcampos/aoe4treetechstatic](https://github.com/AlexOcampos/aoe4treetechstatic)

