# T027 Thin Electron shell — Verifier proof recipe

**Status:** Confirm Desktop Main stays lifecycle + `dsh-app://` HTTP forward only (not Scenario 4 Pass — chat progress/final is T029–T032; mailbox-bus guard is T026; secret-IPC re-audit is T034).
**Owners:** DH Electron (shell inventory) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-007 — Desktop Electron thin shell loads Web client (`dsh-app://`) without a mailbox, credential, or model router in Main ([architecture.md](../architecture.md) · [plan.md](../plan.md) Electron preserve-thin-shell)
**Surfaces:** `apps/desktop/src/main.ts`, `apps/desktop/src/web-document.ts`, `apps/desktop/src/backend-controller.ts`
**Branch:** `cursor/p1-t027-thin-shell-92fa` (base `master`)

## What this proves

1. The three Main thin-shell modules contain no mailbox / bot-message / createBot / ModelSelection / provider-credential / `ctx.llm` router code.
2. `main.ts` serves the Web client on `dsh-app://app/` and forwards non-static paths through `authenticateWebHost` + `forwardWebRequest`.
3. `backend-controller.ts` owns Host child start/stop/close only (no `ipcMain` product handlers).
4. Main `ipcMain` registrations use only `DESKTOP_IPC` boot / chrome / update channels.

Does **not** prove SC-004 (progress + final — Scenario 4 / T032). Does **not** own T026 `no-electron-mailbox-bus.spec.ts` or T034 `no-secret-ipc.spec.ts`.

## Preconditions

- [ ] Checkout on `cursor/p1-t027-thin-shell-92fa` (or merge-base including T027)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`

## Commands (rerunnable)

```sh
pnpm exec vitest run apps/desktop/tests/thin-shell-main.spec.ts
```

Optional related inventories (owned elsewhere; do not edit those files from T027):

```sh
pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'mailbox / bot-message|createBot / ModelSelection'
pnpm exec vitest run apps/desktop/tests/web-document.spec.ts
pnpm exec vitest run apps/desktop/tests/backend-controller.spec.ts
```

## Pass criteria

- `thin-shell-main.spec.ts` green: forbidden product routers absent; `dsh-app://` serve + Host HTTP forward present; backend lifecycle-only; `DESKTOP_IPC` channels stay boot/chrome/update.
- No new mailbox / credential / model router landed in the three audited Main sources.

## Fail rules

Fail T027 if any of:

- `main.ts`, `web-document.ts`, or `backend-controller.ts` gains mailbox, bot-create, model-selection, or provider-credential routing.
- Main stops loading the client on `dsh-app://` or stops forwarding application HTTP to the owned Host.
- `DesktopBackendController` grows product IPC or data-plane routing beyond Host child lifecycle.

## Evidence home

Record stdout under [evidence/t027-thin-shell/](./evidence/t027-thin-shell/) when Verifier runs Pass/Fail.
