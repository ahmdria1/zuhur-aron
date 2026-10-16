import { useSyncExternalStore } from "react";
import { lineKey, type AddonId, type CartLine, type SizeId } from "./quote";

const KEY = "aron-cart";
const EMPTY: CartLine[] = [];
const SIZES = new Set<SizeId>(["petite", "classic", "grand"]);
const ADDON_IDS = new Set<AddonId>(["vase", "dates", "ribbon"]);

let lines: CartLine[] = [];
let snapshot: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function remember(next: CartLine[]) {
  lines = next;
  snapshot = next.map((line) => ({ ...line, addons: [...line.addons] }));
}

function notify() {
  listeners.forEach((listener) => listener());
}

function writeCart() {
  if (typeof window === "undefined" || !hydrated) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* private mode or a full disk — keep the in-memory bag */
  }
}

function sanitize(value: unknown): CartLine | null {
  if (!value || typeof value !== "object") return null;
  const line = value as Partial<CartLine>;
  if (typeof line.slug !== "string" || line.slug.length === 0 || line.slug.length > 80) return null;
  if (!SIZES.has(line.size as SizeId)) return null;
  const qty = Math.floor(Number(line.qty));
  if (!Number.isFinite(qty) || qty < 1) return null;
  const addons = Array.isArray(line.addons)
    ? [...new Set(line.addons.filter((id): id is AddonId => ADDON_IDS.has(id as AddonId)))]
    : [];
  return { slug: line.slug, size: line.size as SizeId, addons, qty: Math.min(9, qty) };
}

function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitize).filter((line): line is CartLine => line !== null);
  } catch {
    return [];
  }
}

function pullFromDisk() {
  if (hydrated || typeof window === "undefined") return;
  remember(readCart());
  hydrated = true;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function clientSnapshot(): CartLine[] {
  pullFromDisk();
  return snapshot;
}

export function hydrateCart() {
  pullFromDisk();
  notify();
}

/** After the page is shown again, recover a bag that memory lost but the device still has. */
export function restoreCartIfEmpty() {
  if (typeof window === "undefined") return;
  if (!hydrated) {
    hydrateCart();
    return;
  }
  if (lines.length > 0) return;
  const saved = readCart();
  if (saved.length === 0) return;
  remember(saved);
  notify();
}

export function flushCart() {
  writeCart();
}

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(subscribe, clientSnapshot, () => EMPTY);
}

export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      pullFromDisk();
      return hydrated;
    },
    () => false,
  );
}

function emit() {
  remember(lines);
  writeCart();
  notify();
}

export function addLine(line: CartLine) {
  pullFromDisk();
  const clean = sanitize(line);
  if (!clean) return;
  const key = lineKey(clean);
  const existing = lines.find((item) => lineKey(item) === key);
  if (existing) {
    existing.qty = Math.min(9, existing.qty + clean.qty);
    lines = [...lines];
  } else {
    lines = [...lines, clean];
  }
  emit();
}

export function setQty(key: string, qty: number) {
  pullFromDisk();
  lines = lines
    .map((line) => (lineKey(line) === key ? { ...line, qty } : line))
    .filter((line) => line.qty > 0);
  emit();
}

export function removeLine(key: string) {
  pullFromDisk();
  lines = lines.filter((line) => lineKey(line) !== key);
  emit();
}

export function clearCart() {
  pullFromDisk();
  lines = [];
  emit();
}

export function countLines(items: CartLine[]): number {
  return items.reduce((sum, line) => sum + line.qty, 0);
}

let drawer = false;

export function useCartOpen(): boolean {
  return useSyncExternalStore(subscribe, () => drawer, () => false);
}

export function setCartOpen(next: boolean) {
  drawer = next;
  notify();
}
