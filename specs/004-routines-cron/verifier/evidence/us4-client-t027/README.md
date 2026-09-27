# Evidence — Client US4 T027 (last-run / fire indicator)

SO11 / FR-010 desktop visual evidence for Client last-run / fire indicator on the bot routines pane projecting Host `RoutineProjection.lastRunAt` ([MOH-220](https://linear.app/momadhoun/issue/MOH-220)).

| File | What it shows |
|------|----------------|
| `01-agent-team-open.png` | Agent Team panel open on Desktop |
| `02-fire-never.png` | Routine row with `data-team-routine-fire-indicator="never"` (**Not run yet**) |
| `03-fire-fired.png` | Routine row with `data-team-routine-fire-indicator="fired"` + Host `lastRunAt` ISO |
| `04-after-return-fired.png` | Fired indicator still present after leave/return (Host projection) |
| `panel-state.json` | CDP hard-assert inventory (never + fired + after-return) |
| `p4-us4-client-t027-vitest.log` | Focused Client T027 / T020 / T023 tests |
| `p4-us4-client-t027-verifier-vitest.log` | Verifier re-run focused T027 / T020 / T023 @ tip |
| `p4-us4-client-t027-verifier-electron-bus.log` | Verifier no-electron-routines-bus |
| `p4-us4-client-t027-verifier-cdp.log` | Verifier Desktop CDP hard-assert log |
| `fire-indicator-walkthrough.mp4` | Desktop walkthrough (never + fired indicators) |
| `VERDICT.txt` | DH Verifier Pass stamp (Client product UI slice) |

Walkthrough copies also under `/opt/cursor/artifacts/p4-us4-t027-*` for PR embeds (SO12).

**Scope:** Client product UI slice (T027). Host T025 cron fire + `lastRunAt` commit is on master via [#161](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/161) / [#162](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/162). Does **not** stamp full Scenario 3 / SC-003 Done (T028 recipe). Does **not** claim a ≤6-minute fresh-create wait on this tip when Host already projected `lastRunAt` for active rows. Leave Linear Done to PO after SO12 PR embeds.
