# T031 Desktop chat handoff surface — Verifier proof recipe

**Status:** Confirm 1:1 handoff / recipient action is understandable on Desktop chat surfaces without leaving the app (not Scenario 3 / SC-003 Pass — that recipe is T025; progress/final Scenario 4 is T032).
**Owners:** DH Electron (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-007 US3 scenario 3 — wire US2 Host `TeamView.handoffs` projections from `packages/experimental/client-ui-agent-team/` into `packages/client/ui-chat/` / `packages/client/ui-conversation/` under Desktop so pending / acted state is visible without developer tooling ([contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)).
**API:** Consume Host `agentTeams/view` → `TeamView.handoffs` only — never Main-synthesized mailbox IPC.
**Branch:** `cursor/p1-t031-chat-handoff-surface-92fa` (base `master`)

## What this proves

1. Desktop `$DSH_HOME/profiles/desktop` composes `ui-chat`, `ui-conversation`, and `ui-agent-team` from the Host profile bundle list (Web template + Agent Teams Host/Web layers) with an empty user patch.
2. Agent Teams Client mounts `HandoffNotices` on `conversation.session.notices` from Host `TeamView.handoffs` (pending + **acted** labels; Host-only `source`; in-app `openTeammate`).
3. Conversation skeleton renders the notices seat between Chat View and composer.
4. Chat renders durable team-message rows as `MailboxHandoffRow` (`data-chat-handoff`, `data-handoff-source="host-mailbox"`) and folds delivery to **acted** when a later turn Node follows the receipt.
5. Electron Main / preload invent no mailbox / handoff IPC channel.

Does **not** re-own T024 unit coverage wholesale or T025 Scenario 3 live Desktop Pass.

## Preconditions

- [ ] Checkout on `cursor/p1-t031-chat-handoff-surface-92fa` (or merge-base including T023 + T024 + T031)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (composition inventory + Client fixtures)

## Commands (rerunnable)

Desktop composition inventory + Host-only wire:

```sh
pnpm exec vitest run apps/desktop/tests/chat-handoff-surface.spec.ts
```

Focused Chat recipient-acted + notices strip (US2 projections under chat surfaces):

```sh
pnpm exec vitest run \
  packages/client/ui-chat/tests/team-message-source.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/experimental/client-ui-agent-team/tests/handoff-notices.client.spec.tsx \
  -t 'T031|T024|chatHandoffDeliveryState|handoff|acted'
```

Optional Conversation notices seat + topology negative:

```sh
pnpm exec vitest run \
  packages/client/ui-conversation/tests/skeleton.client.spec.tsx \
  -t 'active phase: fixed header'

pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'rejects fake mailbox'
```

## Pass criteria

- `chat-handoff-surface.spec.ts` green: Desktop composes chat + conversation + Agent Teams Client; notices mount + chat handoff rows present; Main free of mailbox/handoff routers; happy path needs no `cordis.patch.yml` edit.
- Focused Client suites green: durable handoff folds to `data-delivery-state="acted"` after recipient follow-up; notices strip shows Host `acted` from `TeamView.handoffs`.

## Fail rules

Fail T031 if any of:

- Desktop profile drops `ui-chat`, `ui-conversation`, or `ui-agent-team`.
- `conversation.session.notices` loses the Agent Teams handoff strip, or Chat no longer renders Host mailbox handoff rows.
- Recipient-acted state is invisible on both chat transcript and notices strip.
- Electron Main gains mailbox / handoff IPC.

## Evidence home

Record stdout + SHA under [evidence/t031-chat-handoff-surface/](./evidence/t031-chat-handoff-surface/) when Verifier runs Pass/Fail.

## Related

- Contract: [../contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)
- T023 Host projections: [t023-handoff-projections.md](./t023-handoff-projections.md)
- T024 Chat handoff render: [t024-chat-handoff.md](./t024-chat-handoff.md)
- Scenario 3 (T025): [scenario-3-mailbox.md](./scenario-3-mailbox.md)
