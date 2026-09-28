# Specification Analysis Report

**Feature**: `specs/006-connectors-mcp-events-trust`
**Date**: 2026-09-28
**Branch**: `cursor/p6-analyze-fe1d` (from `origin/master` @ `6f2f9d7f91` / #202 tasks)
**Linear**: **Blocked** — workspace free-issue limit; **no P6 epic / analyze / T### issue ids**; **do not invent ticket numbers**; track via PR only (project **DeepSeek Harness - Cursor** / `P-MOH-2` only — never GrokBot). `taskstoissues` deferred until capacity.
**Prerequisites**: Required artifacts present (`spec.md`, `plan.md`, `tasks.md` + research/data-model/contracts/quickstart/checklists). `check-prerequisites.ps1` not executed (no `pwsh`/`powershell` on this agent host); paths resolved manually.
**Verdict**: **PASS** — 0 CRITICAL; FR coverage **100%**; **implement unlock = Y** after Verifier/Lead analyze gate Pass (Setup T001–T006 then Foundational T007–T016 before US fan-out).

## Findings

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| I1 | Inconsistency | MEDIUM | quickstart.md Scenario 5 vs tasks.md T032 | Quickstart **Scenario 5** = non-goals (SC-005; evidence `non-goals/`). T032 optionally names `scenario-5-credential-ux.md` for US5/SC-007 — same number, different meaning | Prefer fold SC-007 into `scenario-1-connector.md` (T032 primary). If split, name `scenario-credential-ux.md` / `scenario-7-*` — **never** `scenario-5-*` |
| I2 | Inconsistency | MEDIUM | tasks.md Dependencies vs Phase 2 CRITICAL | Phase 2 says no US work until **T007–T016** stamp; Dependencies also say US2 may fan out after **T008/T012/T015** only | Prefer stamp rule: no US1–US5 product work before T016. Treat “after T008/…” as informal Host readiness, not a waiver of T009–T011/T013–T014/T016 |
| I3 | Inconsistency | LOW | spec.md Feature Branch / Status | Still `cursor/p6-clarify-fe1d`; Status Clarified | Cosmetic Spec Kit metadata; not a blocker |
| I4 | Inconsistency | LOW | plan.md Branch / Next (held) / Structure | Branch `cursor/p6-plan-fe1d`; Next still “after plan Verifier: tasks → analyze”; Structure says tasks.md not created by plan | Cosmetic; tasks already merged (#202) |
| I5 | Inconsistency | LOW | tasks.md Branch | Header still `cursor/p6-tasks-fe1d` | Cosmetic after analyze lands |
| I6 | Inconsistency | LOW | MzM-Docs/living-next-gate.md · mzm-bot-plan.md §10 | Living gate still points at P6 **specify**; plan Next still “P6 specify” | Lead/PO living update (out of this analyze PR ownership); next gate = Verifier analyze Pass → implement Setup |
| D1 | Duplication | LOW | T013–T014 / T037 | Progressive no-Electron connector/event/trust bus guard (foundational + polish reconfirm) | Keep; mirrors P3–P5 pattern |
| D2 | Duplication | LOW | US1 auth (T018/T020) / US5 (T031–T032) / SC-007 | Credential UX / vault-optional checked in US1, US5, Scenario 1, and non-goals | Intentional layering; T032 should extend Scenario 1, not invent Scenario 5 |
| A1 | Ambiguity | LOW | T010 / research R2 | Fixture home = `agent-team` **or** desktop test fixture | Acceptable Runtime HOW after T002 inventory |
| A2 | Ambiguity | LOW | FR-006 / T026 | Deny Pass = user-deny **or** standing `never` (either OK) | Locked Architect Path A; Verifier picks one path in Scenario 3 |
| U1 | Underspecification | LOW | T019–T020 / T024 / T027 / Client locales | Exact locale keys for connector/event/deny/auth copy not named | Follow Client i18n standing order at implement |
| U2 | Underspecification | LOW | FR-004 empty-intent reject vs T025 | Host T022 rejects empty intent; Scenario 2 recipe text emphasizes fire/pause/cron, not empty-intent Fail | At T025, require one empty-intent reject observation (or cite Host unit + pane) |
| C1 | Coverage | LOW | Linear taskstoissues | Constitution II expects Linear after tasks; capacity blocks creation | Honest deferral already in tasks.md T040; when capacity returns run `taskstoissues` on **DeepSeek Harness - Cursor** only — no invented ids now |

**Coverage Summary Table:**

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|
| FR-001 | Yes | T017, T019, T021 | Install from catalog/fixture |
| FR-002 | Yes | T018, T020, T031 | Auth → ready; no chat-paste primary |
| FR-003 | Yes | T018, T020, T021 | Successful tool call; wording not scored |
| FR-004 | Yes | T022, T025 | Event create + empty-intent reject (see U2) |
| FR-005 | Yes | T023–T025 | Harness fire + last-run + pause suppress |
| FR-006 | Yes | T026–T028 | Deny path + Client UI + Scenario 3 |
| FR-007 | Yes | T029–T030 | Secrets absent from dumps |
| FR-008 | Yes | T011, T029, T031 | In-app primary; secrets off renderer SoT |
| FR-009 | Yes | T031–T033 | Vault optional / not mandatory Pass |
| FR-010 | Yes | T033 | No P7 Box/Shell |
| FR-011 | Yes | T033, T038 | No rewrite `specs/001`–`005`; cron remains |
| FR-012 | Yes | T033 | No full catalog / send-on-behalf / voice |
| FR-013 | Yes | T021, T025, T028, T030, T035 | Documented Verifier path |
| FR-014 | Yes | T006, T021, T025, T028, T032, T034–T035 | SO 11 desktop visual |
| FR-015 | Yes | T006, T021, T025, T028, T032, T034–T035 | SO 12 commit + PR embeds |
| FR-016 | Yes | T018, T021 | LLM wording not scored |
| FR-017 | Yes | T010, T017, T021 | Any-one thin catalog / fixture |
| FR-018 | Yes | T015, T022–T023, T025 | Webhook harness Pass only |
| SC-001 | Yes | T017–T021 | Connector install→auth→tool |
| SC-002 | Yes | T022–T025 | Event create + fire + pause |
| SC-003 | Yes | T026–T028 | Denied-permission path |
| SC-004 | Yes | T029–T030 | Secrets-absent dump |
| SC-005 | Yes | T033 | Non-goals absences |
| SC-006 | Yes | T035 | Full Phase 6 replay |
| SC-007 | Yes | T031–T032 (also T021) | Credential UX / vault optional |
| SC-008 | Yes | T025, T033 | Cron additive / still usable |

**User-story → tasks:**

| Story | Tasks | Independent test |
|-------|-------|------------------|
| US1 Connector | T017–T021 | Install + auth ready + successful tool |
| US2 Event routine | T022–T025 | Create + harness fire + last-run + pause |
| US3 Deny | T026–T028 | One deny distinct from success |
| US4 Secrets | T029–T030 | Dump inspection |
| US5 Credential UX | T031–T032 | In-app UX; vault not mandatory |

**Constitution Alignment Issues:** None CRITICAL (I–V + Stack PASS).

- **I Wedge-First**: Thin catalog + harness event + one deny + secrets hygiene toward C; no full Grok/P7 theater.
- **II Spec-Driven**: specify→clarify→plan→tasks→analyze honored; Linear deferred honestly (C1) — no invented ids.
- **III Product Over Theater**: One real connector path, one harness fire, one deny, secrets-absent — vault/live families deferred.
- **IV Verify Against Spec**: SC-001…008 + FR-014/015 + Verifier recipes T021/T025/T028/T030/T032/T033/T035.
- **V Seam Honesty**: Architect Path A (Host SoT, B1 wake, additive RoutineRecord, either deny, fixture+in-app, no Main bus) encoded in T005/T007–T016/T037/T039 + research R0–R6.
- **Stack**: DSH + Electron dual-process + Spec Kit; Linear after capacity.

**Unmapped Tasks:** None material — T001–T006 (setup), T016 (foundational stamp), T033–T040 (polish / evidence / non-regression / Linear note) support delivery process.

**Metrics:**

- Total Requirements (FR): **18**
- Total Success Criteria (buildable): **8**
- Total Tasks: **40** (T001–T040)
- Coverage % (FR with ≥1 task): **100%**
- Ambiguity Count: **2** (LOW)
- Duplication Count: **2** (LOW)
- Inconsistency Count: **6** (2 MEDIUM, 4 LOW)
- Underspecification Count: **2** (LOW)
- Coverage notes: **1** (LOW — Linear deferral)
- Critical Issues Count: **0**

## Linear taskstoissues map

**Not filed.** Free-issue limit blocks P6 epic and T001–T040 children. Do **not** invent MOH-* ids. When capacity returns: parent epic on **DeepSeek Harness - Cursor**, then `taskstoissues` for T001–T040; never **DeepSeek Harness - GrokBot**.

## Severity summary

| Severity | Count | IDs |
|----------|------:|-----|
| CRITICAL | 0 | — |
| HIGH | 0 | — |
| MEDIUM | 2 | I1, I2 |
| LOW | 11 | I3–I6, D1–D2, A1–A2, U1–U2, C1 |

**Implement unlock: Y** — 0 CRITICAL; FR/SC coverage complete; MEDIUM items are naming/dependency clarifications for Setup/Foundational (fix at T006/T016/T025/T032 — no re-specify required).

## Next Actions

1. **PO / Verifier analyze gate** on this report — do **not** kick implement until Pass (or Lead confirm).
2. On gate Pass: implement Setup **T001–T006**, then Foundational **T007–T016** (stamp), then US1→US5 per tasks.md.
3. At T006/T032: lock Scenario numbering — Scenario 5 = non-goals only; credential UX stays on Scenario 1 (or non-`5` filename).
4. At T016: enforce no US product work before foundational stamp (supersedes informal T008/T012/T015 fan-out note).
5. When Linear capacity returns: `taskstoissues` under **DeepSeek Harness - Cursor** only.
6. Lead/PO: refresh `MzM-Docs/living-next-gate.md` to analyze Pass → implement (out of this PR).

## Remediation

Would you like concrete remediation edits for I1/I2 (quickstart/tasks wording only)? **Not applied in this analyze commit** — report-only + no product code.
