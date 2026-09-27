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

**P3 (Skills UX)** — Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux) **In Progress**. Specs under `specs/003-skills-ux/`.

- Spec Kit **design Done** (specify → clarify → plan → tasks → analyze + taskstoissues) on `master`:
  - Specify Done ([MOH-143](https://linear.app/momadhoun/issue/MOH-143/p3-spec-kit-specify-skills-ux) / [#106](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/106)).
  - Clarify Done ([MOH-144](https://linear.app/momadhoun/issue/MOH-144/p3-spec-kit-clarify-skills-ux) / [#107](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/107)).
  - Plan Done ([MOH-145](https://linear.app/momadhoun/issue/MOH-145/p3-spec-kit-plan-skills-ux) / [#108](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/108)).
  - Tasks Done ([MOH-146](https://linear.app/momadhoun/issue/MOH-146/p3-spec-kit-tasks-skills-ux) / [#109](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/109)).
  - Analyze + taskstoissues Done ([MOH-147](https://linear.app/momadhoun/issue/MOH-147/p3-spec-kit-analyze-taskstoissues-skills-ux) / [#111](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/111) @ `bf71115cea`; analyze **PASS**). Issues [MOH-148](https://linear.app/momadhoun/issue/MOH-148)…[MOH-187](https://linear.app/momadhoun/issue/MOH-187) under epic MOH-142.

## Next gate

**Implement — Setup + Foundational (T001–T014) kicked** (no US1–US4 fan-out until foundations checkpoint).

### Setup (T001–T005) — parallel

| Task | Issue | Owner |
|------|-------|-------|
| T001 Confirm design tree | [MOH-148](https://linear.app/momadhoun/issue/MOH-148) | **DH Spec** |
| T002 Inventory Host skill catalog | [MOH-149](https://linear.app/momadhoun/issue/MOH-149) | **DH Runtime** |
| T003 Inventory attachment + instruction-bind | [MOH-150](https://linear.app/momadhoun/issue/MOH-150) | **DH Runtime** |
| T004 Verifier recipe README | [MOH-151](https://linear.app/momadhoun/issue/MOH-151) | **DH Verifier** |
| T005 Record thin-pack pick (`mzm-thin-pack`) | [MOH-152](https://linear.app/momadhoun/issue/MOH-152) | **DH Spec** / **DH Architect** |

### Foundational (T006–T014) — **blocks** US fan-out

| Task | Issue | Owner |
|------|-------|-------|
| T006 Ship `mzm-thin-pack` SKILL.md | [MOH-153](https://linear.app/momadhoun/issue/MOH-153) | **DH Runtime** |
| T007 Mount managed + user skills roots | [MOH-154](https://linear.app/momadhoun/issue/MOH-154) | **DH Runtime** |
| T008 Extend Bot identity `skillAttachments` | [MOH-155](https://linear.app/momadhoun/issue/MOH-155) | **DH Runtime** |
| T009 Persist `skillAttachments` Host-durably | [MOH-156](https://linear.app/momadhoun/issue/MOH-156) | **DH Runtime** |
| T010 Host attach/author mutation stubs | [MOH-157](https://linear.app/momadhoun/issue/MOH-157) | **DH Runtime** |
| T011 Project catalog + attachments to Client | [MOH-158](https://linear.app/momadhoun/issue/MOH-158) | **DH Runtime** |
| T012 Document instruction-bind approach | [MOH-159](https://linear.app/momadhoun/issue/MOH-159) | **DH Architect** / **DH Runtime** |
| T013 No-Electron-skills-bus regression guard | [MOH-160](https://linear.app/momadhoun/issue/MOH-160) | **DH Electron** |
| T014 Foundational Pass checklist in verifier README | [MOH-161](https://linear.app/momadhoun/issue/MOH-161) | **DH Verifier** |

- Spec / Verifier / Runtime may touch `specs/003-skills-ux/` for their Setup/Foundational slices; do **not** rewrite `specs/001` or `specs/002`.
- **Standing order 11** — every GUI Verifier recipe requires desktop screenshots/recordings (real Cloud Agent display), not unit/jsdom alone.
- **After T014 foundational checkpoint:** US fan-out (US1 → US2 → US3 → US4 per `tasks.md`) + Architect seams as story slices demand.
- Epic MOH-142 stays open until Phase 3 product Verifier Pass + PO Done.

## Owners / held

| Role | Action |
|------|--------|
| **DH Spec** | Setup T001 + T005 in flight |
| **DH Runtime** | Setup T002–T003 + Foundational T006–T011 (and T012 with Architect) in flight |
| **DH Architect** | T005 thin-pack lock + T012 instruction-bind; seams as foundations demand |
| **DH Electron** | Foundational T013 (no Electron skills bus); shell only when story slices need it |
| **DH Verifier** | Setup T004 + Foundational T014; gate product SC path after US work |
| **DH Lead** | This living gate only; no feature code; no epic Done |
| **PO Assistant** | Orchestration; Linear statuses; ship/no-ship on later P3 gates |

## Blockers

None for Setup + Foundational T001–T014 kickoff. Design PRs #106–#109 + #111 merged; analyze PASS. Hard gate before US1–US4: foundational checkpoint (T006–T014 / T014 stamp).
