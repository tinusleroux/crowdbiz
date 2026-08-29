export const PRODUCER_ID = "crowdbiz-seed";

export const EMPLOYEES_ACTOR = "harvestapi/linkedin-company-employees";
export const VANITY_ACTOR = "harvestapi/linkedin-profile-scraper";

/** Hard-locked: never Full + email. */
export const EMPLOYEES_SHORT_MODE = "Short ($4 per 1k)";
/** Hard-locked: never email search. */
export const VANITY_NO_EMAIL_MODE = "Profile details no email ($4 per 1k)";

/**
 * Only for clubs with public or widely-distributed ownership, where thousands of
 * fans hold a share and list it. Off by default: at a small vendor these filters
 * would delete the founders, who are the most important people in the batch.
 *
 * Excluding by title here is a cost optimisation, not the scope rule. Anything
 * that slips through is caught downstream by `isAssociation` in curation, which
 * is where the judgement belongs.
 */
export const OWNERSHIP_EXCLUDE_SENIORITY = ["320"] as const;

export const OWNERSHIP_EXCLUDE_TITLES = [
  "Owner",
  "Shareholder",
  "Stockholder",
  "Share Holder",
] as const;

export function batchesDir(): string {
  return process.env.BATCHES_DIR ?? "./data/batches";
}

export function apifyConsoleRunUrl(runId: string): string {
  return `https://console.apify.com/view/runs/${runId}`;
}
