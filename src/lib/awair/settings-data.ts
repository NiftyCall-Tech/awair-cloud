import { getServerEnv, getAwairToken } from "@/lib/env";
import { getCachedDevices, getCachedUser } from "@/lib/awair/cached-api";
import type { AwairDevice } from "@/lib/awair/types";

export type SettingsPayload = {
  demo: boolean;
  lastSync: string;
  /** Shown as “98.2 % uptime” when set (screenshot); live API may not provide this. */
  uptimePercent: number | null;
  device: AwairDevice;
  user: {
    tier?: string | null;
    email?: string | null;
  };
  quota: { used: number; limit: number; scope: string } | null;
  /** Cloud API may omit these — UI shows placeholders. */
  connectivity: {
    wifiSsid: string | null;
    ipAddress: string | null;
    firmware: string | null;
  };
};

function resolveDevice(devices: AwairDevice[]): AwairDevice | null {
  const env = getServerEnv();
  if (env.AWAIR_DEVICE_TYPE && env.AWAIR_DEVICE_ID) {
    const id = Number(env.AWAIR_DEVICE_ID);
    return (
      devices.find((d) => d.deviceType === env.AWAIR_DEVICE_TYPE && d.deviceId === id) ?? null
    );
  }
  return devices[0] ?? null;
}

function pickString(d: AwairDevice, keys: string[]): string | null {
  const obj = d as Record<string, unknown>;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

export async function buildSettingsPayload(): Promise<SettingsPayload> {
  const env = getServerEnv();
  const token = getAwairToken();
  const demo = Boolean(env.AWAIR_DEMO_MODE && !token);

  if (demo) {
    return {
      demo: true,
      lastSync: new Date().toISOString(),
      uptimePercent: 98.2,
      device: {
        deviceId: 0,
        deviceUUID: "demo-uuid",
        deviceType: "awair-element",
        name: "Main Lobby Sensor",
        roomType: "COMMERCIAL_LOBBY",
        spaceType: "OFFICE",
        locationName: "Ground floor, near reception desk and main entrance.",
        latitude: 37.77,
        longitude: -122.42,
        timezone: "America/Los_Angeles",
        macAddress: "00:11:22:33:44:55",
      },
      user: { tier: "HOBBYIST", email: "demo@example.com" },
      quota: { used: 8421, limit: 10000, scope: "default" },
      connectivity: {
        wifiSsid: "EI_HQ_SECURE_5G",
        ipAddress: "192.168.1.144",
        firmware: "v2.4.1-alpha",
      },
    };
  }

  const user = await getCachedUser();
  const { devices = [] } = await getCachedDevices();
  const device = resolveDevice(devices);
  if (!device) {
    throw new Error("No Awair devices found for this account");
  }

  const perms = user.permissions ?? [];
  const usages = user.usages ?? [];
  const perm = perms[0];
  const usage = usages.find((u) => u.scope === perm?.scope) ?? usages[0];

  const extended = device as Record<string, unknown>;

  return {
    demo: false,
    lastSync: new Date().toISOString(),
    uptimePercent: null,
    device,
    user: { tier: user.tier, email: user.email },
    quota:
      perm && usage
        ? { used: usage.usage, limit: perm.quota, scope: perm.scope }
        : null,
    connectivity: {
      wifiSsid: pickString(device, ["wifiName", "wifiSSID", "ssid"]),
      ipAddress: pickString(device, ["ipAddr", "ip", "ipAddress"]),
      firmware:
        (typeof extended.firmwareVersion === "string" && extended.firmwareVersion) ||
        (typeof extended.fwVersion === "string" && extended.fwVersion) ||
        null,
    },
  };
}
