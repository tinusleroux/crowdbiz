export type DropReason =
  | "association"
  | "on_field"
  | "broadcast"
  | "off_org"
  | "not_a_title"
  | "pii_guard"
  | "other";

export type AffiliationType = "employed" | "board" | "ownership";

export type CurateResult =
  | { keep: true; affiliationType: AffiliationType }
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
  if (/\balumni\b/.test(t) && !/relations/.test(t) && !/director/.test(t)) {
    return true;
  }
  if (/volunteer/.test(t) && !/coordinator|manager|director/.test(t)) {
    return true;
  }
  return false;
}

/** A seat on the board is a real affiliation, not a job and not a fan badge. */
function isBoard(title: string): boolean {
  const t = n(title);
  if (/\bboard (member|of directors|seat)\b/.test(t)) return true;
  if (/\bexecutive committee\b/.test(t)) return true;
  if (/\bchair(man|woman|person)?\b/.test(t) && !/chairside/.test(t)) return true;
  if (/\btrustee\b/.test(t)) return true;
  if (/\bgovernor\b/.test(t)) return true;
  return false;
}

function isOwnership(title: string): boolean {
  const t = n(title);
  if (/\bowner\b|\bco\s*owner\b|\bpart\s*owner\b|\bowner\s*operator\b/.test(t)) {
    return true;
  }
  if (/\bownership group\b/.test(t)) return true;
  if (/\binvestor\b/.test(t)) return true;
  if (/\bfounding (investor|partner|owner)\b/.test(t)) return true;
  if (/propriet[aá]ri/.test(t)) return true;
  return false;
}

/**
 * Competitive-sport work is out of this product. Drop it at curation so it
 * never becomes a claim. Crowd-business titles that merely mention the sport
 * (communications, community, youth outreach) stay — see isGreyKeep.
 */
function isOnField(title: string): boolean {
  const t = n(title);
  if (isGreyKeep(title)) return false;
  if (/executive coach|leadership (coach|consultant)/.test(t)) return false;
  if (/\b(communications?|community|outreach|foundation|alumni relations|ticketing|partnership)\b/.test(t)) {
    return false;
  }

  if (/\bcheerlead/.test(t) || /\bhype team\b/.test(t)) return true;
  if (/\bathlete\b|\b(nba|nfl|nhl|mlb) (player|forward|defenseman|goaltender)\b/.test(t)) {
    return true;
  }
  if (/professional (athlete|baseball player|football player|hockey player|basketball player)/.test(t)) {
    return true;
  }
  if (/\b(football|baseball|hockey|basketball) player\b/.test(t)) return true;
  if (/\bgoaltend|\bgoalie\b/.test(t)) return true;

  if (/\bassistant general manager\b/.test(t)) return true;
  if (/^general manager$/.test(t) || /\bgeneral manager\b/.test(t)) return true;
  if (/assistant to the general manager/.test(t)) return true;

  if (/\bscout/.test(t) || /scouting/.test(t)) return true;
  if (/\bcoach(?:es|ing)?\b/.test(t)) return true;
  if (/player personnel|pro personnel|pro scouting|player development/.test(t)) {
    return true;
  }
  if (/\bequipment\b/.test(t)) return true;
  if (
    /athletic trainer|team physician|\bphysician\b|physical therapist|chiropractor|sports medicine|sports psychologist/
      .test(t)
  ) {
    return true;
  }
  if (/performance nutrition|performance psychology|player health|player performance/.test(t)) {
    return true;
  }
  if (
    /(football|baseball|basketball|hockey) (operations|administration|logistics|strategy|research|sciences?|systems|analyst)/
      .test(t)
  ) {
    return true;
  }
  if (/\bteam (operations|services|travel)\b/.test(t)) return true;
  if (/\bstrength and conditioning\b/.test(t)) return true;
  return false;
}

/**
 * In-game / TV / radio production crew. Owned social, editorial, and
 * communications stay — those are crowd-business content work.
 */
function isBroadcast(title: string): boolean {
  const t = n(title);
  if (/\bsocial media\b|\bcommunications?\b|\bpublic relations\b/.test(t)) {
    return false;
  }
  if (/\bbroadcast/.test(t)) return true;
  if (/\bcamera\b/.test(t)) return true;
  if (/\bstage manager\b/.test(t)) return true;
  if (/\bplay-?by-?play\b|\bannouncer\b/.test(t)) return true;
  if (/\bevs\b|\breplay operator\b/.test(t)) return true;
  if (/\blive production\b/.test(t)) return true;
  if (/\bvideo (director|production|coordinator|operator)\b/.test(t)) return true;
  if (/\b(gameday|game day) technical director\b/.test(t)) return true;
  if (/^technical director$/.test(t)) return true;
  if (/\bproduction runner\b/.test(t)) return true;
  if (/^broadcaster$/.test(t)) return true;
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
  /**
   * Publicly-owned clubs only. There a bare "Owner" is a fan holding a share,
   * so ownership titles stay association rows rather than becoming seats.
   */
  excludeOwnership = false,
): CurateResult {
  const title = (rawTitle ?? "").trim();
  if (isAssociation(title)) return { keep: false, dropReason: "association" };
  if (isBoard(title)) return { keep: true, affiliationType: "board" };
  if (isOwnership(title)) {
    if (excludeOwnership) return { keep: false, dropReason: "association" };
    return { keep: true, affiliationType: "ownership" };
  }
  if (isOnField(title)) return { keep: false, dropReason: "on_field" };
  if (isBroadcast(title)) return { keep: false, dropReason: "broadcast" };
  if (isNotATitle(title, company ?? null, orgName)) {
    return { keep: false, dropReason: "not_a_title" };
  }
  return { keep: true, affiliationType: "employed" };
}
