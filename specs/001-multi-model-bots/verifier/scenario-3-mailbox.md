# Scenario 3 — Host mailbox 1:1 handoff

**Status:** Recipe present (T025). Composite Host-path + Client handoff + topology-negative proof. Live Desktop dual-bot operator Pass may still be recorded under this recipe when Verifier runs an interactive session; unit/component slices below are the keyless Pass gate for SC-003 recipe acceptance.
**Owners:** DH Verifier (this recipe + evidence) · DH Runtime (T021–T023 Host mailbox) · DH Electron/Client (T024 chat/notices)
**Acceptance:** Spec FR-004, FR-005 · SC-003 · US2
**Contract:** [../contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 3
**Data model:** [../data-model.md](../data-model.md) Host mailbox message
**Branch (T025 recipe):** `cursor/p1-t025-scenario3-92fa` (base `master` @ T024)

## What this recipe proves (SC-003)

1. Bot A sends async 1:1 to Bot B through the **Host** Agent Teams Lead-log mailbox → target inbox (`sendMessage` / `deliveryState`), not Electron IPC ([t021-mailbox-send.md](./t021-mailbox-send.md)).
2. Durable product fields reconstruct from Lead + target Session logs with Host-only `source: { kind: 'host-mailbox' }` ([t022-mailbox-persist.md](./t022-mailbox-persist.md)).
3. Client observes handoffs via Host session/RPC projections (`projectMailboxHandoffs` / `TeamView.handoffs` / `agentTeams/view`) — never Main-synthesized mailbox payloads ([t023-handoff-projections.md](./t023-handoff-projections.md)).
4. Desktop Web chat + Conversation notices + Agent Team strip render visible pending / acted handoff without copy-paste (`data-chat-handoff`, `data-handoff-source="host-mailbox"`) ([t024-chat-handoff.md](./t024-chat-handoff.md)).
5. **Negative:** Fake mailbox / bot-message over Electron Host Node IPC is rejected; no Main mailbox channel ([scenario-0-topology.md](./scenario-0-topology.md) criterion 6 · topology `rejects fake mailbox`).

**Fail rule:** Fail SC-003 if delivery required an Electron IPC messaging bus, if Host `source` is not Host-only, or if the recipient neither acts nor leaves a user-visible handoff on the proven surfaces.

Does **not** add the T026 Electron bus regression guard file (topology negative already required here). Does **not** claim Scenario 0 / SC-007 or Scenario 2 / SC-001–002 Pass.

## Preconditions

- [ ] Checkout includes T021–T024 on base (`master` @ T024 merge or later)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] Scenario 0 / SC-007 Topology handshake **Pass** recorded ([README](./README.md#handshake-pass-gate-sc-007--fr-013)) — required before product SC Done
- [ ] No provider API secrets required for the keyless composite below (mock LLM / component fixtures)
- [ ] Optional live Desktop path: ≥2 bots present; Display / `xvfb-run` if GUI

## Commands (rerunnable) — composite keyless Pass gate

Reuse T021–T024 focused suites plus the topology mailbox negative. Prefer the local vitest binary when `pnpm exec` refuses `core.hooksPath` rewrite:

```sh
# T021 Host send + deliveryState
./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/mailbox-send.spec.ts \
  packages/experimental/agent-team/tests/delivery-state.spec.ts

# T022 durable Host mailbox product fields
./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/host-mailbox-message.spec.ts \
  packages/experimental/agent-team/tests/mailbox-persist.spec.ts

# T023 Host projections + Client panel handoffs
./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/mailbox-handoff-projection.spec.ts \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T023|handoff|empty handoffs'

# T024 chat / notices / Agent Team strip
./node_modules/.bin/vitest run \
  packages/client/ui-chat/tests/team-message-source.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/handoff-notices.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T024|T023|handoff|empty handoffs|team-message'

./node_modules/.bin/vitest run \
  packages/client/ui-conversation/tests/skeleton.client.spec.tsx \
  -t 'active phase: fixed header'

# Required negative: no Electron mailbox bus
./node_modules/.bin/vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'rejects fake mailbox'
```

One-shot wrapper (same suites; stop on first failure):

```sh
set -euo pipefail
EVIDENCE=specs/001-multi-model-bots/verifier/evidence/scenario-3
mkdir -p "$EVIDENCE"
VITEST=./node_modules/.bin/vitest

$VITEST run \
  packages/experimental/agent-team/tests/mailbox-send.spec.ts \
  packages/experimental/agent-team/tests/delivery-state.spec.ts \
  | tee "$EVIDENCE/vitest-t021.log"

$VITEST run \
  packages/experimental/agent-team/tests/host-mailbox-message.spec.ts \
  packages/experimental/agent-team/tests/mailbox-persist.spec.ts \
  | tee "$EVIDENCE/vitest-t022.log"

$VITEST run \
  packages/experimental/agent-team/tests/mailbox-handoff-projection.spec.ts \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T023|handoff|empty handoffs' \
  | tee "$EVIDENCE/vitest-t023.log"

$VITEST run \
  packages/client/ui-chat/tests/team-message-source.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/handoff-notices.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T024|T023|handoff|empty handoffs|team-message' \
  | tee "$EVIDENCE/vitest-t024.log"

$VITEST run \
  packages/client/ui-conversation/tests/skeleton.client.spec.tsx \
  -t 'active phase: fixed header' \
  | tee "$EVIDENCE/vitest-skeleton.log"

$VITEST run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'rejects fake mailbox' \
  | tee "$EVIDENCE/vitest-topology-negative.log"
```

Slice recipes remain authoritative for per-task evidence homes: [t021-mailbox-send.md](./t021-mailbox-send.md) · [t022-mailbox-persist.md](./t022-mailbox-persist.md) · [t023-handoff-projections.md](./t023-handoff-projections.md) · [t024-chat-handoff.md](./t024-chat-handoff.md).

## Optional live Desktop path (operator)

When recording a live SC-003 Desktop stamp (in addition to keyless Pass):

1. Launch Desktop under test with ≥2 bots present.
2. Trigger async 1:1 A→B via Host mailbox (Agent Teams send — not Main IPC).
3. Observe delivery in UI: chat handoff row and/or Agent Team notices strip (`data-chat-handoff` / `data-handoff-source="host-mailbox"`).
4. Confirm B acts **or** pending/received handoff remains visible without copy-paste.
5. Fail immediately if the path required Electron IPC mailbox channels.

## Pass criteria

| # | Criterion | How measured | Required |
|---|-----------|--------------|----------|
| 1 | Host A→B send + `deliveryState` fold | T021 vitest suites | Yes |
| 2 | Durable Host-only product fields | T022 vitest suites | Yes |
| 3 | Host session/RPC `TeamView.handoffs` + Client panel | T023 vitest suites | Yes |
| 4 | Chat + notices strip visible handoff (no copy-paste) | T024 vitest suites + skeleton notices seat | Yes |
| 5 | Fake Electron mailbox IPC rejected | topology `rejects fake mailbox` | Yes |
| 6 | Live Desktop dual-bot operator observation | Optional stamp under evidence | Optional (keyless gate may Pass without it) |

**Claim tags:** label every SC-003 claim **measured** / **inferred** / **guess**. Keyless Pass requires **measured** suite exits (0) for criteria 1–5.

| Outcome | When |
|---------|------|
| **Pass (SC-003 keyless)** | Criteria 1–5 green; VERDICT + logs under `evidence/scenario-3/`; Host path + visible handoff + topology negative all **measured** |
| **Fail (SC-003)** | Any of 1–5 red; or delivery required Electron IPC bus; or handoff not attributed Host-only |
| **Deferred (live Desktop)** | Keyless Pass recorded but operator live path not yet run — stamp `LIVE: Deferred` + reason; does not block T025 recipe presence |
| **Blocked** | Missing T021–T024 on checkout, Scenario 0 Fail, or Desktop/topology harness unusable |

## Evidence home

Record under [evidence/scenario-3/](./evidence/scenario-3/):

| Artifact | Suggested name | Required? |
|----------|----------------|-----------|
| Verdict stamp | `VERDICT.txt` | Yes |
| T021 stdout | `vitest-t021.log` | Yes |
| T022 stdout | `vitest-t022.log` | Yes |
| T023 stdout | `vitest-t023.log` | Yes |
| T024 stdout | `vitest-t024.log` | Yes |
| Skeleton notices seat | `vitest-skeleton.log` | Yes |
| Topology negative | `vitest-topology-negative.log` | Yes |
| Live Desktop note / screenshot | `live-desktop.(txt\|png)` | Optional |

Minimal stamp template:

```text
VERDICT: Pass|Fail|Blocked
SC: SC-003
SHA: <git rev-parse HEAD>
BRANCH: <branch>
UTC: <ISO-8601>
OPERATOR: <name>
RECIPE: specs/001-multi-model-bots/verifier/scenario-3-mailbox.md
T021: Pass|Fail
T022: Pass|Fail
T023: Pass|Fail
T024: Pass|Fail
TOPOLOGY_NEGATIVE: Pass|Fail
LIVE: Pass|Deferred|Fail|Skipped
EVIDENCE: evidence/scenario-3/<files>
CLAIM: measured|inferred|guess
DEFER_REASON: <only when LIVE Deferred>
BLOCKER: <only when Blocked>
```

## Related

- Contract: [../contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)
- Quickstart Scenario 3: [../quickstart.md](../quickstart.md)
- T021–T024 slice recipes (linked above)
- T026 Electron bus guard checklist: extend `apps/desktop/tests/topology-handshake.spec.ts` or add `no-electron-mailbox-bus.spec.ts`
- Scenario 0 topology gate: [scenario-0-topology.md](./scenario-0-topology.md)
