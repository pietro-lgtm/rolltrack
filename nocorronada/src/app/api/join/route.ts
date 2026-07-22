import { site } from "@/config/site";
import { waiver } from "@/data/waiver";
import { appendJson, WAIVERS_DOC, type WaiverRecord } from "@/lib/store";

// Route handler needs the Node.js runtime for outbound fetch + Blob writes.
export const runtime = "nodejs";

type JoinBody = {
  nombre?: unknown;
  apellido?: unknown;
  edad?: unknown;
  cedula?: unknown;
  nivel?: unknown;
  meta5k?: unknown;
  correo?: unknown;
  telefono?: unknown;
  aceptaSalud?: unknown;
  aceptaAcuerdo?: unknown;
  source?: unknown;
  website?: unknown;
};

type Fields = {
  nombre: string;
  apellido: string;
  edad: number;
  cedula: string;
  nivel: string;
  meta5k: string;
  correo: string;
  telefono: string;
  source: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: JoinBody;
  try {
    body = (await req.json()) as JoinBody;
  } catch {
    return Response.json(
      { ok: false, error: "No pudimos leer tu solicitud. Intentá de nuevo." },
      { status: 400 },
    );
  }

  // Honeypot — a real user never fills this. Fake success, do no processing.
  const website = typeof body.website === "string" ? body.website.trim() : "";
  if (website) {
    return Response.json({ ok: true });
  }

  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const apellido = typeof body.apellido === "string" ? body.apellido.trim() : "";
  const edadRaw =
    typeof body.edad === "string" || typeof body.edad === "number"
      ? String(body.edad).trim()
      : "";
  const cedulaRaw = typeof body.cedula === "string" ? body.cedula.trim() : "";
  const nivel = typeof body.nivel === "string" ? body.nivel.trim() : "";
  const meta5k = typeof body.meta5k === "string" ? body.meta5k.trim() : "";
  const correo = typeof body.correo === "string" ? body.correo.trim() : "";
  const telefonoRaw =
    typeof body.telefono === "string" ? body.telefono.trim() : "";
  const aceptaSalud = body.aceptaSalud === true;
  const aceptaAcuerdo = body.aceptaAcuerdo === true;
  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim()
      : "web";

  if (nombre.length < 2 || nombre.length > 60) {
    return Response.json(
      { ok: false, error: "Escribí tu nombre (entre 2 y 60 caracteres)." },
      { status: 400 },
    );
  }

  if (apellido.length < 2 || apellido.length > 60) {
    return Response.json(
      { ok: false, error: "Escribí tu apellido (entre 2 y 60 caracteres)." },
      { status: 400 },
    );
  }

  const edad = Number(edadRaw);
  if (!Number.isInteger(edad) || edad < 10 || edad > 99) {
    return Response.json(
      { ok: false, error: "Revisá tu edad — tiene que estar entre 10 y 99." },
      { status: 400 },
    );
  }

  // Strip spaces and dashes, then require 8–12 digits.
  const cedula = cedulaRaw.replace(/[\s-]/g, "");
  if (!/^\d{8,12}$/.test(cedula)) {
    return Response.json(
      { ok: false, error: "Revisá tu cédula — usá de 8 a 12 dígitos." },
      { status: 400 },
    );
  }

  if (!site.join.nivelOptions.includes(nivel as never)) {
    return Response.json(
      { ok: false, error: "Elegí tu nivel de correr." },
      { status: 400 },
    );
  }

  if (meta5k.length < 1 || meta5k.length > 40) {
    return Response.json(
      { ok: false, error: "Contanos tu meta de 5K (máximo 40 caracteres)." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(correo) || correo.length > 254) {
    return Response.json(
      { ok: false, error: "Revisá tu correo — no parece válido." },
      { status: 400 },
    );
  }

  // Teléfono is optional. If present, strip spaces/dashes and require 8–15 digits.
  let telefono = "";
  if (telefonoRaw) {
    const stripped = telefonoRaw.replace(/[\s-]/g, "");
    if (!/^\+?\d{8,15}$/.test(stripped)) {
      return Response.json(
        {
          ok: false,
          error: "Revisá tu teléfono — usá de 8 a 15 dígitos, con o sin +.",
        },
        { status: 400 },
      );
    }
    telefono = stripped;
  }

  if (!aceptaSalud || !aceptaAcuerdo) {
    return Response.json(
      {
        ok: false,
        error: "Tenés que aceptar la exoneración para participar.",
      },
      { status: 400 },
    );
  }

  const fields: Fields = {
    nombre,
    apellido,
    edad,
    cedula,
    nivel,
    meta5k,
    correo,
    telefono,
    source,
  };

  const [googleResult, kitResult, waiverResult] = await Promise.allSettled([
    submitGoogleForm(fields),
    submitKit(fields),
    recordWaiver(fields),
  ]);

  const delivered = {
    googleForm: googleResult.status === "fulfilled" && googleResult.value,
    kit: kitResult.status === "fulfilled" && kitResult.value,
    waiver: waiverResult.status === "fulfilled" && waiverResult.value,
  };

  return Response.json({
    ok: true,
    delivered,
    whatsappUrl: site.social.whatsapp,
    stravaUrl: site.social.strava,
  });
}

/** POST the signup to the club's real Google Form. Returns whether it was delivered. */
async function submitGoogleForm(fields: Fields): Promise<boolean> {
  const id = site.join.googleFormId;
  if (!id || id.startsWith("REPLACE")) return false;

  const entries = site.join.googleFormEntries;
  const params = new URLSearchParams();
  params.set(entries.nombre, fields.nombre);
  params.set(entries.apellido, fields.apellido);
  params.set(entries.edad, String(fields.edad));
  params.set(entries.cedula, fields.cedula);
  params.set(entries.nivel, fields.nivel);
  params.set(entries.meta5k, fields.meta5k);
  params.set(entries.correo, fields.correo);
  if (fields.telefono) params.set(entries.telefono, fields.telefono);
  params.set(entries.aceptaSalud, "Sí");
  params.set(entries.aceptaAcuerdo, "Sí");

  try {
    const res = await fetch(
      `https://docs.google.com/forms/d/e/${id}/formResponse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      },
    );

    // Google Forms answers with a 2xx confirmation page (or a 3xx redirect).
    const ok = res.status >= 200 && res.status < 400;
    if (!ok) {
      console.error(
        "[join] Google Form rejected the signup:",
        res.status,
        JSON.stringify(fields),
      );
    }
    return ok;
  } catch (err) {
    console.error(
      "[join] Google Form submission failed:",
      err,
      JSON.stringify(fields),
    );
    return false;
  }
}

/** Upsert the subscriber into Kit and (optionally) trigger form double opt-in. */
async function submitKit(fields: Fields): Promise<boolean> {
  const key = process.env.KIT_API_KEY;
  if (!key) return false;

  try {
    const res = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": key,
      },
      body: JSON.stringify({
        email_address: fields.correo,
        first_name: fields.nombre,
        fields: {
          phone_number: fields.telefono ?? "",
          nivel: fields.nivel,
          source: fields.source,
        },
      }),
    });

    if (res.status < 200 || res.status >= 300) {
      console.error(
        "[join] Kit subscriber upsert failed:",
        res.status,
        await safeText(res),
      );
      return false;
    }

    // Optional: subscribing to a form triggers Kit's double opt-in email.
    const formId = site.join.kitFormId;
    if (formId) {
      const formRes = await fetch(
        `https://api.kit.com/v4/forms/${formId}/subscribers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Kit-Api-Key": key,
          },
          body: JSON.stringify({ email_address: fields.correo }),
        },
      );
      if (formRes.status < 200 || formRes.status >= 300) {
        // The subscriber already exists in Kit; still count as delivered.
        console.error(
          "[join] Kit form opt-in failed:",
          formRes.status,
          await safeText(formRes),
        );
      }
    }

    return true;
  } catch (err) {
    console.error("[join] Kit submission failed:", err);
    return false;
  }
}

/** Persist the signed waiver acceptance to Blob. Returns whether it was recorded. */
async function recordWaiver(fields: Fields): Promise<boolean> {
  try {
    const record: WaiverRecord = {
      nombre: fields.nombre,
      apellido: fields.apellido,
      cedula: fields.cedula,
      correo: fields.correo,
      acceptedAt: new Date().toISOString(),
      waiverVersion: waiver.version,
    };
    await appendJson(WAIVERS_DOC, record);
    return true;
  } catch (err) {
    console.error("[join] Waiver record failed:", err);
    return false;
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "<no body>";
  }
}
