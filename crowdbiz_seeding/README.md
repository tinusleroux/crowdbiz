# crowdbiz-seed

Producer: one organization per Apify scrape, raw and curated rows in Postgres, then a claim batch.

The claim shape is whatever [`src/emit/validate.ts`](src/emit/validate.ts) accepts. A batch that fails validation is never marked emitted.

Producer tables (`raw_profiles`, `curated_profiles`, `scrape_runs`, `batches`) are collection state. They are not graph truth.

## Local run

```bash
cp .env.example .env.local   # set APIFY_TOKEN
docker compose up -d db      # Postgres on localhost:5433
pnpm db:migrate
pnpm db:seed
pnpm worker                  # terminal 1
pnpm dev                     # terminal 2
```

Open http://localhost:3000.

## Data

`data/batches/` holds emitted claim batches. They are reproducible from a scrape run and not tracked.

`data/packers-front-office-trial.csv` is the pilot pull the ontology was derived from, kept as reference. Do not import it as raw — it carries no position start dates.

Optional replay of Apify dataset `fnlrJrgcXd8xxmbFB` if it is still live:

```bash
pnpm replay
# or: pnpm replay fnlrJrgcXd8xxmbFB bTlVnCbRwFcHdNv4F
```

## Collection lock

- `harvestapi/linkedin-company-employees` — `Short ($4 per 1k)` only
- `harvestapi/linkedin-profile-scraper` — `Profile details no email` only, keepers after curation

The keeper profile pass also stores the public LinkedIn `about` text in
`raw_profiles.profile_about`. It is review context only: it appears in the
function-validation queue but is not emitted into claims or treated as graph
truth. Existing vanity datasets can be replayed without a new Actor run:

```bash
pnpm backfill:about
```

`APIFY_TOKEN` never appears in the UI or exported CSVs.
