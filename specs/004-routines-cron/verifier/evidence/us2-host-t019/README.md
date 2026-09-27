# Evidence — Host US2 T019 (`listRoutinesByBot`)

**Gate:** Host product slice only (not Scenario 1 / SC-001 Done).
**Stamp:** see [VERDICT.txt](./VERDICT.txt) — **Pass** @ master `42ddd6ea3d` ([#153](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/153) squash).
**Linear:** [MOH-212](https://linear.app/momadhoun/issue/MOH-212) — leave **In Progress** until PO merges.

| File | Content |
|------|---------|
| `VERDICT.txt` | Pass stamp + acceptance checklist |
| `p4-us2-host-t019-vitest.log` | Focused vitest summary (2 passed) |
| `p4-us2-host-t019-vitest-verbose.log` | Named test lines |
| `p4-us2-host-t019-option3.log` | Host SoT / no `dsh-schedule` dep / no Electron bus |
| `p4-us2-host-t019-rebase.log` | Tip SHA + 0 behind master |
| `p4-us2-host-t019-diff-scope.log` | Host-only file list |

**Rerun:**

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/agent-team/tests/projection-events.spec.ts \
  -t 'US2 T019|projectRoutine / projectRoutines'
```
