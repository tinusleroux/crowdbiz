# Ontology vocabulary

The controlled vocabularies that turn a raw title into comparable structure.

| File | What it fixes |
| --- | --- |
| [functions.v2.yaml](functions.v2.yaml) | Which domain of crowd-business work an affiliation belongs to |
| [seniority.v1.yaml](seniority.v1.yaml) | How senior it is, on an ordered scale ([ADR-0014](../docs/decisions/0014-seniority-scale.md)) |

These are **data, not code**, and they are versioned. The principles they must satisfy are in [ontology-title.md](../docs/architecture/ontology-title.md); the vocabularies themselves elaborate rather than override it.

## Rules

**Slugs are the contract.** Rename a label whenever it reads better. Never reuse a slug for a different meaning, and never delete one that derived rows point at.

**Version, do not edit in place.** When categories or rules change, publish a new version and record the ontology version on derived structure, so historical charts stay interpretable and rebuilds are intentional.

**Matching method is not specified here.** Regex, embeddings, a model, or human review are all permitted, and none of them is the ontology. A model may propose a function; it does not become one.

**Unknown is a real answer.** Both vocabularies carry an explicit unresolved value. Prefer it over a confident wrong classification — silence must never look like certainty.

## Version history

`functions.v1.yaml` is kept because slugs must stay resolvable, not because it is current. Read v2.

**v1** — derived from 136 real front-office titles at one NFL club, stress-tested against 490 titles from clubs not used in the derivation.

**v2** — the first vendor batch broke it, which is what [ADR-0007](../docs/decisions/0007-one-ontology-across-org-types.md) needed testing against. Half the vendor's titles had no home, and the half that did included a salesperson filed under finance. Added `product`, `client_success`, and `professional_services`; widened `partnerships` to cover business-to-business selling generally. No slug changed meaning and no title lost a function it had already resolved to.

Both vocabularies are `draft` until they have run over a real imported batch — which cannot happen until the platform can import one.
