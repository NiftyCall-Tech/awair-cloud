"use client";

import { useEffect } from "react";
import { ErrorState, ErrorStateButtonLink } from "@/components/ui/ErrorState";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const msg = error.message ?? "";
  const is429 =
    msg.includes("429") ||
    /too many requests/i.test(msg) ||
    /rate limit/i.test(msg);

  useEffect(() => {
    if (is429) console.warn("[Awair]", msg);
  }, [is429, msg]);

  if (is429) {
    return (
      <ErrorState
        code="429"
        title="Too many requests"
        variant="quota"
        description={
          <>
            The Awair API rate limit for the last 24 hours was reached. Data will load again after the
            window resets, or after you reduce how often this app calls the API.
            <span className="mt-3 block text-[0.8rem] text-[var(--color-on-surface-muted)]">
              Tip: keep <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[var(--color-primary)]">AWAIR_FETCH_RAW_AIRDATA</code> off, avoid many tabs or rapid reloads, and consider raising{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[var(--color-primary)]">AWAIR_AIRDATA_CACHE_SECONDS</code>. See{" "}
              <a
                className="font-medium text-[var(--color-primary)] underline underline-offset-2"
                href="https://developer.getawair.com/"
                target="_blank"
                rel="noreferrer"
              >
                developer.getawair.com
              </a>{" "}
              for quota and plans.
            </span>
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[#0b0d0f] shadow-[0_0_24px_-4px_rgba(34,197,94,0.45)] transition hover:bg-[var(--color-primary-dim)]"
            >
              Try again
            </button>
            <ErrorStateButtonLink href="/" variant="secondary">
              Back to dashboard
            </ErrorStateButtonLink>
          </>
        }
      />
    );
  }

  return (
    <ErrorState
      code="Error"
      title="Something went wrong"
      description={
        <>
          {msg ? (
            <span className="font-mono text-xs text-white/90">{msg}</span>
          ) : (
            "An unexpected error occurred while loading this page."
          )}
          {error.digest ? (
            <span className="mt-2 block font-mono text-[0.65rem] text-[var(--color-on-surface-muted)]">
              Ref: {error.digest}
            </span>
          ) : null}
        </>
      }
      actions={
        <>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[#0b0d0f] shadow-[0_0_24px_-4px_rgba(34,197,94,0.45)] transition hover:bg-[var(--color-primary-dim)]"
          >
            Try again
          </button>
          <ErrorStateButtonLink href="/" variant="secondary">
            Back to dashboard
          </ErrorStateButtonLink>
        </>
      }
    />
  );
}
