# T035 — Missing/invalid credential UX + no silent fallback

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Electron / Client measured US4 slice for FR-008 failure UX · contract [../contracts/in-app-credentials.md](../contracts/in-app-credentials.md)
**Branch:** `cursor/p1-t035-cred-ux-92fa`
**Host signal:** Stable LLM codes `MISSING_CREDENTIAL`, `AUTH`, `INVALID_CREDENTIAL` (T016 / adapters).

## Scope of this recipe

Proves the **Client + Host resolve** half of FR-008 failure UX (US4):

1. Missing credential for the needed provider → localized in-app Models guidance + `ctx.settingsShell.openSection('models')` (not 1Password).
2. Invalid / revoked mid-session (`AUTH`, `INVALID_CREDENTIAL`) → clear failure copy + the same Models re-entry control.
3. Host `ctx.credentials.resolve(ref)` never silently substitutes another reference’s secret (no cross-bot fallback under `packages/credentials/`).

Does **not** prove SC-006 dump hygiene (T037 / Scenario 1). Does **not** re-own T033 write-only entry or T034 preload audit.

## What to observe

| Surface | Marker |
|---------|--------|
| Chat missing | `data-turn-error-code="MISSING_CREDENTIAL"` + `data-missing-credential-handoff` |
| Chat invalid/revoked | `data-turn-error-code="AUTH"` or `"INVALID_CREDENTIAL"` + `data-invalid-credential-handoff` |
| Team create/chat alert | `data-team-error` equals the Host code + matching handoff button |
| Host resolve | `resolve(peerRef)` is `undefined` while only another ref is stored |

Copy lives in `ui-chat` / `client-ui-agent-team` locale dictionaries. Primary path text names Models / in-app entry; 1Password appears only as a non-primary disclaimer.

## Commands (rerunnable)

```sh
./node_modules/.bin/vitest run \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/client/ui-chat/tests/conversation.client.spec.ts \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'MISSING_CREDENTIAL|AUTH|INVALID_CREDENTIAL|credential|Models re-entry|redacts auth'
```

Host no-peer-fallback resolve:

```sh
./node_modules/.bin/vitest run \
  packages/credentials/credentials/tests/credentials.spec.ts \
  packages/credentials/credentials-local/tests/local.spec.ts \
  -t 'never silently falls back'
```

Host bot route still refuses peer credential (T016 unchanged):

```sh
./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/llm-route.spec.ts \
  -t 'MISSING_CREDENTIAL'
```

## Pass criteria (T035 slice)

- Chat turn-error with `MISSING_CREDENTIAL` keeps T020 Models handoff.
- Chat turn-error with `AUTH` or `INVALID_CREDENTIAL` shows clear failure + Models re-entry (`data-invalid-credential-handoff` → `openModelsSettings`).
- Team panel surfaces the same re-entry for those Host codes on create/chat failures.
- `credentials.resolve` / `credentials-local` miss for one ref never returns a peer ref’s value.
- This slice alone does **not** claim Scenario 1 / SC-006 dump Pass (T037).

## Related

- T020 missing-credential handoff: [t020-cred-handoff.md](./t020-cred-handoff.md)
- T016 Host `MISSING_CREDENTIAL` route: [t016-llm-route.md](./t016-llm-route.md)
- T033 write-only entry: [t033-cred-entry-ui.md](./t033-cred-entry-ui.md)
- T034 no secret IPC: [t034-no-secret-ipc.md](./t034-no-secret-ipc.md)
- US4 Scenario 1 dump hygiene: quickstart Scenario 1 / `scenario-1-credentials.md` (T037)
