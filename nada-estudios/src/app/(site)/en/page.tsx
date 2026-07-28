import type { Metadata } from "next";
import Link from "next/link";
import { site, clients } from "@/config/site";
import { packages, addOns, formatUsd } from "@/data/services";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import { JsonLd, serviceJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "NADA Estudios — Nearshore Content Production, Costa Rica / CDMX / NYC",
  description:
    "Content production for US brands, produced in LatAm at LatAm cost, US quality bar. Video, photo and social content out of Costa Rica and Mexico City, managed same-timezone from New York. Published USD pricing.",
  keywords: [
    "content production agency costa rica",
    "video production company costa rica",
    "nearshore content production latam",
    "social media agency costa rica",
  ],
  alternates: {
    canonical: `${site.url}/en`,
    languages: {
      es: site.url,
      en: `${site.url}/en`,
      "x-default": site.url,
    },
  },
  openGraph: {
    title: "NADA Estudios — Nearshore Content Production",
    description:
      "Content production for US brands, produced in LatAm at LatAm cost, US quality bar.",
    locale: "en_US",
  },
};

const paquetes = packages.map((p) => ({
  ...p,
  usdRange:
    p.id === "a" ? "1–10 person marketing teams" : p.id === "b" ? "growing brands" : "multi-market accounts",
}));

const addonSample = addOns.slice(0, 6);

export default function EnPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "NADA Estudios — Nearshore Content Production",
          description:
            "Content production for US brands, produced in LatAm at LatAm cost, US quality bar.",
          url: `${site.url}/en`,
          offers: packages.map((p) => ({ name: p.name, price: p.price })),
        })}
      />

      <section className="border-b-2 border-ink px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-4 text-mid">
              San José · Mexico City · New York
            </p>
            <h1 className="display text-5xl sm:text-6xl md:text-7xl">
              A content studio in Costa Rica, Mexico City &amp; New York.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-mid">
              Published pricing. Tier-1 brands. Content production for US
              brands, produced in LatAm at LatAm cost, US quality bar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/empezar?src=en" className="btn btn-accent">
                Start a project →
              </Link>
              <a href={`mailto:${site.email}`} className="btn btn-ghost">
                {site.email}
              </a>
              <a href={site.whatsappUrl} className="btn btn-ghost">
                WhatsApp →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Marquee className="border-b-2 border-ink bg-smoke py-4" duration={26}>
        {clients.map((name) => (
          <span key={name} className="label-mono mx-6 text-mid">
            {name}
          </span>
        ))}
      </Marquee>

      <section className="border-b-2 border-ink px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-8 text-mid">What we do</p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  title: "Video",
                  body: "Short-form verticals, long-form and motion graphics, shot and edited on schedule.",
                },
                {
                  title: "Photo",
                  body: "Corporate, product and event photography — studio or on location.",
                },
                {
                  title: "Social",
                  body: "Monthly content calendars, publishing and paid media add-ons.",
                },
              ].map((s) => (
                <div key={s.title}>
                  <h3 className="display text-2xl">{s.title}</h3>
                  <p className="mt-2 text-mid">{s.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b-2 border-ink px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-2 text-mid">Monthly retainers, USD</p>
            <h2 className="display mb-8 text-3xl sm:text-4xl">
              Published pricing. No sales call required.
            </h2>
          </Reveal>
          <div className="divide-y-2 divide-ink border-y-2 border-ink">
            {paquetes.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <div className="py-6">
                  <div className="leader">
                    <span className="leader-name text-base sm:text-lg">
                      {p.name} — {p.summary}
                    </span>
                    <span className="leader-price text-base sm:text-lg">
                      {formatUsd(p.price)}/mo
                    </span>
                  </div>
                  <p className="label-mono mt-2 text-mid">
                    Best for {p.usdRange} · {formatUsd(p.renewalPrice)}/mo after month 3
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="label-mono mt-6 mb-3 text-mid">Add-ons, sample</p>
            <div className="divide-y divide-ink/20">
              {addonSample.map((a) => (
                <div key={a.id} className="leader py-2">
                  <span className="leader-name">{a.name}</span>
                  <span className="leader-price">{a.priceLabel}</span>
                </div>
              ))}
            </div>
            <Link href="/servicios" className="link-under label-mono mt-6 inline-block">
              See the full rate card →
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="border-b-2 border-ink px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-6 text-mid">Brands we've produced for</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {clients.map((name) => (
                <span key={name} className="display text-2xl sm:text-3xl">
                  {name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-8 text-mid">Why nearshore</p>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  title: "Timezone",
                  body: "Costa Rica and Mexico City run on Central/Eastern time. Real-time reviews, no overnight turnaround gaps.",
                },
                {
                  title: "Cost",
                  body: "LatAm production cost with a fixed, published rate card — no US agency markup, no surprise invoices.",
                },
                {
                  title: "Quality bar",
                  body: "Same crews, same gear, same standard we hold for Heineken and Banco Promerica campaigns.",
                },
              ].map((s) => (
                <div key={s.title}>
                  <h3 className="display text-2xl">{s.title}</h3>
                  <p className="mt-2 text-mid">{s.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-ink px-4 py-16 text-paper sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-mono mb-2 text-accent">Let's talk</p>
            <h2 className="display text-3xl sm:text-4xl">
              Tell us what you need, in USD.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/empezar?src=en" className="btn btn-accent whitespace-nowrap">
              Start a project →
            </Link>
            <a
              href={site.whatsappUrl}
              className="btn btn-ghost whitespace-nowrap !border-paper !text-paper hover:!bg-paper hover:!text-ink"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
