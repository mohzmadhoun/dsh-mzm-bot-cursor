# Foundation Host evidence (T007–T016)

Rerunnable focused vitest logs for Architect Path A Host foundation.
Product SC-001…SC-008 and US1 UI are **out of scope** for this gate.

| Log | Command | Measured |
|-----|---------|----------|
| [vitest-connector-event.log](./vitest-connector-event.log) | `pnpm exec vitest run packages/experimental/agent-team/tests/connector-catalog.spec.ts packages/experimental/agent-team/tests/routine-cron.spec.ts packages/experimental/agent-team/tests/projection-events.spec.ts` | 3 files / **32 passed** |
| [vitest-team-routines.log](./vitest-team-routines.log) | `pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'createRoutine\|listRoutines\|pauseRoutine\|resumeRoutine\|evaluateDue'` | **5 passed** / 78 skipped |
| [vitest-electron-bus.log](./vitest-electron-bus.log) | `pnpm exec vitest run apps/desktop/tests/no-electron-connectors-events-trust-bus.spec.ts` | **3 passed** |

See [VERDICT.md](./VERDICT.md).
