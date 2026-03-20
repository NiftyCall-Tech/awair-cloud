import { requireAwairToken, getServerEnv } from "@/lib/env";
import type {
  AwairAirDataResponse,
  AwairDevicesResponse,
  AwairUserResponse,
} from "@/lib/awair/types";

export class AwairApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: string,
  ) {
    super(message);
    this.name = "AwairApiError";
  }
}

function parseAwairErrorBody(status: number, text: string): string {
  const base = `Awair API error (${status})`;
  if (!text?.trim()) return base;
  try {
    const j = JSON.parse(text) as { message?: string; error?: string; errors?: unknown };
    const m = typeof j.message === "string" ? j.message : typeof j.error === "string" ? j.error : null;
    if (m) return `${base}: ${m}`;
  } catch {
    /* not JSON */
  }
  const snippet = text.length > 200 ? `${text.slice(0, 200)}…` : text;
  return `${base}: ${snippet}`;
}

function baseUrl(): string {
  return getServerEnv().AWAIR_API_BASE_URL.replace(/\/$/, "");
}

function userSegment(): string {
  return getServerEnv().AWAIR_USER_SEGMENT;
}

export function buildUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl()}${p}`;
}

async function awairFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = requireAwairToken();
  const url = buildUrl(path);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers, cache: "no-store" });
}

export async function getUser(): Promise<AwairUserResponse> {
  const res = await awairFetch(`/${userSegment()}`);
  return parseJson<AwairUserResponse>(res);
}

export async function listDevices(): Promise<AwairDevicesResponse> {
  const res = await awairFetch(`/${userSegment()}/devices`);
  return parseJson<AwairDevicesResponse>(res);
}

export function deviceBasePath(deviceType: string, deviceId: number): string {
  return `/${userSegment()}/devices/${deviceType}/${deviceId}`;
}

export async function getAirData(
  deviceType: string,
  deviceId: number,
  kind: "latest" | "5-min-avg" | "15-min-avg" | "raw",
  query?: Record<string, string | number | boolean | undefined>,
): Promise<AwairAirDataResponse> {
  const qs = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  const path = `${deviceBasePath(deviceType, deviceId)}/air-data/${kind}${q ? `?${q}` : ""}`;
  const res = await awairFetch(path);
  return parseJson<AwairAirDataResponse>(res);
}

export type PatchDevicePayload = {
  name?: string;
  roomType?: string;
  spaceType?: string;
  locationName?: string;
};

async function readJsonOrEmpty(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Updates device metadata. Official docs may specify PATCH or PUT depending on API version;
 * we try **PATCH** first, then **PUT** on 404/405 (some deployments only expose one).
 *
 * @see https://docs.developer.getawair.com/
 */
export async function updateDevice(
  deviceType: string,
  deviceId: number,
  body: PatchDevicePayload,
): Promise<unknown> {
  const path = `${deviceBasePath(deviceType, deviceId)}`;
  const json = JSON.stringify(body);

  let res = await awairFetch(path, { method: "PATCH", body: json });

  if (res.status === 404 || res.status === 405) {
    await res.text().catch(() => undefined);
    res = await awairFetch(path, { method: "PUT", body: json });
  }

  if (!res.ok) {
    const text = await res.text();
    throw new AwairApiError(parseAwairErrorBody(res.status, text), res.status, text);
  }
  if (res.status === 204) return null;
  return readJsonOrEmpty(res);
}

/** @deprecated Use {@link updateDevice} — kept for compatibility. */
export const patchDevice = updateDevice;

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new AwairApiError(parseAwairErrorBody(res.status, text), res.status, text);
  }
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AwairApiError("Invalid JSON from Awair API", res.status, text);
  }
}
