import type { SiteContent } from "@/lib/content";

/** Fetch the merged site content (Blob overrides over code defaults). */
export async function fetchContent(): Promise<SiteContent> {
  const res = await fetch("/api/admin/content");
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(typeof json?.error === "string" ? json.error : "No pudimos cargar el contenido.");
  }
  return json.content as SiteContent;
}

/**
 * Save a single content slice. Re-fetches the latest content first (so a save
 * from one tab doesn't clobber edits made in another tab), swaps in the given
 * slice, then PUTs the full SiteContent document — saveContent() overwrites
 * the whole doc, so the payload must always be complete.
 */
export async function saveContentSlice<K extends keyof SiteContent>(
  key: K,
  value: SiteContent[K],
): Promise<SiteContent> {
  const current = await fetchContent();
  const next: SiteContent = { ...current, [key]: value };
  const res = await fetch("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(typeof json?.error === "string" ? json.error : "No se pudo guardar.");
  }
  return json.content as SiteContent;
}
