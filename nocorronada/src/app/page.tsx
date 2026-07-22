import type { Metadata } from "next";
import { site } from "@/config/site";
import { getEvent } from "@/data/events";
import { essentialFaqs } from "@/data/faq";
import { SectionLabel, VoltLink, GhostLink, Bib } from "@/components/ui";
import { Marquee } from "@/components/Marquee";
import { FilmBlock } from "@/components/FilmBlock";
import { AdRail } from "@/components/AdRail";
import { MerchCards } from "@/components/MerchCards";

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

export default function Home() {
  const domingo = getEvent("domingo-sj")!;

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
        </div>
      </section>

      {/* 2 — MARQUEE STRIP */}
      <div className="border-b hairline py-3">
        <Marquee
          text="Siempre gratis — Domingos 8AM — Buena actitud y cero excusas"
          className="text-volt"
          durationSeconds={32}
        />
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
