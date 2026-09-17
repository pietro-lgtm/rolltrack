import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readJson, writeJson, RACE_TEAMS_DOC, type RaceTeam } from "@/lib/store";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET() {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  const teams = (await readJson<RaceTeam[]>(RACE_TEAMS_DOC)) ?? [];
  const sorted = [...teams].sort(
    (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
  );

  const totals = {
    teams: sorted.length,
    runners: sorted.reduce((n, t) => n + t.members.length, 0),
    invited: sorted.filter((t) => t.status === "invited").length,
  };

  return NextResponse.json({ ok: true, teams: sorted, totals });
}

type PatchBody = { id?: unknown; status?: unknown };

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  if (typeof body.id !== "string" || body.id.length === 0) {
    return bad("Falta el id del equipo.");
  }
  if (body.status !== "invited" && body.status !== "pending") {
    return bad('Estado inválido (solo "invited" o "pending").');
  }

  const teams = (await readJson<RaceTeam[]>(RACE_TEAMS_DOC)) ?? [];
  const target = teams.find((t) => t.id === body.id);
  if (!target) return bad("No encontramos ese equipo.", 404);

  target.status = body.status;
  await writeJson(RACE_TEAMS_DOC, teams);

  return NextResponse.json({ ok: true });
}
