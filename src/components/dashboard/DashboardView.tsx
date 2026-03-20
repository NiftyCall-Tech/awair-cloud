import type { DashboardPayload } from "@/lib/awair/dashboard-data";
import type { MetricStatus } from "@/lib/awair/metrics";
import { scoreToMetricStatus } from "@/lib/awair/metrics";
import { ScoreGauge } from "@/components/dashboard/ScoreGauge";
import { StatusChip } from "@/components/ui/StatusChip";
import { Sparkline } from "@/components/ui/Sparkline";
import {
  forecastDayClass,
  forecastWeekPanelClass,
  heroPanelClass,
  metricCardClass,
  metricIconClass,
  metricValueClass,
  systemActiveDotClass,
  systemActiveTextClass,
  vocActionClass,
  vocPanelClass,
} from "@/lib/ui/metric-status";
import {
  Activity,
  CalendarDays,
  Check,
  Cloud,
  Droplets,
  Gauge,
  Sun,
  Thermometer,
  TriangleAlert,
  Volume2,
  Wind,
  Zap,
} from "lucide-react";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function ForecastIcon({
  kind,
  muted,
}: {
  kind: "sun" | "cloud" | "alert";
  /** No data for that day — neutral icon. */
  muted?: boolean;
}) {
  if (muted) {
    return <Cloud className="h-7 w-7 text-[#6b7280]" strokeWidth={1.5} />;
  }
  if (kind === "sun") return <Sun className="h-7 w-7 text-[#34d399]" strokeWidth={1.5} />;
  if (kind === "cloud") return <Cloud className="h-7 w-7 text-[#f59e0b]" strokeWidth={1.5} />;
  return <TriangleAlert className="h-7 w-7 text-[#f87171]" strokeWidth={1.5} />;
}

function MetricIcon({ comp, status }: { comp: string; status?: MetricStatus }) {
  const c = comp.toLowerCase();
  const cls = `h-4 w-4 shrink-0 ${metricIconClass(status)}`;
  if (c === "temp") return <Thermometer className={cls} strokeWidth={1.5} />;
  if (c === "humid") return <Droplets className={cls} strokeWidth={1.5} />;
  if (c === "co2") return <Zap className={cls} strokeWidth={1.5} />;
  if (c === "voc") return <Activity className={cls} strokeWidth={1.5} />;
  if (c === "pm25" || c === "pm10" || c === "dust") return <Wind className={cls} strokeWidth={1.5} />;
  if (c === "lux") return <Sun className={cls} strokeWidth={1.5} />;
  if (c === "spl_a") return <Volume2 className={cls} strokeWidth={1.5} />;
  return <Gauge className={cls} strokeWidth={1.5} />;
}

export function DashboardView({ data }: { data: DashboardPayload }) {
  const vocPct = Math.min(100, (data.voc.ppb / 5000) * 100);
  const forecastWorst =
    data.forecast.length > 0
      ? Math.min(
          ...data.forecast.map((d) => (d.scoreAvg == null ? 100 : d.scoreAvg)),
        )
      : 0;
  const forecastWeekLevel = scoreToMetricStatus(forecastWorst);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-muted)]">
            Operational status
          </p>
          <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight text-white">
            Dashboard
          </h1>
        </div>
        <div className="text-right">
          <p
            className={`inline-flex items-center gap-2 text-sm font-semibold ${systemActiveTextClass(data.hero.level)}`}
          >
            <span className={`h-2 w-2 rounded-full ${systemActiveDotClass(data.hero.level)}`} />
            SYSTEM ACTIVE
          </p>
          <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-wider text-[var(--color-on-surface-muted)]">
            Last Sync: {formatTime(data.syncedAt)}
          </p>
        </div>
      </div>

      {data.demo ? (
        <p className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface-muted)]">
          Demo mode — set <code className="text-[var(--color-primary)]">AWAIR_ACCESS_TOKEN</code>{" "}
          and disable <code className="text-[var(--color-primary)]">AWAIR_DEMO_MODE</code> for live
          data.
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
        <section className={`lg:col-span-5 ${heroPanelClass(data.hero.level)}`}>
          <ScoreGauge
            awairScore={data.hero.awairScore}
            statusLabel={data.hero.statusLabel}
            fillRatio={data.hero.gaugeFill}
            epaAqiNote={data.hero.epaAqiNote}
            scoreTrend={data.hero.scoreTrend}
            level={data.hero.level}
          />
          <div className="mt-10 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-on-surface-muted)]">
                Station
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{data.device.stationLabel}</p>
              {data.device.roomType ? (
                <p className="mt-1 text-[0.65rem] text-[var(--color-on-surface-muted)]">
                  {data.device.roomType}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-on-surface-muted)]">
                Location
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {data.device.coordinates ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-on-surface-muted)]">
                Timezone
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {data.device.timezone ?? "—"}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          {data.metricCards.map((card) => (
            <div
              key={card.comp}
              className={`flex flex-col justify-between gap-4 p-5 ${metricCardClass(card.status)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{card.title}</p>
                    <MetricIcon comp={card.comp} status={card.status} />
                  </div>
                  <p className="mt-0.5 text-[0.65rem] uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                    {card.subtitle}
                  </p>
                </div>
                {card.status ? <StatusChip status={card.status} /> : null}
              </div>
              <p className={`text-2xl font-bold tracking-tight ${metricValueClass(card.status)}`}>
                {card.valueDisplay}
                {card.unit ? (
                  <span className="text-base font-medium text-[var(--color-on-surface-muted)]">
                    {" "}
                    {card.unit}
                  </span>
                ) : null}
              </p>
              <Sparkline values={card.spark} color={card.sparkColor} />
            </div>
          ))}
        </div>
      </div>

      {data.indices?.length ? (
        <section className="rounded-2xl bg-[var(--color-surface-container)] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#9ba1a6]">
              Awair indices
            </p>
            <div className="flex flex-wrap gap-2">
              {data.indices.map((i) => (
                <div
                  key={i.comp}
                  className="rounded-lg bg-[#141416] px-3 py-1.5 text-xs text-white ring-1 ring-white/[0.06]"
                >
                  <span className="text-[var(--color-on-surface-muted)]">{i.label} </span>
                  <span className="font-semibold tabular-nums">{i.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={vocPanelClass(data.voc.status)}>
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-muted)]">
                Volatile organic compounds
              </p>
              <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <span
                  className={`text-3xl font-bold tracking-tight ${metricValueClass(data.voc.status)}`}
                >
                  {Math.round(data.voc.ppb)}
                </span>
                <span className="text-base font-medium text-[var(--color-on-surface-muted)]">ppb</span>
                {data.voc.status ? <StatusChip status={data.voc.status} /> : null}
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#1a1d1f] ring-1 ring-white/[0.04]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${vocPct}%`,
                    boxShadow:
                      data.voc.status === "critical"
                        ? "0 0 12px rgba(248,113,113,0.45)"
                        : undefined,
                    background:
                      data.voc.status === "critical"
                        ? "linear-gradient(90deg, #fb7185, #f87171)"
                        : data.voc.status === "warm"
                          ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                          : "linear-gradient(90deg, #34d399, #22c55e)",
                  }}
                />
              </div>
            </div>
            <div className="min-w-0 flex-1 border-t border-white/[0.06] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-on-surface-muted)]">
                VOC detection risk
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white">{data.voc.riskMessage}</p>
              {data.voc.status === "good" ? (
                <div className="mt-4 flex items-center gap-2 text-emerald-400/95">
                  <Check className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span className="text-sm font-semibold">No action needed</span>
                </div>
              ) : (
                <div className={`mt-4 flex items-center gap-2 ${vocActionClass(data.voc.status)}`}>
                  <TriangleAlert className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold">Action recommended</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={forecastWeekPanelClass(forecastWeekLevel)}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Weekly forecast</h2>
            <CalendarDays className="h-5 w-5 text-[var(--color-on-surface-muted)]" strokeWidth={1.5} />
          </div>
          <p className="mb-4 text-[0.65rem] uppercase tracking-wider text-[#9ba1a6]">
            Daily average Awair score — last 7 calendar days (merged 15‑min + 5‑min history)
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {data.forecast.map((d, i) => (
              <div
                key={d.dateIso ? `${d.dateIso}-${i}` : `fc-${i}`}
                className={`flex flex-col items-center gap-2 px-1 py-2 text-center ${forecastDayClass(d.scoreAvg)}`}
              >
                <p className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                  {d.day}
                </p>
                <ForecastIcon kind={d.icon} muted={d.scoreAvg == null} />
                <p
                  className={`text-sm font-bold ${
                    d.scoreAvg == null
                      ? "text-[var(--color-on-surface-muted)]"
                      : d.scoreAvg >= 80
                        ? "text-[#34d399]"
                        : d.scoreAvg >= 60
                          ? "text-[#f59e0b]"
                          : "text-[#f87171]"
                  }`}
                >
                  {d.scoreAvg == null ? "—" : `${d.scoreAvg} avg`}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
