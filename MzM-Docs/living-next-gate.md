# Living next gate — MzM Bot

| Field | Value |
|-------|-------|
| **Updated** | 2026-09-27 |
| **Owner** | DH Lead |
| **Tracker** | DeepSeek Harness - Cursor (`P-MOH-2`) only |
| **Program plan** | [mzm-bot-plan.md](./mzm-bot-plan.md) |

## Status

**P1 (Wedge A)** — Done on `master` (epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui)). Specs remain under `specs/001-multi-model-bots`.

**Deferred (non-blocking):** SC-005 live Desktop full Phase 1 replay — recipe present; `specs/001-multi-model-bots/verifier/evidence/scenario-5/VERDICT.txt` = Deferred (`LIVE_DESKTOP: Skipped`). Does **not** block P2 Spec Kit.

**P2 (Identity / personas)** — Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) In Progress.

- Specify Done ([MOH-90](https://linear.app/momadhoun/issue/MOH-90/p2-spec-kit-specify-identity-personas) / PR #67).
- Clarify Done ([MOH-92](https://linear.app/momadhoun/issue/MOH-92/p2-spec-kit-clarify-identity-personas) / PR #68; Verifier [MOH-93](https://linear.app/momadhoun/issue/MOH-93/p2-verifier-gate-clarify-002-identity-personas) Pass).
- Plan Done ([MOH-94](https://linear.app/momadhoun/issue/MOH-94/p2-spec-kit-plan-identity-personas) / PR #70; Verifier [MOH-95](https://linear.app/momadhoun/issue/MOH-95/p2-verifier-gate-plan-002-identity-personas) Pass).
- Tasks Done ([MOH-96](https://linear.app/momadhoun/issue/MOH-96/p2-spec-kit-tasks-identity-personas) / PR #72 @ `837152b248`; Verifier [MOH-97](https://linear.app/momadhoun/issue/MOH-97/p2-verifier-gate-tasks-002-identity-personas) Pass).

## Next gate

**DH Spec** runs Spec Kit **`analyze` + `taskstoissues`** for P2 ([MOH-98](https://linear.app/momadhoun/issue/MOH-98/p2-spec-kit-analyze-taskstoissues)).

- Spec owns `specs/002-identity-personas/` (analyze artifacts / Linear issue set under epic MOH-88).
- Spec branch: `cursor/p2-analyze-92fa` (from latest `master`).
- **After analyze + taskstoissues + Verifier Pass** ([MOH-99](https://linear.app/momadhoun/issue/MOH-99/p2-verifier-gate-analyze-taskstoissues)): next is **implement fan-out** (Architect seam map → Electron/Runtime slices).
- MOH-99 stays Todo until Spec delivers analyzable output (repo PR and/or Linear issue set).

## Owners / held

| Role | Action |
|------|--------|
| **DH Spec** | In Progress → analyze + taskstoissues (MOH-98); Spec owns analyze branch |
| **DH Verifier** | Analyze gate MOH-99 Todo until Spec output; then Pass/Fail |
| **DH Architect** | Held until analyze + Verifier Pass, then seam map for implement |
| **DH Electron / Runtime** | Held until Spec + Architect gates for P2 implement |
| **PO Assistant** | Orchestration; no feature code |

## Blockers

None for P2 analyze + taskstoissues. Spec already spawned in parallel on MOH-98.
