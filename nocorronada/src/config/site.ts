/**
 * Single source of truth for every external link, handle, and integration ID.
 * Anything marked TODO is a placeholder — see SETUP.md for how to fill it in.
 */
export const site = {
  name: "NO CORRO NADA",
  shortName: "NCN",
  tagline: "Otro club de correr. Siempre gratis.",
  motto: "Buena actitud y cero excusas.",
  description:
    "NO CORRO NADA es el run club de No Pasa Nada en Costa Rica. Otro club de correr: abierto a todo el mundo, siempre gratis, sin niveles. Corremos los domingos en San José (y creciendo), con eventos como el BUNKER GP.",
  // Canonical production URL.
  url: "https://nocorronada.com",
  locale: "es_CR",
  city: "San José, Costa Rica",
  foundedYear: 2024,

  social: {
    instagram: "https://www.instagram.com/nocorronada",
    tiktok: "https://www.tiktok.com/@nocorronada",
    strava: "https://www.strava.com/clubs/1323873",
    whatsapp: "https://chat.whatsapp.com/REPLACE_INVITE_CODE", // TODO: group invite link
    parentBrand: "https://www.instagram.com/nopasanada_ig",
    substack: "https://nopasanadaoficial.substack.com/s/no-corro-nada",
  },

  // EDIT to manage sponsors. Logos live in public/sponsors/ (shown white on black).
  sponsors: [
    { name: "Heineken 0.0", note: "Powered by", logo: "/sponsors/heineken00.svg" },
    { name: "HOKA", note: "Official HOKA CR Run Club", logo: "/sponsors/hoka.svg" },
    { name: "Zepol", note: "Powered by", logo: "/sponsors/zepol.png" },
  ],

  /**
   * Featured film/video on the home page.
   * videoUrl accepts a YouTube link (watch/short/embed), a Vimeo link, or a
   * direct .mp4 path (e.g. "/media/film.mp4" after dropping the file in public/media/).
   * Leave videoUrl empty to show the "PRONTO" placeholder.
   */
  film: {
    title: "Lo Que Nadie Te Dice De Entrenar 2 Años Para Una Meta",
    subtitle: "Un film de Pietro Cercone",
    videoUrl: "https://www.youtube.com/watch?v=_lEM9oSkRoI",
  },

  merchUrl: "https://shop.nopasanada.com",
  /** Shopify collection whose products render as cards on the home page. */
  merchCollection:
    "https://shop.nopasanada.com/collections/planes-de-entrenamiento-personalizados-no-corro-nada-x-athals",

  join: {
    // The club's real Google Form ("No Corro Nada Run Club") — captures signups.
    googleFormId:
      "1FAIpQLSfZv-qAkVi2k6R_VC5FsfXLskgWWjCwG-m8As9uFuFkjPrEEQ",
    googleFormEntries: {
      nombre: "entry.476732261",
      apellido: "entry.142056267",
      edad: "entry.1114497755",
      cedula: "entry.1414788598",
      nivel: "entry.1511102160", // Principiante | Intermedio | Avanzado
      meta5k: "entry.7873630",
      correo: "entry.23675720",
      telefono: "entry.351183897",
      aceptaSalud: "entry.1460055984", // checkbox, value "Sí"
      aceptaAcuerdo: "entry.1654342813", // checkbox, value "Sí"
    },
    nivelOptions: ["Principiante", "Intermedio", "Avanzado"],
    // Kit (ConvertKit) — set KIT_API_KEY in env. Optional: form id to trigger
    // double opt-in (POST /v4/forms/{id}/subscribers after the upsert).
    kitFormId: "", // TODO: Kit form id (recommended, enables double opt-in)
  },

  club: {
    // "Abrí tu club" applications: stored in Blob (visible in /admin) and,
    // optionally, forwarded to a Google Form — create one and fill these in
    // (same "pre-filled link" trick, see SETUP.md) to also capture in Drive.
    googleFormId: "", // TODO (optional)
    googleFormEntries: {
      nombre: "",
      apellido: "",
      telefono: "",
      correo: "",
      ciudad: "",
      pais: "",
      confirma10: "",
      confirma2x: "",
    },
  },

  contact: {
    email: "hola@nopasanada.com", // TODO: confirm
  },
} as const;

export type Site = typeof site;
