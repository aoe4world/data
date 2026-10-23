import * as fs from "fs";
import * as path from "path";

const DATA_ROOT = path.resolve(__dirname, "..");

const FOLDERS_TO_CLEAN = [
  "abilities",
  "buildings",
  "civilizations",
  "locales",
  "overview",
  "technologies",
  "units",
  "upgrades",
];

console.log("Cleaning generated data folders...");

for (const folder of FOLDERS_TO_CLEAN) {
  const targetDir = path.join(DATA_ROOT, folder);

  // Safety check: ensure the target is directly inside the data root
  if (path.dirname(targetDir) !== DATA_ROOT) {
    console.error(`Skipping invalid path: ${targetDir}`);
    continue;
  }

  if (fs.existsSync(targetDir)) {
    console.log(`  Deleting ${folder}/`);
    fs.rmSync(targetDir, { recursive: true, force: true });
  } else {
    console.log(`  Skipping ${folder}/ (does not exist)`);
  }
}

console.log("Clean complete.");
