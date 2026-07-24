/**
 * Rate card Q2 2026 — single source of truth for pricing.
 * Prices in USD, IVA not included.
 */

export type Package = {
  id: "a" | "b" | "c";
  name: string;
  price: number;
  renewalPrice: number; // 3+ meses
  summary: string;
  totalFirstTerm: number; // 3-month contract total
  features: string[];
  featured?: boolean;
};

export const packages: Package[] = [
  {
    id: "a",
    name: "Paquete A",
    price: 2200,
    renewalPrice: 1800,
    totalFirstTerm: 6600,
    summary: "8 videos verticales + 10 fotos x mes",
    features: [
      "8 videos cortos (Reels / TikTok / Shorts)",
      "1 sesión de fotos (10 fotos editadas)",
      "1 día de grabación incluido",
      "8 piezas gráficas (posts, stories, banners)",
      "Reporte de rendimiento básico mensual",
      "1 ronda de revisión por entregable",
      "Tiempo de respuesta: 48 horas",
    ],
  },
  {
    id: "b",
    name: "Paquete B",
    price: 4000,
    renewalPrice: 3400,
    totalFirstTerm: 12000,
    summary: "10 videos verticales + 15 fotos x mes",
    featured: true,
    features: [
      "10 videos cortos + 1 video largo (YouTube / corporativo)",
      "2 sesiones de fotos (15 fotos editadas c/u)",
      "2 días de grabación incluidos",
      "15 piezas gráficas + 2 motion graphics",
      "1 sesión de consultoría estratégica / mes",
      "Plan de contenido mensual + reporte detallado",
      "2 rondas de revisión | Respuesta: 24 horas",
    ],
  },
  {
    id: "c",
    name: "Paquete C",
    price: 6500,
    renewalPrice: 5500,
    totalFirstTerm: 19500,
    summary: "15 videos verticales + 20 fotos x mes",
    features: [
      "15 videos cortos + 2 videos largos",
      "4 sesiones de fotos (20–25 fotos editadas c/u)",
      "4 días de grabación incluidos",
      "25+ piezas gráficas + 4 motion graphics",
      "2 sesiones de consultoría + calendario editorial",
      "Inteligencia social completa (audiencia + competencia)",
      "Director de cuenta dedicado | Respuesta prioritaria (12h)",
      "3 rondas de revisión por entregable",
    ],
  },
];

export type AddOn = {
  id: string;
  name: string;
  /** null = "por cotización" / "desde" pricing */
  price: number | null;
  priceLabel: string; // rendered label, e.g. "$650", "$250+ x mes", "desde $3,000"
  recurring?: boolean; // monthly add-on vs one-off
  category: "media" | "grabacion" | "edicion" | "fotos" | "eventos";
};

export const addOns: AddOn[] = [
  { id: "paid-media", name: "Paid Media", price: 250, priceLabel: "$250+ x mes", recurring: true, category: "media" },
  { id: "publicacion-rrss", name: "Publicación RRSS", price: 400, priceLabel: "$400 x mes", recurring: true, category: "media" },
  { id: "medio-dia-grabacion", name: "1/2 día de grabación", price: 650, priceLabel: "$650", category: "grabacion" },
  { id: "dia-grabacion", name: "1 día de grabación", price: 1250, priceLabel: "$1,250", category: "grabacion" },
  { id: "edicion-1", name: "Edición extra 1–119 seg", price: 80, priceLabel: "$80", category: "edicion" },
  { id: "edicion-2", name: "Edición extra 2–4:59 min", price: 115, priceLabel: "$115", category: "edicion" },
  { id: "edicion-5", name: "Edición extra 5–10 min", price: 200, priceLabel: "$200", category: "edicion" },
  { id: "edicion-10", name: "Edición extra 10+ min", price: null, priceLabel: "por cotización", category: "edicion" },
  { id: "fotos-corp-15", name: "Fotos Corporativas (15 fotos)", price: 800, priceLabel: "$800", category: "fotos" },
  { id: "fotos-corp-25", name: "Fotos Corporativas (25 fotos)", price: 1400, priceLabel: "$1,400", category: "fotos" },
  { id: "fotos-corp-50", name: "Fotos Corporativas (30–50 fotos)", price: 2000, priceLabel: "$2,000", category: "fotos" },
  { id: "fotos-prod-studio", name: "Fotos Productos Studio", price: 500, priceLabel: "$500+", category: "fotos" },
  { id: "fotos-prod-afuera", name: "Fotos Productos Afuera", price: 1000, priceLabel: "$1,000+", category: "fotos" },
  { id: "cobertura-evento", name: "Cobertura de evento", price: 1400, priceLabel: "$1,400", category: "eventos" },
  { id: "campana-especial", name: "Campaña especial", price: 3000, priceLabel: "desde $3,000", category: "eventos" },
];

export const terms = [
  "Contrato mínimo 3 meses",
  "50% al firmar, 50% al inicio de mes",
  "Cancelación: 30 días de anticipación",
  "Entregables no acumulables",
  "Revisiones extra: $75 c/u",
  "Precios en USD + IVA",
];

export function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}
