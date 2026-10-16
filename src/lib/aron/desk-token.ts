import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 12 * 60 * 60 * 1000;

export function codesMatch(given: string, expected: string): boolean {
  const left = Buffer.from(given);
  const right = Buffer.from(expected);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function signDeskToken(secret: string, now = Date.now()): string {
  const body = String(now + TTL_MS);
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyDeskToken(secret: string, token: string, now = Date.now()): boolean {
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(body);
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  return codesMatch(sig, expected);
}
