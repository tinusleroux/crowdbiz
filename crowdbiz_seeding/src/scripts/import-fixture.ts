import { config } from "dotenv";
import path from "node:path";
import { importClaimBatch } from "../graph/import-batch";

config({ path: ".env.local" });
config();

async function main() {
  const dir = path.resolve("data/fixture-org-chart");
  const result = await importClaimBatch(dir);
  console.log(result);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
