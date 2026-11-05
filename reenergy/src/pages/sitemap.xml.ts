import type { APIRoute } from 'astro';
import { ROUTES } from '../lib/i18n';
import { SITE } from '../data/site';

/** Sitemap con alternativas de idioma (hreflang) para que Google indexe ES y EN como pares. */
export const GET: APIRoute = () => {
  const base = SITE.url.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const priority: Record<string, string> = { home: '1.0', minute: '0.9', crisis: '0.9', plant: '0.9', air: '0.9' };
  const urls = Object.entries(ROUTES).flatMap(([key, r]) =>
    (['es', 'en'] as const).map(
      (lang) => `  <url>
    <loc>${base}${r[lang]}</loc>
    <lastmod>${today}</lastmod>
    <priority>${lang === 'es' ? priority[key] ?? '0.7' : '0.5'}</priority>
    <xhtml:link rel="alternate" hreflang="es-CR" href="${base}${r.es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${base}${r.en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${r.es}"/>
  </url>`,
    ),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
