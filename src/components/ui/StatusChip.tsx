import type { MetricStatus } from "@/lib/awair/metrics";
import { statusBadgeClass } from "@/lib/ui/metric-status";

const defaultLabel: Record<MetricStatus, string> = {
  good: "GOOD",
  warm: "WARM",
  critical: "CRITICAL",
};

export function StatusChip({
  status,
  labelOverride,
}: {
  status: MetricStatus;
  labelOverride?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide ${statusBadgeClass[status]}`}
    >
      {labelOverride ?? defaultLabel[status]}
    </span>
  );
}
