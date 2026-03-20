import type { AwairAirDataRow } from "@/lib/awair/types";

/** Deterministic demo payload when `AWAIR_DEMO_MODE=true` and no token is set. */
export function demoLatestRow(): AwairAirDataRow {
  const ts = new Date().toISOString();
  return {
    timestamp: ts,
    score: 92,
    sensors: [
      { comp: "temp", value: 22.5 },
      { comp: "humid", value: 48 },
      { comp: "co2", value: 412 },
      { comp: "voc", value: 1240 },
      { comp: "pm25", value: 12.4 },
      { comp: "lux", value: 320 },
    ],
    indices: [
      { comp: "temp", value: 0.2 },
      { comp: "humid", value: -0.1 },
      { comp: "co2", value: 0.4 },
      { comp: "voc", value: 2.8 },
      { comp: "pm25", value: 0.1 },
    ],
  };
}

export function demoSparkline(base: number, variance = 3, points = 24): number[] {
  return Array.from({ length: points }, (_, i) => {
    const wobble = Math.sin(i * 0.7) * variance;
    return Math.round((base + wobble) * 10) / 10;
  });
}
