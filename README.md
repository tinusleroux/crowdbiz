# CrowdBiz Graph

A living map of the crowd-business side of professional sports — ticketing, venue operations, game presentation, partnerships, merchandise, security, concessions — showing who sits where, how organizations are structured, and how a personal network reaches into them.

What we are trying to build is in [INTENT.md](INTENT.md).

## Status

One producer exists: [`crowdbiz_seeding/`](crowdbiz_seeding/) scrapes public profiles one organization at a time and emits claim batches. Nothing imports those batches yet.

Function and seniority vocabularies live in [`ontology/`](ontology/) as YAML.

## Run the seeder

```bash
cd crowdbiz_seeding
cp .env.example .env.local   # set APIFY_TOKEN
docker compose up -d db      # Postgres on localhost:5433
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm worker                  # terminal 1
pnpm dev                     # terminal 2 — http://localhost:3000
```

`pnpm test` does not call Apify. A live scrape spends money.
