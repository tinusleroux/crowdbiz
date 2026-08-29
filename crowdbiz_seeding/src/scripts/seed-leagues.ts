import { config } from "dotenv";
import { db } from "../db";
import { organizations } from "../db/schema";

config({ path: ".env.local" });
config();

/**
 * Twenty clubs across four leagues, to widen the title corpus the ontology is
 * derived from before its vocabulary is locked.
 *
 * Every LinkedIn company URL here was verified rather than inferred from the
 * club name. The slugs are not uniformly kebab-cased — `dallascowboys`,
 * `seattlekraken`, `milwaukee-bucks-inc`, and `st.-louis-cardinals` all differ
 * from the pattern — so guessing would have produced runs that cost money and
 * returned the wrong company or nothing at all.
 *
 * `excludeOwnership` is false throughout: none of these is community-owned the
 * way the Packers are, so there is no shareholder flood to filter.
 */
const CLUBS = [
  // NFL
  ["nfl-dallas-cowboys", "Dallas Cowboys", "https://www.dallascowboys.com", "dallascowboys"],
  ["nfl-kansas-city-chiefs", "Kansas City Chiefs", "https://www.chiefs.com", "kansas-city-chiefs"],
  ["nfl-philadelphia-eagles", "Philadelphia Eagles", "https://www.philadelphiaeagles.com", "philadelphia-eagles"],
  ["nfl-san-francisco-49ers", "San Francisco 49ers", "https://www.49ers.com", "san-francisco-49ers"],
  ["nfl-atlanta-falcons", "Atlanta Falcons", "https://www.atlantafalcons.com", "atlanta-falcons"],

  // MLB
  ["mlb-los-angeles-dodgers", "Los Angeles Dodgers", "https://www.mlb.com/dodgers", "los-angeles-dodgers"],
  ["mlb-new-york-yankees", "New York Yankees", "https://www.mlb.com/yankees", "new-york-yankees"],
  ["mlb-chicago-cubs", "Chicago Cubs", "https://www.mlb.com/cubs", "chicago-cubs"],
  ["mlb-st-louis-cardinals", "St. Louis Cardinals", "https://www.mlb.com/cardinals", "st.-louis-cardinals"],
  ["mlb-boston-red-sox", "Boston Red Sox", "https://www.mlb.com/redsox", "boston-red-sox"],

  // NBA
  ["nba-golden-state-warriors", "Golden State Warriors", "https://www.nba.com/warriors", "golden-state-warriors"],
  ["nba-miami-heat", "Miami Heat", "https://www.nba.com/heat", "miami-heat"],
  ["nba-milwaukee-bucks", "Milwaukee Bucks", "https://www.nba.com/bucks", "milwaukee-bucks-inc"],
  ["nba-phoenix-suns", "Phoenix Suns", "https://www.nba.com/suns", "phoenix-suns"],
  ["nba-cleveland-cavaliers", "Cleveland Cavaliers", "https://www.nba.com/cavaliers", "cleveland-cavaliers"],

  // NHL
  ["nhl-vegas-golden-knights", "Vegas Golden Knights", "https://www.nhl.com/goldenknights", "vegas-golden-knights"],
  ["nhl-seattle-kraken", "Seattle Kraken", "https://www.nhl.com/kraken", "seattlekraken"],
  ["nhl-tampa-bay-lightning", "Tampa Bay Lightning", "https://www.nhl.com/lightning", "tampa-bay-lightning"],
  ["nhl-chicago-blackhawks", "Chicago Blackhawks", "https://www.nhl.com/blackhawks", "chicago-blackhawks"],
  ["nhl-new-jersey-devils", "New Jersey Devils", "https://www.nhl.com/devils", "new-jersey-devils"],
] as const;

async function main() {
  for (const [orgRef, displayName, website, slug] of CLUBS) {
    await db()
      .insert(organizations)
      .values({
        orgRef,
        displayName,
        orgType: "team",
        website,
        linkedinCompanyUrl: `https://www.linkedin.com/company/${slug}`,
        excludeOwnership: false,
      })
      .onConflictDoNothing({ target: organizations.orgRef });
    console.log(`  ${orgRef}`);
  }
  console.log(`\nSeeded ${CLUBS.length} clubs.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
