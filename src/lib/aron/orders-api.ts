import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { buildCatalogReceipt, type Receipt } from "./receipts";
import { makeOrderId, todayInRiyadh } from "./quote";
import { parseCheckout } from "./schema";

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const parsed = parseCheckout(input, todayInRiyadh());
    if (!parsed.ok) throw new Error(parsed.error);
    return parsed.data;
  })
  .handler(async ({ data, context }): Promise<Receipt> => {
    const id = makeOrderId();
    const receipt = buildCatalogReceipt(id, data, "account");
    if (!receipt) throw new Error("catalog");
    const userId = (context as { userId: string }).userId;
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into orders (id, user_id, payload, total)
      values (${receipt.id}, ${userId}, ${JSON.stringify(receipt)}, ${receipt.total})
    `;
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
    return rows.flatMap((row) => {
      try {
        const payload = typeof row.payload === "string" ? row.payload : JSON.stringify(row.payload);
        const receipt = JSON.parse(payload) as Receipt;
        return receipt && typeof receipt.id === "string" ? [receipt] : [];
      } catch {
        return [];
      }
    });
  });
