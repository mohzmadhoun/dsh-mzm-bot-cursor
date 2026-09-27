# Scenario 2 — Multi-model team session (distinct `(provider, model)`)

**Status:** Recipe for the T018 distinct-assignment rule and Client messaging. Owner: DH Verifier, after this slice. SC-001 wall-clock (TTFT) and a full live multi-provider session Pass stay **T019**.
**Acceptance slice:** FR-003 and the SC-002 rule. Create path reused from T014/T017. This recipe does not record SC-001/SC-002 session Pass.
**Contract:** [../contracts/bot-create-model.md](../contracts/bot-create-model.md) section “Verifier rule for different”
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Branch (implement):** `cursor/p1-t018-distinct-models-92fa` (base `cursor/p1-t017-create-ui-92fa` at `537bd02588`)

## Verifier rule — “different models”

Quoted from the contract:

> Any two distinct configured `(provider, model)` assignments available in the verification environment. No fixed marketing catalog.

Accepted edges for this slice:

- A second bot with the **same** `(provider, model)` pair may be created. That pair does not satisfy the ≥2-distinct exit.
- If only one provider/model is configured, bots may still be created. Verifier cannot Pass the ≥2-distinct-models exit until a second distinct configured assignment exists.
- `reasoningEffort` does not make two assignments distinct. Distinct means the `(provider, model)` tuple differs after the same trim as `requiredModelSelection` (`modelAssignmentsAreDistinct`).
- Count only bots that expose both an LLM provider and a model on `modelSelection`. The Lead row often has no product bot assignment. A missing pair is not an assignment. The subagent backend id on `provider` without an LLM model is not an assignment.
- The catalog is the verification environment’s configured assignments. Do not require a brand list.

## What this recipe proves (T018)

1. The open team panel states the rule: different models means any two distinct configured `(provider, model)` assignments, not a fixed catalog.
2. When teammate rows expose fewer than 2 distinct pairs, the panel says a multi-model distinct-models check cannot pass yet. When they expose ≥2, it says the roster meets that rule. This is messaging, not a chat blocker.
3. Near New bot, a complete draft says whether it is a new distinct assignment relative to bots that already have both ids. The same assignment still submits. An incomplete draft (empty or longer than 200 characters after trim) does not show that comparison.
4. Host roster rows set `modelSelection` from the live Agent route only. An unloaded teammate does not inherit the Lead pair.

Does **not** prove SC-001 wall-clock under 30 minutes. Does **not** add TTFT recording fields. Those belong to T019.

## How to observe the Client messages

Open the team panel on a loaded roster.

- `data-team-distinct-models` shows `multiModelPending` or `multiModelReady`.
- **New bot** shows `distinctModelsHint` (`data-team-distinct-models-hint`).
- A draft that matches a teammate `modelSelection` shows `duplicateAssignment` (`data-team-duplicate-assignment`). Save stays enabled.
- A complete draft that differs shows `draftDistinctAssignment` (`data-team-draft-distinct`).

Copy is locale-owned (`packages/experimental/client-ui-agent-team/src/client/locales.ts`). Client tests assert the Chinese dictionary strings.

## Commands (rerunnable)

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'distinct|createBot|creates a Host-owned bot|model assignment'
```

In this workspace, `pnpm exec` may refuse to run because install rewrites `core.hooksPath`. The same filter via the local binary:

```sh
./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'distinct|createBot|creates a Host-owned bot|model assignment'
```

## Deferred to T019

Do not add wall-clock or TTFT fields in this slice.

| Item | Owner |
|------|--------|
| Wall-clock first-launch → completed multi-model session < 30 min (SC-001) | Verifier + Electron |
| Live work session using ≥2 bots with distinct configured assignments (SC-002 full) | Verifier + Runtime + Client |
| Evidence under `evidence/scenario-2/` with a TTFT stamp | Verifier |

## Pass criteria (T018 slice)

- `modelAssignmentsAreDistinct` tests cover the same pair, a different model, a different provider, ignored `reasoningEffort`, trim, and empty rejection.
- Client tests show same-assignment `createBot`, the distinct-draft message, one teammate pair as not-yet, and two distinct teammate pairs as meets-rule.
- This recipe does not claim SC-001 or SC-002 session Pass.

## Evidence home

Record stdout and the commit SHA under [evidence/scenario-2/](./evidence/scenario-2/) when Verifier runs this slice. Full SC-001/002 evidence lands with T019.

## Topology unchanged

Electron Main invents neither bots nor LLM routes. Create stays Host Remote `agentTeams/createBot`. Web under `dsh-app://` uses authenticated Host HTTP/WS.
