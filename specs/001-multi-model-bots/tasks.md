# Tasks: Phase 1 Wedge A — Multi-Model Bots

**Input**: Design documents from `/workspace/specs/001-multi-model-bots/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [architecture.md](./architecture.md), [quickstart.md](./quickstart.md)

**Tests**: Spec does **not** request TDD unit-test tasks. Required **Verifier / Electron scripts** for FR-013 / SC-007 and product SC paths are implementation deliverables (not optional examples).

**Organization**: Topology handshake (DH Electron + DH Verifier) is Phase 2 foundational and **blocks** all user-story fan-out. Stories then follow spec priority (US1→US4).

**Linear**: Epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37) · Tasks issue [MOH-44](https://linear.app/momadhoun/issue/MOH-44) · Project **DeepSeek Harness - Cursor** only · Issues from stories via later `/speckit-taskstoissues` (not this file)

**Branch**: `cursor/p1-analyze-92fa` (from `cursor/p1-tasks-92fa`; stacked on specify tip)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (`[US1]`…`[US4]`) on story-phase tasks only
- Every task includes exact file paths

## Path Conventions

Desktop dual-process layout from [plan.md](./plan.md):

- Electron shell: `apps/desktop/src/`, `apps/desktop/tests/`
- Desktop Host: `apps/desktop-host/src/`
- Host runtime: `packages/core/agent/`, `packages/llm/`, `packages/credentials/`, `packages/experimental/agent-team*`
- Client/Web under Desktop: `packages/client/ui-*`, `packages/experimental/client-ui-agent-team/`
- Feature Verifier recipes: `specs/001-multi-model-bots/verifier/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Orient implementers to existing seams; create Verifier recipe home; no product behavior yet

- [x] T001 Confirm feature design tree is complete (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `architecture.md`, `quickstart.md`, `contracts/*`) under `specs/001-multi-model-bots/` and point implementers at [contracts/README.md](./contracts/README.md)
- [ ] T002 [P] Inventory Shell↔Host spawn/IPC/document surfaces in `apps/desktop/src/host-process.ts`, `apps/desktop/src/host-protocol.ts`, `apps/desktop/src/ipc.ts`, `apps/desktop/src/web-document.ts`, and `apps/desktop-host/src/index.ts` against [contracts/topology-handshake.md](./contracts/topology-handshake.md)
- [x] T003 [P] Inventory Host reuse touch points for P1: `packages/core/agent/src/model-selection.ts`, `packages/experimental/agent-team/src/{types,roster,mailbox,index}.ts`, `packages/experimental/agent-team-profile/cordis.patch.yml`, `packages/credentials/credentials-local/`, `packages/client/ui-settings-models/src/client/`, `packages/client/ui-chat/`, `packages/experimental/client-ui-agent-team/`
- [ ] T004 Create Verifier recipe directory `specs/001-multi-model-bots/verifier/README.md` listing Scenario 0–5 owners (Electron / Verifier / Runtime / Client) mapped to [quickstart.md](./quickstart.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Topology handshake gate + shared Host foundations that MUST complete before ANY user story fan-out

**⚠️ CRITICAL**: No US1–US4 product work until T005–T008 Pass evidence is recorded. T009–T013 complete shared Host composition before story implementation.

### Topology handshake first (DH Electron + DH Verifier) — SC-007 / FR-013

- [ ] T005 Implement Electron-owned topology handshake automation in `apps/desktop/tests/topology-handshake.spec.ts` (helpers under `apps/desktop/tests/topology/` as needed) covering Architect criteria: single Desktop Host spawn with `ELECTRON_RUN_AS_NODE`, Node IPC `ready` `{ url }` lifecycle-only, primary frame `dsh-app://`, authenticated HTTP + ≥1 WS/stream to Host URL, ordered shutdown → `shutdown-complete`/clean exit — per [contracts/topology-handshake.md](./contracts/topology-handshake.md) and [architecture.md](./architecture.md) Verifier criteria
- [ ] T006 [P] Implement Verifier-owned Scenario 0 evidence runner recipe in `specs/001-multi-model-bots/verifier/scenario-0-topology.md` (and optional driver under `apps/desktop/tests/topology/verifier-scenario-0.ts`) that records pass/fail log + one screenshot/trace of `ready` + authenticated Host round-trip
- [ ] T007 [P] Add negative-path assertion that fake mailbox / bot-message over Electron IPC is rejected or impossible (no Main handler) in `apps/desktop/tests/topology-handshake.spec.ts` and document the expected absence in `apps/desktop/src/ipc.ts` / `apps/desktop/src/host-protocol.ts`
- [ ] T008 Record handshake Pass/Fail evidence location and gate rule (“product SC-001…SC-006 not Done without handshake Pass”) in `specs/001-multi-model-bots/verifier/README.md` and cross-link SC-007 in `specs/001-multi-model-bots/spec.md` Assumptions (no FR text rewrite unless clarify needed)

**Checkpoint**: Topology handshake scripts exist; Verifier can record SC-007 Pass before feature fan-out

### Shared Host / composition foundations

- [x] T009 Mount experimental Agent Teams for P1 Desktop Host composition via `packages/experimental/agent-team-profile/` (+ `packages/experimental/agent-team-web-profile/` if Client panel required) into `$DSH_HOME/profiles/desktop` / Desktop Host packaging paths under `apps/desktop/` / `apps/desktop-host/` — mailbox only; do not productize task board (research R9)
- [ ] T010 [P] Confirm P1 desktop Host remains chat-oriented without local Shell/Box backends for acceptance in Desktop profile composition under `apps/desktop/` / `apps/desktop-host/` and `packages/bundle/` (FR-010); document non-goal absence check in `specs/001-multi-model-bots/verifier/non-goals.md`
- [ ] T011 [P] Confirm in-app credentials primary path uses Host `ctx.credentials` + `packages/credentials/credentials-local/` under `$DSH_HOME` with no secret IPC in `apps/desktop/src/preload-*.ts` / `apps/desktop/src/ipc.ts` (FR-008/009; research R4)
- [x] T012 Close Architect runtime gap: extend teammate spawn so each bot receives its own LLM `ModelSelection` / `agentOptions` at create — update `packages/experimental/agent-team/src/types.ts` (`SpawnTeammateRequest`), `packages/experimental/agent-team/src/roster.ts`, and call sites so Electron Main never routes models ([contracts/bot-create-model.md](./contracts/bot-create-model.md))
- [x] T013 [P] Ensure per-bot agent scope isolates model assignment and does not share another bot’s tool privilege by default via `packages/core/agent/` scope wiring and Team spawn (FR-011); tools in P1 acceptance MUST NOT send/post externally (FR-012) — document trust floor in `specs/001-multi-model-bots/verifier/trust-floor.md`

**Checkpoint**: Foundation ready — user story implementation can begin (after handshake Pass)

---

## Phase 3: User Story 1 — Create bots with different models (Priority: P1) 🎯 MVP

**Goal**: User creates ≥2 bots with distinct configured model/provider assignments and completes a multi-model work session inside the app (FR-001…003, FR-007, FR-011; SC-001, SC-002)

**Independent Test**: On a clean machine with valid credentials available, create ≥2 bots with any two distinct configured `(provider, model)` assignments and complete one multi-model session entirely in-app ([quickstart.md](./quickstart.md) Scenario 2)

### Implementation for User Story 1

- [x] T014 [US1] Define Host bot-create API (Lead-authorized teammate spawn or equivalent RPC) accepting required `displayName` (non-empty) + exactly one model/provider assignment in Host surfaces under `packages/experimental/agent-team/src/` and/or `packages/api/session-controller/src/agent.ts` — persistence Host-owned ([data-model.md](./data-model.md) Bot rules)
- [ ] T015 [P] [US1] Bind each Bot to one `ModelSelection` `{ provider, model, reasoningEffort? }` via `packages/core/agent/src/model-selection.ts` / `installModelSelection` so subsequent chats use that bot’s assignment only (FR-002)
- [ ] T016 [US1] Resolve model calls through `ctx.llm` adapters under `packages/llm/` using the bot’s assignment and Host credential resolve — Electron Main MUST NOT invent bot records or route models
- [x] T017 [US1] Add Client/Web basic create + assign-model UI (happy path, no config-file edit) under `packages/client/` (prefer `ui-agent-preset` / `ui-model-selection` / Agent Team client surfaces) composed into Desktop Web wrapper — minimum inputs: `displayName` + model/provider ([contracts/bot-create-model.md](./contracts/bot-create-model.md))
- [x] T018 [US1] Enforce Verifier “different models” = any two distinct configured `(provider, model)` assignments in environment (no fixed marketing catalog) in create/session validation messaging near Client model pickers and Verifier recipe `specs/001-multi-model-bots/verifier/scenario-2-multi-model.md`
- [x] T019 [US1] Document clean-machine TTFT path (< 30 min to first multi-model team session) in `specs/001-multi-model-bots/verifier/scenario-2-multi-model.md` with wall-clock recording fields for SC-001
- [x] T020 [US1] Wire missing-credential create/chat failure to direct user to in-app credential entry (not 1Password) — Host/Client handoff into Models settings (`packages/client/ui-settings-models/`); full dump hygiene lands in US4

**Checkpoint**: US1 independently testable after handshake Pass + credentials available

---

## Phase 4: User Story 2 — Async 1:1 bot-to-bot handoff (Priority: P1)

**Goal**: Bot A sends async 1:1 via Host mailbox; B acts or handoff stays visible; no copy-paste; no Electron parallel bus (FR-004, FR-005; SC-003)

**Independent Test**: With ≥2 bots, trigger one async 1:1 A→B and confirm B acts or handoff is visible in-app ([quickstart.md](./quickstart.md) Scenario 3)

### Implementation for User Story 2

- [x] T021 [US2] Implement/confirm Host mailbox send path Bot A→Bot B using Agent Teams Lead-log mailbox → target inbox in `packages/experimental/agent-team/src/mailbox.ts` / `session-message.ts` / `SendTeamMessageRequest` in `packages/experimental/agent-team/src/types.ts` (`deliveryState`: `queued` → `delivered` → `acted` | `visible-pending`)
- [x] T022 [P] [US2] Persist durable Host mailbox message fields (`id`, `fromBotId`, `toBotId`, `body`, `createdAt`, `deliveryState`, `source` Host-only) per [data-model.md](./data-model.md) — `source` MUST NOT be Electron IPC
- [x] T023 [US2] Expose handoff observability to Client via Host session/RPC projections (not Main-synthesized IPC) in `packages/experimental/agent-team/src/projection.ts` and `packages/experimental/client-ui-agent-team/`
- [x] T024 [US2] Render user-visible handoff / pending / recipient follow-up in Desktop Web chat surfaces under `packages/client/ui-chat/` / `packages/client/ui-conversation/` and Agent Team UI so copy-paste is not required
- [x] T025 [US2] Add Verifier Scenario 3 recipe in `specs/001-multi-model-bots/verifier/scenario-3-mailbox.md` asserting Host mailbox path and failing if delivery required Electron IPC bus ([contracts/host-mailbox-1to1.md](./contracts/host-mailbox-1to1.md))
- [x] T026 [P] [US2] Add architecture/regression guard (test or static check) documenting forbidden Electron bot↔bot messaging bus in `apps/desktop/tests/topology-handshake.spec.ts` or `apps/desktop/tests/no-electron-mailbox-bus.spec.ts`

**Checkpoint**: US2 independently testable (needs ≥2 bots from US1)

---

## Phase 5: User Story 3 — Usable desktop session UI (Priority: P2)

**Goal**: One desktop window supports create-bot, assign-model, chat progress+final, and observe-handoff without developer tooling (FR-006, FR-007; SC-004, SC-005)

**Independent Test**: Complete Stories 1–2 using only the shipped desktop UI ([quickstart.md](./quickstart.md) Scenarios 2–4)

### Implementation for User Story 3

- [x] T027 [US3] Ensure Desktop Electron thin shell loads Web client (`dsh-app://`) without adding mailbox/credential/model router in Main — verify `apps/desktop/src/main.ts`, `apps/desktop/src/web-document.ts`, `apps/desktop/src/backend-controller.ts` stay lifecycle/HTTP-forward only
- [x] T028 [P] [US3] Wire create-bot + assign-model controls into operable Desktop session chrome (Web under Electron) so happy path needs no config-file editing — Client packages under `packages/client/` composed by Desktop Host profile
- [x] T029 [US3] Render chat progress from Host session/agent stream events (≥1 progress update before completion on scripted path) in `packages/client/ui-chat/` / conversation cards — shell MUST NOT synthesize a parallel progress protocol ([contracts/chat-progress-final.md](./contracts/chat-progress-final.md))
- [ ] T030 [US3] Deliver final result in chat on turn completion / assistant (or handoff) result from session log; support optional `linkedMailboxMessageId` attribution when turn is caused by mailbox message ([data-model.md](./data-model.md) Chat turn)
- [ ] T031 [US3] Make 1:1 handoff / recipient action understandable on relevant chat surfaces without leaving the app — wire US2 projections from `packages/experimental/client-ui-agent-team/` into `packages/client/ui-chat/` / `packages/client/ui-conversation/` under Desktop
- [x] T032 [US3] Add Verifier Scenario 4 recipe in `specs/001-multi-model-bots/verifier/scenario-4-progress-final.md` for SC-004 (≥1 progress + final)

**Checkpoint**: US3 operable for a real work session without Grok chrome parity

---

## Phase 6: User Story 4 — In-app auth for providers (Priority: P2)

**Goal**: Primary credential entry/storage is in-app; secrets off renderer and out of dumps; env/keyfile = dev/CI only (FR-008, FR-009, FR-012; SC-006)

**Independent Test**: Store credentials via in-app flow; bot can use them; session export/dump review contains no raw secrets ([quickstart.md](./quickstart.md) Scenario 1)

### Implementation for User Story 4

- [x] T033 [US4] Implement/confirm Models / settings write-only credential entry UI in `packages/client/ui-settings-models/src/client/` storing secrets via Host `CredentialRef` in `packages/credentials/credentials-local/` — UI may show non-secret `CredentialInfo` only
- [x] T034 [P] [US4] Ensure preload/renderer never receive raw secrets: audit `apps/desktop/src/preload-*.ts` and `apps/desktop/src/ipc.ts` for absence of credential secret APIs ([contracts/in-app-credentials.md](./contracts/in-app-credentials.md))
- [x] T035 [US4] On missing credential for needed provider, direct user to in-app entry (not 1Password connector product flow) via `packages/client/ui-settings-models/src/client/` navigation; on invalid/revoked mid-session show clear failure + re-entry offer in that UI with no silent fallback to another bot’s credentials in Host resolve under `packages/credentials/`
- [x] T036 [US4] Document env/key-file credentials as dev/CI-only secondary path in Desktop/Host docs touching credentials (`packages/credentials/credentials-local/README.md` and/or `specs/001-multi-model-bots/verifier/scenario-1-credentials.md`) — product primary remains in-app (FR-009)
- [x] T037 [US4] Add Verifier Scenario 1 recipe in `specs/001-multi-model-bots/verifier/scenario-1-credentials.md` proving bot auth with in-app credential and SC-006 dump/transcript export contains no raw provider secrets

**Checkpoint**: US4 independently testable; unlocks clean SC-001/002 evidence with in-app primary auth

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full Verifier replay, non-goals, open-gap docs, no scope creep

- [ ] T038 [P] Add Verifier Scenario 5 full Phase 1 replay recipe in `specs/001-multi-model-bots/verifier/scenario-5-full-replay.md` (SC-005) requiring Scenario 0 Pass first
- [x] T039 [P] Document explicit non-goals absence checks (Box/Shell, MCP/1Password vault, personas/skills/routines/memory product UX, pixel Grok chrome) in `specs/001-multi-model-bots/verifier/non-goals.md`
- [x] T040 Track open B for PO/Lead: amend program plan freeze string “framed pipes” → shipped HTTP/WS data plane in `MzM-Docs/mzm-bot-plan.md` (note only; do not block implement) — cross-link from `specs/001-multi-model-bots/research.md` R1
- [x] T041 [P] Link `specs/001-multi-model-bots/architecture.md` Handoff section to `tasks.md` and note analyze → taskstoissues complete / implement next (no FR rewrite)
- [ ] T042 Run `specs/001-multi-model-bots/quickstart.md` Scenario 0–5 validation outline against Verifier recipes and fix recipe gaps (no feature code in Spec role — implementers execute)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
  - T005–T008 (topology) before any product Done claims
  - T009–T013 (Teams mount, chat-only Host, credentials store, spawn ModelSelection, trust floor) before story implementation
- **User Stories (Phases 3–6)**: All depend on Foundational completion
  - Prefer priority order US1 → US2 → US3 → US4 for single-threaded delivery
  - US2 needs ≥2 bots (US1)
  - US3 integrates US1–US2 UI surfaces
  - US4 can proceed in parallel with US2/US3 after T011; needed for SC-001/002/006 Pass evidence with in-app primary
- **Polish (Phase 7)**: Depends on stories intended for wedge exit (US1–US4)

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — MVP; needs credentials available (T011 + preferably US4 for SC-006-clean evidence)
- **User Story 2 (P1)**: After Foundational; practical dependency on US1 bots existing; independently testable once ≥2 bots present
- **User Story 3 (P2)**: After Foundational; integrates US1–US2; independently testable as “operable UI only” once those Host paths exist
- **User Story 4 (P2)**: After Foundational (T011); independently testable; recommended before claiming SC-001/002 Done with in-app primary

### Within Each User Story

- Host data/API before Client UI
- Client projections before Verifier recipe Pass claims
- Story Verifier recipe before marking story Done

### Parallel Opportunities

- T002/T003 (setup inventories); T006/T007; T010/T011/T013 after T009 started
- After Foundational: Client US3 chrome (T028–T031) can parallel Runtime US2 mailbox (T021–T022) if bots exist
- US4 (T033–T037) can parallel US2 once T011 done
- Polish T038/T039/T041 can parallel after recipes exist

---

## Parallel Example: Topology gate (Phase 2)

```bash
# After T005 skeleton exists, launch evidence + negative in parallel:
Task: "Verifier Scenario 0 recipe in specs/001-multi-model-bots/verifier/scenario-0-topology.md"
Task: "Negative IPC mailbox assertion in apps/desktop/tests/topology-handshake.spec.ts"
```

## Parallel Example: User Story 1

```bash
# After T014 Host create API lands:
Task: "Bind ModelSelection in packages/core/agent/src/model-selection.ts"
Task: "Verifier scenario-2 recipe in specs/001-multi-model-bots/verifier/scenario-2-multi-model.md"
```

## Parallel Example: User Story 2

```bash
# After mailbox send path exists:
Task: "Persist mailbox fields in packages/experimental/agent-team/src/mailbox.ts"
Task: "Architecture guard apps/desktop/tests/no-electron-mailbox-bus.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup
2. Complete Phase 2 Foundational — **topology handshake Pass required**
3. Complete Phase 3 US1 (+ enough credentials path to authenticate)
4. **STOP and VALIDATE** US1 independently (SC-001/002 path)
5. Demo multi-model session without Alt-Tab

### Incremental Delivery

1. Setup + Foundational (handshake + Teams + spawn ModelSelection) → gate open
2. US1 → multi-model bots MVP
3. US2 → Host mailbox 1:1
4. US3 → operable Desktop UI polish of those paths
5. US4 → in-app auth primary + dump hygiene
6. Polish → full Verifier replay (SC-005) + non-goals

### Parallel Team Strategy

1. DH Electron + DH Verifier: T005–T008 together
2. DH Runtime: T009, T012, T013 then US1 Host / US2 mailbox
3. DH Client/Web: US1 create UI, US3 chat, US4 Models entry
4. DH Electron (ongoing): keep shell thin (T027); no parallel bus (T026)

---

## Notes

- [P] = different files, no incomplete-task dependency
- [USn] maps to spec user stories for Linear `taskstoissues` traceability
- First executable product gate = topology handshake (T005–T008), not bot create
- Do not invent Box/Shell, MCP, personas, skills, routines, or memory product tasks
- Exact Host bot-create API closed as `TeamService.createBot` / Remote `agentTeams/createBot` (T014; plan open gap #2)
- Experimental Agent Teams mount for P1 with promotion deferred — Lead/Mohammed ack still open (research R9)
- Commit after each task or logical group during implement; this Spec change commits only `tasks.md` (+ plan pointer if edited)
