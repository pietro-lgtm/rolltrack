import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readJson, WAIVERS_DOC, type WaiverRecord } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const waivers = (await readJson<WaiverRecord[]>(WAIVERS_DOC)) ?? [];
  const sorted = [...waivers].sort(
    (a, b) => +new Date(b.acceptedAt) - +new Date(a.acceptedAt),
  );

  return NextResponse.json({ ok: true, waivers: sorted });
}
