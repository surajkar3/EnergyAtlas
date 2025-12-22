# Data folder

Place these files here:

1) `energy.csv`
   - Download from Kaggle: `pranjalverma08/energy-dataset-countrywise-19002021`
   - This repo expects the CSV to contain columns: `iso_code`, `country`, `year`,
     and (at minimum) `nuclear_electricity`, `electricity_demand`, `electricity_generation`,
     `carbon_intensity_elec`.

2) `countries.geojson`
   - World countries polygons GeoJSON with ISO3 codes in feature properties.
   - The app looks for one of these properties: `ISO_A3`, `ADM0_A3`, `iso_a3`, `iso3`, `ISO3`.
   - If your file uses a different property name, update `candidates` in `src/components/MapView.tsx`.

After placing `energy.csv`, run:
`npm run preprocess`
which creates:
`energy_compact.json`
