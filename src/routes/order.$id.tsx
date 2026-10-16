import { createFileRoute, Link } from "@tanstack/react-router";
import { CITY_KEY } from "@/lib/aron/labels";
import { useLocale } from "@/lib/aron/locale";
import { Price } from "@/lib/aron/money";
import { lineTitle, useReceipts, useReceiptsHydrated } from "@/lib/aron/receipts";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "تأكيد الطلب | زهور أرون" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { locale, t } = useLocale();
  const ready = useReceiptsHydrated();
  const receipt = useReceipts().find((item) => item.id === id);

  if (!ready) {
    return <p className="px-4 py-20 text-sm text-ink/60">{t("working")}</p>;
  }

  if (!receipt) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <h1 className="text-3xl font-medium">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-ink/70">{t("notFoundLead")}</p>
        <Link to="/account" className="mt-6 inline-flex text-sm underline">
          {t("ordersTitle")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-sm text-clay">{t("orderRef")}</p>
      <h1 className="mt-2 text-3xl font-medium">{t("orderOkTitle")}</h1>
      <p className="mt-3 font-display text-2xl tracking-wide text-leaf">{receipt.id}</p>
      <p className="mt-4 leading-relaxed text-ink/75">{receipt.kind === "bespoke" ? t("bespokeOk") : t("orderOkLead")}</p>
      <p className="mt-2 text-sm text-ink/60">{receipt.stored === "account" ? t("savedAccount") : t("savedOnDevice")}</p>
      <ul className="mt-8 space-y-3 border-t border-ink/10 pt-4 text-sm">
        {receipt.lines.map((line) => (
          <li key={`${line.slug}-${line.size ?? "x"}`} className="flex justify-between gap-3">
            <span>
              {lineTitle(line, locale)} × {line.qty}
            </span>
            <Price amount={line.total} locale={locale} />
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between font-medium">
        <span>{t("total")}</span>
        <Price amount={receipt.total} locale={locale} />
      </p>
      <p className="mt-4 text-sm text-ink/70">
        {receipt.recipient}
        {receipt.city ? ` · ${t(CITY_KEY[receipt.city])}` : ""}
        {receipt.date ? ` · ${receipt.date}` : ""}
      </p>
      <Link to="/shop" className="mt-8 inline-flex h-12 items-center bg-leaf px-5 text-sm text-paper">
        {t("continueShop")}
      </Link>
    </div>
  );
}
