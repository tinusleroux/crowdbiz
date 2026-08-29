---
status: draft
updated: 2026-08-29
decided_by: [0002, 0003, 0004, 0010]
---

# Claim contract — batch CSV

> **Draft, but no longer blocked.** Identity is settled by [ADR-0010](../decisions/0010-person-identity-without-pii.md), so this can now be built against. It stays `draft` because no batch of real data has been run through it yet — the remaining risk is validation, not an unresolved decision. A successful pilot batch moves it to `canonical`.

The only way facts enter the map ([ingest.md](../architecture/ingest.md)). Producers emit files that satisfy this contract; this repository validates, resolves, and interprets them ([ADR-0003](../decisions/0003-collection-outside-this-repo.md)).

Storage-neutral by design: this describes a file format, not a table. The datastore is open ([ADR-0009](../decisions/0009-stack-and-datastore.md)).

---

## Shape

A batch is a directory of CSV files plus a manifest. Four claim files, each optional:

```
batch-2026-08-29-nfl-seed/
  manifest.json
  organizations.csv
  persons.csv
  affiliations.csv
  relationships.csv
```

The manifest identifies the producer, the batch, the generation timestamp, and a note on collection method. A batch is validated and accepted or rejected as a unit.

---

## Universal columns

Every claim row carries provenance. A row without it is invalid.

| Column | Required | Notes |
| --- | --- | --- |
| `claim_id` | yes | Unique within the producer, stable across re-imports. Makes import idempotent. |
| `source_url` | yes | Where the assertion came from. Use a stable identifier if not a URL. |
| `source_type` | yes | `staff_directory`, `press_release`, `org_website`, `filing`, `manual_research`, `user_correction`, `self_assertion`, `identity_assertion`, `other` |
| `observed_at` | yes | ISO date the source was observed or published. Drives recency in resolve. |
| `confidence` | no | Producer's own confidence, `high` / `medium` / `low`. A hint, not a verdict. |
| `notes` | no | Free text for a human reviewer. Never parsed. |

---

## organizations.csv

| Column | Required | Notes |
| --- | --- | --- |
| `org_ref` | yes | Producer's stable reference for this organization within the batch and across its batches |
| `name` | yes | As sourced |
| `org_type` | yes | `team`, `venue`, `vendor`, `agency`, `sponsor`, `league`, `association`, `other` |
| `website` | no | Organizational, not personal |
| `parent_org_ref` | no | For a subsidiary or operating entity, where observed |
| `location` | no | City or region, organizational only |

---

## persons.csv

A person row is **evidence toward identity, not an identity verdict**. The durable person identifier is an internal UID assigned during resolve; nothing a producer sends becomes that UID ([ADR-0010](../decisions/0010-person-identity-without-pii.md)).

| Column | Required | Notes |
| --- | --- | --- |
| `person_ref` | yes | Producer's stable reference, used to link rows within and across that producer's batches. Strong evidence during resolve, never authority. |
| `full_name` | yes | As sourced |
| `known_as` | no | Nickname or alternate form when the source shows one. Materially improves matching. |
| `public_profile_url` | no | Professional profile page. Weighted evidence, **not** a key, and **not** a contact channel. |

The more evidence a producer sends, the better resolution gets — but a producer is never required to decide whether two of its rows are the same human. Send both; let resolve cluster them.

**Forbidden columns.** Any of these fails the batch: email, phone, personal address, date of birth, government identifiers, or any private contact channel ([ADR-0004](../decisions/0004-no-pii.md)). Validation rejects rather than ignores them.

---

## affiliations.csv

The core file. One row asserts that a person participated in an organization.

| Column | Required | Notes |
| --- | --- | --- |
| `person_ref` | yes | Resolves against `persons.csv` |
| `org_ref` | yes | Resolves against `organizations.csv` |
| `raw_title` | yes | Exactly as sourced. Never normalized by the producer. |
| `affiliation_type` | yes | `employed`, `contracted`, `advising`, `board`, `ownership`, `other` ([ontology-core.md](../architecture/ontology-core.md)) |
| `start_date` | no | ISO date, or year or month alone. Send the precision the source gave — do not pad a year to January 1st. |
| `end_date` | no | Omit for ongoing. Absence means unknown, not current. |
| `as_of` | yes | The date this participation was observed to hold. Required when start and end are unknown, which is the common case. |
| `reports_to_person_ref` | no | Observed reporting only. Never inferred by the producer. |
| `department_raw` | no | Department string as printed. See Q-01 — its handling is unresolved. |

**Not accepted here:** `function`, `seniority`, or any normalized rank. Those are derived after resolve ([ADR-0002](../decisions/0002-claims-before-interpretation.md)). A producer sending them fails validation.

---

## relationships.csv

| Column | Required | Notes |
| --- | --- | --- |
| `from_org_ref` | yes | |
| `to_org_ref` | yes | |
| `relationship_type` | yes | `agency_of_record`, `sponsors`, `supplies`, `engaged_at`, `partners_with`, `other` |
| `on_behalf_of_org_ref` | no | Optional context, typically for `engaged_at` |
| `start_date` | no | |
| `end_date` | no | |
| `as_of` | yes | |

---

## Rules for producers

1. **Report, do not interpret.** Send what the source said. Classification happens here.
2. **Never guess reporting.** An org chart position on a page is not a reporting line. Omit rather than invent.
3. **Absence is not falsity.** A missing end date means unknown, not ongoing.
4. **Corrections are new claims.** Re-emit with a new `claim_id` and a current `observed_at`. Nothing is deleted.
5. **Stable references matter more than pretty ones.** `org_ref` and `person_ref` must mean the same thing across batches.
6. **One source per row.** If two sources agree, send two rows and let corroboration do its work.

---

## Open before this can leave draft

- A pilot batch of real data has been imported successfully
- `department_raw` handling — Q-01 in [../open-questions.md](../open-questions.md)
- Whether producers may assert an interval for `reports_to` — Q-03
- Batch size limits, file encoding, and rejection report format
