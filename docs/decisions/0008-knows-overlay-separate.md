---
id: 0008
title: KNOWS is a consent-scoped overlay and never defines org structure
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0008 — KNOWS is a consent-scoped overlay and never defines org structure

## Status

`Accepted`

## Context

Two very different kinds of edge live in this product. Public professional facts — who works where, in what capacity — build a shared map that everyone sees. Social topology — who knows whom — is contributed by an individual, is visible under that person's visibility settings, and can be revoked.

Blurring them is tempting because social data is dense and would visibly improve inference. It is also the fastest way to destroy the product: shared structure would silently depend on private contributions, one user's revocation would change what everyone else sees, and the map would stop being explainable from public sources.

## Decision

`KNOWS` is a consent-scoped overlay between people. It never contributes to organizational structure, reporting, `function`, or `seniority`.

Org charts are computable entirely from public professional claims, with no `KNOWS` edge involved. The overlay adds a per-viewer layer on top: first or second degree or none, coverage gaps, warm paths.

A user's contribution can be revoked or removed, and removing it must not damage the shared map.

## Consequences

- The chart is stable and explainable regardless of who has uploaded a network ([ADR-0005](0005-org-chart-is-the-product.md)).
- Visibility is one control in the core UX rather than a consent ceremony product.
- Overlay queries are per-viewer projections and must be kept out of shared structural caches.
- Revocation is a real operation the model has to support, not a support-ticket workflow.
- Cost: we forgo inference that social density would make easy, such as guessing reporting lines from connection patterns.

## Affects

- [architecture/ontology-core.md](../architecture/ontology-core.md)
- [product/vision.md](../product/vision.md)

## Source

[brainstorm/2026-08-29-ontology-principles.md](../brainstorm/2026-08-29-ontology-principles.md)
