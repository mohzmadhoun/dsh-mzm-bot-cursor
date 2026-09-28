# Evidence — shell-box (Scenario 1 · SC-001)

**Recipe:** [../../scenario-1-shell-box.md](../../scenario-1-shell-box.md) (T019)
**Acceptance:** SC-001 · FR-002 · FR-011 · FR-013 · FR-014 · FR-015
**Linear:** [MOH-375](https://linear.app/momadhoun/issue/MOH-375) · [MOH-385](https://linear.app/momadhoun/issue/MOH-385/t029-evidence-dir-placeholders-so-1112-expectations) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · `P-MOH-2` only
**Quickstart:** [../../../quickstart.md](../../../quickstart.md) Scenario 1

FR-013/014 / standing orders **11** + **12** artifacts for local Shell/box tool success. Commit media here; embed absolute `/opt/cursor/artifacts/…` copies in GUI PR bodies.

## Required filenames (minimum)

| Artifact | Content | Owner recipe | Status |
|----------|---------|--------------|--------|
| `00-shell-box-not-ready.png` (optional but preferred) | Clear not-ready / starting / failed ≠ Pass (FR-002) | T019 | **measured** Desktop Pass |
| `01-shell-box-ready.png` | Backend **ready** before / at tool invoke | T019 | **measured** Desktop Pass |
| `02-shell-box-success.png` | User-visible successful local Shell/box tool outcome | T019 | **measured** Desktop Pass |
| `scenario-1-shell-box-walkthrough.mp4` (optional) | Short recording covering not-ready → ready → success | T019 | **measured** Desktop Pass |
| `VERDICT.txt` | SC-001 stamp | Verifier | **Pass** (see file) |

## Standing orders 11 + 12 (mandatory for GUI Pass)

| Order | FR | Rule |
|-------|-----|------|
| **SO 11** | FR-013 | Real Desktop app screenshots and/or short screen recording — unit/jsdom alone **fails** |
| **SO 12** | FR-014 | Media **committed** under this directory on the PR branch **and** embedded in the GUI PR body via `<img>` / `<video controls>` with absolute `/opt/cursor/artifacts/…` paths — Cursor agent artifact page links alone **fail** |

## SO11 mirror names

| Committed | `/opt/cursor/artifacts/` mirror |
|-----------|----------------------------------|
| `00-shell-box-not-ready.png` | `00-shell-box-not-ready.png` |
| `01-shell-box-ready.png` | `01-shell-box-ready.png` |
| `02-shell-box-success.png` | `02-shell-box-success.png` |
| `scenario-1-shell-box-walkthrough.mp4` | `scenario-1-shell-box-walkthrough.mp4` |

## Placeholder policy (T029)

This directory is the locked FR-014 evidence home for Scenario 1 / SC-001. Required filenames above satisfy SO 11+12. Do **not** move Shell/box media into `computer-use/`, `settings/`, or `non-goals/`. Do **not** delete committed media when re-stamping; replace only when re-capturing with distinct frames.

**T029 layout stamp:** Filenames documented 2026-09-28. Product SC-001 Desktop Pass already filed under this directory (see [VERDICT.txt](./VERDICT.txt)).
