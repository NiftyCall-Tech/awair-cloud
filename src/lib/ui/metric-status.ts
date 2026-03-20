import type { MetricStatus } from "@/lib/awair/metrics";

/** Hex accents for SVG sparklines and gauge fills. */
export const STATUS_HEX: Record<MetricStatus, string> = {
  good: "#34d399",
  warm: "#f59e0b",
  critical: "#f87171",
};

/** Gauge arc gradient stops (left → right). */
export const GAUGE_GRADIENT_STOPS: Record<
  MetricStatus,
  { a: string; b: string; c: string }
> = {
  good: { a: "#15803d", b: "#34d399", c: "#4ade80" },
  warm: { a: "#b45309", b: "#f59e0b", c: "#fbbf24" },
  critical: { a: "#b91c1c", b: "#f87171", c: "#fb7185" },
};

/** Badge / pill behind status text (matches StatusChip semantics). */
export const statusBadgeClass: Record<MetricStatus, string> = {
  good: "bg-[rgba(52,211,153,0.18)] text-[#34d399]",
  warm: "bg-[rgba(245,158,11,0.18)] text-[#f59e0b]",
  critical: "bg-[rgba(248,113,113,0.18)] text-[#f87171]",
};

/** Card surfaces: ring + subtle tint (threshold-based readings). */
export function metricCardClass(status: MetricStatus | undefined): string {
  if (!status) {
    return "rounded-2xl ring-1 ring-white/[0.08] bg-[var(--color-surface-container)]";
  }
  if (status === "good") {
    return "rounded-2xl ring-1 ring-emerald-500/40 bg-[linear-gradient(165deg,rgba(16,185,129,0.09)_0%,var(--color-surface-container)_52%)]";
  }
  if (status === "warm") {
    return "rounded-2xl ring-1 ring-amber-500/45 bg-[linear-gradient(165deg,rgba(245,158,11,0.1)_0%,var(--color-surface-container)_52%)]";
  }
  return "rounded-2xl ring-1 ring-rose-500/45 bg-[linear-gradient(165deg,rgba(244,63,94,0.11)_0%,var(--color-surface-container)_52%)]";
}

/** Hero / large panel (gauge column). */
export function heroPanelClass(level: MetricStatus): string {
  if (level === "good") {
    return "rounded-2xl ring-1 ring-emerald-500/30 bg-[linear-gradient(180deg,rgba(16,185,129,0.06)_0%,var(--color-surface-container)_45%)] p-7";
  }
  if (level === "warm") {
    return "rounded-2xl ring-1 ring-amber-500/35 bg-[linear-gradient(180deg,rgba(245,158,11,0.07)_0%,var(--color-surface-container)_45%)] p-7";
  }
  return "rounded-2xl ring-1 ring-rose-500/35 bg-[linear-gradient(180deg,rgba(244,63,94,0.08)_0%,var(--color-surface-container)_45%)] p-7";
}

/** Primary numeric value on metric cards. */
export function metricValueClass(status: MetricStatus | undefined): string {
  if (!status) return "text-white";
  if (status === "good") return "text-emerald-400";
  if (status === "warm") return "text-amber-400";
  return "text-rose-400";
}

/** Icon next to card title. */
export function metricIconClass(status: MetricStatus | undefined): string {
  if (!status) return "text-[var(--color-on-surface-muted)]";
  if (status === "good") return "text-emerald-400/90";
  if (status === "warm") return "text-amber-400/90";
  return "text-rose-400/90";
}

/** VOC panel: full card border. */
export function vocPanelClass(status: MetricStatus): string {
  if (status === "good") {
    return "rounded-2xl ring-1 ring-emerald-500/35 bg-[linear-gradient(135deg,rgba(16,185,129,0.06)_0%,var(--color-surface-container)_50%)] p-6";
  }
  if (status === "warm") {
    return "rounded-2xl ring-1 ring-amber-500/40 bg-[linear-gradient(135deg,rgba(245,158,11,0.08)_0%,var(--color-surface-container)_50%)] p-6";
  }
  return "rounded-2xl ring-1 ring-rose-500/40 bg-[linear-gradient(135deg,rgba(244,63,94,0.09)_0%,var(--color-surface-container)_50%)] p-6";
}

/** Forecast day cell background. */
export function forecastDayClass(scoreAvg: number | null): string {
  if (scoreAvg == null) return "rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]";
  if (scoreAvg >= 80) return "rounded-xl bg-emerald-500/[0.07] ring-1 ring-emerald-500/20";
  if (scoreAvg >= 60) return "rounded-xl bg-amber-500/[0.08] ring-1 ring-amber-500/25";
  return "rounded-xl bg-rose-500/[0.08] ring-1 ring-rose-500/25";
}

/** VOC “action recommended” row. */
export function vocActionClass(status: MetricStatus): string {
  if (status === "good") return "text-emerald-400";
  if (status === "warm") return "text-amber-400";
  return "text-rose-400";
}

/** Large hero score number (slight tint by level). */
export function heroScoreClass(level: MetricStatus): string {
  if (level === "good") return "text-white";
  if (level === "warm") return "text-amber-400";
  return "text-rose-400";
}

/** Weekly forecast card — tinted by **worst** day’s score band. */
export function forecastWeekPanelClass(level: MetricStatus): string {
  if (level === "good") {
    return "rounded-2xl ring-1 ring-emerald-500/28 bg-[linear-gradient(145deg,rgba(16,185,129,0.06)_0%,var(--color-surface-container)_42%)] p-6";
  }
  if (level === "warm") {
    return "rounded-2xl ring-1 ring-amber-500/32 bg-[linear-gradient(145deg,rgba(245,158,11,0.07)_0%,var(--color-surface-container)_42%)] p-6";
  }
  return "rounded-2xl ring-1 ring-rose-500/32 bg-[linear-gradient(145deg,rgba(244,63,94,0.08)_0%,var(--color-surface-container)_42%)] p-6";
}

/** Header “system active” indicator by overall air score. */
export function systemActiveDotClass(level: MetricStatus): string {
  if (level === "good") return "bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.85)]";
  if (level === "warm") return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.75)]";
  return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]";
}

export function systemActiveTextClass(level: MetricStatus): string {
  if (level === "good") return "text-[#22c55e]";
  if (level === "warm") return "text-amber-400";
  return "text-rose-400";
}
