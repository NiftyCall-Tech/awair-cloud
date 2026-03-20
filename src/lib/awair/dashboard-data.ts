import { unstable_cache } from "next/cache";
import { siteConfig } from "@/config/site";
import { getServerEnv, getAwairToken } from "@/lib/env";
import { awairTokenCacheKey, getCachedDevices, getCachedUser } from "@/lib/awair/cached-api";
import { AwairApiError, getAirData } from "@/lib/awair/client";
import { pm25ToUsAqi } from "@/lib/awair/aqi";
import { demoLatestRow, demoSparkline } from "@/lib/awair/demo";
import {
  pickSensor,
  scoreLabel,
  scoreToMetricStatus,
  statusFromVocPpb,
  type MetricStatus,
} from "@/lib/awair/metrics";
import {
  formatSensorValue,
  getSensorDef,
  SENSOR_CARD_ORDER,
  statusForSensor,
} from "@/lib/awair/sensor-catalog";
import type { AwairAirDataRow, AwairAirDataResponse, AwairDevice } from "@/lib/awair/types";

async function fetchAirDataForDevice(
  device: AwairDevice,
  limit5: number,
  limit15: number,
  fetchRaw: boolean,
): Promise<{
  latest: AwairAirDataResponse;
  five: AwairAirDataResponse;
  fifteen: AwairAirDataResponse;
  rawOptional: AwairAirDataResponse;
}> {
  const [latest, five, fifteen, rawOptional] = await Promise.all([
    getAirData(device.deviceType, device.deviceId, "latest"),
    getAirData(device.deviceType, device.deviceId, "5-min-avg", { limit: limit5, desc: "true" }),
    getAirData(device.deviceType, device.deviceId, "15-min-avg", { limit: limit15, desc: "true" }),
    fetchRaw
      ? getAirData(device.deviceType, device.deviceId, "raw", { limit: 360, desc: "true" })
      : Promise.resolve({} as AwairAirDataResponse),
  ]);
  return { latest, five, fifteen, rawOptional };
}

const INDEX_LABELS: Record<string, string> = {
  temp: "Temperature",
  humid: "Humidity",
  co2: "CO₂",
  voc: "VOC",
  pm25: "PM2.5",
  pm10: "PM10",
  dust: "Dust",
};

export type MetricCardModel = {
  comp: string;
  title: string;
  subtitle: string;
  valueDisplay: string;
  unit: string;
  spark: number[];
  sparkColor: string;
  status?: MetricStatus;
};

export type DashboardPayload = {
  syncedAt: string;
  demo: boolean;
  device: {
    name: string;
    stationLabel: string;
    /** e.g. `37.77, -122.42` when API provides coords */
    coordinates: string | null;
    timezone: string | null;
    roomType: string | null;
  };
  /**
   * Hero: **Awair score** from API `air-data` `score` (0–100).
   * EPA line is **computed** from PM2.5 only (US EPA AQI), not returned by Awair as “AQI”.
   */
  hero: {
    awairScore: number;
    statusLabel: ReturnType<typeof scoreLabel>;
    gaugeFill: number;
    epaAqiFromPm25: number | null;
    epaAqiNote: string;
    /** Downsampled Awair score series from 5‑min history (oldest → newest). */
    scoreTrend: number[];
    /** UI band for gauge / header (from composite score). */
    level: MetricStatus;
  };
  metricCards: MetricCardModel[];
  voc: {
    ppb: number;
    status: ReturnType<typeof statusFromVocPpb>;
    riskMessage: string;
  };
  indices?: { comp: string; label: string; value: number }[];
  forecast: {
    /** `YYYY-MM-DD` for stable keys and layout */
    dateIso: string;
    day: string;
    icon: "sun" | "cloud" | "alert";
    /** `null` when no history exists for that calendar day (padded slot). */
    scoreAvg: number | null;
  }[];
  quota: { used: number; limit: number; scope: string } | null;
};

function sparkColorFor(status: MetricStatus | undefined): string {
  if (!status) return "#34d399";
  if (status === "good") return "#34d399";
  if (status === "warm") return "#f59e0b";
  return "#f87171";
}

const SPARKLINE_MAX_POINTS = 96;

function downsampleSeries(vals: number[], maxPoints: number): number[] {
  if (vals.length <= maxPoints) return vals;
  const step = (vals.length - 1) / (maxPoints - 1);
  const out: number[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.round(i * step);
    out.push(vals[Math.min(idx, vals.length - 1)]);
  }
  return out;
}

function formatCoordinates(lat: number | null | undefined, lon: number | null | undefined): string | null {
  if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

function gaugeFillFromScore(score: number): number {
  return Math.min(1, Math.max(0, score) / 100);
}

function epaNote(pm25: number | null | undefined): { aqi: number | null; text: string } {
  if (pm25 == null || Number.isNaN(pm25)) {
    return {
      aqi: null,
      text: "US EPA AQI (from PM2.5): — · Awair returns score + raw sensors; EPA AQI is computed here when PM2.5 exists.",
    };
  }
  const aqi = Math.round(pm25ToUsAqi(pm25));
  return {
    aqi,
    text: `US EPA AQI (from PM2.5): ${aqi} · Computed locally; Awair does not provide EPA AQI.`,
  };
}

const RAW_HISTORY_CAP = 360;

function sparkSource(
  five: AwairAirDataRow[] | undefined,
  raw: AwairAirDataRow[] | undefined,
  comp: string,
  fiveLimit: number,
): { rows: AwairAirDataRow[] | undefined; cap: number } {
  if (raw?.length && raw.some((r) => pickSensor(r.sensors, comp) != null)) {
    return { rows: raw, cap: RAW_HISTORY_CAP };
  }
  return { rows: five, cap: fiveLimit };
}

function buildMetricCards(
  latestRow: AwairAirDataRow,
  five: AwairAirDataRow[] | undefined,
  raw: AwairAirDataRow[] | undefined,
  fiveLimit: number,
  demo: boolean,
): MetricCardModel[] {
  const byComp = new Map(latestRow.sensors.map((s) => [s.comp, s.value]));
  const cards: MetricCardModel[] = [];
  const used = new Set<string>();

  const pushCard = (comp: string, value: number) => {
    const def = getSensorDef(comp);
    const status = statusForSensor(comp, value);
    const src = sparkSource(five, raw, comp, fiveLimit);
    const spark = demo
      ? demoSparkline(value, comp === "co2" ? 20 : comp === "temp" ? 0.4 : 3)
      : seriesFor(src.rows, comp, src.cap);
    cards.push({
      comp,
      title: def.title,
      subtitle: def.subtitle,
      valueDisplay: formatSensorValue(comp, value),
      unit: def.unit,
      spark,
      sparkColor: sparkColorFor(status),
      status,
    });
    used.add(comp);
  };

  for (const comp of SENSOR_CARD_ORDER) {
    const v = byComp.get(comp);
    if (typeof v === "number") pushCard(comp, v);
  }
  for (const s of latestRow.sensors) {
    if (used.has(s.comp)) continue;
    pushCard(s.comp, s.value);
  }

  return cards;
}

function buildIndices(row: AwairAirDataRow): DashboardPayload["indices"] | undefined {
  if (!row.indices?.length) return undefined;
  return row.indices.map((i) => ({
    comp: i.comp,
    label: INDEX_LABELS[i.comp] ?? i.comp,
    value: i.value,
  }));
}

function resolveDevice(devices: AwairDevice[]): AwairDevice | null {
  const env = getServerEnv();
  if (env.AWAIR_DEVICE_TYPE && env.AWAIR_DEVICE_ID) {
    const id = Number(env.AWAIR_DEVICE_ID);
    return (
      devices.find((d) => d.deviceType === env.AWAIR_DEVICE_TYPE && d.deviceId === id) ?? null
    );
  }
  return devices[0] ?? null;
}

/**
 * `desc=true` rows are newest-first; sparkline reads left→right as oldest→newest.
 */
function seriesFor(rows: AwairAirDataRow[] | undefined, comp: string, maxRows: number): number[] {
  if (!rows?.length) return [];
  const vals = rows
    .slice(0, maxRows)
    .map((r) => pickSensor(r.sensors, comp))
    .filter((v): v is number => typeof v === "number");
  const chronological = vals.reverse();
  return downsampleSeries(chronological, SPARKLINE_MAX_POINTS);
}

function scoreTrendFromHistory(rows: AwairAirDataRow[] | undefined, maxRows: number): number[] {
  if (!rows?.length) return [];
  const scores = rows.slice(0, maxRows).map((r) => r.score);
  return downsampleSeries(scores.reverse(), SPARKLINE_MAX_POINTS);
}

function weekdayShort(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "short" });
}

/** Calendar add for `YYYY-MM-DD` strings (UTC). */
function addDaysUtc(isoYmd: string, delta: number): string {
  const [y, m, d] = isoYmd.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d + delta);
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * Daily average **Awair score** per calendar day, **last 7 days** ending at the newest day that
 * appears in history. Merges 15‑min and 5‑min rows (deduped by `timestamp`) so we don’t rely only
 * on 5‑min (which spans ~1 calendar day). Days with no samples use `scoreAvg: null`.
 */
function buildForecast(
  rows15: AwairAirDataRow[] | undefined,
  rows5: AwairAirDataRow[] | undefined,
): DashboardPayload["forecast"] {
  const seenTs = new Set<string>();
  const merged: AwairAirDataRow[] = [];
  for (const r of [...(rows15 ?? []), ...(rows5 ?? [])]) {
    if (seenTs.has(r.timestamp)) continue;
    seenTs.add(r.timestamp);
    merged.push(r);
  }
  if (!merged.length) return [];

  const byDay = new Map<string, number[]>();
  for (const r of merged) {
    const d = r.timestamp.slice(0, 10);
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(r.score);
  }

  const sortedDays = [...byDay.keys()].sort();
  const lastDay = sortedDays[sortedDays.length - 1]!;

  const out: DashboardPayload["forecast"] = [];
  for (let back = 6; back >= 0; back--) {
    const dateIso = addDaysUtc(lastDay, -back);
    const scores = byDay.get(dateIso);
    const avg =
      scores?.length != null && scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;
    const icon =
      avg == null
        ? ("cloud" as const)
        : avg >= 80
          ? ("sun" as const)
          : avg >= 60
            ? ("cloud" as const)
            : ("alert" as const);
    out.push({
      dateIso,
      day: weekdayShort(dateIso),
      icon,
      scoreAvg: avg == null ? null : Math.round(avg),
    });
  }
  return out;
}

export async function buildDashboardPayload(): Promise<DashboardPayload> {
  const env = getServerEnv();
  const token = getAwairToken();
  const demo = Boolean(env.AWAIR_DEMO_MODE && !token);

  if (demo) {
    const row = demoLatestRow();
    const s = row.sensors;
    const pm = pickSensor(s, "pm25");
    const epa = epaNote(pm ?? null);

    return {
      syncedAt: new Date().toISOString(),
      demo: true,
      device: {
        name: "Alpha-9",
        stationLabel: "Alpha-9",
        coordinates: "37.77, -122.42",
        timezone: "America/Los_Angeles",
        roomType: "Office",
      },
      hero: {
        awairScore: Math.round(row.score),
        statusLabel: scoreLabel(row.score),
        gaugeFill: gaugeFillFromScore(row.score),
        epaAqiFromPm25: epa.aqi,
        epaAqiNote: epa.text,
        scoreTrend: demoSparkline(row.score, 2),
        level: scoreToMetricStatus(Math.round(row.score)),
      },
      metricCards: buildMetricCards(row, undefined, undefined, 288, true),
      voc: (() => {
        const v = pickSensor(s, "voc") ?? 0;
        const st = statusFromVocPpb(v);
        return {
          ppb: v,
          status: st,
          riskMessage: siteConfig.vocRiskMessages[st],
        };
      })(),
      indices: buildIndices(row),
      forecast: [
        { dateIso: "2025-03-10", day: "Mon", icon: "sun", scoreAvg: 91 },
        { dateIso: "2025-03-11", day: "Tue", icon: "sun", scoreAvg: 88 },
        { dateIso: "2025-03-12", day: "Wed", icon: "cloud", scoreAvg: 72 },
        { dateIso: "2025-03-13", day: "Thu", icon: "cloud", scoreAvg: 68 },
        { dateIso: "2025-03-14", day: "Fri", icon: "alert", scoreAvg: 52 },
        { dateIso: "2025-03-15", day: "Sat", icon: "sun", scoreAvg: 84 },
        { dateIso: "2025-03-16", day: "Sun", icon: "sun", scoreAvg: 87 },
      ],
      quota: { used: 8421, limit: 10000, scope: "default" },
    };
  }

  const ck = awairTokenCacheKey();
  const user = await getCachedUser();
  const { devices = [] } = await getCachedDevices();
  const device = resolveDevice(devices);
  if (!device) {
    throw new Error("No Awair devices found for this account");
  }

  const limit5 = env.AWAIR_HISTORY_5MIN_LIMIT;
  const limit15 = env.AWAIR_HISTORY_15MIN_LIMIT;
  const fetchRaw = env.AWAIR_FETCH_RAW_AIRDATA;
  const airCacheSec = env.AWAIR_AIRDATA_CACHE_SECONDS;

  const airKey = [
    "awair-api",
    "airdata",
    ck,
    device.deviceType,
    String(device.deviceId),
    String(limit5),
    String(limit15),
    String(fetchRaw),
  ] as const;

  const { latest, five, fifteen, rawOptional } =
    airCacheSec > 0
      ? await unstable_cache(
          async () => fetchAirDataForDevice(device, limit5, limit15, fetchRaw),
          [...airKey],
          { revalidate: airCacheSec },
        )()
      : await fetchAirDataForDevice(device, limit5, limit15, fetchRaw);

  const rawRows = rawOptional.data;

  const fiveRows = five.data ?? [];
  const fifteenRows = fifteen.data ?? [];

  const row = latest.data?.[0];
  if (!row) {
    const fromApi = latest.errors
      ?.map((e) => e.message)
      .filter((m): m is string => typeof m === "string" && m.length > 0)
      .join("; ");
    throw new Error(
      fromApi
        ? `No recent air data (latest): ${fromApi}`
        : "No recent air data (device offline?)",
    );
  }

  const s = row.sensors;
  const pm = pickSensor(s, "pm25");
  const voc = pickSensor(s, "voc") ?? 0;
  const vocStatus = statusFromVocPpb(voc);
  const epa = epaNote(pm ?? null);

  const perms = user.permissions ?? [];
  const usages = user.usages ?? [];
  const perm = perms[0];
  const usage = usages.find((u) => u.scope === perm?.scope) ?? usages[0];

  const forecast = buildForecast(fifteenRows, fiveRows);

  const awairScore = Math.round(row.score);
  const coords = formatCoordinates(device.latitude, device.longitude);

  return {
    syncedAt: new Date().toISOString(),
    demo: false,
    device: {
      name: device.name ?? device.deviceUUID,
      stationLabel: device.locationName ?? device.name ?? device.deviceUUID,
      coordinates: coords,
      timezone: device.timezone ?? null,
      roomType: device.roomType ?? device.spaceType ?? null,
    },
    hero: {
      awairScore,
      statusLabel: scoreLabel(awairScore),
      gaugeFill: gaugeFillFromScore(awairScore),
      epaAqiFromPm25: epa.aqi,
      epaAqiNote: epa.text,
      scoreTrend: scoreTrendFromHistory(fiveRows, limit5),
      level: scoreToMetricStatus(awairScore),
    },
    metricCards: buildMetricCards(row, fiveRows, rawRows, limit5, false),
    voc: {
      ppb: voc,
      status: vocStatus,
      riskMessage: siteConfig.vocRiskMessages[vocStatus],
    },
    indices: buildIndices(row),
    forecast:
      forecast.length > 0
        ? forecast
        : [
            {
              dateIso: "",
              day: "—",
              icon: "cloud" as const,
              scoreAvg: awairScore,
            },
          ],
    quota:
      perm && usage
        ? {
            used: usage.usage,
            limit: perm.quota,
            scope: perm.scope,
          }
        : null,
  };
}

export function isAwairApiError(e: unknown): e is AwairApiError {
  return e instanceof AwairApiError;
}
