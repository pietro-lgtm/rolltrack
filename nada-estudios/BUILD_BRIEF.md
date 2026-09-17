# NADA Estudios — Build Brief (source of truth)

Website for NADA Estudios (nadaestudios.com), the client-work production studio
of No Pasa Nada. High-end social content production: campaigns + monthly
retainers. Offices: San José CR, CDMX, NYC. Clients: Heineken, Dos Pinos,
Universal, Portafolio Inmobiliario, AR Holdings, Banco Promerica, ARi App,
Mercado de Valores, KleanTab, Muscle Points.

## Positioning (from competitive research — encode this in copy)
- **Every CR/MX competitor hides pricing.** NADA publishes real prices tied to
  deliverables. This is the #1 differentiator — lean into it everywhere.
  ("Precios publicados. Sin llamadas misteriosas.")
- **Lead with tier-1 client proof, not adjectives.** No "increíble/extraordinario"
  filler. Named clients + concrete deliverables. Outcome-first case copy.
- **Productized like SaaS**: fixed packages + add-on menu + instant funnel,
  vs. competitors' "cotizar" forms.
- **Bilingual/nearshore lane is open**: US buyers searching "content production
  Costa Rica / nearshore content production LatAm" find almost nobody.
- Copy voice: Spanish, voseo costarricense (querés, tenés, contanos). Short.
  Confident. Zero filler. Mono labels in lowercase or UPPERCASE, never Title Case
  fluff.

## Design system (already built — use it, don't reinvent)
The brand is the rate card: **editorial brutalism**. White paper `bg-paper`,
black ink `text-ink`, electric yellow `accent` (#F2E900) used sparingly,
`smoke` (#F2F2EF) for quiet panels, `mid` for secondary text.
- Display type: `.display` (Archivo 900, tight). Mono meta: `.label-mono`.
- Price rows: `.leader` (dotted leaders like the rate card):
  `<div className="leader"><span className="leader-name">X</span><span className="leader-price">$650</span></div>`
- Buttons: `.btn`, `.btn-ghost`, `.btn-accent`. Links: `.link-under`.
- Hard 2px black borders (`border-2 border-ink`) — no rounded corners, no
  shadows, no gradients, no glassmorphism, no purple. Ever.
- Motion: `<Reveal>` wrapper (`@/components/site/Reveal`), `<Marquee>`
  (`@/components/site/Marquee`). CSS-first, respects reduced motion.
- Black sections invert: `bg-ink text-paper`.
- Mobile-first responsive. Everything must look intentional at 375px and 1440px.

## Architecture
- Next.js 16 (App Router, Turbopack) + Tailwind 4 + Vercel Blob. React 19.
- **Route params/searchParams are Promises** (`const { slug } = await params`).
  `cookies()` is async. Docs: `node_modules/next/dist/docs/`.
- Data: JSON docs on Vercel Blob via `@/lib/store` (readJson/writeJson/appendJson,
  typed docs: `Lead`, `Order`, `AdminUser` + doc path constants).
- Editable content: `@/lib/content` — `getContent()` merges Blob overrides over
  code defaults (portfolio, team, landings, onboarding). Public pages call
  `getContent()` directly in server components.
- Auth: `@/lib/auth` — scrypt users in Blob, HMAC cookie session, `getSession()`.
- Pricing data: `@/data/services` — `packages`, `addOns`, `terms`, `formatUsd`.
- Site constants: `@/config/site` — `site`, `clients`, `nav`.
- Cart: `@/components/cart/CartProvider` — `useCart()` with items/add/remove/
  setQty/clear/count/subtotal/hasQuoteItems. Already mounted in root layout.
- Route groups: `(site)` has Nav+Footer (`pt-14` for fixed nav). `/admin`,
  `/l/[slug]`, `/bienvenida` are bare (own minimal chrome).
- **Dev without Blob token**: API routes that write must check
  `process.env.BLOB_READ_WRITE_TOKEN`; if unset, `console.log` the payload and
  return `{ ok: true, dev: true }` so the funnel is testable locally.
- Env: `SESSION_SECRET` (set in .env.local), `BLOB_READ_WRITE_TOKEN` (Vercel).

## Route map & ownership
| Route | Owner | Notes |
|---|---|---|
| `/` + `components/home/*` | orchestrator | flagship home |
| `/servicios`, `/servicios/checkout`, `/api/orders`, `components/servicios/*` | agent: servicios | packages + add-on cart |
| `/empezar`, `/api/leads`, `components/empezar/*` | agent: empezar | qualification funnel |
| `/admin/*`, `/api/admin/*`, `/api/img`, `components/admin/*` | agent: admin | panel + APIs |
| `/l/[slug]`, `/bienvenida` | agent: landings | ad landings + client onboarding |
| `/trabajo`, `/trabajo/[slug]`, `/nosotros` | agent: trabajo | portfolio + about |
| `sitemap.ts`, `robots.ts`, `/llms.txt`, `/faq`, `/produccion/[ciudad]`, `/en`, `components/seo/*` | agent: seo | SEO/AI layer |

## Lead scoring (questionnaire → segment → recommendation)
Answers and points:
- need: retainer=30, campana=20, evento=12, fotos=10, no-se=8
- companySize: solo=0, 2-10=8, 11-50=16, 51-200=24, 200+=30
- currentContent: agencia=15, in-house=10, nadie=5
- timeline: ya=15, este-mes=12, trimestre=6, explorando=2
- investment: "5k+"=25, "2.5-5k"=20, "1-2.5k"=12, "<1k"=2, hablar=15
- industry: no score (personalization only)

Segment (max score 115): `score >= 80` → **hot**; `55–79` → **warm**;
`investment === "<1k"` → **oneoff** (route to /servicios add-ons);
else → **nurture**.

Recommendation: investment 5k+ → Paquete C; 2.5–5k → B; 1–2.5k → A;
<1k → "Servicios individuales" (link /servicios#addons); hablar → by
companySize (51+ → C, 11-50 → B, else A).

Question order (research-backed: easy first, contact LAST, one per screen,
progress bar, instant recommendation as payoff): need → industry →
companySize → currentContent → timeline → investment (framed "para
recomendarte el paquete correcto") → contact → result screen.

## Funnel wiring
- Every CTA on the site points to `/empezar` (optionally `?src=<source>`).
- Ad landings `/l/[slug]` (noindex) CTA → `/empezar?src=<slug>`.
- `/empezar` result screen: recommended package + WhatsApp CTA
  (`site.whatsappUrl`) + link to `/servicios`.
- `/servicios` checkout → POST `/api/orders` → confirmation screen with
  WhatsApp CTA. No card payments — orders are invoiced (50% al firmar).

## SEO keyword targets (from research)
ES high-intent: "productora audiovisual costa rica", "agencia de contenido
costa rica", "manejo de redes sociales costa rica", "video para redes sociales
costa rica", "cuánto cobra una agencia de marketing costa rica" (own this via
FAQ with real prices), "productora audiovisual cdmx", "agencia de contenido cdmx".
EN nearshore: "content production agency costa rica", "video production company
costa rica", "nearshore content production latam", "social media agency costa rica".
JSON-LD that matters: Organization (site-wide), Service (per service page),
FAQPage (only where Q&A visibly rendered), VideoObject (case videos).
hreflang es/en reciprocal + x-default where /en mirrors exist.
