---
id: 0010
title: Person identity is a derived cluster over claims, resolved probabilistically
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
revisit_when: self-claims become a material share of identity evidence, or the map spans several leagues and cross-organization collisions rise
---

# ADR-0010 — Person identity is a derived cluster over claims, resolved probabilistically

## Status

`Accepted`

## Context

[ADR-0001](0001-core-object-model.md) requires a durable Person. [ADR-0004](0004-no-pii.md) removes every conventional way of establishing one. There is no email to key on, and there will not be.

Every claim that arrives must answer whether this is somebody we already know. The two failure directions are not symmetric. A false split shows phantom staff on a chart and overstates coverage gaps — visible, embarrassing, and largely self-correcting. A false merge invents a career that never happened and can route a user to the wrong human, which is the kind of error that loses trust permanently.

The hard cases are ordinary: common names inside one organization, a hire announcement that predates any directory listing, someone appearing at a new organization before the old affiliation is closed, nicknames, married names, and initials in press releases.

Accepting probabilistic resolution is not resignation, because identity here improves with use. As people look at charts of organizations they know, they can correct obvious errors. As the user base grows, people can claim themselves and supply their own employment history. Both arrive as ordinary claims, so the same pipeline that seeds the map also sharpens it.

Two properties of the system already decided make this tractable. Claims are immutable and structure is a recomputable projection ([ADR-0002](0002-claims-before-interpretation.md)), so identity can be derived rather than asserted. And an affiliation sequence is close to a fingerprint — a person's history disambiguates them, which is self-reinforcing without being circular, since unambiguous names, profile URLs, and self-claims seed the process.

## Options

Recorded because the rejected paths are instructive.

**Producer-supplied identifiers as authority** was rejected because it pushes identity management onto every producer, does nothing for a press extract seeing a person for the first time, and quietly turns a producer's key into a personal identifier.

**A deterministic natural key** on name, organization, and interval was rejected because it fails exactly where the industry is dense — two people with the same name in one organization — and is weakest on cross-organization identity, which the overlay depends on.

**A public profile URL as the primary key** was rejected as an identifier while retained as evidence. Used as a key it would build a global person index inside a third-party namespace, with the terms-of-use and durability exposure that implies. Used as one weighted signal it is simply a public professional fact, which is what the map is made of.

## Decision

**The internal UID is the only durable person identifier.** We assign it. Producer references and public profile URLs are **evidence, never authority**.

**A Person is a derived cluster of claims**, not an asserted record. Clustering is a versioned projection over immutable claims, which makes a merge non-destructive by construction: unmerging is a re-projection rather than a repair, and improving the matcher re-derives identity retroactively without touching a single claim.

**Resolution is probabilistic and permanent**, not a stopgap. Evidence includes name forms and known-as variants, organization, interval adjacency, affiliation sequence, public profile URL, corroboration count, and source-type weight.

**Confidence bands are per-surface, not global.** The bar rises with the cost of being wrong. Grouping someone on an org chart may proceed on weaker evidence than asserting a career move, which in turn is weaker than presenting a warm path to a named human. Warm paths never render on an auto-merge below the highest band.

**Human claims are first-class, high-weight identity evidence.** A viewer correcting an org chart and a user claiming themselves both emit ordinary claims through the normal pipeline ([ingest.md](../architecture/ingest.md)) with their own source types. Self-assertion is the strongest available signal for *identity*; it is not automatically the strongest for *title*, since people describe their own roles generously.

**Unresolved is a displayable state.** A person we cannot confidently place appears as such rather than being silently merged or silently dropped.

What a user account may bind to and what that entitles them to is a separate decision — [ADR-0011](0011-account-to-person-binding.md).

## Consequences

- Identity is explainable in the same way function and seniority are: we can show which claims formed a person and why.
- A wrong merge is cheap to fix and a better matcher improves history retroactively, so early imperfection is not permanent damage.
- The claim contract can be finalized: producers send their own references and whatever public professional evidence they have, and never an identity verdict.
- The matcher, a review path, and per-surface band policy all have to be built. This is real work that a deterministic key would have avoided.
- Third-party corrections are an abuse surface — a vendor could edit a rival's chart. Corrections carry attribution, and handling is tracked as Q-08 in [../open-questions.md](../open-questions.md).
- **The human loop cannot be the launch plan.** It needs users, users need a credible chart, and a credible chart needs decent unassisted resolution first. Seed quality still has to stand on its own ([ADR-0005](0005-org-chart-is-the-product.md)); corrections compound it rather than rescue it.
- Perfect global deduplication remains explicitly out of scope. The map tolerates stated ambiguity.

## Affects

- [contracts/claim-schema.md](../contracts/claim-schema.md)
- [architecture/ingest.md](../architecture/ingest.md)
- [glossary.md](../glossary.md)

## Source

Discussion, 2026-08-29
