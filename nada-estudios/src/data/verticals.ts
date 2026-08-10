/**
 * Vertical landing pages: category reels + custom intake forms.
 * Each vertical page lives at /<slug> (public, indexed — unlike /l ad landings).
 *
 * Intake option `value`s MUST be valid scoring values from
 * src/components/empezar/scoring.ts — the forms post to /api/leads, which
 * validates and re-scores server-side. Only the labels are vertical-specific.
 */

export type VerticalIntakeQuestion = {
  key: "need" | "companySize" | "currentContent" | "timeline" | "investment";
  label: string;
  options: { value: string; label: string }[];
};

export type Vertical = {
  slug: "empresarial" | "restaurantes";
  name: string;
  eyebrow: string;
  headline: [string, string];
  intro: string;
  /** Vimeo URLs (any shape — resolveEmbed normalizes) */
  videos: string[];
  proof: string[];
  /** preset industry value stored on the lead */
  industry: string;
  /** slug of the matching /trabajo case page */
  caseSlug: string;
  formTitle: string;
  formCta: string;
  metaTitle: string;
  metaDescription: string;
};

export const verticals: Record<"empresarial" | "restaurantes", Vertical> = {
  empresarial: {
    slug: "empresarial",
    name: "Empresarial",
    eyebrow: "Contenido empresarial",
    headline: ["Comunicación empresarial", "con estándar editorial."],
    intro:
      "Video corporativo, contenido constante para redes y fotografía ejecutiva para las empresas más importantes del país. Tu empresa ya tiene nivel — su contenido debería demostrarlo.",
    videos: [
      "https://vimeo.com/1215318414",
      "https://vimeo.com/1217062863",
      "https://vimeo.com/1215318415",
      "https://vimeo.com/1217062864",
    ],
    proof: ["Banco Promerica", "Mercado de Valores", "AR Holdings", "Portafolio Inmobiliario"],
    industry: "empresarial",
    // Matches the LIVE (admin-managed) portfolio slug, not the code defaults —
    // the live case pages are /trabajo/Empresarial and /trabajo/Restaurantes.
    caseSlug: "Empresarial",
    formTitle: "Contanos de tu empresa.",
    formCta: "Quiero una propuesta →",
    metaTitle: "Video y contenido corporativo para empresas",
    metaDescription:
      "Producción de video corporativo, contenido para redes y fotografía ejecutiva. El estándar que usan Banco Promerica, Mercado de Valores y AR Holdings.",
  },
  restaurantes: {
    slug: "restaurantes",
    name: "Restaurantes",
    eyebrow: "Contenido para restaurantes",
    headline: ["Contenido que", "llena mesas."],
    intro:
      "Tu feed es tu tarjeta de presentación: desde que te ven, te quieren pedir. Video y foto de comida, ambiente y equipo — producido para que el antojo sea inmediato.",
    videos: ["https://vimeo.com/1217062865", "https://vimeo.com/1215318412"],
    proof: ["Gilbertas", "Heineken", "Dos Pinos"],
    industry: "restaurantes",
    caseSlug: "Restaurantes",
    formTitle: "Contanos de tu restaurante.",
    formCta: "Quiero una propuesta →",
    metaTitle: "Video y contenido para restaurantes",
    metaDescription:
      "Producción de video y foto para restaurantes: contenido mensual, sesiones de menú y campañas de apertura. Contenido que llena mesas.",
  },
};

export const VERTICAL_INTAKES: Record<Vertical["slug"], VerticalIntakeQuestion[]> = {
  empresarial: [
    {
      key: "need",
      label: "¿Qué necesita la empresa?",
      options: [
        { value: "retainer", label: "Contenido constante para redes" },
        { value: "campana", label: "Un video corporativo puntual" },
        { value: "fotos", label: "Fotografía corporativa" },
        { value: "evento", label: "Cobertura de un evento" },
      ],
    },
    {
      key: "companySize",
      label: "¿De qué tamaño es la empresa?",
      options: [
        { value: "2-10", label: "2 a 10 personas" },
        { value: "11-50", label: "11 a 50 personas" },
        { value: "51-200", label: "51 a 200 personas" },
        { value: "200+", label: "Más de 200 personas" },
      ],
    },
    {
      key: "currentContent",
      label: "¿Quién maneja su contenido hoy?",
      options: [
        { value: "agencia", label: "Una agencia" },
        { value: "in-house", label: "Un equipo interno" },
        { value: "nadie", label: "Nadie / se hace como se puede" },
      ],
    },
    {
      key: "timeline",
      label: "¿Cuándo necesitan arrancar?",
      options: [
        { value: "ya", label: "Ya, cuanto antes" },
        { value: "este-mes", label: "Este mes" },
        { value: "trimestre", label: "En los próximos 3 meses" },
        { value: "explorando", label: "Solo estamos explorando" },
      ],
    },
    {
      key: "investment",
      label: "¿Cuánto invierten al mes en marketing y contenido?",
      options: [
        { value: "<1k", label: "Menos de $1,000" },
        { value: "1-2.5k", label: "$1,000 – $2,500" },
        { value: "2.5-5k", label: "$2,500 – $5,000" },
        { value: "5k+", label: "$5,000 o más" },
        { value: "hablar", label: "Prefiero hablarlo" },
      ],
    },
  ],
  restaurantes: [
    {
      key: "need",
      label: "¿Qué necesita el restaurante?",
      options: [
        { value: "retainer", label: "Contenido mensual constante" },
        { value: "fotos", label: "Sesión de fotos del menú" },
        { value: "campana", label: "Video para una apertura o promo" },
        { value: "evento", label: "Cobertura de un evento" },
      ],
    },
    {
      key: "companySize",
      label: "¿Cuántos locales tienen?",
      options: [
        { value: "solo", label: "1 local" },
        { value: "2-10", label: "2 a 10 locales" },
        { value: "11-50", label: "Más de 10 / franquicia" },
      ],
    },
    {
      key: "currentContent",
      label: "¿Quién maneja su contenido hoy?",
      options: [
        { value: "agencia", label: "Una agencia" },
        { value: "in-house", label: "Alguien del equipo" },
        { value: "nadie", label: "Nadie / se hace como se puede" },
      ],
    },
    {
      key: "timeline",
      label: "¿Cuándo necesitan arrancar?",
      options: [
        { value: "ya", label: "Ya, cuanto antes" },
        { value: "este-mes", label: "Este mes" },
        { value: "trimestre", label: "En los próximos 3 meses" },
        { value: "explorando", label: "Solo estamos explorando" },
      ],
    },
    {
      key: "investment",
      label: "¿Cuánto invierten al mes en marketing y contenido?",
      options: [
        { value: "<1k", label: "Menos de $1,000" },
        { value: "1-2.5k", label: "$1,000 – $2,500" },
        { value: "2.5-5k", label: "$2,500 – $5,000" },
        { value: "5k+", label: "$5,000 o más" },
        { value: "hablar", label: "Prefiero hablarlo" },
      ],
    },
  ],
};
