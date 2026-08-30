import { loadVocab, type FunctionVocab, type Vocab } from "./vocab";

export type Interpretation = {
  function: string;
  seniority: string;
  inChart: boolean;
};

export type InterpretInput = {
  rawTitle: string;
  /** Claim value. Only `employed` is drawn on the crowd-business chart. */
  affiliationType?: string;
  /** Used to strip venue and affiliate clauses such as "Kraken Community Iceplex". */
  orgName?: string;
};

const ABBREVIATIONS: [RegExp, string][] = [
  [/\bevp\b/g, "executive vice president"],
  [/\bsvp\b/g, "senior vice president"],
  [/\bavp\b/g, "assistant vice president"],
  [/\bvp\b/g, "vice president"],
  [/\bceo\b/g, "chief executive officer"],
  [/\bcoo\b/g, "chief operating officer"],
  [/\bcfo\b/g, "chief financial officer"],
  [/\bcmo\b/g, "chief marketing officer"],
  [/\bcro\b/g, "chief revenue officer"],
  [/\bcto\b/g, "chief technology officer"],
  [/\bcio\b/g, "chief information officer"],
  [/\bchro\b/g, "chief human resources officer"],
  [/\bclo\b/g, "chief legal officer"],
  [/\bgm\b/g, "general manager"],
  [/\bsr\b/g, "senior"],
  [/\basst\b/g, "assistant"],
  [/\bmgr\b/g, "manager"],
  [/\bdir\b/g, "director"],
  [/\bit\b/g, "information technology"],
];

function norm(s: string): string {
  let out = s
    .toLowerCase()
    .replace(/[_/&,+()|]+/g, " ")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  for (const [pattern, replacement] of ABBREVIATIONS) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s+/g, " ").trim();
}

const VENUE_MARKER =
  /\b(iceplex|arena|stadium|centre|center|complex|fieldhouse|ballpark|campus|practice facility)\b/i;

function orgTokens(orgName: string | undefined): string[] {
  if (!orgName) return [];
  return orgName
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((t) => t.length > 3);
}

/**
 * A venue or affiliate clause names a building, not a job. "VP, Business
 * Operations, Kraken Community Iceplex" is administration; left in place the
 * word "Community" decides the function instead.
 */
function stripOrgContext(rawTitle: string, orgName?: string): string {
  const withoutAt = rawTitle.replace(/\s+at\s+.+$/i, "").trim() || rawTitle;
  const tokens = orgTokens(orgName);
  if (!tokens.length) return withoutAt;

  const segments = withoutAt
    .split(/[,|]|\s+-\s+|\s+–\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length < 2) return withoutAt;

  const kept = segments.filter((segment) => {
    const lower = segment.toLowerCase();
    const hasOrgToken = tokens.some((t) => lower.includes(t));
    if (!hasOrgToken) return true;
    return !VENUE_MARKER.test(lower) && !tokens.every((t) => lower.includes(t));
  });
  return kept.length ? kept.join(", ") : withoutAt;
}

function hasPhrase(title: string, phrase: string): boolean {
  const p = norm(phrase);
  if (!p) return false;
  const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(title);
}

/**
 * Ordered rules, first match wins. This is matching, not ontology: phrases and
 * precedence can change freely, slugs cannot.
 */
const FUNCTION_RULES: [string, RegExp][] = [
  // Honest ambiguity, per the vocabulary's own boundary notes.
  ["unknown", /^director( of)? video$/],
  ["unknown", /^(director|vice president|senior director)( of|,)? operations$/],
  ["unknown", /^assistant general manager$/],
  ["unknown", /^(vice president|director|manager|analyst|consultant|coordinator|specialist)$/],

  // Equity and governance, not an employed crowd-business department.
  ["ownership", /^(co-?|part )?owner(-?operator)?$/],
  ["ownership", /\b(co-?owner|part[- ]owner|owner-?operator)\b/],
  ["ownership", /\bboard member\b|\bmember of the board\b|\bboard of directors\b|\bboard seat\b/],
  ["ownership", /\bownership group\b/],
  ["unknown", /^security analyst$/],
  ["unknown", /\bresearch and development\b|\bresearch development\b/],
  ["unknown", /\bplayer engagement\b/],
  ["unknown", /^director( of|,)? performance$/],

  // On-field, sport-agnostic. Excluded from the chart, never from ingest.
  ["on_field", /\bscout\b|\bscouts\b|\bscouting\b/],
  ["on_field", /\b(goaltend\w*|goalie|goaltender)\b/],
  ["on_field", /\bplayer personnel\b|\bpro personnel\b|\bplayer development\b/],
  ["on_field", /\b(hockey|football|basketball|baseball|soccer) (operations|analyst|analytics|administration|logistics|strategy|information)\b/],
  ["on_field", /\bteam (operations|services|travel)\b/],
  ["on_field", /\bathletic trainer\b|\bteam physician\b|\bphysician\b|\bstrength and conditioning\b/],
  ["on_field", /\bperformance (nutrition|science|psychology)\b/],
  ["on_field", /\bequipment (manager|director|assistant|coordinator)\b/],
  ["on_field", /\bgame film\b|\bvideo coach\b|\bebug\b/],
  ["on_field", /\b(nhl|nfl|nba|mlb) (goaltender|player|forward|defenseman)\b/],

  // C-suite lands in the domain it oversees where that is knowable.
  ["finance", /\bchief financial officer\b/],
  ["marketing", /\bchief marketing officer\b/],
  ["partnerships", /\bchief (revenue|commercial) officer\b/],
  ["people", /\bchief (human resources|people) officer\b/],
  ["technology", /\bchief (technology|information|digital) officer\b/],
  ["legal", /\bchief legal officer\b/],
  ["executive", /\bchief (executive|operating|strategy) officer\b|^president$|^president (and|of the) /],

  // Fan-facing admission beats the word "account".
  ["ticketing", /\bticket\w*\b|\bbox office\b|\barchtics\b/],
  ["ticketing", /\b(season|group|inside|premium|membership|suite) (ticket|sales|service|seating|seat|membership)\w*\b/],
  ["ticketing", /\bmembership (sales|service|experience)\b|\bpremium (sales|service|seating|experience|hospitality)\b/],
  ["ticketing", /\bgroup sales\b|\bsuite sales\b/],

  ["client_success", /\baccount manager\b|\baccount service\w*\b|\b(customer|client) success\b|\bclient services\b/],
  ["partnerships", /\bpartnership\w*\b|\bsponsorship\b|\bcorporate partner\w*\b|\baccount executive\b|\bbusiness development\b|\bnew business\b|\bactivation\b/],

  ["community", /\bcommunity\b|\bfoundation\b|\bsocial impact\b|\bcharitable\b|\byouth\b|\bgrassroots\b|\balumni relations\b|\blearn to play\b|\bice academy\b/],

  ["guest_services", /\bguest (service|experience|relations)\w*\b|\busher\b|\bgreeter\b|\bconcierge\b|\bsuite attendant\b|\bcustomer service\b|\bfan service\w*\b/],
  ["fan_experience", /\bgame presentation\b|\bentertainment\b|\bin-?game host\b|\bmascot\b|\bperformer\b|\bspecial events\b|\bevent (booking|operations|production|manager|coordinator)\b|\bhall of fame\b|\bfan experience\b|\bice crew\b|\bice breaker\b|\bsea squad\b|\bdance team\b|\bdrumline\b|\btours?\b/],

  ["communications", /\bcommunications?\b|\bpublic relations\b|\bmedia relations\b|\bpress\b|\bpublic affairs\b|\bgovernment relations\b/],
  ["content_media", /\bcontent\b|\bsocial\b|\bdigital (media|content|innovation|asset)\b|\bvideo\b|\bbroadcast\w*\b|\bphotograph\w*\b|\bcreative\b|\bdesign\w*\b|\beditorial\b|\bproduction\b|\bproducer\b|\bgraphic\b|\bannouncer\b|\bplay-?by-?play\b|\bevs\b|\breplay\b/],
  ["marketing", /\bmarketing\b|\bbrand\b|\bpromotions?\b|\bdemand generation\b|\bstreet team\b/],

  ["analytics", /\banalytics\b|\bbusiness intelligence\b|\bdata (scien\w*|analyst|warehouse)\b|\binsights?\b|\bmarket research\b|\bcrm\b/],
  ["product", /\bproduct (manager|management|owner|strategy|design|marketing)\b/],
  ["professional_services", /\bprofessional services\b|\bimplementation\b|\bonboarding\b|\bsolutions? (architect|consultant)\b/],

  // A facilities engineer is venue work; an information-security analyst is not.
  ["venue_operations", /\b(facilit\w*|building|mechanical|hvac|stationary|operating) engineer\b/],
  ["technology", /\binformation security\b|\bcyber\w*\b|\binfosec\b/],
  ["technology", /\binformation technology\b|\bsoftware\b|\bdatabase\b|\bcloud\b|\bnetwork\w*\b|\binfrastructure\b|\bdevops\b|\bhelp ?desk\b|\bapplications?\b|\bquality assurance\b|\bsystems? (administrator|engineer|analyst|manager)\b|\bdata (systems|platform|engineer\w*)\b|\bautomation\b|\bav\b|\baudio ?visual\b|\bengineer\b|\bdeveloper\b/],

  ["finance", /\bfinance\b|\bfinancial\b|\baccounting\b|\baccountant\b|\bpayroll\b|\btreasury\b|\baudit\w*\b|\bprocurement\b|\bcontroller\b|\bfp a\b|\bbudget\b|\binsurance\b/],
  ["legal", /\blegal\b|\bcounsel\b|\battorney\b|\bcompliance\b|\bparalegal\b/],
  ["people", /\bhuman resources\b|\btalent acquisition\b|\brecruit\w*\b|\bbenefits\b|\bcompensation\b|\bpeople\b.*\bculture\b|\blearning and development\b|\bemployee experience\b/],

  ["retail", /\bretail\b|\bmerchandise\b|\bteam store\b|\bpro shop\b|\be-?commerce\b|\bjersey (customiz\w*|personaliz\w*)\b/],
  ["food_beverage", /\bfood\b|\bbeverage\b|\bconcession\w*\b|\bcatering\b|\bculinary\b|\brestaurant\b|\bbartender\b|\bchef\b/],
  ["venue_operations", /\bvenue\b|\bstadium\b|\bfacilit\w*\b|\bgrounds\b|\bhousekeep\w*\b|\bcustodial\b|\bparking\b|\btransport\w*\b|\bsecurity\b|\bsafety\b|\bmaintenance\b|\bengineering\b/],
  ["real_estate_development", /\breal estate\b|\bcapital project\w*\b|\bconstruction\b|\bdevelopment (project|construction)\b/],

  ["administration", /\bexecutive assistant\b|\bchief of staff\b|\bexecutive office\b|\boffice (manager|administrator)\b|\badministrative (assistant|coordinator)\b|\bbusiness operations\b/],
];

const GENERIC_FUNCTION_TOKEN = new Set([
  "and",
  "the",
  "of",
  "or",
  "executive",
  "leadership",
  "operations",
  "service",
  "services",
  "business",
  "development",
  "unknown",
  "board",
]);

function functionLabelPhrases(fn: FunctionVocab): string[] {
  const fromLabel = [
    fn.label,
    ...fn.label.split(/\s+and\s+/i),
    fn.slug === "executive" ? "" : fn.slug.replace(/_/g, " "),
  ];
  return fromLabel.map(norm).filter((p) => {
    if (p.length < 3) return false;
    if (p.split(" ").length === 1 && GENERIC_FUNCTION_TOKEN.has(p)) return false;
    return true;
  });
}

function interpretFunction(title: string, vocab: Vocab): string {
  if (!title) return "unknown";

  if (/\bexecutive coach\b|\bleadership (coach|consultant)\b/.test(title)) {
    return "people";
  }
  if (/\bcoach\w*\b/.test(title)) return "on_field";

  for (const [slug, pattern] of FUNCTION_RULES) {
    if (pattern.test(title)) return slug;
  }

  // Fall back to the vocabulary's own labels, longest phrase first.
  let best: { slug: string; len: number } | undefined;
  let tie = false;
  for (const fn of vocab.functions) {
    if (fn.slug === "unknown") continue;
    for (const phrase of functionLabelPhrases(fn)) {
      if (!hasPhrase(title, phrase)) continue;
      if (!best || phrase.length > best.len) {
        best = { slug: fn.slug, len: phrase.length };
        tie = false;
      } else if (phrase.length === best.len && fn.slug !== best.slug) {
        tie = true;
      }
    }
  }
  if (!best || tie) return "unknown";
  return best.slug;
}

/** Extra rank markers the authored `typical` lists do not spell out. */
const SENIORITY_PHRASES: Record<string, string[]> = {
  senior_leader: ["general manager"],
  senior_contributor: ["lead"],
  contributor: [
    "account executive",
    "representative",
    "administrator",
    "engineer",
    "developer",
    "scientist",
    "designer",
    "technician",
    "accountant",
    "paralegal",
    "recruiter",
    "announcer",
    "broadcaster",
    "instructor",
    "consultant",
  ],
  support: ["intern", "crew", "member", "squad", "shoveler", "customizer"],
};

function typicalPhrases(typical: string): string[] {
  return typical
    .split(",")
    .map((s) => norm(s))
    .filter((s) => s && s !== "c-suite" && !s.startsWith("no rank"));
}

function interpretSeniority(title: string, vocab: Vocab): string {
  if (!title) return "unknown";

  if (/^executive assistant\b/.test(title)) return "support";

  const presidentOfDomain = /\bpresident of\b/.test(title);
  const cSuite =
    /\bchief [a-z]+ officer\b/.test(title) ||
    /\bchief (executive|operating|financial|marketing|revenue|commercial|legal|technology|information|strategy|people)\b/.test(
      title,
    ) ||
    /\bowner-?operator\b/.test(title) ||
    (/\bpresident\b/.test(title) && !presidentOfDomain);

  type Hit = { slug: string; rank: number; phrase: string };
  const hits: Hit[] = [];

  for (const band of vocab.seniority.bands) {
    if (band.rank == null || band.slug === "unknown") continue;
    if (band.slug === "chief") {
      if (cSuite) hits.push({ slug: "chief", rank: band.rank, phrase: "chief" });
      continue;
    }
    const phrases = [
      ...typicalPhrases(band.typical),
      ...(SENIORITY_PHRASES[band.slug] ?? []).map(norm),
    ];
    for (const phrase of phrases) {
      if (hasPhrase(title, phrase)) {
        hits.push({ slug: band.slug, rank: band.rank, phrase });
      }
    }
  }

  if (hits.length === 0) return "unknown";

  const modifierTerms = new Set(
    [
      ...vocab.seniority.modifiers.senior.terms,
      ...vocab.seniority.modifiers.junior.terms,
    ].map((t) => norm(t)),
  );
  const substantive = hits.filter((h) => !modifierTerms.has(h.phrase));
  const pool = substantive.length ? substantive : hits;
  pool.sort((a, b) => b.phrase.length - a.phrase.length);
  const chosen = pool[0]!;

  let rank = chosen.rank;
  const matched = chosen.phrase;
  const { senior, junior } = vocab.seniority.modifiers;

  const termInTitleNotInMatch = (term: string) => {
    const t = norm(term);
    if (!hasPhrase(title, t)) return false;
    if (hasPhrase(matched, t)) return false;
    return true;
  };

  if (senior.terms.some(termInTitleNotInMatch)) rank += senior.delta;
  if (junior.terms.some(termInTitleNotInMatch)) rank += junior.delta;

  const numbered = vocab.seniority.bands.filter(
    (b): b is typeof b & { rank: number } => b.rank != null,
  );
  const min = Math.min(...numbered.map((b) => b.rank));
  const max = Math.max(...numbered.map((b) => b.rank));
  rank = Math.min(max, Math.max(min, rank));
  return numbered.find((b) => b.rank === rank)?.slug ?? "unknown";
}

export function inChartFor(
  functionSlug: string,
  affiliationType: string,
  vocab: Vocab,
): boolean {
  const fn = vocab.functions.find((f) => f.slug === functionSlug);
  const scopeAllows =
    functionSlug === "unknown" || fn?.scope === "in" || fn?.scope === "unresolved";
  return scopeAllows && affiliationType === "employed";
}

export function interpretAffiliation(
  input: InterpretInput,
  vocab: Vocab = loadVocab(),
): Interpretation {
  const title = norm(stripOrgContext(input.rawTitle, input.orgName));
  const functionSlug = interpretFunction(title, vocab);
  const senioritySlug = interpretSeniority(title, vocab);
  const affiliationType = input.affiliationType ?? "employed";
  return {
    function: functionSlug,
    seniority: senioritySlug,
    inChart: inChartFor(functionSlug, affiliationType, vocab),
  };
}

export function interpretTitle(
  rawTitle: string,
  vocab: Vocab = loadVocab(),
): Interpretation {
  return interpretAffiliation({ rawTitle }, vocab);
}
