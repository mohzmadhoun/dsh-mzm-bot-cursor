# Verifier recipes — Phase 4 Routines (cron only)

**Feature:** `specs/004-routines-cron`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Contracts:** [../contracts/](../contracts/) — start at [contracts/README.md](../contracts/README.md)
**Architect lock:** Option 3 in [research.md](../research.md) (Host Routine catalog SoT + Host cron wake; `dsh-schedule` ≠ Routines)
**Setup inventories:** [host-routines-inventory.md](./host-routines-inventory.md) (T002) · [cron-wake-inventory.md](./cron-wake-inventory.md) (T003) · [schedule-not-routines.md](./schedule-not-routines.md) (T004)
**Evidence placeholders:** [evidence/](./evidence/)
**Linear:** Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188) · T001 [MOH-194](https://linear.app/momadhoun/issue/MOH-194) · T002 [MOH-195](https://linear.app/momadhoun/issue/MOH-195) · T003 [MOH-196](https://linear.app/momadhoun/issue/MOH-196) · T004 [MOH-197](https://linear.app/momadhoun/issue/MOH-197) · T005 [MOH-198](https://linear.app/momadhoun/issue/MOH-198) · T014 [MOH-207](https://linear.app/momadhoun/issue/MOH-207)

## T001 — Design tree confirm (Setup)

**Verdict:** **Pass** (design artifacts only)
**Stamp:** 2026-09-27 · tip `origin/master` @ `646eb4e993` (analyze #143 landed)
**Linear:** [MOH-194](https://linear.app/momadhoun/issue/MOH-194)

| Artifact | Path | Present |
|----------|------|---------|
| Spec | [spec.md](../spec.md) | Yes |
| Plan | [plan.md](../plan.md) | Yes |
| Research (Option 3) | [research.md](../research.md) | Yes |
| Data model | [data-model.md](../data-model.md) | Yes |
| Quickstart | [quickstart.md](../quickstart.md) | Yes |
| Contracts | [contracts/](../contracts/) (`README`, create-list, pause-resume, cron-fire, non-goals) | Yes |
| Requirements checklist | [checklists/requirements.md](../checklists/requirements.md) | Yes |

**Implementer pointers:** Start at [contracts/README.md](../contracts/README.md). Honor Architect **Option 3** in [research.md](../research.md) R1–R9 — Host Routine catalog SoT; do not ship Pass as “mount `dsh-schedule`.”

## Foundational Pass gate (T014)

**Rule:** Product success criteria **SC-001…SC-005** MUST NOT be marked Done without a recorded foundational Pass (Host `RoutineRecord` + catalog + cron evaluator stub + Host projection/mutations + Electron exclusion docs + no-Electron-routines-bus guard + schedule≠Routines regression). Product SC evidence stays under Scenario recipes; this section is the foundation gate only.

| Gate artifact | Location |
|---------------|----------|
| Host routines inventory (T002) | [host-routines-inventory.md](./host-routines-inventory.md) |
| Cron-wake inventory (T003) | [cron-wake-inventory.md](./cron-wake-inventory.md) |
| Schedule ≠ Routines (T004 / T012) | [schedule-not-routines.md](./schedule-not-routines.md) |
| Host types + catalog + evaluator + Remotes (T006–T009) | `packages/experimental/agent-team/` (merged [#147](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/147)) |
| Electron exclusion + no-routines-bus (T010–T011) | `apps/desktop/` (merged [#145](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/145)) |
| Optional jobs visibility doc (T013) | [optional-jobs-visibility.md](./optional-jobs-visibility.md) |
| Foundational Pass checklist (T014) | this README (checklist below) |
| Evidence (post-merge rerun) | [evidence/foundation-host/](./evidence/foundation-host/) |

### Foundational Pass checklist — recorded

**Verdict:** **Pass** (foundations only)
**Stamp:** 2026-09-27 · tip `origin/master` @ `5a53ddac83` (includes merged [#147](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/147) T006–T009/T012–T013 · [#145](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/145) T010–T011 · [#146](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/146) T001–T005)
**Linear:** [MOH-207](https://linear.app/momadhoun/issue/MOH-207) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Scope lock:** This Pass does **not** mark SC-001…SC-005 Done. Scenario recipes and product US1–US4 implementation remain open. US fan-out may begin after this stamp lands on master.

| # | Foundation | Task | Pass bar | Evidence | Claim |
|---|------------|------|----------|----------|-------|
| 1 | **RoutineRecord types** | T006 | Host `RoutineRecord` with `routineId`, `botId`, non-empty `intent`, `scheduleExpr`, `status: active\|paused`, `lastRunAt` null\|ts, `createdAt`, `updatedAt` | **measured:** `packages/experimental/agent-team/src/types.ts` exports `RoutineRecord` / `RoutineStatus`; merge [#147](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/147) | Pass |
| 2 | **Host catalog** | T007 | Durable create/list by `botId` on Host journal `team/routine` — not Electron Main, not `dsh-schedule` | **measured:** `TeamService.createRoutine` / `listRoutinesByBot`; journal append `team/routine`; focused agent-team vitest **6 passed** ([evidence](./evidence/foundation-host/vitest-routines.log)) | Pass |
| 3 | **Cron evaluator stub** | T008 | Accepts product-supported `scheduleExpr` (5-field cron and/or `@every`-class); rejects invalid; Host-only | **measured:** `packages/experimental/agent-team/src/routine-cron.ts` + `tests/routine-cron.spec.ts` in focused run | Pass |
| 4 | **Host Remotes / projection** | T009 | Authenticated Host HTTP/WS mutations + Client-readable `view.routines` projection; Client invents no SoT | **measured:** `@Remote('createRoutine')` / `@Remote('listRoutinesByBot')`; `projectRoutine` / `view.routines` | Pass |
| 5 | **Electron exclusion docs** | T010 | host-protocol / ipc forbid routine-catalog, create/pause/resume, cron-fire, last-run on Node IPC | **measured:** exclusion comments in `apps/desktop/src/host-protocol.ts` + `ipc.ts`; merge [#145](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/145) | Pass |
| 6 | **No Electron routines bus** | T011 | Electron Main has no parallel routines store/bus/timers | **measured:** `apps/desktop/tests/no-electron-routines-bus.spec.ts` — **3 passed** ([evidence](./evidence/foundation-host/vitest-electron-bus.log)) | Pass |
| 7 | **Schedule ≠ Routines** | T012 | P4 Pass path is Host catalog + Host cron wake — not “mount `dsh-schedule` overlay alone” | **measured:** [schedule-not-routines.md](./schedule-not-routines.md); zero `@deepseek-ai/dsh-schedule` imports under `agent-team` | Pass |
| 8 | **Optional jobs visibility** | T013 | `dsh-jobs` may show in-flight fire only; never catalog SoT | **measured:** [optional-jobs-visibility.md](./optional-jobs-visibility.md); persistence ack green ([evidence](./evidence/foundation-host/persistence-ack.log)) | Pass |

**Rerun (idempotent):**

```sh
pnpm exec vitest run packages/experimental/agent-team -t 'routine|Host Routine|exports Team views|createRoutine'
pnpm exec vitest run apps/desktop/tests/no-electron-routines-bus.spec.ts
pnpm exec tsx scripts/persistence-changes.ts
test -f specs/004-routines-cron/verifier/schedule-not-routines.md
test -f specs/004-routines-cron/verifier/optional-jobs-visibility.md
test -f docs/persistence-changes/2026-09-27-team-routine-catalog.md
rg -n "export interface RoutineRecord" packages/experimental/agent-team/src/types.ts
```

**PO / DH Lead:** Foundations hold on master tip above. Do **not** close product SC Done on this stamp. Leave [MOH-207](https://linear.app/momadhoun/issue/MOH-207) In Progress until this stamp PR merges; then Done. Next: US1 create (T015+) + Scenario 1 recipe.

## FR-010/011 / standing orders 11+12 — desktop visual evidence (mandatory)

**Rule:** Every **GUI** acceptance scenario (US1–US3 / SC-001…SC-003 / SC-005 full replay) requires **desktop screenshot(s) and/or a short screen recording** of the real Desktop app, **committed** under `specs/004-routines-cron/verifier/evidence/` **and** embedded in the GUI PR body (absolute `/opt/cursor/artifacts/…` paths for ManagePullRequest uploads). Unit/jsdom alone **fails** those scenarios. Scenario 4 (non-goals / seam absence) is docs/absence — GUI screenshot optional.

Evidence layout:

```text
specs/004-routines-cron/verifier/evidence/
├── scenario-1/   # screenshots / recording + VERDICT.txt · README.md
├── scenario-2/
├── scenario-3/
├── non-goals/    # SC-004 measured absence checks
└── scenario-5/   # full replay
```

## Scenario 1–5 owners map

Mapped to [quickstart.md](../quickstart.md). Owner columns name who owns scripts/evidence for that scenario (not who implements the product feature). Owner labels are **Runtime** / **Client** / **Electron** / **Verifier** per T005.

| Scenario | Quickstart | Recipe path (later tasks) | Primary owners | Acceptance | FR-010/011 |
|----------|------------|---------------------------|----------------|------------|------------|
| **1** Create + pane list | [Scenario 1](../quickstart.md#scenario-1--create--pane-list) | [scenario-1-create-list.md](./scenario-1-create-list.md) (T018) · [create-list.md](../contracts/create-list.md) | **Runtime** + **Client** + **Verifier** | SC-001, SC-006, SC-007 | **Required** |
| **2** Pause / resume | [Scenario 2](../quickstart.md#scenario-2--pause--resume) | `scenario-2-pause-resume.md` (tasks) · [pause-resume.md](../contracts/pause-resume.md) | **Runtime** + **Client** + **Verifier** | SC-002 | **Required** |
| **3** Cron fire + last-run | [Scenario 3](../quickstart.md#scenario-3--cron-fire--last-run) | `scenario-3-cron-fire.md` (tasks) · [cron-fire.md](../contracts/cron-fire.md) | **Runtime** + **Client** + **Verifier** | SC-003 | **Required** |
| **4** Non-goals / seam absence | [Scenario 4](../quickstart.md#scenario-4--non-goals--seam-absence) | [schedule-not-routines.md](./schedule-not-routines.md) + no-Electron-routines-bus (T011) · [non-goals.md](../contracts/non-goals.md) | **Runtime** + **Electron** + **Verifier** | SC-004 | Docs/absence ok |
| **5** Full Phase 4 replay | [Scenario 5](../quickstart.md#scenario-5--full-phase-4-replay) | `scenario-5-full-replay.md` (tasks) · all contracts | **Verifier** | SC-005 (+ composite of 1–3) | **Required** |

Scenario recipe files (aside from Setup inventories) land with US tasks. Foundational Pass (T014) must hold before Scenario evidence counts toward phase Done.

## Owner roles (T005)

| Owner | Owns for Verifier evidence |
|-------|----------------------------|
| **Runtime** | Host Routine catalog durability, Host cron evaluator/wake, last-run projection, schedule≠Routines SoT honesty |
| **Client** | Bot routines pane create / list / pause / resume / last-run surfaces on Desktop Web (Host HTTP/WS only) |
| **Electron** | Thin-shell absence: no Main routines bus/timers/IPC SoT (T010/T011); desktop launch path for GUI evidence |
| **Verifier** | Rerunnable recipes, pass/fail stamps, FR-010/011 committed screenshots/recordings + PR embeds, Scenario 5 composite replay |

## Clarify / Architect locks (honor in every recipe)

1. Host Routine catalog is SoT — Client and Electron Main invent no durable routine rows (FR-007 / R1).
2. `dsh-schedule` / `ui-schedule` remain session reminders only — not Routines Pass path (R2 / T004).
3. Fire = Host wake applying intent; do **not** score LLM reply wording (R4 / SC-003).
4. Per-bot isolation (SC-006); confirm-on-create optional (SC-007).
5. FR-010/011 desktop visual evidence required for all GUI scenarios; commit under `verifier/evidence/` + PR embeds (SO 11+12).
6. `dsh-jobs` optional in-flight visibility only — never catalog SoT (R5).

## Fan-out policy

- Setup T001–T005 + Foundational T006–T014 stamped (this README).
- US1–US4 product work may begin after this stamp is on master (tasks CRITICAL unlocked).
- Scenario 5 requires Scenarios 1–3 (or equivalent) plus foundational Pass + Scenario 4 absence.
- Quickstart non-goals MUST NOT appear in Pass criteria ([quickstart.md](../quickstart.md) Scenario 4).

## Rerun Setup (idempotent)

```sh
test -f specs/004-routines-cron/spec.md
test -f specs/004-routines-cron/plan.md
test -f specs/004-routines-cron/research.md
test -f specs/004-routines-cron/data-model.md
test -f specs/004-routines-cron/quickstart.md
test -f specs/004-routines-cron/contracts/README.md
test -f specs/004-routines-cron/checklists/requirements.md
test -f specs/004-routines-cron/verifier/README.md
test -f specs/004-routines-cron/verifier/host-routines-inventory.md
test -f specs/004-routines-cron/verifier/cron-wake-inventory.md
test -f specs/004-routines-cron/verifier/schedule-not-routines.md
rg -n 'Option 3' specs/004-routines-cron/research.md | head -3
```

**PO / DH Lead:** Setup T001–T005 **Pass**. Foundational T014 **Pass** recorded above (master tip `5a53ddac83`). Leave MOH-207 Done to PO after stamp merge. Do **not** mark product SC Done on this stamp. Next: US1–US4 fan-out.
