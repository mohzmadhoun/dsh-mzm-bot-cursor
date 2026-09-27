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

**P4 (Routines — cron only)** — Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) **In Progress**. Specs under `specs/004-routines-cron/` on `master` (specify Pass [#139](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/139); MOH-189 Done). Clarify in flight on `cursor/p4-clarify-3e3a` ([MOH-190](https://linear.app/momadhoun/issue/MOH-190/p4-spec-kit-clarify-routines-cron)).

## Next gate

**P4 Spec Kit — clarify** draft for Verifier gate (no plan/implement; Linear Done after Pass — PO hang).

| Issue | Title | Status | Owner |
|-------|-------|--------|-------|
| [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) | P4 — Routines (cron only) | In Progress | PO orchestration |
| [MOH-189](https://linear.app/momadhoun/issue/MOH-189/p4-spec-kit-specify-routines-cron) | P4 Spec Kit — specify (Routines cron) | **Done** | — |
| [MOH-190](https://linear.app/momadhoun/issue/MOH-190/p4-spec-kit-clarify-routines-cron) | P4 Spec Kit — clarify (Routines cron) | In Progress | **DH Spec** → Verifier |

Do **not** pre-open plan/tasks/analyze or implement children — those follow after clarify Verifier Pass (same hang as P2/P3).

### Clarify deliverable (active)

- Feature dir: `specs/004-routines-cron/` (`spec.md` Status Clarified + checklist)
- Branch: `cursor/p4-clarify-3e3a` (off `master` tip including #139)
- Five locks: fire = Host wake + last-run (no LLM wording); Verifier ≤6 min / no sub-5m test schedule; confirm optional; edit optional; identity MAY derive from intent.
- Standing orders **11** + **12** retained (FR-010/FR-011).
- Mark [MOH-190](https://linear.app/momadhoun/issue/MOH-190/p4-spec-kit-clarify-routines-cron) Done only after Verifier Pass (PO/Lead hang). **No** plan until clarify Pass.

## Owners / held

| Role | Action |
|------|--------|
| **PO Assistant** | MOH-190 open; hand Verifier clarify gate; Done after Pass |
| **DH Spec** | MOH-190 clarify draft on `cursor/p4-clarify-3e3a`; report to PO; idle until plan kick |
| **DH Architect** | Idle until plan (seam map for Host jobs/schedule + pane) |
| **DH Runtime / Electron** | Idle — no implement |
| **DH Verifier** | Gate clarify PR (`specs/004-routines-cron`); SO 11+12 still in FR-010/FR-011 |
| **DH Lead** | Living gate; idle until Verifier Pass; no feature code |

## Blockers

None for clarify content. Waiting on Verifier Pass for MOH-190 (then PO Done + plan kick).
