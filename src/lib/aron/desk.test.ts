import assert from "node:assert/strict";
import test from "node:test";
import { codesMatch, signDeskToken, verifyDeskToken } from "./desk-token.ts";
import { allowHitIn } from "./rate-limit.ts";
import { parseCheckout } from "./schema.ts";

test("desk token expires and rejects a different secret", () => {
  const token = signDeskToken("studio-secret", 1_000);
  assert.equal(verifyDeskToken("studio-secret", token, 1_000), true);
  assert.equal(verifyDeskToken("studio-secret", token, 1_000 + 13 * 60 * 60 * 1000), false);
  assert.equal(verifyDeskToken("other-secret", token, 1_000), false);
  assert.equal(codesMatch("studio-secret", "studio-secret"), true);
  assert.equal(codesMatch("studio-secret", "studio-secreT"), false);
  assert.equal(codesMatch("short", "studio-secret"), false);
});

test("order rate limit is five hits inside the window", () => {
  const store = new Map<string, number[]>();
  const hour = 60 * 60 * 1000;
  for (let i = 0; i < 5; i += 1) assert.equal(allowHitIn(store, "guest:1", 5, hour, 1_000 + i), true);
  assert.equal(allowHitIn(store, "guest:1", 5, hour, 2_000), false);
  assert.equal(allowHitIn(store, "guest:1", 5, hour, 1_000 + hour), true);
});

test("card text is stored as written", () => {
  const parsed = parseCheckout(
    {
      recipient: "نورة",
      phone: "0551112233",
      city: "buraidah",
      district: "الصفراء",
      landmark: "",
      date: "2026-10-20",
      slot: "evening",
      message: "سلام <b>",
      sender: "",
      payment: "cod",
      lines: [{ slug: "raml", size: "classic", addons: [], qty: 1 }],
    },
    "2026-10-16",
  );
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.data.message, "سلام <b>");
});
