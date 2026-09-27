# Evidence — Client US3 T023 (pause/resume UI)

SO11 / FR-010 desktop visual evidence for Client pause/resume controls on the bot routines pane calling Host Remotes `agentTeams/pauseRoutine` / `agentTeams/resumeRoutine` ([MOH-216](https://linear.app/momadhoun/issue/MOH-216)).

| File | What it shows |
|------|----------------|
| `01-agent-team-open.png` | Agent Team panel open on Desktop with Bot routines |
| `02-active-with-pause.png` | Active routines with **Pause** controls (`data-team-routine-pause`) |
| `03-routine-paused.png` | After Host pause — status **Paused** + **Resume** control |
| `04-routine-resumed.png` | After Host resume — status **Active** + **Pause** again |
| `panel-state.json` | CDP-extracted row status / pause / resume ids |
| `p4-us3-t023-vitest.log` | Focused Client jsdom T023 tests (3 passed) |
| `pause-resume-walkthrough.mp4` | Short Desktop walkthrough (pause → resume) |

Walkthrough copies also under `/opt/cursor/artifacts/p4-us3-t023-*` for PR embeds (SO12).

**Scope:** Client product UI slice (T023). Stacked on Host T022 Remotes. Does **not** stamp Scenario 2 / SC-002 Done — leave Linear Done to PO after Verifier + SO12 PR embeds.
