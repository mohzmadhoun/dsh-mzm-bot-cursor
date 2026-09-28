# Contract: Agent vs user memory layers

**Owners:** DH Runtime (Host Memory catalog) · DH Client/Web (layer-distinguishable UI) · DH Spec (ADR honesty)
**Acceptance:** Spec FR-006, FR-007, FR-017 · SC-005, SC-010 · US5 · ADR `MzM-Docs/adr/agent-vs-user-memory-layers.md` · FR-011/012 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Save agent-scoped fact on bot A | Non-empty content; layer=`agent`; bot A | Fact owned by A’s agent memory |
| View bot B agent memory | Bot B context | A’s agent fact NOT listed as B’s agent memory solely because A saved it |
| Save user-scoped fact | Non-empty content; layer=`user` | Same fact available in bot A and bot B contexts |
| Restart / recall | Prior agent + user saves | Layer isolation and user sharing still hold |
| Write any kind on either layer | profile/log/note × agent/user | Allowed — kinds orthogonal to layers |

## Host obligations

- Persist `layer` on every `MemoryRecord`; key agent rows by `botId`; user rows account-wide (research R2).
- Project layer distinction to Client; do not collapse layers into one undifferentiated store.
- Honor ADR without layer-model rewrite.
- MUST NOT treat transcript as either curated layer.
- MUST NOT introduce kind→layer locks as Pass requirements (FR-017 / SC-010).

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Agent isolation | SC-005 — A’s agent fact not B’s agent memory |
| User sharing | SC-005 — user fact across bots after save + restart/recall |
| Orthogonality | SC-010 — no kind→layer lock required |
| Visual evidence | FR-011/012 |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Single undifferentiated memory store as SoT | Fail ADR / FR-006 |
| Requiring profile-only-on-user for Pass | Fail SC-010 |
| Unit/jsdom-only evidence | GUI scenario Fail |

## Non-goals

Rewriting the ADR; Grok chrome for layer UX; requiring all three kinds on both layers for Pass (Pass needs all three kinds total + ≥1 agent + ≥1 user fact).
