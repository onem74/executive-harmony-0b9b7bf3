import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/trenz/LanguageSwitcher";
import logo from "@/assets/trenz-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "TRENZ Members' Entry — Sign In" },
      { name: "description", content: "Sign in to the TRENZ members' portal." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setErr(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth("google", {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
    }
  }

  return (
    <div className="min-h-screen bg-night text-ivory">
      <header className="border-b border-gold/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo.url} alt="TRENZ" className="h-8 w-8 object-contain" />
            <span className="font-serif tracking-[0.4em] text-gold">TRENZ</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
        <div className="w-full">
          <span className="eyebrow mb-3 block">{t("auth.title")}</span>
          <h1 className="mb-8 font-serif text-4xl">
            {mode === "signin" ? t("auth.signin") : t("auth.signup")}
          </h1>

          <button
            onClick={google}
            className="mb-6 flex w-full items-center justify-center gap-3 border border-gold/30 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold hover:text-night"
          >
            {t("auth.google")}
          </button>

          <div className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-ivory/40">
            <div className="h-px flex-1 bg-gold/10" />
            <span>or</span>
            <div className="h-px flex-1 bg-gold/10" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <input
                required
                placeholder={t("auth.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gold/20 bg-transparent px-3 py-3 text-sm"
              />
            )}
            <input
              required
              type="email"
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gold/20 bg-transparent px-3 py-3 text-sm"
            />
            <input
              required
              type="password"
              minLength={6}
              placeholder={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gold/20 bg-transparent px-3 py-3 text-sm"
            />
            {err && <p className="text-xs text-red-300">{err}</p>}
            <button
              disabled={busy}
              className="w-full bg-gold py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-night disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? t("auth.signin") : t("auth.signup")}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-[11px] uppercase tracking-widest text-ivory/50 hover:text-gold"
          >
            {mode === "signin" ? t("auth.switchToSignup") : t("auth.switchToSignin")}
          </button>
        </div>
      </main>
    </div>
  );
}
