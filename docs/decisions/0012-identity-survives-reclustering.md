---
id: 0012
title: Identity survives re-clustering — stable UIDs and identity assertions as claims
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
revisit_when: null
---

# ADR-0012 — Identity survives re-clustering: stable UIDs and identity assertions as claims

## Status

`Accepted`

## Context

[ADR-0010](0010-person-identity-without-pii.md) makes a Person a derived cluster over claims, re-derivable whenever the matcher or the evidence improves. That property is what makes probabilistic identity safe. It also creates two hazards that are cheap to prevent now and expensive to retrofit.

**Re-clustering can renumber people.** If person UIDs are an output of each clustering run, every re-run invalidates external references — bookmarked pages, cached charts, anything a user has seen. The map would silently lose continuity exactly when it improved.

**Re-clustering can erase human work.** Human validators and research agents will resolve the ambiguous cases, which is the whole reason probabilistic identity is acceptable. If those judgments are recorded as one-off merges against the derived tables, the next clustering run overwrites them, and the same cases are adjudicated again forever. Worse, the cases that most need a human are exactly the ones the matcher will keep getting wrong.

Wikidata and ORCID both arrived at the same answer after learning it the hard way.

## Decision

**Person UIDs are stable across re-clustering.** A clustering run does not mint fresh identifiers; it maps its clusters onto existing UIDs by maximal claim overlap. When a cluster splits, the larger side keeps the UID and the other is issued a new one. When two clusters merge, one UID is retired with a redirect so that any prior reference still resolves. A retired UID is never reused.

**Human identity judgments are claims.** A validator or agent asserting that two clusters are the same person, or that they are not, emits a `same_as` or `not_same_as` claim with a source and a date, through the normal pipeline ([ingest.md](../architecture/ingest.md)). They are assertions about identity rather than about the world, but they are claims, and clustering must respect them as anchors.

`not_same_as` carries particular weight, because it is the only way to permanently separate two people whose evidence will always look alike — the two Jane Smiths in one department that no amount of matcher improvement will ever tell apart.

## Consequences

- Identity work compounds instead of being repeated. Every human judgment survives every future re-clustering and improves the map permanently.
- Re-derivation stays safe, which is what makes the aggressive stance of [ADR-0010](0010-person-identity-without-pii.md) affordable.
- The system needs UID redirects and a split-and-merge policy from the beginning, plus a rule that a retired UID resolves rather than disappearing.
- Identity claims are a small but real abuse surface, tracked with corrections under Q-08 in [../open-questions.md](../open-questions.md).
- An anchor can itself be wrong. A `same_as` claim is superseded the same way any other claim is — by a later, better-sourced claim — never by silent deletion.

## Affects

- [architecture/ingest.md](../architecture/ingest.md)
- [architecture/data-model.md](../architecture/data-model.md)
- [glossary.md](../glossary.md)

## Source

Discussion, 2026-08-29, following [ADR-0010](0010-person-identity-without-pii.md)
