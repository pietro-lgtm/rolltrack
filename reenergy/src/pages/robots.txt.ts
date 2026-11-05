import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

// Mientras el sitio esté oculto (SITE.indexable = false) se permite rastrear para que Google
// lea la etiqueta "noindex" de cada página, pero no se anuncia el sitemap.
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n${SITE.indexable ? `\nSitemap: ${SITE.url.replace(/\/$/, '')}/sitemap.xml\n` : ''}`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
