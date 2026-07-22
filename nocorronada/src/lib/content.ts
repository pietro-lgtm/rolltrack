import { site } from "@/config/site";
import { events as defaultEvents, type ClubEvent } from "@/data/events";
import { media as defaultMedia, type MediaItem } from "@/data/media";
import { ads as defaultAds, type AdBanner } from "@/data/ads";
import { readJson, OVERRIDES_DOC } from "@/lib/store";

/**
 * Content = code defaults (src/data, src/config) + admin overrides (Blob).
 * The /admin panel writes overrides; pages read through getContent() with
 * ISR (revalidate=60), so edits go live within a minute — no deploy needed.
 */

export type ContentOverrides = {
  film?: { title: string; subtitle: string; videoUrl: string };
  events?: ClubEvent[];
  media?: MediaItem[];
  ads?: AdBanner[];
  sponsors?: { name: string; note: string }[];
};

export type SiteContent = {
  film: { title: string; subtitle: string; videoUrl: string };
  events: ClubEvent[];
  media: MediaItem[];
  ads: AdBanner[];
  sponsors: readonly { name: string; note: string }[];
};

export async function getContent(): Promise<SiteContent> {
  const o = (await readJson<ContentOverrides>(OVERRIDES_DOC)) ?? {};
  return {
    film: o.film ?? site.film,
    events: o.events && o.events.length > 0 ? o.events : defaultEvents,
    media: o.media ?? defaultMedia,
    ads: o.ads ?? defaultAds,
    sponsors: o.sponsors ?? site.sponsors,
  };
}

export function nextDatedEventFrom(events: ClubEvent[], now = new Date()) {
  return events
    .filter((e) => e.dateISO && new Date(e.dateISO) > now && e.status !== "past")
    .sort((a, b) => +new Date(a.dateISO!) - +new Date(b.dateISO!))[0];
}

export function getEventFrom(events: ClubEvent[], slug: string) {
  return events.find((e) => e.slug === slug);
}
