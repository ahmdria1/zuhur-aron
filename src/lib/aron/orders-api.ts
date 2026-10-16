import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { dictionary } from "./copy";
import { buildCatalogReceipt, type Receipt } from "./receipts";
import { makeOrderId, todayInRiyadh } from "./quote";
import { allowHit } from "./rate-limit";
import { parseBespoke, parseCheckout } from "./schema";

const HOUR = 60 * 60 * 1000;
const ORDER_LIMIT = 5;

export const DESK_STATUSES = ["new", "confirmed", "preparing", "out", "delivered", "cancelled"] as const;
export type DeskStatus = (typeof DESK_STATUSES)[number];

export type DeskRow = {
  id: string;
  status: DeskStatus;
  total: number;
  createdAt: string;
  receipt: Receipt;
};

function assertRate(key: string, limit = ORDER_LIMIT): void {
  if (!allowHit(key, limit, HOUR)) throw new Error("rate");
}

async function rateByAddress(prefix: string, limit = ORDER_LIMIT): Promise<void> {
  const { callerAddress } = await import("./caller.server");
  assertRate(`${prefix}:${callerAddress()}`, limit);
}

async function assertWrite(): Promise<void> {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
}

async function insertReceipt(receipt: Receipt, userId: string): Promise<void> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql`
    insert into orders (id, user_id, payload, total, status)
    values (${receipt.id}, ${userId}, ${JSON.stringify(receipt)}, ${receipt.total}, ${"new"})
  `;
}

function isStatus(value: string): value is DeskStatus {
  return (DESK_STATUSES as readonly string[]).includes(value);
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const parsed = parseCheckout(input, todayInRiyadh());
    if (!parsed.ok) throw new Error(parsed.error);
    return parsed.data;
  })
  .handler(async ({ data, context }): Promise<Receipt> => {
    const userId = (context as { userId: string }).userId;
    assertRate(`order:${userId}`);
    const id = makeOrderId();
    const receipt = buildCatalogReceipt(id, data, "account");
    if (!receipt) throw new Error("catalog");
    await insertReceipt(receipt, userId);
    return receipt;
  });

export const recordGuestOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = parseCheckout(input, todayInRiyadh());
    if (!parsed.ok) throw new Error(parsed.error);
    return parsed.data;
  })
  .handler(async ({ data }): Promise<Receipt> => {
    await assertWrite();
    await rateByAddress("guest");
    const receipt = buildCatalogReceipt(makeOrderId(), data, "device");
    if (!receipt) throw new Error("catalog");
    await insertReceipt(receipt, "guest");
    return receipt;
  });

export const recordBespoke = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = parseBespoke(input, todayInRiyadh());
    if (!parsed.ok) throw new Error(parsed.error);
    return parsed.data;
  })
  .handler(async ({ data }): Promise<Receipt> => {
    await assertWrite();
    await rateByAddress("bespoke");
    const receipt: Receipt = {
      id: makeOrderId(),
      kind: "bespoke",
      createdAt: new Date().toISOString(),
      total: data.budget,
      recipient: data.recipient,
      phone: data.phone,
      date: data.date,
      message: data.notes,
      lines: [
        {
          slug: "bespoke",
          nameAr: `${dictionary.ar.bespokeLine} — ${data.occasion}`,
          nameEn: `${dictionary.en.bespokeLine} — ${data.occasion}`,
          qty: 1,
          total: data.budget,
        },
      ],
      stored: "device",
    };
    await insertReceipt(receipt, "guest");
    return receipt;
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Receipt[]> => {
    const userId = (context as { userId: string }).userId;
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`
      select payload from orders
      where user_id = ${userId}
      order by created_at desc
      limit 40
    `;
    return rows.flatMap((row) => parsePayload(row.payload));
  });

function parsePayload(payload: unknown): Receipt[] {
  try {
    const raw = typeof payload === "string" ? payload : JSON.stringify(payload);
    const receipt = JSON.parse(raw) as Receipt;
    return receipt && typeof receipt.id === "string" ? [receipt] : [];
  } catch {
    return [];
  }
}

async function requireDesk(token: string): Promise<void> {
  await assertWrite();
  const { deskTokenOk } = await import("./desk-token.server");
  if (!deskTokenOk(token)) throw new Error("denied");
}

export const unlockDesk = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object" || !("code" in input)) throw new Error("denied");
    const code = (input as { code: unknown }).code;
    if (typeof code !== "string" || code.length < 8 || code.length > 80) throw new Error("denied");
    return { code };
  })
  .handler(async ({ data }) => {
    await assertWrite();
    await rateByAddress("desk", 8);
    const { deskCodeOk, issueDeskToken } = await import("./desk-token.server");
    if (!deskCodeOk(data.code)) throw new Error("denied");
    const token = issueDeskToken();
    if (!token) throw new Error("denied");
    return { token };
  });

export const listDesk = createServerFn({ method: "POST" })
  .validator((input: unknown) => readToken(input))
  .handler(async ({ data }): Promise<DeskRow[]> => {
    await requireDesk(data.token);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string; payload: string; total: number; status: string; created_at: string | Date }>`
      select id, payload, total, status, created_at from orders
      order by created_at desc
      limit 80
    `;
    return rows.flatMap((row) => {
      const receipt = parsePayload(row.payload)[0];
      if (!receipt) return [];
      const created =
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
      return [
        {
          id: row.id,
          status: isStatus(row.status) ? row.status : "new",
          total: row.total,
          createdAt: created,
          receipt,
        },
      ];
    });
  });

export const setDeskStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("denied");
    const body = input as { token?: unknown; id?: unknown; status?: unknown };
    if (typeof body.token !== "string" || typeof body.id !== "string" || typeof body.status !== "string") {
      throw new Error("denied");
    }
    if (!isStatus(body.status) || body.id.length > 40) throw new Error("denied");
    return { token: body.token, id: body.id, status: body.status };
  })
  .handler(async ({ data }) => {
    await requireDesk(data.token);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      update orders set status = ${data.status} where id = ${data.id} returning id
    `;
    if (!rows.length) throw new Error("missing");
    return { id: data.id, status: data.status };
  });

function readToken(input: unknown): { token: string } {
  if (!input || typeof input !== "object" || !("token" in input)) throw new Error("denied");
  const token = (input as { token: unknown }).token;
  if (typeof token !== "string" || token.length < 10 || token.length > 200) throw new Error("denied");
  return { token };
}
