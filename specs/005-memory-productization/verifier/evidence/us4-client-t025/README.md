# Evidence — Client US4 T025 (browse / recall surface)

**Stamp:** see [VERDICT.txt](./VERDICT.txt) — **Pass** @ `1a87f74bd5` ([#189](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/189)).
**Linear:** [MOH-263](https://linear.app/momadhoun/issue/MOH-263)
**Contracts:** [../../contracts/recall.md](../../contracts/recall.md)

| Artifact | Role |
|----------|------|
| `VERDICT.txt` | Pass stamp + acceptance checklist |
| `p5-us4-client-t025-vitest.log` | Focused Client T025 browse/inject tests |
| `p5-us4-client-t025-vitest-verbose.log` | Named Client test lines |
| `p5-us4-client-t025-electron-bus.log` | no-electron-memory-bus spot-check |

## Rerun

```sh
pnpm exec vitest run \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T025 / US4|memoryRecallInjects|browse / recalls|browse listMemories'
pnpm exec vitest run apps/desktop/tests/no-electron-memory-bus.spec.ts
```

**Out of scope:** Desktop Scenario 2 SO11 (T026); Host T023–T024 (#190).
