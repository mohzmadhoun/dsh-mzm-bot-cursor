# Tasks: Phase 3 — Skills UX

**Input**: Design documents from `/workspace/specs/003-skills-ux/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Spec does **not** request TDD unit-test tasks. Required **Verifier recipes** for FR-012 / SC-001…SC-007 and [quickstart.md](./quickstart.md) Scenarios 1–5 are implementation deliverables (not optional examples). Every GUI recipe MUST require desktop screenshots and/or short screen recordings under `verifier/evidence/` (standing order 11).

**Organization**: Shared Host skills foundations (Phase 2) **block** all user-story fan-out. Stories follow **spec priority**: US1 → US2 → US3 (all P1) → US4 (P2 thin pack / non-goals).

**Linear**: Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) · Analyze/taskstoissues [MOH-147](https://linear.app/momadhoun/issue/MOH-147/p3-spec-kit-analyze-taskstoissues-skills-ux) · Tasks [MOH-146](https://linear.app/momadhoun/issue/MOH-146/p3-spec-kit-tasks-skills-ux) Done · Project **DeepSeek Harness - Cursor** only · T001–T040 → [MOH-148](https://linear.app/momadhoun/issue/MOH-148)…[MOH-187](https://linear.app/momadhoun/issue/MOH-187) (map in [analyze-report.md](./analyze-report.md))

**Branch**: `cursor/p3-analyze-fe1d` (analyze + Linear issues; tasks authored on `cursor/p3-tasks-fe1d` / #109)

**Thin-pack skill pick (tasks lock — simplest):**

| Field | Value |
|-------|-------|
| Technical id / directory name | `mzm-thin-pack` |
| Display `name` (frontmatter) | `mzm-thin-pack` |
| Human-readable discovery label | `MzM thin pack` (via `description` / UI title) |
| Instructional body (greppable) | `Follow the MzM thin-pack playbook for Pass.` |
| Ship path (preferred) | `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md` mounted through `dsh-skill-filesystem` custom/managed root on Desktop Host profile |
| Count for Pass | Exactly **one** managed skill (research R1) |

If Runtime must relocate the on-disk root within Host seams, keep id `mzm-thin-pack` and update [verifier/thin-pack-skill.md](./verifier/thin-pack-skill.md) in the same change.

**Clarify locks (2026-09-27) — honor in every story/recipe**:

1. Author save rejects empty display name or instructional body with a clear user-visible reason (FR-013).
2. Load = making a discovered skill available to attach; no separate multi-step load ritual (FR-002).
3. Multi-attach per bot allowed; Pass proves ≥1 attachment.
4. Run = dedicated run control OR session application with UI run/active; **do not** score LLM reply wording.
5. Attached skill instructional content applies as bot instructions on subsequent turns; Verifier measures UI + assembly wiring, not LLM adherence (FR-014 / SC-007).
6. FR-012 desktop visual evidence required for all GUI scenarios (US1–US3 / SC-001…003/005).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (`[US1]`…`[US4]`) on story-phase tasks only
- Every task includes exact file paths

## Path Conventions

Desktop dual-process layout from [plan.md](./plan.md):

- Electron shell: `apps/desktop/src/`, `apps/desktop/tests/`
- Desktop Host: `apps/desktop-host/` (profile cordis + `managed-skills/`)
- Skill family: `packages/skill/skill/src/`, `packages/skill/skill-filesystem/src/`, `packages/skill/tool-skill/src/`
- Host Agent Teams / bot identity: `packages/experimental/agent-team/src/`
- Persona / instruction seam: `packages/preset/persona/src/`, `packages/core/system-prompt/src/`
- Session skills Remote (optional Client catalog): `packages/api/session-controller/`
- Client/Web Agent Teams UI: `packages/experimental/client-ui-agent-team/src/client/`
- Feature Verifier recipes: `specs/003-skills-ux/verifier/`

**Do not** rewrite `specs/001-multi-model-bots/**` or `specs/002-identity-personas/**`. **Do not** invent P4 routines, P5 memory UX, P6 plugin skills, or learn-from-demonstration tasks.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Orient implementers to P3 seams; create Verifier recipe home; lock thin-pack id; no product behavior yet

- [x] T001 Confirm feature design tree is complete (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `checklists/requirements.md`) under `specs/003-skills-ux/` and point implementers at [contracts/README.md](./contracts/README.md)
- [x] T002 [P] Inventory Host skill-catalog touch points in `packages/skill/skill/src/`, `packages/skill/skill-filesystem/src/`, `packages/skill/tool-skill/src/`, and Desktop Host profile mounts under `apps/desktop-host/` against [data-model.md](./data-model.md) Skill / Thin managed pack — record findings in `specs/003-skills-ux/verifier/host-skills-inventory.md`
- [x] T003 [P] Inventory bot-attachment + instruction-bind candidates in `packages/experimental/agent-team/src/{types,roster,index,projection}.ts`, `packages/preset/persona/src/`, and `packages/core/system-prompt/src/` for FR-003/014 / [contracts/attach-run.md](./contracts/attach-run.md) — `specs/003-skills-ux/verifier/attachment-bind-inventory.md`
- [x] T004 Create Verifier recipe directory `specs/003-skills-ux/verifier/README.md` listing Scenario 1–5 owners (Runtime / Client / Verifier) mapped to [quickstart.md](./quickstart.md) and mandating FR-012 desktop screenshots/recordings under `verifier/evidence/`
- [x] T005 Record thin-pack skill pick (`mzm-thin-pack` / display `MzM thin pack` / ship path `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md`) in `specs/003-skills-ux/verifier/thin-pack-skill.md` (research R1; FR-008)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared Host skills foundations + thin-shell guard that MUST complete before ANY user story fan-out

**⚠️ CRITICAL**: No US1–US4 product work until T006–T013 land.

### Shared Host skills model + thin pack ship

- [x] T006 Ship the single thin-pack managed skill as `apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md` with YAML frontmatter `name: mzm-thin-pack`, human-readable `description` including `MzM thin pack`, and instructional body containing exact greppable text `Follow the MzM thin-pack playbook for Pass.` — exactly one managed skill for Pass ([contracts/thin-managed-pack.md](./contracts/thin-managed-pack.md); research R1)
- [x] T007 Mount `apps/desktop-host/managed-skills/` (and a Host-durable user skills root) via `dsh-skill-filesystem` / Desktop Host cordis profile under `apps/desktop-host/` so `ctx.skills` lists `mzm-thin-pack` at runtime (research R2)
- [x] T008 Extend Host Bot identity types with `skillAttachments` (ordered list of `{ botId, skillId }` associations; ≥0 items; same skill may attach to multiple bots independently) in `packages/experimental/agent-team/src/types.ts` per [data-model.md](./data-model.md) — do not change P1 `modelAssignment` or P2 persona/avatar/section ownership
- [x] T009 Persist `skillAttachments` Host-durably with the Team roster / journal path in `packages/experimental/agent-team/src/{roster,journal,persisted}.ts` (and related persistence helpers) so restart/reload retains attachments (FR-005; research R4)
- [x] T010 Add Host mutation request/result types for skill attach (and optional detach stub not required for Pass), plus user-authored skill create/update with **non-empty** `displayName` and **non-empty** `instructionalBody` validation at the save boundary, in `packages/experimental/agent-team/src/types.ts` and Remote/service stubs in `packages/experimental/agent-team/src/index.ts` — Electron Main MUST NOT invent skill or attachment records (research R1/R3/R4)
- [x] T011 [P] Project skill catalog summaries + per-bot `skillAttachments` to Client-readable views in `packages/experimental/agent-team/src/projection.ts` (and/or session `skills/list` under `packages/api/session-controller/` if Client already consumes it) without Electron IPC synthesis
- [x] T012 [P] Document Host instruction-bind approach for attached skill instructional bodies via `packages/preset/persona/` / `packages/core/system-prompt/` (compose into bot instructions on subsequent turns after attach) in `specs/003-skills-ux/verifier/instruction-bind.md` — Verifier observes wiring, **not** LLM reply wording (clarify lock 5; SC-007)
- [x] T013 [P] Add architecture/regression guard that Electron Main has no parallel skill-catalog / attachment / authoring store or bus in `apps/desktop/tests/no-electron-skills-bus.spec.ts` (and document expected absence in `apps/desktop/src/ipc.ts` / `apps/desktop/src/host-protocol.ts`) per research R2/R4
- [x] T014 Record foundational Pass checklist (thin-pack ship + mount + attachment types/persistence + mutation stubs + projection + instruction-bind doc + no Electron skills bus) in `specs/003-skills-ux/verifier/README.md` — product SC-001…SC-007 not Done without these foundations

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Discover and load skills (Priority: P1) 🎯 MVP

**Goal**: User discovers the thin managed pack (and any user skills) and makes a skill available to attach (load); persists across restart/reload (FR-001, FR-002; SC-001)

**Independent Test**: Open skills discovery; see `mzm-thin-pack` / MzM thin pack; make it available to attach; confirm after leave/return and restart/reload; file FR-012 desktop visual evidence ([quickstart.md](./quickstart.md) Scenario 1)

### Implementation for User Story 1

- [x] T015 [US1] Ensure Host skill catalog returns the managed thin-pack skill (and user-authored skills when present) to Client via projection / `skills/list` path used by Desktop Web — `packages/experimental/agent-team/src/projection.ts` and/or `packages/api/session-controller/` ([contracts/discover-load.md](./contracts/discover-load.md))
- [ ] T016 [US1] Add Client/Web skills discovery/library surface under `packages/experimental/client-ui-agent-team/src/client/` (and locale strings in `packages/experimental/client-ui-agent-team/src/client/locales.ts`) listing managed + user skills with human-readable names — happy path, no config-file edit
- [ ] T017 [US1] Implement load = select / make-available-to-attach in Client (no separate multi-step load wizard required) under `packages/experimental/client-ui-agent-team/src/client/` so a discovered skill can enter the attach flow (clarify lock 2; FR-002)
- [ ] T018 [US1] On Host catalog unavailable, show clear user-visible failure (no silent empty success) in `packages/experimental/client-ui-agent-team/src/client/` + Host error path
- [x] T019 [US1] Add Verifier Scenario 1 recipe in `specs/003-skills-ux/verifier/scenario-1-discover-load.md` covering SC-001 (discover `mzm-thin-pack`, available-to-attach, survive restart/reload) and **requiring** desktop screenshot(s) and/or short screen recording under `specs/003-skills-ux/verifier/evidence/scenario-1/` (FR-012; unit/jsdom alone fails)

**Checkpoint**: US1 independently testable after foundational Pass

---

## Phase 4: User Story 2 — Attach and run a skill on a bot (Priority: P1)

**Goal**: User attaches a loaded skill to a specific bot; run/active is observable; attachment persists; instruction bind on subsequent turns; per-bot isolation (FR-003…005, FR-014; SC-002, SC-006, SC-007)

**Independent Test**: Attach managed skill to bot A; confirm not on bot B; run via control or session with UI run/active; restart retains attachment; FR-012 evidence ([quickstart.md](./quickstart.md) Scenario 2)

### Implementation for User Story 2

- [ ] T020 [US2] Implement Host `attachSkill` (or equivalent) accepting existing Bot id + available `skillId`, appending to that bot’s `skillAttachments` (multi-attach allowed; Pass ≥1) in `packages/experimental/agent-team/src/{index,roster}.ts` — must not auto-attach other bots ([contracts/attach-run.md](./contracts/attach-run.md); clarify lock 3)
- [ ] T021 [US2] Bind attached skill instructional bodies into that bot’s instruction assembly for subsequent turns via `packages/preset/persona/src/` and/or `packages/core/system-prompt/src/` from Agent Teams scope wiring under `packages/experimental/agent-team/src/` (FR-014; clarify lock 5)
- [ ] T022 [P] [US2] Project per-bot attachments to Client so bot skills/overview can render attached skills without Main-owned storage — `packages/experimental/agent-team/src/projection.ts`
- [ ] T023 [US2] Add Client per-bot skills/overview attach UI under `packages/experimental/client-ui-agent-team/src/client/` showing attachments on **that bot’s** surface (global catalog alone insufficient for Pass)
- [ ] T024 [US2] Add Client run/active indication: dedicated run control **and/or** session-active UI when attached skill applies — `packages/experimental/client-ui-agent-team/src/client/` (clarify lock 4; FR-004); do **not** require LLM reply text match
- [ ] T025 [US2] On attach while Host unavailable, show clear failure and leave prior attachments unchanged — Client error surface + Host reject path in `packages/experimental/agent-team/src/` / `packages/experimental/client-ui-agent-team/src/client/`
- [ ] T026 [US2] Add Verifier Scenario 2 recipe in `specs/003-skills-ux/verifier/scenario-2-attach-run.md` covering SC-002 (attach + run/active + persist), SC-006 (per-bot), SC-007 (instruction assembly wiring; **do not** score LLM replies), and **requiring** FR-012 desktop evidence under `specs/003-skills-ux/verifier/evidence/scenario-2/`

**Checkpoint**: US2 independently testable (needs ≥1 bot from P1/P2 + US1 load path)

---

## Phase 5: User Story 3 — Author a reusable skill (Priority: P1)

**Goal**: One in-app authoring path creates/edits user skills with non-empty name + body; reject empty; appears in discovery; attach/run like managed (FR-006, FR-007, FR-013; SC-003)

**Independent Test**: Reject empty save; author non-empty skill; see in discovery; attach to a bot; FR-012 evidence ([quickstart.md](./quickstart.md) Scenario 3)

### Implementation for User Story 3

- [ ] T027 [US3] Implement Host user-skill create/update writing to the Host-durable user skills root (filesystem provider user directory or equivalent under Desktop Host / `dsh-skill-filesystem`) with validation: `displayName` MUST be non-empty; `instructionalBody` MUST be non-empty; reject otherwise with clear reason — `packages/experimental/agent-team/src/` and/or skill-filesystem write helpers ([contracts/skill-authoring.md](./contracts/skill-authoring.md); FR-013)
- [ ] T028 [US3] Ensure rejected empty saves do **not** appear as saved discoverable skills in catalog projection — `packages/experimental/agent-team/src/projection.ts` / skill provider watch path
- [ ] T029 [US3] Add Client skill-authoring create/edit surface under `packages/experimental/client-ui-agent-team/src/client/` (locale strings in `locales.ts`) with clear reject messaging for empty name or body
- [ ] T030 [US3] Wire authored skills into discovery (US1 surface) and attach/run (US2 path) so user skills behave like managed for Pass — `packages/experimental/client-ui-agent-team/src/client/`
- [ ] T031 [US3] Add Verifier Scenario 3 recipe in `specs/003-skills-ux/verifier/scenario-3-skill-authoring.md` covering SC-003 (reject empty + happy-path author + discovery) and **requiring** FR-012 desktop evidence under `specs/003-skills-ux/verifier/evidence/scenario-3/`

**Checkpoint**: US3 independently testable after foundational Pass (discovery UI from US1 recommended)

---

## Phase 6: User Story 4 — Thin managed pack (not full catalog) (Priority: P2)

**Goal**: Bound Pass to exactly one managed skill; absence of full inventory / learn-from-demo / plugin skills does not fail (FR-008…010; SC-004)

**Independent Test**: Discovery shows single thin-pack managed skill; non-goals absence checks pass ([quickstart.md](./quickstart.md) Scenario 4)

### Implementation for User Story 4

- [ ] T032 [US4] Assert Desktop discovery lists exactly one `source=managed` skill (`mzm-thin-pack`) for Pass environments — document measurement in `specs/003-skills-ux/verifier/thin-pack-skill.md` and guard/test as needed under `apps/desktop-host/` or Agent Teams tests ([contracts/thin-managed-pack.md](./contracts/thin-managed-pack.md))
- [ ] T033 [US4] Add Verifier non-goals recipe in `specs/003-skills-ux/verifier/non-goals.md` confirming Pass does **not** require full inventory §6 catalog, learn-from-demonstration, or plugin/connector skills (SC-004; FR-009/010)
- [ ] T034 [US4] Add Verifier Scenario 4 checklist stub in `specs/003-skills-ux/verifier/scenario-4-thin-pack.md` linking thin-pack count + non-goals (GUI screenshot optional for this docs/absence scenario)

**Checkpoint**: US4 bounds catalog scope for phase Done

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full replay, evidence layout, quickstart cross-links, analyze readiness

- [ ] T035 [P] Create evidence directory placeholders + README expectations under `specs/003-skills-ux/verifier/evidence/{scenario-1,scenario-2,scenario-3,non-goals,scenario-5}/` documenting required screenshot/recording filenames for FR-012
- [ ] T036 Add Verifier Scenario 5 full Phase 3 replay recipe in `specs/003-skills-ux/verifier/scenario-5-full-replay.md` covering SC-005 (re-run Scenarios 1–3 with FR-012 evidence; foundational Pass required first)
- [ ] T037 [P] Cross-link [quickstart.md](./quickstart.md) Scenarios 1–5 to landed `verifier/scenario-*.md` recipes (and recipes back to quickstart) — Spec validates link coverage only
- [ ] T038 [P] Re-validate Out-of-Scope / non-goals absence (full catalog, learn-from-demo, plugin skills, memory UX, routines, MCP, Box/Shell, detach-as-Pass-gate) in `specs/003-skills-ux/verifier/non-goals.md`
- [ ] T039 Update `specs/003-skills-ux/verifier/README.md` Scenario 1–5 owners map + foundational Pass stamp section to match P2 pattern
- [ ] T040 Confirm no edits to `specs/001-multi-model-bots/**` or `specs/002-identity-personas/**` in this feature’s implement PRs (document check in `specs/003-skills-ux/verifier/README.md`)

**Checkpoint**: Analyze **PASS** + Linear T001–T040 filed (MOH-148…MOH-187). Await Verifier/Lead analyze gate → implement → Verifier product gate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1–US3 (P1)**: After Foundational; can parallelize with staffing; recommended order US1 → US2 → US3 (attach needs discover; author plugs into both)
- **US4 (P2)**: After thin-pack ship (T006) + discovery exists; can parallel late US1
- **Polish**: After story recipes exist (T019/T026/T031/T033)

### User Story Dependencies

- **US1 (P1)**: After Foundational — MVP discover/load
- **US2 (P1)**: After Foundational; needs available skill (US1 load path or Host catalog)
- **US3 (P1)**: After Foundational; discovery UI from US1 recommended for SC-003 observation
- **US4 (P2)**: Bounds pack; depends on T006 + discovery listing

### Within Each User Story

- Host data/API before Client UI
- Client surfaces before Verifier recipe Pass claims
- Story Verifier recipe before marking story Done
- Quote data-model constraints verbatim (non-empty author fields; multi-attach; per-bot; exactly one managed skill)

### Parallel Opportunities

- T002/T003/T005 (setup inventories + thin-pack doc)
- T011/T012/T013 after T008–T010 started
- After Foundational: US4 docs (T032–T034) can parallel US1 Client work
- US2 Host attach (T020) can parallel US3 Host author (T027) once types exist
- Polish T035/T037/T038 can parallel after recipes exist

---

## Parallel Example: Foundational (Phase 2)

```bash
# After T008–T010 types/persistence/mutations land:
Task: "Project attachments in packages/experimental/agent-team/src/projection.ts"
Task: "Document instruction-bind in specs/003-skills-ux/verifier/instruction-bind.md"
Task: "No Electron skills bus guard in apps/desktop/tests/no-electron-skills-bus.spec.ts"
```

## Parallel Example: User Story 1

```bash
# After catalog projection exists:
Task: "Client discovery UI in packages/experimental/client-ui-agent-team/src/client/"
Task: "Verifier scenario-1-discover-load.md with FR-012 evidence path"
```

## Parallel Example: User Stories 2 & 3 Host

```bash
# After Foundational:
Task: "Host attachSkill in packages/experimental/agent-team/src/"
Task: "Host user-skill create/update with non-empty validation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup
2. Complete Phase 2 Foundational (including `mzm-thin-pack` ship)
3. Complete Phase 3 US1 (discover/load + FR-012 recipe)
4. **STOP and VALIDATE** US1 independently (SC-001)
5. Demo thin-pack discovery without full catalog theater

### Incremental Delivery

1. Setup + Foundational → gate open
2. US1 → discover/load MVP
3. US2 → attach/run + instruction bind
4. US3 → authoring (reject empty)
5. US4 → thin pack / non-goals bounds
6. Polish → full Verifier replay (SC-005) + evidence layout

### Parallel Team Strategy

1. DH Runtime: T006–T011, then US1 Host / US2 Host / US3 Host
2. DH Client/Web: US1 discovery, US2 attach/run UI, US3 authoring
3. DH Electron: keep shell thin (T013); no skills bus
4. DH Spec + Verifier: recipes T019/T026/T031/T033/T036 + FR-012 evidence stamping
5. DH Verifier: SC-001…SC-007 Pass evidence on real desktop app

---

## Notes

- [P] = different files, no incomplete-task dependency
- [USn] maps to spec user stories for Linear `taskstoissues` traceability
- First executable product increment = US1 discover/load after Foundational — not full attach/author
- Thin-pack id locked here as `mzm-thin-pack`; relocate only with `verifier/thin-pack-skill.md` update
- FR-012 / standing order 11 is non-negotiable on GUI recipes — vitest/jsdom alone fails those scenarios
- Do not invent learn-from-demonstration, plugin skills, routines, memory UX, MCP, or Box/Shell tasks
- Commit after each task or logical group during implement; this Spec change commits `tasks.md` under `specs/003-skills-ux/`
- **Next after Verifier/Lead Pass on analyze:** implement Host foundations T006–T014 (MOH-153…MOH-161) before US fan-out; do not start implement while MOH-147 is still gated

## Task count summary

| Phase | Tasks | Count |
|-------|-------|-------|
| Setup | T001–T005 | 5 |
| Foundational | T006–T014 | 9 |
| US1 Discover/load | T015–T019 | 5 |
| US2 Attach/run | T020–T026 | 7 |
| US3 Author | T027–T031 | 5 |
| US4 Thin pack | T032–T034 | 3 |
| Polish | T035–T040 | 6 |
| **Total** | T001–T040 | **40** |
