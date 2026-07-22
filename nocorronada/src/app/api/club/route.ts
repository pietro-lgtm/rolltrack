import { site } from "@/config/site";
import { appendJson, CLUB_APPS_DOC, type ClubApplication } from "@/lib/store";

// Route handler needs the Node.js runtime for Blob writes + outbound fetch.
export const runtime = "nodejs";

type ClubBody = {
  nombre?: unknown;
  apellido?: unknown;
  telefono?: unknown;
  correo?: unknown;
  ciudad?: unknown;
  pais?: unknown;
  confirma10?: unknown;
  confirma2x?: unknown;
  website?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(req: Request) {
  let body: ClubBody;
  try {
    body = (await req.json()) as ClubBody;
  } catch {
    return Response.json(
      { ok: false, error: "No pudimos leer tu solicitud. Intentá de nuevo." },
      { status: 400 },
    );
  }

  // Honeypot — a real user never fills this. Fake success, do no processing.
  if (str(body.website)) {
    return Response.json({ ok: true });
  }

  const nombre = str(body.nombre);
  const apellido = str(body.apellido);
  const correo = str(body.correo);
  const ciudad = str(body.ciudad);
  const pais = str(body.pais);
  const telefonoRaw = str(body.telefono);
  const confirma10 = body.confirma10 === true;
  const confirma2x = body.confirma2x === true;

  if (nombre.length < 2 || nombre.length > 80) {
    return Response.json(
      { ok: false, error: "Escribí tu nombre (entre 2 y 80 caracteres)." },
      { status: 400 },
    );
  }
  if (apellido.length < 2 || apellido.length > 80) {
    return Response.json(
      { ok: false, error: "Escribí tu apellido (entre 2 y 80 caracteres)." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(correo) || correo.length > 254) {
    return Response.json(
      { ok: false, error: "Revisá tu correo — no parece válido." },
      { status: 400 },
    );
  }

  // Strip spaces and dashes, then require 8–15 digits with an optional leading +.
  const telefono = telefonoRaw.replace(/[\s-]/g, "");
  if (!/^\+?\d{8,15}$/.test(telefono)) {
    return Response.json(
      {
        ok: false,
        error: "Revisá tu teléfono — usá de 8 a 15 dígitos, con o sin +.",
      },
      { status: 400 },
    );
  }

  if (!ciudad || ciudad.length > 80) {
    return Response.json(
      { ok: false, error: "Decinos de qué ciudad sos." },
      { status: 400 },
    );
  }
  if (!pais || pais.length > 80) {
    return Response.json(
      { ok: false, error: "Decinos de qué país sos." },
      { status: 400 },
    );
  }

  if (!confirma10 || !confirma2x) {
    return Response.json(
      {
        ok: false,
        error:
          "Marcá las dos casillas: al menos 10 personas y al menos 2 corridas al mes.",
      },
      { status: 400 },
    );
  }

  const record: ClubApplication = {
    nombre,
    apellido,
    telefono,
    correo,
    ciudad,
    pais,
    confirma10,
    confirma2x,
    submittedAt: new Date().toISOString(),
  };

  try {
    await appendJson(CLUB_APPS_DOC, record);
  } catch (err) {
    console.error("[club] failed to persist application:", err);
    return Response.json(
      {
        ok: false,
        error: "No pudimos guardar tu solicitud. Intentá de nuevo en un momento.",
      },
      { status: 500 },
    );
  }

  // Optionally mirror into a Google Form (Drive backup). Skipped while unset.
  await forwardToGoogleForm(record);

  return Response.json({ ok: true });
}

/** Mirror the application into the optional club Google Form. No-ops when unset. */
async function forwardToGoogleForm(record: ClubApplication): Promise<void> {
  const club = site.club as {
    googleFormId: string;
    googleFormEntries: Record<string, string>;
  };
  const id = club.googleFormId;
  if (!id) return;

  try {
    const e = club.googleFormEntries;
    const params = new URLSearchParams();
    if (e.nombre) params.set(e.nombre, record.nombre);
    if (e.apellido) params.set(e.apellido, record.apellido);
    if (e.telefono) params.set(e.telefono, record.telefono);
    if (e.correo) params.set(e.correo, record.correo);
    if (e.ciudad) params.set(e.ciudad, record.ciudad);
    if (e.pais) params.set(e.pais, record.pais);
    if (e.confirma10) params.set(e.confirma10, "Sí");
    if (e.confirma2x) params.set(e.confirma2x, "Sí");

    const res = await fetch(
      `https://docs.google.com/forms/d/e/${id}/formResponse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      },
    );
    if (res.status < 200 || res.status >= 400) {
      console.error("[club] Google Form rejected the application:", res.status);
    }
  } catch (err) {
    console.error("[club] Google Form submission failed:", err);
  }
}
