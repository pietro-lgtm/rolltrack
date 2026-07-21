export type Faq = {
  q: string;
  a: string;
  /** "esencial" items also render on the home page and feed the FAQPage JSON-LD first. */
  category: "esencial" | "eventos" | "club" | "bunker-gp";
};

/** EDIT THIS FILE to manage FAQ. Feeds /faq, the home teaser, and FAQPage JSON-LD. */
export const faqs: Faq[] = [
  {
    q: "¿Dónde es el próximo entreno?",
    a: "Corremos todos los domingos a las 8:00 AM en San José. El punto de salida rota cada semana (Sabana, Escalante, Rohrmoser, Lindora…) y se anuncia en Instagram y en el grupo de WhatsApp. La página de eventos siempre tiene la info más reciente.",
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
    category: "esencial",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Nada. Siempre gratis — está en la bio. Los entrenos de los domingos no cuestan ni van a costar. Los eventos especiales, como el BUNKER GP, pueden tener una inscripción pagada — eso siempre se anuncia claramente.",
    category: "club",
  },
  {
    q: "¿Qué es el BUNKER GP?",
    a: "Nuestra primera carrera: un circuito dentro de un parqueo subterráneo. Es el primer evento pagado del club, con cupos limitados. La fecha y las inscripciones se anuncian primero al newsletter y al grupo de WhatsApp.",
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
    q: "¿Qué llevo a un entreno?",
    a: "Tenis, ropa cómoda y agua. Llegá 8:00 para el calentamiento; se sale ~8:30. Si llovió (es Costa Rica, llovió), algo impermeable. Después del run casi siempre hay café.",
    category: "eventos",
  },
  {
    q: "¿Hay beneficios por ser del club?",
    a: "Sí. La membresía es gratis e incluye acceso a giveaways, descuentos de marcas aliadas (somos el run club oficial de HOKA en CR, con Heineken 0.0, GLU y Zepol en el equipo) y prioridad en eventos como el BUNKER GP. Cuanto más venís, más desbloqueás.",
    category: "club",
  },
  {
    q: "¿Solo corren en San José?",
    a: "Por ahora los domingos son en San José con puntos rotativos, y ya estamos activos en Guanacaste. Vienen más provincias — todo se anuncia primero en Instagram y el newsletter.",
    category: "eventos",
  },
  {
    q: "¿Qué es No Pasa Nada?",
    a: "La casa matriz. No Pasa Nada es un medio independiente de Costa Rica y México, y NO CORRO NADA es su run club. Mismo espíritu, más sudor.",
    category: "club",
  },
];

export const essentialFaqs = faqs.filter((f) => f.category === "esencial");
