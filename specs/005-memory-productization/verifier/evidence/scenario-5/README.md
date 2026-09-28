# Evidence — Scenario 5 (Full Phase 5 replay)

**Recipe:** [../../scenario-5-full-replay.md](../../scenario-5-full-replay.md) (T033 — Verifier owns; placeholder path only until recipe lands)
**Acceptance:** SC-007 · FR-011/012 (composite of Scenarios 1–4 + foundational stamp)
**Linear:** T032 [MOH-270](https://linear.app/momadhoun/issue/MOH-270) · T033 [MOH-271](https://linear.app/momadhoun/issue/MOH-271)
**Stamp:** see `VERDICT.txt` when composite replay is claimed

## Required filenames (FR-011/012 / SO 11+12)

| Artifact | Content | Notes |
|----------|---------|-------|
| `s1-01-profile-listed.png` (or pointer) | Scenario 1 write path | May reuse / link `../scenario-1/` when present |
| `s1-04-log-listed.png` · `s1-07-note-listed.png` | Scenario 1 log + note | Cite `../scenario-1/04-` / `07-` |
| `s2-01-post-restart-surface.png` … `s2-03-inject-path.png` (or pointer) | Scenario 2 | Prefer reuse from `../scenario-2/` |
| `s3-01` … `s3-04` layer frames (or pointer) | Scenario 3 | Prefer reuse from `../scenario-3/` |
| `scenario-5-walkthrough.mp4` / `.webm` | Optional single-session recording covering GUI steps | SO11/12 when captured |
| `replay-pointer.log` | Gate commands + SHA/UTC when composite replay ran | Required for stamp |
| `vitest-foundations.log` · `vitest-electron-bus.log` | T013 + T035 reruns | Supporting |
| `non-goals-spotcheck.log` | T031 / T036 / T037 absence output | Supporting |
| `VERDICT.txt` | Composite stamp (foundational + Scenarios + non-goals) | Required for Done claim |

Unit/jsdom alone **fails** the GUI half. Foundational Pass (T013) MUST be green before this stamp counts toward product Done.

## Placeholder policy

Created by T032. T033 (Verifier) owns the full-replay recipe body and stamp. Do **not** delete existing media under `scenario-1/`…`scenario-3/`. Scenario 5 MAY copy, symlink-document, or cite those paths in `VERDICT.txt` / `replay-pointer.log` rather than duplicating bytes. New composite-only artifacts (replay-pointer, non-goals spotcheck, VERDICT) live here.

## Reuse policy

Do **not** delete existing media under `scenario-1/`…`scenario-3/`. Scenario 5 MAY cite those paths rather than duplicating bytes.
