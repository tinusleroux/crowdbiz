---
id: 0010
title: Person identity and matching without PII
status: Open
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0010 — Person identity and matching without PII

## Status

`Open` — not binding. This blocks the identity columns in [contracts/claim-schema.md](../contracts/claim-schema.md).

## Context

[ADR-0001](0001-core-object-model.md) requires a durable Person. [ADR-0004](0004-no-pii.md) removes every conventional way of establishing one. There is no email to key on, and there will not be.

Every claim that arrives must answer: is this the same person we already know? Get it wrong in one direction and one person becomes several, so an org chart shows phantom staff and coverage gaps are overstated. Get it wrong in the other and two people merge, which is worse — a career history that never happened, and a warm path to the wrong human.

The hard cases are ordinary: common names inside the same organization, a hire announcement that predates any directory listing, a person appearing at a new organization before the old affiliation is closed, nicknames and married names, and initials in press releases.

This is a **resolve**-stage problem ([ADR-0002](0002-claims-before-interpretation.md)), separate from title interpretation. It must be settled before the claim contract can be finalized, since it dictates what producers are required to send.

## Options

### A. Producer-supplied stable identifiers

Each producer assigns and maintains a durable key per person and sends it on every claim. Cross-producer identity is resolved by us.

Simple and reliable within a producer, and re-imports are trivially idempotent. But it pushes identity management onto every producer, gives the seeding project a hard job it may not do consistently, and does nothing for a press extract that has never seen the person before. It also risks becoming a de facto personal identifier, which needs a privacy read.

### B. Deterministic natural key

Match on a normalized combination of name, organization, and interval.

No producer burden and it works for a first-time source. But it fails exactly where the industry is dense: two people with the same name in one organization, and someone whose organization is the thing that just changed. Cross-organization identity — which the overlay depends on — is where it is weakest.

### C. Probabilistic resolution with explicit uncertainty

Score candidate matches on name, organization, function, interval adjacency, and corroborating sources. High confidence merges, mid confidence produces a linked-but-unmerged state, low confidence creates a distinct person.

Fits the model already chosen, where conflict is a first-class state rather than a failure. Handles nicknames and career moves. Costs a scoring model, a review path, and a product answer for how an unresolved person appears in a chart.

### D. Hybrid

Use producer identifiers when present as strong evidence, fall back to probabilistic resolution, and never auto-merge across producers below a confidence threshold.

Probably where this lands, but it needs the threshold policy, the unresolved-state semantics, and the merge and unmerge story written down before it means anything.

## Decision

Not yet made.

To accept this ADR, answer: what producers are required to send, what evidence is scored, what happens at each confidence band, whether a merge can be undone, and how an unresolved person is displayed.

## Consequences

Until this is accepted:

- Identity columns in [contracts/claim-schema.md](../contracts/claim-schema.md) are marked blocked and must not be treated as final.
- No merge logic is implemented.
- Any interim matching used for exploration is disposable and must not create durable person records.

## Affects

- [contracts/claim-schema.md](../contracts/claim-schema.md)
- [architecture/ingest.md](../architecture/ingest.md)

## Source

Discussion, 2026-08-29 — identified as the gap the ontology drafts correctly did not fill
