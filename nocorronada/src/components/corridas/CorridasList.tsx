"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ZONES,
  zoneLabel,
  type ClubEvent,
  type EventStatus,
  type Zone,
} from "@/data/events";

type ZoneFilter = Zone | "all";

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

/** Status pill wording for the weekly runs. */
function weeklyStatus(status: EventStatus): { label: string; live: boolean } {
  switch (status) {
    case "soon":
      return { label: "Próximamente", live: false };
    default:
      return { label: "Confirmado", live: true };
  }
}

/** Status pill wording for races and specials. */
function raceStatus(status: EventStatus): { label: string; live: boolean } {
  switch (status) {
    case "announced":
      return { label: "Inscripciones pronto", live: true };
    case "upcoming":
      return { label: "Inscripciones abiertas", live: true };
    case "soon":
      return { label: "Próximamente", live: false };
    case "soldout":
      return { label: "Agotado", live: false };
    case "past":
      return { label: "Finalizado", live: false };
  }
}

function StatusPill({ label, live }: { label: string; live: boolean }) {
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

function ZoneTag({ zone }: { zone: Zone }) {
  return <span className="label-mono text-muted">{zoneLabel(zone)}</span>;
}

/** A weekly recurring run. San José keeps its pace-groups + perros/café rows. */
function WeeklyCard({ event }: { event: ClubEvent }) {
  const isSanJose = event.slug === "domingo-sj";
  const { label, live } = weeklyStatus(event.status);

  return (
    <article className="border hairline bg-asphalt">
      {isSanJose && <div className="checker" aria-hidden />}
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <ZoneTag zone={event.zone} />
          <StatusPill label={label} live={live} />
        </div>

        <h3 className="display mt-5 text-3xl sm:text-4xl">{event.title}</h3>

        {event.recurrence && (
          <p className="label-mono mt-4 text-muted">{event.recurrence}</p>
        )}

        <div className="mt-6 border-t hairline pt-6">
          <p className="label-mono text-muted">Punto de salida</p>
          <p className="mt-2 text-ink">{event.location.name}</p>
        </div>

        <p className="mt-6 max-w-2xl text-muted">{event.description}</p>

        {isSanJose && (
          <div className="mt-6 border-t hairline pt-6">
            <p className="label-mono text-muted">
              Grupos: 5:30 / 7:30 / 9:00+ min/km
            </p>
            <p className="mt-3 max-w-xl text-muted">
              Perros bienvenidos (con correa). Después hay café.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

/** An upcoming race/special. bunker-gp links to its detail page. */
function RaceCard({ event, round }: { event: ClubEvent; round: number }) {
  const detailHref = event.slug === "bunker-gp" ? "/bunker-gp" : undefined;
  const { label, live } = raceStatus(event.status);
  const roundLabel = String(round).padStart(2, "0");

  const inner = (
    <>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="label-mono text-muted">Round {roundLabel}</span>
          <ZoneTag zone={event.zone} />
          <StatusPill label={label} live={live} />
        </div>

        <h3 className="display mt-5 text-3xl sm:text-4xl">{event.title}</h3>

        <p className="label-mono mt-4 text-muted">
          {event.dateISO
            ? formatEventDate(event.dateISO)
            : "Fecha por anunciar"}
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

export function CorridasList({ events }: { events: ClubEvent[] }) {
  const [zone, setZone] = useState<ZoneFilter>("all");

  const matches = (e: ClubEvent) => zone === "all" || e.zone === zone;

  const weekly = events.filter((e) => e.type === "weekly" && matches(e));
  const allRaces = events.filter((e) => e.type !== "weekly");
  const races = allRaces
    .map((e, i) => ({ event: e, round: i + 1 }))
    .filter(({ event }) => matches(event));

  const empty = weekly.length === 0 && races.length === 0;

  return (
    <>
      {/* Zone filter */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="label-mono text-muted">Filtrar por zona</span>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value as ZoneFilter)}
              className="label-mono w-full border hairline bg-black px-4 py-3 text-ink focus:border-volt focus:outline-none sm:w-auto"
            >
              <option value="all">Todas las zonas</option>
              {ZONES.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Weekly runs */}
      {weekly.length > 0 && (
        <section className="border-b hairline">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-mono flex items-center gap-2 text-muted">
              <span className="inline-block h-2 w-2 bg-volt" aria-hidden />
              Las corridas de siempre
            </p>
            <div className="mt-8 flex flex-col gap-6">
              {weekly.map((e) => (
                <WeeklyCard key={e.slug} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Races */}
      {races.length > 0 && (
        <section className="border-b hairline">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-mono flex items-center gap-2 text-muted">
              <span className="inline-block h-2 w-2 bg-volt" aria-hidden />
              Próximas carreras
            </p>
            <div className="mt-8 flex flex-col gap-6">
              {races.map(({ event, round }) => (
                <RaceCard key={event.slug} event={event} round={round} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state — a filter with nothing in it */}
      {empty && (
        <section className="border-b hairline">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="max-w-xl text-muted">
              Todavía no corremos por acá. Unite al newsletter y al WhatsApp
              para enterarte primero cuando arranquemos en tu zona.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
