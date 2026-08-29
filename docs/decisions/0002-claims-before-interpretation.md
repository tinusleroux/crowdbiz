---
id: 0002
title: Producers emit claims; function and seniority are derived after resolve
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0002 — Producers emit claims; function and seniority are derived after resolve

## Status

`Accepted`

## Context

Facts about this industry arrive from many producers and will keep arriving: a curated seed batch today, a corrections file next month, a press-release extract that says someone accepted a new job after that. Each is a **sourced assertion at a point in time**, not a state update.

Two failure modes are fatal to trust. First, letting a producer write normalized structure — if a scraper decides "Partnerships, VP-band," the ontology forks across projects and nobody can explain the map. Second, last-write-wins: the newest file silently overwrites the truth, history evaporates, and a wrong scrape is indistinguishable from a correction.

## Decision

Producers emit **claims**: sourced, timed assertions about people, organizations, affiliations, and relationships. A claim carries raw title, participation type, interval, and provenance — never `function` or `seniority`.

This product runs **validate, then resolve, then interpret**. Claims are reconciled against what is already known (corroborate, supersede, split intervals, or stand in explicit conflict, always with history). Only then does the ontology derive `function` and `seniority` on the resolved affiliation.

A hire announced in a press release is not a special pipeline. It is one affiliation claim, usually implying the close or split of a prior interval, resolved like any other.

If a producer does send a normalized hint, it is a **hint with provenance**, never the system of record.

## Consequences

- The raw title survives forever. Normalized fields are projections and can be recomputed when the ontology improves.
- Re-import is safe. Seed batches, corrections, and news extracts all take the same path.
- Provenance and recency, not authorial order, decide conflicts. "How do we know this?" always has an answer.
- Derived structure needs an ontology version stamped on it so old charts remain interpretable.
- Cost: ingest is genuinely harder than an upsert. Conflict is a first-class state that the product must be able to display rather than hide.

## Affects

- [architecture/ingest.md](../architecture/ingest.md)
- [architecture/ontology-title.md](../architecture/ontology-title.md)
- [contracts/claim-schema.md](../contracts/claim-schema.md)

## Source

Discussion, 2026-08-29; [brainstorm/2026-08-29-vision.md](../brainstorm/2026-08-29-vision.md)
