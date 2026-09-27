# T028 Desktop session chrome create/assign — Verifier proof recipe

**Status:** Confirm create-bot + assign-model are operable in Desktop Web session chrome under Electron without config-file editing (not Scenario 2 Pass — SC-001/002 remain T018–T019; credential UX remains T033/T035).
**Owners:** DH Electron (composition inventory) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-007 — Desktop Host profile composes Client create-bot + assign-model into session chrome so the happy path needs no `cordis.patch.yml` edit ([contracts/bot-create-model.md](../contracts/bot-create-model.md) · [architecture.md](../architecture.md))
**Surfaces:** `apps/desktop/src/project-manager.ts` (`DESKTOP_PROFILE_BUNDLES`) · `packages/client/ui-conversation` / `ui-model-selection` · `packages/experimental/client-ui-agent-team` (header action)
**Branch:** `cursor/p1-t028-session-chrome-92fa` (base `master`)

## What this proves

1. Desktop `$DSH_HOME/profiles/desktop` composes `ui-conversation`, `ui-model-selection`, and `ui-agent-team` from the Host profile bundle list (Web template + Agent Teams Host/Web layers).
2. Create-bot mounts on `conversation.session.header.actions` via Agent Teams Client UI and submits Host Remote `agentTeams/createBot` with `displayName` + `{ provider, model }`.
3. Assign-model for the Lead session mounts on `conversation.input.model` via `@deepseek-ai/dsh-client-ui-model-selection` (packages/client).
4. Default profile user patch stays empty — happy path needs no config-file editing.
5. Electron Main does not host createBot / ModelSelection / those session-chrome slots.

Does **not** prove SC-001/SC-002 (live multi-model Desktop session). Does **not** own Models credential entry (T033) or missing-credential navigation polish (T035). Does **not** re-own T017 Client form unit coverage.

## Preconditions

- [ ] Checkout on `cursor/p1-t028-session-chrome-92fa` (or merge-base including T009 + T017 + T028)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`

## Commands (rerunnable)

```sh
pnpm exec vitest run apps/desktop/tests/session-chrome-create-assign.spec.ts
```

Optional related composition smoke (owned by T009; do not edit from T028 unless red):

```sh
pnpm exec vitest run apps/desktop/tests/agent-teams-mount.spec.ts
```

Optional Client create UI regression (owned by T017):

```sh
pnpm exec vitest run \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'creates a Host-owned bot|cancels bot create'
```

## Pass criteria

- `session-chrome-create-assign.spec.ts` green: Desktop composition includes conversation + model-selection + Agent Teams Client rows; create/assign stay on Client session chrome slots; default patch needs no create/assign edits; Main stays free of those routers.
- No requirement to edit `$DSH_HOME/profiles/desktop/cordis.patch.yml` for create-bot or assign-model on the happy path.

## Fail rules

Fail T028 if any of:

- Desktop profile drops `ui-agent-team` or `ui-model-selection` from the composed Host graph.
- Create-bot leaves `conversation.session.header.actions` or assign-model leaves `conversation.input.model`.
- Happy path requires a user `cordis.patch.yml` insert for create/assign.
- Electron Main gains createBot / ModelSelection / session-chrome slot routers.

## Evidence home

Record stdout under [evidence/t028-session-chrome/](./evidence/t028-session-chrome/) when Verifier runs Pass/Fail.
