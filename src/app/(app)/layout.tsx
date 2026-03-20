import { AppHeader } from "@/components/layout/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full px-6 pb-20 pt-10 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <AppHeader />
        {children}
      </div>
    </div>
  );
}
