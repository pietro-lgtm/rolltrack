# NO CORRO NADA — sitio del club

Run club de No Pasa Nada (Costa Rica). Otro club de correr. Siempre gratis.

Next.js 16 + Tailwind v4. Black + volt (#C6FF00). No CMS: el contenido vive en archivos editables.

## Comandos

```bash
npm run dev     # desarrollo → http://localhost:3000
npm run build   # build de producción
```

## Dónde se edita qué

| Quiero cambiar… | Archivo |
|---|---|
| Eventos, fechas, BUNKER GP | `src/data/events.ts` |
| Preguntas frecuentes | `src/data/faq.ts` |
| Links (IG, Strava, WhatsApp), IDs de forms, sponsors | `src/config/site.ts` |
| Colores / tipografía | `src/app/globals.css` |

## Documentos

- [ARCHITECTURE.md](ARCHITECTURE.md) — decisiones, fases (pagos, miembros, merch, referidos)
- [SETUP.md](SETUP.md) — cómo conectar Google Forms, Kit, WhatsApp, dominio, deploy, SEO off-site
