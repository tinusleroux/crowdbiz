# crowdbiz-seed

Producer `crowdbiz-seed`: one organization per Apify scrape, raw + curated rows in Postgres, automatic claim-schema batch emit.

A producer inside the CrowdBiz Graph repository ([ADR-0015](../docs/decisions/0015-producers-live-here.md)). The claim contract is the only write path into the claim zone, and it is not restated here — read [claim-schema.md](../docs/contracts/claim-schema.md) and [producer-profile-scrape.md](../docs/contracts/producer-profile-scrape.md), which this implements. `src/emit/validate.ts` enforces it, and a batch that fails validation is never marked emitted.

## Local run

```bash
cp .env.example .env.local   # set APIFY_TOKEN
docker compose up -d db   # Postgres on localhost:5433 (avoids a local 5432)
pnpm db:migrate
pnpm db:seed
pnpm worker                  # terminal 1
pnpm dev                     # terminal 2
```

Open http://localhost:3000.

## Data

`data/batches/` holds emitted claim batches. They are reproducible from a scrape run and not tracked.

`data/packers-front-office-trial.csv` is the pilot pull the ontology was derived from, kept as reference. Do **not** import it as raw — it carries no position start dates.

Optional replay of Apify dataset `fnlrJrgcXd8xxmbFB` if it is still live:

```bash
pnpm replay
# or: pnpm replay fnlrJrgcXd8xxmbFB bTlVnCbRwFcHdNv4F
```

## Collection lock

- `harvestapi/linkedin-company-employees` — `Short ($4 per 1k)` only
- `harvestapi/linkedin-profile-scraper` — `Profile details no email` only, keepers after curation

`APIFY_TOKEN` never appears in the UI or exported CSVs.
