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
| **1** In-app auth + clean dump | Scenario 1 | `scenario-1-credentials.md` (T037) | **Verifier** + Runtime + Client | SC-006 / FR-008…009, FR-012 |
| **2** Multi-model team session | Scenario 2 | `scenario-2-multi-model.md` (T018–T019) | **Verifier** + Runtime + Client | SC-001, SC-002 / FR-001…003, FR-007 |
| **3** Host mailbox 1:1 | Scenario 3 | `scenario-3-mailbox.md` (T025) | **Verifier** + Runtime | SC-003 / FR-004…005 |
| **4** Progress + final | Scenario 4 | `scenario-4-progress-final.md` (T032) | **Verifier** + Client | SC-004 / FR-006 |
| **5** Full Phase 1 replay | Scenario 5 | `scenario-5-full-replay.md` (T038) | **Verifier** | SC-005 (requires Scenario 0 Pass) |

Supporting Verifier docs: [non-goals.md](./non-goals.md) (T010 Pass; T039 expands), [credentials-ipc.md](./credentials-ipc.md) (T011 Pass), `trust-floor.md` (T013).

## Host API proofs (pre-Scenario)

| Slice | Recipe | Primary owners | Notes |
|-------|--------|----------------|-------|
| **T014** Host bot-create | [t014-host-bot-create.md](./t014-host-bot-create.md) | **Runtime** + **Verifier** | FR-001 Host half; not SC-001/002 Pass |
| **T015** Bot ModelSelection bind | [t015-model-bind.md](./t015-model-bind.md) | **Runtime** + **Verifier** | FR-002 Host bind via `installModelSelection`; not SC-001/002 Pass |
| **T016** Bot llm route + credentials | [t016-llm-route.md](./t016-llm-route.md) | **Runtime** + **Verifier** | FR-002 Host `ctx.llm` + credential resolve; Main invents neither bots nor routes |
| **T017** Client create + assign-model UI | [t017-client-create-ui.md](./t017-client-create-ui.md) | **Electron/Client** + **Verifier** | FR-001 Client half + FR-007; not SC-001/002 Pass |

## Fan-out policy

- Scenario 0 must Pass before Scenarios 1–5 evidence counts toward phase Done.
- Do not expand US1–US4 Verifier recipes until handshake Pass is recorded.
- Spec Assumptions cross-link for this gate: [../spec.md](../spec.md#assumptions) (SC-007).
