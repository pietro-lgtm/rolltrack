import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  readJson,
  CHECKINS_DOC,
  CHECKIN_SESSIONS_DOC,
  MEMBERS_DOC,
  type Checkin,
  type CheckinSession,
  type Member,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const [sessionsRaw, checkins, membersRaw] = await Promise.all([
    readJson<CheckinSession[]>(CHECKIN_SESSIONS_DOC),
    readJson<Checkin[]>(CHECKINS_DOC),
    readJson<Member[]>(MEMBERS_DOC),
  ]);

  const sessions = [...(sessionsRaw ?? [])].sort(
    (a, b) => +new Date(b.openedAt) - +new Date(a.openedAt),
  );

  const counts: Record<string, number> = {};
  for (const c of checkins ?? []) {
    counts[c.sessionId] = (counts[c.sessionId] ?? 0) + 1;
  }

  const members = [...(membersRaw ?? [])].sort(
    (a, b) => (b.checkins ?? 0) - (a.checkins ?? 0) || a.nombre.localeCompare(b.nombre, "es"),
  );

  return NextResponse.json({
    ok: true,
    sessions,
    counts,
    members,
    totalCheckins: (checkins ?? []).length,
  });
}
