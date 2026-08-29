---
id: 0001
title: Person, Organization, Affiliation, and Relationship are the core objects
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
---

# ADR-0001 — Person, Organization, Affiliation, and Relationship are the core objects

## Status

`Accepted`

## Context

The product must represent how the crowd-business industry actually works: people participate in organizations in many capacities, over time, and organizations do commercial business with each other. A model built on "person works at company" collapses under the first real cases — an owner who is not an employee, an agency contractor embedded at a venue, someone holding two posts at once, someone who moved last month.

The map must also stay coherent when facts change. If structure hangs off a person, a job change corrupts history. If it hangs off the participation itself, history is naturally preserved.

## Decision

Four objects carry the graph:

- **Person** — durable human identity
- **Organization** — durable collective (team, vendor, agency, sponsor, league, venue, association)
- **Affiliation** — a person participates in an organization, over an interval, under a raw title, with a mandatory `type`
- **Relationship** — a timed commercial or structural link between two organizations, with a mandatory `type`

Four edges connect them: `AFFILIATED` (Person to Organization, via an Affiliation), `REPORTS_TO` (**Affiliation to Affiliation**), `RELATES` (Organization to Organization, via a Relationship), and `KNOWS` (Person to Person, consent-scoped, see [ADR-0008](0008-knows-overlay-separate.md)).

Reporting hangs on affiliations, never on bare people. Person-to-org and org-to-org links never share a name.

## Consequences

- Dual posts, capacity changes, and job moves stay coherent because the affiliation is the thing that starts and ends.
- Title, `function`, and `seniority` have an obvious home: the affiliation. They are not properties of a Person or an Organization ([ADR-0002](0002-claims-before-interpretation.md)).
- Structural depth ("hops to the org apex") is computable along `REPORTS_TO` without inventing a parallel hierarchy.
- Breadth lives in **types**, not in new nouns. Employment is one affiliation type, not the concept itself.
- Cost: nothing is a simple join. Every structural question is an interval question, and the ingest pipeline must reconcile overlapping intervals rather than overwrite rows.

## Affects

- [architecture/ontology-core.md](../architecture/ontology-core.md)
- [architecture/ontology-title.md](../architecture/ontology-title.md)
- [contracts/claim-schema.md](../contracts/claim-schema.md)

## Source

[brainstorm/2026-08-29-ontology-principles.md](../brainstorm/2026-08-29-ontology-principles.md)
