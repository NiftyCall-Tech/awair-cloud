import { buildSettingsPayload } from "@/lib/awair/settings-data";
import { AwairApiError } from "@/lib/awair/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await buildSettingsPayload();
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof AwairApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
