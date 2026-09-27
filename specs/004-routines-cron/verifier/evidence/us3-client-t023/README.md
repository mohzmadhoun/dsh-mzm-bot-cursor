# Evidence — Client US3 T023 (pause/resume UI)

SO11 / FR-010 desktop visual evidence for Client pause/resume controls on the bot routines pane calling Host Remotes `agentTeams/pauseRoutine` / `agentTeams/resumeRoutine` ([MOH-216](https://linear.app/momadhoun/issue/MOH-216)).

Quickstart Scenario 2 path copies also under [`../scenario-2/`](../scenario-2/) (pause/resume media home).

| File | What it shows |
|------|----------------|
| `01-agent-team-open.png` | Agent Team panel open on Desktop |
| `02-active-before-pause.png` | Active routine + **Pause** (`data-team-routine-pause`) |
| `03-paused.png` | After Host pause — status **Paused** + **Resume** |
| `04-active-after-resume.png` | After Host resume — status **Active** + **Pause** |
| `05-after-return-active.png` | Active status after leave/return |
| `06-after-return-paused.png` | Paused status after leave/return |
| `panel-state.json` | CDP hard-assert steps (active→paused→active + return) |
| `p4-us3-client-t023-vitest.log` | Focused Client T023 tests (10 passed) |
| `p4-us3-client-t023-verifier-cdp.log` | Verifier Desktop CDP hard-assert log |
| `pause-resume-walkthrough.mp4` | Desktop walkthrough (pause ↔ resume) |
| `VERDICT.txt` | DH Verifier Pass stamp (Client product UI slice) |

Walkthrough copies also under `/opt/cursor/artifacts/p4-us3-t023-*` for PR embeds (SO12).

**Scope:** Client product UI slice (T023). Host T022 Remotes are on master via [#157](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/157). Does **not** stamp full Scenario 2 / SC-002 Done (T024 recipe + cron no-fire while paused). Does **not** claim Host wake-suppression beyond the Client status projection shown here. Leave Linear Done to PO after SO12 PR embeds.
