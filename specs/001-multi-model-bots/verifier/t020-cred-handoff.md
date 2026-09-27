# T020 — Missing-credential handoff to in-app Models

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Electron / Client measured slice for FR-008 failure UX (US1) · contract [../contracts/in-app-credentials.md](../contracts/in-app-credentials.md)
**Branch:** `cursor/p1-t020-cred-handoff-92fa`
**Host signal:** T016 already publishes stable LLM failure code `MISSING_CREDENTIAL` (no richer handoff code required).

## Scope of this recipe

Proves the **Client navigation / message path** when create or chat fails with `MISSING_CREDENTIAL`:

1. Localized copy directs the user to **in-app** Models credential entry.
2. A control opens Settings → Models via Host/Client seam `ctx.settingsShell.openSection('models')`.
3. Electron Main / preload invent neither credential routing nor secret IPC (baseline: [credentials-ipc.md](./credentials-ipc.md)).

Does **not** prove US4 dump hygiene (SC-006). That remains **Scenario 1** / T033–T037.

## What to observe

| Surface | Marker |
|---------|--------|
| Chat turn-error | `data-turn-error-code="MISSING_CREDENTIAL"` + `data-missing-credential-handoff` button |
| Team create/chat alert | `data-team-error="MISSING_CREDENTIAL"` + `data-missing-credential-handoff` button |
| Settings shell bind | SettingsRoot binds `openSection` onto `ctx.settingsShell` while mounted |

Copy lives in locale dictionaries (`ui-chat` / `client-ui-agent-team`). Primary path text names Models / in-app entry; 1Password may appear only as a non-primary disclaimer.

## Commands (rerunnable)

```sh
./node_modules/.bin/vitest run \
  packages/client/ui-settings/tests/settings-shell.client.spec.ts \
  packages/client/ui-settings/tests/plugin.client.spec.ts \
  packages/client/ui-settings-general/tests/settings-root.client.spec.tsx \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'MISSING_CREDENTIAL|settingsShell|binds openSection|missing-credential'
```

Host route proof (unchanged from T016):

```sh
./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/llm-route.spec.ts \
  -t 'MISSING_CREDENTIAL'
```

## Pass criteria (T020 slice)

- Chat turn-error with `MISSING_CREDENTIAL` shows in-app Models guidance and calls `openModelsSettings` on the handoff control.
- Team panel surfaces the same handoff when create/chat returns `MISSING_CREDENTIAL`.
- `ctx.settingsShell.openSection('models')` reaches SettingsRoot's bound opener (Models section visible).
- No new Electron credential secret IPC channels.
- This slice alone does **not** claim Scenario 1 / SC-006 dump Pass (US4 owns that).

## Related

- T016 Host `MISSING_CREDENTIAL` route: [t016-llm-route.md](./t016-llm-route.md)
- T011 no secret IPC baseline: [credentials-ipc.md](./credentials-ipc.md)
- US4 Scenario 1 dump hygiene: quickstart Scenario 1 / `scenario-1-credentials.md` (T037)
