import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { fieldClass } from "@/lib/aron/labels";
import { useLocale } from "@/lib/aron/locale";
import { recordBespoke } from "@/lib/aron/orders-api";
import { todayInRiyadh } from "@/lib/aron/quote";
import { saveReceipt } from "@/lib/aron/receipts";
import { parseBespoke } from "@/lib/aron/schema";

const field = `${fieldClass} mt-1`;

export const Route = createFileRoute("/bespoke")({
  head: () => ({
    meta: [
      { title: "تنسيق خاص | زهور أرون" },
      {
        name: "description",
        content: "اطلب تنسيقاً خاصاً من زهور أرون: صف المناسبة واللون والميزانية، ونراجع الطلب قبل التجهيز.",
      },
    ],
  }),
  component: BespokePage,
});

function BespokePage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState(400);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseBespoke({ recipient, phone, occasion, budget, date, notes }, todayInRiyadh());
    if (!parsed.ok) {
      setError(parsed.error === "phone" ? t("phoneError") : parsed.error === "date" ? t("dateError") : t("formError"));
      return;
    }
    setPending(true);
    try {
      const receipt = await recordBespoke({ data: parsed.data });
      saveReceipt(receipt);
      await navigate({ to: "/order/$id", params: { id: receipt.id } });
    } catch (caught) {
      const messageText = caught instanceof Error ? caught.message : "";
      setError(messageText.includes("rate") ? t("rateError") : t("formError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <p className="text-sm text-clay">{t("navBespoke")}</p>
        <h1 className="mt-2 text-4xl font-medium">{t("bespokeTitle")}</h1>
        <p className="mt-4 leading-relaxed text-ink/75">{t("bespokeLead")}</p>
        <img
          src="/flowers/hadiqat-khukh.jpg"
          alt=""
          width={1200}
          height={1600}
          loading="lazy"
          decoding="async"
          className="mt-8 hidden aspect-[3/4] w-full max-w-sm object-cover md:block"
        />
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <label className="block text-sm">
          {t("fieldRecipient")}
          <input className={field} value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
        </label>
        <label className="block text-sm">
          {t("phone")}
          <input className={field} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label className="block text-sm">
          {t("occasion")}
          <input className={field} value={occasion} onChange={(e) => setOccasion(e.target.value)} required />
        </label>
        <label className="block text-sm">
          {t("budget")}
          <input
            className={field}
            type="number"
            min={150}
            max={20000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            required
          />
          <span className="mt-1 block text-ink/55">{t("minBudget")}</span>
        </label>
        <label className="block text-sm">
          {t("date")}
          <input className={field} type="date" min={todayInRiyadh()} value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="block text-sm">
          {t("notes")}
          <textarea
            className="mt-1 h-32 w-full border border-ink/15 bg-foam px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="text-sm text-clay" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="h-12 bg-leaf px-6 text-sm font-medium text-paper disabled:opacity-60">
          {pending ? t("working") : t("bespokeSubmit")}
        </button>
      </form>
    </div>
  );
}
