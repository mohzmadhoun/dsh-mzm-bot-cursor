# Contract: Discover / load skills

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-001, FR-002 · SC-001 · US1 · FR-012 visual evidence

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Open discovery/library | Desktop app running | Thin pack managed skill listed with human-readable name |
| Load / available-to-attach | Listed skill | Skill available to attach; separate multi-step load ritual not required |
| Reopen / restart | Prior available skill | Managed pack still listed; user skills remain if authored |

## Host obligations

- Mount thin managed pack + user-authored skills into the Host skill catalog (`ctx.skills` family).
- Project catalog to Client (skills/list Remote or equivalent).
- Electron Main MUST NOT own the skill catalog store.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Discover | SC-001 — ≥1 managed skill (exactly one thin-pack skill) visible in Desktop UI |
| Load | Making skill available to attach succeeds; survives restart/reload |
| Visual evidence | FR-012 — desktop screenshot(s) and/or short screen recording under `verifier/evidence/` |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Host catalog unavailable | Clear user-visible failure; no silent empty “success” |
| Unit/jsdom-only evidence | GUI scenario Fail |

## Non-goals

Full managed catalog; plugin skills; learn-from-demonstration; separate load-wizard ritual.
