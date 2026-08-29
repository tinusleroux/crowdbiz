---
id: 0013
title: On-field roles are out of scope — classified, not rejected
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
revisit_when: the product wants to serve vendors selling into football operations, such as sports science or performance analytics
---

# ADR-0013 — On-field roles are out of scope: classified, not rejected

## Status

`Accepted`

## Context

The product is about **crowd business** — managing, operating, and monetizing live crowds. Coaches, players, scouts, and the rest of the on-field competitive product are not that, and [product/vision.md](../product/vision.md) says so. But it says so only in prose. Neither the claim contract nor the ontology enforced it.

Pilot data made the gap concrete: a sample of roughly a thousand rows across two NFL teams contained about seventy on-field and football-operations roles — scouting assistants, equipment managers, athletic trainers, video staff, and active players — sitting alongside ticketing and partnerships staff with nothing to distinguish them.

This will happen with every real source. A team's own front-office directory lists the head coach a few rows above the director of ticket operations. The question is not whether these rows arrive; it is where the boundary gets applied.

Applying it at validation is tempting and wrong. Scope cannot be determined without interpretation — "Director of Video" is game film in football operations or video content in marketing, and only the ontology can tell them apart. Deciding at validation would mean interpreting before resolve, inverting the pipeline ([ADR-0002](0002-claims-before-interpretation.md)). It would also mean the claim log stops being a faithful record of what a source said, which breaks the rebuild property in [ADR-0009](0009-stack-and-datastore.md).

## Decision

**Scope is a property of the affiliation, not of the person or the organization.**

That distinction carries the decision. A team is entirely in scope as an organization. A person is never out of scope — someone who played for a team and later became its VP of Alumni Relations holds one out-of-scope affiliation and one in-scope one, and the person, their identity, and their history remain intact. Only the affiliation is excluded.

**On-field affiliations are classified, not rejected.** The function vocabulary carries explicit out-of-scope categories, and interpretation assigns them like any other function. The claim is recorded, the affiliation is resolved, and the product filters.

**The test is purpose:** does this role exist to run the on-field competitive product? Playing, coaching, scouting, player personnel, athletic training and rehabilitation, equipment, sports science, and game-film video are out. Anything whose purpose is the crowd, the venue, the money, or the brand is in.

**Product surfaces exclude out-of-scope affiliations by default** — org charts, coverage gaps, and warm paths.

**Producers are told not to collect on-field roles**, but the pipeline tolerates them arriving anyway. Guidance to the producer, tolerance in the system, filtering at the surface.

**Unclear cases go to Unknown, not to a forced call.** Player engagement, football communications, and football administration sit genuinely on the line, and a confident wrong answer is worse than an explicit one ([ontology-title.md](../architecture/ontology-title.md)).

## Consequences

- The pipeline order holds: nothing is judged for scope before it can be interpreted.
- The boundary can move without re-importing anything, because it lives in interpretation rather than in ingest.
- Career continuity across the line is preserved, which matters more than it sounds — former players moving into business roles is a real and valuable pattern in this industry.
- The claim log stays a faithful record of every source, so the derived zone still rebuilds.
- Cost: the function vocabulary carries categories that are never displayed, and every product surface must remember to filter. A surface that forgets will show the head coach on a partnerships chart.
- Boundary roles will be argued about indefinitely. That is acceptable; Unknown absorbs them.
- Vendors whose business serves football operations are unaffected as organizations. Whether the product covers that segment is a separate question, flagged in `revisit_when`.

## Affects

- [architecture/ontology-title.md](../architecture/ontology-title.md)
- [contracts/claim-schema.md](../contracts/claim-schema.md)
- [product/vision.md](../product/vision.md)

## Source

Pilot data analysis, 2026-08-29
