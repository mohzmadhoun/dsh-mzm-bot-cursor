# T030 Chat final delivery + mailbox attribution — Verifier proof recipe

**Status:** Client final-delivery proof (not Scenario 4 / SC-004 Pass — progress half is T029; full Scenario 4 recipe is T032).
**Owners:** DH Electron / Client (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-006 (complete half) — final result in chat on turn completion / assistant (or handoff) result from session log; optional `linkedMailboxMessageId` when the turn is caused by a mailbox message ([data-model.md](../data-model.md) Chat turn; [contracts/chat-progress-final.md](../contracts/chat-progress-final.md))
**Surface:** `@deepseek-ai/dsh-client-ui-chat` conversation cards · Desktop shell IPC inventory
**Branch:** `cursor/p1-t030-chat-final-92fa` (base `master`)

## What this proves

1. Chat projects durable `assistant/message` settlement into a visible final Assistant row with `data-chat-final="session-log"`.
2. When the turn is attributable to a Host mailbox `team-message` receipt (cold-resume preceding `turn/start`, or mid-turn steer), turn-tail carries `linkedMailboxMessageId` and the closing final exposes `data-linked-mailbox-message-id`.
3. Electron Main / preload expose **no** `dsh-desktop:chat-final` / `assistant-final` / `final-result` channel — finals are not Main-synthesized IPC.

Does **not** prove SC-004 end-to-end on Desktop (needs T029 progress + T032 Scenario 4). Does **not** own handoff row chrome (T024) or Scenario 3 (T025).

## Preconditions

- [ ] Checkout on `cursor/p1-t030-chat-final-92fa` (or merge-base including T030)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (unit / client projection tests)

## Commands (rerunnable)

Focused Client session-log final + mailbox attribution:

```sh
pnpm exec vitest run \
  packages/client/ui-chat/tests/conversation-node-definitions.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/client/ui-chat/tests/team-message-source.client.spec.ts \
  -t 'T030|session log|linkedMailbox|mailbox attribution|cold-resume mailbox|mid-turn team-message'
```

Shell MUST NOT invent chat-final IPC:

```sh
pnpm exec vitest run \
  apps/desktop/tests/no-shell-chat-final-ipc.spec.ts
```

## Pass criteria

- Projection suite shows settled `assistant/message` final with turn-tail `linkedMailboxMessageId` for cold-resume and mid-turn team-message paths.
- ChatView suite shows `data-chat-final="session-log"` and optional `data-linked-mailbox-message-id` on the closing final.
- Shell guard green: `DESKTOP_IPC` / Host Node IPC stay lifecycle/chrome; no `dsh-desktop:chat-final*` channels in Main/preload sources.

## Evidence home

Record stdout + SHA under [evidence/t030-chat-final/](./evidence/t030-chat-final/) when Verifier runs Pass/Fail.

## Topology unchanged

Locked Desktop topology remains: Electron Main + preload lifecycle IPC only; Web under `dsh-app://` talks Host HTTP/WS. Chat finals ride Host session log into Client `ui-chat` — no Electron final bus.

## Related

- Contract: [../contracts/chat-progress-final.md](../contracts/chat-progress-final.md)
- Data model: [../data-model.md](../data-model.md) (Chat turn)
- T029 Host-stream progress: [t029-chat-progress.md](./t029-chat-progress.md)
- Scenario 4 (T032): [scenario-4-progress-final.md](./scenario-4-progress-final.md)
