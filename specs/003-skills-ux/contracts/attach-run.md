# Contract: Attach / run skill on a bot

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-003, FR-004, FR-005, FR-014 · SC-002, SC-006, SC-007 · US2 · FR-012 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Attach | Bot + available skill | Skill shown on **that bot’s** skills/overview surface |
| Attach to A only | Skill attached to bot A | Bot B does not show attachment solely because of A |
| Multi-attach | Second skill on same bot | Both may coexist; Pass still only requires ≥1 |
| Run | Attached skill on bot | Dedicated run control **or** session apply shows run/active UI |
| Restart | After attach | Attachment remains; run history not required |

## Host obligations

- Persist per-bot skill attachments across restart/reload.
- After attach, bind attached skill instructional content into that bot’s instruction assembly for subsequent turns (persona/system-prompt seam or equivalent).
- Project run/active observability for Client (control result and/or session-active flag).
- Electron Main MUST NOT own attachment storage.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Attach + run | SC-002 — attach visible on bot surface; run/active shown; attachment survives reload |
| Per-bot | SC-006 — A’s attachment does not imply B’s |
| Instruction bind | SC-007 — attached instructional text present in instruction/prompt assembly; **do not** score LLM reply wording |
| Visual evidence | FR-012 — desktop screenshot(s) and/or short screen recording under `verifier/evidence/` |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Attach while Host unavailable | Clear failure; prior attachments unchanged |
| Only global catalog shows skill (no per-bot surface) | Fail SC-002 |

## Non-goals

Detach-as-Pass-gate; LLM reply-adherence proofs; plugin skills; rewriting P2 persona field rules.
