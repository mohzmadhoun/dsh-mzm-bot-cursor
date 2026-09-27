# T021 Host mailbox send path A→B — Verifier proof recipe

**Status:** Host mailbox send-path proof (not Scenario 3 / SC-003 Pass — UI handoff visibility is T023–T024; full Scenario 3 recipe is T025; Electron bus guard is T026).
**Owners:** DH Runtime (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-004 — Bot A sends async 1:1 to Bot B through Host Agent Teams Lead-log mailbox → target inbox (`deliveryState`: `queued` → `delivered` → `acted` | `visible-pending`). Electron Main MUST NOT invent a bot↔bot messaging bus ([contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md) · [data-model.md](../data-model.md))
**API:** `TeamService.sendMessage` / `SendTeamMessageRequest` under `@deepseek-ai/dsh-experimental-agent-team`; observation via `observeMailboxDeliveryState`
**Branch:** `cursor/p1-t021-mailbox-send-92fa` (base `master` @ T020)

## What this proves

1. Product bots created via Host `createBot` exchange peer mail through `sendMessage` (Bot A → Bot B), not Electron IPC.
2. Lead Session log records `team/message/queued` then `team/message/delivered` for a successful send; target Session holds `TeamMessageSource` (`kind: 'team-message'`).
3. Product `deliveryState` reconstructs from Lead + target session logs:
   - `queued` — Lead queued edge only (delivery deferred / failed soft)
   - `delivered` — Lead delivered edge before target receipt is visible
   - `visible-pending` — target holds the handoff in pending inbox (or durable receipt without a follow-up turn)
   - `acted` — target ran a model turn (`request/header`) after the durable team-message receipt
4. Session-log reconstructable: Verifier can derive state without Main-synthesized mailbox payloads.

Does **not** prove SC-003 Desktop UI handoff (T023–T025). Does **not** add the T026 Electron bus regression guard (note: topology handshake already rejects fake mailbox IPC — T007 / Scenario 0). Does **not** own T022 durable product field aliases (`fromBotId` / `source` naming).

## Preconditions

- [ ] Checkout on `cursor/p1-t021-mailbox-send-92fa` (or merge-base including T021)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (mock LLM in unit tests)

## Commands (rerunnable)

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/mailbox-send.spec.ts \
  packages/experimental/agent-team/tests/delivery-state.spec.ts
```

Optional Host mailbox regression + topology negative (no Electron mailbox bus):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  -t 'Team mailbox and waiting'

pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'rejects fake mailbox'
```

## Pass criteria

- Focused mailbox-send + delivery-state suites green.
- Assertions cover A→B Host path, Lead-log edges, `visible-pending` / `acted` / `queued` observation, and `team-message` source attribution.
- Optional topology negative remains green (no Main mailbox channel).

## Evidence home

Record stdout + SHA under [evidence/t021-mailbox-send/](./evidence/t021-mailbox-send/) when Verifier runs Pass/Fail.

## Related

- Contract: [../contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)
- Scenario 3 (T025): [scenario-3-mailbox.md](./scenario-3-mailbox.md)
- T026 Electron bus guard checklist: extend `apps/desktop/tests/topology-handshake.spec.ts` or add `no-electron-mailbox-bus.spec.ts`
