# T033 — In-app Models credential entry UI

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Electron / Client measured confirm for FR-008 write-only entry (US4) · contract [../contracts/in-app-credentials.md](../contracts/in-app-credentials.md)
**Branch:** `cursor/p1-t033-cred-entry-ui-92fa`
**Host store:** `@deepseek-ai/dsh-credentials-local` under `$DSH_HOME` (T011 Pass baseline: [credentials-ipc.md](./credentials-ipc.md))

## Scope of this recipe

Proves the **Models / settings write-only credential entry** product path:

1. User enters a provider API key in-app on Settings → Models (`packages/client/ui-settings-models/`).
2. Client stores the literal through Host `remote.credentials.set(ref, value)` → `CredentialRef` in `dsh-credentials-local`.
3. UI may read/show non-secret `CredentialInfo` only (`configured` / `source?` / `writable`).
4. Product primary remains in-app (not 1Password). Electron Main / preload invent no credential secret IPC.

Does **not** prove SC-006 dump hygiene. That remains **Scenario 1** / T037.
Does **not** own T034 preload re-audit, T035 invalid/revoked re-entry, or T036 env/key-file docs.

## What to observe

| Surface | Marker / fact |
|---------|----------------|
| Write-only key input | `input[type=password][data-models-credential-entry]` + locale `keyInput` |
| Store path | `credentials.set(<CredentialRef>, trimmedValue)` — not `settings.mutate` for the secret |
| Configured state | Locale `credentialConfigured` / placeholder `keyStored` from `CredentialInfo.configured` |
| Missing state | Locale `credentialMissing` when named ref describes `configured: false` |
| Host wire projection | `CredentialsController.describe` returns only `CredentialInfo` fields (no secret) |

Copy lives in `packages/client/ui-settings-models/src/client/locales.ts`. Intro names in-app API key entry; 1Password is not a Models primary path.

## Commands (rerunnable)

```sh
./node_modules/.bin/vitest run \
  packages/client/ui-settings-models/tests/components.client.spec.tsx \
  packages/client/ui-settings-models/tests/provider-form.client.spec.tsx \
  packages/client/ui-settings-models/tests/onboarding-dialog.client.spec.tsx \
  -t 'write-only|CredentialInfo|API key field|credential-only onboarding|stores a typed key'
```

Host Remote projection (secret never on describe wire):

```sh
./node_modules/.bin/vitest run \
  packages/api/settings-controller/tests/credentials-controller.host.spec.ts \
  -t 'values excluded|extra enumerable'
```

Local store seam (file-backed `CredentialRef` under harness home):

```sh
./node_modules/.bin/vitest run \
  packages/credentials/credentials-local/tests/local.spec.ts \
  -t 'absent file|source: .file.|writable store'
```

Electron secret IPC absence (unchanged T011 baseline):

```sh
rg -n -i 'credential|secret|api[_-]?key|password' \
  apps/desktop/src/preload-*.ts apps/desktop/src/ipc.ts
```

## Pass criteria (T033 slice)

- Models editor / setup / onboarding credential field is `type=password` with `data-models-credential-entry`.
- Apply stores via `credentials.set` under the profile `CredentialRef` (derived `<ROUTE>_API_KEY` when unnamed).
- After store, status / row chrome do not echo the secret; reopened editor shows empty password + `keyStored` / configured indicator from `CredentialInfo` only.
- Host `describe` projection and `credentials-local` remain the store path; no new Electron secret IPC.
- This slice alone does **not** claim Scenario 1 / SC-006 dump Pass (T037).

## Related

- T011 no secret IPC baseline: [credentials-ipc.md](./credentials-ipc.md)
- T020 missing-credential handoff into Models: [t020-cred-handoff.md](./t020-cred-handoff.md)
- US4 Scenario 1 dump hygiene: quickstart Scenario 1 / `scenario-1-credentials.md` (T037)
