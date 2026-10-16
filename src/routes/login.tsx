import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AuthPanel } from "@/components/aron/auth-panel";
import { useLocale } from "@/lib/aron/locale";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "الدخول | زهور أرون" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useLocale();
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <p className="px-4 py-20 text-sm text-ink/60">{t("working")}</p>;
  if (user) return <Navigate to="/account" />;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-medium">{t("accountTitle")}</h1>
      <p className="mt-3 mb-8 text-sm leading-relaxed text-ink/70">{t("guestLead")}</p>
      <AuthPanel />
    </div>
  );
}
