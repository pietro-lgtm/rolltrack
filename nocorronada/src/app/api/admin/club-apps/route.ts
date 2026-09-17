import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readJson, CLUB_APPS_DOC, type ClubApplication } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const apps = (await readJson<ClubApplication[]>(CLUB_APPS_DOC)) ?? [];
  const sorted = [...apps].sort(
    (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
  );

  return NextResponse.json({ ok: true, apps: sorted });
}
