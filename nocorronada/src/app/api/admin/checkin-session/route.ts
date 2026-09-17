import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { site } from "@/config/site";
import {
  readJson,
  writeJson,
  appendJson,
  CHECKIN_SESSIONS_DOC,
  type CheckinSession,
} from "@/lib/store";

export const runtime = "nodejs";

/** How long a QR stays live before check-ins are rejected. */
const OPEN_HOURS = 12;

/** No ambiguous glyphs (0/O, 1/l/I) — organizers read these out loud. 32 chars = no modulo bias. */
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function makeId(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += ALPHABET[b & 31];
  return out;
}

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function checkinUrl(id: string) {
  return `${site.url}/checkin/${id}`;
}

type PostBody = { eventSlug?: unknown; title?: unknown };

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  const eventSlug =
    typeof body.eventSlug === "string" && body.eventSlug.trim().length > 0
      ? body.eventSlug.trim()
      : undefined;
  let title =
    typeof body.title === "string" && body.title.trim().length > 0
      ? body.title.trim()
      : undefined;

  if (eventSlug) {
    const { events } = await getContent();
    const event = events.find((e) => e.slug === eventSlug);
    if (!event) return bad("No encontramos esa corrida.");
    title = title ?? event.title;
  }

  if (!title) return bad("Elegí una corrida o escribí un título.");

  const existing = (await readJson<CheckinSession[]>(CHECKIN_SESSIONS_DOC)) ?? [];
  const taken = new Set(existing.map((x) => x.id));
  let id = makeId();
  for (let i = 0; i < 8 && taken.has(id); i++) id = makeId();
  if (taken.has(id)) return bad("No pudimos generar un código. Probá de nuevo.", 500);

  const now = Date.now();
  const session: CheckinSession = {
    id,
    ...(eventSlug ? { eventSlug } : {}),
    title,
    openedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + OPEN_HOURS * 3600_000).toISOString(),
    openedBy: s.username,
  };

  await appendJson<CheckinSession>(CHECKIN_SESSIONS_DOC, session);

  return NextResponse.json({ ok: true, session, url: checkinUrl(id) });
}

type PatchBody = { id?: unknown; action?: unknown };

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  if (body.action !== "close") return bad('Acción inválida (solo "close").');
  if (typeof body.id !== "string" || body.id.length === 0) return bad("Falta el código.");

  const sessions = (await readJson<CheckinSession[]>(CHECKIN_SESSIONS_DOC)) ?? [];
  const target = sessions.find((x) => x.id === body.id);
  if (!target) return bad("No encontramos ese check-in.", 404);

  target.expiresAt = new Date().toISOString();
  await writeJson(CHECKIN_SESSIONS_DOC, sessions);

  return NextResponse.json({ ok: true });
}
