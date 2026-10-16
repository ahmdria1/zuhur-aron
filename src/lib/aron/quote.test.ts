import assert from "node:assert/strict";
import test from "node:test";
import { getProduct, products } from "./catalog.ts";
import { dictionary } from "./copy.ts";
import {
  CITIES,
  lineKey,
  lineTotal,
  orderTotal,
  priceLines,
  unitPrice,
} from "./quote.ts";
import { normalizeSaudiMobile, parseBespoke, parseCheckout } from "./schema.ts";

test("classic unit price matches the shelf price", () => {
  const rose = getProduct("ward-qirmizi");
  assert.ok(rose);
  assert.equal(unitPrice(rose.price, "classic", []), 320);
  assert.equal(unitPrice(rose.price, "petite", []), Math.round(320 * 0.82));
  assert.equal(unitPrice(rose.price, "grand", ["vase"]), Math.round(320 * 1.38) + 48);
  assert.equal(unitPrice(rose.price, "classic", ["vase", "vase", "vase"]), 320 + 48);
});

test("line total multiplies quantity and delivery is added once", () => {
  assert.equal(lineTotal(210, { size: "classic", addons: ["ribbon"], qty: 2 }), (210 + 18) * 2);
  assert.equal(orderTotal(400, "buraidah"), 425);
  assert.equal(CITIES.jeddah.sameDay, false);
});

test("unknown arrangement is rejected instead of priced at zero", () => {
  assert.equal(
    priceLines([{ slug: "missing", size: "classic", addons: [], qty: 1 }]),
    null,
  );
});

test("identical options share a cart key", () => {
  const a = lineKey({ slug: "raml", size: "petite", addons: ["ribbon", "vase"] });
  const b = lineKey({ slug: "raml", size: "petite", addons: ["vase", "ribbon"] });
  assert.equal(a, b);
});

test("saudi mobiles are normalised and anything else is refused", () => {
  assert.equal(normalizeSaudiMobile("0551234567"), "0551234567");
  assert.equal(normalizeSaudiMobile("+966551234567"), "0551234567");
  assert.equal(normalizeSaudiMobile("966551234567"), "0551234567");
  assert.equal(normalizeSaudiMobile("050123"), null);
  assert.equal(normalizeSaudiMobile("1234567890"), null);
});

test("checkout refuses a past day and a short name", () => {
  const base = {
    recipient: "نورة",
    phone: "0551112233",
    city: "buraidah",
    district: "الصفراء",
    landmark: "",
    date: "2026-10-20",
    slot: "evening",
    message: "مبروك",
    sender: "",
    payment: "cod",
    lines: [{ slug: "raml", size: "classic", addons: [], qty: 1 }],
  };
  assert.equal(parseCheckout(base, "2026-10-16").ok, true);
  assert.equal(parseCheckout({ ...base, date: "2026-10-01" }, "2026-10-16").ok, false);
  const past = parseCheckout({ ...base, date: "2026-10-01" }, "2026-10-16");
  assert.equal(past.ok, false);
  if (!past.ok) assert.equal(past.error, "date");
  const nameless = parseCheckout({ ...base, recipient: "ا" }, "2026-10-16");
  assert.equal(nameless.ok, false);
  assert.equal(parseCheckout({ ...base, date: "2026-99-99" }, "2026-10-16").ok, false);
  assert.equal(parseCheckout({ ...base, date: "2026-11-31" }, "2026-10-16").ok, false);
  assert.equal(parseCheckout({ ...base, date: "2026-10-16" }, "2026-10-16").ok, true);
  assert.equal(parseCheckout({ ...base, city: "jeddah", date: "2026-10-16" }, "2026-10-16").ok, false);
  const doubled = parseCheckout(
    { ...base, lines: [{ slug: "raml", size: "classic", addons: ["vase", "vase"], qty: 1 }] },
    "2026-10-16",
  );
  assert.equal(doubled.ok, true);
  if (doubled.ok) assert.deepEqual(doubled.data.lines[0]?.addons, ["vase"]);
});

test("bespoke brief needs a real description", () => {
  const brief = {
    recipient: "سارة",
    phone: "0550001122",
    occasion: "تخرج",
    budget: 400,
    date: "2026-11-01",
    notes: "ألوان ترابية، بدون ورد أحمر، لطاولتين.",
  };
  assert.equal(parseBespoke(brief, "2026-10-16").ok, true);
  assert.equal(parseBespoke({ ...brief, notes: "قصير" }, "2026-10-16").ok, false);
  assert.equal(parseBespoke({ ...brief, budget: 20 }, "2026-10-16").ok, false);
  assert.equal(parseBespoke({ ...brief, date: "2026-02-31" }, "2026-01-01").ok, false);
});

test("catalogue slugs and photographs are unique", () => {
  const slugs = products.map((item) => item.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const item of products) {
    assert.ok(item.price >= 150);
    assert.ok(item.image.startsWith("/flowers/"));
    assert.ok(item.name.ar.length > 1);
    assert.ok(item.name.en.length > 1);
  }
});

test("arabic and english copy cover the same keys", () => {
  assert.deepEqual(Object.keys(dictionary.ar).sort(), Object.keys(dictionary.en).sort());
  for (const value of Object.values(dictionary.ar)) assert.equal(value.includes("lorem"), false);
  for (const value of Object.values(dictionary.en)) assert.equal(value.includes("lorem"), false);
});
