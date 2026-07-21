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

  // EDIT to manage sponsors shown on the home page. TODO: confirm current roster.
  sponsors: [
    { name: "HOKA", note: "Official HOKA CR Run Club" },
    { name: "Heineken 0.0", note: "Powered by" },
    { name: "Zepol", note: "Powered by" },
  ],

  /**
   * Featured film/video on the home page.
   * videoUrl accepts a YouTube link (watch/short/embed), a Vimeo link, or a
   * direct .mp4 path (e.g. "/media/film.mp4" after dropping the file in public/media/).
   * Leave videoUrl empty to show the "PRONTO" placeholder.
   */
  film: {
    title: "La película del club", // TODO: real film title
    subtitle: "Un film de NO CORRO NADA",
    videoUrl: "", // TODO: paste YouTube/Vimeo/.mp4 link
  },

  merchUrl: "https://shop.nopasanada.com",

  join: {
    // Google Form that captures signups (source of truth).
    // See SETUP.md → "Google Form" for how to get these values.
    googleFormId: "REPLACE_GOOGLE_FORM_ID",
    googleFormEntries: {
      name: "entry.1000001", // TODO
      email: "entry.1000002", // TODO
      phone: "entry.1000003", // TODO
      source: "entry.1000004", // TODO (optional field: where they signed up from)
    },
    // Kit (ConvertKit) — set KIT_API_KEY in env. Optional: form id to trigger
    // double opt-in (POST /v4/forms/{id}/subscribers after the upsert).
    kitFormId: "", // TODO: Kit form id (recommended, enables double opt-in)
    waiverUrl: "https://forms.gle/REPLACE_WAIVER_FORM", // TODO: release-of-responsibility form
  },

  contact: {
    email: "hola@nopasanada.com", // TODO: confirm
  },
} as const;

export type Site = typeof site;
