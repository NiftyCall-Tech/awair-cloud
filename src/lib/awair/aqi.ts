/** US EPA AQI from PM2.5 (µg/m³), 24h-style breakpoints (NowCast uses same piecewise bands). */
export function pm25ToUsAqi(pm25: number): number {
  const c = Math.max(0, pm25);
  const bands: { hi: number; lo: number; iHi: number; iLo: number }[] = [
    { hi: 12, lo: 0, iHi: 50, iLo: 0 },
    { hi: 35.4, lo: 12.1, iHi: 100, iLo: 51 },
    { hi: 55.4, lo: 35.5, iHi: 150, iLo: 101 },
    { hi: 150.4, lo: 55.5, iHi: 200, iLo: 151 },
    { hi: 250.4, lo: 150.5, iHi: 300, iLo: 201 },
    { hi: 350.4, lo: 250.5, iHi: 400, iLo: 301 },
    { hi: 500.4, lo: 350.5, iHi: 500, iLo: 401 },
  ];
  if (c > 500.4) return 500;
  for (const b of bands) {
    if (c <= b.hi) {
      return Math.round(((b.iHi - b.iLo) / (b.hi - b.lo)) * (c - b.lo) + b.iLo);
    }
  }
  return 500;
}

export function aqiLabel(aqi: number): "EXCELLENT" | "GOOD" | "MODERATE" | "UNHEALTHY" | "CRITICAL" {
  if (aqi <= 50) return "EXCELLENT";
  if (aqi <= 100) return "GOOD";
  if (aqi <= 150) return "MODERATE";
  if (aqi <= 200) return "UNHEALTHY";
  return "CRITICAL";
}
