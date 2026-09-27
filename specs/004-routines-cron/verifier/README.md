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

## Foundational Pass gate (T014) — not stamped

**Rule:** Product success criteria **SC-001…SC-005** MUST NOT be marked Done without a recorded foundational Pass (Host `RoutineRecord` + catalog + cron evaluator stub + Host projection/mutations + Electron exclusion docs + no-Electron-routines-bus guard + schedule≠Routines regression). Product SC evidence stays under Scenario recipes; this section is the foundation gate only.

| Gate artifact | Location | Status |
|---------------|----------|--------|
| Host routines inventory (T002) | [host-routines-inventory.md](./host-routines-inventory.md) | Setup Pass |
| Cron-wake inventory (T003) | [cron-wake-inventory.md](./cron-wake-inventory.md) | Setup Pass |
| Schedule ≠ Routines (T004 / T012) | [schedule-not-routines.md](./schedule-not-routines.md) | T012 spot-check ready (`cursor/p4-foundation-host-fe1d`) |
| Host types + catalog + evaluator + Remotes (T006–T009) | `packages/experimental/agent-team/` | Ready on `cursor/p4-foundation-host-fe1d` |
| Electron exclusion + no-routines-bus (T010–T011) | `apps/desktop/` | Ready (Electron PR on master) |
| Optional jobs visibility doc (T013) | [optional-jobs-visibility.md](./optional-jobs-visibility.md) | Ready on `cursor/p4-foundation-host-fe1d` |
| Foundational Pass checklist (T014) | this README | **Deferred** — stamp only after Verifier Pass on T006–T013 |

**Scope lock:** Setup T001–T005 does **not** authorize US1–US4 product work. Wait for Host/Electron foundation + T014 stamp ([tasks.md](../tasks.md) Phase 2 CRITICAL).

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
| **1** Create + pane list | [Scenario 1](../quickstart.md#scenario-1--create--pane-list) | `scenario-1-create-list.md` (T018) · [create-list.md](../contracts/create-list.md) | **Runtime** + **Client** + **Verifier** | SC-001, SC-006, SC-007 | **Required** |
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

- Setup T001–T005 may land before Host foundation.
- **No** US1–US4 product work until T006–T014 land (tasks CRITICAL).
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

**PO / DH Lead:** Setup T001–T005 **Pass**. Leave Linear Done to PO. **Do not** stamp T014 / product SC until Host+Electron foundation (T006–T013) lands. Next: Runtime/Electron foundation fan-out.
