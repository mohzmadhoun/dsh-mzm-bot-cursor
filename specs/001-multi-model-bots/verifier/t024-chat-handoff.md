# T024 Desktop chat handoff / pending render — Verifier proof recipe

**Status:** Desktop Web chat-surface handoff visibility proof (not full Scenario 3 / SC-003 Pass — that recipe is T025; Electron bus guard is T026).
**Owners:** DH Electron (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-005 — Render user-visible handoff / pending / recipient follow-up in Desktop Web chat surfaces under `packages/client/ui-chat/` / `packages/client/ui-conversation/` and Agent Team UI so copy-paste is not required ([contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)).
**API:** Consume Host `TeamView.handoffs` / `projectMailboxHandoffs` from T023 — never Main-synthesized mailbox IPC.
**Branch:** `cursor/p1-t024-chat-handoff-92fa` (base `master` @ T023)

## What this proves

1. Chat renders durable `team-message` context and pending inbox peer receipts as handoff rows (`data-chat-handoff`, `data-handoff-source="host-mailbox"`, delivery labels).
2. Conversation exposes `conversation.session.notices`; Agent Teams mounts a strip from Host `agentTeams/view` → `TeamView.handoffs` for the viewed Session (`data-chat-handoff-notices`, `data-delivery-state`, Host-only source).
3. Agent Team panel handoff rows from T023 remain green.
4. No Main-synthesized mailbox IPC channel is introduced.

Does **not** add the T025 Scenario 3 end-to-end recipe or T026 Electron bus regression guard.

## Preconditions

- [ ] Checkout on `cursor/p1-t024-chat-handoff-92fa` (or merge-base including T024)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (mock LLM / component fixtures)
- [ ] T023 Host `TeamView.handoffs` present on base

## Commands (rerunnable)

```sh
./node_modules/.bin/vitest run \
  packages/client/ui-chat/tests/team-message-source.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/client/ui-conversation/tests/skeleton.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/handoff-notices.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T024|T023|handoff|empty handoffs|conversation.session.notices|team-message'
```

Optional topology negative (no Electron mailbox bus):

```sh
./node_modules/.bin/vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'rejects fake mailbox'
```

Optional locale ownership:

```sh
pnpm run verify-client-ui-i18n
```

## Pass criteria

- Focused Chat handoff + Conversation notices seat + Agent Team handoff suites green.
- Assertions cover `data-chat-handoff` / `data-handoff-source="host-mailbox"` / delivery labels on chat rows and notices strip.
- Optional topology negative remains green (no Main mailbox channel).

## Evidence home

Record stdout + SHA under [evidence/t024-chat-handoff/](./evidence/t024-chat-handoff/) when Verifier runs Pass/Fail.

## Related

- Contract: [../contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)
- Data model: [../data-model.md](../data-model.md) (Host mailbox message)
- T023 Host projections: [t023-handoff-projections.md](./t023-handoff-projections.md)
- Scenario 3 (T025): `scenario-3-mailbox.md` (when present)
