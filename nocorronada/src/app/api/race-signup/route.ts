import { randomBytes } from "node:crypto";
import { site } from "@/config/site";
import { PACE_RE, spreadSeconds } from "@/lib/pace";
import {
  appendJson,
  RACE_TEAMS_DOC,
  type RaceTeam,
  type RaceTeamMember,
} from "@/lib/store";

// Route handler needs the Node.js runtime for crypto + outbound fetch + Blob writes.
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no ambiguous chars

type RawMember = {
  nombre?: unknown;
  correo?: unknown;
  cedula?: unknown;
  pace?: unknown;
};

type Body = {
  teamName?: unknown;
  members?: unknown;
  website?: unknown;
};

function runnerLabel(index: number): string {
  return `corredor ${index + 1}`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json(
      { ok: false, error: "No pudimos leer tu inscripción. Intentá de nuevo." },
      { status: 400 },
    );
  }

  // Honeypot — a real user never fills this. Fake success, do no processing.
  const website = typeof body.website === "string" ? body.website.trim() : "";
  if (website) {
    return Response.json({ ok: true });
  }

  const teamName = typeof body.teamName === "string" ? body.teamName.trim() : "";
  if (teamName.length < 2 || teamName.length > 60) {
    return Response.json(
      {
        ok: false,
        error: "Escribí el nombre del equipo (entre 2 y 60 caracteres).",
      },
      { status: 400 },
    );
  }

  const rawMembers = Array.isArray(body.members) ? (body.members as RawMember[]) : [];
  if (rawMembers.length !== site.race.teamSize) {
    return Response.json(
      {
        ok: false,
        error: `El equipo necesita exactamente ${site.race.teamSize} corredores — ni uno más, ni uno menos.`,
      },
      { status: 400 },
    );
  }

  const members: RaceTeamMember[] = [];

  for (let i = 0; i < rawMembers.length; i++) {
    const raw = rawMembers[i];

    const nombre = typeof raw.nombre === "string" ? raw.nombre.trim() : "";
    if (nombre.length < 2 || nombre.length > 60) {
      return Response.json(
        {
          ok: false,
          error: `Revisá el nombre del ${runnerLabel(i)} — entre 2 y 60 caracteres.`,
        },
        { status: 400 },
      );
    }

    const correo = (typeof raw.correo === "string" ? raw.correo : "").trim().toLowerCase();
    if (!EMAIL_RE.test(correo) || correo.length > 254) {
      return Response.json(
        {
          ok: false,
          error: `Revisá el correo del ${runnerLabel(i)} — no parece válido.`,
        },
        { status: 400 },
      );
    }

    const cedulaRaw = typeof raw.cedula === "string" ? raw.cedula : "";
    const cedula = cedulaRaw.replace(/[\s-]/g, "");
    if (!/^\d{8,12}$/.test(cedula)) {
      return Response.json(
        {
          ok: false,
          error: `Revisá la cédula del ${runnerLabel(i)} — usá de 8 a 12 dígitos.`,
        },
        { status: 400 },
      );
    }

    const pace = typeof raw.pace === "string" ? raw.pace.trim() : "";
    if (!PACE_RE.test(pace)) {
      return Response.json(
        {
          ok: false,
          error: `Revisá el ritmo del ${runnerLabel(i)} — usá formato 6:30.`,
        },
        { status: 400 },
      );
    }

    members.push({ nombre, correo, cedula, pace });
  }

  const seenEmails = new Set<string>();
  for (const m of members) {
    if (seenEmails.has(m.correo)) {
      return Response.json(
        {
          ok: false,
          error:
            "Hay correos repetidos en el equipo — necesitamos 6 personas distintas.",
        },
        { status: 400 },
      );
    }
    seenEmails.add(m.correo);
  }

  const team: RaceTeam = {
    id: generateTeamId(),
    teamName,
    captainEmail: members[0].correo,
    members,
    paceSpreadSeconds: spreadSeconds(members.map((m) => m.pace)),
    submittedAt: new Date().toISOString(),
    status: "pending",
  };

  await appendJson(RACE_TEAMS_DOC, team);

  await submitGoogleForm(team);

  return Response.json({
    ok: true,
    teamId: team.id,
    paceSpreadSeconds: team.paceSpreadSeconds,
  });
}

function generateTeamId(): string {
  const bytes = randomBytes(6);
  let id = "";
  for (const byte of bytes) {
    id += ID_ALPHABET[byte % ID_ALPHABET.length];
  }
  return id;
}

/** Best-effort mirror into the Google Form. Never fails the request. */
async function submitGoogleForm(team: RaceTeam): Promise<void> {
  const id = site.race.googleFormId;
  if (!id) return;

  const entries = site.race.googleFormEntries;
  const params = new URLSearchParams();

  if (entries.teamName) params.set(entries.teamName, team.teamName);

  for (let i = 0; i < team.members.length; i++) {
    const m = team.members[i];
    const nombreEntry = entries.nombre[i];
    const correoEntry = entries.correo[i];
    const cedulaEntry = entries.cedula[i];
    const paceEntry = entries.pace[i];

    if (nombreEntry) params.set(nombreEntry, m.nombre);
    if (correoEntry) params.set(correoEntry, m.correo);
    if (cedulaEntry) params.set(cedulaEntry, m.cedula);
    if (paceEntry) params.set(paceEntry, m.pace);
  }

  try {
    const res = await fetch(
      `https://docs.google.com/forms/d/e/${id}/formResponse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      },
    );

    const ok = res.status >= 200 && res.status < 400;
    if (!ok) {
      console.error(
        "[race-signup] Google Form rejected the signup:",
        team.id,
        res.status,
      );
    }
  } catch (err) {
    console.error("[race-signup] Google Form submission failed:", team.id, err);
  }
}
