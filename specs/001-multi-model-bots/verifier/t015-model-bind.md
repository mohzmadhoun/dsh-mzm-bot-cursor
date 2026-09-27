# T015 Bot ModelSelection bind — Verifier proof recipe

**Status:** Host bind proof path (not Scenario 2 Pass — Client UI is T017; SC-001/002 need Desktop multi-model session).
**Owners:** DH Runtime (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-002 — each Bot retains its own `{ provider, model, reasoningEffort? }` via `installModelSelection` so subsequent chats use that bot’s assignment only ([data-model.md](../data-model.md) · [contracts/bot-create-model.md](../contracts/bot-create-model.md))
**API:** `TeamService.createBot` persists durable `modelSelection` on the Host member snapshot; Agent Teams binds live teammates through `installModelSelection` (`packages/core/agent/src/model-selection.ts`)
**Branch:** `cursor/p1-t015-model-bind-92fa` (base `cursor/p1-t014-bot-create-92fa`)

## What this proves

1. Host create retains durable `modelSelection` on the Team member snapshot (not only live `agent.options`).
2. Live Bot Agents receive `installModelSelection` so prompt assembly and `agent/request` keep that route.
3. A subsequent follow-up chat on the same Bot still uses that Bot’s assignment (not the Lead’s).
4. A second Bot with a distinct assignment does not overwrite the first Bot’s route.
5. Inactive roster rows still expose the Bot’s model from the durable snapshot (no Lead fallback).

Does **not** prove SC-001/SC-002 (needs ≥2 bots in Desktop UI — Scenario 2 / T018–T019). Does **not** cover T016 llm credential polish or T017 Client UI.

## Preconditions

- [ ] Checkout on `cursor/p1-t015-model-bind-92fa` (or merge-base including T015)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (mock LLM in unit tests)

## Commands (rerunnable)

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  -t 'binds Bot ModelSelection via installModelSelection'
```

Bind helpers + projection immutability:

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/model-selection-bind.spec.ts \
  packages/experimental/agent-team/tests/projection-events.spec.ts \
  -t 'ModelSelection|immutable identity|teammate identity'
```

Broader Host Team regression (optional):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/agent-team/tests/model-selection-bind.spec.ts \
  packages/experimental/agent-team/tests/projection-events.spec.ts
```

## Pass criteria

- Focused bind test green: durable snapshot, first + subsequent chat headers, peer isolation, inactive roster model.
- Helper + projection identity tests green.

## Evidence home

Record stdout + SHA under [evidence/t015-model-bind/](./evidence/t015-model-bind/) when Verifier runs Pass/Fail.
