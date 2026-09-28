# Specification Analysis Report

**Feature**: `specs/007-box-subagent-settings`
**Date**: 2026-09-28
**Branch**: `cursor/p7-analyze-dc28` (from `origin/master` @ `ea4a79d857` / #234 tasks)
**Linear**: Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · analyze [MOH-355](https://linear.app/momadhoun/issue/MOH-355) · project **DeepSeek Harness - Cursor** (`P-MOH-2`) only — never GrokBot. T001–T035 children via `taskstoissues` after this analyze gate (do not invent ids).
**Prerequisites**: Required artifacts present (`spec.md`, `plan.md`, `tasks.md` + research/data-model/contracts/quickstart/checklists). `check-prerequisites.ps1` not executed (no `pwsh`/`powershell` on this agent host); paths resolved manually to `FEATURE_DIR=/workspace/specs/007-box-subagent-settings`.
**Verdict**: **PASS** — 0 CRITICAL; 0 HIGH; FR/SC coverage **100%**; Path A + clarify + PO locks honored; **implement unlock = Y** after Verifier/Lead analyze gate Pass (Setup T001–T006 then Foundational T007–T015 before US fan-out).

## Findings

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| I1 | Inconsistency | MEDIUM | tasks.md Phase 2 CRITICAL vs Dependencies | Phase 2 says no US1–US3 product work until **T007–T015** stamp; Dependencies also say US2 may fan out after **T009–T010/T012**, US3 after **T011/T012** | Prefer stamp rule: no US product work before T015. Treat “after T009/…” as informal Host readiness, not a waiver of T007–T008/T011/T013–T014/T015 |
| I2 | Inconsistency | LOW | spec.md Feature Branch / Status / Out / Traceability | Branch still `cursor/p7-clarify-dc28`; Status Clarified; Out still “plan/tasks held”; follow-ons still “stops at clarify” | Cosmetic Spec Kit metadata; not a blocker — optional tidy in a docs commit |
| I3 | Inconsistency | LOW | plan.md Branch / Next / Structure | Branch `cursor/p7-plan-dc28`; Next still “after plan Verifier: tasks”; Structure says tasks.md not created by plan | Cosmetic; tasks already merged (#234 @ `ea4a79d857`) |
| I4 | Inconsistency | LOW | tasks.md Branch | Header still `cursor/p7-tasks-dc28` | Cosmetic after analyze lands |
| I5 | Inconsistency | LOW | checklists/requirements.md Notes | Still “ready for `/speckit-plan`” | Cosmetic; plan/tasks already Done |
| D1 | Duplication | LOW | T013–T014 / T032 | host-protocol exclusions + no-Electron bus guard (foundational + polish reconfirm) | Keep; mirrors P3–P6 pattern |
| D2 | Duplication | LOW | T011–T012 / T026 | Host Computer settings fields defined foundationally; US3 T026 re-supplies projection for Client rows | Intentional layering; T026 extends T011/T012 for FR-004 wiring, not a second SoT |
| A1 | Ambiguity | LOW | T007 / data-model BoxBackend | Readiness home = settings document field **or** Remote fact — pick in inventory | Acceptable Runtime HOW after T002/T004 inventory |
| A2 | Ambiguity | LOW | T009 / T020 / research R3 | Pass provider = Cua MCP/native **or** Host Pass fixture (either OK) | Locked Architect + PO Path A; Verifier picks reachable path in Scenario 2 |
| A3 | Ambiguity | LOW | T024 / Path Conventions | `ui-settings-computer/` create-if-absent **or** inventory-named sibling | Acceptable Client HOW after T004; package currently absent (expected) |
| U1 | Underspecification | LOW | T018 / T022 / T025 / Client locales | Exact locale keys for Shell / Computer use / readiness / handoff copy not named | Follow Client i18n standing order at implement (`locales.ts`) |
| U2 | Underspecification | LOW | T019 vs FR-002 edge | Scenario 1 recipe must also prove not-ready ≠ Pass (spec edge + FR-002); task text emphasizes success path | At T019, require one not-ready observation (or Fail recipe branch) alongside SC-001 success |
| C1 | Coverage | LOW | Linear taskstoissues | Constitution II expects Linear children from tasks; T001–T035 not filed yet (gates MOH-350…MOH-355 only) | After analyze Verifier Pass: `taskstoissues` under **DeepSeek Harness - Cursor** only — no invented ids now |

**Coverage Summary Table:**

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|
| FR-001 | Yes | T016–T019 | Local Shell/box tool success |
| FR-002 | Yes | T007, T017–T018 | Readiness ≠ ready; not-ready ≠ Pass (see U2) |
| FR-003 | Yes | T020–T023 | Screenshot-only + parent handoff |
| FR-004 | Yes | T011–T012, T024–T027 | Settings → Computer; Shell + Computer use |
| FR-005 | Yes | T027, T034 | Chrome ≠ Verifier substitute |
| FR-006 | Yes | T028 | No user machines |
| FR-007 | Yes | T028 | No voice/draft/group/… |
| FR-008 | Yes | T028 | No Verifier-as-feature |
| FR-009 | Yes | T028, T033 | No rewrite `specs/001`–`006` |
| FR-010 | Yes | T025, T028 | Only Shell + Computer use rows required |
| FR-011 | Yes | T008, T016, T019 | One local path enough |
| FR-012 | Yes | T006, T019, T023, T027, T030 | Documented Verifier path |
| FR-013 | Yes | T006, T019, T023, T027, T029–T030 | SO 11 desktop visual |
| FR-014 | Yes | T006, T019, T023, T027, T029–T030 | SO 12 commit + PR embeds |
| FR-015 | Yes | T016, T021 | LLM wording not scored |
| FR-016 | Yes | T024–T025, T027 | Global Settings → Computer only |
| SC-001 | Yes | T016–T019 | Shell/box success + evidence |
| SC-002 | Yes | T020–T023 | computerUse screenshot + handoff |
| SC-003 | Yes | T024–T027 | Settings rows visible |
| SC-004 | Yes | T027 | Chrome alone fails Phase |
| SC-005 | Yes | T028 | Non-goals absences |
| SC-006 | Yes | T030 | Full Phase 7 replay |

**User-story → tasks:**

| Story | Tasks | Independent test |
|-------|-------|------------------|
| US1 Shell/box | T016–T019 | Ready backend + one local Shell tool success |
| US2 computerUse-class | T020–T023 | Screenshot + parent handoff (no interactive browser) |
| US3 Settings rows | T024–T027 | Settings → Computer shows Shell + Computer use |

**Constitution Alignment Issues:** None CRITICAL (I–V + Stack PASS).

- **I Wedge-First**: One local Shell path + one computerUse-class path + required settings rows toward C; no full Grok computer theater.
- **II Spec-Driven**: specify→clarify→plan→tasks→analyze honored; Linear children deferred honestly until `taskstoissues` (C1) — no invented T### ids.
- **III Product Over Theater**: Real Host sandboxed Shell; screenshot+handoff subagent; operable Computer settings — Host fixture + read-only Shell readiness OK (PO).
- **IV Verify Against Spec**: SC-001…006 + FR-013/014 + Verifier recipes T019/T023/T027/T028/T030; chrome ≠ substitute (SC-004).
- **V Seam Honesty**: Architect Path A (Host SoT; sandboxed Shell; computerUse+subagent; Client Computer over Host settings; host-protocol exclusions) encoded in T005/T007–T015/T032/T034 + research R0–R6.
- **Stack**: DSH + Electron dual-process + Spec Kit; Linear on P-MOH-2.

**Locks honored (Path A + clarify + PO):** Settings → Computer / Shell + Computer use; screenshot-only computerUse Pass; readiness clear ≠ ready; evidence `shell-box/` · `computer-use/` · `settings/`; Host sandboxed Shell; Cua-or-Host-fixture; Shell row read-only readiness OK; forbid Main IPC product bus keys — all reflected in tasks + contracts.

**Unmapped Tasks:** None material — T001–T006 (setup), T015 (foundational stamp), T028–T035 (polish / evidence / non-regression / Linear note) support delivery process.

**Metrics:**

- Total Requirements (FR): **16**
- Total Success Criteria (buildable): **6**
- Total Tasks: **35** (T001–T035)
- Coverage % (FR with ≥1 task): **100%**
- Ambiguity Count: **3** (LOW)
- Duplication Count: **2** (LOW)
- Inconsistency Count: **5** (1 MEDIUM, 4 LOW)
- Underspecification Count: **2** (LOW)
- Coverage notes: **1** (LOW — Linear children pending `taskstoissues`)
- Critical Issues Count: **0**
- High Issues Count: **0**

## Linear taskstoissues map

**Not filed yet for T001–T035.** Phase gates exist: epic MOH-350 · specify MOH-351 · clarify MOH-352 · plan MOH-353 · tasks MOH-354 · analyze MOH-355. Do **not** invent MOH-* child ids. When analyze Verifier Passes: run `taskstoissues` on **DeepSeek Harness - Cursor** only; never **DeepSeek Harness - GrokBot**.

## Severity summary

| Severity | Count | IDs |
|----------|------:|-----|
| CRITICAL | 0 | — |
| HIGH | 0 | — |
| MEDIUM | 1 | I1 |
| LOW | 12 | I2–I5, D1–D2, A1–A3, U1–U2, C1 |

**Implement unlock: Y** — 0 CRITICAL; 0 HIGH; FR/SC coverage complete; MEDIUM item is dependency/stamp clarification for Foundational (fix at T015 — no re-specify required).

## Next Actions

1. **PO / Verifier analyze gate** on this report — do **not** kick implement until Pass (or Lead confirm).
2. On gate Pass: implement Setup **T001–T006**, then Foundational **T007–T015** (stamp), then US1→US3 per tasks.md.
3. At T015: enforce no US product work before foundational stamp (supersedes informal T009/T011/T012 fan-out notes — I1).
4. At T019: include not-ready ≠ Pass observation alongside SC-001 success (U2).
5. After analyze Pass: `taskstoissues` under **DeepSeek Harness - Cursor** only (C1).
6. Lead/PO: refresh living gate to analyze Pass → implement (out of this PR; do not edit `MzM-Docs/` here).
7. **Stop** — do not start `/speckit-implement` in this spawn.

## Remediation

Would you like concrete remediation edits for I1 (tasks.md Dependencies wording only)? **Not applied in this analyze commit** — report-only + no product code + no rewrite of `specs/001`–`006`.
