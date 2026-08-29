---
id: 0014
title: Seniority is a nine-band ordered scale where lower is more senior
status: Accepted
date: 2026-08-29
supersedes: null
superseded_by: null
revisit_when: A second organization type — vendor or agency — produces titles that will not sit on this scale
---

# ADR-0014 — Seniority is a nine-band ordered scale where lower is more senior

## Status

`Accepted`

## Context

Seniority exists so structure is computable: who stacks above whom within a function, how rings and layers render, and whether two people at different organizations are comparable ([ontology-title.md](../architecture/ontology-title.md)). Nothing renders until a title has a band.

Cardinality and orientation are the kind of convention that gets assumed silently rather than decided. Every layout, query, threshold, and stored derived row encodes it. Discovering halfway that half the product assumed the opposite direction is expensive in a way that the choice itself is not — the cost is in the ambiguity, not the answer.

The scale was derived from 136 real front-office titles at one NFL club and stress-tested against 490 titles from clubs that were not used to build it. Two things emerged from that corpus rather than from theory. Clubs use *assistant director* as a genuine tier between director and manager, so collapsing it loses real structure. And modifiers — senior, assistant, associate, deputy — behave consistently enough to be treated as an adjustment rather than as separate bands, which is what keeps the scale from doubling in size.

## Options

**Fewer bands, five or six.** Simpler layout and fewer disputes at the edges. Rejected because the corpus genuinely populates nine: compressing director, assistant director, and manager into one tier erases the most common structural distinction in a club's front office.

**More bands, or a continuous score.** Better fidelity, and attractive for ranking. Rejected because seniority is for layout and comparison, not measurement — a continuous score invites arithmetic the underlying evidence cannot support, and implies precision a scraped title does not have.

**Higher number means more senior.** Reads naturally as a score. Rejected because leaders render at the centre or the top, and depth from the apex counts upward from zero; two counters running in opposite directions in the same layout is a persistent source of error.

## Decision

Seniority resolves to an ordered scale of nine bands, referenced by stable slug, where **a lower rank number means more senior**. Modifiers adjust the band a title's base noun establishes; they never create bands and never multiply functions. A title carrying no rank marker resolves to an explicit unknown rather than being inferred from its function. A multi-part title resolves to one band, normally the most senior.

The `rank` integer is ordering only. Compare it; do not persist it as the identifier or do arithmetic on it, so a band can be inserted later without rewriting stored structure.

The band vocabulary itself is versioned data ([ontology/seniority.v1.yaml](../../ontology/seniority.v1.yaml)), not a constant in code. What this ADR fixes is the cardinality, the orientation, and the rule that modifiers adjust rather than proliferate.

## Consequences

- Layout, stacking, and cross-organization comparison have one convention, and it is written down rather than inferred from whichever surface was built first.
- Structural depth and title seniority both count upward from the apex, so the two lenses can disagree meaningfully instead of confusingly ([ontology-title.md](../architecture/ontology-title.md)).
- Adding a band later is possible but not free: slugs survive, stored numbers do not. This is why nothing may key on the integer.
- Explicit unknown means charts will show unranked affiliations. That is intended — a title that names only a department carries no rank, and inventing one would be fake certainty.
- Cost: nine bands is more than a layout strictly needs and invites edge-case argument, particularly around assistant manager against senior coordinator. The corpus does not settle that pairing; the scale places them together and accepts the imprecision.

## Affects

- [architecture/ontology-title.md](../architecture/ontology-title.md)
- [ontology/seniority.v1.yaml](../../ontology/seniority.v1.yaml)

## Source

Derived from the Green Bay Packers front-office trial batch and stress-tested against the Bills and Dolphins title corpus. Closes Q-06 in [open-questions.md](../open-questions.md).
