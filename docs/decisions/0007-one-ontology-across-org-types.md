---
id: 0007
title: One function and seniority system across all organization types
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0007 — One function and seniority system across all organization types

## Status

`Accepted`

## Context

Titles mean different things in different places. The same string carries different rank, function, and decision rights at a team, a league, an agency, and a vendor. The obvious response is to give each organization type its own taxonomy, tuned to how that world actually talks.

That breaks the product. The value is in questions that cross organizational boundaries: who at this vendor is the counterpart to that person at the team, where does a warm path actually land, how does this department compare to the same department elsewhere. Per-type taxonomies make those comparisons meaningless, and warm paths cannot be scored across a fork.

## Decision

One crowd-business `function` vocabulary and one `seniority` scale apply to every organization type — teams, vendors, agencies, sponsors, leagues, venues.

Organization type may **inform disambiguation**: it is a signal for resolving a collision such as "development" or "operations". It must never select a different vocabulary.

Unknown is always available. A confident wrong function is worse than an explicit Unknown.

## Consequences

- Cross-organization comparison, pathfinding, and coverage math stay coherent.
- The vocabulary must be broad enough to describe a vendor and a team without becoming a generic HR taxonomy. Beachhead depth beats global completeness.
- Disambiguation policy carries real weight, since collisions are resolved rather than avoided by forking.
- Executives are classified by the function they oversee, not dumped into a generic Executive bucket, or function views and gap analysis lose their meaning.
- Cost: some organization-specific nuance is flattened. That is the price of comparability.

## Affects

- [architecture/ontology-title.md](../architecture/ontology-title.md)
- [glossary.md](../glossary.md)

## Source

[brainstorm/2026-08-29-title-ontology-principles.md](../brainstorm/2026-08-29-title-ontology-principles.md)
