export type Lang = 'es' | 'en';
export const LANGS: Lang[] = ['es', 'en'];

/**
 * Mapa de rutas. Cada página existe en ambos idiomas con URL propia
 * (mejor para Google que un traductor en el navegador).
 */
export const ROUTES = {
  home: { es: '/', en: '/en/' },
  minute: { es: '/en-1-minuto/', en: '/en/in-1-minute/' },
  crisis: { es: '/la-crisis/', en: '/en/the-crisis/' },
  plant: { es: '/orchidean-one/', en: '/en/orchidean-one/' },
  air: { es: '/aire-y-salud/', en: '/en/air-and-health/' },
  world: { es: '/el-mundo-ya-lo-hace/', en: '/en/the-world-does-it/' },
  build: { es: '/donde-y-cuando/', en: '/en/where-and-when/' },
  faq: { es: '/preguntas/', en: '/en/questions/' },
  gov: { es: '/municipalidades/', en: '/en/municipalities/' },
  monitor: { es: '/monitoreo/', en: '/en/monitoring/' },
  press: { es: '/prensa/', en: '/en/press/' },
} as const;

export type RouteKey = keyof typeof ROUTES;

export const href = (key: RouteKey, lang: Lang) => ROUTES[key][lang];
export const other = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');

/** Números con separador de miles al estilo tico (1.500) o inglés (1,500). */
export const fmt = (n: number, lang: Lang) => n.toLocaleString(lang === 'es' ? 'de-DE' : 'en-US');

/** Elige el texto del idioma activo: t(lang, { es: '…', en: '…' }) */
export function t<T>(lang: Lang, v: { es: T; en: T }): T {
  return v[lang];
}

export const UI = {
  es: {
    skip: 'Saltar al contenido',
    menu: 'Menú',
    close: 'Cerrar',
    nav: {
      crisis: 'La crisis',
      plant: 'Orchidean One',
      air: 'Aire y salud',
      world: 'El mundo',
      build: 'Dónde y cuándo',
      faq: 'Preguntas',
      gov: 'Municipalidades',
      monitor: 'Monitoreo',
      press: 'Prensa',
      minute: 'En 1 minuto',
      home: 'Inicio',
    },
    langSwitch: 'English',
    langSwitchShort: 'EN',
    langSwitchLabel: 'Read this page in English',
    langHint: 'This page is also available in English.',
    langHintCta: 'Read in English',
    share: {
      title: 'Compártalo con alguien que necesita saberlo',
      whatsapp: 'Enviar por WhatsApp',
      facebook: 'Facebook',
      x: 'X',
      copy: 'Copiar enlace',
      copied: '¡Enlace copiado!',
      native: 'Compartir',
    },
    listen: 'Escuchar esta página',
    listenStop: 'Detener',
    readMore: 'Seguir leyendo',
    sources: 'Fuentes',
    breadcrumbHome: 'Inicio',
    footer: {
      tagline: 'Lo que hoy enterramos, mañana ilumina el país.',
      explore: 'Entienda el proyecto',
      forWhom: 'Para',
      contact: 'Contacto',
      rights: 'Todos los derechos reservados.',
      note: 'Orchidean One es un proyecto propuesto por ReEnergy. Las cifras del proyecto son estimaciones de diseño y se actualizarán conforme avancen los estudios y permisos.',
    },
  },
  en: {
    skip: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    nav: {
      crisis: 'The crisis',
      plant: 'Orchidean One',
      air: 'Air & health',
      world: 'The world',
      build: 'Where & when',
      faq: 'Questions',
      gov: 'Municipalities',
      monitor: 'Monitoring',
      press: 'Press',
      minute: 'In 1 minute',
      home: 'Home',
    },
    langSwitch: 'Español',
    langSwitchShort: 'ES',
    langSwitchLabel: 'Leer esta página en español',
    langHint: 'Esta página también está en español.',
    langHintCta: 'Leer en español',
    share: {
      title: 'Share it with someone who needs to know',
      whatsapp: 'Send on WhatsApp',
      facebook: 'Facebook',
      x: 'X',
      copy: 'Copy link',
      copied: 'Link copied!',
      native: 'Share',
    },
    listen: 'Listen to this page',
    listenStop: 'Stop',
    readMore: 'Keep reading',
    sources: 'Sources',
    breadcrumbHome: 'Home',
    footer: {
      tagline: 'What we bury today can power the country tomorrow.',
      explore: 'Understand the project',
      forWhom: 'For',
      contact: 'Contact',
      rights: 'All rights reserved.',
      note: 'Orchidean One is a project proposed by ReEnergy. Project figures are design estimates and will be updated as studies and permits progress.',
    },
  },
} as const;
