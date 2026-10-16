import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { clearCart, useCartLines } from "@/lib/aron/cart";
import type { CopyKey } from "@/lib/aron/copy";
import { useLocale } from "@/lib/aron/locale";
import { Price } from "@/lib/aron/money";
import { placeOrder } from "@/lib/aron/orders-api";
import { buildCatalogReceipt, saveReceipt } from "@/lib/aron/receipts";
import {
  CITIES,
  lineKey,
  makeOrderId,
  orderTotal,
  priceLines,
  todayInRiyadh,
  type CityId,
  type PaymentId,
  type SlotId,
} from "@/lib/aron/quote";
import { parseCheckout } from "@/lib/aron/schema";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const field = "mt-1 h-12 w-full border border-ink/15 bg-foam px-3 text-base";

const CITY_KEY: Record<CityId, CopyKey> = {
  buraidah: "cityBuraidah",
  unaizah: "cityUnaizah",
  rass: "cityRass",
  riyadh: "cityRiyadh",
  jeddah: "cityJeddah",
  dammam: "cityDammam",
};

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب | زهور أرون" },
      { name: "description", content: "أكمل عنوان التسليم وموعد الطريق. لا يُطلب رقم البطاقة." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t, locale } = useLocale();
  const lines = useCartLines();
  const priced = priceLines(lines);
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState<CityId>("buraidah");
  const [district, setDistrict] = useState("");
  const [landmark, setLandmark] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<SlotId>("evening");
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("");
  const [payment, setPayment] = useState<PaymentId>("cod");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!priced || priced.lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <p>{t("emptyCart")}</p>
        <Link to="/shop" className="mt-4 inline-flex text-sm underline">
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  const total = orderTotal(priced.subtotal, city);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!priced) return;
    setError(null);
    const payload = {
      recipient,
      phone,
      city,
      district,
      landmark,
      date,
      slot,
      message,
      sender,
      payment,
      lines: priced.lines.map((line) => ({
        slug: line.slug,
        size: line.size,
        addons: line.addons,
        qty: line.qty,
      })),
    };
    const parsed = parseCheckout(payload, todayInRiyadh());
    if (!parsed.ok) {
      setError(parsed.error === "phone" ? t("phoneError") : parsed.error === "date" ? t("dateError") : t("formError"));
      return;
    }
    setPending(true);
    try {
      let id = "";
      if (user) {
        const receipt = await placeOrder({ data: parsed.data });
        saveReceipt(receipt);
        id = receipt.id;
      } else {
        id = makeOrderId();
        const receipt = buildCatalogReceipt(id, parsed.data, "device");
        if (!receipt) {
          setError(t("catalogError"));
          return;
        }
        saveReceipt(receipt);
      }
      clearCart();
      await navigate({ to: "/order/$id", params: { id } });
    } catch (caught) {
      const messageText = caught instanceof Error ? caught.message : "";
      if (messageText.includes("catalog")) setError(t("catalogError"));
      else if (messageText.includes("phone")) setError(t("phoneError"));
      else setError(t("formError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-5">
      <form onSubmit={onSubmit} className="md:col-span-3" noValidate>
        <p className="text-sm text-clay">{t("checkoutKicker")}</p>
        <h1 className="mt-2 text-3xl font-medium">{t("checkout")}</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            {t("recipient")}
            <input className={field} value={recipient} onChange={(e) => setRecipient(e.target.value)} autoComplete="name" required />
          </label>
          <label className="text-sm">
            {t("phone")}
            <input className={field} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
          </label>
          <label className="text-sm">
            {t("city")}
            <select className={field} value={city} onChange={(e) => setCity(e.target.value as CityId)}>
              {(Object.keys(CITIES) as CityId[]).map((id) => (
                <option key={id} value={id}>
                  {t(CITY_KEY[id])}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {t("district")}
            <input className={field} value={district} onChange={(e) => setDistrict(e.target.value)} placeholder={t("districtPh")} required />
          </label>
          <label className="text-sm">
            {t("date")}
            <input className={field} type="date" value={date} min={todayInRiyadh()} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="text-sm sm:col-span-2">
            {t("landmark")} <span className="text-ink/50">({t("optional")})</span>
            <input className={field} value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder={t("landmarkPh")} />
          </label>
          <fieldset className="text-sm">
            <legend>{t("slot")}</legend>
            <div className="mt-2 flex gap-2">
              {(["afternoon", "evening"] as SlotId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSlot(id)}
                  className={`h-11 px-3 ${slot === id ? "bg-leaf text-paper" : "border border-ink/15"}`}
                >
                  {t(id === "afternoon" ? "slotAfternoon" : "slotEvening")}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="text-sm sm:col-span-2">
            {t("cardMessage")} <span className="text-ink/50">({t("optional")})</span>
            <textarea
              className="mt-1 h-24 w-full border border-ink/15 bg-foam px-3 py-2"
              maxLength={180}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePh")}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            {t("sender")} <span className="text-ink/50">({t("optional")})</span>
            <input className={field} value={sender} onChange={(e) => setSender(e.target.value)} placeholder={t("senderPh")} />
          </label>
        </div>
        <fieldset className="mt-6">
          <legend className="text-sm font-medium">{t("payment")}</legend>
          <div className="mt-3 space-y-3">
            <label className="flex gap-3 border border-ink/15 p-3 text-sm">
              <input type="radio" name="pay" checked={payment === "cod"} onChange={() => setPayment("cod")} />
              <span>
                <span className="font-medium">{t("payCod")}</span>
                <span className="mt-1 block text-ink/65">{t("payCodNote")}</span>
              </span>
            </label>
            <label className="flex gap-3 border border-ink/15 p-3 text-sm">
              <input type="radio" name="pay" checked={payment === "transfer"} onChange={() => setPayment("transfer")} />
              <span>
                <span className="font-medium">{t("payTransfer")}</span>
                <span className="mt-1 block text-ink/65">{t("payTransferNote")}</span>
              </span>
            </label>
          </div>
        </fieldset>
        {error ? (
          <p className="mt-4 text-sm text-clay" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending || isPending} className="mt-6 h-12 w-full bg-leaf text-sm font-medium text-paper disabled:opacity-60 md:w-auto md:px-8">
          {pending ? t("placing") : t("placeOrder")}
        </button>
      </form>
      <aside className="h-fit border border-ink/10 bg-foam p-5 md:col-span-2">
        <h2 className="font-medium">{t("summary")}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {priced.lines.map((line) => (
            <li key={lineKey(line)} className="flex justify-between gap-3">
              <span>
                {line.product.name[locale]} × {line.qty}
              </span>
              <Price amount={line.total} locale={locale} />
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>{t("subtotal")}</dt>
            <dd><Price amount={priced.subtotal} locale={locale} /></dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("delivery")}</dt>
            <dd><Price amount={CITIES[city].fee} locale={locale} /></dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>{t("total")}</dt>
            <dd><Price amount={total} locale={locale} /></dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-ink/65">{t("deliveryNote")}</p>
      </aside>
    </div>
  );
}
