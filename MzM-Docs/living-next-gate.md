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

**P4 (Routines — cron only)** — Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) **In Progress**. Spec Kit tree `specs/004-routines-cron` on branch `cursor/p4-specify-3e3a` (specify draft; not on `master` until Verifier Pass + merge).

## Next gate

**P4 Spec Kit — specify** draft landed for Verifier gate (no implement; Linear Done after Pass — PO hang).

| Issue | Title | Status | Owner |
|-------|-------|--------|-------|
| [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) | P4 — Routines (cron only) | In Progress | PO orchestration |
| [MOH-189](https://linear.app/momadhoun/issue/MOH-189/p4-spec-kit-specify-routines-cron) | P4 Spec Kit — specify (Routines cron) | In Progress | **DH Spec** → Verifier |

Do **not** pre-open clarify/plan/tasks/analyze or implement children — those follow after specify Verifier Pass (same hang as P2/P3).

### Spec deliverable (active)

- Feature dir: `specs/004-routines-cron/` (`spec.md` + `checklists/requirements.md`)
- Branch: `cursor/p4-specify-3e3a` (off `master` tip including #136 / #137)
- Scope: create/pause/resume + pane list; Host jobs; cron only. Out: P6 events, P5 memory, Box/Shell, MCP.
- Acceptance encodes standing orders **11** (desktop visual) + **12** (commit under `verifier/evidence/` + PR embeds).
- Mark [MOH-189](https://linear.app/momadhoun/issue/MOH-189/p4-spec-kit-specify-routines-cron) Done only after Verifier Pass (PO/Lead hang). **No** clarify until specify Pass.

## Owners / held

| Role | Action |
|------|--------|
| **PO Assistant** | Epic MOH-188 + specify MOH-189 open; hand Verifier specify gate; Done after Pass |
| **DH Spec** | MOH-189 specify draft on `cursor/p4-specify-3e3a`; report to PO; idle until clarify kick |
| **DH Architect** | Idle until plan (seam map for Host jobs/schedule + pane) |
| **DH Runtime / Electron** | Idle — no implement |
| **DH Verifier** | Gate specify PR (`specs/004-routines-cron`); standing orders 11+12 encoded in FR-010/FR-011 |
| **DH Lead** | Living gate; idle until Verifier Pass; no feature code |

## Blockers

None for specify content. Waiting on Verifier Pass for MOH-189 (then PO Done + clarify kick).
