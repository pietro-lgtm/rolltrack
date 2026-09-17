import { readJson, CLUB_APPS_DOC, type ClubApplication } from "@/lib/store";

// Reads the private Blob document; needs the Node.js runtime.
export const runtime = "nodejs";

/**
 * Public, PII-free summary of "Abrí tu club" applications.
 * Exposes only aggregate counts and the last few distinct "ciudad, país"
 * strings — never names, emails, or phones.
 */
export async function GET() {
  const apps = (await readJson<ClubApplication[]>(CLUB_APPS_DOC)) ?? [];

  const total = apps.length;
  const latest = apps[apps.length - 1]?.submittedAt ?? null;

  const cities: string[] = [];
  for (let i = apps.length - 1; i >= 0 && cities.length < 3; i--) {
    const a = apps[i];
    const city = `${a.ciudad}, ${a.pais}`;
    if (!cities.includes(city)) cities.push(city);
  }

  return Response.json({ total, latest, cities });
}
