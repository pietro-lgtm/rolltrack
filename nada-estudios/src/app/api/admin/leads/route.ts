import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readJson, writeJson, LEADS_DOC, type Lead } from "@/lib/store";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

const STATUSES: Lead["status"][] = ["nuevo", "contactado", "propuesta", "cerrado", "descartado"];

export async function GET() {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  const leads = (await readJson<Lead[]>(LEADS_DOC)) ?? [];
  const sorted = [...leads].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ ok: true, leads: sorted });
}

type PatchBody = { id?: unknown; status?: unknown; notes?: unknown };

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return bad("Falta el id del lead.");

  const leads = (await readJson<Lead[]>(LEADS_DOC)) ?? [];
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return bad("Ese lead no existe.", 404);

  if ("status" in body) {
    if (typeof body.status !== "string" || !STATUSES.includes(body.status as Lead["status"])) {
      return bad("Estado inválido.");
    }
    leads[idx].status = body.status as Lead["status"];
  }

  if ("notes" in body) {
    if (typeof body.notes !== "string") return bad("Notas inválidas.");
    leads[idx].notes = body.notes;
  }

  await writeJson(LEADS_DOC, leads);
  return NextResponse.json({ ok: true, lead: leads[idx] });
}
