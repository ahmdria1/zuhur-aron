import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocale } from "@/lib/aron/locale";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "الاستوديو | زهور أرون" },
      {
        name: "description",
        content: "زهور أرون استوديو تنسيق محدود في بريدة، على طريق الملك عبدالعزيز. دوام يومي من الرابعة عصراً.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useLocale();
  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
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
        <h1 className="mt-2 text-4xl font-medium">{t("studioTitle")}</h1>
        <p className="mt-4 leading-relaxed text-ink/80">{t("studioLead")}</p>
        <dl className="mt-8 space-y-4 text-sm">
          <div>
            <dt className="text-ink/55">{t("footerVisit")}</dt>
            <dd className="mt-1">{t("footerAddress")}</dd>
          </div>
          <div>
            <dt className="text-ink/55">{t("footerHours")}</dt>
            <dd className="mt-1">{t("footerHoursValue")}</dd>
          </div>
        </dl>
        <h2 className="mt-10 text-xl font-medium">{t("careTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/75">{t("careBody")}</p>
        <Link to="/bespoke" className="mt-8 inline-flex h-12 items-center bg-leaf px-5 text-sm text-paper">
          {t("studioCta")}
        </Link>
      </div>
    </article>
  );
}
