export type MetricKey =
  | "nuclear_twh"
  | "demand_twh"
  | "generation_twh"
  | "nuclear_share_pct"
  | "carbon_intensity"
  | "decarb_lens_pct";

export type EnergyCompact = {
  years: number[];
  countries: Array<{
    iso: string;
    country: string;
    series: Record<
      string,
      { n: number | null; d: number | null; g: number | null; c: number | null; r: number | null }
    >;
  }>;
};

export type CountryPoint = {
  iso: string;
  country: string;
  year: number;
  nuclear_twh: number | null;
  demand_twh: number | null;
  generation_twh: number | null;
  nuclear_share_pct: number | null;
  carbon_intensity: number | null;
  decarb_lens_pct: number | null;
};
