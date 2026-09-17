import { get } from "@vercel/blob";

export const runtime = "nodejs";

/**
 * Serves admin-uploaded images from the private Blob store.
 * Only paths under uploads/ are reachable — data documents stay private.
 * Responses are immutable (filenames are timestamped) and CDN-cached.
 */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams.get("p") ?? "";
  if (!p.startsWith("uploads/") || p.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const res = await get(p, { access: "private" });
  if (!res || res.statusCode !== 200 || !res.stream) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(res.stream, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
