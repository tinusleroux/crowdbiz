import { config } from "dotenv";
import { db } from "../db";
import { organizations, scrapeRuns } from "../db/schema";
import { ingestExistingDataset, processRun } from "../worker/process-run";

config({ path: ".env.local" });
config();

async function main() {
  const datasetId = process.argv[2] ?? "fnlrJrgcXd8xxmbFB";
  const employeesRunId = process.argv[3] ?? "bTlVnCbRwFcHdNv4F";

  await db()
    .insert(organizations)
    .values({
      orgRef: "nfl-green-bay-packers",
      displayName: "Green Bay Packers",
      orgType: "team",
      website: "https://www.packers.com",
      linkedinCompanyUrl: "https://www.linkedin.com/company/32984",
      excludeOwnership: true,
    })
    .onConflictDoNothing({ target: organizations.orgRef });

  const [run] = await db()
    .insert(scrapeRuns)
    .values({
      orgRef: "nfl-green-bay-packers",
      status: "collecting",
      apifyEmployeesRunId: employeesRunId,
      apifyEmployeesActor: "harvestapi/linkedin-company-employees",
      observedAt: new Date(),
      maxItems: 200,
    })
    .returning();

  if (!run) throw new Error("Failed to create replay run");

  console.log(`Replaying dataset ${datasetId} into run ${run.id}`);
  await ingestExistingDataset(run.id, datasetId);
  await processRun(run.id);
  console.log("Replay finished.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
