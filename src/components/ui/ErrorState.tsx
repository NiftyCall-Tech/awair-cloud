import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "default" | "quota" | "notFound";

const variantRing: Record<Variant, string> = {
  default: "ring-white/[0.08]",
  quota: "ring-amber-500/25",
  notFound: "ring-white/[0.08]",
};

const variantGlow: Record<Variant, string> = {
  default: "from-emerald-500/12 via-transparent to-transparent",
  quota: "from-amber-500/15 via-transparent to-transparent",
  notFound: "from-slate-500/10 via-transparent to-transparent",
};

export function ErrorState(props: {
  code: string;
  title: string;
  description: ReactNode;
  variant?: Variant;
  /** e.g. Try again (client error boundary) */
  actions?: ReactNode;
}) {
  const { code, title, description, variant = "default", actions } = props;
  const v = variant;

  return (
    <div className="flex min-h-[min(70vh,560px)] flex-col items-center justify-center py-12">
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl bg-[var(--color-surface-container)] px-8 py-10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] ring-1 ${variantRing[v]}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${variantGlow[v]} opacity-90`}
          aria-hidden
        />
        <div className="relative text-center">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[var(--color-on-surface-muted)]">
            {code}
          </p>
          <h1 className="mt-3 text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h1>
          <div className="mt-4 text-sm leading-relaxed text-[var(--color-on-surface-muted)]">
            {description}
          </div>
          {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function ErrorStateButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-[var(--color-surface-container-low)] px-5 text-sm font-semibold text-white transition hover:border-white/[0.2] hover:bg-white/[0.04]"
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[#0b0d0f] shadow-[0_0_24px_-4px_rgba(34,197,94,0.45)] transition hover:bg-[var(--color-primary-dim)]"
    >
      {children}
    </Link>
  );
}
