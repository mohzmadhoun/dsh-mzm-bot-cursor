# Contract: Persona profile (job / voice / anti-jobs)

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-001, FR-002, FR-003, FR-013 · SC-001, SC-002, SC-008 · US1

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Edit job / voice | Existing Bot + text (may be empty) | Values retained on profile after save |
| Edit anti-jobs | Existing Bot + ≥0 short text items | Persist on profile; visible on bot overview when non-empty |
| Re-edit after save | Updated fields | Prior values replaced on profile and overview |
| Subsequent turn | Bot with saved non-empty persona fields | Fields applied as that bot’s instructions (wiring-observable) |

## Host obligations

- Persist persona profile with the Bot across restart/reload.
- Project anti-jobs onto Bot overview without requiring a separate hidden editor for Verifier observation.
- After save, bind non-empty job / voice / anti-jobs into the bot’s instruction assembly for subsequent turns (persona / system-prompt seam or equivalent).
- Electron Main MUST NOT own persona storage.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Durability | SC-001 — job, voice, ≥1 anti-job survive restart/reload |
| Overview | SC-002 — anti-jobs visible on overview |
| Instruction bind | SC-008 — saved non-empty fields present in instruction/prompt assembly; **do not** score LLM reply wording |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Save interrupted / Host unavailable | Clear failure; prior durable values unchanged |
| Empty persona fields | Allowed; contribute no instruction text |

## Non-goals

LLM reply-adherence proofs; skills library; memory UX; changing P1 model-assignment rules.
