import { site } from "@/config/site";

// Route handler needs the Node.js runtime for outbound fetch to Google/Kit.
export const runtime = "nodejs";

type JoinBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  source?: unknown;
  website?: unknown;
};

type Fields = {
  name: string;
  email: string;
  phone: string;
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim()
      : "web";

  if (name.length < 2 || name.length > 80) {
    return Response.json(
      { ok: false, error: "Escribí tu nombre (entre 2 y 80 caracteres)." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json(
      { ok: false, error: "Revisá tu correo — no parece válido." },
      { status: 400 },
    );
  }

  // Strip spaces and dashes, then require 8–15 digits with an optional leading +.
  const phone = phoneRaw.replace(/[\s-]/g, "");
  if (!/^\+?\d{8,15}$/.test(phone)) {
    return Response.json(
      {
        ok: false,
        error: "Revisá tu teléfono — usá de 8 a 15 dígitos, con o sin +.",
      },
      { status: 400 },
    );
  }

  const fields: Fields = { name, email, phone, source };

  const [googleResult, kitResult] = await Promise.allSettled([
    submitGoogleForm(fields),
    submitKit(fields),
  ]);

  const delivered = {
    googleForm: googleResult.status === "fulfilled" && googleResult.value,
    kit: kitResult.status === "fulfilled" && kitResult.value,
  };

  return Response.json({
    ok: true,
    delivered,
    whatsappUrl: site.social.whatsapp,
    waiverUrl: site.join.waiverUrl,
    stravaUrl: site.social.strava,
  });
}

/** POST the signup to the Google Form. Returns whether it was delivered. */
async function submitGoogleForm(fields: Fields): Promise<boolean> {
  const id = site.join.googleFormId;
  if (!id || id.startsWith("REPLACE")) return false;

  try {
    const entries = site.join.googleFormEntries;
    const params = new URLSearchParams();
    params.set(entries.name, fields.name);
    params.set(entries.email, fields.email);
    params.set(entries.phone, fields.phone);
    params.set(entries.source, fields.source);

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
      console.error("[join] Google Form rejected the signup:", res.status);
    }
    return ok;
  } catch (err) {
    console.error("[join] Google Form submission failed:", err);
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
        email_address: fields.email,
        first_name: fields.name,
        fields: {
          phone_number: fields.phone,
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
          body: JSON.stringify({ email_address: fields.email }),
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

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "<no body>";
  }
}
