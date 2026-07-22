"use client";

/* eslint-disable @next/next/no-img-element -- event art is user-uploaded IG portrait art served from /api/img at final size */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  zoneLabel,
  type ClubEvent,
  type EventStatus,
  type Zone,
} from "@/data/events";
import { gmapsUrl, isNavigable, wazeUrl } from "@/lib/maps";
import { GhostLink, VoltLink } from "@/components/ui";

type ZoneFilter = Zone | "all";

/** Menu items for the header zone dropdown. label-mono uppercases them in CSS. */
const ZONE_ITEMS: { value: ZoneFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "san-jose", label: "San José (todo San José)" },
  { value: "cartago", label: "Cartago" },
  { value: "guanacaste", label: "Guanacaste" },
  { value: "puntarenas", label: "Puntarenas" },
];

const currentZoneLabel = (zone: ZoneFilter) =>
  zone === "all" ? "Todas las zonas" : zoneLabel(zone);

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

/** True for absolute http(s) links, which must open in a new tab via <a>. */
const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

/** Event art (IG portrait 1080x1350). Full-bleed; stacks above content on mobile. */
function EventArt({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="aspect-[4/5] w-full object-cover sm:w-72 sm:shrink-0"
    />
  );
}

/** Google Maps + Waze row — only when the place is a real, navigable location. */
function NavLinks({ location }: { location: ClubEvent["location"] }) {
  if (!isNavigable(location.name)) return null;
  const mapsHref = location.mapsUrl || gmapsUrl(location.name);
  return (
    <p className="label-mono mt-3 flex flex-wrap items-center gap-2 text-muted">
      <a
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-volt"
      >
        Google Maps ↗
      </a>
      <span aria-hidden>·</span>
      <a
        href={wazeUrl(location.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-volt"
      >
        Waze ↗
      </a>
    </p>
  );
}

/** Card action row: inscribirme (primary while open), Strava route, FAQ. */
function ActionRow({ event }: { event: ClubEvent }) {
  const signupUrl = event.signupUrl ?? "/unite";
  const signupPrimary =
    event.status === "upcoming" || event.status === "announced";
  const faqUrl = event.faqUrl ?? "/faq";
  const SignupLink = signupPrimary ? VoltLink : GhostLink;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <SignupLink href={signupUrl} external={isExternalUrl(signupUrl)}>
        Inscribirme
      </SignupLink>
      {event.stravaRouteUrl && (
        <GhostLink href={event.stravaRouteUrl} external>
          Ruta en Strava ↗
        </GhostLink>
      )}
      {isExternalUrl(faqUrl) ? (
        <a
          href={faqUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="label-mono text-muted transition-colors hover:text-volt"
        >
          FAQ
        </a>
      ) : (
        <Link
          href={faqUrl}
          className="label-mono text-muted transition-colors hover:text-volt"
        >
          FAQ
        </Link>
      )}
    </div>
  );
}

/** A weekly recurring run. San José keeps its pace-groups + perros/café rows. */
function WeeklyCard({ event }: { event: ClubEvent }) {
  const isSanJose = event.slug === "domingo-sj";
  const { label, live } = weeklyStatus(event.status);

  const content = (
    <>
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
        <NavLinks location={event.location} />
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

      <ActionRow event={event} />
    </>
  );

  const body = event.image ? (
    <div className="flex flex-col sm:flex-row">
      <EventArt src={event.image} alt={event.title} />
      <div className="flex-1 p-6 sm:p-8">{content}</div>
    </div>
  ) : (
    <div className="p-6 sm:p-8">{content}</div>
  );

  return (
    <article className="border hairline bg-asphalt">
      {isSanJose && <div className="checker" aria-hidden />}
      {body}
    </article>
  );
}

/** An upcoming race/special. bunker-gp links to its detail page. */
function RaceCard({ event, round }: { event: ClubEvent; round: number }) {
  const detailHref = event.slug === "bunker-gp" ? "/bunker-gp" : undefined;
  const { label, live } = raceStatus(event.status);
  const roundLabel = String(round).padStart(2, "0");

  const content = (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <span className="label-mono text-muted">Round {roundLabel}</span>
        <ZoneTag zone={event.zone} />
        <StatusPill label={label} live={live} />
      </div>

      <h3 className="display mt-5 text-3xl sm:text-4xl">{event.title}</h3>

      <p className="label-mono mt-4 text-muted">
        {event.dateISO ? formatEventDate(event.dateISO) : "Fecha por anunciar"}
      </p>
      <p className="label-mono mt-1 text-muted">{event.location.name}</p>
      <NavLinks location={event.location} />

      <p className="mt-6 max-w-2xl text-muted">{event.description}</p>

      {detailHref ? (
        <p className="label-mono mt-8 text-ink transition-colors group-hover:text-volt">
          Ver detalles ↗
        </p>
      ) : (
        <ActionRow event={event} />
      )}
    </>
  );

  const body = event.image ? (
    <div className="flex flex-col sm:flex-row">
      <EventArt src={event.image} alt={event.title} />
      <div className="flex-1 p-6 sm:p-8">{content}</div>
    </div>
  ) : (
    <div className="p-6 sm:p-8">{content}</div>
  );

  const inner = (
    <>
      {body}
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

/**
 * Owns the whole /corridas explorer: the h1 doubles as a zone-selector dropdown,
 * and the filtered weekly + race lists react to the selection. Filtering behavior
 * is identical to the old CorridasList (weekly by zone, races kept round-numbered).
 */
export function CorridasExplorer({ events }: { events: ClubEvent[] }) {
  const [zone, setZone] = useState<ZoneFilter>("all");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pickZone(value: ZoneFilter) {
    setZone(value);
    setOpen(false);
  }

  function goToAbriTuClub() {
    setOpen(false);
    document
      .getElementById("abri-tu-club")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const matches = (e: ClubEvent) => zone === "all" || e.zone === zone;

  const weekly = events.filter((e) => e.type === "weekly" && matches(e));
  const allRaces = events.filter((e) => e.type !== "weekly");
  const races = allRaces
    .map((e, i) => ({ event: e, round: i + 1 }))
    .filter(({ event }) => matches(event));

  const empty = weekly.length === 0 && races.length === 0;

  return (
    <>
      {/* Header — the h1 is the zone selector */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="label-mono text-muted">Calendario</p>

          <div ref={menuRef} className="relative mt-4 inline-block">
            <h1 className="display text-5xl sm:text-8xl">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="inline-flex items-baseline gap-3 text-left outline-none transition-colors hover:text-volt focus-visible:text-volt sm:gap-5"
              >
                <span>Corridas</span>
                <span
                  className={`text-volt transition-transform ${open ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  ▾
                </span>
              </button>
            </h1>

            {open && (
              <div
                role="menu"
                aria-label="Filtrar por zona"
                className="absolute left-0 top-full z-30 mt-3 min-w-[15rem] border hairline bg-asphalt"
              >
                {ZONE_ITEMS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    role="menuitem"
                    onClick={() => pickZone(item.value)}
                    aria-current={zone === item.value}
                    className={`label-mono block w-full px-4 py-3 text-left transition-colors hover:bg-black ${
                      zone === item.value
                        ? "text-volt"
                        : "text-ink hover:text-volt"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="border-t hairline" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={goToAbriTuClub}
                  className="label-mono block w-full px-4 py-3 text-left text-volt transition-colors hover:bg-black"
                >
                  Abrí tu club →
                </button>
              </div>
            )}
          </div>

          <p className="label-mono mt-6 text-muted">
            Zona: <span className="text-volt">{currentZoneLabel(zone)}</span>
          </p>

          <p className="mt-6 max-w-xl text-muted">
            Un club de correr con calendario de verdad: el domingo de siempre en
            San José, más Cartago y Guanacaste activos. Elegí tu zona en el
            título. Todo se confirma primero en Instagram y WhatsApp.
          </p>
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
              Todavía no corremos por acá. Unite al newsletter y al WhatsApp para
              enterarte primero cuando arranquemos en tu zona.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
