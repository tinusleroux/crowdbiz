---
id: 0006
title: No Role, Job, Seat, or Department entities in v1
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0006 — No Role, Job, Seat, or Department entities in v1

## Status

`Accepted`

## Context

Org-chart products drift toward modelling the chart itself: a Department node, a Seat that can be vacant, a Role that exists independently of whoever fills it. It looks tidy and it matches how an HR system thinks.

We do not observe any of that. What public sources give us is a person, an organization, a title, and a time. A department node is an inference about grouping. A vacant seat is an inference about intent. Reifying inferences early means storing guesses as if they were facts, and then defending them forever.

## Decision

`Person`, `Organization`, `Affiliation`, and `Relationship` are the only entities ([ADR-0001](0001-core-object-model.md)). We do not create `Role`, `Job`, `Seat`, or `Department` as entities, tables, or types.

`function` on an affiliation is the controlled vocabulary for department-like grouping. Departments, seats, and vacancies are **projections** computed from affiliations, not stored objects.

This holds unless evidence forces otherwise — for example if seed data reliably carries named departments or open posts as observed facts. Changing it requires a new ADR.

Rule of thumb: **reify what you observe, project what you infer.**

## Consequences

- Org charts group by `function`, which is why the function vocabulary must be stable and shared ([ADR-0007](0007-one-ontology-across-org-types.md)).
- Vacancies cannot be represented in v1. "Who are the other three?" is answered as a coverage gap against known affiliations, not against an establishment of seats.
- A team's own department naming may sometimes disagree with our grouping. That is a known cost; see the open question on department strings.
- The model stays small enough to reason about while the claim contract is still settling.
- Cost: if departments later turn out to be genuinely observable, some rework is required. That is cheaper than unwinding invented entities.

## Affects

- [architecture/ontology-core.md](../architecture/ontology-core.md)
- [architecture/ontology-title.md](../architecture/ontology-title.md)
- [glossary.md](../glossary.md)

## Source

[brainstorm/2026-08-29-ontology-principles.md](../brainstorm/2026-08-29-ontology-principles.md)
