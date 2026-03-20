import { AppHeader } from "@/components/layout/AppHeader";
import { ErrorState, ErrorStateButtonLink } from "@/components/ui/ErrorState";

export default function NotFound() {
  return (
    <div className="min-h-full px-6 pb-20 pt-10 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <AppHeader />
        <ErrorState
          code="404"
          title="Page not found"
          variant="notFound"
          description={
            <>
              That URL isn’t part of this app. Double-check the path, or go back to the dashboard or
              device settings.
            </>
          }
          actions={
            <>
              <ErrorStateButtonLink href="/">Back to dashboard</ErrorStateButtonLink>
              <ErrorStateButtonLink href="/settings" variant="secondary">
                Settings
              </ErrorStateButtonLink>
            </>
          }
        />
      </div>
    </div>
  );
}
