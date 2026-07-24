/** Central site constants. Single source of truth for brand + contact info. */

export const site = {
  name: "NADA Estudios",
  legalName: "NADA Producciones",
  tagline: "Contenido que vende. Producción que se nota.",
  description:
    "Estudio de producción de contenido para marcas. Campañas y retainers mensuales de video, foto y social media. San José, Ciudad de México y Nueva York.",
  url: "https://nadaestudios.com", // domain live as of 2026-07-24
  email: "pietro@nopasanada.com",
  whatsapp: "+50688888888", // TODO: real WhatsApp business number
  whatsappUrl: "https://wa.me/50688888888", // TODO: real number
  instagram: "https://instagram.com/nopasanada",
  cities: ["San José", "Ciudad de México", "Nueva York"] as const,
  parent: "No Pasa Nada",
} as const;

/** Tier-1 client proof. Rendered as typographic logo marks (no image files needed). */
export const clients = [
  "Heineken",
  "Dos Pinos",
  "Universal",
  "Portafolio Inmobiliario",
  "AR Holdings",
  "Banco Promerica",
  "ARi App",
  "Mercado de Valores",
  "KleanTab",
  "Muscle Points",
] as const;

export const nav = {
  main: [
    { href: "/trabajo", label: "Trabajo" },
    { href: "/servicios", label: "Servicios" },
    { href: "/nosotros", label: "Nosotros" },
  ],
  cta: { href: "/empezar", label: "Empezar" },
} as const;
