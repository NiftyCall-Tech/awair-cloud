import { SettingsForm } from "@/components/settings/SettingsForm";
import { buildSettingsPayload } from "@/lib/awair/settings-data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const initial = await buildSettingsPayload();
  return <SettingsForm initial={initial} />;
}
