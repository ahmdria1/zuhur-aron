import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, ShoppingBag, X } from "lucide-react";
import {
  countLines,
  flushCart,
  hydrateCart,
  restoreCartIfEmpty,
  setCartOpen,
  useCartHydrated,
  useCartLines,
} from "@/lib/aron/cart";
import { useLocale } from "@/lib/aron/locale";
import { flushReceipts, hydrateReceipts, restoreReceiptsIfEmpty } from "@/lib/aron/receipts";
import { CartDrawer } from "./cart-drawer";

export function Shell({ children }: { children: ReactNode }) {
  const { t, toggle } = useLocale();
  const lines = useCartLines();
  const hydrated = useCartHydrated();
  const count = hydrated ? countLines(lines) : 0;
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    hydrateCart();
    hydrateReceipts();
    const onShow = () => {
      restoreCartIfEmpty();
      restoreReceiptsIfEmpty();
    };
    const onHide = () => {
      flushCart();
      flushReceipts();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") onShow();
      else onHide();
    };
    window.addEventListener("pageshow", onShow);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const links: { to: "/" | "/shop" | "/bespoke" | "/about" | "/account"; hash?: string; label: string }[] = [
    { to: "/shop", label: t("navShop") },
    { to: "/", hash: "occasions", label: t("navOccasions") },
    { to: "/bespoke", label: t("navBespoke") },
    { to: "/about", label: t("navStudio") },
    { to: "/account", label: t("navAccount") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-foam focus:px-4 focus:py-2">
        {t("skip")}
      </a>
      <p className="bg-leaf px-4 py-2 text-center text-sm text-paper">{t("announce")}</p>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="me-auto flex items-center gap-2">
            <span className="font-display text-sm tracking-[0.18em] text-leaf">ARON</span>
            <span className="text-base font-medium">{t("brand")}</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex" aria-label={t("navMain")}>
            {links.map((link) => (
              <Link key={`${link.to}-${link.hash ?? ""}`} to={link.to} hash={link.hash} className="text-sm text-ink/80 hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
          <button type="button" onClick={toggle} className="h-11 px-2 text-sm">
            {t("langSwitch")}
          </button>
          <button
            type="button"
            className="relative flex h-11 items-center gap-1 px-2"
            aria-label={t("openCart")}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="size-5" />
            <span className="hidden text-sm lg:inline">{t("cart")}</span>
            {count > 0 ? (
              <span className="absolute end-1 top-1 grid h-5 min-w-5 place-items-center bg-clay px-1 text-xs text-paper tabular-nums">
                {count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center md:hidden"
            aria-label={t("menu")}
            onClick={() => setMenu(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      <Dialog.Root open={menu} onOpenChange={setMenu}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40 md:hidden" />
          <Dialog.Content className="fixed inset-y-0 start-0 z-50 w-72 bg-foam p-6 outline-none md:hidden">
            <Dialog.Title className="font-display tracking-[0.18em] text-leaf">ARON</Dialog.Title>
            <Dialog.Description className="sr-only">{t("menu")}</Dialog.Description>
            <nav className="mt-8 flex flex-col gap-2" aria-label={t("navMain")}>
              {links.map((link) => (
                <Link
                  key={`${link.to}-${link.hash ?? ""}`}
                  to={link.to}
                  hash={link.hash}
                  onClick={() => setMenu(false)}
                  className="flex h-12 items-center text-lg"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Dialog.Close className="absolute end-3 top-3 grid h-11 w-11 place-items-center" aria-label={t("close")}>
              <X className="size-5" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <CartDrawer />
      <main id="content" className="flex-1">
        {children}
      </main>
      <footer className="bg-leaf text-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <p className="font-display tracking-[0.18em]">ARON</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/80">{t("footerBlurb")}</p>
          </div>
          <div className="text-sm leading-relaxed">
            <p className="text-paper/60">{t("footerVisit")}</p>
            <p className="mt-2">{t("footerAddress")}</p>
            <p className="mt-4 text-paper/60">{t("footerHours")}</p>
            <p className="mt-2">{t("footerHoursValue")}</p>
          </div>
          <div className="text-sm">
            <p className="text-paper/60">{t("footerShop")}</p>
            <nav className="mt-2 flex flex-col gap-2" aria-label={t("footerShop")}>
              {links.map((link) => (
                <Link key={`${link.to}-${link.hash ?? ""}`} to={link.to} hash={link.hash} className="text-paper/90 hover:text-paper">
                  {link.label}
                </Link>
              ))}
              <Link to="/desk" className="text-paper/90 hover:text-paper">
                {t("deskNav")}
              </Link>
            </nav>
            <p className="mt-6 text-paper/70">{t("footerNote")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
