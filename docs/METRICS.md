# Metrics: Awair API vs. derived values

## Awair score (primary)

Each `air-data` sample includes **`score`** (0–100, higher is better). This is the **Awair composite score** returned by the API. The dashboard hero gauge and label use this field.

**UI levels (green / amber / red):** the API **`score`** (0–100) maps to **`scoreToMetricStatus`**: ≥80 → good, ≥60 → warm, else critical — same cut points as the weekly forecast row. That function is **not** used for °C or % RH. Sensor cards use `src/config/thresholds.ts`: PM2.5, CO₂, VOC (and particulate analogs) via upper-bound cutoffs; **temperature** and **humidity** via **`statusFromTempCelsius` / `statusFromHumidityRh`** (comfort ranges — e.g. ~18–24°C “good”, wider °C/% envelopes in `thresholds.temp` / `thresholds.humid`; `good` must lie **inside** `warm` on both axes).

## Raw sensors (`sensors[]`)

The API returns an array of `{ comp, value }` entries. Common `comp` keys (device-dependent):

| `comp` | Typical meaning |
|--------|-----------------|
| `temp` | Temperature (°C) |
| `humid` | Relative humidity (%) |
| `co2` | CO₂ (ppm) |
| `voc` | TVOC (ppb) |
| `pm25` | PM2.5 (µg/m³) |
| `pm10` | PM10 (µg/m³) |
| `dust` | Aggregate dust (legacy devices, µg/m³) |
| `lux` | Illuminance (lux) |
| `spl_a` | Sound pressure level (dBA) |

The dashboard renders **one card per** `comp` present in the latest sample, in a stable order (see `src/lib/awair/sensor-catalog.ts`). Unknown `comp` values still appear with a generic title.

## Indices (`indices[]`)

Optional per-metric **index** values (Awair’s internal scale, roughly −4…4 in magnitude). Shown when the API includes `indices` on the sample.

## US EPA AQI (derived, not from Awair)

**EPA AQI** is **not** returned by the Awair API. When **PM2.5** (`pm25`) is present, this app computes **US EPA AQI from PM2.5** using standard breakpoints (`src/lib/awair/aqi.ts`) and shows it **only as explanatory text** under the Awair score so you can compare to outdoor AQI reporting.

If PM2.5 is missing, no EPA AQI is shown.

## History & charts

- **`5-min-avg`**: Fetched up to `AWAIR_HISTORY_5MIN_LIMIT` (default 288) for metric sparklines and the hero **score history** mini chart (downsampled for display).
- **`15-min-avg`**: Fetched up to `AWAIR_HISTORY_15MIN_LIMIT` (default 672). Used together with 5‑min for the **weekly** row (merged, deduped by `timestamp`; see [Weekly forecast](#weekly-forecast)).
- **`raw`** (optional): If `AWAIR_FETCH_RAW_AIRDATA=true`, up to 360 raw points are fetched; sparklines use raw per-sensor series when that series exists, otherwise 5‑min.

## Device strip (API-backed)

Under the gauge, **Station** uses `locationName` / `name`; **Location** shows `latitude`/`longitude` when present; **Timezone** and room line use `timezone` and `roomType` / `spaceType`. Placeholder fields (e.g. altitude, coverage %) are not used.

## Weekly forecast

Shows **7 calendar days** ending at the **newest day** that appears in merged **15‑min + 5‑min** history (deduped by timestamp). Each cell is the **daily average Awair `score`** for that date, or **—** if there were no samples that day. Not EPA AQI.
