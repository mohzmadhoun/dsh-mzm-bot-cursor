# Evidence — Host US4 T023–T024 (durable list + memory-recall inject)

**Stamp:** see [VERDICT.txt](./VERDICT.txt) — **Pass** @ `a698ef84bc` ([#190](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/190)).
**Linear:** [MOH-260](https://linear.app/momadhoun/issue/MOH-260) · [MOH-261](https://linear.app/momadhoun/issue/MOH-261)
**Contracts:** [../../contracts/recall.md](../../contracts/recall.md) · [../../memory-inject-bind.md](../../memory-inject-bind.md)

| Artifact | Role |
|----------|------|
| `VERDICT.txt` | Pass stamp + acceptance checklist |
| `p5-us4-host-t023-t024-vitest.log` | Focused Host T023/T024 + memory-bind tests |
| `p5-us4-host-t023-t024-vitest-verbose.log` | Named Host test lines |
| `p5-us4-host-t023-t024-electron-bus.log` | no-electron-memory-bus spot-check |

## Rerun

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/memory-bind.spec.ts \
  packages/experimental/agent-team/tests/persistence.spec.ts \
  packages/experimental/agent-team/tests/team.spec.ts \
  -t 'US4 T023|US4 T024|composeMemoryRecall|bindTeammateMemoryRecall'
pnpm exec vitest run apps/desktop/tests/no-electron-memory-bus.spec.ts
```

**Out of scope:** Desktop Scenario 2 SO11 (T026); Client browse (T025 / #189).
