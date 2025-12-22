import fs from "node:fs";
import path from "node:path";
import { csvParse } from "d3-dsv";

const INPUT = path.resolve("public/data/energy.csv");
const OUTPUT = path.resolve("public/data/energy_compact.json");

if (!fs.existsSync(INPUT)) {
  console.error(`Missing ${INPUT}. Put your Kaggle CSV at public/data/energy.csv`);
  process.exit(1);
}

const csvText = fs.readFileSync(INPUT, "utf-8");
const rows = csvParse(csvText);

const get = (row, key) => {
  const v = row[key];
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const YEARS = new Set();
const byIso = new Map();

for (const r of rows) {
  const iso = (r.iso_code || "").trim();
  const country = (r.country || "").trim();
  const year = Number(r.year);

  if (!iso || !Number.isFinite(year)) continue;
  YEARS.add(year);

  if (!byIso.has(iso)) byIso.set(iso, { iso, country, series: {} });
  const obj = byIso.get(iso);

  const nuclear = get(r, "nuclear_electricity");
  const demand = get(r, "electricity_demand");
  const generation = get(r, "electricity_generation");
  const carbonIntensity = get(r, "carbon_intensity_elec");
  const renewables = get(r, "renewables_electricity");

  obj.series[year] = { n: nuclear, d: demand, g: generation, c: carbonIntensity, r: renewables };
}

const years = Array.from(YEARS).sort((a, b) => a - b);
const out = { years, countries: Array.from(byIso.values()) };

fs.writeFileSync(OUTPUT, JSON.stringify(out));
console.log(`Wrote ${OUTPUT}`);
console.log(`Countries: ${out.countries.length}, Years: ${out.years[0]}..${out.years[out.years.length - 1]}`);
