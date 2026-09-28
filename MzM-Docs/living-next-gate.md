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

**P5 (Memory productization)** — Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization) **In Progress**. Spec Kit tree `specs/005-memory-productization/` on `master` through **tasks** (#171). Specify / clarify / plan / tasks Verifier gates Done. **Analyze + taskstoissues** [MOH-237](https://linear.app/momadhoun/issue/MOH-237/p5-spec-kit-analyze-taskstoissues-memory) In Progress.

## Next gate

**P5 Spec Kit — analyze + taskstoissues** ([MOH-237](https://linear.app/momadhoun/issue/MOH-237/p5-spec-kit-analyze-taskstoissues-memory)). Owner: **DH Spec**. Then **DH Verifier** Pass on analyze; PO kicks implement Setup only after that.

- Spec Kit tree: `specs/005-memory-productization/` (spec / plan / tasks / analyze-report).
- **Locks:** Host Memory catalog SoT; no Electron Main memory bus; Write Pass = UI; Recall Pass = surface + inject; kinds × layers orthogonal; SO 11+12 GUI evidence.
- **Out:** full Grok memory chrome parity beyond ADR; P6 connectors/events; P7 Box/Shell.
- **Exit (Verifier-provable):** write profile/log/note → restart → recall returns it; Verifier scripted path; desktop visual evidence.
- Do **not** start product implement until Verifier Pass on analyze + Linear T001–T037 children exist under MOH-228.

## Phase 5 gate sequence (current)

1. **PO** — Analyze [MOH-237](https://linear.app/momadhoun/issue/MOH-237) authorized after tasks Done (#171 / [MOH-235](https://linear.app/momadhoun/issue/MOH-235)).
2. **DH Spec** — `/speckit-analyze` (0 CRITICAL target) + `/speckit-taskstoissues` Linear children T001–T037 under MOH-228 / **DeepSeek Harness - Cursor** only.
3. **DH Verifier** — Gate analyze + issue map Pass/Fail before implement.
4. **Held until after analyze Verifier Pass** — implement Setup (T001–T005) → Foundational (T006–T013) → US1–US5 → polish; Architect / Runtime / Electron engage on implement.

## Owners / held

| Role | Action |
|------|--------|
| **DH Spec** | **Go** — analyze + taskstoissues ([MOH-237](https://linear.app/momadhoun/issue/MOH-237)); no product implement |
| **DH Verifier** | Gate analyze PR + Linear T001–T037 map before implement kick |
| **DH Lead** | This living gate; no feature code |
| **DH Architect / Runtime / Electron** | Idle until after analyze Verifier Pass (implement Setup kick) |
| **PO Assistant** | Orchestration; ship/no-ship on analyze Verifier; then implement Setup kick |

## Blockers

None for analyze/taskstoissues. Tasks tree on master (#171). Next hard gate after Spec delivers: Verifier Pass on analyze before implement Setup.
