# Awair Cloud — Indoor Air Quality

Open-source [Next.js](https://nextjs.org/) 16 dashboard for **Awair** indoor air quality, styled from [`DESIGN.md`](DESIGN.md) and the [Awair Developer API](https://docs.developer.getawair.com/).

Two screens: **Dashboard** (live metrics, sparklines, score history, 7‑day score outlook, VOC panel) and **Settings** (device metadata save, quota, connectivity when the API exposes it).


## Features

- **Server-side Awair client** — Bearer token stays in environment variables; never sent to the browser.
- **Air-data** — `latest`, `5-min-avg`, `15-min-avg`, optional `raw` (see env below). History limits default to Awair’s documented caps for charts.
- **Metrics** — Hero uses API **`score`**; cards render every `sensors[]` `comp`; optional **`indices`**; US EPA AQI text is **derived from PM2.5** only ([`docs/METRICS.md`](docs/METRICS.md)).
- **UI levels** — Green / amber / red styling from `scoreToMetricStatus` (composite score) and `src/config/thresholds.ts` (PM2.5, CO₂, VOC, comfort ranges for **temperature** and **humidity**, etc.).
- **Weekly forecast** — Seven calendar days of daily average **`score`**, built from **merged** 15‑min + 5‑min history (days without data show **—**).
- **VOC copy** — `src/config/site.ts` **`vocRiskMessages`** per good / warm / critical (from TVOC thresholds), not a single static “elevated” line.
- **Settings save** — Proxies **`PATCH`** then **`PUT`** to Awair for device metadata if needed ([`docs/API.md`](docs/API.md)).
- **Server caches** — User/device list and optional short-lived air-data cache (`AWAIR_AIRDATA_CACHE_SECONDS`) reduce duplicate Awair calls; reload the page for new data (no auto-polling).
- **Sensible defaults** — `AWAIR_DEVICE_TYPE` / `AWAIR_DEVICE_ID` optional; first device is used when omitted.
- **Demo mode** — `AWAIR_DEMO_MODE=true` **and** no token: deterministic demo data for `next build` and screenshots.
- **Tests** — Vitest: [`src/lib/awair/aqi.test.ts`](src/lib/awair/aqi.test.ts), [`src/lib/awair/metrics.test.ts`](src/lib/awair/metrics.test.ts).

**Requirements:** Node **≥ 20.10** (see `package.json` `engines`).

## Quick start

```bash
npm install
cp .env.example .env.local
# Add AWAIR_ACCESS_TOKEN from https://developer.getawair.com/
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Without a token (demo)

```bash
echo "AWAIR_DEMO_MODE=true" >> .env.local
npm run dev
```

### Charts / history look empty?

You need a **valid token**, **demo off**, and Awair returning **`data`** on `5-min-avg` / `15-min-avg`. See **[`docs/API.md` — “Charts look empty?”](docs/API.md#charts-look-empty)** and **[`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)** (`AWAIR_HISTORY_*`, optional `AWAIR_FETCH_RAW_AIRDATA`).

## Scripts

| Command              | Purpose               |
| -------------------- | --------------------- |
| `npm run dev`        | Development server    |
| `npm run build`      | Production build      |
| `npm run start`      | Run production server |
| `npm run lint`       | ESLint                |
| `npm run test`       | Vitest (once)         |
| `npm run test:watch` | Vitest watch mode     |

## Documentation

| Doc                                              | Contents                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)     | All env vars (token, history limits, caches, demo).                                   |
| [`docs/API.md`](docs/API.md)                     | Internal BFF routes (`/api/awair/*`), device PATCH/PUT, empty charts troubleshooting. |
| [`docs/API_COVERAGE.md`](docs/API_COVERAGE.md)   | What Awair endpoints this app calls vs. not implemented.                              |
| [`docs/METRICS.md`](docs/METRICS.md)             | Score, sensors, indices, EPA AQI, history, weekly forecast.                           |
| [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md) | Branding, thresholds, room types, layout metadata.                                    |

## Project layout

| Path                 | Role                                                              |
| -------------------- | ----------------------------------------------------------------- |
| `src/app/(app)/`     | Dashboard & Settings routes                                       |
| `src/app/api/awair/` | BFF route handlers                                                |
| `src/lib/awair/`     | Awair REST client (`client.ts`), dashboard/settings payloads, AQI |
| `src/config/`        | Site copy, thresholds, room types                                 |
| `docs/`              | Env, metrics, internal API, coverage                              |

## Customization

See [`docs/CUSTOMIZATION.md`](docs/CUSTOMIZATION.md).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

MIT — see [`LICENSE`](LICENSE).

## Disclaimer

Not affiliated with Awair. “Awair” is a trademark of its owner. This project is an independent integration; confirm endpoint paths and quotas in the official documentation for your account tier.
