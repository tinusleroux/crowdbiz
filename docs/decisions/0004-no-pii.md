---
id: 0004
title: No PII, including for identity matching
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0004 — No PII, including for identity matching

## Status

`Accepted`

## Context

Professional networks normally grow by absorbing contact data. That creates exactly the friction this product cannot afford: people hesitate to contribute, compliance weight accumulates, and the value of the asset becomes the thing users are most afraid of sharing.

The bet here is the inverse. What travels is professional fact and relationship context — names, titles, organizations, roles, and consent-scoped connection topology. Contributing feels like adding to an industry map rather than surrendering an address book, which is what makes low-friction adoption possible.

The pressure on this decision will not come from a feature request for a contact database. It will come from identity matching, where storing an email address is the obvious shortcut.

## Decision

We do not collect, store, derive, or expose personal contact details — email, phone, personal addresses, or equivalent private channels. This holds for user-facing features, for imported claims, and for internal matching.

Person identity must be solved without contact data. How, is [ADR-0010](0010-person-identity-without-pii.md).

If a feature only works with PII, the feature is wrong. Rethink the feature.

## Consequences

- Person resolution is genuinely harder and will sometimes be uncertain. Uncertainty is acceptable; a hidden email index is not.
- Trust rests on provenance, recency, and corroboration rather than on verified private identity ([ADR-0002](0002-claims-before-interpretation.md)).
- Ingest must reject PII columns rather than ignore them, so a well-meaning producer cannot quietly widen the surface ([ADR-0003](0003-collection-outside-this-repo.md)).
- The product cannot become a messaging or outreach tool, because it structurally lacks the channel. That is intended.
- Perfect global person deduplication is off the table. The map tolerates ambiguity.

## Affects

- [product/vision.md](../product/vision.md)
- [contracts/claim-schema.md](../contracts/claim-schema.md)
- [architecture/ingest.md](../architecture/ingest.md)

## Source

[brainstorm/2026-08-29-vision.md](../brainstorm/2026-08-29-vision.md)
