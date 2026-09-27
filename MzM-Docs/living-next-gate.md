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

- Spec Kit **design closed** (specify → clarify → plan → tasks → analyze):
  - Specify Done ([MOH-90](https://linear.app/momadhoun/issue/MOH-90/p2-spec-kit-specify-identity-personas) / PR #67).
  - Clarify Done ([MOH-92](https://linear.app/momadhoun/issue/MOH-92/p2-spec-kit-clarify-identity-personas) / PR #68; Verifier [MOH-93](https://linear.app/momadhoun/issue/MOH-93/p2-verifier-gate-clarify-002-identity-personas) Pass).
  - Plan Done ([MOH-94](https://linear.app/momadhoun/issue/MOH-94/p2-spec-kit-plan-identity-personas) / PR #70; Verifier [MOH-95](https://linear.app/momadhoun/issue/MOH-95/p2-verifier-gate-plan-002-identity-personas) Pass).
  - Tasks Done ([MOH-96](https://linear.app/momadhoun/issue/MOH-96/p2-spec-kit-tasks-identity-personas) / PR #72 @ `837152b248`; Verifier [MOH-97](https://linear.app/momadhoun/issue/MOH-97/p2-verifier-gate-tasks-002-identity-personas) Pass).
  - Analyze + taskstoissues Done ([MOH-98](https://linear.app/momadhoun/issue/MOH-98/p2-spec-kit-analyze-taskstoissues) / PR #73 @ `97e62765a3`; Verifier [MOH-99](https://linear.app/momadhoun/issue/MOH-99/p2-verifier-gate-analyze-taskstoissues) Pass). Issues [MOH-100](https://linear.app/momadhoun/issue/MOH-100)…[MOH-141](https://linear.app/momadhoun/issue/MOH-141) under epic MOH-88.

## Next gate

**Implement — Setup (T001–T004) in flight** (parallel; no US fan-out yet).

| Task | Issue | Owner |
|------|-------|-------|
| T001 Confirm design tree | [MOH-100](https://linear.app/momadhoun/issue/MOH-100) | **DH Spec** |
| T002 Inventory Host bot-identity | [MOH-101](https://linear.app/momadhoun/issue/MOH-101) | **DH Runtime** |
| T003 Inventory instruction-bind | [MOH-102](https://linear.app/momadhoun/issue/MOH-102) | **DH Runtime** |
| T004 Verifier recipe README | [MOH-103](https://linear.app/momadhoun/issue/MOH-103) | **DH Verifier** |

- Spec / Verifier may touch `specs/002-identity-personas/` for their Setup slices only; Lead does **not** edit that tree.
- **After Setup Done:** foundations **T005–T012** ([MOH-104](https://linear.app/momadhoun/issue/MOH-104)…) — **blocking** before any US1–US5 product fan-out (`tasks.md` Phase 2).
- After foundations checkpoint: US fan-out (US1 → US2 → US4 → US3 → US5) + Architect seams as needed for story slices.

## Owners / held

| Role | Action |
|------|--------|
| **DH Spec** | Setup T001 (MOH-100) in flight |
| **DH Runtime** | Setup T002+T003 (MOH-101, MOH-102) in flight |
| **DH Verifier** | Setup T004 (MOH-103) in flight |
| **DH Architect** | Held for Setup; engage on foundations / story seams after T001–T004 |
| **DH Electron** | Held until foundations + Client/UI story slices need shell work |
| **DH Lead** | Living gate / plan §10 only (this branch); no `specs/002` edits |
| **PO Assistant** | Orchestration; no feature code |

## Blockers

None for Setup T001–T004 parallel fan-out. Foundations T005–T012 remain the hard gate before US product work.
