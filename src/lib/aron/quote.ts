import { getProduct, type Product } from "./catalog.ts";

export const SIZES = {
  petite: { factor: 0.82 },
  classic: { factor: 1 },
  grand: { factor: 1.38 },
} as const;

export type SizeId = keyof typeof SIZES;

export const ADDONS = {
  vase: { price: 48 },
  dates: { price: 55 },
  ribbon: { price: 18 },
} as const;

export type AddonId = keyof typeof ADDONS;

export const CITIES = {
  buraidah: { fee: 25, sameDay: true },
  unaizah: { fee: 35, sameDay: true },
  rass: { fee: 45, sameDay: true },
  riyadh: { fee: 70, sameDay: false },
  jeddah: { fee: 90, sameDay: false },
  dammam: { fee: 80, sameDay: false },
} as const;

export type CityId = keyof typeof CITIES;

export const SLOTS = ["afternoon", "evening"] as const;
export type SlotId = (typeof SLOTS)[number];

export const PAYMENTS = ["cod", "transfer"] as const;
export type PaymentId = (typeof PAYMENTS)[number];

export type CartLine = {
  slug: string;
  size: SizeId;
  addons: AddonId[];
  qty: number;
};

export function lineKey(line: Pick<CartLine, "slug" | "size" | "addons">): string {
  return `${line.slug}|${line.size}|${[...line.addons].sort().join(",")}`;
}

export function unitPrice(base: number, size: SizeId, addons: AddonId[]): number {
  const sized = Math.round(base * SIZES[size].factor);
  const extra = [...new Set(addons)].reduce((sum, id) => sum + ADDONS[id].price, 0);
  return sized + extra;
}

export function lineTotal(base: number, line: Pick<CartLine, "size" | "addons" | "qty">): number {
  return unitPrice(base, line.size, line.addons) * line.qty;
}

export type PricedLine = CartLine & {
  product: Product;
  unit: number;
  total: number;
};

export function priceLines(lines: CartLine[]): { lines: PricedLine[]; subtotal: number } | null {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug);
    if (!product) return null;
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 9) return null;
    const unit = unitPrice(product.price, line.size, line.addons);
    priced.push({ ...line, product, unit, total: unit * line.qty });
  }
  const subtotal = priced.reduce((sum, line) => sum + line.total, 0);
  return { lines: priced, subtotal };
}

export function orderTotal(subtotal: number, city: CityId): number {
  return subtotal + CITIES[city].fee;
}

export function todayInRiyadh(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function makeOrderId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `AR-${body}`;
}
