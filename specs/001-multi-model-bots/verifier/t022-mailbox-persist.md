# T022 Persist Host mailbox message fields — Verifier proof recipe

**Status:** Host mailbox durable product-field proof (not Scenario 3 / SC-003 Pass — Client projections are T023; Desktop UI is T024; full Scenario 3 recipe is T025; Electron bus guard is T026).
**Owners:** DH Runtime (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-004 — Persist durable Host mailbox message fields (`id`, `fromBotId`, `toBotId`, `body`, `createdAt`, `deliveryState`, `source` Host-only) per [data-model.md](../data-model.md). `source` MUST NOT be Electron IPC ([contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)).
**API:** `readHostMailboxMessage` / `HOST_MAILBOX_MESSAGE_SOURCE` under `@deepseek-ai/dsh-experimental-agent-team`; durable store remains Lead Session `team/message/*` (+ target receipt for `deliveryState`)
**Branch:** `cursor/p1-t022-mailbox-persist-92fa` (base `master` @ T021)

## What this proves

1. After Bot A→B Host mailbox send, product fields reconstruct from **persisted** Lead + target Session logs (cold `sessionPersistence` read), not live-only memory.
2. Field aliases match the data model:
   - `id` — durable `TeamMessageId`
   - `fromBotId` ← Lead queued `message.senderId`
   - `toBotId` ← Lead queued `message.targetId`
   - `body` ← Lead queued `message.content`
   - `createdAt` ← Lead queued event `time`
   - `deliveryState` — same observation as T021 (`queued` | `delivered` | `acted` | `visible-pending`)
   - `source` — `{ kind: 'host-mailbox' }` only
3. `source` is Host-only: reconstructed records never carry Electron IPC provenance; target receipts keep `team-message` Host attribution.
4. Session-log reconstructable: Verifier derives the product record without Main-synthesized mailbox payloads.

Does **not** prove SC-003 Desktop UI handoff (T023–T025). Does **not** add the T026 Electron bus regression guard. Does **not** own Client projections (T023).

## Preconditions

- [ ] Checkout on `cursor/p1-t022-mailbox-persist-92fa` (or merge-base including T022)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (mock LLM in unit tests)
- [ ] T021 Host send path present (`observeMailboxDeliveryState` / mailbox-send)

## Commands (rerunnable)

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/host-mailbox-message.spec.ts \
  packages/experimental/agent-team/tests/mailbox-persist.spec.ts
```

Optional T021 delivery-state + topology negative (no Electron mailbox bus):

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/delivery-state.spec.ts \
  packages/experimental/agent-team/tests/mailbox-send.spec.ts

pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'rejects fake mailbox'
```

## Pass criteria

- Focused host-mailbox-message + mailbox-persist suites green.
- Assertions cover cold-persist reconstruction of all product fields, Host-only `source`, and `deliveryState` fold.
- Optional topology negative remains green (no Main mailbox channel).

## Evidence home

Record stdout + SHA under [evidence/t022-mailbox-persist/](./evidence/t022-mailbox-persist/) when Verifier runs Pass/Fail.

## Related

- Contract: [../contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)
- Data model: [../data-model.md](../data-model.md) (Host mailbox message)
- T021 send path: [t021-mailbox-send.md](./t021-mailbox-send.md)
- Scenario 3 (T025): `scenario-3-mailbox.md` (when present)
