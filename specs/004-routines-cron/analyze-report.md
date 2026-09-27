# Specification Analysis Report

**Feature**: `specs/004-routines-cron`
**Date**: 2026-09-27
**Branch**: `cursor/p4-analyze-fe1d` (from `origin/master` @ `31bc58e442` / #142 tasks)
**Linear**: Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only) · Analyze [MOH-193](https://linear.app/momadhoun/issue/MOH-193/p4-spec-kit-analyze-taskstoissues-routines-cron) · Project **DeepSeek Harness - Cursor** only
**Verdict**: **PASS** — 0 CRITICAL; FR coverage 100%; proceed to implement only after Verifier/Lead analyze gate; Linear children T001–T034 filed as MOH-194…MOH-227

## Findings

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| I1 | Inconsistency | LOW | tasks.md Linear / Branch | Header still cites tasks [MOH-192] and branch `cursor/p4-tasks-3e3a` | Cosmetic; point Linear line at MOH-193 + T→MOH map (this analyze) |
| I2 | Inconsistency | LOW | spec.md Feature Branch | Still names `cursor/p4-clarify-3e3a` | Cosmetic; historical Spec Kit metadata, not a blocker |
| I3 | Inconsistency | LOW | living-next-gate.md | Still shows MOH-192 tasks as active next gate | Update to analyze/MOH-193 in this analyze commit |
| D1 | Duplication | LOW | T011 / T033 | Progressive no-Electron-routines-bus guard (foundational + post-story reconfirm) | Keep; mirrors P3 pattern |
| A1 | Ambiguity | LOW | FR-007 / research Option 3 | Spec says “Host-side job/schedule capability”; plan locks Host Routine catalog SoT + optional jobs visibility only | Intentional; Architect Option 3 supersedes naive dsh-schedule SoT reading |
| A2 | Ambiguity | LOW | T013 / T026 | Optional dsh-jobs visibility may be skipped | Acceptable; Pass does not require jobs as SoT |
| U1 | Underspecification | LOW | T017 / Client i18n | Create-routine copy locale keys not named in tasks | Follow Client i18n standing order at implement |
| C1 | Coverage | LOW | FR-012 | Edit optional — covered by SC-007 / T016 absences, not edit product tasks | Intentional non-goal for Pass |

**Coverage Summary Table:**

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|
| FR-001 | Yes | T015–T018 | Create + validate + Client UI + Scenario 1 |
| FR-002 | Yes | T019–T021 | List projection + pane UI + evidence |
| FR-003 | Yes | T022–T024 | Pause persist + suppress wake |
| FR-004 | Yes | T022–T024 | Resume + evidence |
| FR-005 | Yes | T025–T028 | Cron wake + lastRunAt + fire UI + Scenario |
| FR-006 | Yes | T029, T034 | Cron-only; non-goals / no Schedule-as-Routines copy |
| FR-007 | Yes | T006–T014, T011, T033 | Host catalog SoT; no Electron bus |
| FR-008 | Yes | T029 | Non-goals (memory / box / MCP) |
| FR-009 | Yes | T005, T031–T032 | Documented Verifier replay path |
| FR-010 | Yes | T018, T021, T024, T028, T030–T031 | SO 11 desktop visual |
| FR-011 | Yes | T018, T021, T024, T028, T030–T031 | SO 12 commit + PR embeds |
| FR-012 | Yes | T016 | Edit not required (SC-007) |
| SC-001 | Yes | T015–T018, T021 | Create + list + evidence |
| SC-002 | Yes | T022–T024 | Pause/resume + evidence |
| SC-003 | Yes | T025–T028 | Cron fire ≤6 min + evidence |
| SC-004 | Yes | T029 | Non-goals |
| SC-005 | Yes | T031 | Full Phase 4 replay |
| SC-006 | Yes | T016 | Per-bot create isolation |
| SC-007 | Yes | T016 | Confirm/edit not Pass gates |

**Constitution Alignment Issues:** None (I–V + Stack PASS). P4 routines cron is the scheduled wedge slice toward C (Principle I/V). Spec Kit order + Linear-after-tasks honored (II). FR-010/FR-011 / Verify Against Spec (IV) retained. Thin shell / Host Routine catalog SoT / no Electron routines bus / NOT dsh-schedule as Routines SoT (V) encoded in T004/T011/T012/T033/T034 + research Option 3.

**Unmapped Tasks:** None material — T001–T005 (setup), T014 (foundational stamp), T030/T032–T034 (polish/cross-links/non-regression) support delivery process.

**Metrics:**

- Total Requirements (FR): 12
- Total Success Criteria (buildable): 7
- Total Tasks: 34 (T001–T034)
- Coverage % (FR with ≥1 task): **100%**
- Ambiguity Count: 2 (LOW)
- Duplication Count: 1 (LOW)
- Critical Issues Count: **0**

## Linear taskstoissues map (MOH-188 children)

| Task | Linear | Phase |
|------|--------|-------|
| T001 | [MOH-194](https://linear.app/momadhoun/issue/MOH-194) | Setup |
| T002 | [MOH-195](https://linear.app/momadhoun/issue/MOH-195) | Setup |
| T003 | [MOH-196](https://linear.app/momadhoun/issue/MOH-196) | Setup |
| T004 | [MOH-197](https://linear.app/momadhoun/issue/MOH-197) | Setup |
| T005 | [MOH-198](https://linear.app/momadhoun/issue/MOH-198) | Setup |
| T006 | [MOH-199](https://linear.app/momadhoun/issue/MOH-199) | Foundational |
| T007 | [MOH-200](https://linear.app/momadhoun/issue/MOH-200) | Foundational |
| T008 | [MOH-201](https://linear.app/momadhoun/issue/MOH-201) | Foundational |
| T009 | [MOH-202](https://linear.app/momadhoun/issue/MOH-202) | Foundational |
| T010 | [MOH-203](https://linear.app/momadhoun/issue/MOH-203) | Foundational |
| T011 | [MOH-204](https://linear.app/momadhoun/issue/MOH-204) | Foundational |
| T012 | [MOH-205](https://linear.app/momadhoun/issue/MOH-205) | Foundational |
| T013 | [MOH-206](https://linear.app/momadhoun/issue/MOH-206) | Foundational |
| T014 | [MOH-207](https://linear.app/momadhoun/issue/MOH-207) | Foundational |
| T015 | [MOH-208](https://linear.app/momadhoun/issue/MOH-208) | US1 |
| T016 | [MOH-209](https://linear.app/momadhoun/issue/MOH-209) | US1 |
| T017 | [MOH-210](https://linear.app/momadhoun/issue/MOH-210) | US1 |
| T018 | [MOH-211](https://linear.app/momadhoun/issue/MOH-211) | US1 |
| T019 | [MOH-212](https://linear.app/momadhoun/issue/MOH-212) | US2 |
| T020 | [MOH-213](https://linear.app/momadhoun/issue/MOH-213) | US2 |
| T021 | [MOH-214](https://linear.app/momadhoun/issue/MOH-214) | US2 |
| T022 | [MOH-215](https://linear.app/momadhoun/issue/MOH-215) | US3 |
| T023 | [MOH-216](https://linear.app/momadhoun/issue/MOH-216) | US3 |
| T024 | [MOH-217](https://linear.app/momadhoun/issue/MOH-217) | US3 |
| T025 | [MOH-218](https://linear.app/momadhoun/issue/MOH-218) | US4 |
| T026 | [MOH-219](https://linear.app/momadhoun/issue/MOH-219) | US4 |
| T027 | [MOH-220](https://linear.app/momadhoun/issue/MOH-220) | US4 |
| T028 | [MOH-221](https://linear.app/momadhoun/issue/MOH-221) | US4 |
| T029 | [MOH-222](https://linear.app/momadhoun/issue/MOH-222) | Polish |
| T030 | [MOH-223](https://linear.app/momadhoun/issue/MOH-223) | Polish |
| T031 | [MOH-224](https://linear.app/momadhoun/issue/MOH-224) | Polish |
| T032 | [MOH-225](https://linear.app/momadhoun/issue/MOH-225) | Polish |
| T033 | [MOH-226](https://linear.app/momadhoun/issue/MOH-226) | Polish |
| T034 | [MOH-227](https://linear.app/momadhoun/issue/MOH-227) | Polish |

All 34 issues: parent **MOH-188**, project **DeepSeek Harness - Cursor**, status Backlog. Dependency notes retained in each description (Setup free; Foundational blocks US fan-out; US stories after T014).

## Next Actions

1. **PO / Verifier analyze gate** on this report + Linear map — do **not** kick off implement until Pass (or Lead confirm).
2. On gate Pass: implement Host foundations **T006–T014** (MOH-199…MOH-207) before US1–US4 fan-out.
3. Story order among equals: US1 → US2 → US3 → US4 (per tasks.md).

## Remediation

No CRITICAL remediation before implement. Cosmetic tasks.md Linear/hand-off strings and living-next-gate updated in this analyze commit. FR-007 Option 3 reading and optional jobs visibility remain Architect/Runtime HOW.
