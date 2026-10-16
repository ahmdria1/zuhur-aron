import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { fieldClass } from "@/lib/aron/labels";
import { useLocale } from "@/lib/aron/locale";

export function AuthPanel() {
  const { t } = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authEnabled) {
    return <p className="text-sm text-ink/70">{t("authDisabled")}</p>;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t("passwordHint"));
      return;
    }
    if (mode === "up" && name.trim().length < 2) {
      setError(t("formError"));
      return;
    }
    setPending(true);
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({
              email: email.trim(),
              password,
              name: name.trim(),
              callbackURL: "/account",
            })
          : await authClient.signIn.email({
              email: email.trim(),
              password,
              callbackURL: "/account",
            });
      if (result.error) {
        const message = result.error.message ?? "";
        if (/exist/i.test(message)) setError(t("emailTaken"));
        else if (/password/i.test(message)) setError(t("passwordHint"));
        else setError(t("authError"));
        return;
      }
      if (mode === "up") {
        const session = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/account",
        });
        if (session.error) {
          setError(t("authError"));
          return;
        }
      }
      await router.navigate({ to: "/account" });
    } catch {
      setError(t("authError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-sm">
      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "up" ? (
          <label className="block text-sm">
            {t("name")}
            <input className={`${fieldClass} mt-1`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
        ) : null}
        <label className="block text-sm">
          {t("email")}
          <input
            className={`${fieldClass} mt-1`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="block text-sm">
          {t("password")}
          <input
            className={`${fieldClass} mt-1`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </label>
        <p className="text-sm text-ink/60">{t("passwordHint")}</p>
        {error ? (
          <p className="text-sm text-clay" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="h-12 w-full bg-leaf text-sm font-medium text-paper disabled:opacity-60">
          {pending ? t("working") : mode === "up" ? t("signUp") : t("signIn")}
        </button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm underline"
        onClick={() => {
          setMode(mode === "up" ? "in" : "up");
          setError(null);
        }}
      >
        {mode === "up" ? t("haveAccount") : t("newAccount")}
      </button>
      <p className="my-5 text-center text-sm text-ink/50">{t("or")}</p>
      <div className="space-y-2">
        {GROK_PROVIDERS.map((provider) => (
          <button
            key={provider.providerId}
            type="button"
            className="h-12 w-full border border-ink/15 text-sm"
            onClick={() => signIn(provider.providerId, { callbackURL: "/account" })}
          >
            {provider.idp === "google" ? t("google") : t("x")}
          </button>
        ))}
      </div>
    </div>
  );
}
