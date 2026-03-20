import { describe, expect, it } from "vitest";
import {
  scoreLabel,
  scoreToMetricStatus,
  statusFromCo2,
  statusFromHumidityRh,
  statusFromPm25,
  statusFromTempCelsius,
  statusFromVocPpb,
} from "@/lib/awair/metrics";

describe("scoreLabel", () => {
  it("maps Awair score bands", () => {
    expect(scoreLabel(95)).toBe("EXCELLENT");
    expect(scoreLabel(85)).toBe("GOOD");
    expect(scoreLabel(70)).toBe("FAIR");
    expect(scoreLabel(55)).toBe("POOR");
    expect(scoreLabel(40)).toBe("CRITICAL");
  });
});

describe("scoreToMetricStatus", () => {
  it("maps composite score to UI bands (aligned with forecast colors)", () => {
    expect(scoreToMetricStatus(90)).toBe("good");
    expect(scoreToMetricStatus(80)).toBe("good");
    expect(scoreToMetricStatus(79)).toBe("warm");
    expect(scoreToMetricStatus(60)).toBe("warm");
    expect(scoreToMetricStatus(59)).toBe("critical");
  });
});

describe("statusFromPm25", () => {
  it("classifies PM2.5 µg/m³", () => {
    expect(statusFromPm25(10)).toBe("good");
    expect(statusFromPm25(40)).toBe("warm");
    expect(statusFromPm25(90)).toBe("critical");
  });
});

describe("statusFromCo2", () => {
  it("classifies CO₂ ppm", () => {
    expect(statusFromCo2(600)).toBe("good");
    expect(statusFromCo2(1200)).toBe("warm");
    expect(statusFromCo2(2000)).toBe("critical");
  });
});

describe("statusFromVocPpb", () => {
  it("classifies TVOC ppb", () => {
    expect(statusFromVocPpb(500)).toBe("good");
    expect(statusFromVocPpb(2000)).toBe("warm");
    expect(statusFromVocPpb(4000)).toBe("critical");
  });
});

describe("statusFromTempCelsius", () => {
  it("uses comfort bands only (not scoreToMetricStatus / Awair 0–100)", () => {
    expect(statusFromTempCelsius(22)).toBe("good");
    expect(statusFromTempCelsius(19)).toBe("good");
    expect(statusFromTempCelsius(17)).toBe("warm");
    expect(statusFromTempCelsius(25)).toBe("warm");
    expect(statusFromTempCelsius(27)).toBe("warm");
    expect(statusFromTempCelsius(15)).toBe("critical");
    expect(statusFromTempCelsius(29)).toBe("critical");
  });
});

describe("statusFromHumidityRh", () => {
  it("uses comfort bands (not monotonic)", () => {
    expect(statusFromHumidityRh(50)).toBe("good");
    expect(statusFromHumidityRh(35)).toBe("warm");
    expect(statusFromHumidityRh(65)).toBe("warm");
    expect(statusFromHumidityRh(25)).toBe("critical");
    expect(statusFromHumidityRh(75)).toBe("critical");
  });
});
