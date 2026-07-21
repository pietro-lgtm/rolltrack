import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * XML sitemap for search + AI crawlers. One entry per real route.
 * Priorities: home first, then the two conversion pages (unite / eventos),
 * then bunker-gp and faq. lastModified is build-time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/eventos", changeFrequency: "weekly", priority: 0.9 },
    { path: "/unite", changeFrequency: "monthly", priority: 0.9 },
    { path: "/bunker-gp", changeFrequency: "monthly", priority: 0.8 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  ];

  return routes.map((r) => ({
    url: `${site.url}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
