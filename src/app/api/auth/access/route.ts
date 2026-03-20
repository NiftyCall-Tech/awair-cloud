import { NextResponse } from "next/server";
import {
  ACCESS_GATE_COOKIE,
  deriveGateToken,
  accessGatePasswordFromEnv,
  verifyGatePassword,
} from "@/lib/auth-gate";

export async function POST(req: Request) {
  const pwd = accessGatePasswordFromEnv();
  if (!pwd) {
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const submitted =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";

  if (!(await verifyGatePassword(submitted, pwd))) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await deriveGateToken(pwd);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_GATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
