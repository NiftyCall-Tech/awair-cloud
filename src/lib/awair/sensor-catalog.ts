import type { MetricStatus } from "@/lib/awair/metrics";
import {
  statusFromCo2,
  statusFromHumidityRh,
  statusFromPm25,
  statusFromTempCelsius,
  statusFromVocPpb,
} from "@/lib/awair/metrics";

/** Awair `comp` keys from air-data `sensors[]` — see https://docs.developer.getawair.com/ */
export type SensorComp =
  | "temp"
  | "humid"
  | "co2"
  | "voc"
  | "pm25"
  | "pm10"
  | "dust"
  | "lux"
  | "spl_a";

type Def = {
  title: string;
  subtitle: string;
  unit: string;
  decimals: number;
  status?: (v: number) => MetricStatus;
};

const defs: Record<string, Def> = {
  pm25: {
    title: "PM2.5",
    subtitle: "Particulate matter",
    unit: "μg/m³",
    decimals: 1,
    status: statusFromPm25,
  },
  pm10: {
    title: "PM10",
    subtitle: "Particulate matter",
    unit: "μg/m³",
    decimals: 1,
    status: statusFromPm25,
  },
  dust: {
    title: "Dust",
    subtitle: "Aggregate dust (legacy)",
    unit: "μg/m³",
    decimals: 1,
    status: statusFromPm25,
  },
  co2: {
    title: "CO₂",
    subtitle: "Carbon dioxide",
    unit: "ppm",
    decimals: 0,
    status: statusFromCo2,
  },
  voc: {
    title: "VOC",
    subtitle: "Total volatile organic compounds",
    unit: "ppb",
    decimals: 0,
    status: statusFromVocPpb,
  },
  temp: {
    title: "Temperature",
    subtitle: "Ambient air",
    unit: "°C",
    decimals: 1,
    status: statusFromTempCelsius,
  },
  humid: {
    title: "Humidity",
    subtitle: "Relative humidity",
    unit: "% RH",
    decimals: 0,
    status: statusFromHumidityRh,
  },
  lux: {
    title: "Illuminance",
    subtitle: "Ambient light",
    unit: "lux",
    decimals: 0,
  },
  spl_a: {
    title: "Sound",
    subtitle: "Sound pressure (A-weighted)",
    unit: "dBA",
    decimals: 1,
  },
};

/** Preferred card order (then any unknown comps). */
export const SENSOR_CARD_ORDER: string[] = [
  "pm25",
  "pm10",
  "dust",
  "voc",
  "co2",
  "temp",
  "humid",
  "lux",
  "spl_a",
];

export function getSensorDef(comp: string): Def {
  return (
    defs[comp] ?? {
      title: comp.replace(/_/g, " ").toUpperCase(),
      subtitle: "Sensor",
      unit: "",
      decimals: 2,
    }
  );
}

export function formatSensorValue(comp: string, value: number): string {
  const d = getSensorDef(comp);
  if (d.decimals === 0) return String(Math.round(value));
  return value.toFixed(d.decimals);
}

export function statusForSensor(comp: string, value: number): MetricStatus | undefined {
  const d = defs[comp];
  return d?.status?.(value);
}
