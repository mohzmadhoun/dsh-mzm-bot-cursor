# Evidence — Client US2 T020 (routines pane list)

SO11 / FR-010 desktop visual evidence for Client bot info-pane routines list UI projecting Host `RoutineProjection` rows ([MOH-213](https://linear.app/momadhoun/issue/MOH-213)).

| File | What it shows |
|------|----------------|
| `01-agent-team-open.png` | Agent Team panel open on Desktop |
| `02-routines-pane.png` | Bot routines pane chrome (`data-team-routines-pane`) |
| `03-routines-listed.png` | Host-projected rows: identity + schedule + Active + Not run yet |
| `04-after-return.png` | Same Host list after close/reopen |
| `routines-pane-walkthrough.mp4` | Short Desktop walkthrough (open → pane → leave/return) |
| `panel-state.json` | CDP-extracted routine ids/status/scheduleExpr/lastRun |
| `p4-us2-client-t020-vitest.log` | Focused Client jsdom T020 tests |
| `p4-us2-client-t020-desktop-cdp.log` | CDP automation log |

Walkthrough copies also under `/opt/cursor/artifacts/p4-us2-t020-*` for PR embeds (SO12).

**Scope:** Client product UI slice (T020). Does **not** stamp Scenario 1 / SC-001 Done — leave Linear Done to PO after Verifier T021.
