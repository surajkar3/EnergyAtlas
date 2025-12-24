import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import type { EnergyCompact, MetricKey } from "../types";
import { buildCountryPoint, formatValue, metricLabel } from "../utils";

type Props = {
  compact: EnergyCompact;
  selectedIso: string | null;
  compareIso: string | null;
  year: number;
  metric: MetricKey;
};

export default function SidePanel({ compact, selectedIso, compareIso, year, metric }: Props) {
  if (!selectedIso) {
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Select a country</h2>
        <p style={{ marginTop: 8, color: "#4b5563" }}>
          Click a country to see trends (1900–2021).
        </p>
      </div>
    );
  }

  const selected = compact.countries.find((c) => c.iso === selectedIso);
  const name = selected?.country ?? selectedIso;
  const compare = compareIso ? compact.countries.find((c) => c.iso === compareIso) : null;
  const compareName = compare?.country ?? compareIso;

  const points = compact.years.map((y) => {
    const p = buildCountryPoint(compact, selectedIso, y);
    const p2 = compareIso ? buildCountryPoint(compact, compareIso, y) : null;
    return {
      year: y,
      metric: p?.[metric] ?? null,
      metricB: p2?.[metric] ?? null,
      nuclear_share: p?.nuclear_share_pct ?? null,
      nuclear_shareB: p2?.nuclear_share_pct ?? null
    };
  });

  const current = buildCountryPoint(compact, selectedIso, year);
  const currentB = compareIso ? buildCountryPoint(compact, compareIso, year) : null;

  return (
    <div
      style={{
        padding: 16,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: 18 }}>
          {name} ({selectedIso})
          {compareIso && (
            <span style={{ fontSize: 14, color: "#6b7280", fontWeight: "normal" }}>
              {" "}vs {compareName} ({compareIso})
            </span>
          )}
        </h2>
        <div
          style={{
            marginTop: 8,
            display: "grid",
            gridTemplateColumns: compareIso ? "1fr 1fr" : "1fr 1fr",
            gap: 8
          }}
        >
          <Stat label="Year" value={String(year)} />
          <Stat
            label={metricLabel(metric)}
            value={formatValue(metric, current?.[metric] ?? null)}
          />
          <Stat
            label="Nuclear (TWh)"
            value={formatValue("nuclear_twh", current?.nuclear_twh ?? null)}
          />
          <Stat
            label="Nuclear share"
            value={formatValue(
              "nuclear_share_pct",
              current?.nuclear_share_pct ?? null
            )}
          />
          {compareIso && currentB && (
            <>
              <Stat
                label={`${metricLabel(metric)} (B)`}
                value={formatValue(metric, currentB?.[metric] ?? null)}
              />
              <Stat
                label="Nuclear (TWh) (B)"
                value={formatValue("nuclear_twh", currentB?.nuclear_twh ?? null)}
              />
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 220 }}>
        <h3 style={{ margin: "8px 0", fontSize: 14 }}>
          {metricLabel(metric)} over time
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="metric" 
              name={name}
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false} 
            />
            {compareIso && (
            <Line 
              type="monotone" 
              dataKey="metricB" 
              name={compareName ?? undefined}
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false} 
            />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1, minHeight: 220 }}>
        <h3 style={{ margin: "8px 0", fontSize: 14 }}>
          Nuclear share of generation (%)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="nuclear_share" 
              name={name}
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false} 
            />
            {compareIso && (
            <Line 
              type="monotone" 
              dataKey="nuclear_shareB" 
              name={compareName ?? undefined}
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false} 
            />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 10
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 4 }}>{value}</div>
    </div>
  );
}
