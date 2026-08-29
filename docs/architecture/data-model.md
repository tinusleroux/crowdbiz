---
status: draft
updated: 2026-08-29
decided_by: [0009, 0010, 0012]
---

# Data model sketch

> **Non-binding.** This is a working sketch, not a decision. Table shapes are interior detail and may change freely as code is written — no ADR required. What *is* binding lives in [ADR-0009](../decisions/0009-stack-and-datastore.md): Postgres as system of record, three physically separated zones, and a derived zone rebuildable from claims. Change this document whenever the code disagrees with it.

---

## Zones

Three schemas, separated so that decisions hold by construction rather than by discipline.

```
claim.*      append-only observations        never updated, never deleted
core.*       derived structure               droppable and rebuildable
overlay.*    consent-scoped social data      separate access path
```

Chart-building queries run under a role with no reach into `overlay`, which is how [ADR-0008](../decisions/0008-knows-overlay-separate.md) is enforced.

---

## claim — what a source said

Deliberately flat. A claim records an observation as presented, not a model of the world; normalization happens downstream. A staff directory row genuinely is "this name, this title, this organization, seen on this date," so that is the grain.

**`claim.batch`** — one import. Producer, generated timestamp, collection notes, accepted or rejected as a unit.

**`claim.affiliation_observation`** — the dominant claim type, carrying person and organization evidence inline:

- provenance: `claim_id`, `batch_id`, `source_url`, `source_type`, `observed_at`, `ingested_at`
- person evidence: `person_ref`, `full_name`, `known_as`, `public_profile_url`, `public_profile_id`
- organization evidence: `org_ref`, `org_name`
- the assertion: `raw_title`, `affiliation_type`, `department_raw`
- time: `start_date`, `end_date`, `as_of`, plus precision markers (see below)
- optional: `reports_to_person_ref`

**`claim.organization_observation`** — name, type, website, parent reference, location.

**`claim.relationship_observation`** — from and to organization references, relationship type, on-behalf-of, dates.

**`claim.identity_assertion`** — `same_as` and `not_same_as` between two person references or UIDs, with source and date. Human validators and research agents write here ([ADR-0012](../decisions/0012-identity-survives-reclustering.md)). These are the anchors clustering must respect.

Nothing in this zone carries `function` or `seniority`. A producer sending them fails validation ([ADR-0002](../decisions/0002-claims-before-interpretation.md)).

### Date precision

Sources say "2019" or "since March." Storing that as `2019-01-01` invents precision the source never had, and every downstream interval comparison inherits the lie. Carry an explicit granularity — year, month, or day — alongside each date, and let interval logic degrade honestly.

Most claims have no interval at all, only `as_of`. A resolved affiliation's interval is therefore *inferred* from a set of point observations plus whatever bounds were asserted.

---

## core — what we believe

**`core.person`** — remarkably thin, because everything else is recomputable: `person_uid`, `created_at`, `status`, `redirect_to` for retired UIDs, `cluster_version`. Even the display name is a derived choice among claimed name forms.

**`core.person_claim_membership`** — the actual output of resolution: which claims form this person, with confidence and resolver version. This *is* the identity fingerprint; there is nothing to denormalize because a person is its claim set.

**`core.person_match_signature`** — a derived blocking index so candidate generation is not quadratic: normalized name tokens, organization set, date span, profile URL hash. Rebuilt with the clustering. Purely a performance artifact.

**`core.organization`** — resolved organizations, same clustering logic, far easier.

**`core.affiliation`** — resolved participation: `person_uid`, `org_id`, `affiliation_type`, the inferred interval with its precision, the chosen `raw_title`, plus derived `function`, `seniority`, `confidence`, and `ontology_version`.

**`core.affiliation_claim_support`** — which claims justify this affiliation, so the UI can answer "how do we know this?"

**`core.reports_to`** — affiliation to affiliation, never person to person. Interval defaults to the overlap of the two affiliations unless a producer asserted otherwise (Q-03).

**`core.relationship`** — resolved organization-to-organization links.

**`core.conflict`** — recorded disagreements where neither claim wins. A first-class state, queryable and displayable, not an error log.

### The rebuild test

Drop `core` entirely, replay `claim`, and get the same graph. This runs in CI. If a fact cannot survive that, it is being asserted rather than derived and belongs on the claim side.

---

## overlay — consent-scoped

**`overlay.network_upload`** — who uploaded, when, current visibility.

**`overlay.knows_edge`** — owner, the two person UIDs, visibility. Revocable, and revoking it must leave the shared map undamaged.

---

## Read paths

**Org chart** — filter `core.affiliation` by organization and as-of date, group by `function`, order by `seniority`. A few hundred rows. Optionally materialized as a cache keyed by organization, as-of date, and ontology version — one projection table, never a table per organization.

**Structural depth** — recursive CTE up `core.reports_to` to the apex. Two to six levels.

**Overlay and warm paths** — join a viewer's `overlay.knows_edge` against resolved affiliations. Shallow by design, since a third-degree introduction is not warm.

All traversal sits behind a narrow read layer so that a future derived projection is a contained change ([ADR-0009](../decisions/0009-stack-and-datastore.md)).

---

## Open

- `department_raw` handling — Q-01
- `reports_to` interval assertion — Q-03
- Function vocabulary and seniority scale as data or code — Q-09
