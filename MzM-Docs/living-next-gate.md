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

**P3 (Skills UX)** — **Done.** Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) Done (PO). Specs under `specs/003-skills-ux/`. Phase 3 product Verifier **Pass** merged as [#136](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/136) @ `337f25a964`.

**P4 (Routines — cron only)** — Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) **In Progress**. Specs under `specs/004-routines-cron/` on `master` (specify [#139](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/139); clarify [#140](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/140); MOH-189/MOH-190 Done). Plan on `cursor/p4-plan-3e3a` ([MOH-191](https://linear.app/momadhoun/issue/MOH-191/p4-spec-kit-plan-routines-cron) **In Progress**) — **rewritten to Architect Option 3** (Host Routine catalog SoT; not `dsh-schedule`).

## Next gate

**P4 Spec Kit — plan** (Architect-aligned) for Verifier gate. **MOH-191 stays In Progress** until Verifier Pass (PO hang).

| Issue | Title | Status | Owner |
|-------|-------|--------|-------|
| [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) | P4 — Routines (cron only) | In Progress | PO orchestration |
| [MOH-189](https://linear.app/momadhoun/issue/MOH-189/p4-spec-kit-specify-routines-cron) | P4 Spec Kit — specify | **Done** | — |
| [MOH-190](https://linear.app/momadhoun/issue/MOH-190/p4-spec-kit-clarify-routines-cron) | P4 Spec Kit — clarify | **Done** | — |
| [MOH-191](https://linear.app/momadhoun/issue/MOH-191/p4-spec-kit-plan-routines-cron) | P4 Spec Kit — plan | **In Progress** | DH Spec → Verifier |

Do **not** pre-open tasks/analyze/implement children — those follow after plan Verifier Pass.

### Plan deliverable (active — Architect Option 3)

- Feature dir: `specs/004-routines-cron/` (`plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)
- Branch: `cursor/p4-plan-3e3a`
- **Seam map:** Host-owned **Routine catalog** + Host **cron wake**; pane projects Host via HTTP/WS; **no** Electron Main routines bus; Desktop Host child topology unchanged
- **Not SoT:** `@deepseek-ai/dsh-schedule` (session reminders only; optional time-math reuse)
- **Optional:** `dsh-jobs` / `dsh-jobs-local` for in-flight fire visibility only
- Standing orders **11** + **12** retained (FR-010/FR-011)
- Mark MOH-191 Done only after Verifier Pass. **No** tasks until plan Pass.

## Owners / held

| Role | Action |
|------|--------|
| **PO Assistant** | MOH-191 In Progress; hand Verifier plan gate after Architect-aligned push; Done after Pass |
| **DH Spec** | Plan rewritten to Architect Option 3 on `cursor/p4-plan-3e3a`; report tip to PO |
| **DH Architect** | Option 3 locked on MOH-191; available for plan review |
| **DH Runtime / Electron** | Idle — no implement |
| **DH Verifier** | Gate plan PR (Architect-aligned artifacts) |
| **DH Lead** | Living gate; idle until Verifier Pass; no feature code |

## Blockers

None for plan content after Architect alignment. Waiting on Verifier Pass for MOH-191 (then PO Done + tasks kick).
