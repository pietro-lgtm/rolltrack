export type AdBanner = {
  /** Where it renders: "home" (below the film section) or "corridas" (below the calendar). */
  slot: "home" | "corridas";
  /** Path under public/, e.g. "/ads/hoka-banner.png". Recommended ~1200x200 (or 1200x400). */
  image: string;
  href: string;
  alt: string;
};

/**
 * EDIT THIS FILE to manage sponsor banners / ads.
 * Drop the artwork into  public/ads/  and add one entry per banner:
 *   { slot: "home", image: "/ads/hoka.png", href: "https://hoka.com", alt: "HOKA" },
 * Slots render nothing while this list is empty.
 */
export const ads: AdBanner[] = [
  // TODO: add banners when the artwork is ready.
];

export const adsForSlot = (slot: AdBanner["slot"]) =>
  ads.filter((a) => a.slot === slot);
