/**
 * Threshold helpers for UI status chips. Defaults are loaded from `src/config/thresholds.ts`.
 */

import { thresholds as configured } from "@/config/thresholds";

export type MetricStatus = "good" | "warm" | "critical";

/** Inclusive bands: `good` sits inside `warm`; outside `warm` → critical. */
export type ComfortRangeBand = {
  good: { min: number; max: number };
  warm: { min: number; max: number };
};

export type ThresholdSet = {
  pm25: { good: number; warm: number };
  co2: { good: number; warm: number };
  voc: { good: number; warm: number };
  temp: ComfortRangeBand;
  humid: ComfortRangeBand;
};

export const defaultThresholds: ThresholdSet = configured;

export function statusFromPm25(value: number, t = defaultThresholds.pm25): MetricStatus {
  if (value <= t.good) return "good";
  if (value <= t.warm) return "warm";
  return "critical";
}

export function statusFromCo2(value: number, t = defaultThresholds.co2): MetricStatus {
  if (value <= t.good) return "good";
  if (value <= t.warm) return "warm";
  return "critical";
}

export function statusFromVocPpb(value: number, t = defaultThresholds.voc): MetricStatus {
  if (value <= t.good) return "good";
  if (value <= t.warm) return "warm";
  return "critical";
}

/**
 * Indoor air temperature (°C). Uses **comfort bands only** — never {@link scoreToMetricStatus},
 * which is for Awair composite score (0–100), not °C.
 */
export function statusFromTempCelsius(value: number, band = defaultThresholds.temp): MetricStatus {
  return statusFromComfortRange(value, band);
}

/** Relative humidity (%). */
export function statusFromHumidityRh(value: number, band = defaultThresholds.humid): MetricStatus {
  return statusFromComfortRange(value, band);
}

export function statusFromComfortRange(value: number, band: ComfortRangeBand): MetricStatus {
  if (value < band.warm.min || value > band.warm.max) return "critical";
  if (value >= band.good.min && value <= band.good.max) return "good";
  return "warm";
}

/** Awair score is 0–100 (higher is better). */
export function scoreLabel(score: number): "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL" {
  if (score >= 90) return "EXCELLENT";
  if (score >= 80) return "GOOD";
  if (score >= 60) return "FAIR";
  if (score >= 50) return "POOR";
  return "CRITICAL";
}

/**
 * Maps **Awair composite `score` only** (0–100 from API air-data), not temperature °C or humidity %.
 * Same three UI bands as sensor chips; aligns with weekly forecast coloring (≥80 green, ≥60 amber, else red).
 * For `temp` / `humid` sensors use {@link statusFromTempCelsius} / {@link statusFromHumidityRh}.
 */
export function scoreToMetricStatus(score: number): MetricStatus {
  if (score >= 80) return "good";
  if (score >= 60) return "warm";
  return "critical";
}

export function pickSensor(
  sensors: { comp: string; value: number }[],
  comp: string,
): number | undefined {
  const s = sensors.find((x) => x.comp === comp);
  return s?.value;
}
