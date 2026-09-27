# Evidence — Scenario 5 (Full Phase 4 replay)

**Recipe:** [../../scenario-5-full-replay.md](../../scenario-5-full-replay.md)
**Acceptance:** SC-005 · FR-010/011 (composite of Scenarios 1–3 + non-goals + foundational stamp)
**Linear:** T030 [MOH-223](https://linear.app/momadhoun/issue/MOH-223) · T031 [MOH-224](https://linear.app/momadhoun/issue/MOH-224)
**Stamp:** see [VERDICT.txt](./VERDICT.txt) when composite replay is claimed

## Required filenames (FR-010/011 / SO 11+12)

| Artifact | Content | Notes |
|----------|---------|-------|
| `s1-01-create-listed-active.png` (or pointer) | Scenario 1 create path | May reuse / link `../scenario-1/` when present |
| `s1-02-reject-empty-or-invalid.png` | Scenario 1 reject | Cite `../scenario-1/02-` — **Present** |
| `s1-03-bot-b-isolation.png` | Scenario 1 per-bot | Cite `../scenario-1/03-` — **Present** |
| `s1-04-pane-listed-fields.png` · `s1-05-pane-after-leave-return.png` | US2 pane durability | Prefer reuse from `../scenario-1/04-` / `05-` |
| `s2-01` … `s2-06` pause/resume frames (or pointer) | Scenario 2 | Prefer reuse from `../scenario-2/` |
| `s3-01` … `s3-04` fire / last-run frames (or pointer) | Scenario 3 | Prefer reuse from `../scenario-3/` |
| `scenario-5-walkthrough.mp4` / `.webm` | Optional single-session recording covering GUI steps | SO11/12 when captured |
| `replay-pointer.log` | Gate commands + SHA/UTC when composite replay ran | Required for stamp |
| `vitest-foundations.log` · `vitest-electron-bus.log` | T014 + T033 reruns | Supporting |
| `non-goals-spotcheck.log` | T029 / T034 absence output | Supporting |
| `VERDICT.txt` | Composite stamp (foundational + Scenarios + non-goals) | Required for Done claim |

Unit/jsdom alone **fails** the GUI half. Foundational Pass (T014) MUST be green before this stamp counts toward product Done.

## Reuse policy

Do **not** delete existing media under `scenario-1/`…`scenario-3/`. Scenario 5 MAY copy, symlink-document, or cite those paths in `VERDICT.txt` / `replay-pointer.log` rather than duplicating bytes. New composite-only artifacts (replay-pointer, non-goals spotcheck, VERDICT) live here.
