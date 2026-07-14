import { LOCALES, useI18n } from "@/lib/i18n";
import { useState } from "react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale)!;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 border border-gold/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold hover:text-night ${compact ? "" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span aria-hidden>◈</span>
        {current.short}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] border border-gold/20 bg-obsidian py-1 shadow-xl">
            {LOCALES.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-[11px] uppercase tracking-[0.25em] transition-colors hover:bg-gold/10 ${
                    l.code === locale ? "text-gold" : "text-ivory/70"
                  }`}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}