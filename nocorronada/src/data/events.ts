export type EventStatus = "upcoming" | "announced" | "soon" | "past" | "soldout";

export type Zone = "san-jose" | "cartago" | "guanacaste" | "puntarenas";

export const ZONES: { value: Zone; label: string }[] = [
  { value: "san-jose", label: "San José (todo San José)" },
  { value: "cartago", label: "Cartago" },
  { value: "guanacaste", label: "Guanacaste" },
  { value: "puntarenas", label: "Puntarenas" },
];

export const zoneLabel = (z: Zone) =>
  ZONES.find((x) => x.value === z)?.label ?? z;

export type ClubEvent = {
  slug: string;
  title: string;
  type: "weekly" | "race" | "special";
  zone: Zone;
  /** ISO date-time in Costa Rica time, e.g. "2026-08-15T18:00:00-06:00". Omit if TBA. */
  dateISO?: string;
  /** Human-readable recurrence for weekly runs, e.g. "Todos los domingos · 8:00 AM". */
  recurrence?: string;
  location: {
    name: string;
    mapsUrl?: string;
  };
  description: string;
  distanceKm?: number;
  /** Inscription price in CRC for paid events. Omit for free events. */
  priceCRC?: number;
  stravaRouteUrl?: string;
  /** Event art, IG portrait 1080x1350. Uploaded via /admin (served from /api/img). */
  image?: string;
  /** Registration link for this specific event (defaults to /unite). */
  signupUrl?: string;
  /** FAQ link for this event (defaults to /faq). */
  faqUrl?: string;
  status: EventStatus;
  /** Set true to feature on the home page "next up" block. */
  featured?: boolean;
};

/**
 * EDIT THIS FILE to manage events — this is the calendar's backend.
 * Template for a new event:
 *
 *   {
 *     slug: "corrida-x",              // unique, url-safe
 *     title: "Corrida X",
 *     type: "special",                // weekly | race | special
 *     zone: "san-jose",               // san-jose | cartago | guanacaste | puntarenas
 *     dateISO: "2026-09-12T08:00:00-06:00",  // omit while TBA
 *     location: { name: "Parque La Sabana", mapsUrl: "https://maps.app.goo.gl/..." },
 *     description: "Qué es, qué llevar, qué esperar.",
 *     distanceKm: 5,
 *     status: "announced",            // upcoming | announced | soon | past | soldout
 *   },
 *
 * After editing: npx vercel deploy --prod (from this folder) publishes it.
 */
export const events: ClubEvent[] = [
  {
    slug: "domingo-sj",
    title: "El domingo de siempre",
    type: "weekly",
    zone: "san-jose",
    recurrence: "Todos los domingos · 8:00 AM",
    location: {
      name: "San José · punto rotativo (se anuncia en IG y WhatsApp)",
      mapsUrl: "",
    },
    description:
      "~5K con grupos de ritmo (5:30 / 7:30 / 9:00+ min/km). Nadie se queda atrás. Calentamiento 8:00, salimos 8:30. Perros bienvenidos (con correa y vacunas). Después: café.",
    distanceKm: 5,
    status: "upcoming",
    featured: true,
  },
  {
    slug: "cartago",
    title: "NCN Cartago",
    type: "weekly",
    zone: "cartago",
    recurrence: "Fecha y hora se anuncian en IG y WhatsApp", // TODO: set fixed schedule if there is one
    location: {
      name: "Cartago · punto se anuncia cada semana",
      mapsUrl: "",
    },
    description:
      "El club también corre en Cartago. Mismo espíritu: gratis, social y sin niveles. Seguí el IG y el grupo de WhatsApp para el punto y la hora de cada corrida.",
    status: "upcoming",
  },
  {
    slug: "guanacaste",
    title: "NCN Guanacaste",
    type: "weekly",
    zone: "guanacaste",
    recurrence: "Fecha y hora se anuncian en IG y WhatsApp", // TODO: set fixed schedule if there is one
    location: {
      name: "Guanacaste · punto se anuncia cada semana",
      mapsUrl: "",
    },
    description:
      "GUANA está activo. Corridas del club en Guanacaste — el punto y la hora se anuncian en Instagram y el grupo de WhatsApp.",
    status: "upcoming",
  },
  {
    slug: "puntarenas",
    title: "NCN Puntarenas",
    type: "weekly",
    zone: "puntarenas",
    location: {
      name: "Puntarenas",
      mapsUrl: "",
    },
    description:
      "La próxima parada del club. Unite al newsletter y al WhatsApp para enterarte primero cuando arranquemos en Puntarenas.",
    status: "soon",
  },
  {
    slug: "bunker-gp",
    title: "BUNKER GP",
    type: "race",
    zone: "san-jose",
    // TODO: set real date when confirmed, e.g. "2026-09-12T19:00:00-06:00"
    dateISO: undefined,
    location: {
      name: "Parqueo subterráneo · ubicación por anunciar",
      mapsUrl: "",
    },
    description:
      "La primera carrera de NO CORRO NADA: un circuito dentro de un parqueo subterráneo. Vueltas, rampas, neón y cemento. Nuestro primer evento pagado — cupos limitados. Los miembros del club se enteran primero.",
    status: "announced",
    featured: true,
  },
];

/** Next dated event (soonest future dateISO), for countdowns and JSON-LD. */
export function nextDatedEvent(now: Date = new Date()): ClubEvent | undefined {
  return events
    .filter((e) => e.dateISO && new Date(e.dateISO) > now && e.status !== "past")
    .sort((a, b) => +new Date(a.dateISO!) - +new Date(b.dateISO!))[0];
}

export function getEvent(slug: string): ClubEvent | undefined {
  return events.find((e) => e.slug === slug);
}
