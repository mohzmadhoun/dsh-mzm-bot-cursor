# Evidence — scenario-3 (cron fire · SC-003)

**Quickstart:** Scenario 3 — cron fire + last-run ([../../quickstart.md](../../quickstart.md))
**Recipe:** [`../../scenario-4-cron-fire.md`](../../scenario-4-cron-fire.md) (US4 / T028; evidence aligned to quickstart Scenario 3)
**Stamp:** [VERDICT.txt](./VERDICT.txt) — SC-003 Pass (Host wake + Desktop last-run UI)
**Linear:** [MOH-221](https://linear.app/momadhoun/issue/MOH-221)

| File | What it shows |
|------|----------------|
| `01-agent-team-open.png` | Agent Team panel open on Desktop |
| `02-fire-never.png` | Contrast row — `data-team-routine-fire-indicator="never"` (**Not run yet**) |
| `03-fire-fired.png` | Fired row — `data-team-routine-fire-indicator="fired"` + Host `lastRunAt` ISO |
| `04-after-return-fired.png` | Fired indicator after leave/return (Host projection) |
| `cron-fire-walkthrough.mp4` | Desktop walkthrough (never + fired indicators) |
| `panel-state.json` | CDP hard-assert inventory (never + fired + after-return) |
| `p4-t028-host-t025-vitest.log` | Host T025 remeasure — `evaluateDueRoutines` + `lastRunAt` (4 passed) |
| `p4-t028-host-t025-verbose.log` | Named Host T025 test lines |
| `p4-t028-client-t027-vitest.log` | Client T027 / US4 focused tests (3 passed) |
| `p4-t028-client-t027-cdp.log` | Desktop CDP hard-assert log (T027 provenance) |
| `p4-t028-electron-bus.log` | no-electron-routines-bus spot-check (3 passed) |
| `VERDICT.txt` | DH Verifier SC-003 Pass stamp |

**Provenance:** Desktop frames + walkthrough reused from Client US4 T027 ([MOH-220](https://linear.app/momadhoun/issue/MOH-220) / [#163](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/163)); mirrored under [`../us4-client-t027/`](../us4-client-t027/). Host fire + `lastRunAt` remeasured on master tip via T025 vitest (preferred over full wall-clock ≤6 min cron wait).

Walkthrough copies also under `/opt/cursor/artifacts/p4-t028-*` for PR embeds (SO12).

**Numbering:** Pause / resume (quickstart Scenario 2) lives under [`../scenario-2/`](../scenario-2/). Do **not** file cron-fire Pass media under `scenario-2/` or invent a parallel `scenario-4/` evidence dir for this stamp — tasks T028 allows aligning the folder with quickstart Scenario 3.
