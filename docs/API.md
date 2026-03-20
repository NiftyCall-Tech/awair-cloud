# Internal HTTP API (this repository)

These routes are thin **server-side BFF** wrappers around the [Awair Developer API](https://docs.developer.getawair.com/). They keep the Bearer token on the server.

## Conventions

- **Auth:** None on these routes; protection is network placement (private LAN, VPN, or auth proxy in front of Next.js).
- **Errors:** JSON `{ "error": string }` with 4xx/5xx. Device updates may also include **`detail`** (raw Awair response body) for debugging.
- **Content-Type:** `application/json` for bodies and responses.

## Routes

### `GET /api/awair/dashboard`

Aggregated dashboard payload: Awair **`score`**, every **`sensors[]` `comp`** in the latest sample (with 5‑min sparklines, optional **raw**), optional **`indices`**, VOC messages by threshold, **7 calendar days** of daily average **`score`** (merged 15‑min + 5‑min history), optional quota, and **EPA AQI (from PM2.5)** note (computed server-side — not an Awair field). See [`METRICS.md`](./METRICS.md).

The dashboard page is a server-rendered **RSC**; refresh the browser (or navigate away and back) to load new data from Awair.

### `GET /api/awair/settings`

Current user/device snapshot for the Settings screen (identity fields, quota, optional connectivity fields if returned by Awair).

### `PATCH /api/awair/device`

Updates editable device metadata (proxies to Awair).

**Body (JSON):**

```json
{
  "deviceType": "awair-element",
  "deviceId": 12345,
  "name": "Main Lobby Sensor",
  "roomType": "OFFICE",
  "spaceType": "OFFICE",
  "locationName": "Ground floor, reception"
}
```

All fields except `deviceType` and `deviceId` are optional.

The server calls Awair at  
`{AWAIR_API_BASE_URL}/{AWAIR_USER_SEGMENT}/devices/{deviceType}/{deviceId}`  
with **`PATCH`**, then **`PUT`** if the response is **404** or **405** (some API versions expose only one verb).

On failure, the JSON body may include **`detail`**: raw Awair response text for debugging.

See also [`API_COVERAGE.md`](./API_COVERAGE.md).

## Charts look empty?

Sparklines and **Score history** use **`5-min-avg`** air-data (`limit` from `AWAIR_HISTORY_5MIN_LIMIT`). The **weekly** row uses **`15-min-avg`** (`AWAIR_HISTORY_15MIN_LIMIT`). If Awair returns **`data: []`** (or no rows) for those calls, you’ll see empty sparkline placeholders and a thin weekly strip — usually because:

- **`AWAIR_DEMO_MODE=true` and no token** — the UI is demo data; history is synthetic, not your device.
- **Device new / offline / no aggregates yet** — Awair may not have 5‑ or 15‑minute buckets to return.
- **Quota or tier limits** — history depth can be capped; check the [Developer Console](https://developer.getawair.com/) and API responses.
- **Wrong device** — set `AWAIR_DEVICE_TYPE` and `AWAIR_DEVICE_ID` if the account has multiple devices.

The app does not draw a line until there is at least one numeric point per series; sensor sparklines need that sensor present on historical rows.

## Display / LED preferences

Brightness and “knocking mode” in the UI are stored **in the browser** (`localStorage`) because the public REST surface for these controls is tier- and firmware-dependent. Prefer the [Local API](https://support.getawair.com/hc/en-us/articles/360049221014-Awair-Element-Local-API-Feature) on your LAN when you need hardware-level control.
