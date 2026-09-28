# Evidence — computer-use (Scenario 2 · SC-002)

**Recipe:** [../../scenario-2-computer-use.md](../../scenario-2-computer-use.md) (T023)
**Acceptance:** SC-002 · FR-003 · FR-013 · FR-014 · FR-015
**Linear:** [MOH-379](https://linear.app/momadhoun/issue/MOH-379) · [MOH-385](https://linear.app/momadhoun/issue/MOH-385/t029-evidence-dir-placeholders-so-1112-expectations) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · `P-MOH-2` only
**Quickstart:** [../../../quickstart.md](../../../quickstart.md) Scenario 2

FR-013/014 / standing orders **11** + **12** artifacts for computerUse-class screenshot observation + parent handoff. Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies. Interactive browser click/type is **not** required (FR-003).

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-computer-use-observation.png` | ≥1 user-visible screenshot / GUI observation artifact | T023 | **measured** Desktop Pass |
| `02-computer-use-parent-handoff.png` | Parent chat/session handoff or result indicator | T023 | **measured** Desktop Pass |
| `scenario-2-computer-use-walkthrough.mp4` (optional) | Short recording covering observation → handoff | T023 | **measured** Desktop Pass |
| `VERDICT.txt` | SC-002 stamp | Verifier | **Pass** (see file) |

Supporting dumps (`dom-dump.json`, `panel-state.json`) are optional Verifier notes — not substitutes for screenshots.

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-013 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-014 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `01-computer-use-observation.png` | `01-computer-use-observation.png` |
| `02-computer-use-parent-handoff.png` | `02-computer-use-parent-handoff.png` |
| `scenario-2-computer-use-walkthrough.mp4` | `scenario-2-computer-use-walkthrough.mp4` |

## Placeholder policy (T029)

This directory is the locked FR-014 evidence home for Scenario 2 / SC-002. Required filenames above satisfy SO 11+12. Do **not** move computerUse media into `shell-box/`, `settings/`, or `non-goals/`. Do **not** require interactive-browser frames for Pass.

**T029 layout stamp:** Filenames documented 2026-09-28. Product SC-002 Desktop Pass already filed under this directory (see [VERDICT.txt](./VERDICT.txt)).
