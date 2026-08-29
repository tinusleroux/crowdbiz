import { config } from "dotenv";

config({ path: ".env.local" });
config();

const REPAIRS = [
  {
    runId: "763aa7db-33e6-4602-9475-c905ae50dea7",
    datasetId: "ofJDF1GqHMTcaLuN5",
  },
  {
    runId: "cf1957e0-9e14-4f9c-ad2f-a877b831af6f",
    datasetId: "mL2cmLwyj4EXBmKGW",
  },
];

async function main() {
  const { repairVanityFromDataset } = await import("../worker/process-run");

  for (const repair of REPAIRS) {
    const counts = await repairVanityFromDataset(
      repair.runId,
      repair.datasetId,
    );
    console.log(
      `Repaired ${repair.runId}: ${counts.updated}/${counts.keepers} vanity URLs`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
