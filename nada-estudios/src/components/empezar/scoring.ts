/**
 * Lead scoring — single source of truth for the /empezar funnel.
 * Used client-side (instant result screen) and server-side in /api/leads
 * (recomputed there as the record of truth; never trust client-sent scores).
 */

export type Need = "retainer" | "campana" | "evento" | "fotos" | "no-se";
export type CompanySize = "solo" | "2-10" | "11-50" | "51-200" | "200+";
export type CurrentContent = "agencia" | "in-house" | "nadie";
export type Timeline = "ya" | "este-mes" | "trimestre" | "explorando";
export type Investment = "5k+" | "2.5-5k" | "1-2.5k" | "<1k" | "hablar";

export type Answers = {
  need: Need;
  industry: string;
  companySize: CompanySize;
  currentContent: CurrentContent;
  timeline: Timeline;
  investment: Investment;
};

export type Segment = "hot" | "warm" | "nurture" | "oneoff";

export const NEED_POINTS: Record<Need, number> = {
  retainer: 30,
  campana: 20,
  evento: 12,
  fotos: 10,
  "no-se": 8,
};

export const COMPANY_SIZE_POINTS: Record<CompanySize, number> = {
  solo: 0,
  "2-10": 8,
  "11-50": 16,
  "51-200": 24,
  "200+": 30,
};

export const CURRENT_CONTENT_POINTS: Record<CurrentContent, number> = {
  agencia: 15,
  "in-house": 10,
  nadie: 5,
};

export const TIMELINE_POINTS: Record<Timeline, number> = {
  ya: 15,
  "este-mes": 12,
  trimestre: 6,
  explorando: 2,
};

export const INVESTMENT_POINTS: Record<Investment, number> = {
  "5k+": 25,
  "2.5-5k": 20,
  "1-2.5k": 12,
  "<1k": 2,
  hablar: 15,
};

export function computeScore(a: Answers): number {
  return (
    NEED_POINTS[a.need] +
    COMPANY_SIZE_POINTS[a.companySize] +
    CURRENT_CONTENT_POINTS[a.currentContent] +
    TIMELINE_POINTS[a.timeline] +
    INVESTMENT_POINTS[a.investment]
  );
}

export function computeSegment(score: number, investment: Investment): Segment {
  if (score >= 80) return "hot";
  if (score >= 55) return "warm";
  if (investment === "<1k") return "oneoff";
  return "nurture";
}

export type Recommendation = {
  label: string; // e.g. "Paquete B" or "Servicios individuales"
  packageId: "a" | "b" | "c" | null;
  link: string; // where the CTA on the result screen should point (besides WhatsApp)
};

export function computeRecommendation(a: Answers): Recommendation {
  switch (a.investment) {
    case "5k+":
      return { label: "Paquete C", packageId: "c", link: "/servicios#paquete-c" };
    case "2.5-5k":
      return { label: "Paquete B", packageId: "b", link: "/servicios#paquete-b" };
    case "1-2.5k":
      return { label: "Paquete A", packageId: "a", link: "/servicios#paquete-a" };
    case "<1k":
      return { label: "Servicios individuales", packageId: null, link: "/servicios#addons" };
    case "hablar":
    default: {
      if (a.companySize === "51-200" || a.companySize === "200+") {
        return { label: "Paquete C", packageId: "c", link: "/servicios#paquete-c" };
      }
      if (a.companySize === "11-50") {
        return { label: "Paquete B", packageId: "b", link: "/servicios#paquete-b" };
      }
      return { label: "Paquete A", packageId: "a", link: "/servicios#paquete-a" };
    }
  }
}

export function qualify(a: Answers): {
  score: number;
  segment: Segment;
  recommendation: Recommendation;
} {
  const score = computeScore(a);
  const segment = computeSegment(score, a.investment);
  const recommendation = computeRecommendation(a);
  return { score, segment, recommendation };
}

// ---- Server-side validation --------------------------------------------

const NEED_VALUES = Object.keys(NEED_POINTS) as Need[];
const COMPANY_SIZE_VALUES = Object.keys(COMPANY_SIZE_POINTS) as CompanySize[];
const CURRENT_CONTENT_VALUES = Object.keys(CURRENT_CONTENT_POINTS) as CurrentContent[];
const TIMELINE_VALUES = Object.keys(TIMELINE_POINTS) as Timeline[];
const INVESTMENT_VALUES = Object.keys(INVESTMENT_POINTS) as Investment[];

/** Narrow unknown input into validated Answers, or return null if invalid. */
export function parseAnswers(input: unknown): Answers | null {
  if (!input || typeof input !== "object") return null;
  const a = input as Record<string, unknown>;
  if (typeof a.need !== "string" || !NEED_VALUES.includes(a.need as Need)) return null;
  if (typeof a.industry !== "string" || a.industry.trim().length === 0) return null;
  if (typeof a.companySize !== "string" || !COMPANY_SIZE_VALUES.includes(a.companySize as CompanySize)) return null;
  if (typeof a.currentContent !== "string" || !CURRENT_CONTENT_VALUES.includes(a.currentContent as CurrentContent)) return null;
  if (typeof a.timeline !== "string" || !TIMELINE_VALUES.includes(a.timeline as Timeline)) return null;
  if (typeof a.investment !== "string" || !INVESTMENT_VALUES.includes(a.investment as Investment)) return null;
  return {
    need: a.need as Need,
    industry: a.industry.trim().slice(0, 120),
    companySize: a.companySize as CompanySize,
    currentContent: a.currentContent as CurrentContent,
    timeline: a.timeline as Timeline,
    investment: a.investment as Investment,
  };
}

export type Contact = { name: string; company: string; email: string; phone: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseContact(input: unknown): Contact | null {
  if (!input || typeof input !== "object") return null;
  const c = input as Record<string, unknown>;
  const name = typeof c.name === "string" ? c.name.trim() : "";
  const company = typeof c.company === "string" ? c.company.trim() : "";
  const email = typeof c.email === "string" ? c.email.trim() : "";
  const phone = typeof c.phone === "string" ? c.phone.trim() : "";
  if (!name || name.length > 120) return null;
  if (!company || company.length > 120) return null;
  if (!email || email.length > 200 || !EMAIL_RE.test(email)) return null;
  if (!phone || phone.length > 40) return null;
  return { name, company, email, phone };
}
