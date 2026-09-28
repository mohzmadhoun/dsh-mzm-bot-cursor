# Evidence — settings (Scenario 3 · SC-003 / SC-004)

**Recipe:** [../../scenario-3-settings-computer.md](../../scenario-3-settings-computer.md) (T027)
**Acceptance:** SC-003 · SC-004 · FR-004 · FR-005 · FR-010 · FR-013 · FR-014 · FR-016
**Linear:** [MOH-383](https://linear.app/momadhoun/issue/MOH-383) · [MOH-385](https://linear.app/momadhoun/issue/MOH-385/t029-evidence-dir-placeholders-so-1112-expectations) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · `P-MOH-2` only
**Quickstart:** [../../../quickstart.md](../../../quickstart.md) Scenario 3

FR-013/014 / standing orders **11** + **12** artifacts for Global Settings → **Computer** showing **Shell** + **Computer use** rows with Shell readiness visible. Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

**SC-004 / FR-005:** SC-003 chrome alone MUST NOT grant SC-001 or SC-002 — those remain under `shell-box/` and `computer-use/`.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `01-settings-computer-section.png` | Global Settings → **Computer** with both **Shell** and **Computer use** rows | T027 | **measured** Desktop Pass |
| `02-settings-shell-readiness.png` | Shell row with visible Host readiness (ready or clear not-ready/starting/failed) | T027 | **measured** Desktop Pass |
| `scenario-3-settings-walkthrough.mp4` (optional) | Short recording covering Settings → Computer | T027 | **measured** Desktop Pass |
| `VERDICT.txt` | SC-003 stamp (must note SC-004 chrome ≠ SC-001/SC-002) | Verifier | **Pass** (see file) |

Supporting dumps (`panel-state.json`) are optional Verifier notes — not substitutes for screenshots.

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-013 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-014 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `01-settings-computer-section.png` | `01-settings-computer-section.png` |
| `02-settings-shell-readiness.png` | `02-settings-shell-readiness.png` |
| `scenario-3-settings-walkthrough.mp4` | `scenario-3-settings-walkthrough.mp4` |

## Placeholder policy (T029)

This directory is the locked FR-014 evidence home for Scenario 3 / SC-003. Required filenames above satisfy SO 11+12. Do **not** treat Settings media as SC-001 or SC-002 evidence. Do **not** move Settings media into `shell-box/` or `computer-use/`.

**T029 layout stamp:** Filenames documented 2026-09-28. Product SC-003 Desktop Pass already filed under this directory (see [VERDICT.txt](./VERDICT.txt)).
