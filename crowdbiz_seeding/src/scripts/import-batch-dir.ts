import { config } from "dotenv";
import path from "node:path";
import { importClaimBatch } from "../graph/import-batch";

config({ path: ".env.local" });
config();

async function main() {
  const dirs = process.argv.slice(2);
  if (!dirs.length) throw new Error("Usage: pnpm graph:import <batchDir...>");
  for (const dir of dirs) {
    const result = await importClaimBatch(path.resolve(dir));
    console.log(result);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
