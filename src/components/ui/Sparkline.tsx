"use client";

import { useId } from "react";

/**
 * Smooth monotone-style sparkline (Catmull-Rom → cubic beziers) + soft area fill.
 */

type Props = {
  values: number[];
  color: string;
  height?: number;
};

/** Stable SVG coords across SSR / client (avoids hydration mismatch on path `d`). */
function q(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}

function catmullRomToBezierPath(points: { x: number; y: number }[]): string {
  if (points.length < 1) return "";
  if (points.length === 1) {
    const p = points[0];
    const x = q(p.x);
    const y = q(p.y);
    return `M ${x} ${y} L ${x} ${y}`;
  }
  if (points.length === 2) {
    return `M ${q(points[0].x)} ${q(points[0].y)} L ${q(points[1].x)} ${q(points[1].y)}`;
  }

  let d = `M ${q(points[0].x)} ${q(points[0].y)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = q(p1.x + (p2.x - p0.x) / 6);
    const cp1y = q(p1.y + (p2.y - p0.y) / 6);
    const cp2x = q(p2.x - (p3.x - p1.x) / 6);
    const cp2y = q(p2.y - (p3.y - p1.y) / 6);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${q(p2.x)} ${q(p2.y)}`;
  }

  return d;
}

export function Sparkline({ values, color, height = 44 }: Props) {
  const uid = useId().replace(/:/g, "");
  const w = 200;
  const h = height;
  const padY = 6;
  const padX = 2;
  const gradId = `spark-fill-${uid}`;

  if (!values.length) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-lg border border-white/[0.06] bg-[#0a0a0a]/80 px-2 py-2 text-center text-[0.6rem] leading-snug text-[var(--color-on-surface-muted)]"
        style={{ minHeight: h + 8 }}
        title="Awair returned no rows for this series (new device, offline, missing sensor on history, or API limits)."
      >
        No 5‑min history
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const pts = values.map((v, i) => ({
    x: padX + (i / Math.max(values.length - 1, 1)) * (w - padX * 2),
    y: padY + (1 - (v - min) / span) * (h - padY * 2),
  }));

  const linePath = catmullRomToBezierPath(pts);
  const areaPath =
    linePath && pts.length > 0
      ? `${linePath} L ${q(pts[pts.length - 1].x)} ${h} L ${q(pts[0].x)} ${h} Z`
      : "";

  return (
    <div className="w-full rounded-lg bg-[#0a0a0a]/90 px-1 py-1.5">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ height: h }}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {areaPath ? <path d={areaPath} fill={`url(#${gradId})`} /> : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
    </div>
  );
}
