import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 3_500_000; // ~3.5MB decoded — art is client-compressed JPEG

/**
 * Admin image upload. Body: {filename, dataUrl, folder?} where dataUrl is a
 * JPEG/PNG/WebP data URL (the admin UI resizes on a canvas before sending) and
 * folder is "events" (default) or "media".
 * Stores in the private Blob store under uploads/, returns the public proxy path.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  let body: { filename?: unknown; dataUrl?: unknown; folder?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const filename = typeof body.filename === "string" ? body.filename : "art";
  const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) {
    return Response.json(
      { ok: false, error: "Formato de imagen inválido (jpeg/png/webp)." },
      { status: 400 },
    );
  }

  const [, contentType, b64] = match;
  const buffer = Buffer.from(b64, "base64");
  if (buffer.length > MAX_BYTES) {
    return Response.json(
      { ok: false, error: "Imagen demasiado pesada (máx ~3.5MB)." },
      { status: 400 },
    );
  }

  const folder = body.folder === "media" ? "media" : "events";
  const safe = filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 60);
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const pathname = `uploads/${folder}/${Date.now()}-${safe.replace(/\.[a-z]+$/, "")}.${ext}`;

  await put(pathname, buffer, {
    access: "private" as never,
    contentType,
    addRandomSuffix: false,
  });

  return Response.json({ ok: true, path: `/api/img?p=${encodeURIComponent(pathname)}` });
}
