# NADA Estudios — nadaestudios.com

Website for NADA Estudios, the client-work production studio of No Pasa Nada.
Next.js 16 + Tailwind 4 + Vercel Blob. Same stack and deployment pattern as
`../nocorronada`.

## Run

```bash
npm run dev   # http://localhost:3030 via .claude/launch.json (or default 3000)
```

Env (`.env.local`):
- `SESSION_SECRET` — set (random hex).
- `BLOB_READ_WRITE_TOKEN` — pull from Vercel (`npx vercel env pull`) to enable
  admin panel, lead/order storage, and uploads. Without it the public site
  renders fully from code defaults and funnel APIs log to console in dev mode.

## Map

- `/` home · `/trabajo` portfolio · `/servicios` packages + add-on cart +
  checkout (orders are invoiced, no card payment) · `/empezar` lead-qualifying
  questionnaire (scoring → segment → package recommendation) · `/nosotros` ·
  `/faq` prices FAQ (SEO) · `/produccion/{san-jose,cdmx,nueva-york}` service×city
  SEO pages · `/en` English nearshore landing · `/l/[slug]` unlisted ad landings
  (noindex, admin-managed) · `/bienvenida` client onboarding videos ·
  `/admin` panel (leads, orders, portfolio, team, landings, onboarding, users).
- Content: code defaults in `src/lib/content.ts`, admin overrides in Blob
  (`data/content.json`). Pricing: `src/data/services.ts` (rate card Q2 2026).
- First admin login: user `pietro`, password `nada202601` — **change it after
  first login** (Admin → Usuarios).

## Docs

- `BUILD_BRIEF.md` — brand system, architecture, funnel scoring, SEO targets.
- `AGENTS.md` — rules for AI agents working in this repo.
