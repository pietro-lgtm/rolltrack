import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SectionLabel, VoltLink, GhostLink } from "@/components/ui";
import { Marquee } from "@/components/Marquee";
import { Countdown } from "@/components/bunker/Countdown";
import { getEvent } from "@/data/events";
import { EventJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "BUNKER GP — la carrera en un parqueo subterráneo",
  description:
    "BUNKER GP: la primera carrera de NO CORRO NADA, el run club de San José, Costa Rica. Un circuito de vueltas dentro de un parqueo subterráneo. Cemento, rampas y neón. Fecha y cupos por anunciar — los miembros del club se enteran primero.",
};

const event = getEvent("bunker-gp");

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

const facts: { bay: string; k: string; v: string }[] = [
  {
    bay: "B01",
    k: "Ubicación",
    v: event?.location.name ?? "Parqueo subterráneo · por anunciar",
  },
  { bay: "B02", k: "Fecha", v: formatDate(event?.dateISO) ?? "Por anunciar" },
  {
    bay: "B03",
    k: "Distancia",
    v: event?.distanceKm ? `${event.distanceKm} K` : "Vueltas al circuito",
  },
  { bay: "B04", k: "Cupos", v: "Limitados" },
];

const specChips = [
  "Superficie: Concreto",
  "Iluminación: Neón",
  "Clima: No aplica",
];

const info: { q: string; a: string }[] = [
  {
    q: "Categorías",
    a: "General para arrancar. Categorías por edad y por equipos: por definir. Si querés que haya categoría de disfraces, insistí en el grupo.",
  },
  {
    q: "Inscripción",
    a: "El primer evento pagado del club. Precio y fecha de apertura: por anunciar. Los miembros del club tienen prioridad de cupo — otra razón para unirte antes.",
  },
  {
    q: "Qué incluye",
    a: "Dorsal, cronometraje e hidratación. Todo por confirmar conforme cerramos el parqueo y amarramos los detalles.",
  },
  {
    q: "Reglas",
    a: "Exoneración de responsabilidad firmada, obligatoria. Edad mínima y demás reglas del circuito: por confirmar. Sin carro, obvio.",
  },
];

// Hard-edged diagonal hazard lines — a texture, not a color gradient.
const stripes: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(231,231,226,0.06) 0 1px, transparent 1px 18px)",
};

export default function BunkerGpPage() {
  return (
    <div>
      {/* HEADER */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="label-mono text-muted">NCN Race Series · Round 01</p>

          <h1 className="display mt-6 text-6xl leading-[0.9] sm:text-8xl lg:text-9xl">
            Bunker{" "}
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px var(--ink)" }}
            >
              GP
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg text-muted sm:text-xl">
            La primera carrera de NO CORRO NADA.{" "}
            <span className="text-ink">Bajo tierra.</span>
          </p>

          <div className="mt-8">
            <span className="label-mono inline-block border hairline px-3 py-2 text-muted">
              Aún no anunciado · estás temprano
            </span>
          </div>
        </div>
        <div className="checker-volt" />
      </section>

      {/* TICKER */}
      <section className="border-b hairline py-4">
        <Marquee
          text="Bunker GP · Round 01 · Bajo Tierra · Cupos Limitados"
          className="text-ink"
          durationSeconds={30}
        />
      </section>

      {/* FACTS */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionLabel>La ficha</SectionLabel>
          <div className="mt-8 grid grid-cols-1 border-l border-t hairline sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <div
                key={f.bay}
                className="relative border-b border-r hairline p-6 sm:p-8"
              >
                <span className="label-mono absolute right-5 top-5 text-muted">
                  {f.bay}
                </span>
                <span className="label-mono text-muted">{f.k}</span>
                <p className="display mt-6 text-xl leading-tight sm:text-2xl">
                  {f.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionLabel>Nivel -1 · Cuenta regresiva</SectionLabel>
          <div className="mt-8">
            <Countdown dateISO={event?.dateISO} />
          </div>
        </div>
      </section>

      {/* CIRCUIT */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionLabel>Nivel -2 · El circuito</SectionLabel>
          <div className="relative mt-8 overflow-hidden border hairline bg-asphalt">
            <div aria-hidden className="absolute inset-0" style={stripes} />
            <div className="relative p-8 sm:p-14">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="display max-w-2xl text-3xl leading-[0.95] sm:text-5xl">
                  Cemento, columnas, rampas y neón.
                </h2>
                <span className="label-mono inline-flex items-center gap-2 bg-volt px-3 py-2 text-black">
                  Salida →
                </span>
              </div>
              <p className="mt-6 max-w-xl text-muted">
                Un anillo cerrado bajo la ciudad. Vueltas contra el eco, curvas
                marcadas con cinta, la rampa que odiás en la vuelta cuatro. Sin
                sol, sin excusas, sin idea de la hora.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                {specChips.map((chip) => (
                  <span
                    key={chip}
                    className="label-mono border hairline bg-black px-4 py-3 text-ink"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFO ACCORDION */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionLabel>Nivel -3 · Información del evento</SectionLabel>
          <div className="mt-8 border-t hairline">
            {info.map((item) => (
              <details key={item.q} className="group border-b hairline">
                <summary className="label-mono flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-ink transition-colors hover:text-volt [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span aria-hidden className="text-volt">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="max-w-2xl pb-8 text-muted">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="label-mono mt-8 text-muted">
            Todo lo marcado como &ldquo;por confirmar&rdquo; o &ldquo;por
            anunciar&rdquo; se cierra pronto. Nada de precios inventados.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-asphalt">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <h2 className="display text-5xl leading-[0.9] sm:text-7xl">
            Querés correr esto.
          </h2>
          <p className="mt-6 max-w-xl text-muted">
            Unite al club: los cupos se anuncian primero al newsletter y al grupo
            de WhatsApp. El parqueo es chico y la fila, larga.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <VoltLink href="/unite?source=bunker-gp">Avisame primero</VoltLink>
            <GhostLink href="/eventos">Ver todos los eventos</GhostLink>
          </div>
        </div>
        <div className="checker" />
      </section>

      <EventJsonLd event={getEvent("bunker-gp")!} />
    </div>
  );
}
