import { Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, X } from "lucide-react";
import {
  removeLine,
  setCartOpen,
  setQty,
  useCartLines,
  useCartOpen,
} from "@/lib/aron/cart";
import { useLocale } from "@/lib/aron/locale";
import { SIZE_KEY } from "@/lib/aron/labels";
import { Price } from "@/lib/aron/money";
import { lineKey, priceLines } from "@/lib/aron/quote";

export function CartDrawer() {
  const open = useCartOpen();
  const lines = useCartLines();
  const { locale, t } = useLocale();
  const priced = priceLines(lines);

  return (
    <Dialog.Root open={open} onOpenChange={setCartOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-foam outline-none">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <Dialog.Title className="text-lg font-medium">{t("cartTitle")}</Dialog.Title>
            <Dialog.Description className="sr-only">{t("summary")}</Dialog.Description>
            <Dialog.Close className="grid h-11 w-11 place-items-center" aria-label={t("close")}>
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {!priced || priced.lines.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-ink/70">{t("emptyCart")}</p>
                <Link
                  to="/shop"
                  onClick={() => setCartOpen(false)}
                  className="mt-4 inline-flex h-11 items-center text-sm text-leaf underline"
                >
                  {t("emptyCta")}
                </Link>
              </div>
            ) : (
              <ul className="space-y-5">
                {priced.lines.map((line) => (
                  <li key={lineKey(line)} className="flex gap-3">
                    <img
                      src={line.product.image}
                      alt=""
                      width={80}
                      height={104}
                      loading="lazy"
                      decoding="async"
                      className="h-24 w-16 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{line.product.name[locale]}</p>
                      <p className="mt-1 text-sm text-ink/60">{t(SIZE_KEY[line.size])}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center border border-ink/15">
                          <button
                            type="button"
                            className="grid h-11 w-11 place-items-center"
                            aria-label={t("decrease")}
                            onClick={() => setQty(lineKey(line), line.qty - 1)}
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums">{line.qty}</span>
                          <button
                            type="button"
                            className="grid h-11 w-11 place-items-center"
                            aria-label={t("increase")}
                            onClick={() => setQty(lineKey(line), Math.min(9, line.qty + 1))}
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <Price amount={line.total} locale={locale} className="text-sm" />
                      </div>
                      <button
                        type="button"
                        className="mt-2 text-sm text-ink/60 underline"
                        onClick={() => removeLine(lineKey(line))}
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {priced && priced.lines.length > 0 ? (
            <div className="border-t border-ink/10 px-5 py-4">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span>{t("subtotal")}</span>
                <Price amount={priced.subtotal} locale={locale} />
              </div>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="flex h-12 items-center justify-center bg-leaf text-sm font-medium text-paper"
              >
                {t("checkout")}
              </Link>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
