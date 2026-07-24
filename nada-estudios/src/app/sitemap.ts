import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { defaultContent } from "@/lib/content";

const CIUDADES = ["san-jose", "cdmx", "nueva-york"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/trabajo`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/empezar`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${site.url}/en`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: { es: site.url, en: `${site.url}/en`, "x-default": site.url },
      },
    },
  ];

  const portfolioRoutes: MetadataRoute.Sitemap = defaultContent.portfolio.map((item) => ({
    url: `${site.url}/trabajo/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const produccionRoutes: MetadataRoute.Sitemap = CIUDADES.map((ciudad) => ({
    url: `${site.url}/produccion/${ciudad}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...portfolioRoutes, ...produccionRoutes];
}
