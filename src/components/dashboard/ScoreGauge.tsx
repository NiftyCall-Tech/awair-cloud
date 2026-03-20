"use client";

import { useId } from "react";
import type { MetricStatus } from "@/lib/awair/metrics";
import { Sparkline } from "@/components/ui/Sparkline";
import {
  GAUGE_GRADIENT_STOPS,
  STATUS_HEX,
  heroScoreClass,
  statusBadgeClass,
} from "@/lib/ui/metric-status";

/** Fixed precision so SSR and browser produce identical `d` strings (avoids hydration mismatch). */
function q(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}

function buildUpperSemicirclePath(cx: number, cy: number, r: number): string {
  const n = 56;
  const parts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.PI * (1 - i / n);
    const x = q(cx + r * Math.cos(t));
    const y = q(cy - r * Math.sin(t));
    parts.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
  }
  return parts.join(" ");
}

/**
 * Primary value: **Awair score** (0–100) from API `air-data` `score`.
 * Arc fill = score ÷ 100. Optional line explains US EPA AQI from PM2.5 (computed locally).
 */
export function ScoreGauge({
  awairScore,
  statusLabel,
  fillRatio,
  epaAqiNote,
  scoreTrend,
  level,
}: {
  awairScore: number;
  statusLabel: string;
  fillRatio: number;
  epaAqiNote: string;
  /** Oldest → newest; empty hides the mini trend. */
  scoreTrend?: number[];
  /** Composite score band — drives gauge gradient and badge colors. */
  level: MetricStatus;
}) {
  const uid = useId();
  const gradId = `gaugeArcGrad-${uid.replace(/:/g, "")}`;
  const stops = GAUGE_GRADIENT_STOPS[level];
  const trendColor = STATUS_HEX[level];

  const w = 240;
  const h = 128;
  const cx = w / 2;
  const cy = 100;
  const r = 72;
  const stroke = 14;

  const arcPath = buildUpperSemicirclePath(cx, cy, r);
  const pct = Math.min(1, Math.max(0, fillRatio));
  const PL = 1000;
  const dashLen = Math.round(pct * PL);

  return (
    <div className="mx-auto flex w-full max-w-[280px] flex-col items-center">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-[260px]"
        style={{ height: h }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={stops.a} />
            <stop offset="50%" stopColor={stops.b} />
            <stop offset="100%" stopColor={stops.c} />
          </linearGradient>
        </defs>
        <path
          d={arcPath}
          fill="none"
          pathLength={PL}
          stroke="#2a2d32"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={arcPath}
          fill="none"
          pathLength={PL}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${dashLen} ${PL}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>

      <div className="-mt-1 flex max-w-[260px] flex-col items-center text-center">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#9ba1a6]">
          Awair score
        </p>
        <p
          className={`mt-1 text-[3.25rem] font-semibold leading-none tracking-tight transition-colors ${heroScoreClass(level)}`}
        >
          {Math.round(awairScore)}
        </p>
        <span
          className={`mt-2.5 rounded-full px-4 py-1 text-[0.7rem] font-bold uppercase tracking-wider ${statusBadgeClass[level]}`}
        >
          {statusLabel}
        </span>
        <p className="mt-3 px-2 text-[0.65rem] leading-snug text-[#9ba1a6]">{epaAqiNote}</p>
        <div className="mt-5 w-full max-w-[220px]">
          <p className="mb-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#9ba1a6]">
            Score history
          </p>
          <Sparkline values={scoreTrend ?? []} color={trendColor} height={40} />
        </div>
      </div>
    </div>
  );
}
