import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { clearDeskToken, readDeskToken, writeDeskToken } from "@/lib/aron/desk-session";
import { CITY_KEY, fieldClass } from "@/lib/aron/labels";
import { useLocale } from "@/lib/aron/locale";
import { Price } from "@/lib/aron/money";
import {
  DESK_STATUSES,
  listDesk,
  setDeskStatus,
  unlockDesk,
  type DeskRow,
  type DeskStatus,
} from "@/lib/aron/orders-api";
import type { CopyKey } from "@/lib/aron/copy";
import type { CityId } from "@/lib/aron/quote";

const STATUS_KEY: Record<DeskStatus, CopyKey> = {
  new: "statusNew",
  confirmed: "statusConfirmed",
  preparing: "statusPreparing",
  out: "statusOut",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
};

export const Route = createFileRoute("/desk")({
  head: () => ({
    meta: [
      { title: "لوحة الاستوديو | زهور أرون" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeskPage,
});

function DeskPage() {
  const { t, locale } = useLocale();
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [rows, setRows] = useState<DeskRow[] | null>(null);
  const [filter, setFilter] = useState<DeskStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  async function load(next: string) {
    const list = await listDesk({ data: { token: next } });
    setRows(list);
    setToken(next);
  }

  useEffect(() => {
    const saved = readDeskToken();
    if (!saved) {
      setReady(true);
      return;
    }
    load(saved)
      .catch(() => {
        clearDeskToken();
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const today = useMemo(
    () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date()),
    [],
  );
  const shown = (rows ?? []).filter((row) => filter === "all" || row.status === filter);
  const waiting = (rows ?? []).filter((row) => row.status === "new").length;
  const todayRows = (rows ?? []).filter((row) => riyadhDay(row.createdAt) === today);
  const todayTotal = todayRows.reduce((sum, row) => sum + row.total, 0);

  async function onUnlock(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await unlockDesk({ data: { code: code.trim() } });
      writeDeskToken(result.token);
      setCode("");
      await load(result.token);
    } catch {
      setError(t("deskDenied"));
    } finally {
      setPending(false);
    }
  }

  async function onStatus(id: string, status: DeskStatus) {
    if (!token) return;
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, status } : row)) ?? null);
    try {
      await setDeskStatus({ data: { token, id, status } });
    } catch {
      if (token) {
        const list = await listDesk({ data: { token } }).catch(() => null);
        if (list) setRows(list);
      }
    }
  }

  if (!ready || (token && !rows)) {
    return <p className="px-4 py-20 text-sm text-ink/60">{t("working")}</p>;
  }

  if (!token || !rows) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <p className="text-sm text-clay">{t("deskNav")}</p>
        <h1 className="mt-2 text-3xl font-medium">{t("deskTitle")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">{t("deskLead")}</p>
        <form onSubmit={onUnlock} className="mt-6">
          <label className="block text-sm">
            {t("deskCode")}
            <input
              className={`${fieldClass} mt-1`}
              type="password"
              autoComplete="current-password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </label>
          {error ? (
            <p className="mt-3 text-sm text-clay" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-4 h-12 w-full bg-leaf text-sm font-medium text-paper disabled:opacity-60"
          >
            {pending ? t("working") : t("deskEnter")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-clay">{t("deskNav")}</p>
          <h1 className="mt-2 text-3xl font-medium">{t("deskTitle")}</h1>
          <p className="mt-2 max-w-xl text-sm text-ink/70">{t("deskLead")}</p>
        </div>
        <button
          type="button"
          className="h-11 px-3 text-sm underline"
          onClick={() => {
            clearDeskToken();
            setToken(null);
            setRows(null);
          }}
        >
          {t("deskLeave")}
        </button>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-3 text-sm">
        <div className="border border-ink/10 bg-foam p-4">
          <dt className="text-ink/60">{t("deskWaiting")}</dt>
          <dd className="mt-2 text-2xl tabular-nums">{waiting}</dd>
        </div>
        <div className="border border-ink/10 bg-foam p-4">
          <dt className="text-ink/60">{t("deskToday")}</dt>
          <dd className="mt-2 text-2xl tabular-nums">{todayRows.length}</dd>
        </div>
        <div className="border border-ink/10 bg-foam p-4">
          <dt className="text-ink/60">{t("deskSales")}</dt>
          <dd className="mt-2 text-2xl">
            <Price amount={todayTotal} locale={locale} />
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          {t("deskAll")}
        </FilterChip>
        {DESK_STATUSES.map((status) => (
          <FilterChip key={status} active={filter === status} onClick={() => setFilter(status)}>
            {t(STATUS_KEY[status])}
          </FilterChip>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-sm text-ink/70">{t("deskEmpty")}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {shown.map((row) => (
            <li key={row.id} className="border border-ink/10 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm text-ink/55">{row.id}</p>
                  <h2 className="mt-1 text-lg font-medium">{row.receipt.recipient}</h2>
                </div>
                <Price amount={row.total} locale={locale} className="text-base" />
              </div>
              <p className="mt-2 text-sm">
                <a className="underline" href={`tel:${row.receipt.phone}`}>
                  {row.receipt.phone}
                </a>
                {row.receipt.city ? ` · ${t(CITY_KEY[row.receipt.city as CityId])}` : ""}
                {row.receipt.district ? ` · ${row.receipt.district}` : ""}
              </p>
              <p className="mt-1 text-sm text-ink/70">
                {t(row.receipt.kind === "bespoke" ? "kindBespoke" : "kindCatalog")}
                {row.receipt.date ? ` · ${row.receipt.date}` : ""}
                {row.receipt.slot ? ` · ${t(row.receipt.slot === "afternoon" ? "slotAfternoon" : "slotEvening")}` : ""}
                {row.receipt.payment ? ` · ${t(row.receipt.payment === "cod" ? "payCod" : "payTransfer")}` : ""}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {row.receipt.lines.map((line) => (
                  <li key={`${row.id}-${line.slug}-${line.nameAr}`}>
                    {locale === "ar" ? line.nameAr : line.nameEn} × {line.qty}
                  </li>
                ))}
              </ul>
              {row.receipt.message ? <p className="mt-3 text-sm leading-relaxed text-ink/80">{row.receipt.message}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {DESK_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatus(row.id, status)}
                    className={`h-10 px-3 text-sm ${row.status === status ? "bg-leaf text-paper" : "border border-ink/15"}`}
                  >
                    {t(STATUS_KEY[status])}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function riyadhDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(date);
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 px-3 text-sm ${active ? "bg-ink text-paper" : "border border-ink/15"}`}
    >
      {children}
    </button>
  );
}
