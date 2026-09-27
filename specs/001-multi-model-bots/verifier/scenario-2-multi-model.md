# Scenario 2 — Multi-model team session (distinct `(provider, model)`)

**Status:** Recipe for T018 distinct-assignment rule + Client messaging. **SC-001 wall-clock (TTFT) and full live multi-provider session Pass remain T019** (deferred proof).
**Owners:** DH Verifier (Pass/Fail) · DH Electron / Client (create messaging) · DH Runtime (Host createBot + roster projection)
**Acceptance slice:** Spec FR-003, SC-002 rule definition; FR-001…002 / FR-007 create path reused from T014/T017
**Contract:** [../contracts/bot-create-model.md](../contracts/bot-create-model.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Branch (implement):** `cursor/p1-t018-distinct-models-92fa` (base `cursor/p1-t017-create-ui-92fa`)

## Verifier rule — “different models”

**Pass definition for “≥2 different models/providers”:**

Any two **distinct configured `(provider, model)` assignments** available in the verification environment.

| Counts as distinct? | Example |
|---------------------|---------|
| Yes | `(deepseek-official, deepseek-v4-flash)` vs `(deepseek-official, deepseek-v4-pro)` |
| Yes | `(provider-a, shared-id)` vs `(provider-b, shared-id)` — provider differs |
| No | Same `(provider, model)` pair on two bots |

**Not a fixed marketing catalog.** The environment’s configured provider/model directory is the only catalog. Same-assignment create remains **allowed** for product use; Verifier cannot Pass SC-001/SC-002 until ≥2 distinct pairs exist across bots under test.

## What this recipe proves (T018)

1. Client **New bot** form shows locale-owned guidance that Verifier Pass needs ≥2 distinct `(provider, model)` assignments from the environment (no marketing list).
2. Roster shows multi-model readiness (pending vs ready) from projected LLM `modelSelection` pairs.
3. Draft that duplicates an existing roster `(provider, model)` shows a soft warning; Save stays enabled (same assignment allowed).
4. Host roster rows expose LLM `modelSelection` when the live Agent route has provider + model (distinct from spawn-backend `provider`).

Does **not** prove SC-001 wall-clock < 30 min (T019). Does **not** require a live multi-provider API session for T018 Pass when this recipe’s Client/Host unit path is green; T019 owns that live evidence.

## Preconditions

- [ ] Scenario 0 topology handshake **Pass** recorded ([scenario-0-topology.md](./scenario-0-topology.md))
- [ ] Checkout includes T017 create UI + T018 distinct-models tip
- [ ] `pnpm install` complete; Node `^22.19 || >=24`
- [ ] Environment can advertise ≥2 configured `(provider, model)` ids for a later live Pass (not required for T018 unit proof)

## Commands (rerunnable) — T018 unit / Client proof

```sh
pnpm exec vitest run \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'creates a Host-owned bot|warns when the draft|cancels bot create'
```

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/team.spec.ts \
  -t 'applies per-teammate LLM agentOptions|creates a Host-owned bot from displayName'
```

Optional Client create regression (T017):

```sh
pnpm exec vitest run \
  packages/experimental/client-ui-agent-team/tests/browser-plugin.client.spec.ts \
  -t 'createBot|RPC-backed bot'
```

## Deferred to T019 (do not block T018)

| Item | Owner |
|------|--------|
| Wall-clock first-launch → completed multi-model session < 30 min (SC-001) | Verifier + Electron |
| Live work session using ≥2 bots with distinct configured assignments (SC-002 full) | Verifier + Runtime + Client |
| Evidence under `evidence/scenario-2/` with TTFT stamp | Verifier |

## Pass criteria (T018 slice)

- Focused Client tests for distinct-models hint, duplicate soft warning, and multi-model ready/pending copy are green.
- Host createBot / agentOptions tests show `member.modelSelection` for LLM routes.
- Recipe documents the Verifier distinct-pair rule with **no** fixed marketing provider list.

## Evidence home

Record stdout + SHA under [evidence/scenario-2/](./evidence/scenario-2/) when Verifier runs T018 slice Pass/Fail. Full SC-001/002 evidence lands with T019.

## Topology unchanged

Electron Main invents neither bots nor LLM routes. Create stays Host Remote `agentTeams/createBot`; Web under `dsh-app://` uses authenticated Host HTTP/WS.
