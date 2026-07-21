# SETUP — wiring NO CORRO NADA to the real world

Everything the site needs that only you can provide. Each item points at the exact
file/field to edit. The site works before these are set — forms degrade gracefully.

## 1. Domain

- `nocorronada.com` — **owned by Pietro** (GoDaddy, registered 2025-06-03, expires 2028).
  It's the canonical domain (`url` in [src/config/site.ts](src/config/site.ts)).
  DNS points at Vercel: `A @ → 76.76.21.21`, `CNAME www → cname.vercel-dns.com`.
- Still available if wanted defensively: `nocorronada.net`, `.org`, `.co`, `.run`,
  `.club`, `.cr` (nic.cr, pricier, max local signal).

## 2. Google Form (signup capture)

Create a Form with fields: Nombre, Correo, Teléfono, Fuente (short answer, optional).
Then get the internal IDs:

1. Open the form → ⋮ menu → **"Get pre-filled link"**.
2. Fill dummy answers → "Get link" → copy it.
3. The URL contains `entry.123456789=...` pairs — one per field, in order.
4. Copy the form's ID from its URL: `docs.google.com/forms/d/e/<FORM_ID>/viewform`.
5. Paste FORM_ID and the four `entry.NNN` keys into `join.googleFormId` /
   `join.googleFormEntries` in [src/config/site.ts](src/config/site.ts).

Responses land in the linked Sheet as usual. The site posts server-side, so no CORS issues.

## 3. Kit (ConvertKit)

1. Kit → Account Settings → Developer → **Add a new key** (v4 API key, shown once).
2. Put it in `.env.local` as `KIT_API_KEY=...` (and in Vercel → Project → Env Vars).
3. Optional but recommended: create a Form in Kit ("Run Club") with double opt-in on,
   and put its numeric ID in `join.kitFormId` in site.ts — subscribers then get the
   confirmation email. Phone arrives as custom field `phone_number` (create it once in
   Kit → Subscribers → Customize fields).

## 4. WhatsApp group

1. In the group: Group info → Invite via link → copy `https://chat.whatsapp.com/...`.
2. Paste into `social.whatsapp` in site.ts.
3. **Turn on "Approve new members"** in group settings — the link is only revealed
   after form submit (never in the page HTML), but approval kills spam-joiners if it leaks.
4. Groups cap at 1024 people — at your growth rate plan a WhatsApp **Community**
   (groups per zone: Chepe, Guana…) sooner rather than later.

## 5. Waiver (exoneración)

Make a Google Form with the release text + full name + ID number + signature checkbox.
Paste its short link into `join.waiverUrl` in site.ts.

## 6. Deploy (Vercel)

```bash
cd nocorronada && git init && git add -A && git commit -m "NCN site v1"
# push to GitHub, then vercel.com → New Project → import → add KIT_API_KEY env var
```
Point the domain's DNS at Vercel when registered. `site.url` must match the final domain
(it feeds canonical URLs, sitemap, robots, JSON-LD).

## 7. SEO off-site checklist (the part the code can't do)

- **Google Business Profile**: create one, category **"Running club"** (specificity is a
  ranking factor), San José. Add every Sunday run as a GBP Event. Respond to reviews <24h.
- Put the site URL in the **Instagram bio**, **TikTok bio**, **Strava club description**,
  and Substack about page (these become `sameAs` corroboration → Knowledge Panel).
- NAP consistency: same name "NO CORRO NADA" everywhere.
- Ask El Financiero / La República style press to link the domain when they cover you
  (they've already written about the club — links from them are the strongest signal).

## 8. Payments — when inscriptions open (phase 2)

Research conclusion (July 2026):
- **Skip Stripe** (not available in CR; US-LLC workaround not worth it at ₡5–15k tickets).
- **Phase 1 (zero code)**: SINPE Móvil + the Google Form + screenshot verification. Free,
  works today, fine under ~100 inscriptions.
- **Phase 2**: **ONVO Pay** or **PayValida** — both 1.5% on SINPE Móvil, ~3.5–3.9% + $0.25
  on cards, no monthly fee, hosted payment links (no code) or full API. ONVO is
  SUGEF-registered and has the cleaner dev experience.
- Alternative: **Eventick** (eventickcr.com, SINPE-native ticketing) or **A Buen Paso**
  (abuenpaso.cr, the dominant CR race-registration platform — commission by contact:
  inscripciones@abuenpaso.cr, 8843-3765).
- **Merch**: Gumroad pays out to CR banks (simplest, ~10% cut). Shopify works but needs a
  local gateway (Shopify Payments unavailable in CR) + ~2% surcharge.

## 9. Phase 3 groundwork (member pages, check-ins, referrals)

Needs a database + auth (Supabase recommended). Sketch already in
[ARCHITECTURE.md](ARCHITECTURE.md): member profile w/ personal benefits page, photo
check-in counter (reward tiers), Morning-Brew-style referral codes (unique link per
member; unlocks at 3/10/25 referrals). Build when BUNKER GP settles.
