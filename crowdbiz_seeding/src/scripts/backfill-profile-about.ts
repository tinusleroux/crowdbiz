import { config } from "dotenv";
import { isNotNull } from "drizzle-orm";
import { db } from "../db";
import { scrapeRuns } from "../db/schema";
import { apifyClient, fetchDatasetItems } from "../worker/apify";
import { applyVanityItems } from "../worker/process-run";

config({ path: ".env.local" });
config();

async function main() {
  const requested = new Set(process.argv.slice(2));
  const runs = (
    await db()
      .select()
      .from(scrapeRuns)
      .where(isNotNull(scrapeRuns.apifyVanityRunId))
  ).filter((run) => requested.size === 0 || requested.has(run.id));

  let processed = 0;
  for (const run of runs) {
    const vanityRunId = run.apifyVanityRunId;
    if (!vanityRunId) continue;
    const actorRun = await apifyClient().run(vanityRunId).get();
    const datasetId = actorRun?.defaultDatasetId;
    if (!datasetId) {
      console.warn(`${run.id}: vanity dataset unavailable`);
      continue;
    }
    const items = await fetchDatasetItems(datasetId);
    const result = await applyVanityItems(run.id, items);
    console.log(`${run.id}: ${result.updated}/${result.keepers} profiles enriched`);
    processed += result.updated;
  }
  console.log(`Backfilled ${processed} profile records across ${runs.length} runs.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
