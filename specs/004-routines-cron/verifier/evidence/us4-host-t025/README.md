# Evidence — Host US4 T025 (`evaluateDueRoutines` + `lastRunAt`)

**Gate:** Host product slice only (not SC-003 / Desktop Scenario Done).
**Stamp:** see [VERDICT.txt](./VERDICT.txt) — **Pass** @ `c3b49cfbbc` ([#161](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/161)).
**Linear:** [MOH-218](https://linear.app/momadhoun/issue/MOH-218) — leave **In Progress** until PO merges.

| File | Content |
|------|---------|
| `VERDICT.txt` | Pass stamp + acceptance checklist |
| `p4-us4-host-t025-vitest.log` | Focused vitest summary (4 passed) |
| `p4-us4-host-t025-vitest-verbose.log` | Named test lines |
| `p4-us4-host-t025-electron-bus.log` | no-electron-routines-bus spot-check (3 passed) |
| `p4-us4-host-t025-option3.log` | Host SoT / no `dsh-schedule` / Electron forbid cron-fire |
| `p4-us4-host-t025-diff-scope.log` | PR tip + Host-only file list |

**Rerun:**

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/routine-cron.spec.ts \
  packages/experimental/agent-team/tests/team.spec.ts \
  -t 'US4 T025'
pnpm exec vitest run apps/desktop/tests/no-electron-routines-bus.spec.ts
```
