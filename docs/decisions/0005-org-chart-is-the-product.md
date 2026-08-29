---
id: 0005
title: The public org chart is a first-class product surface, and team-side depth is a launch constraint
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0005 — The public org chart is a first-class product surface, and team-side depth is a launch constraint

## Status

`Accepted`

## Context

Producing a credible org chart of a team or vendor from publicly available professional facts is rare and valuable on its own. Nothing in this industry offers it. The temptation is to treat that chart as scaffolding on the way to the network overlay, and to build only as much structure as the overlay needs.

That inverts the dependency. Coverage gaps and warm paths are computed **on** the chart. If the chart is thin or wrong, the overlay is not merely less useful — it is visibly broken, and the first session that was supposed to prove the product instead disproves it.

The same logic applies to sequencing by audience. Vendors and agencies have the sharpest pain around structure and warm access, but a vendor-first build order would seed the wrong half of the map. What makes any of it work is that team organizations already look comprehensive.

## Decision

The public org chart is a durable product and data capability, not a visualization step: temporal, provenance-backed, ontology-ranked, queryable, and reused by every downstream surface.

Network overlay, coverage gaps, and warm paths are projections on that chart.

A credible team-side skeleton is a launch constraint, not a backlog item. Prefer depth in a beachhead — a league's crowd-business organizations, well structured — over thin coverage everywhere. Vendor and agency charts use the same capability.

Wedge framing may shape *which payoff we lead with*. It does not shape *what gets seeded*.

## Consequences

- Chart quality is a product metric, not a data chore, and it gates launch.
- The chart must stand on its own for a user who never uploads a network.
- Seed depth has to arrive through the claim contract, which makes [ADR-0003](0003-collection-outside-this-repo.md) a launch dependency rather than a convenience.
- Structure must be explainable, since a chart asserted from public facts will occasionally be wrong in public ([ADR-0002](0002-claims-before-interpretation.md)).
- Cost: a slower, less demo-able start than shipping an overlay on sparse data.

## Affects

- [product/vision.md](../product/vision.md)
- [architecture/ontology-title.md](../architecture/ontology-title.md)

## Source

[brainstorm/2026-08-29-vision.md](../brainstorm/2026-08-29-vision.md); discussion, 2026-08-29
