# Evidence — scenario-1 (write profile / log / note)

FR-011/012 / standing orders **11** + **12** artifacts for:

- [Scenario 1 write-kinds recipe](../../scenario-1-write-kinds.md) (T016 SC-001; later T019 SC-002 · T022 SC-003)

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum) — T016 / SC-001

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-profile-listed.png` | Bot memory pane after profile write — kind Profile + fixture content | T016 | **Present** (SC-001 Pass) |
| `02-reject-empty.png` | Clear rejection for empty profile write; Save disabled | T016 | **Present** (SC-001 Pass) |
| `03-after-leave-return.png` | Same Host list after leave/return (no restart) | T016 | **Present** (SC-001 Pass) |
| Optional `00-agent-team-open.png` | Agent Team open with Bot memory surface | T016 | **Present** |
| Optional `scenario-1-profile-write-walkthrough.mp4` | Short recording covering Steps A–C | T016 | **Present** |
| `panel-state.json` · `p5-t016-scenario1-cdp.log` | CDP hard-assert state + driver log | T016 | **Present** |
| `VERDICT.txt` | Filled stamp when SC-001 Pass is claimed | Verifier | **SC-001 Pass** (see file) |

**Later (not this stamp):** T019 may add `04-log-*` · T022 may add `05-note-*` in this directory.

**Provenance (T016):** Desktop CDP hard-assert profile write/reject/leave-return on tip `10a728c96c` (DISPLAY=:1). See [VERDICT.txt](./VERDICT.txt) · `panel-state.json` · `p5-t016-scenario1-cdp.log`.

**SO11 mirrors (T016):** `/opt/cursor/artifacts/p5-t016-01-profile-listed.png`, `p5-t016-02-reject-empty.png`, `p5-t016-03-after-leave-return.png`, `p5-t016-scenario1-profile-write-walkthrough.mp4`, `p5-t016-00-agent-team-open.png`.
