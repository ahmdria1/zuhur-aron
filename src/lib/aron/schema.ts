import { z } from "zod";
import { ADDONS, CITIES, PAYMENTS, SIZES, SLOTS, type CityId } from "./quote.ts";

const cityIds = Object.keys(CITIES) as [CityId, ...CityId[]];
const sizeIds = Object.keys(SIZES) as [keyof typeof SIZES, ...(keyof typeof SIZES)[]];
const addonIds = Object.keys(ADDONS) as [keyof typeof ADDONS, ...(keyof typeof ADDONS)[]];

export const lineSchema = z.object({
  slug: z.string().min(1).max(80),
  size: z.enum(sizeIds),
  addons: z
    .array(z.enum(addonIds))
    .transform((ids) => [...new Set(ids)])
    .pipe(z.array(z.enum(addonIds)).max(3)),
  qty: z.number().int().min(1).max(9),
});

export const checkoutSchema = z.object({
  recipient: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(9).max(16),
  city: z.enum(cityIds),
  district: z.string().trim().min(2).max(80),
  landmark: z.string().trim().max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(SLOTS),
  message: z.string().trim().max(180),
  sender: z.string().trim().max(60),
  payment: z.enum(PAYMENTS),
  lines: z.array(lineSchema).min(1).max(12),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutError = "invalid" | "phone" | "date" | "catalog";

export function normalizeSaudiMobile(input: string): string | null {
  const compact = input.replace(/[\s-]/g, "");
  if (/^05\d{8}$/.test(compact)) return compact;
  if (/^\+9665\d{8}$/.test(compact)) return `0${compact.slice(4)}`;
  if (/^9665\d{8}$/.test(compact)) return `0${compact.slice(3)}`;
  return null;
}

/** Rejects rolled-over days such as 2026-11-31, which `new Date` still accepts. */
export function isCalendarDate(iso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
}

function deliveryDateOk(date: string, today: string, city?: CityId): boolean {
  if (!isCalendarDate(date) || date < today) return false;
  if (city && date === today && !CITIES[city].sameDay) return false;
  return true;
}

export function parseCheckout(
  input: unknown,
  today: string,
): { ok: true; data: CheckoutInput } | { ok: false; error: CheckoutError } {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const phone = normalizeSaudiMobile(parsed.data.phone);
  if (!phone) return { ok: false, error: "phone" };
  if (!deliveryDateOk(parsed.data.date, today, parsed.data.city)) return { ok: false, error: "date" };
  const message = parsed.data.message.replace(/[<>]/g, "");
  return { ok: true, data: { ...parsed.data, phone, message } };
}

export const bespokeSchema = z.object({
  recipient: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(9).max(16),
  occasion: z.string().trim().min(2).max(40),
  budget: z.number().int().min(150).max(20000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().trim().min(8).max(400),
});

export function parseBespoke(
  input: unknown,
  today: string,
):
  | { ok: true; data: z.infer<typeof bespokeSchema> & { phone: string } }
  | { ok: false; error: CheckoutError } {
  const parsed = bespokeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const phone = normalizeSaudiMobile(parsed.data.phone);
  if (!phone) return { ok: false, error: "phone" };
  if (!deliveryDateOk(parsed.data.date, today)) return { ok: false, error: "date" };
  return {
    ok: true,
    data: { ...parsed.data, phone, notes: parsed.data.notes.replace(/[<>]/g, "") },
  };
}
