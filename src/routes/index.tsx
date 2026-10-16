import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/aron/catalog";
import type { CopyKey } from "@/lib/aron/copy";
import { OCCASION_KEY, OCCASIONS } from "@/lib/aron/labels";
import { useLocale } from "@/lib/aron/locale";
import { ProductCard } from "@/components/aron/product-card";

const floristLd = {
  "@context": "https://schema.org",
  "@type": "Florist",
  name: "زهور أرون",
  description:
    "استوديو تنسيق زهور في بريدة. باقات موسمية وأوركيد ومجفف، مع توصيل داخل القصيم.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "طريق الملك عبدالعزيز",
    addressLocality: "بريدة",
    addressRegion: "القصيم",
    addressCountry: "SA",
  },
  areaServed: ["بريدة", "عنيزة", "الرس", "الرياض", "جدة", "الدمام"],
  currenciesAccepted: "SAR",
  paymentAccepted: "Cash, Bank transfer",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "زهور أرون | تنسيق وبيع الزهور في بريدة" },
      {
        name: "description",
        content:
          "متجر زهور أرون لتنسيق الورد الطبيعي في بريدة. باقات، أوركيد، مجفف، وباقة عروس. توصيل نفس اليوم داخل القصيم.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useLocale();
  const featured = products.filter((item) => item.featured).slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(floristLd) }} />
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-12 md:py-16">
        <div className="md:col-span-7">
          <img
            src="/flowers/hero.jpg"
            alt={t("heroAlt")}
            width={1728}
            height={1152}
            fetchPriority="high"
            decoding="async"
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
        <div className="md:col-span-5 md:ps-4">
          <p className="text-sm text-clay">{t("heroEyebrow")}</p>
          <h1 className="mt-3 text-4xl font-medium leading-tight md:text-5xl">{t("heroTitle")}</h1>
          <p className="mt-4 text-base leading-relaxed text-ink/75">{t("heroLead")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex h-12 items-center bg-leaf px-5 text-sm font-medium text-paper">
              {t("heroCta")}
            </Link>
            <Link to="/bespoke" className="inline-flex h-12 items-center border border-ink/20 px-5 text-sm">
              {t("studioCta")}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10">
        <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm md:grid-cols-3">
          <li>{t("trust1")}</li>
          <li>{t("trust2")}</li>
          <li>{t("trust3")}</li>
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium">{t("seasonTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">{t("seasonLead")}</p>
          </div>
          <Link to="/shop" className="hidden shrink-0 text-sm underline md:inline">
            {t("viewAll")}
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section id="occasions" className="bg-foam">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-medium">{t("occasionsTitle")}</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {OCCASIONS.map((id) => (
              <li key={id}>
                <Link
                  to="/shop"
                  search={{ occasion: id }}
                  className="inline-flex h-11 items-center border border-ink/15 px-4 text-sm hover:border-ink"
                >
                  {t(OCCASION_KEY[id])}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
        <img
          src="/flowers/studio.jpg"
          alt={t("studioAlt")}
          width={1728}
          height={1152}
          loading="lazy"
          decoding="async"
          className="aspect-[3/2] w-full object-cover"
        />
        <div>
          <p className="text-sm text-clay">{t("studioKicker")}</p>
          <h2 className="mt-2 text-3xl font-medium">{t("studioTitle")}</h2>
          <p className="mt-4 leading-relaxed text-ink/75">{t("studioLead")}</p>
          <Link to="/about" className="mt-6 inline-flex h-11 items-center text-sm underline">
            {t("studioMore")}
          </Link>
        </div>
      </section>

      <section className="border-t border-ink/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
          <h2 className="text-2xl font-medium md:col-span-3">{t("stepTitle")}</h2>
          <article>
            <h3 className="font-medium">{t("step1t")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{t("step1d")}</p>
          </article>
          <article>
            <h3 className="font-medium">{t("step2t")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{t("step2d")}</p>
          </article>
          <article>
            <h3 className="font-medium">{t("step3t")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{t("step3d")}</p>
          </article>
        </div>
      </section>

      <section className="bg-foam">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3">
          <h2 className="text-2xl font-medium md:col-span-3">{t("notesTitle")}</h2>
          {[
            ["note1", "note1by"],
            ["note2", "note2by"],
            ["note3", "note3by"],
          ].map(([body, by]) => (
            <figure key={body} className="border-t border-ink/15 pt-4">
              <blockquote className="text-sm leading-relaxed">{t(body as CopyKey)}</blockquote>
              <figcaption className="mt-3 text-sm text-ink/60">{t(by as CopyKey)}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
