"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const next =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setPending(false);
      if (!res.ok) {
        setError("Incorrect password.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setPending(false);
      setError("Request failed. Try again.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-container)] ring-1 ring-white/[0.08]">
          <Lock className="h-6 w-6 text-[var(--color-primary)]" strokeWidth={1.75} />
        </div>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-white">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--color-on-surface-muted)]">
          Enter the access password to use this deployment.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="sr-only" htmlFor="access-password">
          Password
        </label>
        <input
          id="access-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/[0.1] bg-[var(--color-surface-container-low)] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          placeholder="Password"
          required
        />
        {error ? (
          <p className="text-center text-sm text-rose-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[#0b0d0f] shadow-[0_0_24px_-4px_rgba(34,197,94,0.35)] transition hover:bg-[var(--color-primary-dim)] disabled:opacity-60"
        >
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
