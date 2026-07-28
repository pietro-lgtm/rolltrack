import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getContent, saveContent, type SiteContent } from "@/lib/content";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET() {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  const content = await getContent();
  return NextResponse.json({ ok: true, content });
}

export async function PUT(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  if (!body || typeof body !== "object") return bad("Cuerpo inválido.");
  const b = body as Partial<SiteContent>;

  if (
    !Array.isArray(b.portfolio) ||
    !Array.isArray(b.team) ||
    !Array.isArray(b.landings) ||
    !b.onboarding ||
    typeof b.onboarding !== "object" ||
    typeof (b.onboarding as { intro?: unknown }).intro !== "string" ||
    !Array.isArray((b.onboarding as { steps?: unknown }).steps)
  ) {
    return bad("El contenido debe incluir portfolio, team, landings y onboarding completos.");
  }

  const content = b as SiteContent;
  await saveContent(content);
  // Content-driven public pages are prerendered — refresh them immediately.
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, content });
}
