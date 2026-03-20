/**
 * Optional app-level password gate (`APP_ACCESS_PASSWORD`).
 * Cookie holds a SHA-256 digest — not the raw password.
 */

export const ACCESS_GATE_COOKIE = "awair_cloud_gate";

export async function deriveGateToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`awair-cloud|gate|v1|${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(new Uint8Array(buf));
}

function bufferToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time compare for equal-length hex strings. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyGatePassword(submitted: string, expectedFromEnv: string): Promise<boolean> {
  const [left, right] = await Promise.all([
    deriveGateToken(submitted),
    deriveGateToken(expectedFromEnv),
  ]);
  return timingSafeEqualHex(left, right);
}

export function accessGatePasswordFromEnv(): string | undefined {
  const p = process.env.APP_ACCESS_PASSWORD?.trim();
  return p || undefined;
}
