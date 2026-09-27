# Living next gate — MzM Bot

| Field | Value |
|-------|-------|
| **Updated** | 2026-09-27 |
| **Owner** | DH Lead |
| **Tracker** | DeepSeek Harness - Cursor (`P-MOH-2`) only |
| **Program plan** | [mzm-bot-plan.md](./mzm-bot-plan.md) |

## Status

**P1 (Wedge A)** — Done on `master` (epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui)). Specs remain under `specs/001-multi-model-bots`.

**Deferred (non-blocking):** SC-005 live Desktop full Phase 1 replay — recipe present; `specs/001-multi-model-bots/verifier/evidence/scenario-5/VERDICT.txt` = Deferred (`LIVE_DESKTOP: Skipped`). Does **not** block P2/P3.

**P2 (Identity / personas)** — Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas) **In Progress** (do **not** mark Done until Verifier Pass + PO).

- Spec Kit **closed** (specify → clarify → plan → tasks → analyze → implement T001–T042) on `master` (docs + implement). Specs under `specs/002-identity-personas/`.
  - Design Verifier gates Pass: [MOH-91](https://linear.app/momadhoun/issue/MOH-91)…[MOH-99](https://linear.app/momadhoun/issue/MOH-99).
  - Implement issues [MOH-100](https://linear.app/momadhoun/issue/MOH-100)…[MOH-141](https://linear.app/momadhoun/issue/MOH-141); polish T039–T042 merged (#98 / #99).
- **Phase 2 product Verifier gate — in flight.** Epic stays open until Pass. Linear statuses owned by PO.

## Next gate

**Current — P2 Verifier Pass** (epic exit / SC path + non-goals). Owner: **DH Verifier**. Lead does not stamp Done.

**After Verifier Pass + PO confirm — P3 Skills UX** Spec Kit **specify** (first Spec Kit step). Plan home: [mzm-bot-plan.md](./mzm-bot-plan.md) §4 P3.

- **Do not invent FR detail** — Spec owns FRs/acceptance when specify runs.
- **Do not create a P3 epic** until PO confirms Verifier Pass and authorizes epic open.
- Program In/Out/Exit (plan only; not FRs): load/discover + authoring; thin managed pack — **out** full managed catalog parity + learn-from-demonstration; exit = attach/run a skill on a bot with Verifier covering load + one authoring path.

## Phase 3 kickoff checklist (hold until Verifier Pass)

Run only after PO confirms P2 Verifier Pass. Checklist for Spec **specify** (Skills UX); no epic/issues until PO opens them.

1. **PO** — Confirm Verifier Pass on MOH-88 Phase 2 exit; leave Linear statuses to PO (epic Done only after Pass).
2. **PO** — Open P3 epic (Skills UX) under **DeepSeek Harness - Cursor** when ready; Lead does **not** create it preemptively.
3. **DH Lead** — Kickoff + phase gate (mirror P2 MOH-89 pattern): authorize Spec specify only; update this living gate; no feature code.
4. **DH Spec** — `/speckit-specify` for P3 Skills UX only; new `specs/00x-…` tree; do **not** rewrite `specs/001` / `specs/002`; FRs come from specify, not this checklist.
5. **DH Verifier** — Gate specify delivery (Pass/Fail) before clarify.
6. **Held until after specify Pass** — clarify → plan → tasks → analyze → taskstoissues → implement (same Spec Kit order as P2); Architect / Runtime / Electron engage on seams when plan/tasks demand.

## Owners / held

| Role | Action |
|------|--------|
| **DH Verifier** | Phase 2 product gate **in flight** — Pass/Fail → PO |
| **DH Lead** | This living gate + P3 kickoff checklist; no epic Done; no P3 epic create |
| **DH Spec** | Held for P3 specify until PO confirms Verifier Pass + epic open |
| **DH Architect / Runtime / Electron** | Held for P3; no P2 reopen |
| **PO Assistant** | Orchestration; Linear statuses; ship/no-ship on P3 epic open |

## Blockers

**Hard gate:** P2 Verifier Pass before any P3 Spec Kit start or P3 epic create. No other blockers for living-gate prep.
