import { redirect } from "next/navigation";
import { Suspense } from "react";
import { accessGatePasswordFromEnv } from "@/lib/auth-gate";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  if (!accessGatePasswordFromEnv()) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-col px-6 py-16 md:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-7xl flex-1 pt-10">
        <Suspense
          fallback={
            <div className="mx-auto max-w-sm animate-pulse rounded-xl bg-[var(--color-surface-container)] py-24 ring-1 ring-white/[0.06]" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
