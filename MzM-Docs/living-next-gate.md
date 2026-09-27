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
- Clarify Done ([MOH-92](https://linear.app/momadhoun/issue/MOH-92/p2-spec-kit-clarify-identity-personas) / PR #68 @ `86aebfadb3`; Verifier [MOH-93](https://linear.app/momadhoun/issue/MOH-93/p2-verifier-gate-clarify-002-identity-personas) Pass).
- Lead **authorizes Spec Kit plan**.

## Next gate

**DH Spec** runs Spec Kit **`plan` only** for P2 ([MOH-94](https://linear.app/momadhoun/issue/MOH-94/p2-spec-kit-plan-identity-personas)).

- Artifacts under existing `specs/002-identity-personas/` (plan.md, research.md, data-model.md, etc. — Spec owns that tree).
- Branch: `cursor/p2-plan-92fa` (from latest `master`).
- **After plan draft + Verifier Pass** ([MOH-95](https://linear.app/momadhoun/issue/MOH-95/p2-verifier-gate-plan-002-identity-personas)): next Spec Kit gate is **tasks**.
- MOH-95 stays Todo until draft plan PR exists.

## Owners / held

| Role | Action |
|------|--------|
| **DH Spec** | Authorized → run plan (MOH-94) |
| **DH Verifier** | Plan gate MOH-95 Todo until draft PR; then Pass/Fail |
| **DH Architect** | Held until plan lands |
| **DH Electron / Runtime** | Held until Spec + Architect gates for P2 |
| **PO Assistant** | Orchestration; no feature code |

## Blockers

None for P2 plan.
