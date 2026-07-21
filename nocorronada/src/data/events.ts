export type EventStatus = "upcoming" | "announced" | "past" | "soldout";

export type ClubEvent = {
  slug: string;
  title: string;
  type: "weekly" | "race" | "special";
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
  status: EventStatus;
  /** Set true to feature on the home page "next up" block. */
  featured?: boolean;
};

/**
 * EDIT THIS FILE to manage events. The site recomputes everything from here:
 * home "next run" block, /eventos list, and Event JSON-LD.
 */
export const events: ClubEvent[] = [
  {
    slug: "domingo",
    title: "El domingo de siempre",
    type: "weekly",
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
    slug: "bunker-gp",
    title: "BUNKER GP",
    type: "race",
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
