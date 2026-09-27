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

**P4 (Routines — cron only)** — Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) **In Progress**. Specs under `specs/004-routines-cron/` on `master` (specify [#139](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/139); clarify [#140](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/140); plan [#141](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/141) Architect Option 3; tasks [#142](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/142); MOH-189…MOH-192 Done). Analyze + taskstoissues in flight on `cursor/p4-analyze-fe1d` ([MOH-193](https://linear.app/momadhoun/issue/MOH-193/p4-spec-kit-analyze-taskstoissues-routines-cron)).

## Next gate

**P4 Spec Kit — analyze + taskstoissues** draft for Verifier gate (no implement; Linear Done after Pass — PO hang).

| Issue | Title | Status | Owner |
|-------|-------|--------|-------|
| [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) | P4 — Routines (cron only) | In Progress | PO orchestration |
| [MOH-189](https://linear.app/momadhoun/issue/MOH-189)…[MOH-192](https://linear.app/momadhoun/issue/MOH-192) | specify / clarify / plan / tasks | **Done** | — |
| [MOH-193](https://linear.app/momadhoun/issue/MOH-193/p4-spec-kit-analyze-taskstoissues-routines-cron) | P4 Spec Kit — analyze + taskstoissues | In Progress | **DH Spec** → Verifier |
| [MOH-194](https://linear.app/momadhoun/issue/MOH-194)…[MOH-227](https://linear.app/momadhoun/issue/MOH-227) | T001–T034 implement children | Backlog | — (after analyze Pass) |

Do **not** kick implement until analyze Verifier Pass + PO Done on MOH-193.

### Analyze deliverable (active)

- Feature dir: `specs/004-routines-cron/analyze-report.md` (**PASS**, 0 CRITICAL) + T→MOH map
- Linear children: T001–T034 → MOH-194…MOH-227 under epic MOH-188 on **DeepSeek Harness - Cursor** only
- Branch: `cursor/p4-analyze-fe1d` (off `master` tip including #142)
- Honors Architect Option 3 + SO 11/12 evidence tasks
- Mark [MOH-193](https://linear.app/momadhoun/issue/MOH-193/p4-spec-kit-analyze-taskstoissues-routines-cron) Done only after Verifier Pass. **No** implement until analyze Pass.

## Owners / held

| Role | Action |
|------|--------|
| **PO Assistant** | MOH-193 open; hand Verifier analyze gate; Done after Pass → Lead implement kick |
| **DH Spec** | MOH-193 analyze + taskstoissues on `cursor/p4-analyze-fe1d`; report to PO; leave In Progress |
| **DH Architect** | Option 3 locked; idle unless analyze review asked |
| **DH Runtime / Electron** | Idle — no implement until after analyze Pass |
| **DH Verifier** | Gate analyze PR (`analyze-report.md` + Linear T001–T034 map) |
| **DH Lead** | Living gate; idle until Verifier Pass; no feature code |

## Blockers

None for analyze content. Waiting on Verifier Pass for MOH-193 (then PO Done + implement kick).
