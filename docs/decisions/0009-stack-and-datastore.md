---
id: 0009
title: Runtime, hosting, and datastore
status: Open
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0009 — Runtime, hosting, and datastore

## Status

`Open` — not binding. Nothing in this repository may assume an answer until this is accepted.

## Context

No code exists yet. The choice that matters most is not the web framework but **where structure lives**, because the core object model is interval-heavy and traversal-heavy ([ADR-0001](0001-core-object-model.md)).

The workload has an unusual shape:

- **Ingest** is batch, write-heavy, and reconciliation-heavy. Claims are matched, split by interval, and resolved against history ([ADR-0002](0002-claims-before-interpretation.md)). This is relational work: constraints, transactions, auditability.
- **Org chart reads** are bounded traversals within one organization, filtered to a point in time, grouped by `function`. Depth to apex is a short recursive walk, not an open-ended search.
- **Overlay reads** are per-viewer and genuinely graph-shaped: first and second degree, warm paths across organizations. Volume is bounded by one user's uploaded network, but latency is user-facing.

Both extremes are plausible and the failure modes differ. Choosing a specialist graph store early buys traversal power we may not need and costs operational simplicity we certainly need. Choosing relational and discovering that pathfinding is unworkable is a painful migration later.

## Options

### A. Postgres only, recursive CTEs for traversal

Everything relational: temporal claims, resolved affiliations, and reporting edges in tables. Reporting depth and warm paths via recursive queries.

Strong on ingest, conflict resolution, and audit, which is where most of the early work is. Operationally simple, one system to run and back up, easy to reason about correctness. Managed hosting is abundant, and Supabase is already available in this workspace.

Weak if pathfinding grows beyond two or three hops or becomes latency-critical. Recursive CTEs are workable but not pleasant, and query complexity lands in the hardest-to-test layer.

### B. Native graph store as the system of record

Model people, organizations, affiliations, and edges natively. Traversal, pathfinding, and explanation are first-class.

Strong on the overlay and on future intelligence features that walk and cite structure. Weak precisely where the early work is: temporal reconciliation, provenance, constraints, and audit are less natural, and operational maturity is a real cost for a project with no users yet.

### C. Postgres as system of record, derived graph projection for reads

Claims, resolution, and history in Postgres. A projection built for traversal and overlay reads, rebuildable from the source of truth.

Matches the architecture already decided: claims are the record, structure is derived ([ADR-0002](0002-claims-before-interpretation.md)), and a projection can be rebuilt when the ontology version changes. Costs a synchronization path and two systems to operate, which is heavy before there is anything to serve.

### Sequencing note

A and C are not exclusive. Starting at A and adding a projection when overlay latency demands it is a viable path, provided the read layer is written so that traversal is not scattered across the application.

## Decision

Not yet made.

To accept this ADR, answer: which store holds the system of record, whether a separate read projection exists at launch, the hosting target, and the application runtime.

## Consequences

Until this is accepted:

- No schema, migration, ORM, or client library may be committed.
- `AGENTS.md` has no build or test commands.
- [contracts/claim-schema.md](../contracts/claim-schema.md) stays storage-neutral. It describes a file format, not a table.

## Affects

- [../../AGENTS.md](../../AGENTS.md)
- [contracts/claim-schema.md](../contracts/claim-schema.md)

## Source

Discussion, 2026-08-29
