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

**P4 (Routines — cron only)** — Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) **In Progress**. Specs under `specs/004-routines-cron/` on `master` (specify [#139](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/139); clarify [#140](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/140); plan [#141](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/141) Architect Option 3; MOH-189…MOH-191 Done). Tasks in flight on `cursor/p4-tasks-3e3a` ([MOH-192](https://linear.app/momadhoun/issue/MOH-192/p4-spec-kit-tasks-routines-cron)).

## Next gate

**P4 Spec Kit — tasks** draft for Verifier gate (no analyze/implement; Linear Done after Pass — PO hang).

| Issue | Title | Status | Owner |
|-------|-------|--------|-------|
| [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) | P4 — Routines (cron only) | In Progress | PO orchestration |
| [MOH-189](https://linear.app/momadhoun/issue/MOH-189)…[MOH-191](https://linear.app/momadhoun/issue/MOH-191) | specify / clarify / plan | **Done** | — |
| [MOH-192](https://linear.app/momadhoun/issue/MOH-192/p4-spec-kit-tasks-routines-cron) | P4 Spec Kit — tasks | In Progress | **DH Spec** → Verifier |

Do **not** pre-open analyze/implement children — those follow after tasks Verifier Pass.

### Tasks deliverable (active)

- Feature dir: `specs/004-routines-cron/tasks.md` (T001–T034)
- Branch: `cursor/p4-tasks-3e3a` (off `master` tip including #141)
- Honors Architect Option 3: Host Routine catalog SoT; NOT `dsh-schedule` as Routines SoT; optional `dsh-jobs` visibility; no Electron bus (T011); schedule≠Routines absence (T012); SO 11+12 evidence tasks (T018/T021/T024/T028/T030/T031)
- Mark [MOH-192](https://linear.app/momadhoun/issue/MOH-192/p4-spec-kit-tasks-routines-cron) Done only after Verifier Pass. **No** analyze/implement until tasks Pass.

## Owners / held

| Role | Action |
|------|--------|
| **PO Assistant** | MOH-192 open; hand Verifier tasks gate; Done after Pass |
| **DH Spec** | MOH-192 tasks draft on `cursor/p4-tasks-3e3a`; report to PO; idle until analyze kick |
| **DH Architect** | Option 3 locked; idle unless tasks review asked |
| **DH Runtime / Electron** | Idle — no implement until after analyze/`taskstoissues` |
| **DH Verifier** | Gate tasks PR (`tasks.md` vs Architect Option 3 + SO11/12) |
| **DH Lead** | Living gate; idle until Verifier Pass; no feature code |

## Blockers

None for tasks content. Waiting on Verifier Pass for MOH-192 (then PO Done + analyze/`taskstoissues` kick).
