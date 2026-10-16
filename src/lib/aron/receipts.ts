import { useSyncExternalStore } from "react";
import type { Locale } from "./catalog";
import {
  orderTotal,
  priceLines,
  type CartLine,
  type CityId,
  type PaymentId,
  type PricedLine,
  type SlotId,
} from "./quote";
import type { CheckoutInput } from "./schema";

export type ReceiptLine = {
  slug: string;
  nameAr: string;
  nameEn: string;
  qty: number;
  size?: string;
  total: number;
};

export type Receipt = {
  id: string;
  kind: "catalog" | "bespoke";
  createdAt: string;
  total: number;
  recipient: string;
  phone: string;
  city?: CityId;
  district?: string;
  date?: string;
  slot?: SlotId;
  payment?: PaymentId;
  message?: string;
  sender?: string;
  lines: ReceiptLine[];
  stored: "device" | "account";
};

const KEY = "aron-orders";
const EMPTY: Receipt[] = [];

let receipts: Receipt[] = [];
let snapshot: Receipt[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  snapshot = receipts.map((item) => ({ ...item, lines: item.lines.map((line) => ({ ...line })) }));
  if (typeof window !== "undefined" && hydrated) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch {
      /* private mode */
    }
  }
  listeners.forEach((listener) => listener());
}

function readReceipts(): Receipt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Receipt => {
      if (!item || typeof item !== "object") return false;
      const receipt = item as Partial<Receipt>;
      return typeof receipt.id === "string" && Array.isArray(receipt.lines);
    });
  } catch {
    return [];
  }
}

function pullFromDisk() {
  if (hydrated || typeof window === "undefined") return;
  receipts = readReceipts();
  snapshot = receipts.slice();
  hydrated = true;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function clientSnapshot(): Receipt[] {
  pullFromDisk();
  return snapshot;
}

export function hydrateReceipts() {
  pullFromDisk();
  listeners.forEach((listener) => listener());
}

export function restoreReceiptsIfEmpty() {
  if (typeof window === "undefined") return;
  if (!hydrated) {
    hydrateReceipts();
    return;
  }
  if (receipts.length > 0) return;
  const saved = readReceipts();
  if (saved.length === 0) return;
  receipts = saved;
  snapshot = receipts.slice();
  listeners.forEach((listener) => listener());
}

export function flushReceipts() {
  if (!hydrated || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* keep memory */
  }
}

export function useReceipts(): Receipt[] {
  return useSyncExternalStore(subscribe, clientSnapshot, () => EMPTY);
}

export function useReceiptsHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      pullFromDisk();
      return hydrated;
    },
    () => false,
  );
}

export function saveReceipt(receipt: Receipt) {
  pullFromDisk();
  receipts = [receipt, ...receipts.filter((item) => item.id !== receipt.id)].slice(0, 40);
  emit();
}

export function findReceipt(id: string): Receipt | undefined {
  return snapshot.find((item) => item.id === id);
}

function named(line: PricedLine): ReceiptLine {
  return {
    slug: line.slug,
    nameAr: line.product.name.ar,
    nameEn: line.product.name.en,
    qty: line.qty,
    size: line.size,
    total: line.total,
  };
}

export function buildCatalogReceipt(
  id: string,
  data: CheckoutInput,
  stored: Receipt["stored"],
): Receipt | null {
  const priced = priceLines(data.lines);
  if (!priced) return null;
  return {
    id,
    kind: "catalog",
    createdAt: new Date().toISOString(),
    total: orderTotal(priced.subtotal, data.city),
    recipient: data.recipient,
    phone: data.phone,
    city: data.city,
    district: data.district,
    date: data.date,
    slot: data.slot,
    payment: data.payment,
    message: data.message,
    sender: data.sender,
    lines: priced.lines.map(named),
    stored,
  };
}

export function lineTitle(line: ReceiptLine, locale: Locale): string {
  return locale === "ar" ? line.nameAr : line.nameEn;
}

export type { CartLine };
