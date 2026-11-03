# ReEnergy · Orchidean One — public website

Bilingual (Spanish first, English toggle) public site for **Orchidean One**, the waste-to-energy plant proposed by **ReEnergy** in Costa Rica. Static site built with [Astro 5](https://astro.build): fast on cheap Android phones, indexable by Google, and deployable anywhere (Vercel, Netlify, Cloudflare Pages, S3).

```bash
cd reenergy
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run check:links  # after build: verifies internal links + hreflang pairs
```

---

## 1. What the site is built to do

| Use case | Where it lands | Why it works |
|---|---|---|
| **Quick link to explain the idea** (WhatsApp, email) | `/en-1-minuto/` · `/en/in-1-minute/` | Six thumb-scroll screens, one idea each, big numbers, “Escuchar” read-aloud button, share bar at the end. |
| **Paid PR push: videos and images for the general public** | `/` (home) | Video-ready hero (`PUBLIC_HERO_VIDEO`), one emotional line, crisis → solution → proof → share. Add `?utm_source=…` to ad links. |
| **Dominating Google** | Every page | One URL per topic and language, `hreflang` pairs, sitemap, FAQPage, Breadcrumb and Organization structured data, sourced copy, per-page social cards. |
| **Governance (municipalities, councils, Asamblea)** | `/municipalidades/` | Value for the canton, printable fact sheet (“Descargar ficha (PDF)”), legal framework, technical-meeting form. |
| **Answering the objections** | `/aire-y-salud/`, `/donde-y-cuando/`, `/preguntas/` | Pollution, odor, health, recycling, ash, zoning, permits, build speed: each answered head-on. |
| **Press** | `/prensa/` | Official description (copy button), five key messages, logo downloads, press form. |
| **Future operational touch point** | `/monitoreo/` | Live emissions board vs. legal limits (today it shows “—” plus a clearly labeled example). |

### Page map

| Key | Spanish | English | Purpose |
|---|---|---|---|
| home | `/` | `/en/` | Campaign landing |
| minute | `/en-1-minuto/` | `/en/in-1-minute/` | Shareable 60-second story |
| crisis | `/la-crisis/` | `/en/the-crisis/` | The problem, with dated timeline |
| plant | `/orchidean-one/` | `/en/orchidean-one/` | The solution, how it works |
| air | `/aire-y-salud/` | `/en/air-and-health/` | “Does it pollute?” |
| world | `/el-mundo-ya-lo-hace/` | `/en/the-world-does-it/` | Copenhagen, Vienna, Tokyo… |
| build | `/donde-y-cuando/` | `/en/where-and-when/` | Siting, permits, timeline |
| faq | `/preguntas/` | `/en/questions/` | All questions (FAQ rich results) |
| gov | `/municipalidades/` | `/en/municipalities/` | Decision-makers + fact sheet |
| monitor | `/monitoreo/` | `/en/monitoring/` | Public emissions board |
| press | `/prensa/` | `/en/press/` | Newsroom |

---

## 2. Messaging architecture

**Master line:** *Lo que hoy enterramos, mañana ilumina el país.* (“What we bury today can power the country tomorrow.”)

Every page follows the same arc: **crisis (red) → solution (green) → proof (blue) → share (WhatsApp)**.

- **Problem first, in their words.** Landfills closing, trucks driving 300+ km, fees going up. These are local, dated, sourced facts, not abstractions.
- **The world normalizes it.** CopenHill's ski slope, Spittelau in central Vienna, 21 plants inside Tokyo. *This is what clean countries do.*
- **Pollution is answered, never denied.** The copy never says “no contamina” or “cero emisiones”. It says: everything emits; *compared to what?*; EU limits; **published, live readings**. A denial gets fact-checked and loses; a comparison plus proof holds up.
- **Zoning and speed get concrete answers.** Six non-negotiable siting rules (industrial zone, away from homes, near highways and a substation). Speed comes from a *proven* design, not from skipping permits.
- **The name works for us.** Orchidean refers to the orchid, Costa Rica's national flower (guaria morada). Orchids live on the tree without harming it and use what the forest lets pass by.
- **Technology origin.** The copy says “tecnología probada en más de 3.000 plantas del mundo” and names no supplier. It never attributes the technology to any country or vendor, and the examples (Copenhagen, Vienna, Tokyo, Sweden, Switzerland, Singapore) are presented as examples of the *category* of plant, not of this vendor.

Tone: *usted*, short sentences, everyday words, one idea per block, big numbers, icons. A “Escuchar esta página” button (the phone's own text-to-speech, no server) on every inner page helps people who prefer listening to reading.

---

## 3. ⚠️ Pre-launch verification (must do)

Nothing goes public until these are checked. A single wrong number found by a journalist costs the whole conversation.

### 3a. Project figures
All live in **`src/data/facts.ts` → `PROJECT`** and propagate everywhere.

Confirmed by ReEnergy (Nov 2026): **1,000 t/day**, **20 MW net**, **10 ha minimum**, **18–22 months** of construction after permits, a **6-month target** for studies and permits, **~150 permanent jobs**, **850–1,100 °C** moving multi-stage grate (Belgian design), first plant in **Cartago** and second in **Alajuela**, a waste study by **UCR**, and letters of interest from Santa Ana, Curridabat, Alajuelita, Desamparados, Montes de Oca (San Pedro) and La Unión.

Still open:
| Field | Current value | Notes |
|---|---|---|
| `homes` | ~50,000 | **Our calculation**: 20 MW × ~8,000 h ÷ ~3,000 kWh per home per year. Confirm or replace. |
| construction jobs | not shown | No figure yet |
| gas-cleaning stages | "several" | The air page lists the typical modern configuration; confirm against the actual design |

Commitments confirmed by ReEnergy and now on the site: EU emission limits; continuous public emissions online **and on public screens at the plant and the municipalities**; mandatory independent audits; **100% private investment, no public funds**; a municipal fee **equal to or below** today's cost of hauling trash to Guápiles or Puntarenas; visitor center, green roof and local hiring; ash mixed with cement into paving blocks.

⚠️ **Ash wording to double-check with engineering:** the site says the ash goes into paving blocks and that the *fine filter ash* is stabilized with cement under Ministry of Health oversight. Fly ash is treated as hazardous in most countries. Before saying publicly that filter ash itself goes into street pavers, confirm the process and its regulatory approval.

### 3b. Third-party facts: open every link
All sources are in **`src/data/facts.ts` → `SOURCES`** and appear as numbered footnotes. They were researched on 2026-11-02 **from search results only (full articles were not opened)**. Before launch:
1. Open every URL and confirm that the figure and wording match.
2. **Landfill status changes fast.** El Huazo's possible closure (reported for around Sept 2026) and La Carpio's technical closure were reported in mid-2026 and are **not confirmed as of November**. Update `/la-crisis/` (timeline) and the home crisis band.
3. Recycling figures conflict between sources (4%–13%), so the site deliberately says **“menos del 10%”**.

**Do not add:** “94% goes to open dumps” (contradicts the Ministry of Health), a fireworks-vs-dioxin comparison (unsupported), or “first plant in Latin America” (Brazil's Barueri opens in 2027).

### 3c. Config
`src/data/site.ts` and `.env` (see `.env.example`):
- `SITE_URL`: the final domain (used for canonical URLs, sitemap and social cards).
- `PUBLIC_FORM_ENDPOINT`: Formspree, Getform or your own backend. Without it, forms open the visitor's email app.
- `PUBLIC_HERO_VIDEO`: the campaign video file (for example `/media/orchidean-one.mp4`; keep it muted-loop friendly and under 8 MB).
- Emails, WhatsApp number and social profiles.

---

## 4. Google playbook (owning the narrative)

Done in code: semantic pages per query cluster, `es-CR` + `en` hreflang pairs, `sitemap.xml`, `robots.txt`, FAQPage, BreadcrumbList, Organization/WebSite/Project JSON-LD, descriptive titles, and per-page 1200×630 share images (`public/og/`).

To do at launch:
1. **Google Search Console**: verify the domain, submit `/sitemap.xml`, and request indexing of the home, `/aire-y-salud/` and `/la-crisis/`.
2. **Brand queries.** Make sure “Orchidean One” and “ReEnergy” are used identically everywhere: press releases, YouTube descriptions, social bios. Point all of them to this domain.
3. **Target queries** the pages are written for: *crisis de la basura Costa Rica*, *rellenos sanitarios Costa Rica*, *planta de basura a energía Costa Rica*, *valorización energética*, *¿la incineración contamina?*, *El Huazo*, *La Carpio*.
4. **Fresh content.** Add a *Noticias* section (recommended next build) so every milestone (study, consultation, permit) becomes a new indexed page.
5. **Earned links.** Every press release links to the specific sourced page (for example `/aire-y-salud/`), not just the home page.

---

## 5. Operational phase (later)

`/monitoreo/` is the seed of the operational site. When the plant runs:
- Feed continuous emissions monitoring (CEMS) data from a small API endpoint (or a static JSON regenerated every N minutes) into the gauges. Each gauge is already laid out as *value / unit / limit*.
- Replace “—” with live values, and remove the “EJEMPLO ILUSTRATIVO” chart.
- Add a downloadable history (CSV), an exceedance log, and per-canton tonnage reports for municipalities (promised on `/municipalidades/`).
- Never display simulated numbers as real ones.

---

## 6. Code map

```
src/
  data/
    facts.ts      ← ALL numbers + sources (edit here first)
    faq.ts        ← all Q&A, both languages
    site.ts       ← domain, emails, form endpoint, hero video
    logo.ts       ← generated logo geometry (do not edit by hand)
  lib/i18n.ts     ← routes for both languages, UI strings, number format
  layouts/Base.astro   ← <head>: SEO, hreflang, OG, JSON-LD
  components/     ← Header, Footer, ShareBar (WhatsApp first), ListenButton,
                    PageHero, HowItWorks, PlantScene (SVG), WorldCards, Faq,
                    SignupForm, CtaBand, Sources, Ref (footnotes)
  views/          ← one file per page, Spanish + English copy side by side
  pages/          ← thin route files (es at /, en at /en/)
public/
  img/            ← brand photos (logo removed from the mist shot)
  brand/          ← logo SVG/PNG in the four brand color variants
  og/             ← social share images (npm run og)
scripts/
  og-images.cjs   ← regenerate share images after changing headlines
  brand-png.cjs   ← regenerate favicons / logo PNGs
  check-links.mjs ← link + hreflang checker
```

**Editing copy:** each `src/views/*.astro` has its Spanish and English text next to each other. Change both.
**Adding a page:** add it to `ROUTES` in `src/lib/i18n.ts`, create a view, add two thin files under `src/pages/`, then add OG text in `scripts/og-images.cjs`.

### Brand
- Fonts: **Poppins Regular** for titles and **Georgia Regular** for body and subtitles. Gelasio, a metric-compatible Georgia, is the fallback on Android. The type scale follows the brand **8:4:3** ratio (`--fs-title : --fs-sub : --fs-body`).
- Colors: Lago Blue `#1b47b2`, Sprout `#d1f462`, Mountain Verde `#a1c93e`, Cartago Sky `#f9f6e4`, Volcano `#e03b47`. Volcano marks the *problem*, greens the *solution*, and blue the *proof and trust*.
- Logo: the leaf mark is redrawn as a vector, and the “reenergy” wordmark, with its leaf-shaped “ee” ligature, is traced from the brand book into outlines (`src/data/logo.ts`, `public/brand/`). **Replace both with the designer's master files when available.**
- Mountain Verde on cream fails text contrast, so green *text* uses `--verde-ink` (`#56701a`). The brand green is kept for shapes and large type.

### Deploy (Vercel + reenergygroup.com)
- The Vercel project **`reenergy-site`** builds this folder (**Root Directory = `reenergy`**, Astro preset).
- **Hidden from Google until approved.** With `PUBLIC_INDEXABLE` unset, every page carries `<meta name="robots" content="noindex, nofollow">` and `robots.txt` omits the sitemap. People with the link can see everything; search engines won't list it.
- **To go public on Google:** in Vercel go to Project → Settings → Environment Variables, set `PUBLIC_INDEXABLE=true` (Production), redeploy, and then submit `https://reenergygroup.com/sitemap.xml` in Google Search Console.
- **DNS at GoDaddy** (Domain → DNS → Manage records):
  - `A` record, name `@`, value `76.76.21.21` (replace GoDaddy's default “Parked” A record)
  - `CNAME` record, name `www`, value `cname.vercel-dns.com` (replace the existing `www` record)
  - Vercel issues the HTTPS certificate automatically once DNS resolves (minutes to a few hours).
- **Email:** the site lists `hola@`, `prensa@` and `municipalidades@reenergygroup.com`. Create these mailboxes or forwards in GoDaddy (or Google Workspace) **before launch**, and keep the existing MX records when you edit DNS.
