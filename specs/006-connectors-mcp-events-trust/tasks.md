# Tasks: Phase 6 — Connectors / MCP + event routines + trust

**Input**: Design documents from `/workspace/specs/006-connectors-mcp-events-trust/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Spec does **not** request TDD unit-test tasks. Required **Verifier recipes** for FR-013…FR-015 / SC-001…SC-008 and [quickstart.md](./quickstart.md) Scenarios 1–6 are implementation deliverables (not optional examples). Every GUI recipe MUST require desktop screenshots and/or short screen recordings **committed** under `verifier/evidence/` + PR embeds (standing orders **11** + **12**). Dump-inspection (US4) may be non-GUI log/artifact evidence (still committed).

**Organization**: Shared Host Connector catalog + additive event-Routine foundations (Phase 2) **block** all user-story fan-out. Stories follow **spec priority**: US1 Connector install→auth→tool → US2 Event routine fire → US3 Denied permission → US4 Secrets absent → US5 Credential UX (P2).

**Linear**: **Blocked** — workspace free-issue limit; **no invented epic/issue ids**; **no `taskstoissues` in this PR**. Track via PR only until capacity returns (project **DeepSeek Harness - Cursor** / `P-MOH-2` only — never GrokBot).

**Branch**: `cursor/p6-tasks-fe1d` (from `origin/master` @ plan merge #201)

**Architect Path A + clarify locks (honor in every story/recipe)**:

1. **Host-owned Connector catalog** SoT + `dsh-mcp-client` bind (research R1; Option A).
2. **Pass connector** = any one thin-catalog / Verifier fixture — not a fixed named connector (FR-017).
3. **Event Pass** = webhook harness / Verifier fixture only; **B1** adapt `dsh-webhook` ingress → Routine wake on **existing bot** + intent (FR-018; research R3).
4. **Additive** `RoutineRecord.triggerKind` + `eventTrigger` — cron rows unchanged; **no** rewrite `specs/004` (SC-008).
5. **Deny Pass** = user-deny via `dsh-user-approval` **or** standing `never` / block (either OK; research R4); Client answerer on **Host HTTP**.
6. **Credentials**: in-app primary via Host credential seam; vault **optional** (not mandatory Pass when in-app works; FR-009); secrets absent from session dumps (FR-007).
7. **No Electron Main connector/event/trust/credential-value bus** — lifecycle IPC only; data plane = authenticated Host HTTP/WS (research R6).
8. FR-014/FR-015 / SO 11+12 desktop visual evidence required for all GUI scenarios (US1–US3, US5 GUI, SC-001…003/006/007).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (`[US1]`…`[US5]`) on story-phase tasks only
- Every task includes exact file paths

## Path Conventions

Desktop dual-process layout from [plan.md](./plan.md):

- Electron shell: `apps/desktop/src/`, `apps/desktop/tests/`
- Desktop Host: `apps/desktop-host/`
- Host Agent Teams / Connector + Routine catalog home: `packages/experimental/agent-team/src/` (journal extension; prefer adjacent to `routine-cron.ts` / memory)
- MCP tool substrate: `packages/mcp/mcp-client/src/`
- Webhook ingress (B1 adapt): `packages/webhook/webhook/src/`
- Credentials: `packages/credentials/credentials/src/`, `packages/credentials/credentials-local/src/`, `packages/credentials/authorization/src/`
- Trust deny: `packages/interaction/user-approval/src/`
- Client/Web Agent Teams UI (connector + event-routine + approval/auth): `packages/experimental/client-ui-agent-team/src/client/`
- Host protocol exclusions: `apps/desktop/src/host-protocol.ts`, `apps/desktop/src/ipc.ts`
- Feature Verifier recipes: `specs/006-connectors-mcp-events-trust/verifier/`

**Do not** rewrite `specs/001-multi-model-bots/**`, `specs/002-identity-personas/**`, `specs/003-skills-ux/**`, `specs/004-routines-cron/**`, or `specs/005-memory-productization/**`. **Do not** invent P7 Box/Shell, full Grok catalog, or named live Slack/GitHub/Linear/email Pass requirements.

### Ownership legend (split like P2–P5)

| Owner | Typical tasks |
|-------|----------------|
| **Host / Runtime** | Catalog types/services, MCP bind, webhook→wake, credential store, deny enforce, Host Remotes |
| **Client / Web** | Connector surface, event-routine UI, approval/deny card, auth UX — Host HTTP/WS only |
| **Electron** | `host-protocol.ts` exclusions + `no-electron-*-bus` regression — no SoT |
| **Verifier** | Recipes, evidence dirs, SO 11+12 stamps, non-goals / full replay |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Orient implementers to P6 Architect Path A seams; create Verifier recipe home; no product behavior yet

- [x] T001 Confirm feature design tree is complete (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `checklists/requirements.md`) under `specs/006-connectors-mcp-events-trust/` and point implementers at [contracts/README.md](./contracts/README.md) + Architect Path A in [research.md](./research.md) / [plan.md](./plan.md)
- [x] T002 [P] Inventory Host Connector-catalog + MCP bind touch points in `packages/experimental/agent-team/src/{types,journal,persisted,projection,index}.ts`, `packages/mcp/mcp-client/src/`, and Desktop Host under `apps/desktop-host/` against [data-model.md](./data-model.md) `ConnectorRecord` / `ConnectorCatalogEntry` — record findings in `specs/006-connectors-mcp-events-trust/verifier/host-connector-inventory.md`
- [x] T003 [P] Inventory event-Routine + webhook B1 wake candidates in `packages/experimental/agent-team/src/routine-cron.ts` (and related), `packages/webhook/webhook/src/`, and Desktop Host under `apps/desktop-host/` for [contracts/event-routine.md](./contracts/event-routine.md) — `specs/006-connectors-mcp-events-trust/verifier/event-harness-inventory.md`
- [x] T004 [P] Inventory credential + approval/deny seams in `packages/credentials/credentials/src/`, `packages/credentials/credentials-local/src/`, `packages/credentials/authorization/src/`, and `packages/interaction/user-approval/src/` for [contracts/secrets.md](./contracts/secrets.md) / [contracts/trust-deny.md](./contracts/trust-deny.md) — `specs/006-connectors-mcp-events-trust/verifier/credentials-trust-inventory.md`
- [x] T005 [P] Document seam locks for implementers: Host Connector catalog SoT + mcp-client; B1 webhook→Routine wake; additive `triggerKind`/`eventTrigger`; deny = user-deny or standing never; in-app primary / vault optional; no Electron Main bus — `specs/006-connectors-mcp-events-trust/verifier/connector-event-trust-seam-locks.md` (research R0–R6; [contracts/non-goals.md](./contracts/non-goals.md))
- [x] T006 Create Verifier recipe directory `specs/006-connectors-mcp-events-trust/verifier/README.md` listing Scenario 1–6 owners (Host / Client / Electron / Verifier) mapped to [quickstart.md](./quickstart.md) and mandating FR-014/015 desktop screenshots/recordings **committed** under `verifier/evidence/` + PR embeds (SO 11+12); note Linear/`taskstoissues` blocked

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared Host Connector catalog + additive event-Routine model + thin-shell + credential/MCP bind that MUST complete before ANY user story fan-out

**⚠️ CRITICAL**: No US1–US5 product work until T007–T016 land.

### Shared Host model + protocol + substrate

- [x] T007 Define Host `ConnectorRecord` / `ConnectorCatalogEntry` types/validation (`connectorId` branded opaque, `catalogId`/`serverName`, `displayName`, `installState: available|installing|installed|failed`, `authState: none|needs_auth|authenticating|ready|failed`, `transport`, timestamps) in `packages/experimental/agent-team/src/types.ts` (and related modules named in inventory) per [data-model.md](./data-model.md)
- [x] T008 Extend Host `RoutineRecord` **additively** with `triggerKind: cron|event` and `eventTrigger` (Pass: `webhook_harness`); keep P4 cron fields valid without rewrite — `packages/experimental/agent-team/src/{types,routine-cron.ts}` (or inventory-named modules) per [data-model.md](./data-model.md) / research R3
- [x] T009 Implement Host Connector catalog service (list thin catalog + install/list durable rows; prefer Agent Teams journal extension) wired for Desktop Host in `apps/desktop-host/` + `packages/experimental/agent-team/src/{journal,persisted,index}.ts` — **not** Electron Main, **not** Client-only SoT
- [x] T010 Bind Pass MCP substrate: register Verifier-fixture (or thin-catalog) connector tools on `ctx.tools` via `packages/mcp/mcp-client/src/` from Host catalog ready state; document fixture home under `packages/experimental/agent-team/` or `apps/desktop/` test fixture (research R2)
- [x] T011 Wire Host credential seam for connector auth refs (`dsh-credentials` / `credentials-local`; authorization when needed) so secrets live in Host store — `packages/credentials/**` + Desktop Host under `apps/desktop-host/` — describe never returns secret values
- [x] T012 Expose Host HTTP/WS projection + mutation APIs for connector (catalog/install/auth) and event-routine create/list on the authenticated Desktop Host data plane in `packages/experimental/agent-team/src/{index,projection,client}.ts` + `apps/desktop-host/` — Client MUST NOT persist SoT; approval answerer on Host HTTP (research R4)
- [x] T013 [P] Extend `apps/desktop/src/host-protocol.ts` comments/exclusion documentation so connector-catalog, connector-install, connector-auth, mcp-tool-call control, event-routine-create/fire, webhook-delivery, permission-deny / trust-rule control, and credential **values** / credential-set / secret payloads are **forbidden** on Node IPC (same pattern as identity + skills + routines + memory; research R6)
- [x] T014 [P] Add architecture/regression guard that Electron Main has no parallel connector/event/trust/credential-value store/bus in `apps/desktop/tests/no-electron-connectors-events-trust-bus.spec.ts` (and document expected absence in `apps/desktop/src/ipc.ts` / `apps/desktop/src/host-protocol.ts`) per research R6 / [contracts/non-goals.md](./contracts/non-goals.md)
- [x] T015 [P] Document Host webhook-harness Pass path (B1: adapt `packages/webhook/webhook/src/` ingress → match active `triggerKind=event` routines → wake existing bot with intent; **not** new-Session Pass) in `specs/006-connectors-mcp-events-trust/verifier/webhook-harness-b1.md` (research R3; FR-018)
- [x] T016 Foundational checklist stamp in `specs/006-connectors-mcp-events-trust/verifier/README.md` (T007–T015 complete; no US product work before this stamp)

**Checkpoint**: Foundation ready — Host catalogs + MCP/credential bind + protocol exclusions + absence guards + B1 harness doc; user stories may begin.

---

## Phase 3: User Story 1 — Install, authenticate, and call a connector tool (Priority: P1) 🎯 MVP

**Goal**: User installs one thin-catalog / fixture connector, authenticates to `ready`, and completes one successful connector tool call with user-visible success ([contracts/connector.md](./contracts/connector.md); SC-001 / SC-007)

**Independent Test**: On Desktop, install any one Pass connector; complete in-app auth; invoke one tool; observe success indicator; empty/fail install must not count as Pass ([quickstart.md](./quickstart.md) Scenario 1)

### Implementation for User Story 1

- [x] T017 [US1] Host install path: Client/Host RPC installs one catalog/fixture entry → durable `ConnectorRecord` with `installState=installed` (or `failed` with clear reason); available≠installed ([contracts/connector.md](./contracts/connector.md); FR-001) in `packages/experimental/agent-team/src/` + `apps/desktop-host/`
- [x] T018 [US1] Host auth → `authState=ready` via credential seam (no chat-paste primary); bind MCP tools when ready; successful tool-call outcome observable (`outcome=success`) without scoring LLM wording (FR-002/003/016) in `packages/experimental/agent-team/src/` + `packages/mcp/mcp-client/src/` + `apps/desktop-host/`
- [ ] T019 [P] [US1] Client connector catalog + install surface under `packages/experimental/client-ui-agent-team/src/client/` (locale strings in `packages/experimental/client-ui-agent-team/src/client/locales.ts`) calling Host HTTP/WS only (no Main IPC mutations)
- [ ] T020 [P] [US1] Client connector auth + tool-success visibility under `packages/experimental/client-ui-agent-team/src/client/` via Host RPC (in-app credential UX; vault not required when in-app works)
- [x] T021 [US1] Add Verifier Scenario 1 recipe in `specs/006-connectors-mcp-events-trust/verifier/scenario-1-connector.md` covering SC-001 (install→auth→ready→successful tool call; FR-017 any-one fixture) and **requiring** FR-014/015 desktop evidence under `specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-1/` (unit/jsdom alone fails)

**Checkpoint**: US1 connector path works independently with Verifier recipe + evidence path.

---

## Phase 4: User Story 2 — Create and fire an event-triggered routine (Priority: P1)

**Goal**: User creates a non-cron event routine (webhook harness); harness delivery fires E2E with last-run visibility; pause suppresses fire; cron remains ([contracts/event-routine.md](./contracts/event-routine.md); SC-002 / SC-008)

**Independent Test**: Create event routine with non-empty intent; deliver harness event → fire + last-run; pause → no fire; cron still usable ([quickstart.md](./quickstart.md) Scenario 2)

### Implementation for User Story 2

- [ ] T022 [US2] Host `createRoutine` with `triggerKind=event` + `eventTrigger=webhook_harness` validates non-empty `intent`; rejects empty with clear reason; persists on Host Routine catalog (`packages/experimental/agent-team/src/` / Desktop Host) per FR-004 — **additive** to cron; do not rewrite `specs/004`
- [ ] T023 [US2] Host webhook-harness match → Routine wake on existing bot with intent; update `lastRunAt`; paused status MUST suppress fire for matching deliveries (FR-005/018; B1) via `packages/webhook/webhook/src/` adapt + `packages/experimental/agent-team/src/` + `apps/desktop-host/` — manual “Run now” alone insufficient for Pass
- [ ] T024 [P] [US2] Client event-routine create + pane labeling (event vs cron distinguishable) + last-run / pause-resume projection under `packages/experimental/client-ui-agent-team/src/client/` via Host RPC (locale-owned copy)
- [ ] T025 [US2] Add Verifier Scenario 2 recipe in `specs/006-connectors-mcp-events-trust/verifier/scenario-2-event-routine.md` covering SC-002 (create + harness fire + last-run + pause suppress) and SC-008 (cron still usable) with FR-014/015 evidence under `specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-2/`

**Checkpoint**: US2 event fire independently testable on Desktop.

---

## Phase 5: User Story 3 — Denied-permission path (Priority: P1)

**Goal**: One connector tool / trust-gated action is denied (user deny **or** standing never); denial user-visible and distinct from success ([contracts/trust-deny.md](./contracts/trust-deny.md); SC-003)

**Independent Test**: Trigger permission gate; deny; confirm action not treated as success; denial visible ([quickstart.md](./quickstart.md) Scenario 3)

### Implementation for User Story 3

- [ ] T026 [US3] Host enforce deny path via `dsh-user-approval` user-deny **or** standing `never`/block (either OK for Pass); denied action MUST NOT present as success (`outcome=denied`) in `packages/interaction/user-approval/src/` + Host gate wiring under `packages/experimental/agent-team/src/` / `apps/desktop-host/` per FR-006
- [ ] T027 [P] [US3] Client approval/deny card or standing-deny control + blocked-state UI under `packages/experimental/client-ui-agent-team/src/client/` answering on **Host HTTP** path (no Electron Main answerer)
- [ ] T028 [US3] Add Verifier Scenario 3 recipe in `specs/006-connectors-mcp-events-trust/verifier/scenario-3-trust-deny.md` covering SC-003 with FR-014/015 evidence under `specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-3/`

**Checkpoint**: US3 deny path independently testable.

---

## Phase 6: User Story 4 — Secrets stay out of session dumps (Priority: P1)

**Goal**: After connector auth, session dumps / exportable artifacts contain no plaintext connector secrets ([contracts/secrets.md](./contracts/secrets.md); SC-004)

**Independent Test**: Authenticate Pass connector; export/dump session artifacts; confirm tokens/passwords/API keys absent ([quickstart.md](./quickstart.md) Scenario 4)

### Implementation for User Story 4

- [ ] T029 [US4] Host credential path ensures connector secret values are stored only in credential seam and are **not** written into session-log / exportable dump plaintext (`packages/credentials/**` + Agent Teams / session dump path under `apps/desktop-host/` / inventory) per FR-007/008 — chat-paste MUST NOT be primary auth path
- [ ] T030 [US4] Add Verifier Scenario 4 dump-inspection recipe in `specs/006-connectors-mcp-events-trust/verifier/scenario-4-secrets-absent.md` covering SC-004 with committed evidence under `specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-4/` (dump log/artifact OK; GUI auth steps still need SO 11+12 when shown)

**Checkpoint**: US4 secrets-absent independently testable via dump inspection.

---

## Phase 7: User Story 5 — Credential UX sufficient for connector auth (Priority: P2)

**Goal**: User-visible in-app credential UX completes Pass connector auth; vault not mandatory when in-app works ([contracts/secrets.md](./contracts/secrets.md); SC-007)

**Independent Test**: Complete Story 1 auth via documented credential UX; confirm no renderer durable secret SoT and no env-file Pass path ([quickstart.md](./quickstart.md) Scenario 1 auth + SC-007)

### Implementation for User Story 5

- [ ] T031 [US5] Confirm / complete Client in-app credential UX for Pass connector under `packages/experimental/client-ui-agent-team/src/client/` (Host RPC only; secrets off renderer durable storage); document that vault/1Password-class is **not** required for Pass when in-app auth completes the fixture (FR-008/009) in `specs/006-connectors-mcp-events-trust/verifier/credential-ux-in-app.md`
- [ ] T032 [US5] Add Verifier Scenario credential-UX / SC-007 checks to `specs/006-connectors-mcp-events-trust/verifier/scenario-1-connector.md` (or `scenario-5-credential-ux.md` if split) requiring FR-014/015 desktop evidence of the auth surface under `verifier/evidence/scenario-1/` (or dedicated dir) when GUI is shown

**Checkpoint**: US5 credential UX independently testable; vault optional lock honored.

---

## Phase 8: Polish & Cross-Cutting (Non-goals, evidence, full replay)

**Purpose**: Absence checks, evidence layout, full SC-006 replay; no new product scope

- [ ] T033 [P] Create Verifier non-goals recipe `specs/006-connectors-mcp-events-trust/verifier/non-goals.md` covering SC-005 / [contracts/non-goals.md](./contracts/non-goals.md): no P7 Box/Shell; no full catalog / live-family Pass; no rewrite of `specs/001`–`005`; **no Electron connector/event/trust bus**; vault not mandatory when in-app works; cron additive (SC-008)
- [ ] T034 [P] Create evidence directory placeholders + README expectations under `specs/006-connectors-mcp-events-trust/verifier/evidence/{scenario-1,scenario-2,scenario-3,scenario-4,non-goals,scenario-6}/` documenting required screenshot/recording filenames for FR-014/015 / SO 11+12
- [ ] T035 Add Verifier Scenario 6 full replay recipe `specs/006-connectors-mcp-events-trust/verifier/scenario-6-full-replay.md` covering SC-006 (Scenarios 1–5 + foundational stamp) with mandatory desktop visual evidence for GUI slices
- [ ] T036 [P] Re-validate quickstart Scenario → recipe map in `specs/006-connectors-mcp-events-trust/quickstart.md` and `specs/006-connectors-mcp-events-trust/verifier/README.md` (owners + evidence paths)
- [ ] T037 [P] Confirm `apps/desktop/tests/no-electron-connectors-events-trust-bus.spec.ts` + `apps/desktop/src/host-protocol.ts` exclusions still green after story work
- [ ] T038 [P] Confirm no product edits to `specs/001-multi-model-bots/**`, `specs/002-identity-personas/**`, `specs/003-skills-ux/**`, `specs/004-routines-cron/**`, or `specs/005-memory-productization/**` in this feature’s implement PRs — document check in `specs/006-connectors-mcp-events-trust/verifier/README.md`
- [ ] T039 Polish: ensure no product code path documents P6 Pass as “Electron Main store,” “Client-only SoT,” “live Slack/GitHub required,” “fixed named connector,” or “mandatory vault” in `apps/desktop-host/`, `packages/experimental/client-ui-agent-team/src/client/`, or `specs/006-connectors-mcp-events-trust/verifier/README.md`
- [ ] T040 [P] Note Linear/`taskstoissues` remains blocked; track T001–T040 via PR only until capacity — document in `specs/006-connectors-mcp-events-trust/verifier/README.md` (no invented issue ids)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — **first implement slice**
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 Connector**: Depends on Foundational (catalog + MCP + credentials + protocol)
- **US2 Event routine**: Depends on Foundational (additive RoutineRecord + B1 doc); can proceed in parallel with US1 after T008/T012/T015 if Host APIs stable
- **US3 Deny**: Depends on Foundational approval wiring; prefer after US1 tool path exists so deny targets a real connector tool
- **US4 Secrets**: Depends on US1 (or equivalent) auth credential save
- **US5 Credential UX**: Depends on US1 auth surface; can tighten docs/UI after T018–T020
- **Polish**: After desired stories complete (at least US1–US5 for phase exit)

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| US1 Connector install→auth→tool | Foundational T007–T016 | Install + auth ready + successful tool call |
| US2 Event routine fire | Foundational; Host Routine extend | Create + harness fire + last-run + pause suppress |
| US3 Denied permission | Foundational; prefer US1 tool | One deny distinct from success |
| US4 Secrets absent | US1 auth (or equiv credential save) | Dump inspection — no plaintext secrets |
| US5 Credential UX | US1 auth surface | In-app UX; vault not mandatory |

### Parallel Opportunities

- T002/T003/T004/T005 inventory docs in parallel (Setup)
- T013/T014/T015 protocol + bus + B1 doc in parallel once T007–T012 started
- Within a story: Client UI [P] alongside Host once Host API contract stable
- US1 Host and US2 Host can fan out after foundational stamp if owners differ
- T033/T034/T036/T037/T038/T040 polish docs/guards in parallel

### Parallel Example: Foundational

```bash
Task: "ConnectorRecord types in packages/experimental/agent-team/src/types.ts"
Task: "host-protocol.ts connector/event/trust exclusions"
Task: "no-electron-connectors-events-trust-bus.spec.ts"
Task: "webhook-harness-b1.md Pass path doc"
```

### Parallel Example: US1

```bash
Task: "Host install + auth→ready + MCP tool success"
Task: "Client connector catalog/install/auth UI"
Task: "Verifier scenario-1-connector.md + evidence path"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup (T001–T006)
2. Complete Phase 2 Foundational (T007–T016)
3. Complete Phase 3 US1 (T017–T021)
4. **STOP and VALIDATE** US1 independently (SC-001 / FR-017)
5. Demo Host-backed connector install→auth→tool without Main bus theater

### Incremental Delivery

1. Setup + Foundational → gate open
2. US1 → connector MVP
3. US2 → event routine E2E fire
4. US3 → denied-permission path
5. US4 → secrets-absent dump
6. US5 → credential UX / vault-optional lock
7. Polish → non-goals + SO11/12 evidence layout + SC-006 full replay

### Parallel Team Strategy

1. **DH Host / Runtime**: T007–T012, T015, T017–T018, T022–T023, T026, T029
2. **DH Client / Web**: T019–T020, T024, T027, T031
3. **DH Electron**: T013–T014 thin shell; no connector/event/trust bus
4. **DH Spec + Verifier**: recipes T021/T025/T028/T030/T032/T033/T035 + FR-014/015 evidence stamping
5. **DH Verifier**: SC-001…SC-008 Pass on real desktop app with committed evidence

---

## Notes

- [P] tasks = different files, no incomplete-task dependencies
- [Story] label maps task to US1–US5 for traceability
- Verifier recipes are **required deliverables**, not optional TDD unit suites
- **Architect Path A** is non-negotiable: Host SoT; B1 wake; additive RoutineRecord; either deny path; fixture + in-app; reject Electron Main bus
- Clarify locks (webhook harness Pass; vault optional; any-one connector) non-negotiable
- Standing orders **11** + **12** non-negotiable on GUI recipes
- Do not rewrite specs/001–005
- **No Linear `taskstoissues`** until workspace capacity returns — do not invent ticket numbers
- Analyze follows this tasks PR; implement only after Verifier Pass on analyze (when gated)
