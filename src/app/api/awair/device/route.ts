import { AwairApiError, updateDevice } from "@/lib/awair/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  deviceType: z.string().min(1),
  deviceId: z.number().int().positive(),
  name: z.string().optional(),
  roomType: z.string().optional(),
  spaceType: z.string().optional(),
  locationName: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const json: unknown = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { deviceType, deviceId, ...rest } = parsed.data;
    const payload = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined && v !== ""),
    );
    await updateDevice(deviceType, deviceId, payload);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = e instanceof AwairApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Unknown error";
    const detail = e instanceof AwairApiError ? e.body : undefined;
    return NextResponse.json(
      { error: message, ...(detail ? { detail } : {}) },
      { status },
    );
  }
}
