# T029 Chat progress from Host streams — Verifier proof recipe

**Status:** Client progress-render proof (not Scenario 4 / SC-004 Pass — final delivery is T030; full Scenario 4 recipe is T032).
**Owners:** DH Electron / Client (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-006 (in-flight half) — ≥1 progress update before completion on scripted path; shell MUST NOT synthesize a parallel progress protocol ([contracts/chat-progress-final.md](../contracts/chat-progress-final.md))
**Surface:** `@deepseek-ai/dsh-client-ui-chat` conversation cards · Desktop shell IPC inventory
**Branch:** `cursor/p1-t029-chat-progress-92fa` (base `master`)

## What this proves

1. Chat projects Host `assistant/live-chunk` session/agent stream events into a running Assistant node with visible text **before** `assistant/message` settles.
2. ChatView exposes `data-chat-progress="host-stream"` on in-flight streaming rows and the open-turn status label (≥1 progress marker while the turn is open).
3. After settlement, streaming / progress markers clear; durable assistant text remains from the session log path (final delivery ownership stays T030).
4. Electron Main / preload expose **no** `dsh-desktop:chat-progress` / `assistant-stream` / `progress-update` channel — progress is not Main-synthesized IPC.

Does **not** prove SC-004 end-to-end on Desktop (needs T030 final + T032 Scenario 4). Does **not** own handoff-linked attribution (T024 / T031).

## Preconditions

- [ ] Checkout on `cursor/p1-t029-chat-progress-92fa` (or merge-base including T029)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (unit / client projection tests)

## Commands (rerunnable)

Focused Client Host-stream progress:

```sh
pnpm exec vitest run \
  packages/client/ui-chat/tests/conversation-node-definitions.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  -t 'T029|Host-stream chat progress|Host assistant/live-chunk progress'
```

Shell MUST NOT invent chat-progress IPC:

```sh
pnpm exec vitest run \
  apps/desktop/tests/no-shell-chat-progress-ipc.spec.ts
```

## Pass criteria

- Projection suite shows ≥1 `assistant/live-chunk` progress update with `status: 'running'` before `assistant/message` settles.
- ChatView suite shows `data-chat-progress="host-stream"` during streaming and clears it after settlement.
- Shell guard green: `DESKTOP_IPC` / Host Node IPC stay lifecycle/chrome; no `dsh-desktop:chat-progress*` channels in Main/preload sources.

## Evidence home

Record stdout + SHA under [evidence/t029-chat-progress/](./evidence/t029-chat-progress/) when Verifier runs Pass/Fail.

## Topology unchanged

Locked Desktop topology remains: Electron Main + preload lifecycle IPC only; Web under `dsh-app://` talks Host HTTP/WS. Chat progress rides Host session/agent streams into Client `ui-chat` — no Electron progress bus.

## Related

- Contract: [../contracts/chat-progress-final.md](../contracts/chat-progress-final.md)
- T030 final delivery in chat
- Scenario 4 (T032): [scenario-4-progress-final.md](./scenario-4-progress-final.md)
