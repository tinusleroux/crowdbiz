# CrowdBiz Graph

A living map of the crowd-business side of professional sports — ticketing, venue operations, game presentation, partnerships, merchandise, security, concessions — showing who sits where, how organizations are structured and connected, and how a personal network reaches into them.

The distinguishing capability: **credible org charts of teams and vendors, built from public professional facts, with no personal contact data involved.**

## Status

Documentation only, no code yet. The datastore is decided — Postgres in three zones, with the derived structure rebuildable from an append-only claim log ([ADR-0009](docs/decisions/0009-stack-and-datastore.md)).

The documents in `docs/` are written to be binding, not descriptive. They constrain the system before it is built.

## Start here

- [AGENTS.md](AGENTS.md) — how to work in this repo (read first)
- [docs/README.md](docs/README.md) — authority model and change process
- [docs/product/vision.md](docs/product/vision.md) — what we are building and why
- [docs/architecture/ontology-core.md](docs/architecture/ontology-core.md) — the object model
- [docs/decisions/README.md](docs/decisions/README.md) — every binding decision

## Related projects

This repository owns the claim contract, the ingest pipeline, the graph, the product — and, since [ADR-0015](docs/decisions/0015-producers-live-here.md), the producers that feed it. Collection is permitted here, but nothing reaches the claim zone except validated, fully-provenanced claims. See [docs/contracts/claim-schema.md](docs/contracts/claim-schema.md).
