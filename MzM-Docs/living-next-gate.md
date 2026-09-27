# Living next gate — MzM Bot

| Field | Value |
|-------|-------|
| **Updated** | 2026-09-27 |
| **Owner** | DH Lead |
| **Tracker** | DeepSeek Harness - Cursor (`P-MOH-2`) only |
| **Program plan** | [mzm-bot-plan.md](./mzm-bot-plan.md) |

## Status

**P1 (Wedge A)** — Done on `master` (epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui)). Specs remain under `specs/001-multi-model-bots`.

**Deferred (non-blocking):** SC-005 live Desktop full Phase 1 replay — recipe present; `specs/001-multi-model-bots/verifier/evidence/scenario-5/VERDICT.txt` = Deferred (`LIVE_DESKTOP: Skipped`). Does **not** block P2 Spec Kit specify.

**P2 (Identity / personas)** — Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) In Progress. Lead kickoff ([MOH-89](https://linear.app/momadhoun/issue/MOH-89/p2-lead-kickoff-phase-gate)) complete.

## Next gate

**DH Spec** runs Spec Kit **`specify` only** for P2 ([MOH-90](https://linear.app/momadhoun/issue/MOH-90/p2-spec-kit-specify-identity-personas)).

- **New** feature directory under `specs/` (suggested: `002-identity-personas`).
- **Do not** rewrite or overwrite `specs/001-multi-model-bots`.
- **In:** job/voice/anti-jobs; rename/avatar; sidebar sections; delete-confirm; ADR-only agent vs user memory layers (no memory UX).
- **Out:** memory productization (P5); skills library (P3).
- Branch from `master`: `cursor/p2-specify-<suffix>`.

## Owners / held

| Role | Action |
|------|--------|
| **DH Spec** | Authorize → run specify (MOH-90) |
| **DH Architect** | Held until specify lands |
| **DH Electron / Runtime** | Held until Spec + Architect gates for P2 |
| **DH Verifier** | Gates Done each P2 slice; SC-005 live replay remains optional follow-up on P1 |
| **PO Assistant** | Orchestration; no feature code |

## Blockers

None for P2 specify.
