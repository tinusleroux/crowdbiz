import { ApifyClient, type ActorRun } from "apify-client";
import {
  EMPLOYEES_ACTOR,
  EMPLOYEES_SHORT_MODE,
  OWNERSHIP_EXCLUDE_SENIORITY,
  OWNERSHIP_EXCLUDE_TITLES,
  VANITY_ACTOR,
  VANITY_NO_EMAIL_MODE,
} from "@/lib/constants";

export function apifyClient(): ApifyClient {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is required");
  return new ApifyClient({ token });
}

/**
 * No `jobTitles` filter. Filtering by title at collection decides the product's
 * coverage: every title word you require excludes everyone whose title lacks it,
 * which strips out trades, food service, retail and gameday staff and yields an
 * org chart that appears to be all managers. Scope is decided after collection,
 * by curation and then by the ontology — see Q-11 in the platform's
 * open-questions register.
 */
export function employeesInput(
  companyUrl: string,
  maxItems: number,
  excludeOwnership: boolean,
) {
  return {
    profileScraperMode: EMPLOYEES_SHORT_MODE,
    maxItems,
    companies: [companyUrl],
    companyBatchMode: "one_by_one" as const,
    ...(excludeOwnership
      ? {
          excludeSeniorityLevelIds: [...OWNERSHIP_EXCLUDE_SENIORITY],
          excludeCurrentJobTitles: [...OWNERSHIP_EXCLUDE_TITLES],
        }
      : {}),
  };
}

export function vanityInput(profileIds: string[]) {
  return {
    profileScraperMode: VANITY_NO_EMAIL_MODE,
    profileIds,
  };
}

export async function startActor(
  actorId: string,
  input: object,
  maxTotalChargeUsd: number | null,
): Promise<ActorRun> {
  const client = apifyClient();
  const run = await client.actor(actorId).start(input, {
    ...(maxTotalChargeUsd != null && Number.isFinite(maxTotalChargeUsd)
      ? { maxTotalChargeUsd }
      : {}),
  });
  return run;
}

export async function waitForRun(
  runId: string,
  pollMs = 8000,
): Promise<ActorRun> {
  const client = apifyClient();
  for (;;) {
    const run = await client.run(runId).get();
    if (!run) throw new Error(`Apify run ${runId} not found`);
    if (
      run.status === "SUCCEEDED" ||
      run.status === "FAILED" ||
      run.status === "ABORTED" ||
      run.status === "TIMED-OUT"
    ) {
      return run;
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
}

export async function fetchDatasetItems(
  datasetId: string,
): Promise<Record<string, unknown>[]> {
  const client = apifyClient();
  const items: Record<string, unknown>[] = [];
  let offset = 0;
  const limit = 250;
  for (;;) {
    const page = await client.dataset(datasetId).listItems({
      offset,
      limit,
      clean: true,
    });
    const batch = (page.items ?? []) as Record<string, unknown>[];
    items.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return items;
}

export { EMPLOYEES_ACTOR, VANITY_ACTOR };
