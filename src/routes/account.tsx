import { useEffect, useState, useSyncExternalStore } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthPanel } from "@/components/aron/auth-panel";
import { useLocale } from "@/lib/aron/locale";
import { Price } from "@/lib/aron/money";
import { listOrders } from "@/lib/aron/orders-api";
import { lineTitle, useReceipts, useReceiptsHydrated, type Receipt } from "@/lib/aron/receipts";
import { signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "الحساب | زهور أرون" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const subscribeNothing = () => () => {};

function AccountPage() {
  const { t, locale } = useLocale();
  const { user, isPending } = useCurrentUserState();
  const local = useReceipts();
  const ready = useReceiptsHydrated();
  const [remote, setRemote] = useState<Receipt[] | null>(null);
  const gate = useSyncExternalStore(subscribeNothing, hasGateSessionMarker, () => false);
  const [leaving, setLeaving] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    listOrders()
      .then((rows) => {
        if (!cancelled) setRemote(rows);
      })
      .catch(() => {
        if (!cancelled) setRemote([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const merged = mergeReceipts(remote ?? [], ready ? local : []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-medium">{t("accountTitle")}</h1>
      {isPending ? <p className="mt-6 text-sm text-ink/60">{t("working")}</p> : null}
      {!isPending && user ? (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p>
            {t("accountHello")} {user.displayName ?? user.primaryEmail}
          </p>
          {!gate ? (
            <button
              type="button"
              className="h-11 border border-ink/15 px-4 text-sm disabled:opacity-60"
              disabled={leaving}
              onClick={() => {
                setLeaving(true);
                void signOut().finally(() => setLeaving(false));
              }}
            >
              {t("signOut")}
            </button>
          ) : null}
        </div>
      ) : null}
      {!isPending && !user ? (
        <div className="mt-6">
          <p className="mb-6 max-w-md text-sm leading-relaxed text-ink/75">{t("guestLead")}</p>
          <AuthPanel />
        </div>
      ) : null}
      <h2 className="mt-12 text-xl font-medium">{t("ordersTitle")}</h2>
      {!ready ? <p className="mt-4 text-sm text-ink/60">{t("working")}</p> : null}
      {ready && merged.length === 0 ? <p className="mt-4 text-sm text-ink/70">{t("noOrders")}</p> : null}
      <ul className="mt-4 divide-y divide-ink/10">
        {merged.map((receipt) => (
          <li key={receipt.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <Link to="/order/$id" params={{ id: receipt.id }} className="font-medium underline">
                {receipt.id}
              </Link>
              <p className="mt-1 text-sm text-ink/65">
                {lineTitle(receipt.lines[0], locale)}
                {receipt.lines.length > 1 ? ` +${receipt.lines.length - 1}` : ""}
              </p>
            </div>
            <Price amount={receipt.total} locale={locale} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function mergeReceipts(remote: Receipt[], local: Receipt[]): Receipt[] {
  const seen = new Set<string>();
  const all = [...remote, ...local];
  return all.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
