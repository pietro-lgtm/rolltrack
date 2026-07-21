import type { Metadata } from "next";
import Link from "next/link";
import { events, getEvent, type ClubEvent, type EventStatus } from "@/data/events";
import { EventJsonLd } from "@/lib/jsonld";
import { SectionLabel, VoltLink } from "@/components/ui";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Eventos y entrenos",
  description:
    "Calendario del club de running en San José, Costa Rica: el entreno de cada domingo (~5K, grupos de ritmo) y carreras como el BUNKER GP. Gratis, sin niveles, todo el mundo cuenta.",
};

/** es-CR long date + time, computed in Costa Rica time so server and client agree. */
function formatEventDate(dateISO: string): string {
  const d = new Date(dateISO);
  const date = new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Costa_Rica",
  }).format(d);
  const time = new Intl.DateTimeFormat("es-CR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Costa_Rica",
  }).format(d);
  return `${date} · ${time}`;
}

/** Map an event status to a pill label and whether inscriptions are "live". */
function statusPill(status: EventStatus): { label: string; live: boolean } {
  switch (status) {
    case "announced":
      return { label: "Inscripciones pronto", live: true };
    case "upcoming":
      return { label: "Inscripciones abiertas", live: true };
    case "soldout":
      return { label: "Agotado", live: false };
    case "past":
      return { label: "Finalizado", live: false };
  }
}

function StatusPill({ status }: { status: EventStatus }) {
  const { label, live } = statusPill(status);
  return (
    <span className="label-mono inline-flex items-center gap-2 border hairline px-3 py-1.5 text-muted">
      <span
        className={`inline-block h-1.5 w-1.5 ${live ? "bg-volt" : "bg-muted"}`}
        aria-hidden
      />
      {label}
    </span>
  );
}

/** A single upcoming-race card. Cards for events with a detail page become links. */
function RaceCard({ event, index }: { event: ClubEvent; index: number }) {
  const detailHref = event.slug === "bunker-gp" ? "/bunker-gp" : undefined;
  const round = String(index + 1).padStart(2, "0");

  const inner = (
    <>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="label-mono text-muted">Round {round}</span>
          <StatusPill status={event.status} />
        </div>

        <h3 className="display mt-5 text-3xl sm:text-4xl">{event.title}</h3>

        <p className="label-mono mt-4 text-muted">
          {event.dateISO ? formatEventDate(event.dateISO) : "Fecha por anunciar"}
        </p>
        <p className="label-mono mt-1 text-muted">{event.location.name}</p>

        <p className="mt-6 max-w-2xl text-muted">{event.description}</p>

        {detailHref && (
          <p className="label-mono mt-8 text-ink transition-colors group-hover:text-volt">
            Ver detalles ↗
          </p>
        )}
      </div>
      {event.slug === "bunker-gp" && <div className="checker-volt" aria-hidden />}
    </>
  );

  if (detailHref) {
    return (
      <Link
        href={detailHref}
        className="group block border hairline bg-asphalt transition-colors hover:border-volt"
      >
        {inner}
      </Link>
    );
  }

  return <article className="border hairline bg-asphalt">{inner}</article>;
}

export default function EventosPage() {
  const weekly = getEvent("domingo");
  const races = events.filter((e) => e.type !== "weekly");
  const datedEvents = events.filter((e) => e.dateISO);

  return (
    <>
      {datedEvents.map((e) => (
        <EventJsonLd key={e.slug} event={e} />
      ))}

      {/* Header */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="label-mono text-muted">Calendario</p>
          <h1 className="display mt-4 text-6xl sm:text-8xl">Eventos</h1>
          <p className="mt-6 max-w-xl text-muted">
            Un club de correr con calendario de verdad: el domingo de siempre y
            las carreras que salen del molde. Todo se confirma primero en
            Instagram y WhatsApp.
          </p>
        </div>
      </section>

      {/* El domingo — the weekly run */}
      {weekly && (
        <section className="border-b hairline">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionLabel>El domingo</SectionLabel>

            <article className="mt-8 border hairline bg-asphalt">
              <div className="checker" aria-hidden />
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="label-mono text-muted">Cada semana</span>
                  <span className="label-mono inline-flex items-center gap-2 border hairline px-3 py-1.5 text-muted">
                    <span
                      className="inline-block h-1.5 w-1.5 bg-volt"
                      aria-hidden
                    />
                    Confirmado cada semana
                  </span>
                </div>

                <h2 className="display mt-5 text-4xl sm:text-6xl">
                  {weekly.title}
                </h2>

                <p className="label-mono mt-5 text-muted">
                  {weekly.recurrence}
                </p>

                <div className="mt-6 border-t hairline pt-6">
                  <p className="label-mono text-muted">Punto de salida</p>
                  <p className="mt-2 text-ink">{weekly.location.name}</p>
                  <p className="mt-1 max-w-xl text-muted">
                    El punto exacto rota y se anuncia cada semana en Instagram y
                    WhatsApp.
                  </p>
                </div>

                <div className="mt-6 border-t hairline pt-6">
                  <p className="label-mono text-muted">
                    Grupos: 5:30 / 7:30 / 9:00+ min/km
                  </p>
                  <p className="mt-3 max-w-xl text-muted">
                    Perros bienvenidos (con correa). Después hay café.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Próximas carreras */}
      {races.length > 0 && (
        <section className="border-b hairline">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionLabel>Próximas carreras</SectionLabel>

            <div className="mt-8 flex flex-col gap-6">
              {races.map((e, i) => (
                <RaceCard key={e.slug} event={e} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Strava / rutas */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionLabel>Rutas</SectionLabel>
          <h2 className="display mt-6 text-3xl sm:text-5xl">
            Cada kilómetro queda registrado
          </h2>
          <p className="mt-6 max-w-xl text-muted">
            Las rutas de cada domingo viven en nuestro club de Strava (+4,000
            miembros). Seguinos, sumá tus kilómetros y no te perdás por dónde
            vamos.
          </p>
          <div className="mt-8">
            <VoltLink href={site.social.strava} external>
              Ver rutas en Strava
            </VoltLink>
          </div>
        </div>
      </section>
    </>
  );
}
