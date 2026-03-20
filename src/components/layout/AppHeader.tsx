"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AppHeader({ accessGateEnabled = false }: { accessGateEnabled?: boolean }) {
  const pathname = usePathname();

  async function signOutGate() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="relative pb-10 pt-1">
      <div className="flex items-center justify-between gap-4">
        <p className="shrink-0 text-base font-bold tracking-tight text-[var(--color-on-surface)]">
          {siteConfig.brandName}
        </p>

        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 text-sm md:flex"
          aria-label="Main"
        >
          {siteConfig.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative pb-1.5 transition-colors ${
                  active
                    ? "font-semibold text-[var(--color-primary)]"
                    : "font-medium text-[var(--color-on-surface-muted)]"
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--color-primary)]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {accessGateEnabled ? (
            <button
              type="button"
              onClick={() => void signOutGate()}
              aria-label="Sign out (access gate)"
              className="rounded-full p-2 text-[var(--color-on-surface-muted)] transition-opacity hover:text-white hover:opacity-90"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.75} />
            </button>
          ) : null}
          <Link
            href="/settings"
            aria-label="Settings"
            className="rounded-full p-2 text-[var(--color-on-surface)] transition-opacity hover:opacity-80"
          >
            <Settings className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      <nav
        className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm md:hidden"
        aria-label="Main mobile"
      >
        {siteConfig.nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative pb-1 ${active ? "font-semibold text-[var(--color-primary)]" : "text-[var(--color-on-surface-muted)]"}`}
            >
              {item.label}
              {active ? (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--color-primary)]" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
