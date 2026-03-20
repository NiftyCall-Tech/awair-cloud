import { z } from "zod";

const serverSchema = z.object({
  AWAIR_API_BASE_URL: z.string().url().default("https://developer-apis.awair.is/v1"),
  AWAIR_USER_SEGMENT: z
    .string()
    .regex(/^(users\/self|orgs\/[0-9]+)$/)
    .default("users/self"),
  AWAIR_DEVICE_TYPE: z.string().optional(),
  AWAIR_DEVICE_ID: z
    .string()
    .regex(/^[0-9]+$/)
    .optional(),
  AWAIR_DEMO_MODE: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  /** Max points for `5-min-avg` (Awair allows up to 288 ≈ 24h). */
  AWAIR_HISTORY_5MIN_LIMIT: z.preprocess((v) => {
    if (v === undefined || v === "") return 288;
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(288, Math.max(12, Math.floor(n))) : 288;
  }, z.number().int()),
  /** Max points for `15-min-avg` (Awair allows up to 672 ≈ 7d). */
  AWAIR_HISTORY_15MIN_LIMIT: z.preprocess((v) => {
    if (v === undefined || v === "") return 672;
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(672, Math.max(24, Math.floor(n))) : 672;
  }, z.number().int()),
  /** Optional 1h raw stream (up to 360 points); uses extra quota. */
  AWAIR_FETCH_RAW_AIRDATA: z.preprocess(
    (v) => v === "true" || v === "1",
    z.boolean(),
  ),
  /**
   * Server cache for Awair **air-data** responses (seconds). Reduces duplicate calls when the
   * dashboard auto-refreshes or multiple tabs load. `0` disables. Helps avoid HTTP 429 daily limits.
   * User/devices list uses a separate 5‑min cache (not env-tunable).
   */
  AWAIR_AIRDATA_CACHE_SECONDS: z.preprocess((v) => {
    if (v === undefined || v === "") return 60;
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(3600, Math.max(0, Math.floor(n))) : 60;
  }, z.number().int()),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid server environment. See .env.example and docs/ENVIRONMENT.md");
  }
  cached = parsed.data;
  return cached;
}

/** Canonical secret: `AWAIR_ACCESS_TOKEN`; alias `AWAIR_BEARER_TOKEN` supported. */
export function getAwairToken(): string | undefined {
  return process.env.AWAIR_ACCESS_TOKEN || process.env.AWAIR_BEARER_TOKEN;
}

export function requireAwairToken(): string {
  const t = getAwairToken();
  if (!t) {
    throw new Error("Missing AWAIR_ACCESS_TOKEN (or alias AWAIR_BEARER_TOKEN)");
  }
  return t;
}
