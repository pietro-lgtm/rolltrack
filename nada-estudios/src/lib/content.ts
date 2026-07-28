import { readJson, writeJson, CONTENT_DOC } from "@/lib/store";

/**
 * Editable site content: code-defined defaults, admin overrides stored in Blob.
 * The site renders fully with zero Blob setup; the admin panel writes overrides.
 */

export type PortfolioItem = {
  slug: string;
  client: string;
  /** Outcome-first headline, e.g. "Contenido que puso a X en la conversación" */
  title: string;
  description: string;
  tags: string[]; // e.g. ["Retainer", "Video", "Social"]
  year: string;
  /** Real, verifiable metrics only — set from admin. [] until confirmed. */
  metrics: { label: string; value: string }[];
  /** Blob path served via /api/img?p=..., or external URL, or null (typographic card) */
  image: string | null;
  /** mp4/webm loop or Vimeo/YouTube embed URL */
  videoUrl: string | null;
  featured: boolean;
  order: number;
};

export type TeamMember = {
  name: string;
  role: string;
  /** Blob path or null (renders typographic placeholder) */
  photo: string | null;
  bio: string;
  order: number;
};

export type LandingPage = {
  slug: string; // /l/[slug]
  headline: string;
  subhead: string;
  body: string;
  /** client names to show as proof */
  proof: string[];
  ctaLabel: string;
  published: boolean;
};

export type OnboardingStep = {
  title: string;
  description: string;
  /** Vimeo/YouTube/mp4 URL; null renders a "próximamente" placeholder */
  videoUrl: string | null;
  order: number;
};

export type SiteContent = {
  portfolio: PortfolioItem[];
  team: TeamMember[];
  landings: LandingPage[];
  onboarding: { intro: string; steps: OnboardingStep[] };
};

// ---- Defaults --------------------------------------------------------------
// Placeholder work entries for real clients. Copy is descriptive, not invented
// metrics — Pietro fills real numbers/media from the admin panel.

export const defaultContent: SiteContent = {
  portfolio: [
    {
      slug: "heineken",
      client: "Heineken",
      title: "Contenido de marca para la cerveza más internacional del mundo",
      description:
        "Producción de video y foto para campañas sociales de Heineken en Costa Rica. Piezas verticales pensadas para detener el scroll.",
      tags: ["Campaña", "Video", "Social"],
      year: "2025",
      metrics: [],
      image: null,
      videoUrl: null,
      featured: true,
      order: 1,
    },
    {
      slug: "dos-pinos",
      client: "Dos Pinos",
      title: "La marca de todos los días, con contenido de todos los días",
      description:
        "Contenido social continuo para una de las marcas más queridas de Costa Rica.",
      tags: ["Retainer", "Video", "Foto"],
      year: "2025",
      metrics: [],
      image: null,
      videoUrl: null,
      featured: true,
      order: 2,
    },
    {
      slug: "banco-promerica",
      client: "Banco Promerica",
      title: "Banca que habla como la gente",
      description:
        "Producción de contenido para redes que traduce productos financieros a lenguaje humano.",
      tags: ["Retainer", "Video", "Motion"],
      year: "2025",
      metrics: [],
      image: null,
      videoUrl: null,
      featured: true,
      order: 3,
    },
    {
      slug: "universal",
      client: "Universal",
      title: "El retail costarricense, a velocidad de redes",
      description:
        "Campañas estacionales y contenido always-on para la tienda de siempre.",
      tags: ["Campaña", "Foto", "Social"],
      year: "2025",
      metrics: [],
      image: null,
      videoUrl: null,
      featured: true,
      order: 4,
    },
    {
      slug: "portafolio-inmobiliario",
      client: "Portafolio Inmobiliario",
      title: "Espacios que se venden en video",
      description:
        "Producción audiovisual para los desarrollos inmobiliarios más ambiciosos del país.",
      tags: ["Campaña", "Video"],
      year: "2025",
      metrics: [],
      image: null,
      videoUrl: null,
      featured: false,
      order: 5,
    },
    {
      slug: "ari-app",
      client: "ARi App",
      title: "Lanzar una app con contenido que convierte",
      description:
        "Estrategia y producción social para el lanzamiento y crecimiento de ARi.",
      tags: ["Retainer", "Video", "Social"],
      year: "2025",
      metrics: [],
      image: null,
      videoUrl: null,
      featured: false,
      order: 6,
    },
    {
      slug: "mercado-de-valores",
      client: "Mercado de Valores",
      title: "Inversiones explicadas en 60 segundos",
      description:
        "Contenido financiero claro y confiable para redes sociales.",
      tags: ["Retainer", "Video"],
      year: "2025",
      metrics: [],
      image: null,
      videoUrl: null,
      featured: false,
      order: 7,
    },
    {
      slug: "muscle-points",
      client: "Muscle Points",
      title: "Fitness que se ve tan bien como se siente",
      description: "Foto y video de producto y lifestyle para Muscle Points.",
      tags: ["Campaña", "Foto"],
      year: "2025",
      metrics: [],
      image: null,
      videoUrl: null,
      featured: false,
      order: 8,
    },
  ],
  team: [],
  landings: [
    {
      slug: "contenido-mensual",
      headline: "Tu marca necesita contenido todos los días. Nosotros lo producimos.",
      subhead:
        "Paquetes mensuales de video, foto y diseño desde $2,200/mes. Producción del nivel de Heineken y Banco Promerica, con precios publicados.",
      body: "Contanos qué necesitás y te decimos exactamente cuál paquete te sirve — en 2 minutos, sin llamadas de ventas.",
      proof: ["Heineken", "Dos Pinos", "Banco Promerica", "Universal"],
      ctaLabel: "Ver mi paquete ideal",
      published: true,
    },
  ],
  onboarding: {
    intro:
      "Bienvenido a NADA. Antes del kickoff, estos videos cortos explican cómo trabajamos: proceso, tiempos, revisiones y qué necesitamos de tu equipo.",
    steps: [
      {
        title: "Así trabajamos",
        description: "El proceso NADA de principio a fin: brief, calendario, producción, entrega.",
        videoUrl: null,
        order: 1,
      },
      {
        title: "Tu calendario de contenido",
        description: "Cómo planificamos el mes y qué aprobás vos antes de grabar.",
        videoUrl: null,
        order: 2,
      },
      {
        title: "Días de grabación",
        description: "Qué esperar de un día de grabación con nosotros y cómo prepararte.",
        videoUrl: null,
        order: 3,
      },
      {
        title: "Entregas y revisiones",
        description: "Dónde recibís tus piezas, cómo pedir cambios y los tiempos de respuesta.",
        videoUrl: null,
        order: 4,
      },
    ],
  },
};

// ---- Read / write ----------------------------------------------------------

/** Merged content: Blob overrides win, defaults fill the gaps. */
export async function getContent(): Promise<SiteContent> {
  const stored = await readJson<Partial<SiteContent>>(CONTENT_DOC);
  if (!stored) return defaultContent;
  return {
    portfolio: stored.portfolio ?? defaultContent.portfolio,
    team: stored.team ?? defaultContent.team,
    landings: stored.landings ?? defaultContent.landings,
    onboarding: stored.onboarding ?? defaultContent.onboarding,
  };
}

export async function saveContent(content: SiteContent): Promise<void> {
  await writeJson(CONTENT_DOC, content);
}
