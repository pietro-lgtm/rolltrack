import type { Answers } from "./scoring";

export type QuestionOption = {
  value: string;
  label: string;
  sub?: string;
};

export type QuestionDef = {
  key: keyof Answers;
  title: string;
  subtitle?: string;
  options: QuestionOption[];
};

/** Question order per BUILD_BRIEF: easy first, contact last (handled separately). */
export const QUESTIONS: QuestionDef[] = [
  {
    key: "need",
    title: "¿Qué necesitás?",
    subtitle: "Elegí lo que más se acerca.",
    options: [
      { value: "retainer", label: "Retainer mensual", sub: "Contenido constante, todos los meses" },
      { value: "campana", label: "Campaña puntual", sub: "Un proyecto con fecha definida" },
      { value: "evento", label: "Cobertura de evento", sub: "Foto y video de un evento" },
      { value: "fotos", label: "Sesión de fotos", sub: "Producto, equipo o espacio" },
      { value: "no-se", label: "Todavía no sé", sub: "Quiero que me ayuden a definirlo" },
    ],
  },
  {
    key: "industry",
    title: "¿A qué se dedica tu marca?",
    subtitle: "Así personalizamos la recomendación.",
    options: [
      { value: "bebidas-consumo", label: "Bebidas y consumo" },
      { value: "bienes-raices", label: "Bienes raíces" },
      { value: "banca-finanzas", label: "Banca y finanzas" },
      { value: "tecnologia", label: "Tecnología / apps" },
      { value: "salud-fitness", label: "Salud y fitness" },
      { value: "otro", label: "Otro" },
    ],
  },
  {
    key: "companySize",
    title: "¿Cuántas personas son en tu equipo?",
    options: [
      { value: "solo", label: "Solo yo", sub: "Freelance / emprendimiento" },
      { value: "2-10", label: "2 a 10 personas" },
      { value: "11-50", label: "11 a 50 personas" },
      { value: "51-200", label: "51 a 200 personas" },
      { value: "200+", label: "200+ personas" },
    ],
  },
  {
    key: "currentContent",
    title: "¿Quién maneja tu contenido hoy?",
    options: [
      { value: "agencia", label: "Una agencia" },
      { value: "in-house", label: "Un equipo in-house" },
      { value: "nadie", label: "Nadie", sub: "Lo hacemos como se puede" },
    ],
  },
  {
    key: "timeline",
    title: "¿Cuándo necesitás arrancar?",
    options: [
      { value: "ya", label: "Ya, cuanto antes" },
      { value: "este-mes", label: "Este mes" },
      { value: "trimestre", label: "Este trimestre" },
      { value: "explorando", label: "Solo estoy explorando" },
    ],
  },
  {
    key: "investment",
    title: "¿Cuánto invertís al mes en marketing y contenido?",
    subtitle: "Para recomendarte el paquete correcto.",
    options: [
      { value: "<1k", label: "Menos de $1,000" },
      { value: "1-2.5k", label: "$1,000 – $2,500" },
      { value: "2.5-5k", label: "$2,500 – $5,000" },
      { value: "5k+", label: "$5,000 o más" },
      { value: "hablar", label: "Prefiero hablarlo primero" },
    ],
  },
];

/** Total steps shown in the progress bar: questions + the final contact step. */
export const TOTAL_STEPS = QUESTIONS.length + 1;
