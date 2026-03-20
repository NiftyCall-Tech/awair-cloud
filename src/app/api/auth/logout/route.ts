import { NextResponse } from "next/server";
import { ACCESS_GATE_COOKIE } from "@/lib/auth-gate";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_GATE_COOKIE, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
  return res;
}
