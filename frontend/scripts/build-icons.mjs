// Ambil subset ikon Solar dari paket lokal @iconify-json/solar ke src/lib/solar-icons.json.
// Web tidak pernah fetch ikon saat runtime (wajib offline/air-gapped).
// Jalankan: npm run icons (setelah mengubah scripts/icon-names.json).
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const source = require("@iconify-json/solar/icons.json");
const names = JSON.parse(readFileSync(join(here, "icon-names.json"), "utf8"));

const missing = names.filter((n) => !source.icons[n]);
if (missing.length > 0) {
  console.error(`Ikon tidak ada di @iconify-json/solar: ${missing.join(", ")}`);
  process.exit(1);
}

const icons = Object.fromEntries(names.map((n) => [n, source.icons[n]]));
const subset = { prefix: source.prefix, width: source.width ?? 24, height: source.height ?? 24, icons };
writeFileSync(join(here, "..", "src", "lib", "solar-icons.json"), JSON.stringify(subset) + "\n");
console.log(`solar-icons.json: ${names.length} ikon`);
