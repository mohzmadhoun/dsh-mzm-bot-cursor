# Contract: Recall (surface + model-visible)

**Owners:** DH Runtime (Desktop Host Memory catalog + instruction/context inject) · DH Client/Web (browse/recall UI)
**Acceptance:** Spec FR-005, FR-014, FR-016 · SC-004 · US4 · FR-011/012 visual evidence

## User-visible / Verifier-observable operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Restart / durable reload | Prior profile + log + note saves | Host catalog still holds the three facts |
| Surface browse / recall | Open memory surface after restart | Same three facts returned; kinds distinguishable |
| Model-visible path | Subsequent bot turn on a bot that should see ≥1 fact | Host injects ≥1 curated fact into turn context/instructions; Verifier observes path (not LLM wording) |

## Host obligations

- Durably persist catalog across Host child restart (FR-004).
- Project recall list over authenticated Host HTTP/WS.
- Provide **one** model-visible recall path via Host context/instruction injection (cheapest; sibling to persona/skill binds — research R5).
- Any injected fact MUST be reconstructable from the **session log** (model-visible ⟺ logged).
- MUST NOT treat full transcript dump as curated recall Pass.
- Proving specific LLM reply wording is NOT required (FR-014).

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Surface return of three kinds | SC-004 — profile, log, note present with kinds distinguishable |
| Model-visible path | SC-004 — ≥1 curated fact made available to a subsequent turn |
| LLM wording | Not scored |
| Visual evidence | FR-011/012 — post-restart surface (and inject indicator when present) |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Surface-only without model-visible path | Fail FR-016 / SC-004 |
| Recall = transcript only | Fail |
| Unit/jsdom-only evidence | GUI scenario Fail |

## Non-goals

Semantic ranking quality beyond “written fact is returned”; requiring bot to paraphrase the fact in chat; edit/delete UX.
