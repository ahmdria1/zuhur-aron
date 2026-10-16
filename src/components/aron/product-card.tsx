import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/aron/catalog";
import { useLocale } from "@/lib/aron/locale";
import { Price } from "@/lib/aron/money";

export function ProductCard({ product }: { product: Product }) {
  const { locale } = useLocale();
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block min-w-0"
    >
      <div className="aspect-[3/4] overflow-hidden bg-ink/5">
        <img
          src={product.image}
          alt={product.name[locale]}
          width={1200}
          height={1600}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover motion-safe:transition motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-medium leading-snug">{product.name[locale]}</h3>
        <Price amount={product.price} locale={locale} className="shrink-0 text-sm" />
      </div>
      <p className="mt-1 text-sm leading-relaxed text-ink/65">{product.summary[locale]}</p>
    </Link>
  );
}
