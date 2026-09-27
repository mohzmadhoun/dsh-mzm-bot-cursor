# T026 Guard against Electron bot↔bot messaging bus — Verifier proof recipe

**Status:** US2 architecture/regression guard (not Scenario 3 / SC-003 Pass — full mailbox UI recipe is T025).
**Owners:** DH Electron (automation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-004 negative — Electron Main MUST NOT invent a bot↔bot messaging bus; Host Agent Teams Lead-log mailbox is the only 1:1 path ([contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md) · [contracts/topology-handshake.md](../contracts/topology-handshake.md) criterion 6)
**Branch:** `cursor/p1-t026-no-ipc-bus-92fa` (base `master`)

## What this proves

1. `DESKTOP_IPC` and Host Node IPC (`ready` / `fatal` / `shutdown-complete` / `update-tasks` / `shutdown`) expose no mailbox, bot-message, peer-message, or agent-chat channels.
2. Shell sources (`ipc.ts`, `host-protocol.ts`, `main.ts`, `host-process.ts`, preloads) document Host HTTP/WS ownership and contain no product mailbox APIs (`fromBotId`, `toBotId`, `deliveryState`, `sendTeamMessage`, `TeamService`).
3. Story-level static inventory remains green independently of Scenario 0 handshake runtime spawn (T007).

Does **not** prove SC-003 Desktop UI handoff (T023–T025). Does **not** re-own Host mailbox send/persist (T021–T022). Complements T007 handshake negative — both stay ([analyze-report.md](../analyze-report.md) D1).

## Preconditions

- [ ] Checkout on `cursor/p1-t026-no-ipc-bus-92fa` (or merge-base including T026)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (static inventory)

## Commands (rerunnable)

```sh
pnpm exec vitest run apps/desktop/tests/no-electron-mailbox-bus.spec.ts
```

Optional Scenario 0 handshake negative (runtime fake-mailbox reject):

```sh
pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'rejects fake mailbox'
```

## Pass criteria

- `no-electron-mailbox-bus.spec.ts` green: channel allow-list, forbidden-name inventory, shell source scan.
- Optional topology negative remains green when rerun.

## Evidence home

Record stdout + SHA under [evidence/t026-no-ipc-bus/](./evidence/t026-no-ipc-bus/) when Verifier runs Pass/Fail.

## Related

- Contract: [../contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)
- Topology negative (T007): `apps/desktop/tests/topology-handshake.spec.ts`
- Automation: `apps/desktop/tests/no-electron-mailbox-bus.spec.ts`
- Scenario 3 (T025): `scenario-3-mailbox.md` (when present)
