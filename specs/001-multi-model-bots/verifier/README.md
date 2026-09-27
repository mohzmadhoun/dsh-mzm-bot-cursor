# Verifier recipes — Phase 1 Wedge A

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Topology contract:** [../contracts/topology-handshake.md](../contracts/topology-handshake.md)
**Architect criteria:** [../architecture.md](../architecture.md#verifier-criteria--topology-handshake)

## Handshake Pass gate (SC-007 / FR-013)

**Rule:** Product success criteria **SC-001…SC-006** MUST NOT be marked Done without a recorded Topology handshake **Pass** (Scenario 0 / SC-007).

| Gate artifact | Location |
|---------------|----------|
| Scenario 0 recipe | [scenario-0-topology.md](./scenario-0-topology.md) |
| Pass/Fail evidence (log + screenshot/trace) | [evidence/scenario-0/](./evidence/scenario-0/) — **Pass** recorded (SC-007) |
| Electron automation (T005) | `apps/desktop/tests/topology-handshake.spec.ts` |
| Optional Verifier driver (T006) | `apps/desktop/tests/topology/verifier-scenario-0.ts` |

Pass means all six Architect criteria in the topology contract hold under the locked topology: Desktop Host + Node IPC lifecycle-only + `dsh-app://` + shipped authenticated HTTP/WS (not framed pipes). Fail or missing evidence keeps product SC Done closed.

## Scenario 0–5 owners map

Mapped to [quickstart.md](../quickstart.md). Owner columns name who owns scripts/evidence for that scenario (not who implements the product feature).

| Scenario | Quickstart | Recipe (when present) | Primary owners | Acceptance |
|----------|------------|------------------------|----------------|------------|
| **0** Topology handshake (gate) | Scenario 0 | [scenario-0-topology.md](./scenario-0-topology.md) | **Electron** + **Verifier** | SC-007 / FR-013 |
| **1** In-app auth + clean dump | Scenario 1 | [scenario-1-credentials.md](./scenario-1-credentials.md) (T036 FR-009 stub; T037 full SC-006 recipe) | **Verifier** + Runtime + Client | SC-006 / FR-008…009, FR-012 |
| **2** Multi-model team session | Scenario 2 | [scenario-2-multi-model.md](./scenario-2-multi-model.md) (T018 rule Pass; T019 TTFT path documented; live SC-001/002 Verifier) | **Verifier** + Runtime + Client | SC-001, SC-002 / FR-001…003, FR-007 |
| **3** Host mailbox 1:1 | Scenario 3 | [scenario-3-mailbox.md](./scenario-3-mailbox.md) (T025) | **Verifier** + Runtime | SC-003 / FR-004…005 |
| **4** Progress + final | Scenario 4 | `scenario-4-progress-final.md` (T032) | **Verifier** + Client | SC-004 / FR-006 |
| **5** Full Phase 1 replay | Scenario 5 | `scenario-5-full-replay.md` (T038) | **Verifier** | SC-005 (requires Scenario 0 Pass) |

Supporting Verifier docs: [non-goals.md](./non-goals.md) (T010 Pass; T039 Out of Scope absence checks Pass), [credentials-ipc.md](./credentials-ipc.md) (T011 Pass), [trust-floor.md](./trust-floor.md) (T013 Verifier Pass — FR-011/FR-012; [evidence/t013-trust-floor/](./evidence/t013-trust-floor/)).

## Host API proofs (pre-Scenario)

| Slice | Recipe | Primary owners | Notes |
|-------|--------|----------------|-------|
| **T014** Host bot-create | [t014-host-bot-create.md](./t014-host-bot-create.md) | **Runtime** + **Verifier** | FR-001 Host half; not SC-001/002 Pass |
| **T015** Bot ModelSelection bind | [t015-model-bind.md](./t015-model-bind.md) | **Runtime** + **Verifier** | FR-002 Host bind via `installModelSelection`; not SC-001/002 Pass |
| **T016** Bot llm route + credentials | [t016-llm-route.md](./t016-llm-route.md) | **Runtime** + **Verifier** | FR-002 Host `ctx.llm` + credential resolve; Main invents neither bots nor routes |
| **T017** Client create + assign-model UI | [t017-client-create-ui.md](./t017-client-create-ui.md) | **Electron/Client** + **Verifier** | FR-001 Client half + FR-007; not SC-001/002 Pass |
| **T018** Distinct `(provider, model)` rule | [scenario-2-multi-model.md](./scenario-2-multi-model.md) | **Verifier** + Client | FR-003 rule + Client messaging (T018 Pass); live SC-001/002 remain Verifier |
| **T019** Clean-machine TTFT path (SC-001) | [scenario-2-multi-model.md](./scenario-2-multi-model.md#t019--clean-machine-ttft-path-sc-001) | **Spec** (path/fields) · **Verifier** (wall-clock) | Ordered path + recording fields; live timed run may be Deferred until Verifier measures |
| **T020** Missing-credential → Models handoff | [t020-cred-handoff.md](./t020-cred-handoff.md) | **Electron/Client** + **Verifier** | FR-008 failure UX (in-app Models); dump hygiene stays Scenario 1 / US4 |
| **T021** Host mailbox send path A→B | [t021-mailbox-send.md](./t021-mailbox-send.md) | **Runtime** + **Verifier** | FR-004 Host Lead-log mailbox → target inbox; `deliveryState` from session logs; not SC-003 UI Pass |
| **T022** Persist Host mailbox fields | [t022-mailbox-persist.md](./t022-mailbox-persist.md) | **Runtime** + **Verifier** | FR-004 product fields (`fromBotId`/`source` Host-only) from durable Lead-log; not SC-003 UI Pass |
| **T023** Host handoff projections | [t023-handoff-projections.md](./t023-handoff-projections.md) | **Runtime** + **Verifier** | FR-005 `TeamView.handoffs` via session/RPC; Client panel consumes; not SC-003 chat-surface Pass |
| **T024** Chat handoff / pending UI | [t024-chat-handoff.md](./t024-chat-handoff.md) | **Electron/Client** + **Verifier** | FR-005 chat + Conversation notices + Agent Team strip; Host projections only; not SC-003 Scenario 3 Pass |
| **T026** No Electron bot↔bot bus | [t026-no-ipc-bus.md](./t026-no-ipc-bus.md) | **Electron** + **Verifier** | FR-004 negative — Main invents no mailbox IPC; Host mailbox only; complements T007 |
| **T027** Thin Electron shell (no Main routers) | [t027-thin-shell.md](./t027-thin-shell.md) | **Electron** + **Verifier** | FR-007 Main lifecycle/`dsh-app://` HTTP forward only; not SC-004 Pass; leaves T026/T034 files alone |
| **T029** Chat progress from Host streams | [t029-chat-progress.md](./t029-chat-progress.md) | **Electron/Client** + **Verifier** | FR-006 in-flight half; `data-chat-progress="host-stream"`; no shell progress IPC; not SC-004 Pass (T030/T032) |
| **T033** Models write-only credential entry | [t033-cred-entry-ui.md](./t033-cred-entry-ui.md) | **Electron/Client** + **Verifier** | FR-008 in-app Models entry → Host `CredentialRef`; `CredentialInfo` only; not SC-006 dump Pass |
| **T034** No secret IPC (preload/renderer) | [t034-no-secret-ipc.md](./t034-no-secret-ipc.md) | **Electron** + **Verifier** | FR-008 shell half; re-audit preload/`ipc.ts`; Scenario 1 dump stays T037 |

## Fan-out policy

- Scenario 0 must Pass before Scenarios 1–5 evidence counts toward phase Done.
- Do not expand US1–US4 Verifier recipes until handshake Pass is recorded.
- Spec Assumptions cross-link for this gate: [../spec.md](../spec.md#assumptions) (SC-007).
