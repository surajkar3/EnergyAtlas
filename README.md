# Energy Atlas — World Nuclear & Electricity Explorer

Interactive world map + country trend panel for:
- Nuclear electricity (TWh)
- Electricity demand (TWh)
- Electricity generation (TWh)
- Nuclear share of generation (%; computed)
- Carbon intensity (gCO₂/kWh)
- Decarb lens: (nuclear + renewables) share of generation (%)

Data range: 1900–2021 

## Prereqs
- Node.js 18+ recommended
- npm

## Setup

### 1) Install deps
```bash
npm install
```


### 2) Preprocess CSV (creates compact JSON for the browser)
```bash
npm run preprocess
```

This creates:
`public/data/energy_compact.json`

### 3) Run dev server
```bash
npm run dev
```
