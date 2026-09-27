# Evidence — Scenario 5 (Full Phase 3 replay)

**Recipe:** [../../scenario-5-full-replay.md](../../scenario-5-full-replay.md)
**Acceptance:** SC-005 · FR-012 (composite of Scenarios 1–3)
**Linear:** T035 [MOH-182](https://linear.app/momadhoun/issue/MOH-182) · T036 [MOH-183](https://linear.app/momadhoun/issue/MOH-183)
**Stamp:** see [VERDICT.txt](./VERDICT.txt) — **Pass** @ tip `c2a23b3321` (#135 on master)

## Required filenames (FR-012)

| Artifact | Content |
|----------|---------|
| `s1-01-discovery-thin-pack.png` … `s1-03-leave-return.png` | Scenario 1 discover / load / leave-return |
| `s2-01-attach-bot-a.png` … `s2-03-run-active.png` | Scenario 2 attach / isolation / run-active |
| `s3-01-reject-empty.png` (+ `01b`/`01c`) · `s3-02` · `s3-03` | Scenario 3 reject empty + author + discovery |
| `s4-01-discovery-managed-count.png` | Scenario 4 thin-pack managedCount===1 |
| `scenario-5-walkthrough.mp4` | Single-session recording covering Scenarios 1–3 (+4 frame) |
| `replay-pointer.log` | Gate commands + SHA/UTC when composite replay ran |
| `step-metrics.json` · `cdp-run.log` | CDP DOM assertions + driver stdout |
| `vitest-foundations.log` · `vitest-attachSkill.log` · `vitest-sc007-wiring.log` | T014 + SC-007 Host wiring |
| `non-goals-spotcheck.log` · `05-instruction-assembly.txt` | T033/T038 + SC-007 note |
| `VERDICT.txt` | Composite stamp (foundational Pass + Scenarios 1–3 + non-goals) |

Unit/jsdom alone **fails** the GUI half. Foundational Pass (T014) MUST be green before this stamp counts toward product Done.
