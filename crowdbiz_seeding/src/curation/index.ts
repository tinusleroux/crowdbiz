export type DropReason =
  | "association"
  | "on_field"
  | "off_org"
  | "not_a_title"
  | "pii_guard"
  | "other";

export type CurateResult =
  | { keep: true }
  | { keep: false; dropReason: DropReason };

const CREDENTIALS = new Set(
  [
    "mba",
    "cpa",
    "jd",
    "cfa",
    "esq",
    "phd",
    "md",
    "cma",
    "cia",
    "pmp",
    "cfp",
  ].map((s) => s.toLowerCase()),
);

const GENERATIONAL = new Set(
  ["jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v"].map((s) => s.toLowerCase()),
);

export function stripCredentialsFromName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const parts = `${firstName ?? ""} ${lastName ?? ""}`
    .split(/[\s,]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => {
      const n = p.replace(/\./g, "").toLowerCase();
      if (GENERATIONAL.has(p.toLowerCase()) || GENERATIONAL.has(n)) return true;
      return !CREDENTIALS.has(n);
    });
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function formatStartDate(
  year: number | null | undefined,
  month: number | null | undefined,
): string | null {
  if (!year) return null;
  if (month && month >= 1 && month <= 12) {
    return `${year}-${String(month).padStart(2, "0")}`;
  }
  return String(year);
}

function n(s: string): string {
  return s.toLowerCase().replace(/[_/&,+]+/g, " ").replace(/\s+/g, " ").trim();
}

function isGreyKeep(title: string): boolean {
  const t = n(title);
  if (/player'?s? engagement/.test(t)) return true;
  if (/alumni relations/.test(t)) return true;
  if (/community/.test(t) && /football|player|alumni/.test(t)) return true;
  if (/football outreach/.test(t)) return true;
  return false;
}

function isAssociation(title: string): boolean {
  const t = n(title);
  if (/alumni relations/.test(t)) return false;
  if (
    /share\s*holder/.test(t) ||
    /stock\s*holder/.test(t) ||
    /shareholder/.test(t) ||
    /stockholder/.test(t)
  ) {
    return true;
  }
  if (/season\s*ticket/.test(t)) return true;
  if (/honorary/.test(t) && /owner/.test(t)) return true;
  if (/minority/.test(t) && /own?e?ner/.test(t)) return true;
  if (/^owner$/.test(t) || /^packers owner$/.test(t)) return true;
  if (/\balumni\b/.test(t) && !/relations/.test(t) && !/director/.test(t)) {
    return true;
  }
  if (/volunteer/.test(t) && !/coordinator|manager|director/.test(t)) {
    return true;
  }
  return false;
}

function isOnField(title: string): boolean {
  const t = n(title);
  if (isGreyKeep(title)) return false;
  if (/executive coach|leadership (coach|consultant)/.test(t)) return false;
  if (/\bscout/.test(t) || /scouting/.test(t)) return true;
  if (/\bcoach(?:es|ing)?\b/.test(t)) return true;
  if (/player personnel|pro personnel|pro scouting/.test(t)) return true;
  if (/\bequipment\b/.test(t)) return true;
  if (/athletic trainer|team physician|\bphysician\b/.test(t)) return true;
  if (/performance nutrition|performance psychology/.test(t)) return true;
  if (/football operations/.test(t)) return true;
  if (/football administration|football logistics/.test(t)) return true;
  return false;
}

function isNotATitle(title: string, company: string | null, orgName: string): boolean {
  const t = n(title);
  if (!t) return true;
  if (/^student$/.test(t) || /^intern(ship)?$/.test(t)) return true;
  if (/not specified|n\/a|none|unknown/.test(t)) return true;
  if (/\buniversity\b/.test(t) && !/relations|affairs/.test(t) && t.split(" ").length <= 4) {
    return true;
  }
  const org = n(orgName);
  const co = n(company ?? "");
  if (org && t === org) return true;
  if (co && t === co) return true;
  return false;
}

export function curateTitle(
  rawTitle: string | null | undefined,
  company: string | null | undefined,
  orgName: string,
): CurateResult {
  const title = (rawTitle ?? "").trim();
  if (isAssociation(title)) return { keep: false, dropReason: "association" };
  if (isOnField(title)) return { keep: false, dropReason: "on_field" };
  if (isNotATitle(title, company ?? null, orgName)) {
    return { keep: false, dropReason: title ? "not_a_title" : "not_a_title" };
  }
  return { keep: true };
}
