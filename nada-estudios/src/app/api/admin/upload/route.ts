import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 4_000_000; // ~4MB decoded — images are client-resized JPEG before upload

/**
 * Admin image upload. Body: {filename, dataUrl, folder?} where dataUrl is a
 * JPEG/PNG/WebP data URL (the admin UI resizes on a canvas before sending) and
 * folder groups uploads (e.g. "portfolio", "team"). Stores in the private
 * Blob store under uploads/, returns the public proxy path (/api/img?p=...).
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

  const filename = typeof body.filename === "string" ? body.filename : "img";
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
      { ok: false, error: "Imagen demasiado pesada (máx ~4MB)." },
      { status: 400 },
    );
  }

  const folderRaw = typeof body.folder === "string" ? body.folder : "misc";
  const folder = /^[a-z0-9-]{1,32}$/.test(folderRaw) ? folderRaw : "misc";
  const safe = filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 60);
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const pathname = `uploads/${folder}/${Date.now()}-${safe.replace(/\.[a-z]+$/, "")}.${ext}`;

  const blob = await put(pathname, buffer, {
    access: "private" as never,
    contentType,
    addRandomSuffix: true,
  });

  return Response.json({ ok: true, path: `/api/img?p=${encodeURIComponent(blob.pathname)}` });
}
