# Phase 2 Verifier — explicit non-goals

**Owners:** DH Verifier (absence checks) · DH Client (upload omission) · DH Runtime (Host preset-only avatar)
**Status:** Partial — image-upload absence noted with Client T024; remaining rows complete under T040
**Linear:** [MOH-123](https://linear.app/momadhoun/issue/MOH-123) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Clarify lock 3:** Avatar Pass = preset shape and/or color markers only

## Absence checklist

| Non-goal | Pass bar (must **not** be required) | Status |
|----------|-------------------------------------|--------|
| Image-file / URL avatar upload | Preset marker path alone suffices for SC-003; upload UI absent or gated without blocking Pass | **measured** — Client `TeamAction` avatar editor (`data-team-avatar-editor`) ships preset shape/color chips only; no `input[type=file]`, no upload control (T024) |
| Skills library (P3) | Not a Phase 2 Pass gate | Deferred to T040 |
| Memory product UX (P5) | Not a Phase 2 Pass gate | Deferred to T040 |
| Transcript / mailbox wipe as delete Pass gate | Clarify lock 5 — identity removal alone | Deferred to T040 / Scenario 4 |
| P1 topology / mailbox / auth re-litigation | Foundational Pass already stamped | Deferred to T040 |
| Grok chrome parity | Not required | Deferred to T040 |

## Image upload (T024)

- Host `AvatarMarker` accepts only preset `shape` / `color` ids; no image-file or URL fields.
- Client rename/avatar UI (**T023**) must not introduce an upload path that Verifiers treat as a Pass prerequisite.
- If a future surface adds custom image upload, it remains out of Phase 2 Pass scope and MUST NOT block preset-marker Scenario 2.

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/rename-avatar.md](../contracts/rename-avatar.md) | Contract non-goals |
| [scenario-2-rename-avatar.md](./scenario-2-rename-avatar.md) | SC-003 recipe (upload not required) |
| T023 / T024 | Client picker + upload omission |
| T040 | Complete remaining absence rows |
