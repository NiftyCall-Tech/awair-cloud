import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { getAwairToken } from "@/lib/env";
import { getUser, listDevices } from "@/lib/awair/client";
import type { AwairDevicesResponse, AwairUserResponse } from "@/lib/awair/types";

/** Shared TTL for user + device list — cuts duplicate Awair calls across dashboard/settings navigations. */
const USER_DEVICES_REVALIDATE_S = 300;

function tokenCacheKey(): string {
  const t = getAwairToken();
  if (!t) return "none";
  return createHash("sha256").update(t).digest("hex").slice(0, 32);
}

/** For air-data cache keys; must match the token used for user/device cache. */
export function awairTokenCacheKey(): string {
  return tokenCacheKey();
}

export async function getCachedUser(): Promise<AwairUserResponse> {
  const ck = tokenCacheKey();
  return unstable_cache(
    async () => getUser(),
    ["awair-api", "user", ck],
    { revalidate: USER_DEVICES_REVALIDATE_S },
  )();
}

export async function getCachedDevices(): Promise<AwairDevicesResponse> {
  const ck = tokenCacheKey();
  return unstable_cache(
    async () => listDevices(),
    ["awair-api", "devices", ck],
    { revalidate: USER_DEVICES_REVALIDATE_S },
  )();
}
