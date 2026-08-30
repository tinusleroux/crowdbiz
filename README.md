# CrowdBiz Graph

A living map of the crowd-business side of professional sports — ticketing, venue operations, game presentation, partnerships, merchandise, security, concessions — showing who sits where, how organizations are structured, and how a personal network reaches into them.

What we are trying to build is in [INTENT.md](INTENT.md).

## Status

One producer exists: [`crowdbiz_seeding/`](crowdbiz_seeding/) scrapes public
profiles and emits claim batches. The same app imports a batch, interprets
titles from [`ontology/`](ontology/) YAML, and draws an org chart at
`/chart`.

## Run the seeder and chart

```bash
cd crowdbiz_seeding
cp .env.example .env.local   # set APIFY_TOKEN for live scrapes
docker compose up -d db      # Postgres on localhost:5433
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm worker                  # terminal 1 — only if scraping
pnpm dev                     # terminal 2 — http://localhost:3000
```

Open `/chart` and import the fixture batch to see a chart without scraping.

`pnpm test` does not call Apify. A live scrape spends money.
