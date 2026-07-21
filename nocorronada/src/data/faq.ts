export type Faq = {
  q: string;
  a: string;
  /** Optional call-to-action rendered under the answer. */
  link?: { href: string; label: string };
  /** "esencial" items also render on the home page and feed the FAQPage JSON-LD first. */
  category: "esencial" | "eventos" | "club" | "bunker-gp";
};

/** EDIT THIS FILE to manage FAQ. Feeds /faq, the home teaser, and FAQPage JSON-LD. */
export const faqs: Faq[] = [
  {
    q: "¿Dónde es el próximo entreno?",
    a: "En San José corremos todos los domingos a las 8:00 AM, con punto de salida rotativo (Sabana, Escalante, Rohrmoser, Lindora…) que se anuncia en Instagram y en el grupo de WhatsApp. Cartago y Guanacaste también tienen corridas — el calendario siempre tiene la info más reciente.",
    link: { href: "/corridas", label: "Ver el calendario de corridas" },
    category: "esencial",
  },
  {
    q: "¿Quién puede participar?",
    a: "Cualquier persona. NO CORRO NADA es un run club abierto al público: no hay niveles, no hay prueba de ritmo y es siempre gratis. Hay grupos de ritmo de 5:30, 7:30 y 9:00+ min/km — si corrés, caminás o algo intermedio, contás. Hasta los perros entran (con correa y vacunas).",
    category: "esencial",
  },
  {
    q: "¿Qué necesito para participar?",
    a: "Dos cosas: firmar la carta de exoneración de responsabilidad (un formulario en línea, se firma una sola vez) y unirte al club — dejás tu correo y tu número y quedás en el newsletter y en el grupo de WhatsApp donde se anuncia todo.",
    link: { href: "/unite", label: "Unite al club" },
    category: "esencial",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Nada. Siempre gratis — está en la bio. Las corridas semanales no cuestan ni van a costar. Los eventos especiales, como el BUNKER GP, pueden tener una inscripción pagada — eso siempre se anuncia claramente.",
    category: "club",
  },
  {
    q: "¿Qué es el BUNKER GP?",
    a: "Nuestra primera carrera: un circuito dentro de un parqueo subterráneo. Es el primer evento pagado del club, con cupos limitados. La fecha y las inscripciones se anuncian primero al newsletter y al grupo de WhatsApp.",
    link: { href: "/bunker-gp", label: "Conocé el BUNKER GP" },
    category: "bunker-gp",
  },
  {
    q: "¿Tengo que ser rápido?",
    a: "No. El nombre lo dice: no corro nada. El ritmo es social, hay grupos desde 5:30 hasta 9:00+ min/km y nadie se queda atrás. La regla es una sola: buena actitud y cero excusas.",
    category: "club",
  },
  {
    q: "¿Dónde veo las rutas?",
    a: "En nuestro club de Strava (NO CORRO NADA RUN CLUB, +4,000 miembros). Ahí publicamos las rutas de cada domingo y los recorridos de los eventos. Seguinos y sumá tus kilómetros al club.",
    category: "eventos",
  },
  {
    q: "¿Qué llevo a una corrida?",
    a: "Tenis, ropa cómoda y agua. En San José: llegá 8:00 para el calentamiento, se sale ~8:30. Si llovió (es Costa Rica, llovió), algo impermeable. Después del run casi siempre hay café.",
    category: "eventos",
  },
  {
    q: "¿Hay beneficios por ser del club?",
    a: "Sí. La membresía es gratis e incluye acceso a giveaways, descuentos de marcas aliadas y prioridad en eventos como el BUNKER GP. Cuanto más venís, más desbloqueás.",
    category: "club",
  },
  {
    q: "¿Solo corren en San José?",
    a: "No. San José corre todos los domingos, y el club también está activo en Cartago y Guanacaste — Puntarenas viene pronto. En el calendario podés filtrar las corridas por zona; todo se anuncia primero en Instagram y el newsletter.",
    link: { href: "/corridas", label: "Ver corridas por zona" },
    category: "eventos",
  },
  {
    q: "¿Qué es No Pasa Nada?",
    a: "La casa matriz. No Pasa Nada es un medio independiente de Costa Rica y México, y NO CORRO NADA es su run club. Mismo espíritu, más sudor.",
    category: "club",
  },
];

export const essentialFaqs = faqs.filter((f) => f.category === "esencial");
