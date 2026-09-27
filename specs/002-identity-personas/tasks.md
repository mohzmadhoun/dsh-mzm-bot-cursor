# Tasks: Phase 2 — Identity / Personas

**Input**: Design documents from `/workspace/specs/002-identity-personas/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Spec does **not** request TDD unit-test tasks. Required **Verifier recipes** for FR-012 / SC-001…SC-008 and [quickstart.md](./quickstart.md) Scenarios 1–6 are implementation deliverables (not optional examples).

**Organization**: Shared Host identity foundations (Phase 2) **block** all user-story fan-out. Stories follow **spec priority** among equals by story number: US1 → US2 → US4 (all P1) → US3 (P2) → US5 (P3).

**Linear**: Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88) · Tasks issue [MOH-96](https://linear.app/momadhoun/issue/MOH-96) · Verifier gate [MOH-97](https://linear.app/momadhoun/issue/MOH-97) · Project **DeepSeek Harness - Cursor** only · Issues from stories via later `/speckit-taskstoissues` (not this file)

**Branch**: `cursor/p2-tasks-92fa` (from `origin/master` @ plan merge `74738e2e23`)

**Clarify locks (2026-09-27) — honor in every story/recipe**:

1. Saved job/voice/anti-jobs apply as bot instructions after save; Verifier does **not** gate LLM reply adherence (SC-008 wiring only).
2. Memory ADR under `MzM-Docs/adr/`; filename identifies agent vs user memory layers.
3. Avatar Pass = preset shape and/or color markers; no image-file upload for Pass.
4. Unassigned/default grouping allowed; named sections optional overlays.
5. Delete Pass = removal from sidebar/overview/section membership only; no transcript/mailbox wipe gate.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (`[US1]`…`[US5]`) on story-phase tasks only
- Every task includes exact file paths

## Path Conventions

Desktop dual-process layout from [plan.md](./plan.md):

- Electron shell: `apps/desktop/src/`, `apps/desktop/tests/`
- Desktop Host: `apps/desktop-host/src/`
- Host Agent Teams / identity: `packages/experimental/agent-team/src/`
- Persona / instruction seam: `packages/preset/persona/src/`, `packages/core/system-prompt/src/`
- Client/Web Agent Teams UI: `packages/experimental/client-ui-agent-team/src/client/`
- Settings (optional Host store for sections): `packages/settings/settings/`, `packages/settings/settings-file/`
- Program ADR tree: `MzM-Docs/adr/`
- Feature Verifier recipes: `specs/002-identity-personas/verifier/`

**Do not** rewrite `specs/001-multi-model-bots/**`. **Do not** invent P3 skills or P5 memory product UX tasks.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Orient implementers to P2 seams; create Verifier recipe home; no product behavior yet

- [ ] T001 Confirm feature design tree is complete (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `checklists/requirements.md`) under `specs/002-identity-personas/` and point implementers at [contracts/README.md](./contracts/README.md)
- [x] T002 [P] Inventory Host bot-identity touch points for P2 mutations in `packages/experimental/agent-team/src/{types,roster,index,projection,journal}.ts` against [data-model.md](./data-model.md) Bot extension fields (`persona`, `avatar`, `sectionId`) and note P1 `createBot` as the extend point (research R7) — [verifier/host-identity-inventory.md](./verifier/host-identity-inventory.md)
- [x] T003 [P] Inventory instruction-bind seam candidates in `packages/preset/persona/src/index.ts`, `packages/core/system-prompt/src/`, and Agent Teams spawn/scope wiring under `packages/experimental/agent-team/src/` for FR-013 / [contracts/persona-profile.md](./contracts/persona-profile.md) — [verifier/instruction-bind-inventory.md](./verifier/instruction-bind-inventory.md)
- [ ] T004 Create Verifier recipe directory `specs/002-identity-personas/verifier/README.md` listing Scenario 1–6 owners (Runtime / Client / Verifier / Docs) mapped to [quickstart.md](./quickstart.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared Host identity foundations + thin-shell guard that MUST complete before ANY user story fan-out

**⚠️ CRITICAL**: No US1–US5 product work until T005–T011 land. T012 records the sidebar-store pick (research R4 gap) before US3 implementation.

### Shared Host identity model + mutation surface

- [x] T005 Extend Host Bot identity types with optional `persona` (`job` short text may be empty; `voice` short text may be empty; `antiJobs` ordered list of short text items ≥0), optional `avatar` (preset `shape` and/or `color` ids), and `sectionId` (Sidebar section id or null/absent ⇒ Unassigned/default) in `packages/experimental/agent-team/src/types.ts` per [data-model.md](./data-model.md) — do not change P1 `modelAssignment` ownership
- [x] T006 Persist extended Bot identity fields Host-durably with the Team roster / journal path in `packages/experimental/agent-team/src/{roster,journal,persisted}.ts` (and related persistence helpers) so restart/reload retains persona, avatar marker, displayName, and section membership (FR-002/004/005/006; research R1)
- [x] T007 Add Host mutation request/result types for rename, persona update, avatar set, section assign/unassign, and delete (extend beyond P1 `createBot`) in `packages/experimental/agent-team/src/types.ts` and Remote/service stubs in `packages/experimental/agent-team/src/index.ts` — Electron Main MUST NOT invent identity records (research R1)
- [x] T008 [P] Project extended identity fields (displayName, avatar marker, antiJobs, section membership) to Client-readable Team/roster views in `packages/experimental/agent-team/src/projection.ts` without requiring Electron IPC synthesis
- [x] T009 [P] Document Host instruction-bind approach for saved non-empty job/voice/anti-jobs via `packages/preset/persona/` / `packages/core/system-prompt/` (compose into bot instructions on subsequent turns; empty fields contribute no instruction text) in `specs/002-identity-personas/verifier/instruction-bind.md` — Verifier observes wiring, **not** LLM reply wording (clarify lock 1; SC-008)
- [x] T010 [P] Add architecture/regression guard that Electron Main has no parallel identity/persona/section/delete store or bus in `apps/desktop/tests/no-electron-identity-bus.spec.ts` (and document expected absence in `apps/desktop/src/ipc.ts` / `apps/desktop/src/host-protocol.ts`) per research R1
- [x] T011 Record foundational Pass checklist (types + persistence + mutation stubs + projection + instruction-bind doc + no Electron identity bus) in `specs/002-identity-personas/verifier/README.md` — product SC-001…SC-008 not Done without these foundations — Pass stamped in [verifier/README.md](./verifier/README.md#foundational-pass-checklist--recorded) on master tip including #78–#80
- [x] T012 Pick and document Host store for sidebar sections (Team journal vs `packages/settings/settings` / `packages/settings/settings-file`) in `specs/002-identity-personas/verifier/sidebar-store.md` — Unassigned/default allowed without a stored section row (clarify lock 4; research R4)

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Edit bot persona (job, voice, anti-jobs) (Priority: P1) 🎯 MVP

**Goal**: User edits job/voice/anti-jobs on a bot’s identity/profile; values persist; anti-jobs visible on overview; saved fields bind as instructions on subsequent turns (FR-001…003, FR-013; SC-001, SC-002, SC-008)

**Independent Test**: Create or select one bot; set job, voice, and ≥1 anti-job; confirm persist after leave/return and restart/reload; confirm anti-jobs on overview; confirm instruction assembly includes saved non-empty fields without requiring LLM reply-adherence proof ([quickstart.md](./quickstart.md) Scenario 1)

### Implementation for User Story 1

- [x] T013 [US1] Implement Host `updatePersona` (or equivalent) accepting `job` (short text, may be empty), `voice` (short text, may be empty), and `antiJobs` (ordered short text items ≥0) on existing Bot id in `packages/experimental/agent-team/src/index.ts` / `packages/experimental/agent-team/src/roster.ts` — updates replace prior values; persist with Bot (FR-002; [contracts/persona-profile.md](./contracts/persona-profile.md))
- [x] T014 [US1] Bind saved non-empty job/voice/anti-jobs into that bot’s instruction assembly for subsequent turns via `packages/preset/persona/src/index.ts` and/or `packages/core/system-prompt/src/` from Agent Teams scope wiring under `packages/experimental/agent-team/src/` — empty fields contribute no instruction text (FR-013; clarify lock 1)
- [x] T015 [P] [US1] Expose persona fields on Host→Client projections in `packages/experimental/agent-team/src/projection.ts` so profile and overview can read durable values without Main-owned storage
- [ ] T016 [US1] Add Client/Web identity/profile editor (job, voice, anti-jobs list) under `packages/experimental/client-ui-agent-team/src/client/` (and locale strings in `packages/experimental/client-ui-agent-team/src/client/locales.ts`) composed into Desktop Web — happy path, no config-file edit
- [ ] T017 [US1] Render saved anti-jobs on bot overview without a separate hidden/advanced-only editor in `packages/experimental/client-ui-agent-team/src/client/` (and related overview chrome) for Verifier observation (FR-003; SC-002)
- [ ] T018 [US1] On save interrupted / Host unavailable, show clear failure and leave prior durable persona values unchanged — Client error surface in `packages/experimental/client-ui-agent-team/src/client/` + Host reject path in `packages/experimental/agent-team/src/`
  - Host reject path landed with T013 (`TEAM_LEAD_REQUIRED` / `TEAM_MEMBER_NOT_FOUND` / aborted signal → `team-rejected` Remote, prior durable persona unchanged). Client error surface remains T018.
- [ ] T019 [US1] Add Verifier Scenario 1 recipe in `specs/002-identity-personas/verifier/scenario-1-persona-profile.md` covering SC-001 (job, voice, ≥1 anti-job survive restart/reload), SC-002 (overview anti-jobs), and SC-008 (instruction/prompt assembly contains saved non-empty fields; **do not** score LLM reply wording)

**Checkpoint**: US1 independently testable after foundational Pass

---

## Phase 4: User Story 2 — Rename and set avatar (Priority: P1)

**Goal**: User renames a bot and sets a preset avatar marker; sidebar and overview show updated identity after save and restart/reload (FR-004, FR-005; SC-003)

**Independent Test**: Rename one bot and set a preset avatar marker; confirm new name and avatar in sidebar and overview after save and reload ([quickstart.md](./quickstart.md) Scenario 2)

### Implementation for User Story 2

- [ ] T020 [US2] Implement Host rename mutation: new `displayName` MUST be non-empty (reject/block empty rename; prior name unchanged); duplicates allowed; persist on Bot identity in `packages/experimental/agent-team/src/{types,index,roster}.ts` ([contracts/rename-avatar.md](./contracts/rename-avatar.md); FR-004)
- [ ] T021 [US2] Implement Host avatar-marker mutation for preset `shape` and/or `color` enum/ids (at least one of shape or color required when user sets an avatar for Pass); **no** image-file/URL upload path required for Pass — `packages/experimental/agent-team/src/{types,index,roster}.ts` (clarify lock 3; FR-005)
- [ ] T022 [P] [US2] Project `displayName` + avatar marker to Client roster/sidebar/overview views in `packages/experimental/agent-team/src/projection.ts`
- [ ] T023 [US2] Add Client rename control + preset avatar picker (shape and/or color) in `packages/experimental/client-ui-agent-team/src/client/` so sidebar and overview render updated identity after save
- [ ] T024 [US2] Ensure unsupported custom image upload (if present) MUST NOT block preset-marker Pass — gate or omit upload UI for P2 in `packages/experimental/client-ui-agent-team/src/client/` and note non-goal in `specs/002-identity-personas/verifier/non-goals.md`
- [ ] T025 [US2] Add Verifier Scenario 2 recipe in `specs/002-identity-personas/verifier/scenario-2-rename-avatar.md` for SC-003 (rename + preset marker survive restart/reload on sidebar and overview; image upload not required)

**Checkpoint**: US2 independently testable (needs ≥1 bot from P1 create / US1 path)

---

## Phase 5: User Story 4 — Delete bot with confirmation (Priority: P1)

**Goal**: Permanent delete only after explicit confirm; cancel leaves bot intact; confirm removes from sidebar, overview entry points, and section membership (FR-007, FR-008; SC-005). Transcript/mailbox wipe is **not** a Pass gate (clarify lock 5).

**Independent Test**: Start delete, cancel once; start again, confirm; bot gone from sidebar and overview ([quickstart.md](./quickstart.md) Scenario 4)

### Implementation for User Story 4

- [ ] T026 [US4] Implement Host permanent identity removal from roster/overview entry points and section membership on confirm in `packages/experimental/agent-team/src/{index,roster}.ts` — transcript/mailbox cleanup MAY follow Host/session rules and MUST NOT block delete UX or Pass ([contracts/delete-confirm.md](./contracts/delete-confirm.md); clarify lock 5)
- [ ] T027 [US4] Add Client delete flow with explicit confirmation step (`idle` → `pending-confirm` → `cancelled` | `deleted` per [data-model.md](./data-model.md)) in `packages/experimental/client-ui-agent-team/src/client/` — cancel/dismiss returns to idle with profile unchanged
- [ ] T028 [P] [US4] If product chooses shell-hosted native confirm, keep Electron Main lifecycle-only (no identity store) via optional dialog bridge in `apps/desktop/src/` — confirm step still required before Host delete; prefer Client confirm if shell dialog unused
- [ ] T029 [US4] On Host delete failure mid-flight, show clear failure and keep bot listed until successful removal — Client + Host error path in `packages/experimental/client-ui-agent-team/src/client/` and `packages/experimental/agent-team/src/index.ts`
- [ ] T030 [US4] Add Verifier Scenario 4 recipe in `specs/002-identity-personas/verifier/scenario-4-delete-confirm.md` for SC-005 (confirm required; cancel safe; identity removal; **do not** fail Pass solely because transcripts/mailbox remain)

**Checkpoint**: US4 independently testable; exit path create/rename/delete (with confirm) covered with US1–US2

---

## Phase 6: User Story 3 — Organize bots in sidebar sections (Priority: P2)

**Goal**: Named sidebar sections + Unassigned/default; assign/move/unassign bots; persist names and membership (FR-006; SC-004). Named sections are optional overlays (clarify lock 4).

**Independent Test**: Create a named section; assign a bot; confirm membership after reload; unassigned bots appear under Unassigned/default ([quickstart.md](./quickstart.md) Scenario 3)

### Implementation for User Story 3

- [ ] T031 [US3] Implement Host Sidebar section entity (`id` opaque; `name` non-empty string; `botIds` ordered list; a bot in at most one named section) using the store chosen in T012 under Host surfaces (`packages/experimental/agent-team/src/` and/or `packages/settings/settings/`) — reject empty section name on create/rename ([data-model.md](./data-model.md); [contracts/sidebar-sections.md](./contracts/sidebar-sections.md))
- [ ] T032 [US3] Implement assign / move / unassign so `sectionId` null/absent ⇒ Unassigned/default grouping (not necessarily a stored section row); empty named sections may remain after last-bot remove — Host mutations in `packages/experimental/agent-team/src/` (clarify lock 4)
- [ ] T033 [P] [US3] Project section names + membership (+ Unassigned) to Client sidebar views in `packages/experimental/agent-team/src/projection.ts`
- [ ] T034 [US3] Add Client sidebar section UI: create named section, assign/move/unassign bots, render Unassigned/default for never-assigned bots in `packages/experimental/client-ui-agent-team/src/client/` (collapse/expand chrome helpful but not required for Pass)
- [ ] T035 [US3] Add Verifier Scenario 3 recipe in `specs/002-identity-personas/verifier/scenario-3-sidebar-sections.md` for SC-004 (named section + assign survives restart/reload; Unassigned visible for unassigned bots)

**Checkpoint**: US3 independently testable after T012 store pick + foundational Pass

---

## Phase 7: User Story 5 — Memory layers ADR only (Priority: P3)

**Goal**: ADR under `MzM-Docs/adr/` distinguishing agent vs user memory; no memory product UX in P2 (FR-009, FR-010; SC-006). Filename identifies agent vs user memory layers (clarify lock 2).

**Independent Test**: ADR file exists under `MzM-Docs/adr/` with identifying filename; content names agent-scoped vs user-scoped layers and states no P2 memory UX; spot-check shipped P2 surfaces have no recall/write product flow ([quickstart.md](./quickstart.md) Scenario 5)

### Implementation for User Story 5

- [ ] T036 [US5] Create `MzM-Docs/adr/` directory if absent and land ADR file whose filename identifies agent vs user memory layers (recommended: `MzM-Docs/adr/agent-vs-user-memory-layers.md`) distinguishing **agent memory** (per bot) from **user memory** (shared across bots) and stating P2 ships **no** memory product UX ([contracts/memory-layers-adr.md](./contracts/memory-layers-adr.md); FR-009; clarify lock 2)
- [ ] T037 [P] [US5] Add Verifier Scenario 5 docs recipe in `specs/002-identity-personas/verifier/scenario-5-memory-adr.md` for SC-006 (file presence + non-goal statement; **no** recall demo)
- [ ] T038 [P] [US5] Assert absence of memory productization UX (no profile/log/note authoring or recall product flow) in `specs/002-identity-personas/verifier/non-goals.md` for FR-010 / SC-006 Pass

**Checkpoint**: US5 independently testable as docs-only; does not block interactive MVP (US1)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Full Verifier replay, non-goals, no P3/P5 creep, quickstart alignment

- [ ] T039 [P] Add Verifier Scenario 6 full Phase 2 replay recipe in `specs/002-identity-personas/verifier/scenario-6-full-replay.md` covering create/use → rename → persona edit → avatar → section assign → overview anti-jobs → delete confirm/cancel/confirm (FR-012; SC-007) and requiring foundational Pass first
- [ ] T040 [P] Complete explicit non-goals absence checks (skills library P3; memory product UX P5; image-file avatar upload; transcript/mailbox wipe as Pass gate; P1 topology/mailbox/auth re-litigation; Grok chrome parity) in `specs/002-identity-personas/verifier/non-goals.md`
- [ ] T041 [P] Cross-link `specs/002-identity-personas/plan.md` Handoff / Ready section to `tasks.md` and note next commands: `/speckit-analyze` → `/speckit-taskstoissues` → implement (no FR rewrite; do not edit `MzM-Docs/living-next-gate.md` from Spec tasks)
- [ ] T042 Run `specs/002-identity-personas/quickstart.md` Scenario 1–6 validation outline against Verifier recipes and fix recipe gaps (no feature code in Spec role — implementers execute)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
  - T005–T011 before story implementation
  - T012 (sidebar store pick) before US3 Host section work (T031+)
- **User Stories**: All depend on Foundational completion
  - Prefer single-threaded order US1 → US2 → US4 → US3 → US5
  - US2/US4 need ≥1 bot (P1 create path remains available)
  - US3 needs T012
  - US5 is docs-only and can parallel any story after Setup
- **Polish (Phase 8)**: Depends on stories intended for P2 exit (US1–US5)

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — **MVP**; instruction bind + overview anti-jobs
- **User Story 2 (P1)**: After Foundational; independently testable with one bot; practical after create path
- **User Story 4 (P1)**: After Foundational; independently testable; pairs with US1–US2 for exit path create/rename/delete
- **User Story 3 (P2)**: After Foundational + T012; independently testable; Unassigned allowed without named sections for bots outside scripted path
- **User Story 5 (P3)**: Docs-only after Setup; independently testable; required before Phase 2 product acceptance Done (SC-006) but not for interactive MVP demo

### Within Each User Story

- Host data/API before Client UI
- Client projections before Verifier recipe Pass claims
- Story Verifier recipe before marking story Done
- Quote data-model constraints verbatim in mutations (empty-allowed persona fields; non-empty displayName on rename; preset avatar only; Unassigned; delete identity-only)

### Parallel Opportunities

- T002/T003 (setup inventories); T008/T009/T010 after T005–T007 started
- After Foundational: US5 (T036–T038) can parallel US1 Host work
- US2 Client avatar picker (T023) can parallel US4 delete confirm UI (T027) once projections exist
- Polish T039/T040/T041 can parallel after recipes exist

---

## Parallel Example: Foundational (Phase 2)

```bash
# After T005–T007 types/persistence/mutations land:
Task: "Project identity fields in packages/experimental/agent-team/src/projection.ts"
Task: "Document instruction-bind in specs/002-identity-personas/verifier/instruction-bind.md"
Task: "No Electron identity bus guard in apps/desktop/tests/no-electron-identity-bus.spec.ts"
```

## Parallel Example: User Story 1

```bash
# After T013 Host updatePersona lands:
Task: "Expose persona on projection in packages/experimental/agent-team/src/projection.ts"
Task: "Verifier scenario-1 in specs/002-identity-personas/verifier/scenario-1-persona-profile.md"
```

## Parallel Example: User Story 5

```bash
# Docs-only fan-out after Setup:
Task: "Land MzM-Docs/adr/agent-vs-user-memory-layers.md"
Task: "Verifier scenario-5-memory-adr.md"
Task: "Non-goals memory UX absence in verifier/non-goals.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup
2. Complete Phase 2 Foundational
3. Complete Phase 3 US1 (persona edit + instruction bind + overview)
4. **STOP and VALIDATE** US1 independently (SC-001/002/008 path)
5. Demo durable persona without P3/P5 surfaces

### Incremental Delivery

1. Setup + Foundational → gate open
2. US1 → persona MVP
3. US2 → rename + preset avatar
4. US4 → delete with confirm (exit path create/rename/delete)
5. US3 → sidebar sections + Unassigned
6. US5 → memory ADR (docs)
7. Polish → full Verifier replay (SC-007) + non-goals

### Parallel Team Strategy

1. DH Runtime: T005–T008, T012, then US1 Host / US2 Host / US4 Host / US3 Host
2. DH Client/Web: US1 profile+overview, US2 rename/avatar, US3 sidebar, US4 confirm UI
3. DH Electron: keep shell thin (T010, T028); no identity bus
4. DH Spec/Docs + Verifier: US5 ADR + Scenario 1–6 recipes
5. DH Verifier: SC-001…SC-008 Pass evidence on real desktop app

---

## Notes

- [P] = different files, no incomplete-task dependency
- [USn] maps to spec user stories for Linear `taskstoissues` traceability
- First executable product increment = US1 persona after Foundational — not sidebar, not memory UX
- Do not invent skills library (P3), memory productization (P5), image-upload avatars, or transcript-wipe Pass gates
- Sidebar store exact API closed in T012 (plan open gap #1); Host mutation API names closed in T007 (plan open gap #2)
- Commit after each task or logical group during implement; this Spec change commits only `tasks.md` under `specs/002-identity-personas/`
- Next: `/speckit-analyze` → `/speckit-taskstoissues` (Linear **DeepSeek Harness - Cursor** / MOH-88) → implement → Verifier MOH-97
