"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SettingsPayload } from "@/lib/awair/settings-data";
import { roomTypeOptions } from "@/config/room-types";
import {
  BadgeCheck,
  Diamond,
  Hand,
  Hexagon,
  Router,
  Sun,
  TriangleAlert,
} from "lucide-react";

const UI_PREFS_KEY = "awair-cloud-display-v1";

type UiPrefs = {
  ledBrightness: number;
  knocking: boolean;
};

function loadUiPrefs(): UiPrefs {
  if (typeof window === "undefined") return { ledBrightness: 75, knocking: true };
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return { ledBrightness: 75, knocking: true };
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      ledBrightness: typeof parsed.ledBrightness === "number" ? parsed.ledBrightness : 75,
      knocking: typeof parsed.knocking === "boolean" ? parsed.knocking : true,
    };
  } catch {
    return { ledBrightness: 75, knocking: true };
  }
}

function saveUiPrefs(p: UiPrefs) {
  localStorage.setItem(UI_PREFS_KEY, JSON.stringify(p));
}

function SignalBars() {
  const heights = ["40%", "55%", "75%", "100%"];
  return (
    <div className="flex h-6 items-end gap-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm ${i < 3 ? "bg-[var(--color-primary)]" : "bg-[#3f3f46]"}`}
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SettingsPayload }) {
  const [name, setName] = useState(initial.device.name ?? "");
  const [roomType, setRoomType] = useState(initial.device.roomType ?? "OTHER");
  const [locationName, setLocationName] = useState(initial.device.locationName ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const [uiPrefs, setUiPrefs] = useState<UiPrefs>({ ledBrightness: 75, knocking: true });

  useEffect(() => {
    setUiPrefs(loadUiPrefs());
  }, []);

  const connectivity = initial.connectivity;

  async function saveCloud() {
    setStatus("saving");
    setMessage(null);
    try {
      saveUiPrefs(uiPrefs);
      if (initial.demo) {
        setStatus("saved");
        setMessage("Demo: preferences saved locally in this browser.");
        return;
      }
      const res = await fetch("/api/awair/device", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceType: initial.device.deviceType,
          deviceId: initial.device.deviceId,
          name: name || undefined,
          roomType: roomType || undefined,
          locationName: locationName || undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string; detail?: string };
        const parts = [j.error ?? `HTTP ${res.status}`];
        if (j.detail && j.detail !== j.error) parts.push(j.detail);
        throw new Error(parts.join("\n"));
      }
      setStatus("saved");
      setMessage("Device metadata saved. Display preferences stored in this browser.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Save failed");
    }
  }

  function discard() {
    setName(initial.device.name ?? "");
    setRoomType(initial.device.roomType ?? "OTHER");
    setLocationName(initial.device.locationName ?? "");
    setUiPrefs(loadUiPrefs());
    setStatus("idle");
    setMessage(null);
  }

  const quotaPct = initial.quota
    ? Math.min(100, (initial.quota.used / initial.quota.limit) * 100)
    : 0;

  const quotaLabel =
    initial.quota && initial.quota.limit >= 1000
      ? `${(initial.quota.limit / 1000).toFixed(0)}k`
      : initial.quota?.limit.toLocaleString() ?? "";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            System configuration
          </p>
          <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight text-white">Device Settings</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={discard}
            className="rounded-lg border border-[#3f3f46] bg-[#141416] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e1e1e]"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={saveCloud}
            disabled={status === "saving"}
            className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-black shadow-lg shadow-black/30 disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {initial.demo ? (
        <p className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-[var(--color-on-surface-muted)]">
          Demo mode — configure <code className="text-[var(--color-primary)]">AWAIR_ACCESS_TOKEN</code>{" "}
          for live PATCH requests.
        </p>
      ) : null}

      {message ? (
        <p
          className={`text-sm ${status === "error" ? "text-[var(--color-tertiary)]" : "text-[var(--color-primary)]"}`}
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="rounded-2xl bg-[var(--color-surface-container)] p-7 lg:col-span-7">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-[var(--color-primary)]">
              <Hexagon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h2 className="text-base font-bold text-white">Device Identity</h2>
          </div>
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                Device name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-[#2d2f33] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none ring-0 focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                Room type
              </span>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="rounded-xl border border-[#2d2f33] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-primary)]"
              >
                {roomTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                Space description
              </span>
              <textarea
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                rows={5}
                className="resize-none rounded-xl border border-[#2d2f33] bg-[#0a0a0a] px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-[var(--color-primary)]"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <section className="rounded-2xl bg-[var(--color-surface-container)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--color-primary)]">
                System status
              </h2>
              <span className="rounded-full bg-[var(--color-primary)] px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-black">
                Healthy
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {initial.uptimePercent != null ? `${initial.uptimePercent} % uptime` : "—"}
            </p>
            <p className="mt-2 text-xs text-[var(--color-on-surface-muted)]">
              Last sync:{" "}
              {new Date(initial.lastSync).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </section>

          <section className="rounded-2xl bg-[var(--color-surface-container)] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Diamond className="h-5 w-5 text-[var(--color-secondary)]" strokeWidth={1.5} />
              <h2 className="text-sm font-bold text-white">API Quota</h2>
            </div>
            {initial.quota ? (
              <>
                <div className="mb-3 flex justify-between text-xs text-[var(--color-on-surface-muted)]">
                  <span>Requests used</span>
                  <span className="font-semibold text-white">
                    {initial.quota.used.toLocaleString()} / {quotaLabel}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#2d2f33]">
                  <div
                    className="h-full rounded-full bg-[var(--color-secondary)] transition-all"
                    style={{ width: `${quotaPct}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--color-on-surface-muted)]">Quota not reported.</p>
            )}
            <Link
              href={siteConfig.upgradePlanUrl}
              className="mt-6 flex w-full items-center justify-center rounded-lg border border-[var(--color-secondary)] bg-[#141416] py-2.5 text-sm font-bold text-[var(--color-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_10%,transparent)]"
            >
              Upgrade Plan
            </Link>
          </section>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl bg-[var(--color-surface-container)] p-7">
          <div className="mb-8 flex items-center gap-3">
            <Sun className="h-6 w-6 text-[var(--color-primary)]" strokeWidth={1.75} />
            <h2 className="text-base font-bold text-white">Display Controls</h2>
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">LED Brightness</span>
                <span className="text-sm font-bold text-[var(--color-primary)]">
                  {uiPrefs.ledBrightness}%
                </span>
              </div>
              <div className="mb-2 flex justify-between text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-on-surface-muted)]">
                <span>Dim</span>
                <span>Peak</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={uiPrefs.ledBrightness}
                onChange={(e) =>
                  setUiPrefs((p) => ({ ...p, ledBrightness: Number(e.target.value) }))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#2d2f33] accent-[var(--color-primary)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-primary)]"
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#141416] p-4">
              <div className="flex gap-3">
                <Hand className="h-5 w-5 shrink-0 text-[#fda4af]" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-bold text-white">Knocking Mode</p>
                  <p className="text-xs text-[var(--color-on-surface-muted)]">
                    Wake display on physical contact
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={uiPrefs.knocking}
                onClick={() => setUiPrefs((p) => ({ ...p, knocking: !p.knocking }))}
                className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                  uiPrefs.knocking ? "bg-[var(--color-primary)]" : "bg-[#3f3f46]"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-black transition-transform ${
                    uiPrefs.knocking ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[var(--color-surface-container)] p-7">
          <div className="mb-8 flex items-center gap-3">
            <Router className="h-6 w-6 text-[var(--color-primary)]" strokeWidth={1.75} />
            <h2 className="text-base font-bold text-white">Connectivity</h2>
          </div>
          <dl className="flex flex-col gap-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-on-surface-muted)]">WiFi SSID</dt>
              <dd className="text-right font-mono text-sm text-white">{connectivity.wifiSsid ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-on-surface-muted)]">IP Address</dt>
              <dd className="text-right font-mono text-sm text-white">{connectivity.ipAddress ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-on-surface-muted)]">Firmware</dt>
              <dd className="flex items-center gap-2 font-mono text-sm text-white">
                {connectivity.firmware ?? "—"}
                {connectivity.firmware ? (
                  <BadgeCheck className="h-5 w-5 text-[var(--color-primary)]" strokeWidth={1.75} />
                ) : null}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-on-surface-muted)]">Signal Strength</dt>
              <dd>
                <SignalBars />
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl bg-[#1a1012] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <TriangleAlert className="mt-1 h-6 w-6 shrink-0 text-[#f87171]" strokeWidth={1.75} />
          <div>
            <h2 className="text-base font-bold text-white">Factory Reset</h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-on-surface-muted)]">
              Permanently clear all local sensor data and revert calibration settings to factory
              defaults.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl bg-[#fb7185] px-8 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
          onClick={() =>
            window.alert(
              "Factory reset must be completed in the Awair mobile app — the developer REST API does not expose this action.",
            )
          }
        >
          Clear All Data
        </button>
      </section>
    </div>
  );
}
