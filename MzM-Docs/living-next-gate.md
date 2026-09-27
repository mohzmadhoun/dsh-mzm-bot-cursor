# Living next gate — MzM Bot

| Field | Value |
|-------|-------|
| **Updated** | 2026-09-27 |
| **Owner** | DH Lead |
| **Tracker** | DeepSeek Harness - Cursor (`P-MOH-2`) only |
| **Program plan** | [mzm-bot-plan.md](./mzm-bot-plan.md) |

## Status

**P1 (Wedge A)** — Done on `master` (epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui)). Specs under `specs/001-multi-model-bots`.

**Deferred (non-blocking):** SC-005 live Desktop full Phase 1 replay — recipe present; `specs/001-multi-model-bots/verifier/evidence/scenario-5/VERDICT.txt` = Deferred (`LIVE_DESKTOP: Skipped`). Does **not** block P4.

**P2 (Identity / personas)** — **Done.** Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) Done. Specs under `specs/002-identity-personas/`. Phase 2 product Verifier Pass merged as [#104](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/104).

**P3 (Skills UX)** — **Done.** Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) Done (PO). Specs under `specs/003-skills-ux/`. Phase 3 product Verifier **Pass** merged as [#136](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/136) @ `337f25a964` (SC-005 full replay; US1–US4 + polish + SC-001…SC-005 stamped; desktop visual evidence per standing order 11).

**P4 (Routines — cron only)** — Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) **In Progress**. Spec Kit tree `specs/004-…` not on `master` yet (specify in flight).

## Next gate

**P4 Spec Kit — specify** in flight (no implement).

| Issue | Title | Status | Owner |
|-------|-------|--------|-------|
| [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) | P4 — Routines (cron only) | In Progress | PO orchestration |
| [MOH-189](https://linear.app/momadhoun/issue/MOH-189/p4-spec-kit-specify-routines-cron) | P4 Spec Kit — specify (Routines cron) | In Progress | **DH Spec** |

Do **not** pre-open clarify/plan/tasks/analyze or implement children — those follow after specify Verifier Pass (same hang as P2/P3).

### Spec instruct (active)

**@DH Spec** — own specify for P4 only ([MOH-189](https://linear.app/momadhoun/issue/MOH-189/p4-spec-kit-specify-routines-cron)):

1. Branch off current `master` (tip includes #136 / #137).
2. `/speckit-specify` for program P4 Routines (cron only); feature dir `specs/004-routines-cron` (or Spec Kit’s sequential name if it differs — keep `004` + routines/cron in the slug).
3. Pull In/Out/Exit from `MzM-Docs/mzm-bot-plan.md` §4 P4; inventory detail in `MzM-Docs/mzm-bot-initial-plan.md` §5 **cron only** (ignore event-trigger tables for this feature).
4. Seam hints for later plan (do not expand scope): Host `dsh-jobs` / `dsh-schedule` ownership; no Electron parallel routines bus; pane projects Host state.
5. Encode desktop-visual Verifier requirements in acceptance now.
6. Open specify PR; mark Linear specify Done only after Verifier Pass (PO/Lead hang).
7. Report artifacts + open questions back to Lead/PO — **no** clarify until specify Pass.

## Owners / held

| Role | Action |
|------|--------|
| **PO Assistant** | Epic MOH-188 + specify MOH-189 open; Spec kicked |
| **DH Spec** | MOH-189 specify in flight; new `specs/004-…`; no rewrite of 001–003 |
| **DH Architect** | Idle until plan (seam map for Host jobs/schedule + pane) |
| **DH Runtime / Electron** | Idle — no implement |
| **DH Verifier** | Gate specify PR when Spec lands; standing order 11 for future GUI recipes |
| **DH Lead** | Living ids stamped; idle until specify PR / Verifier gate; no feature code |

## Blockers

None for specify. Waiting on DH Spec PR for MOH-189.
