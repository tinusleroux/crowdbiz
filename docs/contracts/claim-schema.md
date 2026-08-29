---
status: draft
updated: 2026-08-29
decided_by: [0002, 0003, 0004, 0010, 0013]
---

# Claim contract — batch CSV

> **Draft, but no longer blocked.** Identity is settled by [ADR-0010](../decisions/0010-person-identity-without-pii.md), so this can now be built against. It stays `draft` because no batch of real data has been run through it yet — the remaining risk is validation, not an unresolved decision. A successful pilot batch moves it to `canonical`.

The only way facts enter the map ([ingest.md](../architecture/ingest.md)). Producers emit batches that satisfy this contract; ingest validates, resolves, and interprets them. Producers may live in this repository, but this contract is the only write path into the claim zone ([ADR-0015](../decisions/0015-producers-live-here.md)).

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
| `source_type` | yes | `staff_directory`, `press_release`, `org_website`, `filing`, `manual_research`, `profile_self_report`, `user_correction`, `self_assertion`, `identity_assertion`, `other` |
| `observed_at` | yes | ISO date the source was observed or published. Drives recency in resolve. |
| `confidence` | no | Producer's own confidence, `high` / `medium` / `low`. A hint, not a verdict. |
| `notes` | no | Free text for a human reviewer. Never parsed. |

`profile_self_report` and `self_assertion` are both the person speaking about themselves, and they are deliberately separate. `self_assertion` is a verified user stating their own history inside this product, at a known moment. `profile_self_report` is that same person's assertion observed on a public professional profile — unverified, and last touched whenever they last bothered. Label the source honestly and let resolve decide what each is worth; the distinction is what allows a later, better-sourced claim to supersede seed data rather than merely contradict it.

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
| `public_profile_id` | no | The platform's own opaque identifier for that profile, where one exists. Send it alongside the URL, never instead of it. |

Where a platform exposes both a vanity URL and an opaque identifier, they are not interchangeable. A vanity slug is chosen by the person and can change at any time; the opaque identifier survives that change. Sending only the vanity form means a later re-run of the same source produces rows that no longer match the earlier ones — the same human arriving as a stranger. Neither is a key ([ADR-0010](../decisions/0010-person-identity-without-pii.md)); the opaque form is simply the more durable evidence.

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

**A note on sources.** Public professional profiles are the expected seeding source, and they are good enough to seed with. The industry already treats a person's own profile as the fact of where they work; a map built from the same material, organized and comparable, is not less accurate than the status quo it improves on.

Two things about profile data are true and neither disqualifies it. It over-reports current tenure, because people update a profile promptly on arrival and slowly on departure — so it is strong evidence of a start and weaker evidence of a continuation. And it is uneven, favouring people who keep a profile current, which skews toward marketing, digital, and newer staff and away from facilities, retail, and long-tenured operations.

Scope the scrape to one organization and curate it, and both are manageable. Scope it broadly and you get an association list rather than a staff list — students, alumni, fans, and unrelated employers — which is a batch nobody can salvage.

Staff directories remain the better input where they exist, carrying official titles and implied grouping. They are a supersedent, not a prerequisite: seed from profiles now, and let directories overwrite that seed as they arrive.

[producer-profile-scrape.md](producer-profile-scrape.md) works this through for a single-organization scrape — collection scope, the curation pass, and field-by-field mapping.

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
2. **Do not collect on-field roles.** Players, coaches, scouts, player personnel, athletic training, equipment, and game-film video are out of scope ([ADR-0013](../decisions/0013-on-field-roles-out-of-scope.md)). If a few slip through from a mixed source such as a full staff directory, they are classified and filtered rather than rejected — but do not go looking for them, and never send a roster.
3. **Never guess reporting.** An org chart position on a page is not a reporting line. Omit rather than invent.
4. **Absence is not falsity.** A missing end date means unknown, not ongoing.
5. **Corrections are new claims.** Re-emit with a new `claim_id` and a current `observed_at`. Nothing is deleted.
6. **Stable references matter more than pretty ones.** `org_ref` and `person_ref` must mean the same thing across batches.
7. **One source per row.** If two sources agree, send two rows and let corroboration do its work.
8. **A title must be a title.** A company name, a university, "Student", or a hedge such as "not specified" is not a title. If the source does not give a role, omit the row rather than filling the field with something else.
9. **Scope a profile scrape to one organization.** One org per batch is curatable; a broad sweep across many is not.
10. **A self-described association is not always an affiliation.** Some people list a connection to an organization that is not participation in its work — a Green Bay Packers shareholder is a fan who bought a share, not a member of the front office. Season-ticket holders, alumni, volunteers, and supporters are the same shape. Where the title itself gives this away, drop the row.
11. **Name fields carry names.** Professional credentials — `MBA`, `CPA`, `JD` — belong nowhere in a surname, because they corrupt the name matching identity resolution depends on. Generational suffixes such as `Jr` are part of the name and stay.
12. **An automated collection run is provenance, so use it.** Set `observed_at` to the run timestamp rather than today's date, record the collector and run identifier in the manifest so the batch is reproducible, and derive `claim_id` deterministically from that run plus the source's own stable identifier. Re-importing that batch is then idempotent, because the same rows carry the same `claim_id`. A *later* run is different: it observes the same facts again on a new date and legitimately produces new claims, which is corroboration rather than duplication.
13. **Never collect a contact channel, even when the source offers one.** Validation rejects the batch ([ADR-0004](../decisions/0004-no-pii.md)), so configure the collector not to request those fields in the first place.

---

## Open before this can leave draft

- A pilot batch of real data has been imported successfully — the intended pilot is a curated single-org profile scrape, re-emitted with full provenance
- `department_raw` handling — Q-01 in [../open-questions.md](../open-questions.md)
- Whether producers may assert an interval for `reports_to` — Q-03
- Batch size limits, file encoding, and rejection report format
