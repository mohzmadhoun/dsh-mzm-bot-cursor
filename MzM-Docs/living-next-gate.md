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

**P4 (Routines — cron only)** — **Next.** Epic + specify issues **not yet opened** in Linear (PO creates on DeepSeek Harness - Cursor only). Spec Kit tree `specs/004-…` does not exist yet.

## Next gate

**P4 Spec Kit — specify** (smallest start; no implement).

### PO — open these on `DeepSeek Harness - Cursor` only

| # | Title | Type | Parent | Owner after open |
|---|-------|------|--------|------------------|
| 1 | `P4 — Routines (cron only)` | Epic | — | Product owner assistant (orchestration) |
| 2 | `P4 Spec Kit — specify (Routines cron)` | Issue | epic above | **DH Spec** |

Paste created ids back into this doc / kick Spec. Do **not** pre-open clarify/plan/tasks/analyze or implement children — those follow after specify Verifier Pass (same hang as P2/P3).

### Epic body (paste)

```markdown
## Phase epic (program plan P4)

**Goal:** Create/pause/resume cron routines + pane list; Host jobs; **no** event listeners.

**Out:** Slack/GitHub/email/etc triggers (P6); recall UX (P5); Box/Shell (P7).

**Exit (Verifier-provable):** Cron routine fires and is visible in pane; pause/resume verified; desktop visual evidence for GUI paths.

**Delivery:** Spec Kit `specify → clarify → plan → tasks → analyze → implement`. Issues from `taskstoissues`.

**Predecessor:** P3 epic MOH-142 Done (Skills UX Verifier Pass — PR #136).

**Orchestration:** Product owner assistant; spawn dh-* only. No feature code from PO.

Refs: `MzM-Docs/mzm-bot-plan.md` §4 P4 · room freeze: P4 cron before P6 events
```

### Specify issue body (paste)

```markdown
## Context

Parent epic: P4 — Routines (cron only) (link after create)
Report completion/blockers to PO / DH Lead.

## Do

1. Read `.cursor/agents/dh-spec.md` and `MzM-Docs/mzm-bot-plan.md` §4 P4 (Routines cron only).
2. Run Spec Kit **specify** only → new `specs/004-…` tree (suggested slug `004-routines-cron`).
3. Scope lock from plan: create/pause/resume + pane list; Host jobs; cron triggers only.
4. Explicit **Out:** event listeners (P6); memory recall UX (P5); Box/Shell; MCP/connectors.
5. GUI acceptance / Verifier recipes MUST require real Desktop screenshots and/or recordings committed under `verifier/evidence/` + PR embeds (standing order 11).
6. Do **not** rewrite `specs/001`, `002`, or `003`.
7. Do **not** implement product code; stop at specify PR for Verifier gate.

## Done when

- `specs/004-…/spec.md` (and Spec Kit companions) on a PR
- Acceptance criteria Verifier-ready for cron fire + pane visibility + pause/resume
- Lead/PO can hand Verifier the specify gate
```

### Spec instruct (start after Linear ids exist)

**@DH Spec** — own specify for P4 only:

1. Branch off current `master` (tip includes #136).
2. `/speckit-specify` for program P4 Routines (cron only); feature dir `specs/004-routines-cron` (or Spec Kit’s sequential name if it differs — keep `004` + routines/cron in the slug).
3. Pull In/Out/Exit from `MzM-Docs/mzm-bot-plan.md` §4 P4; inventory detail in `MzM-Docs/mzm-bot-initial-plan.md` §5 **cron only** (ignore event-trigger tables for this feature).
4. Seam hints for later plan (do not expand scope): Host `dsh-jobs` / `dsh-schedule` ownership; no Electron parallel routines bus; pane projects Host state.
5. Encode desktop-visual Verifier requirements in acceptance now.
6. Open specify PR; mark Linear specify Done only after Verifier Pass (PO/Lead hang).
7. Report artifacts + open questions back to Lead/PO — **no** clarify until specify Pass.

## Owners / held

| Role | Action |
|------|--------|
| **PO Assistant** | Create epic + specify issue on DeepSeek Harness - Cursor; paste ids; kick Spec |
| **DH Spec** | Specify only after Linear kick; new `specs/004-…`; no rewrite of 001–003 |
| **DH Architect** | Idle until plan (seam map for Host jobs/schedule + pane) |
| **DH Runtime / Electron** | Idle — no implement |
| **DH Verifier** | Gate specify PR when Spec lands; standing order 11 for future GUI recipes |
| **DH Lead** | This living gate; no feature code; no epic Done until P4 product Verifier Pass |

## Blockers

**Soft:** Linear epic + specify issue not yet created (PO). Spec Kit specify blocked on that kick only — program plan already authorizes P4.
