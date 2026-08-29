import { config } from "dotenv";
import { db } from "../db";
import { organizations } from "../db/schema";

config({ path: ".env.local" });
config();

async function main() {
  await db()
    .insert(organizations)
    .values({
      orgRef: "nfl-green-bay-packers",
      displayName: "Green Bay Packers",
      orgType: "team",
      website: "https://www.packers.com",
      linkedinCompanyUrl: "https://www.linkedin.com/company/32984",
      // Community-owned: ~537,000 shareholders, and many list it.
      excludeOwnership: true,
    })
    .onConflictDoNothing({ target: organizations.orgRef });

  console.log("Seeded nfl-green-bay-packers (company 32984).");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
