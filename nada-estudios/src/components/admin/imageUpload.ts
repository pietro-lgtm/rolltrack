/** Client-side helpers for the admin image-upload flow (canvas resize → /api/admin/upload). */

/** Resize an image file on a canvas (max 1600px long edge) and return a JPEG data URL. */
export async function fileToDataUrl(file: File, maxEdge = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

/** Resize + upload a file, returning the /api/img?p=... proxy path. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, dataUrl, folder }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(typeof json?.error === "string" ? json.error : "No se pudo subir la imagen.");
  }
  return json.path as string;
}
