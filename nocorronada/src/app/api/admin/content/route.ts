import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readJson, writeJson, OVERRIDES_DOC } from "@/lib/store";
import type { ContentOverrides } from "@/lib/content";
import type { ClubEvent } from "@/data/events";
import type { MediaItem } from "@/data/media";
import { site } from "@/config/site";
import { events as defaultEvents } from "@/data/events";
import { media as defaultMedia } from "@/data/media";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET() {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  const overrides = (await readJson<ContentOverrides>(OVERRIDES_DOC)) ?? {};
  return NextResponse.json({
    ok: true,
    overrides,
    defaults: { film: site.film, events: defaultEvents, media: defaultMedia },
  });
}

type PutBody = {
  film?: unknown;
  events?: unknown;
  media?: unknown;
};

function isStr(v: unknown): v is string {
  return typeof v === "string";
}

/** Validate a film override. Returns a clean object or an error string. */
function parseFilm(v: unknown): { film: ContentOverrides["film"] } | { error: string } {
  if (v === null || typeof v !== "object") {
    return { error: "El film debe tener title, subtitle y videoUrl." };
  }
  const f = v as Record<string, unknown>;
  if (!isStr(f.title) || !isStr(f.subtitle) || !isStr(f.videoUrl)) {
    return { error: "El film necesita title, subtitle y videoUrl como texto." };
  }
  return { film: { title: f.title, subtitle: f.subtitle, videoUrl: f.videoUrl } };
}

/** Validate an events override array. Returns a clean array or an error string. */
function parseEvents(v: unknown): { events: ClubEvent[] } | { error: string } {
  if (!Array.isArray(v)) return { error: "Los eventos deben ser una lista (JSON array)." };
  for (let i = 0; i < v.length; i++) {
    const e = v[i] as Record<string, unknown>;
    if (!e || typeof e !== "object") {
      return { error: `El evento #${i + 1} no es un objeto válido.` };
    }
    for (const key of ["slug", "title", "type", "zone", "status"] as const) {
      if (!isStr(e[key]) || (e[key] as string).length === 0) {
        return { error: `El evento #${i + 1} necesita "${key}" como texto.` };
      }
    }
  }
  return { events: v as ClubEvent[] };
}

/** Validate a media override array. Returns a clean array or an error string. */
function parseMedia(v: unknown): { media: MediaItem[] } | { error: string } {
  if (!Array.isArray(v)) return { error: "La media debe ser una lista." };
  for (let i = 0; i < v.length; i++) {
    const m = v[i] as Record<string, unknown>;
    if (!m || typeof m !== "object") {
      return { error: `El ítem #${i + 1} no es válido.` };
    }
    if (m.type !== "image" && m.type !== "video") {
      return { error: `El ítem #${i + 1} necesita type "image" o "video".` };
    }
    if (!isStr(m.src) || m.src.length === 0) {
      return { error: `El ítem #${i + 1} necesita un src.` };
    }
  }
  return { media: v as MediaItem[] };
}

export async function PUT(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: PutBody;
  try {
    body = (await req.json()) as PutBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  const overrides = (await readJson<ContentOverrides>(OVERRIDES_DOC)) ?? {};

  if ("film" in body) {
    if (body.film === null) {
      delete overrides.film;
    } else {
      const parsed = parseFilm(body.film);
      if ("error" in parsed) return bad(parsed.error);
      overrides.film = parsed.film;
    }
  }

  if ("events" in body) {
    if (body.events === null) {
      delete overrides.events;
    } else {
      const parsed = parseEvents(body.events);
      if ("error" in parsed) return bad(parsed.error);
      overrides.events = parsed.events;
    }
  }

  if ("media" in body) {
    if (body.media === null) {
      delete overrides.media;
    } else {
      const parsed = parseMedia(body.media);
      if ("error" in parsed) return bad(parsed.error);
      overrides.media = parsed.media;
    }
  }

  await writeJson(OVERRIDES_DOC, overrides);
  return NextResponse.json({ ok: true, overrides });
}
