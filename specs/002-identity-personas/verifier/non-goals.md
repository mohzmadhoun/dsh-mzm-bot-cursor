# Phase 2 Verifier — explicit non-goals

**Owners:** DH Verifier (absence checks) · DH Client (upload omission) · DH Runtime (Host preset-only avatar)
**Status:** Complete — T024 / T038 / T040 rows asserted (docs-only; not a product SC stamp)
**Linear:** [MOH-123](https://linear.app/momadhoun/issue/MOH-123) · T038 [MOH-137](https://linear.app/momadhoun/issue/MOH-137) · T040 [MOH-139](https://linear.app/momadhoun/issue/MOH-139) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Clarify lock 3:** Avatar Pass = preset shape and/or color markers only
**Clarify lock 2 / FR-010:** Memory ADR only in P2; no memory productization UX for Pass
**Clarify lock 5:** Delete Pass = identity removal only; transcript/mailbox wipe is not a Pass gate

## Global Pass / Fail (T040)

**Pass** when every checklist row below holds and no Scenario 1–6 (SC-001…SC-008) recipe **requires** an Out of Scope surface to Pass.

**Fail** T040 (and reopen the owning FR / Scenario) if any of:

- A Phase 2 product Scenario Pass begins requiring skills library UX, memory productization UX, image-file/URL avatar upload, transcript/mailbox wipe, P1 topology/mailbox/auth re-litigation, or Grok chrome parity
- Foundational / P1 acceptance is reopened as a Phase 2 Pass prerequisite beyond the recorded foundational Pass gate already stamped in [README.md](./README.md)

## Absence checklist

| Non-goal | Pass bar (must **not** be required) | Status |
|----------|-------------------------------------|--------|
| Image-file / URL avatar upload | Preset marker path alone suffices for SC-003; upload UI absent or gated without blocking Pass | **measured** — T024; see [Image upload (T024)](#image-upload-t024) |
| Skills library (P3) | Not a Phase 2 Pass gate (FR-011) | **measured** — T040; see [Skills library (T040)](#skills-library-t040) |
| Memory product UX (P5) | Not a Phase 2 Pass gate — no profile/log/note authoring or recall product flow required for SC-006 / FR-010 | **measured** — T038; see [Memory product UX (T038)](#memory-product-ux-t038) |
| Transcript / mailbox wipe as delete Pass gate | Clarify lock 5 — identity removal alone (FR-008 / SC-005) | **measured** — T040; see [Transcript / mailbox wipe (T040)](#transcript--mailbox-wipe-t040) |
| P1 topology / mailbox / auth re-litigation | Foundational Pass already stamped; P1 wedge remains owned by `specs/001-multi-model-bots` | **measured** — T040; see [P1 re-litigation (T040)](#p1-re-litigation-t040) |
| Grok chrome parity | Not required for Phase 2 Pass | **measured** — T040; see [Grok chrome parity (T040)](#grok-chrome-parity-t040) |

---

## Image upload (T024)

- Host `AvatarMarker` accepts only preset `shape` / `color` ids; no image-file or URL fields.
- Client rename/avatar UI (**T023**) must not introduce an upload path that Verifiers treat as a Pass prerequisite.
- If a future surface adds custom image upload, it remains out of Phase 2 Pass scope and MUST NOT block preset-marker Scenario 2.

**Spot-check (Team Client — tip used for T040 reconfirm):**

| Surface | Observation | Claim |
|---------|---------------|-------|
| `packages/experimental/client-ui-agent-team` Client sources | No `input[type=file]` / avatar upload control; locale hint states preset-only | **measured** — only hit is negative guidance `avatarHint` (“no image upload”) |

**Rerun:**

```sh
# Expect no upload control; negative guidance in locales is OK.
! rg -n -i 'type=["'\'']file["'\'']|avatarUpload|FileReader' \
  packages/experimental/client-ui-agent-team/src \
  --glob '!**/locales.ts'
```

---

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

---

## Skills library (T040)

**Acceptance:** FR-011 · Spec Out of Scope · [quickstart.md](../quickstart.md#non-goals-must-not-appear-in-pass-criteria)

Phase 2 Pass MUST NOT require a skills library product surface (attach/run/author skill UX deferred to P3).

**Spot-check:**

| Surface | Observation | Claim |
|---------|---------------|-------|
| Team Client + Desktop `src` | No skills-library / skill-pack product UX strings or controls as Pass gates | **measured** — `rg` for skills-library / SkillsLibrary / skill-pack UX / attach-skill / skill-author → no matches |
| Harness `dsh-skill*` packages | May exist as infrastructure | **inferred** — presence alone does not Fail FR-011; Fail only if a P2 Scenario **requires** skills library UX |

**Rerun:**

```sh
! rg -n -i 'skills.?library|SkillsLibrary|skill.?pack.?ux|attach.?skill|skill.?author' \
  packages/experimental/client-ui-agent-team/src apps/desktop/src \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/tests/**' --glob '!**/README*.md'
```

---

## Transcript / mailbox wipe (T040)

**Acceptance:** Clarify lock 5 · FR-008 · SC-005 · [scenario-4-delete-confirm.md](./scenario-4-delete-confirm.md)

Delete Pass = removal from sidebar, overview entry points, and section membership only. Transcript/mailbox cleanup MAY follow Host/session rules and is **not** a separate Phase 2 Pass gate.

| Observation | Pass | Fail |
|-------------|------|------|
| SC-005 / Scenario 4 Pass criteria | Identity removal only; wipe not required | Failing Pass solely because transcripts/mailbox history remain |
| Host `deleteBot` / Scenario 4 Host rehearsal | Mailbox rows may survive identity tombstone | Treating mailbox wipe as required for SC-005 |

**Claim tags:** Recipe + clarify lock 5 + Host non-wipe rehearsal in Scenario 4 → **measured** (docs + Host vitest path named there). Do **not** Fail SC-005 / SC-007 for remaining history.

---

## P1 re-litigation (T040)

**Acceptance:** Spec Out of Scope (“Expanding P1 mailbox, model-assignment, or auth requirements”) · research ownership of `specs/001-multi-model-bots`

Phase 2 Verifier recipes MUST NOT reopen P1 topology handshake, Host mailbox product acceptance, or in-app auth as Phase 2 Pass gates. P1 remains Done on its own epic; Phase 2 uses P1 create-bot as a **prerequisite capability**, not a re-proof surface.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario 1–6 Pass criteria | Assume P1 create-bot / model path available; do not re-stamp SC-001…SC-007 from `specs/001-multi-model-bots` | Requiring fresh P1 topology/mailbox/auth Pass as a P2 Done gate |
| Foundational Pass (T011) | Identity foundations only (already stamped) | Expanding T011 into P1 mailbox/auth re-proof |

**Claim:** **measured** — Phase 2 recipes and this checklist omit P1 product SC re-stamps; foundational Pass section stays identity-scoped.

---

## Grok chrome parity (T040)

**Acceptance:** Spec Out of Scope · plan P2 exit (usable identity edit, not pixel Grok)

Phase 2 Pass MUST NOT require pixel-identical Grok layout, per-assistant notification settings beyond rename/avatar/persona edit needs, or other chrome-parity polish.

**Spot-check:**

| Surface | Observation | Claim |
|---------|---------------|-------|
| Team Client + Desktop `src` | No Grok-chrome / pixel-identical / notification-settings product Pass dependencies | **measured** — `rg` → no matches |
| Scenario Pass criteria | Identity/persona/section/delete paths only | **measured** — recipes do not list chrome parity |

**Rerun:**

```sh
! rg -n -i 'grok.?chrome|pixel.?identical|notification.?settings' \
  packages/experimental/client-ui-agent-team/src apps/desktop/src \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/tests/**' --glob '!**/README*.md'
```

---

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/rename-avatar.md](../contracts/rename-avatar.md) | Contract non-goals (avatar) |
| [../contracts/memory-layers-adr.md](../contracts/memory-layers-adr.md) | Contract non-goals (memory ADR / no UX) |
| [../contracts/delete-confirm.md](../contracts/delete-confirm.md) | Contract non-goals (wipe) |
| [scenario-2-rename-avatar.md](./scenario-2-rename-avatar.md) | SC-003 recipe (upload not required) |
| [scenario-4-delete-confirm.md](./scenario-4-delete-confirm.md) | SC-005 recipe (wipe not required) |
| [scenario-5-memory-adr.md](./scenario-5-memory-adr.md) | SC-006 recipe (presence + non-goal; no recall demo) |
| [scenario-6-full-replay.md](./scenario-6-full-replay.md) | SC-007 composite (must keep non-goals green) |
| T023 / T024 | Client picker + upload omission |
| T037 / T038 | Scenario 5 recipe + memory UX absence |
| T039 / T040 | Scenario 6 recipe + remaining absence rows |
