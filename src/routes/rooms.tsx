import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/trenz/LanguageSwitcher";
import logo from "@/assets/trenz-logo.png.asset.json";

type Room = {
  id: string;
  code: string;
  name: string;
  tier: "standard" | "vip" | "vvip" | "director";
  capacity: number;
  hourly_rate: number;
  description: string | null;
};
type Reservation = {
  id: string;
  room_id: string | null;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 12); // 12:00 -> 23:00
const TIERS: { code: "all" | Room["tier"]; label: string }[] = [
  { code: "all", label: "All" },
  { code: "vvip", label: "VVIP" },
  { code: "vip", label: "VIP" },
  { code: "director", label: "Director" },
  { code: "standard", label: "Standard" },
];

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "TRENZ Suite Availability — Live Booking Calendar" },
      { name: "description", content: "Live calendar of every TRENZ suite. Filter by VIP or VVIP and book conflict-free windows." },
    ],
  }),
  component: RoomsPage,
});

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function RoomsPage() {
  const { t } = useI18n();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [date, setDate] = useState(todayISO());
  const [tier, setTier] = useState<"all" | Room["tier"]>("all");
  const [selected, setSelected] = useState<{ room: Room; hour: number } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", party: 2, notes: "" });
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    supabase
      .from("rooms")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setRooms((data ?? []) as Room[]));
  }, []);

  useEffect(() => {
    supabase
      .from("reservations")
      .select("id,room_id,reservation_date,start_time,end_time,status")
      .eq("reservation_date", date)
      .in("status", ["pending", "confirmed", "seated"])
      .then(({ data }) => setReservations((data ?? []) as Reservation[]));

    const channel = supabase
      .channel(`res-${date}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations", filter: `reservation_date=eq.${date}` },
        () => {
          supabase
            .from("reservations")
            .select("id,room_id,reservation_date,start_time,end_time,status")
            .eq("reservation_date", date)
            .in("status", ["pending", "confirmed", "seated"])
            .then(({ data }) => setReservations((data ?? []) as Reservation[]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);

  const filteredRooms = useMemo(
    () => (tier === "all" ? rooms : rooms.filter((r) => r.tier === tier)),
    [rooms, tier],
  );

  function isBooked(roomId: string, hour: number) {
    return reservations.some((r) => {
      if (r.room_id !== roomId) return false;
      const [sH] = r.start_time.split(":").map(Number);
      const [eH] = r.end_time.split(":").map(Number);
      return hour >= sH && hour < eH;
    });
  }

  async function submitBooking() {
    if (!selected) return;
    setMsg(null);
    const start = `${String(selected.hour).padStart(2, "0")}:00`;
    const end = `${String(selected.hour + 1).padStart(2, "0")}:00`;
    const { error } = await supabase.from("reservations").insert({
      room_id: selected.room.id,
      guest_name: form.name,
      guest_email: form.email,
      guest_phone: form.phone || null,
      party_size: form.party,
      reservation_date: date,
      start_time: start,
      end_time: end,
      notes: form.notes || null,
      status: "pending",
    });
    if (error) {
      if (error.message.includes("ROOM_CONFLICT")) setMsg({ kind: "err", text: t("reserve.conflict") });
      else setMsg({ kind: "err", text: t("reserve.error") });
      return;
    }
    setMsg({ kind: "ok", text: t("reserve.success") });
    setSelected(null);
    setForm({ name: "", email: "", phone: "", party: 2, notes: "" });
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

      <main className="mx-auto max-w-7xl px-6 py-10">
        <span className="eyebrow mb-3 block">{t("rooms.title")}</span>
        <h1 className="font-serif text-3xl md:text-5xl">{t("rooms.subtitle")}</h1>

        <div className="mt-8 flex flex-wrap items-end gap-6 border-y border-gold/10 py-6">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-ivory/50">
              {t("rooms.date")}
            </label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gold/30 bg-transparent px-3 py-2 text-sm text-ivory"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-ivory/50">
              {t("rooms.filter")}
            </label>
            <div className="flex gap-1">
              {TIERS.map((x) => (
                <button
                  key={x.code}
                  onClick={() => setTier(x.code)}
                  className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                    tier === x.code
                      ? "bg-gold text-night"
                      : "border border-gold/20 text-ivory/70 hover:text-gold"
                  }`}
                >
                  {x.code === "all" ? t("rooms.all") : x.label}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4 text-[10px] uppercase tracking-widest text-ivory/50">
            <span className="inline-flex items-center gap-2">
              <i className="inline-block h-3 w-3 border border-gold/40 bg-transparent" /> {t("rooms.free")}
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="inline-block h-3 w-3 bg-red-400/40" /> {t("rooms.booked")}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {filteredRooms.map((room) => (
            <div key={room.id} className="border border-gold/10 bg-obsidian p-5">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-serif text-xl text-ivory">{room.name}</h3>
                    <span className="border border-gold/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-gold">
                      {room.tier}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-ivory/50">
                    {t("rooms.capacity")} {room.capacity} · ${room.hourly_rate}/{t("rooms.hourly")}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1 md:grid-cols-12">
                {HOURS.map((h) => {
                  const booked = isBooked(room.id, h);
                  return (
                    <button
                      key={h}
                      disabled={booked}
                      onClick={() =>
                        setSelected({ room, hour: h })
                      }
                      className={`flex flex-col items-center py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                        booked
                          ? "cursor-not-allowed bg-red-400/20 text-red-200/60"
                          : "border border-gold/20 text-ivory/70 hover:border-gold hover:bg-gold/10 hover:text-gold"
                      }`}
                    >
                      <span>{String(h).padStart(2, "0")}:00</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/80 p-0 md:items-center md:p-4" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-lg border border-gold/30 bg-obsidian p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gold">{selected.room.tier}</div>
                <h3 className="font-serif text-2xl">{selected.room.name}</h3>
                <p className="text-xs text-ivory/50">
                  {date} · {String(selected.hour).padStart(2, "0")}:00 – {String(selected.hour + 1).padStart(2, "0")}:00
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-ivory/50 hover:text-gold">✕</button>
            </div>
            <div className="grid gap-3">
              <input
                required
                placeholder={t("reserve.name")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gold/20 bg-transparent px-3 py-2 text-sm"
              />
              <input
                required
                type="email"
                placeholder={t("reserve.email")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-gold/20 bg-transparent px-3 py-2 text-sm"
              />
              <input
                placeholder={t("reserve.phone")}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-gold/20 bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                max={selected.room.capacity}
                placeholder={t("reserve.party")}
                value={form.party}
                onChange={(e) => setForm({ ...form, party: Number(e.target.value) })}
                className="border border-gold/20 bg-transparent px-3 py-2 text-sm"
              />
              <textarea
                placeholder={t("reserve.notes")}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="border border-gold/20 bg-transparent px-3 py-2 text-sm"
              />
              <button
                onClick={submitBooking}
                disabled={!form.name || !form.email}
                className="mt-2 bg-gold px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-night disabled:opacity-50"
              >
                {t("rooms.book")}
              </button>
              {msg && (
                <div className={`text-xs ${msg.kind === "ok" ? "text-gold" : "text-red-300"}`}>{msg.text}</div>
              )}
            </div>
          </div>
        </div>
      )}
      {msg && !selected && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 border px-4 py-2 text-xs ${
          msg.kind === "ok" ? "border-gold/50 bg-obsidian text-gold" : "border-red-400/50 bg-red-950/80 text-red-200"
        }`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}