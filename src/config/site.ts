/**
 * Product surface copy & navigation — change here instead of scattered components.
 * @see docs/CUSTOMIZATION.md
 */
export const siteConfig = {
  brandName: "Indoor Air Quality",
  tagline: "Live readings and trends from your Awair device",
  nav: [
    { href: "/", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
  ] as const,
  /**
   * VOC panel copy — chosen from TVOC thresholds in `src/config/thresholds.ts` (good / warm / critical).
   * The API does not send prose; this is display-only.
   */
  vocRiskMessages: {
    good: "TVOC is within normal range for typical indoor spaces.",
    warm: "Moderate VOC levels. Consider ventilation or reducing sources.",
    critical:
      "Elevated VOC levels detected. Consider ventilation or source inspection.",
  } as const,
  /** Optional link for “Upgrade plan” CTA (billing is outside this OSS app). */
  upgradePlanUrl: "https://developer.getawair.com/",
} as const;

export type SiteConfig = typeof siteConfig;
