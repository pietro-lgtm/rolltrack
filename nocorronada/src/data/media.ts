export type MediaItem = {
  type: "image" | "video";
  /**
   * image → path under public/, e.g. "/media/domingo-01.jpg"
   * video → YouTube/Vimeo URL or a .mp4 path under public/
   */
  src: string;
  caption?: string;
  /** Optional: which corrida/zone it belongs to, shown as a mono tag. */
  tag?: string;
};

/**
 * EDIT THIS FILE to manage the /media gallery — the backend for fotos & videos.
 *
 * Photos: drop files into  public/media/  (jpg/png/webp, ideally <500KB each),
 * then add one entry per file:
 *   { type: "image", src: "/media/aniversario-01.jpg", caption: "Aniversario 2026", tag: "San José" },
 *
 * Videos: prefer YouTube (unlisted works) — big files don't belong in the repo:
 *   { type: "video", src: "https://youtu.be/XXXX", caption: "Recap BUNKER GP" },
 *
 * After editing: npx vercel deploy --prod (from this folder) publishes it.
 */
export const media: MediaItem[] = [
  // TODO: add the archive — the page shows a "pronto" state while this is empty.
];
