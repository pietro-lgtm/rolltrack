/**
 * Contact-info continuity across funnels: once someone fills their info in any
 * form (/empezar quiz, checkout, a vertical intake), we remember it locally so
 * the next form is prefilled — they never type it twice.
 * Client-side only; every function no-ops on the server.
 */

export type SavedContact = {
  name: string;
  company: string;
  email: string;
  phone: string;
};

const KEY = "nada_contact_v1";

export function loadSavedContact(): SavedContact | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Partial<SavedContact>;
    if (typeof c.name !== "string" || typeof c.email !== "string") return null;
    return {
      name: c.name,
      company: typeof c.company === "string" ? c.company : "",
      email: c.email,
      phone: typeof c.phone === "string" ? c.phone : "",
    };
  } catch {
    return null;
  }
}

export function saveContact(contact: SavedContact): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(contact));
  } catch {
    // storage blocked/full — continuity is best-effort
  }
}
