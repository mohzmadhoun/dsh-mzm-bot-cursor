# Tasks: Phase 5 — Memory productization

**Input**: Design documents from `/workspace/specs/005-memory-productization/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Spec does **not** request TDD unit-test tasks. Required **Verifier recipes** for FR-010…FR-012 / SC-001…SC-010 and [quickstart.md](./quickstart.md) Scenarios 1–5 are implementation deliverables (not optional examples). Every GUI recipe MUST require desktop screenshots and/or short screen recordings **committed** under `verifier/evidence/` + PR embeds (standing orders **11** + **12**).

**Organization**: Shared Host Memory catalog foundations (Phase 2) **block** all user-story fan-out. Stories follow **spec priority**: US1 Write profile → US2 Write log → US3 Write note → US4 Recall after restart → US5 Agent vs user layers (all P1).

**Linear**: Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization) · Plan Done [MOH-233](https://linear.app/momadhoun/issue/MOH-233) (PR #170) · Tasks Done [MOH-235](https://linear.app/momadhoun/issue/MOH-235) (PR #171) · Analyze + taskstoissues [MOH-237](https://linear.app/momadhoun/issue/MOH-237/p5-spec-kit-analyze-taskstoissues-memory) · Project **DeepSeek Harness - Cursor** only · T001–T037 Linear children under MOH-228 (see [analyze-report.md](./analyze-report.md))

**Branch**: `cursor/p5-analyze-fe1d` (from `origin/master` @ tasks merge #171)

**PO / Architect Option locks (honor in every story/recipe)**:

1. **Host-owned Memory catalog** is Memory SoT (prefer Agent Teams / Host journal extension — P2/P3/P4 pattern; research R1).
2. **Agent layer** per `botId`; **user layer** account-wide (ADR; research R2).
3. **Kinds × layers orthogonal** — profile/log/note MAY live on either layer; no kind→layer locks as Pass (clarify; FR-017 / SC-010).
4. **Write Pass = user-visible UI**; bot-tool write optional / not Pass (clarify; FR-015 / SC-009).
5. **Recall Pass = surface browse/recall after restart AND one model-visible Host injection path**; LLM wording not scored (clarify; FR-005/FR-016 / SC-004).
6. **No Electron Main memory bus** — lifecycle IPC only; memory traffic on authenticated Host HTTP/WS (research R7).
7. **Transcript ≠ curated memory** — chat dump alone fails Pass (research R6).
8. FR-011/FR-012 / SO 11+12 desktop visual evidence required for all GUI scenarios (US1–US5 / SC-001…005, SC-007).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (`[US1]`…`[US5]`) on story-phase tasks only
- Every task includes exact file paths

## Path Conventions

Desktop dual-process layout from [plan.md](./plan.md):

- Electron shell: `apps/desktop/src/`, `apps/desktop/tests/`
- Desktop Host: `apps/desktop-host/`
- Host Agent Teams / Memory catalog home: `packages/experimental/agent-team/src/` (prefer journal extension adjacent to `team/routine`)
- Persona / instruction seam (inject sibling): `packages/preset/persona/src/`, `packages/core/system-prompt/src/`
- Client/Web Agent Teams UI (memory write + browse/recall): `packages/experimental/client-ui-agent-team/src/client/`
- Host protocol exclusions: `apps/desktop/src/host-protocol.ts`, `apps/desktop/src/ipc.ts`
- Program ADR: `MzM-Docs/adr/agent-vs-user-memory-layers.md`
- Feature Verifier recipes: `specs/005-memory-productization/verifier/`

**Do not** rewrite `specs/001-multi-model-bots/**`, `specs/002-identity-personas/**`, `specs/003-skills-ux/**`, or `specs/004-routines-cron/**`. **Do not** invent P6 connectors/MCP/event routines or P7 Box/Shell tasks.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Orient implementers to P5 Host Memory catalog SoT seams; create Verifier recipe home; no product behavior yet

- [x] T001 Confirm feature design tree is complete (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `checklists/requirements.md`) under `specs/005-memory-productization/` and point implementers at [contracts/README.md](./contracts/README.md) + PO-locked Host Memory catalog Option in [research.md](./research.md) / [plan.md](./plan.md)
- [x] T002 [P] Inventory Host Memory-catalog touch points in `packages/experimental/agent-team/src/{types,journal,persisted,projection,index}.ts` and Desktop Host profile under `apps/desktop-host/` against [data-model.md](./data-model.md) `MemoryRecord` (prefer Lead journal path e.g. `team/memory` or split agent/user) — record findings in `specs/005-memory-productization/verifier/host-memory-inventory.md`
- [x] T003 [P] Inventory model-visible recall / instruction-bind candidates in `packages/experimental/agent-team/src/` (persona-bind / skill-bind siblings), `packages/preset/persona/src/`, and `packages/core/system-prompt/src/` for [contracts/recall.md](./contracts/recall.md) / FR-016 — `specs/005-memory-productization/verifier/memory-inject-inventory.md`
- [x] T004 [P] Document seam locks for implementers: Host Memory catalog SoT; no Electron Main memory bus; transcript ≠ curated catalog; Write Pass = UI; Recall Pass = surface + inject; kinds×layers orthogonal — `specs/005-memory-productization/verifier/memory-seam-locks.md` (research R1/R3–R7; [contracts/non-goals.md](./contracts/non-goals.md))
- [x] T005 Create Verifier recipe directory `specs/005-memory-productization/verifier/README.md` listing Scenario 1–5 owners (Runtime / Client / Electron / Verifier) mapped to [quickstart.md](./quickstart.md) and mandating FR-011/012 desktop screenshots/recordings **committed** under `verifier/evidence/` + PR embeds (SO 11+12)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared Host Memory catalog + thin-shell guard that MUST complete before ANY user story fan-out

**⚠️ CRITICAL**: No US1–US5 product work until T006–T013 land.

### Shared Host Memory model + protocol

- [ ] T006 Define Host `MemoryRecord` types/validation (`memoryId` branded opaque, `kind: profile|log|note`, `layer: agent|user`, `botId` required when `layer=agent` / absent|null when `layer=user`, `content` non-empty after trim, `createdAt`, `updatedAt`) in `packages/experimental/agent-team/src/types.ts` (and related modules named in inventory) per [data-model.md](./data-model.md)
- [ ] T007 Implement Host Memory catalog service (create/list by bot + account-wide user rows; durable store on Host journal / Agent Teams extension pattern) wired for Desktop Host in `apps/desktop-host/` + `packages/experimental/agent-team/src/{journal,persisted,index}.ts` — **not** Electron Main, **not** Client-only SoT, **not** transcript
- [ ] T008 Expose Host HTTP/WS projection + mutation APIs for memory (write/list/browse) on the authenticated Desktop Host data plane in `packages/experimental/agent-team/src/{index,projection,client}.ts` + Desktop Host wiring under `apps/desktop-host/` (session-controller / Agent Teams Remote pattern as inventory chooses) — Client MUST NOT persist SoT
- [ ] T009 [P] Document Host `MemoryRecallInject` / instruction-bind approach (scoped section sibling to persona-prefix / skill-instructions; session-log reconstructable; ≥1 curated fact for Pass) in `specs/005-memory-productization/verifier/memory-inject-bind.md` — Verifier observes wiring, **not** LLM reply wording (research R5; FR-014/016)
- [ ] T010 [P] Extend `apps/desktop/src/host-protocol.ts` comments/exclusion documentation so memory-catalog, memory-write, memory-list/browse, memory-recall, and memory-injection payloads are **forbidden** on Node IPC (same pattern as identity + skills + routines exclusions; research R7)
- [ ] T011 [P] Add architecture/regression guard that Electron Main has no parallel memory store/bus/write/recall/inject in `apps/desktop/tests/no-electron-memory-bus.spec.ts` (and document expected absence in `apps/desktop/src/ipc.ts` / `apps/desktop/src/host-protocol.ts`) per research R7 / [contracts/non-goals.md](./contracts/non-goals.md)
- [ ] T012 [P] Add regression/docs guard that P5 Pass path is **not** “transcript dump as curated memory” and **not** Client-only persistence as SoT in `specs/005-memory-productization/verifier/transcript-not-memory.md` (research R6; [contracts/non-goals.md](./contracts/non-goals.md))
- [ ] T013 Foundational checklist stamp in `specs/005-memory-productization/verifier/README.md` (T006–T012 complete; no US product work before this stamp)

**Checkpoint**: Foundation ready — Host catalog + protocol exclusions + absence guards; user stories may begin.

---

## Phase 3: User Story 1 — Write a profile memory fact (Priority: P1) 🎯 MVP

**Goal**: User writes a non-empty **profile** fact on a user-visible memory surface; Host persists curated `MemoryRecord` kind=`profile`; empty write rejected ([contracts/write-kinds.md](./contracts/write-kinds.md); SC-001 / SC-009)

**Independent Test**: On Desktop, write one non-empty profile fact; confirm it appears as saved curated profile memory; empty write rejected; leave/return without restart still shows it ([quickstart.md](./quickstart.md) Scenario 1 profile steps)

### Implementation for User Story 1

- [ ] T014 [US1] Host `createMemory` (or equivalent) for `kind=profile` validates non-empty `content` after trim; rejects empty with clear user-visible/error reason; persists `MemoryRecord` on Host catalog (`packages/experimental/agent-team/src/` / Desktop Host) per FR-001 — bot-tool write **not** required (FR-015)
- [ ] T015 [P] [US1] Client memory write surface (profile kind + layer choice per product UI) under `packages/experimental/client-ui-agent-team/src/client/` (locale strings in `packages/experimental/client-ui-agent-team/src/client/locales.ts`) calling Host HTTP/WS only (no Main IPC mutations)
- [ ] T016 [US1] Add Verifier Scenario 1 recipe in `specs/005-memory-productization/verifier/scenario-1-write-kinds.md` covering SC-001 (profile write + empty reject + leave/return) and **requiring** FR-011/012 desktop evidence under `specs/005-memory-productization/verifier/evidence/scenario-1/` (unit/jsdom alone fails); note SC-009 bot-tool absence must not fail Pass

**Checkpoint**: US1 profile write works independently with Verifier recipe + evidence path.

---

## Phase 4: User Story 2 — Write a log memory fact (Priority: P1)

**Goal**: User writes a non-empty **log** fact; Host persists `kind=log`; distinguishable from profile ([contracts/write-kinds.md](./contracts/write-kinds.md); SC-002)

**Independent Test**: Write one non-empty log fact; confirm saved as curated log memory; empty log rejected ([quickstart.md](./quickstart.md) Scenario 1 log steps)

### Implementation for User Story 2

- [ ] T017 [US2] Host `createMemory` for `kind=log` validates non-empty `content`; rejects empty; persists on Host catalog (`packages/experimental/agent-team/src/` / Desktop Host) per FR-002
- [ ] T018 [P] [US2] Client log kind on the shared memory write surface under `packages/experimental/client-ui-agent-team/src/client/` via Host RPC (locale-owned copy)
- [ ] T019 [US2] Extend `specs/005-memory-productization/verifier/scenario-1-write-kinds.md` for SC-002 (log write + empty reject + leave/return) with FR-011/012 evidence under `verifier/evidence/scenario-1/`

**Checkpoint**: US2 log write independently testable on Desktop.

---

## Phase 5: User Story 3 — Write a note memory fact (Priority: P1)

**Goal**: User writes a non-empty **note**; Host persists `kind=note`; all three kinds distinguishable on the surface ([contracts/write-kinds.md](./contracts/write-kinds.md); SC-003)

**Independent Test**: Write one non-empty note; confirm saved as curated note; empty note rejected; Scenario 1 three-kind happy path complete ([quickstart.md](./quickstart.md) Scenario 1 note steps)

### Implementation for User Story 3

- [ ] T020 [US3] Host `createMemory` for `kind=note` validates non-empty `content`; rejects empty; persists on Host catalog (`packages/experimental/agent-team/src/` / Desktop Host) per FR-003
- [ ] T021 [P] [US3] Client note kind on the shared memory write surface under `packages/experimental/client-ui-agent-team/src/client/` via Host RPC
- [ ] T022 [US3] Complete `specs/005-memory-productization/verifier/scenario-1-write-kinds.md` for SC-003 (note write + empty reject + leave/return + kinds distinguishable) and confirm SC-009 (bot-tool not required) — FR-011/012 evidence under `verifier/evidence/scenario-1/`

**Checkpoint**: US3 note write independently testable; Scenario 1 write path complete.

---

## Phase 6: User Story 4 — Recall after restart (Priority: P1)

**Goal**: After restart/durable reload, surface recall returns profile+log+note with kinds distinguishable; Host provides one model-visible inject path for ≥1 curated fact ([contracts/recall.md](./contracts/recall.md); SC-004)

**Independent Test**: With Scenario 1 facts saved, restart Desktop (or Verifier durable reload); open memory surface → three facts returned; start subsequent bot turn → Host inject path observed without scoring LLM wording ([quickstart.md](./quickstart.md) Scenario 2)

### Implementation for User Story 4

- [ ] T023 [US4] Host list/browse projection returns durable `MemoryProjection` rows across Host child restart with kinds distinguishable (`packages/experimental/agent-team/src/projection.ts` + Remote / Desktop Host) per FR-004/005 — MUST NOT treat transcript dump as Pass
- [ ] T024 [US4] Implement Host `MemoryRecallInject` bind: assemble ≥1 curated `MemoryRecord` into subsequent bot-turn context/instructions (scoped section sibling to persona/skill binds) via `packages/experimental/agent-team/src/` + `packages/preset/persona/src/` and/or `packages/core/system-prompt/src/` — reconstructable from session log (FR-016; research R5); LLM wording not scored (FR-014)
- [ ] T025 [P] [US4] Client browse/recall memory surface under `packages/experimental/client-ui-agent-team/src/client/` projecting Host list after restart; optional inject/application indicator when present
- [ ] T026 [US4] Add Verifier Scenario 2 recipe in `specs/005-memory-productization/verifier/scenario-2-recall.md` covering SC-004 (surface return of three kinds + model-visible inject path; no LLM scoring) with FR-011/012 evidence under `specs/005-memory-productization/verifier/evidence/scenario-2/`

**Checkpoint**: US4 surface + model-visible recall independently testable.

---

## Phase 7: User Story 5 — Honor agent vs user memory layers (Priority: P1)

**Goal**: Agent-scoped facts stay per-bot; user-scoped facts share across bots after save and after restart/recall; kinds remain orthogonal to layers ([contracts/layers.md](./contracts/layers.md); SC-005 / SC-010)

**Independent Test**: Save agent-scoped fact on bot A → not listed as bot B’s agent memory; save user-scoped fact → available in A and B contexts; restart still holds; optionally different kinds on either layer ([quickstart.md](./quickstart.md) Scenario 3)

### Implementation for User Story 5

- [ ] T027 [US5] Host catalog enforces `layer=agent` keyed by `botId` (bot B MUST NOT list A’s agent rows as B’s) and `layer=user` account-wide availability across bot contexts in `packages/experimental/agent-team/src/{types,journal,persisted,projection,index}.ts` per FR-006/007 / ADR — transcript MUST NOT substitute for either layer
- [ ] T028 [P] [US5] Client layer-distinguishable UI (write layer choice + browse filter/labels) under `packages/experimental/client-ui-agent-team/src/client/` via Host projection
- [ ] T029 [US5] Confirm Host + Client allow any kind on either layer (no kind→layer lock tables as Pass requirements) — document orthogonality check in `specs/005-memory-productization/verifier/scenario-3-layers.md` (FR-017 / SC-010)
- [ ] T030 [US5] Complete Verifier Scenario 3 recipe in `specs/005-memory-productization/verifier/scenario-3-layers.md` covering SC-005 (agent isolation + user sharing after save + restart/recall) and SC-010 with FR-011/012 evidence under `specs/005-memory-productization/verifier/evidence/scenario-3/`

**Checkpoint**: US5 layer honesty independently testable.

---

## Phase 8: Polish & Cross-Cutting (Non-goals, evidence, full replay)

**Purpose**: Absence checks, evidence layout, full SC-007 replay; no new product scope

- [ ] T031 [P] Create Verifier non-goals recipe `specs/005-memory-productization/verifier/non-goals.md` covering SC-006 / SC-008…010 / [contracts/non-goals.md](./contracts/non-goals.md): no Grok chrome parity beyond ADR; no P6 connectors/MCP/events; no P7 Box/Shell; **no Electron memory bus**; transcript ≠ catalog; bot-tool / edit-delete optional; no kind→layer locks; no rewrite of `specs/001`–`004`
- [ ] T032 [P] Create evidence directory placeholders + README expectations under `specs/005-memory-productization/verifier/evidence/{scenario-1,scenario-2,scenario-3,scenario-4,non-goals,scenario-5}/` documenting required screenshot/recording filenames for FR-011/012 / SO 11+12 (scenario-4 may alias non-goals docs/absence)
- [ ] T033 Add Verifier Scenario 5 full replay recipe `specs/005-memory-productization/verifier/scenario-5-full-replay.md` covering SC-007 (Scenarios 1–4 + foundational stamp) with mandatory desktop visual evidence for GUI slices
- [ ] T034 [P] Re-validate quickstart Scenario → recipe map in `specs/005-memory-productization/quickstart.md` and `specs/005-memory-productization/verifier/README.md` (owners + evidence paths)
- [ ] T035 [P] Confirm `apps/desktop/tests/no-electron-memory-bus.spec.ts` + `apps/desktop/src/host-protocol.ts` exclusions still green after story work
- [ ] T036 [P] Confirm no product edits to `specs/001-multi-model-bots/**`, `specs/002-identity-personas/**`, `specs/003-skills-ux/**`, or `specs/004-routines-cron/**` in this feature’s implement PRs — document check in `specs/005-memory-productization/verifier/README.md`
- [ ] T037 Polish: ensure no product code path documents Memory Pass as “transcript dump,” “Electron Main store,” or “Client-only SoT” in `apps/desktop-host/`, `packages/experimental/client-ui-agent-team/src/client/`, or `specs/005-memory-productization/verifier/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 → US2 → US3**: Prefer sequential on shared write surface (kinds build out Scenario 1); Host kind writes can start in parallel after T006–T008 if Client surface lands with US1
- **US4 Recall**: Depends on ≥1 written fact path (prefer US1–US3 complete for full SC-004 three-kind proof)
- **US5 Layers**: Depends on Foundational layer fields + write path (can proceed after US1 Host write exists; full SC-005 needs restart/recall awareness from US4)
- **Polish**: After desired stories complete (at least US1–US5 for phase exit)

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| US1 Write profile | Foundational T006–T013 | Profile write + empty reject + leave/return |
| US2 Write log | Foundational; prefer US1 Client surface | Log write + empty reject |
| US3 Write note | Foundational; prefer US1 Client surface | Note write + empty reject; Scenario 1 complete |
| US4 Recall | US1–US3 facts (or ≥1 each kind) + Foundational inject doc | Restart surface return + model-visible inject |
| US5 Layers | Foundational layer model + write path | Agent isolation + user sharing + orthogonality |

### Parallel Opportunities

- T002/T003/T004 inventory docs in parallel (Setup)
- T009/T010/T011/T012 inject doc + protocol + bus + transcript guards in parallel once T006–T008 started
- Within a story: Client UI [P] alongside Host once Host API contract stable
- T031/T032/T034/T035/T036 polish docs/guards in parallel

### Parallel Example: Foundational

```bash
Task: "MemoryRecord types in packages/experimental/agent-team/src/types.ts"
Task: "host-protocol.ts memory exclusions"
Task: "no-electron-memory-bus.spec.ts"
Task: "transcript-not-memory.md absence note"
Task: "memory-inject-bind.md instruction approach"
```

### Parallel Example: US1

```bash
Task: "Host createMemory kind=profile validation + persist"
Task: "Client memory write UI in client-ui-agent-team"
Task: "Verifier scenario-1-write-kinds.md + evidence path"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup
2. Complete Phase 2 Foundational (Host catalog + no Electron bus + transcript≠memory)
3. Complete Phase 3 US1 (profile write + Verifier recipe)
4. **STOP and VALIDATE** US1 independently (SC-001 / SC-009)
5. Demo Host-backed curated profile write without Main bus theater

### Incremental Delivery

1. Setup + Foundational → gate open
2. US1 → profile write MVP
3. US2 → log write
4. US3 → note write (Scenario 1 complete)
5. US4 → surface + model-visible recall after restart
6. US5 → agent vs user layers + orthogonality
7. Polish → non-goals + SO11/12 evidence layout + SC-007 full replay

### Parallel Team Strategy

1. **DH Runtime**: T006–T008, T014, T017, T020, T023–T024, T027, T029
2. **DH Client/Web**: T015, T018, T021, T025, T028
3. **DH Electron**: T010–T011 thin shell; no memory bus
4. **DH Spec + Verifier**: recipes T016/T019/T022/T026/T030/T031/T033 + FR-011/012 evidence stamping
5. **DH Verifier**: SC-001…SC-010 Pass on real desktop app with committed evidence

---

## Notes

- [P] tasks = different files, no incomplete-task dependencies
- [Story] label maps task to US1–US5 for traceability
- Verifier recipes are **required deliverables**, not optional TDD unit suites
- **PO-locked Host Memory catalog Option** is non-negotiable: Host SoT; reject Electron Main bus; prefer Agent Teams journal; transcript ≠ curated
- Clarify locks (Write UI Pass; surface+inject Recall Pass; orthogonal kinds×layers) non-negotiable
- Standing orders **11** + **12** non-negotiable on GUI recipes
- Do not rewrite specs/001–004
- Analyze + `taskstoissues` owned by [MOH-237](https://linear.app/momadhoun/issue/MOH-237/p5-spec-kit-analyze-taskstoissues-memory). Implement only after Verifier Pass on analyze. No product implement in the analyze PR.
