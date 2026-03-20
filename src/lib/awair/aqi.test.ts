import { describe, expect, it } from "vitest";
import { aqiLabel, pm25ToUsAqi } from "@/lib/awair/aqi";

describe("pm25ToUsAqi", () => {
  it("returns low AQI for clean air", () => {
    expect(pm25ToUsAqi(5)).toBeLessThanOrEqual(50);
  });
  it("returns moderate AQI for mid range", () => {
    const v = pm25ToUsAqi(25);
    expect(v).toBeGreaterThan(50);
    expect(v).toBeLessThanOrEqual(150);
  });
});

describe("aqiLabel", () => {
  it("labels bands like the dashboard hero", () => {
    expect(aqiLabel(24)).toBe("EXCELLENT");
    expect(aqiLabel(75)).toBe("GOOD");
  });
});
