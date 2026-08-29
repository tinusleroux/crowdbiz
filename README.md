# CrowdBiz Graph

A living map of the crowd-business side of professional sports — ticketing, venue operations, game presentation, partnerships, merchandise, security, concessions — showing who sits where, how organizations are structured and connected, and how a personal network reaches into them.

The distinguishing capability: **credible org charts of teams and vendors, built from public professional facts, with no personal contact data involved.**

## Status

Documentation only. No code yet, and no stack chosen — see [ADR-0009](docs/decisions/0009-stack-and-datastore.md).

The documents in `docs/` are written to be binding, not descriptive. They constrain the system before it is built.

## Start here

- [AGENTS.md](AGENTS.md) — how to work in this repo (read first)
- [docs/README.md](docs/README.md) — authority model and change process
- [docs/product/vision.md](docs/product/vision.md) — what we are building and why
- [docs/architecture/ontology-core.md](docs/architecture/ontology-core.md) — the object model
- [docs/decisions/README.md](docs/decisions/README.md) — every binding decision

## Related projects

Data collection lives elsewhere. This repository defines the claim contract and ingests batches; it does not scrape, crawl, or curate. See [ADR-0003](docs/decisions/0003-collection-outside-this-repo.md) and [docs/contracts/claim-schema.md](docs/contracts/claim-schema.md).
