import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/trenz/LanguageSwitcher";
import logo from "@/assets/trenz-logo.png.asset.json";

type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  base_price: number;
  stock: number;
  low_stock_threshold: number;
  surge_multiplier: number;
  is_available: boolean;
  sort_order: number;
};
type Category = { id: string; name: string; sort_order: number };
type Room = { id: string; code: string; name: string; tier: string };

export const Route = createFileRoute("/menu")({
  validateSearch: (s: Record<string, unknown>) => ({
    room: typeof s.room === "string" ? s.room : "",
  }),
  head: () => ({
    meta: [
      { title: "TRENZ Digital Menu — In-Suite Ordering" },
      { name: "description", content: "Order directly to your TRENZ suite. Live availability and pricing." },
    ],
  }),
  component: MenuPage,
});

function effectivePrice(i: MenuItem) {
  const surging = i.stock > 0 && i.stock <= i.low_stock_threshold;
  return Math.round(i.base_price * (surging ? i.surge_multiplier : 1) * 100) / 100;
}

function MenuPage() {
  const { room: roomCode } = useSearch({ from: "/menu" });
  const { t } = useI18n();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: itemsData }, { data: catsData }, roomRes] = await Promise.all([
        supabase.from("menu_items").select("*").order("sort_order"),
        supabase.from("menu_categories").select("*").order("sort_order"),
        roomCode
          ? supabase.from("rooms").select("id,code,name,tier").eq("code", roomCode).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      setItems((itemsData ?? []) as MenuItem[]);
      setCats((catsData ?? []) as Category[]);
      setRoom((roomRes.data ?? null) as Room | null);
      setLoading(false);
    })();

    const channel = supabase
      .channel("menu-items-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === "DELETE") return prev.filter((i) => i.id !== (payload.old as MenuItem).id);
            const next = payload.new as MenuItem;
            const idx = prev.findIndex((i) => i.id === next.id);
            if (idx === -1) return [...prev, next];
            const copy = prev.slice();
            copy[idx] = next;
            return copy;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  const grouped = useMemo(() => {
    return cats
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ ...c, items: items.filter((i) => i.category_id === c.id) }));
  }, [items, cats]);

  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const it = items.find((i) => i.id === id);
      return it ? sum + effectivePrice(it) * qty : sum;
    }, 0);
  }, [cart, items]);

  function add(id: string) {
    const it = items.find((i) => i.id === id);
    if (!it || !it.is_available || it.stock <= 0) return;
    setCart((c) => ({ ...c, [id]: Math.min((c[id] ?? 0) + 1, it.stock) }));
  }
  function remove(id: string) {
    setCart((c) => {
      const q = (c[id] ?? 0) - 1;
      const copy = { ...c };
      if (q <= 0) delete copy[id];
      else copy[id] = q;
      return copy;
    });
  }

  async function placeOrder() {
    if (!room) return;
    if (Object.keys(cart).length === 0) return;
    setError(null);
    const orderInsert = await supabase
      .from("orders")
      .insert({
        room_id: room.id,
        table_code: room.code,
        total,
        status: "submitted",
      })
      .select("id")
      .single();
    if (orderInsert.error || !orderInsert.data) {
      setError(orderInsert.error?.message ?? "Order failed");
      return;
    }
    const rows = Object.entries(cart).map(([id, qty]) => {
      const it = items.find((i) => i.id === id)!;
      return {
        order_id: orderInsert.data.id,
        menu_item_id: id,
        item_name: it.name,
        quantity: qty,
        unit_price: effectivePrice(it),
      };
    });
    const { error: itemsError } = await supabase.from("order_items").insert(rows);
    if (itemsError) {
      setError(itemsError.message);
      return;
    }
    setPlacedId(orderInsert.data.id);
    setCart({});
  }

  return (
    <div className="min-h-screen bg-night text-ivory">
      <header className="sticky top-0 z-30 border-b border-gold/10 bg-night/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo.url} alt="TRENZ" className="h-8 w-8 object-contain" />
            <span className="font-serif tracking-[0.4em] text-gold">TRENZ</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 pb-40">
        <div className="mb-8">
          <span className="eyebrow mb-3 block">{t("menu.title")}</span>
          <h1 className="font-serif text-3xl md:text-5xl">{t("menu.subtitle")}</h1>
          <div className="mt-4 text-sm text-ivory/60">
            {room ? (
              <span>
                <span className="text-gold">{t("menu.room")}:</span> {room.name} · {room.code}
              </span>
            ) : (
              <span className="text-ivory/50">{t("menu.tableRequired")}</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-ivory/50">{t("common.loading")}</div>
        ) : (
          <div className="space-y-12">
            {grouped.map((cat) => (
              <section key={cat.id}>
                <div className="mb-4 flex items-baseline justify-between border-b border-gold/10 pb-2">
                  <h2 className="font-serif text-2xl text-ivory">{cat.name}</h2>
                </div>
                <ul className="divide-y divide-white/5">
                  {cat.items.map((i) => {
                    const price = effectivePrice(i);
                    const surging = i.stock > 0 && i.stock <= i.low_stock_threshold;
                    const out = !i.is_available || i.stock <= 0;
                    const qty = cart[i.id] ?? 0;
                    return (
                      <li key={i.id} className="flex items-start justify-between gap-4 py-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif text-lg text-ivory">{i.name}</span>
                            {surging && !out && (
                              <span className="border border-gold/50 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-gold">
                                {t("menu.surge")} ×{i.surge_multiplier.toFixed(2)}
                              </span>
                            )}
                            {out && (
                              <span className="border border-red-400/50 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-red-300">
                                {t("menu.out")}
                              </span>
                            )}
                            {!out && i.stock <= i.low_stock_threshold && (
                              <span className="text-[10px] uppercase tracking-widest text-gold/60">
                                {t("menu.low")} · {i.stock}
                              </span>
                            )}
                          </div>
                          {i.description && (
                            <p className="mt-1 text-xs text-ivory/50">{i.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-serif text-lg text-gold">${price.toLocaleString()}</span>
                          {room && !out && (
                            <div className="flex items-center gap-2">
                              {qty > 0 && (
                                <button
                                  onClick={() => remove(i.id)}
                                  className="h-8 w-8 border border-gold/40 text-gold"
                                  aria-label="Remove"
                                >
                                  −
                                </button>
                              )}
                              {qty > 0 && <span className="min-w-4 text-center text-sm">{qty}</span>}
                              <button
                                onClick={() => add(i.id)}
                                disabled={qty >= i.stock}
                                className="h-8 border border-gold/40 bg-gold px-3 text-[10px] font-semibold uppercase tracking-widest text-night disabled:opacity-40"
                              >
                                {t("menu.add")}
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      {room && Object.keys(cart).length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-obsidian/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ivory/50">{t("menu.cart")}</div>
              <div className="font-serif text-2xl text-gold">${total.toLocaleString()}</div>
            </div>
            <button
              onClick={placeOrder}
              className="bg-gold px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-night transition-colors hover:bg-gold-soft"
            >
              {t("menu.place")}
            </button>
          </div>
        </div>
      )}

      {placedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-4" onClick={() => setPlacedId(null)}>
          <div className="max-w-md border border-gold/30 bg-obsidian p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 text-gold text-4xl font-serif">✦</div>
            <p className="mb-2 font-serif text-2xl">{t("menu.placed")}</p>
            <p className="text-xs text-ivory/50">#{placedId.slice(0, 8).toUpperCase()}</p>
            <button
              onClick={() => setPlacedId(null)}
              className="mt-6 border border-gold/40 px-6 py-2 text-[10px] uppercase tracking-widest text-gold"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 border border-red-400/50 bg-red-950/80 px-4 py-2 text-xs text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}