# Awair Cloud API coverage

This app is a **dashboard + settings** client for the [Awair Developer API](https://docs.developer.getawair.com/). Below is what the codebase implements and what is **out of scope** or **tier-dependent**.

## Implemented (server → Awair)

| Awair surface | Used for |
|---------------|----------|
| `GET /{userSegment}` | User identity, `permissions` / `usages` (quota bar) |
| `GET /{userSegment}/devices` | Device list; optional `AWAIR_DEVICE_TYPE` + `AWAIR_DEVICE_ID` pin one device |
| `GET .../devices/{type}/{id}/air-data/latest` | Hero score, sensor cards, indices, VOC |
| `GET .../air-data/5-min-avg` | Sparklines, score history (`limit`, `desc`) |
| `GET .../air-data/15-min-avg` | History for weekly outlook (`limit`, `desc`); merged with 5‑min for **7 calendar days** of daily average `score` |
| `GET .../air-data/raw` | Optional denser sparklines (`AWAIR_FETCH_RAW_AIRDATA`, `limit` ≤ 360) |
| `PATCH` or `PUT` `.../devices/{type}/{id}` | Settings “Save” — metadata (`name`, `roomType`, `spaceType`, `locationName`). **PATCH** is tried first; **PUT** is retried on **404/405** because deployments differ. |

`userSegment` is usually `users/self`; set `AWAIR_USER_SEGMENT=orgs/{id}` when your token is org-scoped.

## Derived in-app (not Awair fields)

- **US EPA AQI** from PM2.5 (`src/lib/awair/aqi.ts`)
- **Status chips** / colors from `src/config/thresholds.ts`
- **VOC prose** from `src/config/site.ts` `vocRiskMessages` by status

## Not implemented (use Awair app / Local API / other products)

- **OAuth / token refresh** — you supply a long-lived developer token in env.
- **Organization management** beyond `AWAIR_USER_SEGMENT`.
- **Registering devices**, **factory reset**, **LED / knocking** — Settings UI stores display prefs in `localStorage`; hardware behavior is not in the public REST surface we target (see `docs/API.md`).
- **`fahrenheit` query** on air-data — could be added via env if needed; defaults match python_awair (Celsius).

## Error handling

- HTTP errors from Awair include a parsed message when the body is JSON.
- Air-data responses may include `errors[]` without rows; the dashboard surfaces those messages when **latest** has no `data`.
- Device save failures return `{ error, detail? }` where `detail` is the raw Awair response body when available.

Confirm **endpoint paths and quotas** for your account in the official docs; this project is not affiliated with Awair.
