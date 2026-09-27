# Living next gate — MzM Bot

| Field | Value |
|-------|-------|
| **Updated** | 2026-09-27 |
| **Owner** | DH Lead |
| **Tracker** | DeepSeek Harness - Cursor (`P-MOH-2`) only |
| **Program plan** | [mzm-bot-plan.md](./mzm-bot-plan.md) |

## Status

**P1 (Wedge A)** — Done on `master` (epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui)). Specs remain under `specs/001-multi-model-bots`.

**Deferred (non-blocking):** SC-005 live Desktop full Phase 1 replay — recipe present; `specs/001-multi-model-bots/verifier/evidence/scenario-5/VERDICT.txt` = Deferred (`LIVE_DESKTOP: Skipped`). Does **not** block P3.

**P2 (Identity / personas)** — **Done.** Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) Done (PO). Specs under `specs/002-identity-personas/`. Phase 2 product Verifier **Pass** merged as [#104](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/104) @ `5ec5bb004e` (desktop visual stamps per standing order 11).

**P3 (Skills UX)** — Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) open (PO-owned; Lead did **not** create). Spec Kit loop not started until specify Pass.

## Next gate

**Current — P3 Skills UX Spec Kit specify.** Owner: **DH Spec**. Linear: [MOH-143](https://linear.app/momadhoun/issue/MOH-143/p3-spec-kit-specify-skills-ux). Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P3.

- **Authorize specify only** — no clarify/plan/tasks/implement until Verifier Pass on specify.
- **Do not invent FR detail** — Spec owns FRs/acceptance when specify runs; Lead/this doc carry plan In/Out/Exit only.
- **Do not rewrite** `specs/001-multi-model-bots` or `specs/002-identity-personas`; new `specs/003-…` tree.
- **Standing order 11** — GUI acceptance criteria from specify onward must require desktop screenshots/recordings (real Cloud Agent display), not unit/jsdom alone.
- Program In/Out/Exit (plan only; not FRs): load/discover + authoring; thin managed pack — **out** full managed catalog parity + learn-from-demonstration; exit = attach/run a skill on a bot with Verifier covering load + one authoring path.

## Phase 3 kickoff (specify authorized)

Mirror P2 [MOH-89](https://linear.app/momadhoun/issue/MOH-89/p2-lead-kickoff-phase-gate). Spec Kit **specify** only; no feature code; no FR invention.

1. **PO** — Confirmed P2 Verifier Pass + MOH-88 Done; opened epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) and specify [MOH-143](https://linear.app/momadhoun/issue/MOH-143/p3-spec-kit-specify-skills-ux). Lead does **not** create/duplicate epics.
2. **DH Lead** — This living gate; authorize Spec specify; report Status / Next gate / Owners to PO. No feature code.
3. **DH Spec** — `/speckit-specify` for P3 Skills UX only against plan §4 P3 In/Out/Exit; new `specs/003-…` tree; FRs from specify, not from this gate. GUI paths must call out desktop visual evidence (standing order 11).
4. **DH Verifier** — Gate specify delivery (Pass/Fail) before clarify.
5. **Held until after specify Pass** — clarify → plan → tasks → analyze → taskstoissues → implement (same Spec Kit order as P2); Architect / Runtime / Electron engage on seams when plan/tasks demand.

## Owners / held

| Role | Action |
|------|--------|
| **DH Spec** | **Go** — P3 specify ([MOH-143](https://linear.app/momadhoun/issue/MOH-143/p3-spec-kit-specify-skills-ux)); no FR invention beyond plan In/Out/Exit |
| **DH Verifier** | Gate specify PR Pass/Fail before clarify |
| **DH Lead** | This living gate + kickoff; no epic create; no feature code |
| **DH Architect / Runtime / Electron** | Held until plan/tasks demand; no P2 reopen |
| **PO Assistant** | Orchestration; Linear statuses; ship/no-ship on later P3 gates |

## Blockers

None for specify kickoff. P2 Verifier Pass + epic open satisfied. Next hard gate after specify draft: Verifier Pass on specify before clarify.
