import { readFileSync } from "node:fs";
import { env } from "@/lib/env.server";
import { codesMatch, signDeskToken, verifyDeskToken } from "./desk-token";

export function readDeskSecret(): string | null {
  const fromEnv = env("ARON_DESK_CODE");
  if (fromEnv) return fromEnv;
  try {
    const text = readFileSync(new URL("../../../.grok/desk-code", import.meta.url), "utf8").trim();
    return text || null;
  } catch {
    return null;
  }
}

export function issueDeskToken(): string | null {
  const secret = readDeskSecret();
  if (!secret) return null;
  return signDeskToken(secret);
}

export function deskTokenOk(token: string): boolean {
  const secret = readDeskSecret();
  if (!secret) return false;
  return verifyDeskToken(secret, token);
}

export function deskCodeOk(code: string): boolean {
  const secret = readDeskSecret();
  if (!secret) return false;
  return codesMatch(code, secret);
}
