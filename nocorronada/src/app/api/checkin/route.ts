import {
  readJson,
  writeJson,
  appendJson,
  MEMBERS_DOC,
  CHECKIN_SESSIONS_DOC,
  CHECKINS_DOC,
  type Member,
  type CheckinSession,
  type Checkin,
} from "@/lib/store";

// Blob reads/writes need the Node.js runtime.
export const runtime = "nodejs";

type Body = {
  code?: unknown;
  nombre?: unknown;
  correo?: unknown;
  telefono?: unknown;
  website?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string, status: number) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("No pudimos leer tu check-in. Intentá de nuevo.", 400);
  }

  // Honeypot — a real runner never fills this. Fake success, record nothing.
  const website = typeof body.website === "string" ? body.website.trim() : "";
  if (website) {
    return Response.json({
      ok: true,
      firstTime: false,
      personalTotal: 1,
      sessionCount: 1,
    });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const correoRaw = typeof body.correo === "string" ? body.correo.trim() : "";
  const telefonoRaw =
    typeof body.telefono === "string" ? body.telefono.trim() : "";

  if (!code) return bad("Código inválido.", 404);

  if (nombre.length < 2 || nombre.length > 60) {
    return bad("Escribí tu nombre (entre 2 y 60 caracteres).", 400);
  }

  const correo = correoRaw.toLowerCase();
  if (!EMAIL_RE.test(correo) || correo.length > 254) {
    return bad("Revisá tu correo — no parece válido.", 400);
  }

  // Teléfono is optional. If present: strip spaces/dashes, 8–15 digits.
  let telefono = "";
  if (telefonoRaw) {
    const stripped = telefonoRaw.replace(/[\s-]/g, "");
    if (!/^\+?\d{8,15}$/.test(stripped)) {
      return bad("Revisá tu teléfono — usá de 8 a 15 dígitos, con o sin +.", 400);
    }
    telefono = stripped;
  }

  try {
    // 1. The session has to exist and still be open.
    const sessions =
      (await readJson<CheckinSession[]>(CHECKIN_SESSIONS_DOC)) ?? [];
    const session = sessions.find(
      (s) => s.id.toLowerCase() === code.toLowerCase(),
    );
    if (!session) return bad("Código inválido.", 404);

    const expiresAt = new Date(session.expiresAt).getTime();
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      return bad("El check-in de hoy ya cerró.", 403);
    }

    // 2. Idempotency — people double-tap the button and rescan the QR.
    const existing = (await readJson<Checkin[]>(CHECKINS_DOC)) ?? [];
    const alreadyIn = existing.some(
      (c) => c.sessionId === session.id && c.email.toLowerCase() === correo,
    );

    if (alreadyIn) {
      const members = (await readJson<Member[]>(MEMBERS_DOC)) ?? [];
      const me = members.find((m) => m.email.toLowerCase() === correo);
      const personalTotal =
        me?.checkins ??
        existing.filter((c) => c.email.toLowerCase() === correo).length;
      const sessionCount = existing.filter(
        (c) => c.sessionId === session.id,
      ).length;
      return Response.json({
        ok: true,
        already: true,
        firstTime: false,
        personalTotal,
        sessionCount,
      });
    }

    // 3. Upsert the member, then append the check-in — strictly sequential so
    //    the read-modify-write window on Blob stays as small as possible.
    const now = new Date().toISOString();
    const members = (await readJson<Member[]>(MEMBERS_DOC)) ?? [];
    const idx = members.findIndex((m) => m.email.toLowerCase() === correo);
    const firstTime = idx === -1;

    let member: Member;
    if (firstTime) {
      member = {
        email: correo,
        nombre,
        ...(telefono ? { telefono } : {}),
        firstSeenAt: now,
        checkins: 1,
        lastCheckinAt: now,
      };
      members.push(member);
    } else {
      const prev = members[idx];
      member = {
        ...prev,
        email: correo,
        nombre: nombre || prev.nombre,
        ...(telefono ? { telefono } : {}),
        checkins: (typeof prev.checkins === "number" ? prev.checkins : 0) + 1,
        lastCheckinAt: now,
      };
      members[idx] = member;
    }
    await writeJson(MEMBERS_DOC, members);

    const record: Checkin = {
      sessionId: session.id,
      email: correo,
      nombre: member.nombre,
      at: now,
      firstTime,
    };
    // appendJson re-reads the doc, so concurrent check-ins land on fresh data.
    const allCheckins = await appendJson(CHECKINS_DOC, record);
    const sessionCount = allCheckins.filter(
      (c) => c.sessionId === session.id,
    ).length;

    return Response.json({
      ok: true,
      firstTime,
      personalTotal: member.checkins,
      sessionCount,
    });
  } catch (err) {
    console.error("[checkin] failed:", err);
    return bad(
      "No pudimos guardar tu check-in. Intentá de nuevo en un momento.",
      500,
    );
  }
}
