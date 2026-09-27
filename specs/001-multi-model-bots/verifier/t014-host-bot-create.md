# T014 Host bot-create API — Verifier proof recipe

**Status:** Host-API proof path (not Scenario 2 Pass — Client UI is T017).
**Owners:** DH Runtime (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-001 Host half — required `displayName` + exactly one model/provider assignment; persistence Host-owned ([data-model.md](../data-model.md) Bot rules · [contracts/bot-create-model.md](../contracts/bot-create-model.md))
**API:** `TeamService.createBot` / Remote `agentTeams/createBot` under `@deepseek-ai/dsh-experimental-agent-team`
**Branch:** `cursor/p1-t014-bot-create-92fa`

## What this proves

1. Lead-authorized Host create accepts non-empty `displayName` + required `modelSelection` (`provider` + `model`).
2. Empty / whitespace `displayName` or missing model/provider fields are rejected (`TEAM_INVALID_ARGUMENT` / `TEAM_INVALID_MEMBER_NAME`).
3. Non-Lead callers are rejected (`TEAM_LEAD_REQUIRED`).
4. Created Bot retains `displayName` on the Host member snapshot and applies the assigned LLM route at create (via spawn `agentOptions`).
5. Generated Remote `agentTeams/createBot` returns domain ok/reject results without Electron inventing bot records.

Does **not** prove SC-001/SC-002 (needs ≥2 bots in Desktop UI + distinct configured providers — Scenario 2 / T018–T019).

## Preconditions

- [ ] Checkout on `cursor/p1-t014-bot-create-92fa` (or merge-base including T014)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24` (zlib zstd APIs required by session persistence)
- [ ] No provider API secrets required (mock LLM in unit tests)

## Commands (rerunnable)

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  -t 'creates a Host-owned bot|rejects Host bot create|rejects non-Lead Host bot'
```

Broader Host Team regression (optional):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/agent-team/tests/projection-events.spec.ts \
  packages/experimental/agent-team/tests/persistence.spec.ts
```

Built Remote contribution smoke (after `pnpm run build:lib:host` or package tsdown):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/built-lib.e2e.ts
```

## Pass criteria

- Focused createBot trio: all selected tests green.
- Assertions cover happy path (two distinct model assignments), validation failures, Lead-only, and Remote reject/accept shapes.

## Evidence home

Record stdout + SHA under [evidence/t014-bot-create/](./evidence/t014-bot-create/) when Verifier runs Pass/Fail.
