const KEY = "aron-desk";

export function readDeskToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writeDeskToken(token: string): void {
  window.localStorage.setItem(KEY, token);
}

export function clearDeskToken(): void {
  window.localStorage.removeItem(KEY);
}
