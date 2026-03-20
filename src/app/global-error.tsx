"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black font-sans text-white antialiased">
        <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl bg-[#1e1e1e] px-8 py-10 text-center ring-1 ring-white/[0.08]">
            <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-slate-400">
              Error
            </p>
            <h1 className="mt-3 text-xl font-bold">Application error</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              A critical error occurred in the root layout. You can try reloading the page.
            </p>
            {error.digest ? (
              <p className="mt-3 font-mono text-[0.65rem] text-slate-500">Ref: {error.digest}</p>
            ) : null}
            <button
              type="button"
              onClick={() => reset()}
              className="mt-8 w-full rounded-xl bg-[#22c55e] px-5 py-3 text-sm font-semibold text-[#0b0d0f]"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
