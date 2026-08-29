import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function main() {
  const { processQueuedRuns } = await import("./process-run");
  console.log("Worker polling scrape_runs…");
  for (;;) {
    await processQueuedRuns();
    await new Promise((r) => setTimeout(r, 4000));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
