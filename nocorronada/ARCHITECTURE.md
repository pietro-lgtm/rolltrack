# NO CORRO NADA — Site Architecture

Run club by No Pasa Nada (Costa Rica). Black + neon green, alternative running culture — Satisfy-adjacent editorial brutalism, not corporate fitness.

## Domain

- `nocorronada.com` — owned by Pietro (GoDaddy, registered 2025-06-03, expires 2028). Canonical domain, attached to the Vercel deployment. The 2025 "Launching Soon" placeholder was GoDaddy's default site.
- Still available as defensive registrations: `.net`, `.org`, `.co`, `.run`, `.club`, `.cr`.

## Phasing

**Phase 1 (build now):** static-first marketing + community site.
- Home, Events, BUNKER GP microsite page, Join (email+phone capture), FAQ, full SEO/AI-visibility layer.
- Signup: custom form → API route → Google Form (capture) + Kit (email marketing) → success screen with WhatsApp group invite + waiver link.
- BUNKER GP: event page with "notify me / pre-registration" (no payment yet).

**Phase 2 (post-launch):** paid inscriptions (CR gateway per research: hosted checkout or SINPE+verification), merch drop page (buy links), Strava club widget embeds.

**Phase 3 (needs DB/auth — Supabase):** member pages + benefit claiming, photo check-in rewards, referral unlock system (Morning Brew model: unique ref code per member, milestone rewards).

## Stack

- **Next.js 16** (App Router, static generation everywhere possible), TypeScript, **Tailwind v4** (`@theme` tokens in `globals.css`).
- No CMS: content lives in typed data files under `src/data/`. Editing an event = editing one object. Cheap, versioned, agent-editable.
- All external links/IDs centralized in `src/config/site.ts` (Strava, WhatsApp invite, Instagram, TikTok, Kit form/API, Google Form ID + entry IDs, waiver URL). Placeholders documented in `SETUP.md`.
- Deploy: Vercel (repo → project → custom domain).

## Routes

| Route | Purpose |
|---|---|
| `/` | Hero, next-run block (auto-computes next date from data), BUNKER GP teaser, how-to-join 3 steps, Strava CTA, FAQ teaser |
| `/eventos` | Recurring schedule + upcoming special events list (from `src/data/events.ts`) |
| `/bunker-gp` | Race microsite: GP identity, race facts, categories, pre-registration CTA (reuses join form with `source=bunker-gp`) |
| `/unite` | Join form: name, email, phone, consent checkbox → success state with WhatsApp button + waiver link |
| `/faq` | Q&A incl. where/who/what-do-i-need + FAQPage JSON-LD |
| `/api/join` | Route handler: validates, posts server-side to Google Form `formResponse` + Kit API v4 (graceful if envs unset) |
| `sitemap.ts`, `robots.ts`, `llms.txt`, `manifest.ts` | SEO/AI layer |

## Data model (`src/data/`)

- `events.ts`: `{ slug, title, type: 'weekly'|'race'|'special', dateISO?, recurrence?, location {name, mapsUrl}, description, stravaRouteUrl?, status }`
- `faq.ts`: `{ q, a, category }[]` — also feeds JSON-LD.
- `benefits.ts` (placeholder for phase 3): partner, perk, howToClaim.

## Signup pipeline

```
form (client) → POST /api/join
  ├─► Google Form formResponse endpoint (server-side POST, entry.NNN ids from SETUP.md)
  ├─► Kit API v4: create subscriber (email, first_name, phone as custom field, tag "run-club")
  └─► 200 → success UI: WhatsApp group deep link + waiver + Strava club link
```
Google Form stays the source-of-truth capture (Pietro's requirement); Kit gets the email directly so no Zapier dependency. Phone lands in both; WhatsApp add stays manual/invite-link (groups have no public API).

## Design system (tokens in globals.css)

- **Colors**: `--black #0A0A0A`, `--ink #E7E7E2` (off-white), `--volt #C6FF00` (neon green), sparse use of `--asphalt #1A1A1A` surfaces. Volt is for action + emphasis only; the site is 90% black.
- **Type**: Archivo (variable, width axis → expanded uppercase display), Space Mono for data labels (dates, pace, distances, bib numbers). No Inter, no gradient text, no glassmorphism, no emoji-as-icon.
- **Devices**: marquee ticker (`NO CORRO NADA •`), race-bib number blocks, mono uppercase micro-labels, hairline borders (`1px solid rgba(231,231,226,.15)`), noise/grain overlay, checkerboard strip for BUNKER GP, oversized display type that bleeds off-grid.
- Motion: minimal — marquee, hover inverts (black↔volt). No scroll-jacking.

## SEO / AI visibility

- `metadata` per page (es-CR primary), canonical to chosen domain, OG image (1200×630, black/volt).
- JSON-LD: `SportsClub`+`Organization` (home), `SportsEvent` w/ `offers` (BUNKER GP), `FAQPage` (faq), `WebSite`.
- `robots.ts`: allow all + explicitly allow GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Applebot-Extended.
- `public/llms.txt`: club summary, schedule, how to join, BUNKER GP, links.
- `sitemap.ts` from route list. Semantic HTML (single h1/page, address/time elements).
- Off-site checklist (SETUP.md): Google Business Profile, Strava club description links back, IG bio link, consistent NAP.

## Build plan (agents, token-efficient)

1. Foundation (inline): tokens, fonts, config, data files, layout + nav/footer, shared UI (Marquee, SectionLabel, VoltButton, Ticker).
2. Parallel page agents (opus): home / bunker-gp / eventos+faq / unite+api. Each gets the design-system contract + data contracts only.
3. SEO agent (opus): sitemap, robots, llms.txt, JSON-LD components, metadata pass.
4. Review workflow: adversarial design+code review, build check, browser verify.
