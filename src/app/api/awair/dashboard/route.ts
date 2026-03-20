import { buildDashboardPayload, isAwairApiError } from "@/lib/awair/dashboard-data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await buildDashboardPayload();
    return NextResponse.json(data);
  } catch (e) {
    const status = isAwairApiError(e) ? e.status : 500;
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
