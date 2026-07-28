import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { essentialFaqs } from "@/data/faq";
import { getContent, getEventFrom } from "@/lib/content";
import { SectionLabel, VoltLink, GhostLink, Bib } from "@/components/ui";
import { Marquee } from "@/components/Marquee";
import { FilmBlock } from "@/components/FilmBlock";
import { AdRail } from "@/components/AdRail";
import { MerchCards } from "@/components/MerchCards";
import { SponsorStrip } from "@/components/SponsorStrip";

export const metadata: Metadata = {
  // Home keeps the site-wide default title shape — bypass the layout template.
  title: { absolute: "NO CORRO NADA — Run club de Costa Rica" },
  description:
    "NO CORRO NADA es el run club de Costa Rica: gratis, sin niveles, todos los domingos 8:00 AM en San José. Un club de running que arranca — sumate y corré el BUNKER GP.",
  alternates: { canonical: "/" },
};

// FilmBlock reads content (code default + /admin override); keep it fresh.
export const revalidate = 60;

const paceGroups = ["5:30", "7:30", "9:00+"];

const steps = [
  {
    n: "01",
    label: "Firmá la exoneración",
    line: "La carta de responsabilidad. Se firma una vez y quedás.",
  },
  {
    n: "02",
    label: "Dejá tu correo y número",
    line: "Caés en el newsletter y en el grupo de WhatsApp donde se anuncia todo.",
  },
  {
    n: "03",
    label: "Llegá el domingo",
    line: "8:00 AM, punto rotativo. Traé tenis, agua y buena actitud.",
  },
];

const stats = [
  { n: "+4,000", label: "En Strava" },
  { n: "+18K", label: "En Instagram" },
  { n: "100+", label: "Cada domingo" },
  { n: "₡0", label: "Para siempre", volt: true },
];

/** es-CR short date for the hero flag. */
function flagDate(iso?: string, recurrence?: string): string {
  if (iso) {
    return new Intl.DateTimeFormat("es-CR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Costa_Rica",
    }).format(new Date(iso));
  }
  return recurrence ?? "Fecha por anunciar";
}

export default async function Home() {
  const { events } = await getContent();
  const domingo = getEventFrom(events, "domingo-sj") ?? events[0];
  // Hero flag: the run marked "featured" in /admin (single-select toggle).
  const featured =
    events.find((e) => e.featured && e.status !== "past") ?? domingo;

  return (
    <>
      {/* 1 — HERO */}
      <section className="flex min-h-[calc(100svh-3.5rem)] items-center border-b hairline">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="checker mb-8 w-28" aria-hidden />
          <SectionLabel>Run club · San José, Costa Rica</SectionLabel>

          <h1 className="display mt-6 text-7xl leading-[0.86] sm:text-9xl">
            <span className="block">No corro</span>
            <span
              className="block"
              style={{
                WebkitTextStroke: "1.5px var(--ink)",
                color: "transparent",
              }}
            >
              Nada
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-xl text-ink sm:text-2xl">
            {site.tagline}
          </p>
          <p className="label-mono mt-4 text-muted">Domingos · 8:00 AM · ~5K</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <VoltLink href="/unite">Unite al club</VoltLink>
            <GhostLink href={site.social.strava} external>
              Seguinos en Strava ↗
            </GhostLink>
          </div>

          {/* NEXT-RUN FLAG — the run toggled as "portada" in /admin */}
          <Link
            href={featured.slug === "bunker-gp" ? "/bunker-gp" : "/corridas"}
            className="group mt-8 inline-flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 border hairline border-l-4 border-l-volt bg-asphalt px-5 py-4 transition-colors hover:border-volt"
          >
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping bg-volt opacity-60" />
              <span className="relative inline-flex h-2 w-2 bg-volt" />
            </span>
            <span className="label-mono text-volt">Próxima corrida</span>
            <span className="display text-lg text-ink sm:text-xl">
              {featured.title}
            </span>
            <span className="label-mono text-muted">
              {flagDate(featured.dateISO, featured.recurrence)}
            </span>
            <span
              className="label-mono text-muted transition-colors group-hover:text-volt"
              aria-hidden
            >
              →
            </span>
          </Link>
        </div>
      </section>

      {/* 2 — MARQUEE STRIP */}
      <div className="border-b hairline py-3">
        <Marquee
          text="Siempre gratis — Domingos 8AM — Buena actitud y cero excusas"
          className="text-volt"
          durationSeconds={75}
        />
      </div>

      {/* 2b — SPONSORS */}
      <div className="border-b hairline">
        <SponsorStrip />
      </div>

      {/* 3 — PRÓXIMO ENTRENO */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionLabel>Próximo entreno</SectionLabel>

          <div className="mt-8 border hairline bg-asphalt">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b hairline px-6 py-5 sm:px-8">
              <p className="label-mono text-muted">{domingo.recurrence}</p>
              <span className="label-mono inline-block border hairline px-3 py-1.5 text-muted">
                Confirmado cada semana
              </span>
            </div>

            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <h2 className="display text-4xl sm:text-6xl">{domingo.title}</h2>
              <p className="label-mono mt-4 text-muted">
                {domingo.location.name}
              </p>
              <p className="mt-6 max-w-2xl text-muted">{domingo.description}</p>

              <div className="mt-8">
                <p className="label-mono mb-3 text-muted">
                  Grupos de ritmo · min/km
                </p>
                <div className="grid max-w-md grid-cols-3 border-l border-t hairline">
                  {paceGroups.map((p) => (
                    <div
                      key={p}
                      className="border-b border-r hairline px-4 py-5 text-center"
                    >
                      <span className="display text-2xl sm:text-3xl">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <GhostLink href="/corridas">
                  Ver el calendario de corridas
                </GhostLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — EL FILM */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionLabel>Cine NCN</SectionLabel>
          <p className="mt-6 max-w-xl text-xl text-ink sm:text-2xl">
            Corremos y lo filmamos.
          </p>

          <div className="mt-10">
            <FilmBlock />
          </div>

          <div className="mt-10">
            <GhostLink href="/media">Ver fotos y videos</GhostLink>
          </div>
        </div>
      </section>

      {/* 5 — AD RAIL (renders nothing while empty) */}
      <AdRail slot="home" />

      {/* 6 — BUNKER GP TEASER */}
      <div className="checker-volt" aria-hidden />
      <section
        className="border-b hairline"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--line) 0 1px, transparent 1px 16px)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32">
          <p className="label-mono text-muted">
            Round 01 · Primera carrera del club
          </p>
          <h2 className="display mt-6 text-6xl sm:text-8xl">Bunker GP</h2>
          <p className="mt-6 max-w-xl text-lg text-ink">
            Un circuito en un parqueo subterráneo. Vueltas, rampas, neón y
            cemento.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="label-mono inline-block border border-volt/50 px-3 py-1.5 text-volt">
              Inscripciones pronto
            </span>
          </div>

          <div className="mt-10">
            <GhostLink href="/bunker-gp">Conocé la carrera</GhostLink>
          </div>
        </div>
      </section>

      {/* 5 — CÓMO UNIRTE */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionLabel>Cómo unirte</SectionLabel>

          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <Bib n={s.n} label={s.label} />
                <p className="mt-5 max-w-xs text-muted">{s.line}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <VoltLink href="/unite">Unite al club</VoltLink>
          </div>
        </div>
      </section>

      {/* 6 — COMUNIDAD / STRAVA */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionLabel>La comunidad</SectionLabel>

          <div className="mt-10 grid grid-cols-2 border-l border-t hairline sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="border-b border-r hairline px-5 py-8 sm:px-6 sm:py-10"
              >
                <p
                  className={`display text-4xl sm:text-5xl ${
                    s.volt ? "text-volt" : "text-ink"
                  }`}
                >
                  {s.n}
                </p>
                <p className="label-mono mt-3 text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <VoltLink href={site.social.strava} external>
              Sumate en Strava ↗
            </VoltLink>
          </div>
        </div>
      </section>

      {/* 7 — SPONSORS */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionLabel>El equipo</SectionLabel>

          <div className="mt-8 border-t hairline">
            {site.sponsors.map((sp) => (
              <div
                key={sp.name}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b hairline py-5"
              >
                <span className="display text-2xl sm:text-3xl">{sp.name}</span>
                <span className="label-mono text-muted">{sp.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7b — MERCH · training plans */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionLabel>Merch · NCN x Athals</SectionLabel>
          <h2 className="display mt-6 text-4xl sm:text-6xl">
            Entrená con el club
          </h2>

          <div className="mt-10">
            <MerchCards />
          </div>
        </div>
      </section>

      {/* 8 — FAQ TEASER */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionLabel>Dudas frecuentes</SectionLabel>

          <div className="mt-8 border-t hairline">
            {essentialFaqs.map((f) => (
              <details key={f.q} className="group border-b hairline py-5">
                <summary className="label-mono flex cursor-pointer items-center justify-between gap-4 text-ink transition-colors hover:text-volt [&::-webkit-details-marker]:hidden">
                  <span>{f.q}</span>
                  <span
                    className="text-volt transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-muted">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10">
            <GhostLink href="/faq">Todas las preguntas</GhostLink>
          </div>
        </div>
      </section>
    </>
  );
}
