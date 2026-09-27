# Phase 2 Verifier — explicit non-goals

**Owners:** DH Verifier (absence checks) · DH Client (upload omission) · DH Runtime (Host preset-only avatar)
**Status:** Partial — image-upload (T024) + memory product UX (T038) asserted; remaining rows complete under T040
**Linear:** [MOH-123](https://linear.app/momadhoun/issue/MOH-123) · T038 [MOH-137](https://linear.app/momadhoun/issue/MOH-137) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Clarify lock 3:** Avatar Pass = preset shape and/or color markers only
**Clarify lock 2 / FR-010:** Memory ADR only in P2; no memory productization UX for Pass

## Absence checklist

| Non-goal | Pass bar (must **not** be required) | Status |
|----------|-------------------------------------|--------|
| Image-file / URL avatar upload | Preset marker path alone suffices for SC-003; upload UI absent or gated without blocking Pass | **measured** — Client `TeamAction` avatar editor (`data-team-avatar-editor`) ships preset shape/color chips only; no `input[type=file]`, no upload control (T024) |
| Skills library (P3) | Not a Phase 2 Pass gate | Deferred to T040 |
| Memory product UX (P5) | Not a Phase 2 Pass gate — no profile/log/note authoring or recall product flow required for SC-006 / FR-010 | **measured** — T038; see [Memory product UX (T038)](#memory-product-ux-t038) |
| Transcript / mailbox wipe as delete Pass gate | Clarify lock 5 — identity removal alone | Deferred to T040 / Scenario 4 |
| P1 topology / mailbox / auth re-litigation | Foundational Pass already stamped | Deferred to T040 |
| Grok chrome parity | Not required | Deferred to T040 |

## Image upload (T024)

- Host `AvatarMarker` accepts only preset `shape` / `color` ids; no image-file or URL fields.
- Client rename/avatar UI (**T023**) must not introduce an upload path that Verifiers treat as a Pass prerequisite.
- If a future surface adds custom image upload, it remains out of Phase 2 Pass scope and MUST NOT block preset-marker Scenario 2.

## Memory product UX (T038)

**Acceptance:** FR-010 · SC-006 · [scenario-5-memory-adr.md](./scenario-5-memory-adr.md) Step B · contract [memory-layers-adr.md](../contracts/memory-layers-adr.md)

Phase 2 Pass MUST NOT require memory productization UX:

- No memory **profile** authoring product flow
- No memory **log** / journal product flow as a Pass gate
- No memory **note** authoring product flow
- No memory **recall** product flow required for Done (P5 owns productization)

**Spot-check (Team / identity Client — tip used for T038):**

| Surface | Observation | Claim |
|---------|---------------|-------|
| `packages/experimental/client-ui-agent-team` Client sources | No memory profile/log/note authoring or recall **product** controls in Team Action / handoff UI | **measured** — package Client tree has no memory-product strings or controls (README "Dev Note" anchors only) |
| SC-006 Pass criteria | File presence + ADR non-goal statement; **no** recall demo | **measured** — [scenario-5-memory-adr.md](./scenario-5-memory-adr.md) + contract |
| Harness session-reference `recall` nodes in chat | Out of scope for this non-goal (context projection ≠ P5 memory productization) | **inferred** — do not Fail FR-010 solely because chat recall UI exists |

**Rerun:**

```sh
# Expect no memory-product UX hits in Team identity Client sources.
! rg -i 'memory (profile|log|note)|recall product|MemoryProfile' \
  packages/experimental/client-ui-agent-team/src
```

If a future surface adds memory profile/log/note/recall product UX, it remains out of Phase 2 Pass scope and MUST NOT block SC-006 once the ADR (T036) is present.

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/rename-avatar.md](../contracts/rename-avatar.md) | Contract non-goals (avatar) |
| [../contracts/memory-layers-adr.md](../contracts/memory-layers-adr.md) | Contract non-goals (memory ADR / no UX) |
| [scenario-2-rename-avatar.md](./scenario-2-rename-avatar.md) | SC-003 recipe (upload not required) |
| [scenario-5-memory-adr.md](./scenario-5-memory-adr.md) | SC-006 recipe (presence + non-goal; no recall demo) |
| T023 / T024 | Client picker + upload omission |
| T037 / T038 | Scenario 5 recipe + memory UX absence |
| T040 | Complete remaining absence rows |
