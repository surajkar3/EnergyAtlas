import type { CountryPoint, EnergyCompact, MetricKey } from "./types";

export function buildCountryPoint(
  compact: EnergyCompact,
  iso: string,
  year: number
): CountryPoint | null {
  const c = compact.countries.find((x) => x.iso === iso);
  if (!c) return null;

  const row = c.series[String(year)];
  if (!row) {
    return {
      iso,
      country: c.country,
      year,
      nuclear_twh: null,
      demand_twh: null,
      generation_twh: null,
      nuclear_share_pct: null,
      carbon_intensity: null,
      decarb_lens_pct: null
    };
  }

  const nuclear_twh = row.n ?? null;
  const demand_twh = row.d ?? null;
  const generation_twh = row.g ?? null;
  const carbon_intensity = row.c ?? null;
  const renewables_twh = row.r ?? null;

  const nuclear_share_pct =
    nuclear_twh != null && generation_twh != null && generation_twh > 0
      ? (nuclear_twh / generation_twh) * 100
      : null;

  const decarb_lens_pct =
    nuclear_twh != null && renewables_twh != null && generation_twh != null && generation_twh > 0
      ? ((nuclear_twh + renewables_twh) / generation_twh) * 100
      : null;

  return {
    iso,
    country: c.country,
    year,
    nuclear_twh,
    demand_twh,
    generation_twh,
    nuclear_share_pct,
    carbon_intensity,
    decarb_lens_pct
  };
}

export function formatValue(metric: MetricKey, v: number | null): string {
  if (v == null) return "—";
  if (metric === "nuclear_share_pct" || metric === "decarb_lens_pct") return `${v.toFixed(1)}%`;
  if (metric === "carbon_intensity") return `${v.toFixed(0)} gCO₂/kWh`;
  // TWh
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(2)} PWh`;
  return `${v.toFixed(1)} TWh`;
}

export function metricLabel(metric: MetricKey): string {
  switch (metric) {
    case "nuclear_twh":
      return "Nuclear electricity (TWh)";
    case "demand_twh":
      return "Electricity demand (TWh)";
    case "generation_twh":
      return "Electricity generation (TWh)";
    case "nuclear_share_pct":
      return "Nuclear share of generation (%)";
    case "carbon_intensity":
      return "Carbon intensity (gCO₂/kWh)";
    case "decarb_lens_pct":
      return "Decarb lens: (nuclear + renewables) share (%)";
  }
}
