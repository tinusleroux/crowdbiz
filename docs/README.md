---
status: canonical
updated: 2026-08-29
---

# Documentation map and authority model

This repository is currently a set of documents that constrain a system not yet built. The documents are meant to be **correct and binding**, not descriptive. That only works if authority and change process are explicit.

Agents and humans follow the same rules. The short version lives in [../AGENTS.md](../AGENTS.md).

---

## Authority order

When two sources disagree, the higher one wins.

| Level | Location | Weight |
| --- | --- | --- |
| 1 | [decisions/](decisions/) — **accepted** ADRs | Binding. Latest accepted wins. |
| 2 | [product/](product/), [architecture/](architecture/), [contracts/](contracts/) | Canonical. Explains and elaborates ADRs. |
| 3 | [open-questions.md](open-questions.md) | Not binding. Marks known uncertainty. |
| 4 | [brainstorm/](brainstorm/) | Frozen history. Never truth. |

A canonical doc that contradicts an accepted ADR is a **bug in the doc**. The ADR stands; fix the doc in the same change.

An ADR with status `Open` is not binding either — it records that a decision is being made and what the options are.

---

## The tree

```
AGENTS.md                     working contract for humans and agents
docs/
  README.md                   this file
  glossary.md                 canonical vocabulary and banned words
  open-questions.md           unresolved items that are not yet ADRs
  product/
    vision.md                 what we are building and why
  architecture/
    ontology-core.md          objects, edges, types, rules
    ontology-title.md         function, seniority, structural depth
    ingest.md                 producer boundary; validate -> resolve -> interpret
  contracts/
    claim-schema.md           the CSV claim contract (draft)
  decisions/
    README.md                 index of every ADR
    _template.md              ADR template
    NNNN-*.md                 individual ADRs
  brainstorm/                 frozen pre-decision drafts
.cursor/rules/                thin auto-attached rules that point back here
```

---

## Frontmatter

Every document starts with frontmatter.

```yaml
---
status: canonical | draft | archived
updated: YYYY-MM-DD
decided_by: [0001, 0002]     # canonical docs only: ADRs this doc depends on
---
```

- `status: canonical` — binding at level 2; kept true
- `status: draft` — being worked out; may be wrong; say so in the body
- `status: archived` — frozen; never edited
- `updated` — bump when substance changes, not for typos
- `decided_by` — lets a reader jump from an explanation to the decision that fixed it

ADRs use a different, richer frontmatter — see [decisions/_template.md](decisions/_template.md).

---

## How to change things

**Routing rule.** If the answer changes the **data model**, the **claim contract**, the **product boundary**, or the **stack**, it is an ADR. Everything else that is unresolved goes to [open-questions.md](open-questions.md).

### To make or change a binding decision

1. Copy [decisions/_template.md](decisions/_template.md) to `decisions/NNNN-short-slug.md` using the next free number.
2. Write it with real context and consequences. `Open` status is legitimate — record the options and trade-offs before choosing.
3. Add a row to [decisions/README.md](decisions/README.md).
4. Update every canonical doc the decision touches, in the same change.
5. To reverse a decision, write a new ADR that supersedes it. Do not rewrite history: set the old ADR's status to `Superseded` and link forward.

### To record uncertainty

Add a `Q-NN` row to [open-questions.md](open-questions.md) with what is unclear and what would force an answer. Promote to an ADR when it becomes consequential.

### To improve an explanation

Edit the canonical doc, bump `updated`. If you find yourself adding a *rule* rather than an explanation, stop — that is an ADR.

---

## Writing rules

- **One place per fact.** Link rather than restate. Duplication is how these documents rot.
- **Say what is decided, not what is being considered.** Considerations belong in the ADR that settled it.
- **Do not invent certainty.** Unknown is a valid answer; a confident wrong answer is worse than an open question.
- **Ontology nouns are exact.** See [glossary.md](glossary.md).
- **Never edit [brainstorm/](brainstorm/).**
