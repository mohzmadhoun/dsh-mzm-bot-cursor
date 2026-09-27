# T017 Client create-bot + assign-model UI — Verifier proof recipe

**Status:** Client-UI proof path (not Scenario 2 Pass — SC-001/002 remain T018–T019).
**Owners:** DH Electron / Client (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-001 Client half + FR-007 — happy-path create + assign-model UI; minimum inputs `displayName` + model/provider; no config-file edit ([contracts/bot-create-model.md](../contracts/bot-create-model.md))
**Surface:** `@deepseek-ai/dsh-experimental-client-ui-agent-team` → Host Remote `agentTeams/createBot`
**Branch:** `cursor/p1-t017-create-ui-92fa` (base `cursor/p1-t014-bot-create-92fa`)

## What this proves

1. Agent Teams Web panel exposes **New bot** with `displayName`, provider, and model fields (locale-owned copy).
2. Submit calls generated Remote `agentTeams/createBot` with `{ displayName, modelSelection: { provider, model } }` — Electron Main invents neither bot records nor LLM routes.
3. Create rejection / transport failure surfaces in the panel; success reloads the roster and shows retained `displayName`.
4. Browser plugin routes createBot through the Lead session when opened from an addressed teammate conversation.
5. Assembled Web Agent Teams panel aria still includes the create-bot control (keyless e2e snapshot).

Does **not** prove SC-001/SC-002 (needs ≥2 bots with distinct configured providers in a Desktop session — Scenario 2 / T018–T019). Does **not** prove credential entry (US4).

## Preconditions

- [ ] Checkout on `cursor/p1-t017-create-ui-92fa` (or merge-base including T014 + T017)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (unit + keyless Web panel tests)

## Commands (rerunnable)

Focused Client create-bot UI:

```sh
pnpm exec vitest run \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/browser-plugin.client.spec.ts \
  -t 'creates a Host-owned bot|createBot|cancels bot create|RPC-backed bot'
```

Assembled Web panel (includes New bot chrome; optional broader):

```sh
pnpm exec vitest run apps/web/tests/agent-team-panel.e2e.ts
```

Host createBot still green on the T014 base (optional regression):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  -t 'creates a Host-owned bot|rejects Host bot create|rejects non-Lead Host bot'
```

## Pass criteria

- Focused Client createBot / Remote wiring tests green.
- Panel form submits `displayName` + `{ provider, model }` only through Host Remote.
- Web Agent Teams panel e2e (or refreshed aria golden) shows **New bot** without config-file editing.

## Evidence home

Record stdout + SHA under [evidence/t017-create-ui/](./evidence/t017-create-ui/) when Verifier runs Pass/Fail.

## Topology unchanged

Locked Desktop topology remains: Electron Main + preload lifecycle IPC only; Web under `dsh-app://` talks Host HTTP/WS / Typert Remote. No Electron IPC mailbox or bot-create bus.
