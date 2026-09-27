# Evidence — Client US2 T020 (routines pane list)

SO11 / FR-010 desktop visual evidence for Client bot info-pane routines list UI projecting Host `RoutineProjection` rows ([MOH-213](https://linear.app/momadhoun/issue/MOH-213)).

| File | What it shows |
|------|----------------|
| `01-agent-team-open.png` | Agent Team panel open on Desktop |
| `02-routines-pane.png` | Bot routines pane chrome (`data-team-routines-pane`) |
| `03-routines-listed.png` | Host-projected rows: identity + schedule + Active + Not run yet |
| `04-after-return.png` | Same Host list after close/reopen |
| `routines-pane-walkthrough.mp4` | Short Desktop walkthrough (open → pane → leave/return) |
| `panel-state.json` | Verifier CDP-extracted per-bot pane/list/empty + row fields |
| `p4-us2-client-t020-vitest.log` | Implementer focused Client jsdom T020 tests |
| `p4-us2-client-t020-verifier-vitest.log` | Verifier re-run of T020 vitest @ tip |
| `p4-us2-client-t020-verifier-cdp.log` | Verifier Desktop CDP hard-assert log |
| `VERDICT.txt` | DH Verifier Pass stamp (Client product UI slice) |

Walkthrough copies also under `/opt/cursor/artifacts/p4-us2-t020-*` for PR embeds (SO12).

**Scope:** Client product UI slice (T020). Does **not** stamp Scenario 1 / SC-001 Done — leave Linear Done to PO after Verifier T021 + SO12 PR embeds.
