# Evidence — scenario-2 (event routine create + harness fire)

FR-014/015 / standing orders **11** + **12** artifacts for [Scenario 2 event-routine recipe](../../scenario-2-event-routine.md) (T025 / SC-002 · SC-008).

Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-event-routine-created.png` (or `.webp`) | Routines pane after event create — durable event row + clear event/harness label | T025 / SC-002 | **Placeholder** — required for GUI Pass |
| `02-harness-fired-last-run.png` (or recording segment) | After harness delivery — last-run / fire indicator visible | T025 / SC-002 | **Placeholder** — required for GUI Pass |
| `03-paused-no-fire.png` (or recording segment) | Paused event routine + matching delivery produced **no** new fire | T025 / SC-002 | **Placeholder** — required for GUI Pass |
| Optional `00-create-form.png` | Event-routine create surface before save | T025 | Optional |
| Optional `04-cron-still-usable.png` | Cron row still visible / usable beside event (SC-008); may merge with `01-…` | T025 / SC-008 | Optional if `01-…` already shows cron |
| Optional `scenario-2-event-routine-walkthrough.mp4` / `.webm` | Short recording covering Steps A–D | T025 | Optional but preferred for multi-step |
| `VERDICT.txt` | Filled stamp when product SC Pass is claimed | Verifier | **Deferred** — do not claim without SO 11+12 media |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-014 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-015 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names (suggested when Cloud Agent Verifier runs)

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `01-event-routine-created.png` | `p6-t025-01-event-routine-created.png` |
| `02-harness-fired-last-run.png` | `p6-t025-02-harness-fired-last-run.png` |
| `03-paused-no-fire.png` | `p6-t025-03-paused-no-fire.png` |
| `scenario-2-event-routine-walkthrough.mp4` | `p6-t025-scenario-2-event-routine-walkthrough.mp4` |

**Status:** Placeholder only — product Pass not stamped; recipe docs land in T025 before media. GUI Pass blocked until Host/Client US2 surfaces (T022–T024) + Desktop SO 11+12 evidence land.
