import { useEffect, useMemo, useState } from "react";
import type { EnergyCompact, MetricKey } from "./types";
import MapView from "./components/MapView";
import SidePanel from "./components/SidePanel";
import { metricLabel } from "./utils";

type CountriesGeoJSON = any;

const METRICS: MetricKey[] = [
  "nuclear_twh",
  "nuclear_share_pct",
  "generation_twh",
  "demand_twh",
  "carbon_intensity",
  "decarb_lens_pct"
];

export default function App() {
  const [compact, setCompact] = useState<EnergyCompact | null>(null);
  const [geojson, setGeojson] = useState<CountriesGeoJSON | null>(null);

  const [metric, setMetric] = useState<MetricKey>("nuclear_share_pct");
  const [year, setYear] = useState<number>(2021);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [compareIso, setCompareIso] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/energy_compact.json").then((r) => r.json()),
      fetch("/data/countries.geojson").then((r) => r.json())
    ]).then(([energy, countries]) => {
      setCompact(energy);
      setGeojson(countries);

      const ys: number[] = energy.years;
      const maxY = ys[ys.length - 1];
      setYear(maxY);
    });
  }, []);

  const years = useMemo(() => compact?.years ?? [], [compact]);
  const minYear = years[0] ?? 1900;
  const maxYear = years[years.length - 1] ?? 2021;

  if (!compact || !geojson) {
    return <div style={{ padding: 16 }}>Loading data…</div>;
  }

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "1.6fr 1fr" }}>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: 12,
            borderRadius: 12,
            boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
            width: 340
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Metric</div>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as MetricKey)}
                style={{ width: "100%", padding: 8, borderRadius: 10, border: "1px solid #e5e7eb" }}
              >
                {METRICS.map((m) => (
                  <option key={m} value={m}>
                    {metricLabel(m)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
                <span>Year</span>
                <span style={{ color: "#111827", fontWeight: 600 }}>{year}</span>
              </div>
              <input
                type="range"
                min={minYear}
                max={maxYear}
                step={1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Compare country B</div>
              <select
                value={compareIso || ""}
                onChange={(e) => setCompareIso(e.target.value || null)}
                style={{ width: "100%", padding: 8, borderRadius: 10, border: "1px solid #e5e7eb" }}
              >
                <option value="">None</option>
                {compact.countries
                  .filter((c) => c.iso !== selectedIso)
                  .sort((a, b) => a.country.localeCompare(b.country))
                  .map((c) => (
                    <option key={c.iso} value={c.iso}>
                      {c.country} ({c.iso})
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedIso(null);
                setCompareIso(null);
              }}
              style={{
                padding: 10,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer"
              }}
            >
              Clear selection
            </button>

            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Click a country to open the trend panel.
            </div>
          </div>
        </div>

        <MapView
          geojson={geojson}
          compact={compact}
          year={year}
          metric={metric}
          selectedIso={selectedIso}
          onSelectIso={setSelectedIso}
        />
      </div>

      <div style={{ borderLeft: "1px solid #e5e7eb", overflow: "auto" }}>
        <SidePanel compact={compact} selectedIso={selectedIso} compareIso={compareIso} year={year} metric={metric} />
      </div>
    </div>
  );
}
