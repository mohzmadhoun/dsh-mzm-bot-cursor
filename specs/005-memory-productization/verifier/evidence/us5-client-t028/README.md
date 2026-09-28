# Evidence — Client US5 T028 (layer-distinguishable write/browse UI)

**Gate:** Client product slice only (not SC-005 / Desktop Scenario 3 Done).
**Stamp:** see [VERDICT.txt](./VERDICT.txt) — **Pass** @ `61fcbef52b` ([#192](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/192)).
**Linear:** [MOH-266](https://linear.app/momadhoun/issue/MOH-266) — leave **In Progress** until PO merges.
**SO11 / SC-005 Desktop:** deferred to **T030** (not claimed here).

| File | Content |
|------|---------|
| `VERDICT.txt` | Pass stamp + acceptance checklist |
| `p5-us5-client-t028-vitest.log` | Focused vitest summary (2 passed) |
| `p5-us5-client-t028-vitest-verbose.log` | Named test lines |
| `p5-us5-client-t028-memory-regression.log` | Memory surface regression (13 passed) |
| `p5-us5-client-t028-electron-bus.log` | no-electron-memory-bus spot-check (3 passed) |
| `p5-us5-client-t028-diff-scope.log` | PR tip + Client-only file list |

**Rerun:**

```sh
pnpm exec vitest run \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T028'
pnpm exec vitest run \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'memory|T015|T025|T028|layer'
pnpm exec vitest run apps/desktop/tests/no-electron-memory-bus.spec.ts
```

**Sibling:** Host T027 isolation under [`../us5-host-t027/`](../us5-host-t027/).
**Desktop SC stamp:** T030 → `../scenario-3/` (open).
