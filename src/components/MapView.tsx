import { useMemo } from "react";
import { GeoJSON, MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import type { FeatureCollection, GeoJsonObject } from "geojson";
import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import type { EnergyCompact, MetricKey } from "../types";
import { buildCountryPoint } from "../utils";

type Props = {
  geojson: FeatureCollection;
  compact: EnergyCompact;
  year: number;
  metric: MetricKey;
  selectedIso: string | null;
  onSelectIso: (iso: string) => void;
};

function getIso3FromFeatureProps(props: any): string | null {
  // If your GeoJSON uses a different ISO3 field, add it here.
  const candidates = ["ISO_A3", "ADM0_A3", "iso_a3", "iso3", "ISO3"];
  for (const k of candidates) {
    const v = props?.[k];
    if (typeof v === "string" && v.length === 3) return v;
  }
  return null;
}

export default function MapView({
  geojson,
  compact,
  year,
  metric,
  selectedIso,
  onSelectIso
}: Props) {
  const metricValues = useMemo(() => {
    const vals: number[] = [];
    for (const c of compact.countries) {
      const p = buildCountryPoint(compact, c.iso, year);
      const v = p?.[metric] ?? null;
      if (typeof v === "number" && Number.isFinite(v)) vals.push(v);
    }
    vals.sort((a, b) => a - b);
    return vals;
  }, [compact, year, metric]);

  const domain = useMemo(() => {
    if (metricValues.length === 0) return [0, 1] as [number, number];
    const lo = metricValues[Math.floor(metricValues.length * 0.05)];
    const hi = metricValues[Math.floor(metricValues.length * 0.95)];
    return [lo, hi] as [number, number];
  }, [metricValues]);

  const color = useMemo(() => {
    const s = scaleSequential(interpolateYlOrRd).domain(domain);
    return (v: number | null) => {
      if (v == null || !Number.isFinite(v)) return "#e5e7eb";
      const vv = Math.max(domain[0], Math.min(domain[1], v));
      return s(vv);
    };
  }, [domain]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        style={{ height: "100%", width: "100%" }}
        worldCopyJump
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />

        <GeoJSON
          data={geojson as unknown as GeoJsonObject}
          style={(feature) => {
            const iso = getIso3FromFeatureProps((feature as any)?.properties);
            const p = iso ? buildCountryPoint(compact, iso, year) : null;
            const v = p?.[metric] ?? null;

            const isSelected = iso != null && selectedIso === iso;
            return {
              weight: isSelected ? 2 : 0.7,
              color: isSelected ? "#111827" : "#374151",
              fillOpacity: 0.85,
              fillColor: color(typeof v === "number" ? v : null) as string
            };
          }}
          onEachFeature={(feature, layer) => {
            const props: any = (feature as any).properties;
            const iso = getIso3FromFeatureProps(props);

            layer.on("click", () => {
              if (iso) onSelectIso(iso);
            });

            const name = props?.NAME || props?.ADMIN || props?.name || "Unknown";
            if (iso) {
              const p = buildCountryPoint(compact, iso, year);
              const v = p?.[metric] ?? null;
              const text =
                typeof v === "number"
                  ? `${name} (${iso})`
                  : `${name} (${iso}) — no data`;
              layer.bindTooltip(text, { sticky: true });
            } else {
              layer.bindTooltip(name, { sticky: true });
            }
          }}
        />
      </MapContainer>
    </div>
  );
}
