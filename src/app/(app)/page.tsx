import { DashboardView } from "@/components/dashboard/DashboardView";
import { buildDashboardPayload } from "@/lib/awair/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await buildDashboardPayload();
  return <DashboardView data={data} />;
}
