# Environment variables

All Awair secrets are **server-only**. The browser never sees your token.

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `APP_ACCESS_PASSWORD` | No | — | If set, visitors must enter this password on `/login` before any page or `/api/awair/*` runs (reduces accidental Awair API usage from public URLs). Uses an **httpOnly** cookie — not a substitute for network-level auth. Leave unset for open access. |
| `AWAIR_ACCESS_TOKEN` | Yes (unless demo) | — | Bearer token from the [Awair Developer Console](https://developer.getawair.com/). |
| `AWAIR_BEARER_TOKEN` | No | — | **Alias** for `AWAIR_ACCESS_TOKEN` for older scripts or hosting presets. |
| `AWAIR_API_BASE_URL` | No | `https://developer-apis.awair.is/v1` | REST base URL (include `/v1`). |
| `AWAIR_USER_SEGMENT` | No | `users/self` | Path segment after the base URL. Use `orgs/{id}` for organization tokens if applicable. |
| `AWAIR_DEVICE_TYPE` | No | — | e.g. `awair-element`. With `AWAIR_DEVICE_ID`, selects which device to show. |
| `AWAIR_DEVICE_ID` | No | — | Numeric device id from the devices list. |
| `AWAIR_DEMO_MODE` | No | `false` | When `true` **and** no token is set, the app serves deterministic demo data so `next build` and local previews work without credentials. |
| `AWAIR_HISTORY_5MIN_LIMIT` | No | `288` | Max `5-min-avg` points (Awair allows up to 288 ≈ 24h). |
| `AWAIR_HISTORY_15MIN_LIMIT` | No | `672` | Max `15-min-avg` points (Awair allows up to 672 ≈ 7d) for weekly score forecast. |
| `AWAIR_FETCH_RAW_AIRDATA` | No | `false` | When `true`, also fetches up to 360 `raw` samples for sparklines (uses extra API quota). |
| `AWAIR_AIRDATA_CACHE_SECONDS` | No | `60` | Server-side deduplication of air-data fetches (latest + 5‑min + 15‑min + optional raw). Same request within this window hits the cache instead of Awair again. Set `0` to disable. Helps avoid **HTTP 429** (daily request limits). |

**429 Too Many Requests:** Awair enforces a **rolling 24h** quota. If you see this, wait for the window to reset, turn off `AWAIR_FETCH_RAW_AIRDATA`, and avoid opening many tabs or reloading constantly. The dashboard does **not** auto-poll; use a normal browser refresh when you want new data.

Load variables via `.env.local` (gitignored) or your host’s secret manager.

See also: [CUSTOMIZATION.md](./CUSTOMIZATION.md).
