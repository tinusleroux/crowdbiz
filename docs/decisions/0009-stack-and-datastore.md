---
id: 0009
title: Postgres is the system of record, in three physically separated zones
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
revisit_when: overlay or pathfinding latency stops being acceptable on recursive queries, or the map grows well beyond a few leagues
---

# ADR-0009 — Postgres is the system of record, in three physically separated zones

## Status

`Accepted`

## Context

The product is called a graph, and that has been quietly biasing the storage question toward a graph database. The actual query shapes do not support it.

An org chart is one organization at one point in time, grouped by function and ordered by seniority — a filtered scan and a sort over a few hundred rows. Depth to apex is a recursive walk two to six levels deep. The overlay is a join against one user's uploaded connections. Even warm paths are shallow, because a third-degree introduction is not warm and nobody will ask for one.

The scale is similarly modest. A league is roughly thirty-two organizations at a couple of hundred crowd-business staff each; with vendors and agencies a beachhead is on the order of tens of thousands of persons and low hundreds of thousands of affiliations. Connection edges are the largest table and still small by Postgres standards.

Meanwhile the work that dominates the early build is reconciliation, constraints, provenance, and audit ([ADR-0002](0002-claims-before-interpretation.md), [ADR-0010](0010-person-identity-without-pii.md)). That is relational work, and it is where a specialist traversal engine helps least while costing the most operationally.

## Decision

**Postgres is the system of record. No graph database.**

The database is organized into **three physically separated zones**, because two of the decisions already made are otherwise enforced only by everyone remembering them:

- **Claims** — append-only. Never updated, never deleted. Corrections are new rows. This is the audit substrate.
- **Derived** — resolved persons, affiliations, structure, and interpretation. Every row traces to the claims supporting it.
- **Overlay** — consent-scoped `KNOWS` data, in its own namespace with its own access path.

**The derived zone must be droppable and rebuildable from claims alone.** This is [ADR-0002](0002-claims-before-interpretation.md) made operational, and it is a test that runs in CI rather than an aspiration, because it is precisely the property that quietly stops being true.

**Structure queries must not be able to see the overlay.** Chart building runs under an access path with no reach into `KNOWS`, so [ADR-0008](0008-knows-overlay-separate.md) holds by construction.

**Traversal lives behind a narrow read layer**, not scattered through application code, so that adding a derived read projection later is a contained change rather than an excavation.

**Ingest is a batch worker, not a request handler.** Resolve may run for minutes over a large batch; it must not live anywhere with a request timeout.

This ADR deliberately does not choose a web framework or fix any table shapes. The framework is cheap to reverse and does not need a decision record; table shapes are interior and belong in code, sketched non-bindingly in [architecture/data-model.md](../architecture/data-model.md). A managed Postgres provider is expected — Supabase is the likely default given it also supplies auth that [ADR-0011](0011-account-to-person-binding.md) will need — with the constraint that the data layer stays portable Postgres rather than coupling to provider-specific query interfaces.

## Consequences

- One system to run, back up, and reason about, with transactions and constraints where the hard work actually is.
- Recursive CTEs carry depth and pathfinding. They are workable rather than pleasant, which is the price of not operating a second datastore.
- The zone separation is real schema and real roles, so it costs setup effort that a single flat schema would not.
- Rebuildability constrains design permanently: nothing may live only in the derived zone.
- If the overlay outgrows recursive queries, the escape hatch is a derived read projection behind the existing read layer — not a migration.

## Affects

- [architecture/data-model.md](../architecture/data-model.md)
- [architecture/ingest.md](../architecture/ingest.md)
- [../../AGENTS.md](../../AGENTS.md)

## Source

Discussion, 2026-08-29
