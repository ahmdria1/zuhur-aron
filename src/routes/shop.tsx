import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { products, type Category, type Occasion } from "@/lib/aron/catalog";
import type { CopyKey } from "@/lib/aron/copy";
import { useLocale } from "@/lib/aron/locale";
import { ProductCard } from "@/components/aron/product-card";

const OCCASIONS = ["love", "thanks", "newborn", "grad", "wedding", "sympathy", "apology"] as const;
const OCCASION_KEY: Record<Occasion, CopyKey> = {
  love: "occLove",
  thanks: "occThanks",
  newborn: "occNewborn",
  grad: "occGrad",
  wedding: "occWedding",
  sympathy: "occSympathy",
  apology: "occApology",
};
const CATEGORIES: { id: "all" | Category; key: CopyKey }[] = [
  { id: "all", key: "filterAll" },
  { id: "bouquets", key: "catBouquets" },
  { id: "orchids", key: "catOrchids" },
  { id: "dried", key: "catDried" },
  { id: "bridal", key: "catBridal" },
];

function isOccasion(value: unknown): value is Occasion {
  return typeof value === "string" && (OCCASIONS as readonly string[]).includes(value);
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { occasion?: Occasion } => {
    if (isOccasion(search.occasion)) return { occasion: search.occasion };
    return {};
  },
  head: () => ({
    meta: [
      { title: "المتجر | زهور أرون" },
      {
        name: "description",
        content: "باقات الجوري والأوركيد والمجفف وباقة العروس من استوديو زهور أرون في بريدة.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { occasion } = Route.useSearch();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const [activeOccasion, setActiveOccasion] = useState<Occasion | undefined>(occasion);

  useEffect(() => {
    setActiveOccasion(occasion);
  }, [occasion]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (activeOccasion && !item.occasions.includes(activeOccasion)) return false;
      if (!q) return true;
      const hay = `${item.name.ar} ${item.name.en} ${item.summary.ar} ${item.summary.en}`.toLowerCase();
      return hay.includes(q);
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "featured") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [activeOccasion, category, query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-medium">{t("navShop")}</h1>
      <p className="mt-2 max-w-xl text-sm text-ink/70">{t("seasonLead")}</p>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="sr-only" htmlFor="shop-search">
          {t("searchPlaceholder")}
        </label>
        <input
          id="shop-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-12 w-full border border-ink/15 bg-foam px-3 md:max-w-xs"
        />
        <label className="text-sm">
          <span className="sr-only">{t("sortFeatured")}</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="h-12 border border-ink/15 bg-foam px-3"
          >
            <option value="featured">{t("sortFeatured")}</option>
            <option value="low">{t("sortLow")}</option>
            <option value="high">{t("sortHigh")}</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`h-11 px-3 text-sm ${category === item.id ? "bg-leaf text-paper" : "border border-ink/15"}`}
          >
            {t(item.key)}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveOccasion(undefined)}
          className={`h-11 px-3 text-sm ${activeOccasion ? "border border-ink/15" : "bg-ink text-paper"}`}
        >
          {t("filterAll")}
        </button>
        {OCCASIONS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveOccasion(id)}
            className={`h-11 px-3 text-sm ${activeOccasion === id ? "bg-ink text-paper" : "border border-ink/15"}`}
          >
            {t(OCCASION_KEY[id])}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="py-16 text-ink/70">{t("noResults")}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
