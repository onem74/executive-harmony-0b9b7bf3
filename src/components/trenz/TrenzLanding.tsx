import { useEffect, useState } from "react";
import logo from "@/assets/trenz-logo.png.asset.json";
import hero from "@/assets/trenz-hero.png.asset.json";
import roomBlue from "@/assets/room-blue.png.asset.json";
import roomDiamond from "@/assets/room-diamond.png.asset.json";
import corridor from "@/assets/corridor.png.asset.json";

const NAV_LINKS = [
  { label: "Suites", href: "#suites" },
  { label: "Karaoke", href: "#karaoke" },
  { label: "Bar", href: "#bar" },
  { label: "Membership", href: "#membership" },
  { label: "Reserve", href: "#reserve" },
];

const SUITES = [
  {
    tier: "Tier IV",
    name: "The Director's Suite",
    seats: "Seats 20 · Private terrace",
    price: "From $1,800 / night",
    detail:
      "The pinnacle of TRENZ. Dedicated butler, walk-in cellar, and a soundproofed stage suite for after-hours negotiations that end in an encore.",
    image: hero.url,
    accent: true,
  },
  {
    tier: "Tier III",
    name: "The Obsidian VVIP",
    seats: "Seats 12 · Panoramic views",
    price: "From $980 / night",
    detail:
      "Cobalt-lit chevron walls, acoustic velvet, and a private bar. Engineered for boardroom escapes that never leave a footprint online.",
    image: roomBlue.url,
  },
  {
    tier: "Tier II",
    name: "The Cognac Parlour",
    seats: "Seats 8 · Rare spirits",
    price: "From $620 / night",
    detail:
      "Warm oak, brushed diamond wallpaper, and a curated tasting menu. An intimate reserve for the deal that closes over one more song.",
    image: roomDiamond.url,
  },
  {
    tier: "Tier I",
    name: "The Executive Standard",
    seats: "Seats 4-6 · KEF audio",
    price: "From $340 / night",
    detail:
      "A precisely tuned room for the smaller ensemble. All the acoustics, all the discretion, none of the theatre.",
    image: corridor.url,
  },
];

const STATS = [
  { value: "80K+", label: "Global catalog" },
  { value: "Pro", label: "Studio-grade audio" },
  { value: "4K", label: "HDR visuals" },
  { value: "24/7", label: "Concierge" },
];

const BOTTLES = [
  { name: "Louis XIII de Rémy Martin", note: "Cognac · House reserve", price: "$4,800" },
  { name: "Macallan 25 Sherry Oak", note: "Single malt · Vintage", price: "$3,200" },
  { name: "Dom Pérignon Vintage 2013", note: "Champagne · Chilled", price: "$780" },
  { name: "Hibiki 21 Harmony", note: "Japanese whisky · Rare", price: "$1,650" },
  { name: "Clase Azul Ultra", note: "Tequila añejo · Decanter", price: "$2,400" },
  { name: "Krug Grande Cuvée", note: "Champagne · 171ème", price: "$540" },
];

const MEMBERSHIP = [
  {
    name: "Silver Key",
    price: "$2,400 / yr",
    perks: [
      "Priority reservation window",
      "Complimentary house pours on arrival",
      "Two guest passes per visit",
    ],
  },
  {
    name: "Gold Signet",
    price: "$6,800 / yr",
    perks: [
      "Reserved suite of your preference",
      "Personal bottle locker",
      "Dedicated concierge line",
      "Executive event invitations",
    ],
    featured: true,
  },
  {
    name: "Black Cardholder",
    price: "By invitation",
    perks: [
      "Unlimited Director's Suite access",
      "After-hours entry",
      "Global partner club reciprocity",
      "Private butler on standby",
    ],
  },
];

export function TrenzLanding() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <div className="min-h-screen bg-night text-ivory">
      <Nav scrolled={scrolled} />
      <Hero />
      <Marquee />
      <About />
      <Suites />
      <Karaoke />
      <Bar />
      <Membership />
      <Reserve />
      <Footer />
    </div>
  );
}

function Nav({ scrolled }: { scrolled: boolean }) {
  return (
    <nav
      className={`fixed top-0 z-50 w-full px-6 md:px-10 transition-all duration-500 ${
        scrolled
          ? "bg-night/85 backdrop-blur-md py-4 border-b border-gold/10"
          : "py-6 md:py-8"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <img src={logo.url} alt="TRENZ" className="h-9 w-9 object-contain" />
          <span className="font-serif text-lg tracking-[0.4em] text-gold">TRENZ</span>
        </a>
        <div className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[11px] font-medium uppercase tracking-[0.28em] text-ivory/75 transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#reserve"
          className="hidden border border-gold/50 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold hover:text-night md:inline-block"
        >
          Request Entry
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="top" className="relative flex h-[100svh] min-h-[720px] items-center justify-center overflow-hidden">
      <img
        src={hero.url}
        alt="TRENZ interior — private karaoke suite with gold and cobalt lighting"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/40 to-night" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-night)_85%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <span className="eyebrow mb-8 inline-block">Est. Executive Club · Karaoke</span>
        <h1 className="mb-8 text-balance font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
          Where <span className="italic text-gold">Success</span> meets
          <br />
          the Spotlight.
        </h1>
        <p className="mx-auto mb-12 max-w-xl text-pretty text-base text-ivory/70 md:text-lg">
          An exclusive sanctuary for the city&rsquo;s decision-makers. Private
          suites, artisanal spirits, and the world&rsquo;s finest karaoke acoustics.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#reserve"
            className="group inline-flex items-center gap-3 bg-gold px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-night transition-all hover:bg-gold-soft"
          >
            Request Entry
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#suites"
            className="inline-flex items-center gap-3 border border-ivory/20 px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-ivory transition-colors hover:border-gold hover:text-gold"
          >
            Explore Suites
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-[9px] uppercase tracking-[0.4em] text-gold/60">Scroll</span>
        <div className="h-14 w-px bg-gradient-to-b from-gold/60 to-transparent" />
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Connect",
    "Relax",
    "Sing",
    "Succeed",
    "Executive Environment",
    "Premium Experience",
    "Unforgettable Moments",
  ];
  return (
    <div className="overflow-hidden border-y border-gold/10 bg-obsidian py-5">
      <div className="flex animate-[marquee_38s_linear_infinite] gap-16 whitespace-nowrap font-serif text-2xl italic text-gold/60 md:text-3xl">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-16">
            {t}
            <span className="text-gold/30">✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0);} to { transform: translateX(-33.333%);} }`}</style>
    </div>
  );
}

function About() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-32 md:px-10 md:py-40">
      <div className="grid gap-16 md:grid-cols-12 md:gap-24">
        <div className="md:col-span-5">
          <span className="eyebrow mb-6 block">The House</span>
          <h2 className="text-balance font-serif text-4xl leading-[1.05] md:text-6xl">
            A quiet luxury, <span className="italic text-gold">loudly</span> earned.
          </h2>
        </div>
        <div className="space-y-6 text-ivory/70 md:col-span-6 md:col-start-7">
          <p className="text-lg leading-relaxed">
            TRENZ was built for the meetings that matter after the meeting.
            Every suite is engineered around a single principle: what happens
            inside these walls stays perfectly in tune.
          </p>
          <p className="leading-relaxed text-ivory/55">
            Brushed brass, hand-tufted velvet, and a catalog of 80,000+ titles
            in loss-less audio. From bottle service to bespoke playlists, every
            detail is considered so you never have to.
          </p>
          <div className="gold-rule my-10" />
          <div className="grid grid-cols-3 gap-6">
            <Stat n="12" l="Private suites" />
            <Stat n="4" l="Signature tiers" />
            <Stat n="18" l="Years of hosting" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-serif text-4xl text-gold md:text-5xl">{n}</div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-ivory/40">{l}</div>
    </div>
  );
}

function Suites() {
  return (
    <section id="suites" className="border-t border-gold/10 bg-obsidian py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="eyebrow mb-6 block">The Private Collection</span>
            <h2 className="max-w-xl text-balance font-serif text-4xl leading-tight md:text-6xl">
              Four suites. One standard of <span className="italic text-gold">unreasonable care.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ivory/55">
            Every room is sound-engineered for absolute privacy and outfitted
            with bespoke furniture, custom lighting, and a dedicated host.
          </p>
        </div>

        <div className="space-y-24">
          {SUITES.map((s, i) => (
            <article
              key={s.name}
              className={`grid items-center gap-10 md:grid-cols-12 md:gap-16 ${
                i % 2 === 1 ? "md:[direction:rtl]" : ""
              }`}
            >
              <div className="relative md:col-span-7 md:[direction:ltr]">
                <div className="group relative overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
                  <div className="absolute left-0 top-6 bg-gold px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-night">
                    {s.tier}
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 md:[direction:ltr]">
                <h3 className="mb-3 font-serif text-3xl md:text-5xl">{s.name}</h3>
                <p className="mb-6 text-[11px] uppercase tracking-[0.28em] text-gold/80">
                  {s.seats}
                </p>
                <p className="mb-8 text-ivory/65 leading-relaxed">{s.detail}</p>
                <div className="gold-rule mb-6 w-16" />
                <div className="flex flex-wrap items-center gap-6">
                  <span className="font-serif text-xl text-ivory">{s.price}</span>
                  <a
                    href="#reserve"
                    className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold transition-colors hover:text-gold-soft"
                  >
                    Reserve this suite <span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Karaoke() {
  return (
    <section id="karaoke" className="relative overflow-hidden py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-16 text-center">
          <span className="eyebrow mb-6 block">The Performance</span>
          <h2 className="mx-auto max-w-3xl text-balance font-serif text-4xl leading-[1.05] md:text-6xl">
            Unrivaled <span className="italic text-gold">acoustic</span> mastery.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-ivory/60">
            Studio-grade microphones, discrete acoustic tuning per suite, and a
            live catalog you navigate from a private tablet.
          </p>
        </div>

        <div className="grid gap-px border border-gold/10 bg-gold/10 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-night p-10 text-center transition-colors hover:bg-obsidian"
            >
              <div className="font-serif text-4xl text-gold md:text-5xl">{s.value}</div>
              <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-ivory/45">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <h3 className="mb-4 font-serif text-3xl md:text-4xl">Curated by our music director.</h3>
            <p className="text-ivory/60 leading-relaxed">
              From Sinatra to Sade, Bowie to Björk — a living catalog of
              80,000+ high-fidelity titles across eight languages. Request in
              advance and it&rsquo;s cued before you sit down.
            </p>
          </div>
          <div className="border border-gold/15 bg-obsidian p-6 font-mono text-xs md:text-sm">
            <div className="mb-4 flex items-center justify-between border-b border-gold/10 pb-3 text-gold/80">
              <span>TONIGHT&apos;S QUEUE</span>
              <span className="text-gold">LIVE</span>
            </div>
            <ul className="space-y-3 text-ivory/70">
              {[
                ["Sinatra, F.", "My Way"],
                ["Wonder, S.", "Superstition"],
                ["Sade", "Smooth Operator"],
                ["Bowie, D.", "Life on Mars?"],
                ["Fitzgerald, E.", "Dream a Little Dream"],
                ["Radiohead", "Creep · Acoustic"],
              ].map(([a, t]) => (
                <li key={t} className="flex items-baseline justify-between gap-6 border-b border-white/5 pb-2 last:border-none">
                  <span className="truncate">{a}</span>
                  <span className="text-ivory/50">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bar() {
  return (
    <section id="bar" className="border-y border-gold/10 bg-obsidian py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="eyebrow mb-6 block">Bottle Service</span>
            <h2 className="max-w-xl text-balance font-serif text-4xl md:text-6xl">
              The <span className="italic text-gold">reserve</span> shelf.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ivory/55">
            A tightly-curated cellar. Members may store personal bottles in a
            private locker — poured only in your presence.
          </p>
        </div>
        <div className="grid gap-px bg-gold/10 md:grid-cols-2">
          {BOTTLES.map((b) => (
            <div key={b.name} className="flex items-baseline justify-between gap-6 bg-obsidian p-8 transition-colors hover:bg-night">
              <div>
                <div className="font-serif text-xl text-ivory">{b.name}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-ivory/40">
                  {b.note}
                </div>
              </div>
              <div className="font-serif text-xl text-gold">{b.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Membership() {
  return (
    <section id="membership" className="mx-auto max-w-7xl px-6 py-32 md:px-10 md:py-40">
      <div className="mb-16 text-center">
        <span className="eyebrow mb-6 block">Membership</span>
        <h2 className="mx-auto max-w-3xl text-balance font-serif text-4xl md:text-6xl">
          By <span className="italic text-gold">invitation</span>, kept by intention.
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {MEMBERSHIP.map((m) => (
          <div
            key={m.name}
            className={`relative flex flex-col border p-10 transition-colors ${
              m.featured
                ? "border-gold bg-gradient-to-b from-gold/10 to-transparent"
                : "border-gold/15 hover:border-gold/40"
            }`}
          >
            {m.featured && (
              <div className="absolute -top-3 left-10 bg-gold px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-night">
                Most requested
              </div>
            )}
            <h3 className="font-serif text-3xl">{m.name}</h3>
            <p className="mt-2 font-serif text-lg italic text-gold">{m.price}</p>
            <div className="gold-rule my-8 w-12" />
            <ul className="space-y-4 text-sm text-ivory/70">
              {m.perks.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-1.5 h-px w-4 flex-shrink-0 bg-gold/60" />
                  {p}
                </li>
              ))}
            </ul>
            <a
              href="#reserve"
              className={`mt-10 inline-block border py-3 text-center text-[10px] font-semibold uppercase tracking-[0.3em] transition-colors ${
                m.featured
                  ? "border-gold bg-gold text-night hover:bg-gold-soft"
                  : "border-gold/40 text-gold hover:bg-gold hover:text-night"
              }`}
            >
              Enquire
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function Reserve() {
  const [state, setState] = useState<"idle" | "sent">("idle");
  return (
    <section id="reserve" className="relative overflow-hidden py-32 md:py-40">
      <img
        src={roomBlue.url}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-night/85" />
      <div className="relative mx-auto max-w-3xl px-6">
        <div className="border border-gold/25 bg-obsidian/85 p-8 backdrop-blur md:p-14">
          <div className="mb-12 text-center">
            <span className="eyebrow mb-6 block">Reservations</span>
            <h2 className="font-serif text-4xl md:text-5xl">Secure your evening.</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-ivory/55">
              Same-day and parties larger than 30 — please reach our concierge
              directly at{" "}
              <a href="tel:+622150000000" className="text-gold underline-offset-4 hover:underline">
                +62 21 5000 0000
              </a>
              .
            </p>
          </div>

          {state === "sent" ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-2xl text-gold">
                ✓
              </div>
              <h3 className="mb-2 font-serif text-2xl">Request received.</h3>
              <p className="mx-auto max-w-sm text-sm text-ivory/60">
                Our concierge will confirm your suite within the hour.
              </p>
            </div>
          ) : (
            <form
              className="grid gap-8 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setState("sent");
              }}
            >
              <Field label="Full name" placeholder="Alexander Chen" name="name" required />
              <Field label="Contact" placeholder="+62 812 3456 7890" name="phone" required />
              <Field label="Date" type="date" name="date" required />
              <Field label="Arrival" type="time" name="time" required />
              <Select
                label="Suite tier"
                name="tier"
                options={[
                  "The Executive Standard",
                  "The Cognac Parlour · VIP",
                  "The Obsidian · VVIP",
                  "The Director's Suite",
                ]}
              />
              <Select
                label="Party size"
                name="party"
                options={["2 – 4 guests", "5 – 8 guests", "9 – 12 guests", "13 – 20 guests"]}
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-gold/70">
                  Requests
                </label>
                <textarea
                  rows={3}
                  placeholder="Pre-order bottle service, dietary notes, occasion…"
                  className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="mt-6 border border-gold bg-gold py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-night transition-colors hover:bg-gold-soft md:col-span-2"
              >
                Confirm Reservation
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-gold/70">
        {label}
      </label>
      <input
        {...rest}
        className="w-full border-b border-white/10 bg-transparent py-3 text-sm text-ivory placeholder:text-ivory/25 focus:border-gold focus:outline-none [color-scheme:dark]"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-gold/70">
        {label}
      </label>
      <select
        name={name}
        className="w-full border-b border-white/10 bg-transparent py-3 text-sm text-ivory focus:border-gold focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-obsidian text-ivory">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-obsidian py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <img src={logo.url} alt="TRENZ" className="h-10 w-10 object-contain" />
              <span className="font-serif text-lg tracking-[0.4em] text-gold">TRENZ</span>
            </div>
            <p className="mt-6 max-w-[26ch] text-sm text-ivory/45 leading-relaxed">
              Executive Club &amp; Karaoke. Members and their guests only.
            </p>
          </div>

          <FooterCol title="Visit">
            <p>Sudirman Central Business District</p>
            <p>Equity Tower, Level 45</p>
            <p>Jakarta, Indonesia</p>
          </FooterCol>

          <FooterCol title="Hours">
            <p>Mon – Thu · 18:00 – 02:00</p>
            <p>Fri – Sat · 18:00 – 04:00</p>
            <p>Sun · Private events only</p>
          </FooterCol>

          <FooterCol title="Connect">
            <a href="#" className="block hover:text-gold">Instagram</a>
            <a href="#" className="block hover:text-gold">Concierge</a>
            <a href="tel:+622150000000" className="block hover:text-gold">+62 21 5000 0000</a>
          </FooterCol>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-[10px] uppercase tracking-[0.3em] text-ivory/25 md:flex-row">
          <span>© {new Date().getFullYear()} TRENZ Executive Club</span>
          <span>Connect · Relax · Sing · Succeed</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="mb-5 text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
        {title}
      </h5>
      <div className="space-y-2 text-sm text-ivory/50">{children}</div>
    </div>
  );
}