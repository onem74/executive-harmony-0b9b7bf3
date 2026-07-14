import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/trenz/LanguageSwitcher";
import logo from "@/assets/trenz-logo.png.asset.json";

type Reservation = {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  party_size: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  room_id: string | null;
  created_at: string;
};
type OrderRow = {
  id: string;
  table_code: string;
  status: string;
  total: number;
  created_at: string;
  room_id: string | null;
  order_items: { item_name: string; quantity: number; unit_price: number }[];
};
type Item = {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number;
  surge_multiplier: number;
  is_available: boolean;
  base_price: number;
};

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({ meta: [{ title: "TRENZ Staff Operations" }] }),
  component: StaffPage,
});

function StaffPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"reservations" | "orders" | "stock">("reservations");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: true })
      .order("start_time")
      .then(({ data }) => setReservations((data ?? []) as Reservation[]));
    supabase
      .from("orders")
      .select("id,table_code,status,total,created_at,room_id,order_items(item_name,quantity,unit_price)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as unknown as OrderRow[]));
    supabase
      .from("menu_items")
      .select("id,name,stock,low_stock_threshold,surge_multiplier,is_available,base_price")
      .order("name")
      .then(({ data }) => setItems((data ?? []) as Item[]));

    const ch = supabase
      .channel("staff-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, (p) => {
        setReservations((prev) => merge(prev, p.eventType, p.old, p.new));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        supabase
          .from("orders")
          .select("id,table_code,status,total,created_at,room_id,order_items(item_name,quantity,unit_price)")
          .order("created_at", { ascending: false })
          .then(({ data }) => setOrders((data ?? []) as unknown as OrderRow[]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, (p) => {
        setItems((prev) => merge(prev, p.eventType, p.old, p.new));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function setResStatus(id: string, status: Reservation["status"]) {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) setNotice(error.message);
  }
  async function saveStock(id: string, stock: number, available: boolean) {
    const { error } = await supabase.from("menu_items").update({ stock, is_available: available }).eq("id", id);
    if (error) setNotice(error.message);
  }
  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-night text-ivory">
      <header className="border-b border-gold/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo.url} alt="TRENZ" className="h-8 w-8 object-contain" />
            <span className="font-serif tracking-[0.4em] text-gold">TRENZ</span>
            <span className="ml-3 border border-gold/30 px-2 py-0.5 text-[9px] uppercase tracking-widest text-gold">
              {t("staff.title")}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={signOut} className="text-[10px] uppercase tracking-widest text-ivory/60 hover:text-gold">
              {t("auth.signout")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex gap-1 border-b border-gold/10">
          {[
            { k: "reservations", label: t("staff.reservations") },
            { k: "orders", label: t("staff.orders") },
            { k: "stock", label: t("staff.stock") },
          ].map((tabItem) => (
            <button
              key={tabItem.k}
              onClick={() => setTab(tabItem.k as typeof tab)}
              className={`border-b-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                tab === tabItem.k ? "border-gold text-gold" : "border-transparent text-ivory/50 hover:text-gold"
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === "reservations" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gold/10 text-left text-[10px] uppercase tracking-widest text-ivory/50">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Guest</th>
                  <th className="py-2 pr-4">Party</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-obsidian/60">
                    <td className="py-3 pr-4 text-ivory/80">{r.reservation_date}</td>
                    <td className="py-3 pr-4 text-ivory/80">{r.start_time.slice(0,5)}–{r.end_time.slice(0,5)}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{r.guest_name}</div>
                      <div className="text-xs text-ivory/50">{r.guest_email}{r.guest_phone ? ` · ${r.guest_phone}` : ""}</div>
                    </td>
                    <td className="py-3 pr-4">{r.party_size}</td>
                    <td className="py-3 pr-4">
                      <span className={`border px-2 py-0.5 text-[9px] uppercase tracking-widest ${
                        r.status === "confirmed" ? "border-gold/50 text-gold" :
                        r.status === "seated" ? "border-emerald-400/50 text-emerald-300" :
                        r.status === "cancelled" ? "border-red-400/50 text-red-300" :
                        "border-ivory/30 text-ivory/60"
                      }`}>{r.status}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        <ActionBtn onClick={() => setResStatus(r.id, "confirmed")}>{t("staff.confirm")}</ActionBtn>
                        <ActionBtn onClick={() => setResStatus(r.id, "seated")}>{t("staff.seated")}</ActionBtn>
                        <ActionBtn onClick={() => setResStatus(r.id, "completed")}>{t("staff.completed")}</ActionBtn>
                        <ActionBtn onClick={() => setResStatus(r.id, "cancelled")} danger>{t("staff.cancel")}</ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-ivory/40">—</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "orders" && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((o) => (
              <div key={o.id} className="border border-gold/10 bg-obsidian p-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gold">{o.table_code}</div>
                    <div className="font-mono text-xs text-ivory/50">#{o.id.slice(0,8).toUpperCase()}</div>
                  </div>
                  <div className="font-serif text-lg text-gold">${Number(o.total).toLocaleString()}</div>
                </div>
                <ul className="mb-3 space-y-1 text-sm">
                  {o.order_items?.map((oi, i) => (
                    <li key={i} className="flex justify-between text-ivory/70">
                      <span>{oi.quantity}× {oi.item_name}</span>
                      <span>${Number(oi.unit_price).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-1">
                  {["preparing", "served", "paid"].map((s) => (
                    <ActionBtn key={s} onClick={async () => {
                      await supabase.from("orders").update({ status: s }).eq("id", o.id);
                    }}>{s}</ActionBtn>
                  ))}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-ivory/40">{o.status}</div>
              </div>
            ))}
            {orders.length === 0 && <div className="col-span-full py-10 text-center text-ivory/40">—</div>}
          </div>
        )}

        {tab === "stock" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gold/10 text-left text-[10px] uppercase tracking-widest text-ivory/50">
                <tr>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Base</th>
                  <th className="py-2 pr-4">Surge ×</th>
                  <th className="py-2 pr-4">Stock</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((i) => (
                  <StockRow key={i.id} item={i} onSave={saveStock} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {notice && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 border border-red-400/50 bg-red-950/80 px-4 py-2 text-xs text-red-200">
            {notice}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`border px-2 py-1 text-[9px] font-semibold uppercase tracking-widest transition-colors ${
        danger ? "border-red-400/40 text-red-300 hover:bg-red-500/20" : "border-gold/30 text-gold hover:bg-gold/10"
      }`}
    >
      {children}
    </button>
  );
}

function StockRow({ item, onSave }: { item: Item; onSave: (id: string, stock: number, available: boolean) => void }) {
  const [stock, setStock] = useState(item.stock);
  const [available, setAvailable] = useState(item.is_available);
  useEffect(() => {
    setStock(item.stock);
    setAvailable(item.is_available);
  }, [item.stock, item.is_available]);
  return (
    <tr className="hover:bg-obsidian/60">
      <td className="py-3 pr-4">{item.name}</td>
      <td className="py-3 pr-4 text-ivory/60">${Number(item.base_price).toLocaleString()}</td>
      <td className="py-3 pr-4 text-ivory/60">{Number(item.surge_multiplier).toFixed(2)}</td>
      <td className="py-3 pr-4">
        <input
          type="number"
          value={stock}
          min={0}
          onChange={(e) => setStock(Number(e.target.value))}
          className="w-20 border border-gold/20 bg-transparent px-2 py-1 text-sm"
        />
      </td>
      <td className="py-3 pr-4">
        <label className="inline-flex items-center gap-2 text-xs">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          on
        </label>
      </td>
      <td className="py-3 pr-4">
        <button
          onClick={() => onSave(item.id, stock, available)}
          className="border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-night"
        >
          save
        </button>
      </td>
    </tr>
  );
}

function merge<T extends { id: string }>(prev: T[], evt: string, oldRow: unknown, newRow: unknown): T[] {
  if (evt === "DELETE") {
    const o = oldRow as T;
    return prev.filter((r) => r.id !== o.id);
  }
  const n = newRow as T;
  const idx = prev.findIndex((r) => r.id === n.id);
  if (idx === -1) return [n, ...prev];
  const copy = prev.slice();
  copy[idx] = n;
  return copy;
}