# Contract: Skill authoring

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-006, FR-007, FR-013 · SC-003 · US3 · FR-012 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Create + save | Non-empty display name + non-empty instructional body | Skill persisted; appears in discovery as user-authored |
| Save with empty name or body | Incomplete draft | Save **rejected**; clear user-visible reason; not listed as saved |
| Edit + save | Updated non-empty fields | Values replace prior on reopen and in discovery |
| Attach authored skill | Saved user skill + bot | Attach/run same Pass rules as managed (US3) |

## Host obligations

- Persist user-authored skills Host-durably (user skill root / filesystem provider or equivalent).
- Enforce non-empty name + body at save boundary (FR-013).
- Electron Main MUST NOT own user skill storage.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Happy path | SC-003 — author non-empty skill; appears in discovery |
| Reject empty | Attempt empty name or body → reject with clear reason |
| Visual evidence | FR-012 — desktop screenshot(s) and/or short screen recording under `verifier/evidence/` |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Empty name or body on save | Reject; no durable discoverable skill |
| Host unavailable on save | Clear failure; no partial silent success |

## Non-goals

Learn-from-demonstration; plugin-authored skills; detach/delete as Pass gate.
