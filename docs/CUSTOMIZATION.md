# Customization (no fork required)

## Branding & navigation

- `src/config/site.ts` — product name, **VOC risk messages** (`vocRiskMessages.good` / `.warm` / `.critical`, tied to `thresholds.ts`), optional **Upgrade plan** URL. Top nav: **Dashboard** and **Settings** only (`src/config/site.ts` `nav`).
- `src/app/globals.css` — design tokens (`@theme inline`) aligned with `DESIGN.md`.
- `src/app/layout.tsx` — `metadata` (title, description, icons: SVG + PNG + `public/favicon.ico`).

## Status thresholds (PM2.5, CO₂, VOC, temperature, humidity)

- `src/config/thresholds.ts` — PM2.5 / CO₂ / VOC use **upper** cutoffs (higher = worse). **Temperature** and **humidity** use nested **min/max** bands: `warm` must fully contain `good` (do not set `warm.min` to the top of `good` only — that breaks the cold side). `src/lib/awair/metrics.ts` maps them to chips and card colors.

## Room type labels

- `src/config/room-types.ts` — dropdown options for Settings (values should match Awair `roomType` enums from the [official API](https://docs.developer.getawair.com/)).

## Fresh data on the dashboard

- Data is fetched on each **navigation** or full **page load** (no automatic timer). Reload the page to pull the latest Awair samples.

## Access gate (optional)

- Set **`APP_ACCESS_PASSWORD`** in the environment ([`ENVIRONMENT.md`](./ENVIRONMENT.md)). Visitors hit `/login` first; after a correct password, an **httpOnly** cookie unlocks the app and `/api/awair/*`. Use the header **Sign out** control to clear the cookie. This is a lightweight barrier, not full identity auth.
