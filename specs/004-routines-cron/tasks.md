# Tasks: Phase 4 — Routines (cron only)

**Input**: Design documents from `/workspace/specs/004-routines-cron/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Spec does **not** request TDD unit-test tasks. Required **Verifier recipes** for FR-010/FR-011 / SC-001…SC-007 and [quickstart.md](./quickstart.md) Scenarios 1–5 are implementation deliverables (not optional examples). Every GUI recipe MUST require desktop screenshots and/or short screen recordings **committed** under `verifier/evidence/` + PR embeds (standing orders **11** + **12**).

**Organization**: Shared Host Routine catalog foundations (Phase 2) **block** all user-story fan-out. Stories follow **spec priority**: US1 Create → US2 Pane list → US3 Pause/resume → US4 Cron fire (all P1).

**Linear**: Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) · Analyze/taskstoissues [MOH-193](https://linear.app/momadhoun/issue/MOH-193/p4-spec-kit-analyze-taskstoissues-routines-cron) · Tasks [MOH-192](https://linear.app/momadhoun/issue/MOH-192/p4-spec-kit-tasks-routines-cron) Done (#142) · Project **DeepSeek Harness - Cursor** only · T001–T034 → [MOH-194](https://linear.app/momadhoun/issue/MOH-194)…[MOH-227](https://linear.app/momadhoun/issue/MOH-227) (map in [analyze-report.md](./analyze-report.md))

**Branch**: `cursor/p4-analyze-fe1d`

**Architect Option 3 locks (honor in every story/recipe)**:

1. **Host-owned Routine catalog** is Routines SoT (prefer Agent Teams / Host journal extension — P2/P3 pattern).
2. **Host cron wake** applies intent as bot turn; pane last-run from Host after fire commit.
3. Do **NOT** ship P4 as “mount `dsh-schedule`” — session reminders only; optional time-math reuse only.
4. **Optional** `dsh-jobs` / `dsh-jobs-local` for in-flight fire visibility only — **not** catalog/cron SoT.
5. **No Electron Main routines bus** — lifecycle IPC only; routine traffic on authenticated Host HTTP/WS.
6. Desktop Host child topology unchanged (bundled-Node child + HTTP/WS + lifecycle IPC + `dsh-app://`).
7. Clarify locks: fire ≠ LLM wording; Verifier ≤6 min / no sub-5m test schedule; confirm/edit optional; identity MAY derive from intent.
8. FR-010/FR-011 / SO 11+12 desktop visual evidence required for all GUI scenarios (US1–US4 / SC-001…003/005).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (`[US1]`…`[US4]`) on story-phase tasks only
- Every task includes exact file paths

## Path Conventions

Desktop dual-process layout from [plan.md](./plan.md):

- Electron shell: `apps/desktop/src/`, `apps/desktop/tests/`
- Desktop Host: `apps/desktop-host/`
- Host Agent Teams / bot identity (Routine catalog home): `packages/experimental/agent-team/src/`
- Optional jobs visibility: `packages/jobs/jobs/`, `packages/jobs/jobs-local/`
- Session reminders (**not** Routines SoT): `packages/schedule/schedule/`, `packages/client/ui-schedule/`
- Client/Web Agent Teams UI (routines pane): `packages/experimental/client-ui-agent-team/src/client/`
- Host protocol exclusions: `apps/desktop/src/host-protocol.ts`, `apps/desktop/src/ipc.ts`
- Feature Verifier recipes: `specs/004-routines-cron/verifier/`

**Do not** rewrite `specs/001-multi-model-bots/**`, `specs/002-identity-personas/**`, or `specs/003-skills-ux/**`. **Do not** invent P5 memory UX, P6 event listeners/MCP, or Box/Shell tasks.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Orient implementers to P4 Architect Option 3 seams; create Verifier recipe home; no product behavior yet

- [x] T001 Confirm feature design tree is complete (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `checklists/requirements.md`) under `specs/004-routines-cron/` and point implementers at [contracts/README.md](./contracts/README.md) + Architect Option 3 in [research.md](./research.md)
- [x] T002 [P] Inventory Host Routine-catalog touch points in `packages/experimental/agent-team/src/` and Desktop Host profile under `apps/desktop-host/` against [data-model.md](./data-model.md) `RoutineRecord` — record findings in `specs/004-routines-cron/verifier/host-routines-inventory.md`
- [x] T003 [P] Inventory cron-wake / bot-turn candidates (Agent session inbox / turn start) and optional `ctx.jobs` visibility in `packages/jobs/jobs/`, `packages/jobs/jobs-local/` for [contracts/cron-fire.md](./contracts/cron-fire.md) — `specs/004-routines-cron/verifier/cron-wake-inventory.md`
- [x] T004 [P] Document that `@deepseek-ai/dsh-schedule` / `packages/client/ui-schedule/` are **session reminders only** (not Routines SoT) in `specs/004-routines-cron/verifier/schedule-not-routines.md` (research R2)
- [x] T005 Create Verifier recipe directory `specs/004-routines-cron/verifier/README.md` listing Scenario 1–5 owners (Runtime / Client / Electron / Verifier) mapped to [quickstart.md](./quickstart.md) and mandating FR-010/011 desktop screenshots/recordings **committed** under `verifier/evidence/` + PR embeds (SO 11+12)

---


**Setup checkpoint (Verifier 2026-09-27):** T001–T005 Pass on branch `cursor/p4-setup-verifier-fe1d` — design tree confirmed; inventories + `schedule-not-routines` + `verifier/README.md` Scenario 1–5 owners + FR-010/011 evidence mandate.

**Foundational checkpoint (Verifier 2026-09-27):** T006–T013 on master @ `5a53ddac83` (#147 Host + #145 Electron). **T014 Pass** stamped in `verifier/README.md` on branch `cursor/p4-t014-foundation-stamp-fe1d` — US1–US4 fan-out unlocked after stamp merge.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared Host Routine catalog + thin-shell guard that MUST complete before ANY user story fan-out

**⚠️ CRITICAL**: No US1–US4 product work until T006–T014 land.

### Shared Host Routine model + protocol

- [x] T006 Define Host `RoutineRecord` types/validation (`routineId`, `botId`, `intent` non-empty, `scheduleExpr`, `status: active|paused`, `lastRunAt` null|timestamp, `createdAt`, `updatedAt`) in `packages/experimental/agent-team/src/` (or Host-adjacent module named in inventory) per [data-model.md](./data-model.md)
- [x] T007 Implement Host Routine catalog service (create/list by `botId`, durable store on Host journal / Agent Teams extension pattern) wired for Desktop Host in `apps/desktop-host/` + `packages/experimental/agent-team/src/` — **not** Electron Main, **not** `dsh-schedule` catalog
- [x] T008 Implement Host cron expression evaluator stub that accepts product-supported `scheduleExpr` (5-field cron and/or `@every 5m`-class shorthands), rejects invalid/unsupported with stable errors, and computes next-fire — Host process only (`packages/experimental/agent-team/src/` or Host scheduler module under `apps/desktop-host/`)
- [x] T009 Expose Host HTTP/WS projection + mutation APIs for routines (list/create) on the authenticated Desktop Host data plane (session-controller / Agent Teams Remote pattern as inventory chooses) — Client MUST NOT persist SoT
- [x] T010 [P] Extend `apps/desktop/src/host-protocol.ts` comments/exclusion documentation so routine-catalog, routine-create/pause/resume, cron-fire, and last-run payloads are **forbidden** on Node IPC (same pattern as identity + skills exclusions)
- [x] T011 [P] Add architecture/regression guard that Electron Main has no parallel routines store/bus/timers in `apps/desktop/tests/no-electron-routines-bus.spec.ts` (and document expected absence in `apps/desktop/src/ipc.ts` / `apps/desktop/src/host-protocol.ts`) per research R7
- [x] T012 [P] Add regression/docs guard that P4 Routines Pass path is **not** “mount `dsh-schedule` overlay alone” in `specs/004-routines-cron/verifier/schedule-not-routines.md` + a focused Host/Client spot-check recipe note (research R2; [contracts/non-goals.md](./contracts/non-goals.md))
- [x] T013 Optional: wire `dsh-jobs` / `dsh-jobs-local` availability on Desktop Host for **in-flight fire visibility only** (must not become Routine catalog SoT) — document in `specs/004-routines-cron/verifier/optional-jobs-visibility.md`
- [x] T014 Foundational checklist stamp in `specs/004-routines-cron/verifier/README.md` (T006–T013 complete; no US product work before this stamp)

**Checkpoint**: Foundation ready — Host catalog + protocol exclusions + absence guards; user stories may begin.

---

## Phase 3: User Story 1 — Create a cron routine (Priority: P1) 🎯 MVP

**Goal**: User creates a cron routine (non-empty intent + valid schedule) for a bot; it persists on Host and is available for pane listing ([contracts/create-list.md](./contracts/create-list.md); SC-001/006/007)

**Independent Test**: On Desktop, create one routine on bot A; reject empty intent / invalid schedule; bot B does not receive A’s routine ([quickstart.md](./quickstart.md) Scenario 1 create steps)

### Implementation for User Story 1

- [x] T015 [US1] Host createRoutine validates non-empty `intent` and product-supported `scheduleExpr`; rejects with clear user-visible/error reason; persists `status: active` in Host catalog (`packages/experimental/agent-team/src/` / Desktop Host) per FR-001
- [x] T016 [US1] Host createRoutine is per-`botId` (SC-006); confirm step not required (SC-007); separate displayName not required — identity MAY derive from intent
- [ ] T017 [P] [US1] Client create-routine UI in bot context under `packages/experimental/client-ui-agent-team/src/client/` calling Host HTTP/WS only (no Main IPC mutations)
- [ ] T018 [US1] Add Verifier Scenario 1 recipe in `specs/004-routines-cron/verifier/scenario-1-create-list.md` covering SC-001/006/007 create path and **requiring** FR-010/011 desktop evidence under `specs/004-routines-cron/verifier/evidence/scenario-1/` (unit/jsdom alone fails)

**Checkpoint**: US1 create works independently with Verifier recipe + evidence path.

---

## Phase 4: User Story 2 — Routines pane list (Priority: P1)

**Goal**: Bot info-pane lists that bot’s Host-projected routines with identity + active/paused status ([contracts/create-list.md](./contracts/create-list.md); US2; SC-001)

**Independent Test**: With ≥1 routine, open routines pane; list survives leave/return or reload ([quickstart.md](./quickstart.md) Scenario 1 list steps)

### Implementation for User Story 2

- [ ] T019 [US2] Host listRoutinesByBot projects `RoutineProjection` (intent/identity, schedule, status, lastRunAt) over HTTP/WS from Host catalog only
- [ ] T020 [P] [US2] Client bot info-pane routines list UI in `packages/experimental/client-ui-agent-team/src/client/` (must not treat `packages/client/ui-schedule/` header catalog as Pass surface)
- [ ] T021 [US2] Extend Verifier Scenario 1 (or `specs/004-routines-cron/verifier/scenario-2-pane-list.md` if split) to prove pane list + durability + FR-010/011 evidence under `verifier/evidence/scenario-1/` or `verifier/evidence/scenario-2/`

**Checkpoint**: US2 pane list independently testable on Desktop.

---

## Phase 5: User Story 3 — Pause and resume (Priority: P1)

**Goal**: Pause suppresses Host wake; resume restores eligibility; status durable ([contracts/pause-resume.md](./contracts/pause-resume.md); SC-002)

**Independent Test**: Pause → pane paused → no fire while paused; resume → active; survives reload ([quickstart.md](./quickstart.md) Scenario 2)

### Implementation for User Story 3

- [ ] T022 [US3] Host pauseRoutine / resumeRoutine persist `status` on `RoutineRecord`; paused routines MUST NOT receive cron wakes (FR-003/004)
- [ ] T023 [P] [US3] Client pause/resume controls on routines pane in `packages/experimental/client-ui-agent-team/src/client/` via Host RPC
- [ ] T024 [US3] Add Verifier Scenario 2/3 recipe in `specs/004-routines-cron/verifier/scenario-3-pause-resume.md` covering SC-002 and **requiring** FR-010/011 evidence of both states under `specs/004-routines-cron/verifier/evidence/scenario-3/` (or `scenario-2/` if numbering follows quickstart Scenario 2)

**Checkpoint**: US3 pause/resume independently testable.

---

## Phase 6: User Story 4 — Cron routine fires (Priority: P1)

**Goal**: Active routine fires via Host cron wake within ≤6 minutes; last-run visible; LLM wording not scored ([contracts/cron-fire.md](./contracts/cron-fire.md); SC-003)

**Independent Test**: Active `@every 5m` (or shortest product schedule) fires ≥1×; pane shows last-run ([quickstart.md](./quickstart.md) Scenario 3)

### Implementation for User Story 4

- [ ] T025 [US4] Host cron ticker/evaluator wakes due **active** routines and starts/continues bot turn with intent; updates `lastRunAt` after fire commit (FR-005; research R3/R4)
- [ ] T026 [P] [US4] Optional: emit in-flight fire visibility via `ctx.jobs` without making jobs the durable SoT — document behavior in `specs/004-routines-cron/verifier/optional-jobs-visibility.md`
- [ ] T027 [P] [US4] Client last-run / fire indicator on routines pane (or clearly linked activity) in `packages/experimental/client-ui-agent-team/src/client/`
- [ ] T028 [US4] Add Verifier Scenario 3/4 recipe in `specs/004-routines-cron/verifier/scenario-4-cron-fire.md` covering SC-003 (≤6 min wait; no sub-5m test schedule required; no LLM scoring) with FR-010/011 evidence under `specs/004-routines-cron/verifier/evidence/scenario-4/` (align folder name with quickstart Scenario 3 if preferred — keep README map consistent)

**Checkpoint**: US4 fire + last-run independently testable.

---

## Phase 7: Polish & Cross-Cutting (Non-goals, evidence, full replay)

**Purpose**: Absence checks, evidence layout, full SC-005 replay; no new product scope

- [ ] T029 [P] Create Verifier non-goals recipe `specs/004-routines-cron/verifier/non-goals.md` covering SC-004 / [contracts/non-goals.md](./contracts/non-goals.md): no event listeners, memory UX, Box/Shell, MCP; **no Electron routines bus**; **`dsh-schedule` ≠ Routines SoT**; jobs ≠ catalog SoT
- [ ] T030 [P] Create evidence directory placeholders + README expectations under `specs/004-routines-cron/verifier/evidence/{scenario-1,scenario-2,scenario-3,scenario-4,non-goals,scenario-5}/` documenting required screenshot/recording filenames for FR-010/011 / SO 11+12
- [ ] T031 Add Verifier Scenario 5 full replay recipe `specs/004-routines-cron/verifier/scenario-5-full-replay.md` covering SC-005 (Scenarios 1–4 + foundational stamp) with mandatory desktop visual evidence
- [ ] T032 [P] Re-validate quickstart Scenario → recipe map in `specs/004-routines-cron/quickstart.md` and `specs/004-routines-cron/verifier/README.md` (owners + evidence paths)
- [ ] T033 [P] Confirm `apps/desktop/tests/no-electron-routines-bus.spec.ts` + `host-protocol.ts` exclusions still green after story work
- [ ] T034 Polish: ensure no product code path documents Routines as “enable Schedule overlay” in Desktop Host / Client copy or Verifier README

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 → US2 → US3 → US4**: Prefer sequential (pane/pause/fire build on create); US2+ can start after T015–T016 Host create exists
- **Polish**: After desired stories complete (at least US1–US4 for phase exit)

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| US1 Create | Foundational T006–T014 | Create + reject invalid + per-bot |
| US2 Pane list | US1 Host create (T015–T016) | Pane list + reload |
| US3 Pause/resume | US1 + US2 list | Pause/resume + no fire while paused |
| US4 Cron fire | US1 + active status (US3 resume path) | Fire ≤6 min + last-run |

### Parallel Opportunities

- T002/T003/T004 inventory docs in parallel (Setup)
- T010/T011/T012 protocol + absence guards in parallel once T006–T009 started
- Within a story: Client UI [P] alongside Host once Host API contract stable
- T029/T030/T032 polish docs in parallel

### Parallel Example: Foundational

```bash
Task: "RoutineRecord types in packages/experimental/agent-team/src/"
Task: "host-protocol.ts routine exclusions"
Task: "no-electron-routines-bus.spec.ts"
Task: "schedule-not-routines.md absence note"
```

### Parallel Example: US1

```bash
Task: "Host createRoutine validation + persist"
Task: "Client create UI in client-ui-agent-team"
Task: "Verifier scenario-1-create-list.md + evidence path"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup
2. Complete Phase 2 Foundational (Host catalog + no Electron bus + schedule≠Routines)
3. Complete Phase 3 US1 (create + Verifier recipe)
4. **STOP and VALIDATE** US1 independently (SC-001/006/007)
5. Demo Host-backed create without Schedule overlay theater

### Incremental Delivery

1. Setup + Foundational → gate open
2. US1 → create MVP
3. US2 → pane list
4. US3 → pause/resume
5. US4 → Host cron fire + last-run
6. Polish → non-goals + SO11/12 evidence layout + SC-005 full replay

### Parallel Team Strategy

1. **DH Runtime**: T006–T009, T015–T016, T019, T022, T025 (+ optional T013/T026 jobs visibility)
2. **DH Client/Web**: T017, T020, T023, T027
3. **DH Electron**: T010–T011 thin shell; no routines bus
4. **DH Spec + Verifier**: recipes T018/T021/T024/T028/T029/T031 + FR-010/011 evidence stamping
5. **DH Verifier**: SC-001…SC-007 Pass on real desktop app with committed evidence

---

## Notes

- [P] tasks = different files, no incomplete-task dependencies
- [Story] label maps task to US1–US4 for traceability
- Verifier recipes are **required deliverables**, not optional TDD unit suites
- **Architect Option 3** is non-negotiable: Host catalog SoT; reject mount-`dsh-schedule`; optional jobs visibility only; no Electron bus
- Standing orders **11** + **12** non-negotiable on GUI recipes
- Do not rewrite specs/001–003
- Analyze **PASS** + Linear T001–T034 filed (MOH-194…MOH-227). Await Verifier/Lead analyze gate → implement → Verifier product gate. Leave MOH-193 In Progress until PO Done after Verifier Pass.
