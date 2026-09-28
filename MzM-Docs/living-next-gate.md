# Living next gate — MzM Bot

| Field | Value |
|-------|-------|
| **Updated** | 2026-09-28 |
| **Owner** | DH Lead |
| **Tracker** | DeepSeek Harness - Cursor (`P-MOH-2`) only |
| **Program plan** | [mzm-bot-plan.md](./mzm-bot-plan.md) |

## Status

**P1 (Wedge A)** — Done on `master` (epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui)). Specs under `specs/001-multi-model-bots`.

**Deferred (non-blocking):** SC-005 live Desktop full Phase 1 replay — recipe present; `specs/001-multi-model-bots/verifier/evidence/scenario-5/VERDICT.txt` = Deferred (`LIVE_DESKTOP: Skipped`). Does **not** block P5.

**P2 (Identity / personas)** — **Done.** Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) Done. Specs under `specs/002-identity-personas/`. Phase 2 product Verifier Pass merged as [#104](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/104). Memory layers ADR only (no product UX): [adr/agent-vs-user-memory-layers.md](./adr/agent-vs-user-memory-layers.md).

**P3 (Skills UX)** — **Done.** Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) Done (PO). Specs under `specs/003-skills-ux/`. Phase 3 product Verifier **Pass** merged as [#136](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/136) @ `337f25a964`.

**P4 (Routines — cron only)** — **Done.** Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) Done. Specs under `specs/004-routines-cron/`. SC-001…SC-005 Pass; product close merged as [#166](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/166) @ `aca0c2b7c5` (optional T026 canceled).

**P5 (Memory productization)** — Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization) **In Progress**. Spec Kit tree `specs/005-memory-productization` does **not** exist yet.

## Next gate

**P5 Spec Kit — specify** ([MOH-229](https://linear.app/momadhoun/issue/MOH-229/p5-spec-kit-specify-memory-productization)). Owner: **DH Spec**. Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P5.

- **Authorize specify only** — no clarify/plan/tasks/analyze/implement until Verifier Pass on specify.
- New tree only: `specs/005-memory-productization` (or Spec Kit sequential `005-…` with memory/productization in the slug). Do **not** rewrite `specs/001`–`004`.
- **Scope lock (plan In):** profile / log / note + recall UX; agent vs user memory layers per [adr/agent-vs-user-memory-layers.md](./adr/agent-vs-user-memory-layers.md).
- **Out:** full Grok memory chrome parity beyond agreed ADR; P6 connectors/events; P7 Box/Shell.
- **Exit (Verifier-provable):** write profile/log/note fact → restart → recall returns it; Verifier scripted path documented; SO 11+12 desktop visual evidence for every GUI recipe.
- Do **not** invent FR detail in this gate — Spec owns FRs/acceptance when specify runs; Lead/this doc carry plan In/Out/Exit only.

## Phase 5 kickoff (specify authorized)

1. **PO** — Confirmed P4 Verifier Pass + MOH-188 Done (#166 @ `aca0c2b7c5`); opened epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization) and specify [MOH-229](https://linear.app/momadhoun/issue/MOH-229/p5-spec-kit-specify-memory-productization). Lead does **not** create/duplicate epics.
2. **DH Lead** — This living gate; authorize Spec specify; report Status / Next gate / Owners to PO. No feature code; no Spec Kit tree edits.
3. **DH Spec** — `/speckit-specify` for P5 Memory productization only against plan §4 P5 In/Out/Exit + prior ADR; new `specs/005-…` tree; FRs from specify, not from this gate. GUI paths must call out desktop visual evidence (SO 11+12).
4. **DH Verifier** — Gate specify delivery (Pass/Fail) before clarify.
5. **Held until after specify Pass** — clarify → plan → tasks → analyze → taskstoissues → implement (same Spec Kit order as P2–P4); Architect / Runtime / Electron engage when plan/tasks demand.

## Owners / held

| Role | Action |
|------|--------|
| **DH Spec** | **Go** — P5 specify ([MOH-229](https://linear.app/momadhoun/issue/MOH-229/p5-spec-kit-specify-memory-productization)); new `specs/005-…`; no rewrite of 001–004 |
| **DH Verifier** | Gate specify PR Pass/Fail before clarify |
| **DH Lead** | This living gate + kickoff; no epic create; no feature code; no Spec Kit specs |
| **DH Architect / Runtime / Electron** | Idle until after specify Verifier Pass (clarify/plan follow) |
| **PO Assistant** | Orchestration; Linear statuses; ship/no-ship on later P5 gates |

## Blockers

None for specify kick. P4 Done (MOH-188 / #166) + epic MOH-228 + specify MOH-229 In Progress satisfied. Next hard gate after specify draft: Verifier Pass on specify before clarify.
