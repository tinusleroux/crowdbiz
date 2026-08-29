---
id: 0011
title: Account-to-person binding — self-claiming and what it entitles
status: Open
date: 2026-08-29
supersedes: null
superseded_by: null
revisit_when: self-claiming becomes a live feature
---

# ADR-0011 — Account-to-person binding: self-claiming and what it entitles

## Status

`Open` — not binding. Deliberately deferred until self-claiming is a real feature rather than a plan.

## Context

[ADR-0010](0010-person-identity-without-pii.md) makes human input first-class identity evidence, including people claiming themselves and supplying their own employment history. That is the strongest identity signal available and a genuine strategic asset.

It also introduces something the model has not had until now: a **user account binding to a Person node**. Two questions follow, and neither has an obvious answer under [ADR-0004](0004-no-pii.md).

**How is a self-claim verified?** The conventional proof is a work email at the organization's domain, and we do not collect email. Without some proof, anyone can claim to be anyone, and the highest-weight identity signal in the system becomes its softest target.

**What does claiming entitle you to?** There is real tension here. Contributors should be able to correct the record about themselves — that is the whole point. But the map is built from public professional facts, and if a person can delete a sourced claim about a role they held, the shared map becomes editable by its subjects and stops being ground truth. "I want that job removed" and "that job is recorded wrongly" look identical at the API and are completely different in kind.

This does not block anything today. The claim contract, the resolve stage, and the org chart are all fully specified without it, and self-claiming requires a user base that does not yet exist.

## Options

Sketched, not evaluated.

**Verification** could rest on OAuth against a professional profile, which proves control of a public profile without storing a contact channel and fits the evidence-not-key stance of ADR-0010. Alternatives are moderation, corroboration by others at the same organization, or accepting unverified claims with visible status and lower weight.

**Entitlement** most likely resolves as correction rights and voice but never veto: a claimed person can assert, dispute, annotate, and control their own social overlay contribution, but cannot erase a sourced public professional fact. The dispute state would need to be visible rather than silently winning.

## Decision

Not yet made.

To accept this ADR, answer: what proves a self-claim, what weight a verified versus unverified claim carries, whether a person can dispute or only annotate a public fact, what a dispute looks like on a chart, and whether an account can unbind.

## Consequences

Until this is accepted:

- No self-claim feature ships.
- No account-to-person binding exists in any schema.
- Corrections from third parties remain ordinary attributed claims, with abuse handling tracked as Q-08 in [../open-questions.md](../open-questions.md).

## Affects

- [architecture/ingest.md](../architecture/ingest.md)
- [product/vision.md](../product/vision.md)

## Source

Discussion, 2026-08-29, arising from [ADR-0010](0010-person-identity-without-pii.md)
