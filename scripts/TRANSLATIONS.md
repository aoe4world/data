# Locale Overrides Translation Guide

Instructions for providing and maintaining translations in `src/attrib/locale-overrides.json`.

## Source of Truth

Access official game strings via the `source/latest/` junction:

- `source/latest/locale/<locale>/cardinal.<locale>.ucs`
  - Encoded in `utf16le`.
  - Format: `<string_id>\t<localized_text>`.
  - Base language: `source/latest/locale/en/cardinal.en.ucs`.

Always source terminology (unit names, age names, landmark names, contracts, and ability descriptors) directly from these archives to match in-game text.

## Process

### 1. Audit Missing Entries
From the `data` directory, run:
```bash
yarn sync-translations
```
This script ensures:
- Every key in `src/attrib/locale-overrides.json` contains all active locales.
- `"en"` is always first, followed by remaining locales in alphabetical order.
- Missing translations are explicitly marked as `null`.
- Outputs a completion report showing missing counts per locale.

### 2. Locate Official In-Game Context
Before writing an override:
1. Search `source/latest/locale/en/cardinal.en.ucs` for the English sentence, item name, or related Landmark/tech text to find the canonical Game String ID.
2. Look up that same ID in `source/latest/locale/<locale>/cardinal.<locale>.ucs` to extract the official term in the target language.
3. For compound strings (such as Age-evolution tags or Landmark requirements), compose the override using the official component terms from that language.

### 3. Apply Proper Translations
- Replace `null` with the authentic localized string in `src/attrib/locale-overrides.json`.
- Preserve placeholder tokens (`{0}`, `{1}`) exactly as defined in the English template, adapting word order to match target language grammar.
- **Do not populate non-English entries with English text.** When a translation is unknown, leave it as `null`. The runtime automatically falls back to `"en"`, and `sync-translations` keeps the gap visible.

### 4. Resolve Ambiguities with the User
If a translation cannot be reliably determined from the game archives (e.g., custom gameplay mechanics not found in any game file, or multiple conflicting grammar forms):
1. Stop and ask the user how they prefer to translate the phrase for the affected locale.
2. Present the available context, the source English text, and any candidate in-game terms found.
3. Await confirmation before committing the value.

### 5. Validate Formatting
Run `yarn sync-translations` after editing to ensure all keys remain sorted alphabetically with `en` first and verify the reduced `null` count.
