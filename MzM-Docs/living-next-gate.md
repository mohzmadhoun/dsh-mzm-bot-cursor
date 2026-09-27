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
- Plan **draft** ([MOH-94](https://linear.app/momadhoun/issue/MOH-94/p2-spec-kit-plan-identity-personas) In Progress / draft PR #70 tip `c0b024d4d4` on `cursor/p2-plan-92fa`). Spec Kit plan artifacts shipped; do not edit `specs/002-identity-personas/` from Lead.
- Verifier plan gate ([MOH-95](https://linear.app/momadhoun/issue/MOH-95/p2-verifier-gate-plan-002-identity-personas)) **In Progress** (parallel; reading PR #70).

## Next gate

**DH Verifier** finishes MOH-95 Pass/Fail on draft PR #70.

- **After Verifier Pass:** PO merges #70 → Spec Kit **tasks** (new issue when authorized; no duplicates).
- MOH-94 stays In Progress until Verifier/PO merge.

## Owners / held

| Role | Action |
|------|--------|
| **DH Verifier** | MOH-95 In Progress — Pass/Fail plan draft #70 |
| **DH Spec** | Hold until Pass + merge; then tasks |
| **DH Architect** | Held until plan lands on master |
| **DH Electron / Runtime** | Held until Spec + Architect gates for P2 |
| **PO Assistant** | After Pass: merge #70 → authorize tasks; no feature code |
| **DH Lead** | Living gate; no feature code; no `specs/002` edits |

## Blockers

None — waiting on Verifier MOH-95 only.
