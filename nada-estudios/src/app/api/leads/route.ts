import { NextResponse } from "next/server";
import { appendJson, LEADS_DOC, type Lead } from "@/lib/store";
import { parseAnswers, parseContact, qualify } from "@/components/empezar/scoring";

/**
 * Lead intake for /empezar. Server recomputes score/segment/recommendation —
 * never trusts client-sent values. Dev fallback (no BLOB_READ_WRITE_TOKEN)
 * logs the payload and returns { ok: true, dev: true } so the funnel is
 * testable locally without Blob.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const payload = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const answers = parseAnswers(payload.answers);
  const contact = parseContact(payload.contact);
  const source =
    typeof payload.source === "string" && payload.source.trim()
      ? payload.source.trim().slice(0, 80)
      : null;

  if (!answers || !contact) {
    return NextResponse.json({ ok: false, error: "invalid-input" }, { status: 400 });
  }

  const { score, segment, recommendation } = qualify(answers);

  const lead: Lead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source,
    answers,
    contact,
    score,
    segment,
    recommendation: recommendation.label,
    status: "nuevo",
  };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("[dev] /api/leads lead captured:", JSON.stringify(lead, null, 2));
    return NextResponse.json({ ok: true, dev: true });
  }

  await appendJson<Lead>(LEADS_DOC, lead);
  return NextResponse.json({ ok: true });
}
