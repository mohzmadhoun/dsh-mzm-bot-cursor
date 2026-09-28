# Evidence — scenario-1 (write profile / log / note)

FR-011/012 / standing orders **11** + **12** artifacts for:

- [Scenario 1 write-kinds recipe](../../scenario-1-write-kinds.md) (T016 SC-001 · T019 SC-002; later T022 SC-003)

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

## Required filenames (minimum) — T019 / SC-002

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `04-log-listed.png` | Bot memory pane after log write — kind Log + fixture content | T019 | **Present** (SC-002 Pass) |
| `05-log-reject-empty.png` | Clear rejection for empty log write; Save disabled | T019 | **Present** (SC-002 Pass) |
| `06-log-after-leave-return.png` | Same Host log row after leave/return (no restart) | T019 | **Present** (SC-002 Pass) |
| Optional `00-agent-team-open-log.png` | Agent Team open during log path | T019 | **Present** |
| Optional `scenario-1-log-write-walkthrough.mp4` | Short recording covering Steps D–F | T019 | **Present** |
| `panel-state-log.json` · `p5-t019-scenario1-log-cdp.log` | CDP hard-assert state + driver log | T019 | **Present** |
| `VERDICT.txt` | Filled stamp when SC Pass is claimed | Verifier | **SC-001 + SC-002 Pass** (see file) |

**Later (not this stamp):** T022 may add `07-note-*` in this directory.

**Provenance (T016):** Desktop CDP hard-assert profile write/reject/leave-return on tip `10a728c96c` (DISPLAY=:1). See [VERDICT.txt](./VERDICT.txt) · `panel-state.json` · `p5-t016-scenario1-cdp.log`.

**Provenance (T019):** Desktop CDP hard-assert log write/reject/leave-return on tip `b067738146` (#183) (DISPLAY=:1). See [VERDICT.txt](./VERDICT.txt) · `panel-state-log.json` · `p5-t019-scenario1-log-cdp.log`.

**SO11 mirrors (T016):** `/opt/cursor/artifacts/p5-t016-01-profile-listed.png`, `p5-t016-02-reject-empty.png`, `p5-t016-03-after-leave-return.png`, `p5-t016-scenario1-profile-write-walkthrough.mp4`, `p5-t016-00-agent-team-open.png`.

**SO11 mirrors (T019):** `/opt/cursor/artifacts/p5-t019-04-log-listed.png`, `p5-t019-05-log-reject-empty.png`, `p5-t019-06-log-after-leave-return.png`, `p5-t019-scenario1-log-write-walkthrough.mp4`, `p5-t019-00-agent-team-open.png`.
