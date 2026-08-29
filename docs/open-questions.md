---
status: canonical
updated: 2026-08-29
---

# Open questions

Unresolved items that are **not binding on anything**. They exist so that uncertainty is recorded rather than silently resolved by whoever writes code first.

Bigger unresolved things — data model, claim contract, product boundary, stack — are ADRs instead. Two are open now: [ADR-0009](decisions/0009-stack-and-datastore.md) and [ADR-0010](decisions/0010-person-identity-without-pii.md).

Promote an item here to an ADR when it grows teeth. Delete it when it is answered, with the answer landing in a canonical doc or an ADR.

---

## Register

### Q-01 — How is `department_raw` handled?

Team sites often print a department name that is not a title. Options: keep it as an observed claim on the affiliation for display and disambiguation, use it only as a collision signal during interpretation, or ignore it.

Ignoring it means org charts will sometimes disagree with a team's own grouping. Promoting it to a node violates [ADR-0006](decisions/0006-no-role-seat-department-entities.md).

*Forces an answer:* the first seed batch that carries department strings.
*Touches:* [contracts/claim-schema.md](contracts/claim-schema.md), [architecture/ontology-title.md](architecture/ontology-title.md)

### Q-02 — How does coverage math treat hybrid functions?

One primary function is right for layout. It undercounts people who genuinely sit across two, which distorts "I know 3 of 6 in partnerships."

Leaning toward primary-only for v1, stated plainly as incomplete rather than presented as exact.

*Forces an answer:* the first gap-analysis surface.
*Touches:* [architecture/ontology-title.md](architecture/ontology-title.md)

### Q-03 — What clock does `REPORTS_TO` use?

"Time-qualified when known" is underspecified. Proposal: inherit the overlap of the two affiliation intervals unless a producer asserts a reporting interval explicitly. Dual-hat reporting is the reason affiliations were reified, so the edge still needs a default.

*Forces an answer:* the first reporting-aware chart or any depth computation.
*Touches:* [architecture/ontology-core.md](architecture/ontology-core.md), [contracts/claim-schema.md](contracts/claim-schema.md)

### Q-04 — What is the apex of an organization, per type?

Structural depth needs a defined top. Candidates differ by organization type: controlling owner, chief executive, or the most senior `employed` affiliation. A team with an ownership group and a president is not the same shape as a ten-person vendor.

*Forces an answer:* the first depth metric.
*Touches:* [architecture/ontology-title.md](architecture/ontology-title.md)

### Q-05 — What is the v1 function vocabulary?

The actual enumerated list of crowd-business functions. Beachhead depth beats a global HR taxonomy ([ADR-0007](decisions/0007-one-ontology-across-org-types.md)), and it must describe a vendor as well as a team.

*Forces an answer:* the first interpretation pass over real titles.
*Touches:* [architecture/ontology-title.md](architecture/ontology-title.md), [glossary.md](glossary.md)

### Q-06 — What is the seniority scale, and which way does it point?

Cardinality and orientation. Orientation must be picked once and held product-wide; the principle already leans toward lower number meaning more senior if leaders render at the center or top.

*Forces an answer:* the first chart layout.
*Touches:* [architecture/ontology-title.md](architecture/ontology-title.md)

### Q-07 — Which affiliation types appear on a default org chart?

`employed` certainly. Whether `contracted` shows by default, and how `board` and `ownership` render, is a product filter rather than an ontology fact — but it needs one answer so charts are consistent across organizations.

*Forces an answer:* the first org chart surface.
*Touches:* [product/vision.md](product/vision.md), [architecture/ontology-core.md](architecture/ontology-core.md)
