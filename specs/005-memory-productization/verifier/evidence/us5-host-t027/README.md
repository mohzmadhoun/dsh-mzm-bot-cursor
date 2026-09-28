# Evidence — Host US5 T027 (agent isolation + user sharing)

**Gate:** Host product slice only (not SC-005 / Desktop Scenario 3 Done).
**Stamp:** see [VERDICT.txt](./VERDICT.txt) — **Pass** @ `b28dd51d2d` ([#193](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/193)).
**Linear:** [MOH-265](https://linear.app/momadhoun/issue/MOH-265) — leave **In Progress** until PO merges.
**SO11 / SC-005 Desktop:** deferred to **T030** (not claimed here).

| File | Content |
|------|---------|
| `VERDICT.txt` | Pass stamp + acceptance checklist |
| `p5-us5-host-t027-vitest.log` | Focused vitest summary (5 passed) |
| `p5-us5-host-t027-vitest-verbose.log` | Named test lines |
| `p5-us5-host-t027-electron-bus.log` | no-electron-memory-bus spot-check (3 passed) |
| `p5-us5-host-t027-diff-scope.log` | PR tip + Host-only file list |

**Rerun:**

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/agent-team/tests/persistence.spec.ts \
  packages/experimental/agent-team/tests/projection-events.spec.ts \
  packages/experimental/agent-team/tests/memory-bind.spec.ts \
  -t 'US5 T027|isolates agent-layer'
pnpm exec vitest run apps/desktop/tests/no-electron-memory-bus.spec.ts
```

**Sibling:** Client T028 layer UI under [`../us5-client-t028/`](../us5-client-t028/).
**Desktop SC stamp:** T030 → `../scenario-3/` (open).
