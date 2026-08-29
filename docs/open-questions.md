---
status: canonical
updated: 2026-08-29
---

# Open questions

Unresolved items that are **not binding on anything**. They exist so that uncertainty is recorded rather than silently resolved by whoever writes code first.

Bigger unresolved things — data model, claim contract, product boundary, stack — are ADRs instead. One is open now: [ADR-0011](decisions/0011-account-to-person-binding.md).

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

### Q-05 — What is the v1 function vocabulary? — **answered**

Twenty-two in-scope crowd-business domains plus `on_field` and `unknown`, now at [../ontology/functions.v2.yaml](../ontology/functions.v2.yaml). Derived from real titles at one club, stress-tested against clubs not used in the derivation, then extended in v2 when a vendor batch broke it — see Q-12.

### Q-06 — What is the seniority scale, and which way does it point? — **answered**

Nine bands, lower meaning more senior, modifiers adjusting rather than enumerating. Promoted to [ADR-0014](decisions/0014-seniority-scale.md) because orientation and cardinality leak into every surface and are expensive to change once assumed.

### Q-12 — Does the function vocabulary hold for vendors and agencies? — **partly; v2 fixes the vendor half**

No, as written. A 29-title software vendor batch left 48% of titles unclassified under v1, and the classifications it did make included "Senior Account Manager" under `finance`, matched on the word "account" — a salesperson drawn into the finance column of an org chart, which is worse than a gap because it looks like an answer.

[ADR-0007](decisions/0007-one-ontology-across-org-types.md) survives, because the fix was to complete the shared vocabulary rather than fork it. [../ontology/functions.v2.yaml](../ontology/functions.v2.yaml) adds `product`, `client_success`, and `professional_services`, and widens `partnerships` from sponsorship to business-to-business selling generally. The vendor corpus resolves fully, and no title in the earlier corpora lost a function it already had.

**Agencies remain untested.** Account planning, creative strategy, and media buying have not been seen, and `client_success` was drawn from a software vendor's account management, which may not be the same job. Expect one more round.

*Forces an answer:* the first batch from an agency.
*Touches:* [architecture/ontology-title.md](architecture/ontology-title.md), [../ontology/functions.v2.yaml](../ontology/functions.v2.yaml)

### Q-07 — Which affiliation types appear on a default org chart?

`employed` certainly. Whether `contracted` shows by default, and how `board` and `ownership` render, is a product filter rather than an ontology fact — but it needs one answer so charts are consistent across organizations.

*Forces an answer:* the first org chart surface.
*Touches:* [product/vision.md](product/vision.md), [architecture/ontology-core.md](architecture/ontology-core.md)

### Q-08 — How are third-party corrections protected from abuse?

[ADR-0010](decisions/0010-person-identity-without-pii.md) makes user corrections high-weight claims, which creates an incentive to misuse them — a vendor could quietly edit a rival's chart, or someone could inflate a colleague's seniority.

Corrections are attributed, so the raw material for handling this exists. What is unresolved is whether weight varies by contributor history, whether a correction against a well-sourced claim needs corroboration before it wins, and what visible state a disputed fact has.

Related but distinct from [ADR-0011](decisions/0011-account-to-person-binding.md), which covers claims about *yourself*.

*Forces an answer:* the first in-product correction affordance.
*Touches:* [architecture/ingest.md](architecture/ingest.md)

### Q-09 — Is the ontology vocabulary data or code?

The function vocabulary and seniority scale must be versioned and explainable ([ontology-title.md](architecture/ontology-title.md)). In code they are fast and type-safe but need a deploy to change; in the database they are editable and naturally versioned but lose compile-time safety.

Leaning toward versioned rows in the database referenced by stable slugs, so code can depend on the slugs while the vocabulary evolves without a migration.

*Forces an answer:* the first interpretation implementation.
*Touches:* [architecture/ontology-title.md](architecture/ontology-title.md), [architecture/data-model.md](architecture/data-model.md)

### Q-10 — How does `source_type` weight a claim during resolve?

A single trust score per source type is the obvious approach and probably the wrong one, because authority varies by *which fact* a row asserts rather than by the row. A public profile is our strongest evidence of identity and our weakest of whether something still holds; a staff directory is close to the reverse, strong on official title, participation, and type, weak on identifying a specific human. Ranking them on one scale throws away whichever strength loses.

The likely shape is a per-source profile of weights across a few fact classes — identity, participation, title, currency — with currency decaying faster for self-reported sources than for organizational ones.

Deliberately unresolved. Seeding runs on one source type ([contracts/claim-schema.md](contracts/claim-schema.md)), where relative weighting has nothing to do, and the model cannot be designed honestly against a single source.

*Forces an answer:* the first batch from a second source type that contradicts the seed.
*Touches:* [architecture/ingest.md](architecture/ingest.md), [contracts/claim-schema.md](contracts/claim-schema.md)

### Q-11 — Does a chart distinguish absence from non-observation?

Seed coverage is uneven by construction: profile-sourced data favours people who keep a profile current, which skews toward marketing and digital and away from facilities, retail, and long-tenured operations. A chart drawn from it looks equally confident everywhere.

An empty function might mean the organization has nobody in it, or that this source never saw them. Those are different facts and the surface currently cannot tell them apart, which matters most for the gap analysis in [product/vision.md](product/vision.md) — "you know 3 of 6" is misleading if the denominator is really "6 that we happened to see."

*Forces an answer:* the first org chart or coverage surface shown to a user.
*Touches:* [product/vision.md](product/vision.md), [architecture/ontology-title.md](architecture/ontology-title.md)
