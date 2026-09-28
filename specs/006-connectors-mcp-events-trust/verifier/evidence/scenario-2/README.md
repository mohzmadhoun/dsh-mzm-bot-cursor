# Evidence — scenario-2 (event routine create + harness fire)

FR-014/015 / standing orders **11** + **12** artifacts for [Scenario 2 event-routine recipe](../../scenario-2-event-routine.md) (T025 / SC-002 · SC-008). Client US2 T024 Desktop Pass stamped 2026-09-28.

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `00-create-form.png` | Event-routine create surface (trigger kind + webhook harness) | T024 / SC-002 | **Present** |
| `01-event-routine-created.png` | Routines pane after event create — durable event row + clear event/harness label (+ cron contrast) | T025 / SC-002 | **Present** |
| `02-harness-fired-last-run.png` | After harness delivery — last-run / fire indicator visible | T025 / SC-002 | **Present** |
| `03-paused-no-fire.png` | Paused event routine + matching delivery produced **no** new fire | T025 / SC-002 | **Present** |
| `04-cron-still-usable.png` | Cron row still visible / usable beside event (SC-008) | T025 / SC-008 | **Present** (same frame as `01-…`) |
| `scenario-2-event-routine-walkthrough.mp4` | Short recording covering Steps A–D | T025 | **Present** (~50s) |
| `panel-state.json` · `p6-t024-scenario2-cdp.log` | CDP hard-assert provenance | Verifier | **Present** |
| `VERDICT.txt` | Filled stamp when product SC Pass is claimed | Verifier | **Pass** — tip `7d6ae2f75a` |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names (Cloud Agent Verifier)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `00-create-form.png` | `p6-t024-00-create-form.png` |
| `01-event-routine-created.png` | `p6-t024-01-event-routine-created.png` (alias `p6-t025-01-…`) |
| `02-harness-fired-last-run.png` | `p6-t024-02-harness-fired-last-run.png` (alias `p6-t025-02-…`) |
| `03-paused-no-fire.png` | `p6-t024-03-paused-no-fire.png` (alias `p6-t025-03-…`) |
| `04-cron-still-usable.png` | `p6-t024-04-cron-still-usable.png` |
| `scenario-2-event-routine-walkthrough.mp4` | `p6-t024-scenario-2-event-routine-walkthrough.mp4` (alias `p6-t025-scenario-2-…`) |

**Status:** GUI Pass stamped for Client T024 / Scenario 2 on tip `7d6ae2f75a` (rebased onto master + Host #213). See [VERDICT.txt](./VERDICT.txt).
