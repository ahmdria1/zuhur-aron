import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getProduct, products } from "@/lib/aron/catalog";
import { addLine, setCartOpen } from "@/lib/aron/cart";
import { ADDON_KEY, SIZE_KEY } from "@/lib/aron/labels";
import { useLocale } from "@/lib/aron/locale";
import { Price } from "@/lib/aron/money";
import { ADDONS, SIZES, unitPrice, type AddonId, type SizeId } from "@/lib/aron/quote";
import { ProductCard } from "@/components/aron/product-card";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.product.name.ar} | زهور أرون` : "زهور أرون" },
      { name: "description", content: loaderData?.product.summary.ar ?? "" },
    ],
  }),
  component: ProductPage,
  notFoundComponent: MissingProduct,
});

function MissingProduct() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <h1 className="text-3xl font-medium">{t("notFoundTitle")}</h1>
      <p className="mt-3 text-ink/70">{t("notFoundLead")}</p>
      <Link to="/shop" className="mt-6 inline-flex h-12 items-center bg-leaf px-5 text-sm text-paper">
        {t("backShop")}
      </Link>
    </div>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { locale, t } = useLocale();
  const [size, setSize] = useState<SizeId>("classic");
  const [addons, setAddons] = useState<AddonId[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState(false);
  const price = unitPrice(product.price, size, addons);
  const related = products.filter((item) => item.slug !== product.slug && item.category === product.category).slice(0, 3);

  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(() => setNote(false), 2500);
    return () => window.clearTimeout(timer);
  }, [note]);

  function toggleAddon(id: AddonId) {
    setAddons((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name.ar,
            description: product.summary.ar,
            image: product.image,
            brand: { "@type": "Brand", name: "زهور أرون" },
            offers: {
              "@type": "Offer",
              priceCurrency: "SAR",
              price: product.price,
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
      <img
        src={product.image}
        alt={product.name[locale]}
        width={1200}
        height={1600}
        decoding="async"
        fetchPriority="high"
        className="aspect-[3/4] w-full object-cover"
      />
      <div>
        <p className="text-sm text-clay">{t("from")}</p>
        <h1 className="mt-2 text-3xl font-medium md:text-4xl">{product.name[locale]}</h1>
        <p className="mt-3 text-lg">
          <Price amount={price * qty} locale={locale} />
        </p>
        <p className="mt-1 text-sm text-ink/60">{t("priceNote")}</p>
        <p className="mt-5 leading-relaxed text-ink/80">{product.story[locale]}</p>
        <p className="mt-4 text-sm">
          <span className="text-ink/60">{t("stems")}: </span>
          {product.stems[locale]}
        </p>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium">{t("sizeWord")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(SIZES) as SizeId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSize(id)}
                className={`h-11 px-4 text-sm ${size === id ? "bg-leaf text-paper" : "border border-ink/15"}`}
              >
                {t(SIZE_KEY[id])}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium">{t("addonsTitle")}</legend>
          <div className="mt-2 flex flex-col gap-2">
            {(Object.keys(ADDONS) as AddonId[]).map((id) => (
              <label key={id} className="flex h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={addons.includes(id)}
                  onChange={() => toggleAddon(id)}
                  className="size-4 accent-leaf"
                />
                <span>{t(ADDON_KEY[id])}</span>
                <Price amount={ADDONS[id].price} locale={locale} className="text-ink/70" />
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex items-center gap-3">
          <label className="text-sm" htmlFor="qty">
            {t("qty")}
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            max={9}
            value={qty}
            onChange={(event) => setQty(Math.min(9, Math.max(1, Number(event.target.value) || 1)))}
            className="h-12 w-20 border border-ink/15 bg-foam px-3 tabular-nums"
          />
        </div>

        <button
          type="button"
          className="mt-6 h-12 w-full bg-leaf text-sm font-medium text-paper md:w-auto md:px-8"
          onClick={() => {
            addLine({ slug: product.slug, size, addons, qty });
            setCartOpen(true);
            setNote(true);
          }}
        >
          {t("addToCart")}
        </button>
        {note ? (
          <p className="mt-3 text-sm text-leaf" role="status" aria-live="polite">
            {t("added")}
          </p>
        ) : null}
        <p className="mt-6 text-sm leading-relaxed text-ink/65">{t("deliveryNote")}</p>
        <h2 className="mt-10 text-lg font-medium">{t("careTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{t("careBody")}</p>
      </div>
      {related.length > 0 ? (
        <section className="md:col-span-2">
          <h2 className="text-xl font-medium">{t("related")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
