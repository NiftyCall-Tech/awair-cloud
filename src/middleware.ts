import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_GATE_COOKIE,
  deriveGateToken,
  timingSafeEqualHex,
} from "@/lib/auth-gate";

export async function middleware(request: NextRequest) {
  const pwd = process.env.APP_ACCESS_PASSWORD?.trim();
  if (!pwd) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const cookie = request.cookies.get(ACCESS_GATE_COOKIE)?.value;
  const expected = await deriveGateToken(pwd);
  if (cookie && timingSafeEqualHex(cookie, expected)) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  const dest = pathname + request.nextUrl.search;
  if (dest && dest !== "/login") {
    login.searchParams.set("next", dest);
  }
  return NextResponse.redirect(login);
}

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/icon.svg" || pathname === "/icon.png") return true;
  return false;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
