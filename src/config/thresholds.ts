/**
 * Editable indoor-air thresholds for status chips.
 * Imported by `src/lib/awair/metrics.ts`.
 *
 * - **PM2.5 / CO₂ / TVOC:** `good` and `warm` are **upper bounds** (µg/m³, ppm, ppb) — higher is worse.
 * - **Temperature / humidity:** **comfort ranges** — `good` is nested inside `warm` (must satisfy
 *   `warm.min ≤ good.min` and `good.max ≤ warm.max`). Outside `warm` → critical.
 */
import type { ThresholdSet } from "@/lib/awair/metrics";

export const thresholds: ThresholdSet = {
  /**
   * PM2.5 (µg/m³). Aligned with common indoor color scales: **≤35** ≈ WHO 2021 interim target IT-1 (24h)
   * and EPA daily benchmark; **≤55** as elevated before “high” outdoor-style bands.
   * PM10 / `dust` reuse this for simplicity (same units).
   */
  pm25: { good: 35, warm: 55 },

  /**
   * CO₂ (ppm). **≤~1000** is widely used as “adequate” ventilation; **≤~1500** elevated;
   * above suggests poor dilution (ASHRAE / many building guidelines cite ~1000 ppm).
   */
  co2: { good: 1000, warm: 1500 },

  /**
   * TVOC (ppb) as reported by Awair `voc`. Consumer-style bands: lower is better;
   * **3333** ppb is a common upper “elevated” order of magnitude before very high.
   */
  voc: { good: 1000, warm: 3333 },

  /**
   * °C. Indoor comfort: **good** ≈ heating-season minimum through typical cooling setpoint;
   * **warm** is still tolerable; outside **warm** is too cold or too hot.
   */
  temp: {
    good: { min: 18, max: 24 },
    warm: { min: 16, max: 28 },
  },

  /**
   * % relative humidity. **40–60%** is a common mold / comfort sweet spot; **30–70%** marginal;
   * drier or wetter risks discomfort or moisture issues.
   */
  humid: {
    good: { min: 40, max: 60 },
    warm: { min: 30, max: 70 },
  },
};
