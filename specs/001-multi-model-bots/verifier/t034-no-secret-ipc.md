# T034 — No raw secrets in preload / renderer IPC

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Electron measured US4 slice for FR-008 shell half · contract [../contracts/in-app-credentials.md](../contracts/in-app-credentials.md)
**Branch:** `cursor/p1-t034-no-secret-ipc-92fa`
**Baseline:** [credentials-ipc.md](./credentials-ipc.md) (T011 Pass)

## Scope of this recipe

Proves Electron **preload** and **`ipc.ts`** never expose provider credential secret APIs:

1. `DESKTOP_IPC` stays on the lifecycle / chrome allowlist only.
2. Every `apps/desktop/src/preload-*.ts` plus `ipc.ts` matches no credential-secret patterns.
3. `contextBridge.exposeInMainWorld` globals stay on the product/chrome allowlist (no credential bridge).

Does **not** prove Models write-only UI (T033), missing-credential navigation UX (T035), or Scenario 1 dump hygiene SC-006 (T037).

## Commands (rerunnable)

```sh
rg -n -i 'credential|secret|api[_-]?key|password' \
  apps/desktop/src/preload-*.ts apps/desktop/src/ipc.ts
```

Expected: JSDoc-only mentions that **forbid** credentials on this surface (no channel / invoke / bridge for secrets).

```sh
./node_modules/.bin/vitest run apps/desktop/tests/no-secret-ipc.spec.ts
```

Optional T016 topology sibling (broader invent-neither inventory):

```sh
./node_modules/.bin/vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'createBot / ModelSelection / provider-credential'
```

## Pass criteria (T034 slice)

- Focused `no-secret-ipc` suite green (channel allowlist + source audit + bridge allowlist).
- `rg` shows no secret IPC channels or credential store call sites on preload/`ipc.ts`.
- This slice alone does **not** claim Scenario 1 / SC-006 dump Pass.

## Evidence home

Record stdout + SHA under [evidence/t034-no-secret-ipc/](./evidence/t034-no-secret-ipc/) when Verifier runs Pass/Fail.
