import { config } from "dotenv";
import { recurateAndEmit } from "../worker/process-run";

config({ path: ".env.local" });
config();

async function main() {
  const runId = process.argv[2];
  if (!runId) throw new Error("Usage: pnpm reemit <scrapeRunId>");
  const result = await recurateAndEmit(runId);
  console.log(result);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
