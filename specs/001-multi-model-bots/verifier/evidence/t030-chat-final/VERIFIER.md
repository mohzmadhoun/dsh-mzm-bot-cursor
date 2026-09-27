# T030 Verifier run — FAIL

- **When (UTC):** 2026-09-27T10:48:48Z
- **Branch:** cursor/p1-t030-chat-final-92fa
- **SHA:** 887073c789bf7ba1d0dd75d9a025adb2f9f6f069
- **PR:** https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/60
- **Linear:** MOH-75 (left In Progress)

## Commands

```sh
./node_modules/.bin/vitest run \
  packages/client/ui-chat/tests/conversation-node-definitions.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/client/ui-chat/tests/team-message-source.client.spec.ts \
  -t 'T030|session log|linkedMailbox|mailbox attribution|cold-resume mailbox|mid-turn team-message'
# → 6 passed | 162 skipped (measured)

./node_modules/.bin/vitest run apps/desktop/tests/no-shell-chat-final-ipc.spec.ts
# → 1 failed | 2 passed (measured)
```

## Failure

`documents Host session-log finals only — DESKTOP_IPC stays lifecycle/chrome` expects
`/authenticated Host HTTP\/WS/i` in `apps/desktop/src/host-protocol.ts`, but merge-forward
`887073c789` wrapped the phrase across lines (`authenticated Host\n * HTTP/WS`), so the
literal regex no longer matches.

## Substantive notes (not a Pass)

- Client projection acceptance green (session-log finals + linkedMailbox paths) — measured.
- Forbidden `dsh-desktop:chat-final*` channels absent from `apps/desktop/src` — measured.
- Shell tests `rejects chat-final...` and `keeps Main / preload free...` pass in isolation — measured.
- Recipe prove command for shell must be green for Verifier Pass; HEAD fails that command.
