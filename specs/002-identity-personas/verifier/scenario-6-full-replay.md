# Scenario 6 — Full Phase 2 Verifier replay (SC-007)

**Status:** Product SC Pass stamped — see [evidence/scenario-6/VERDICT.txt](./evidence/scenario-6/VERDICT.txt)
**Owners:** DH Verifier (this recipe + composite evidence) · DH Runtime / Client / Docs (slice owners under Scenarios 1–5)
**Linear:** [MOH-138](https://linear.app/momadhoun/issue/MOH-138) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** T039 — Verifier Scenario 6 recipe covering FR-012 / SC-007
**Companion:** T040 — complete non-goals absence in [non-goals.md](./non-goals.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 6
**Spec:** [../spec.md](../spec.md) SC-007 · FR-012
**Gate:** **Foundational Pass (T011) MUST hold before any Scenario 6 evidence counts toward product SC Done** ([README foundational Pass](./README.md#foundational-pass-checklist--recorded))
**Non-goals:** [non-goals.md](./non-goals.md) — absence checks must remain green; do not Fail Pass for Out of Scope absence
**Evidence:** `evidence/scenario-6/` (create when replaying; not required for recipe delivery)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents the ordered FR-012 path + Pass/Fail + stamp template |
| SC coverage | SC-007 composite of Scenarios 1–5 on the **real desktop app** (Scenario 5 docs-only half allowed as docs probe) |
| Hard gate | Foundational Pass (T011) recorded Pass before product replay counts |
| Product SC stamp | Deferred until Scenarios 1–5 product/docs Passes hold on the same SHA and Verifier fills the stamp |

---

## What this recipe proves (SC-007 / FR-012)

DH Verifier re-runs the documented Phase 2 acceptance path on the real desktop app and records pass/fail against [spec.md](../spec.md):

| Order | Action (FR-012) | Scenario recipe | Product SC |
|-------|-----------------|-----------------|------------|
| **Gate** | Foundational Pass (T011) | [README.md](./README.md#foundational-pass-checklist--recorded) | Foundations only — **required Pass first** |
| 1 | Create or use existing bot → edit job/voice/anti-jobs → overview anti-jobs | [scenario-1-persona-profile.md](./scenario-1-persona-profile.md) | SC-001, SC-002, SC-008 |
| 2 | Rename + preset avatar | [scenario-2-rename-avatar.md](./scenario-2-rename-avatar.md) | SC-003 |
| 3 | Assign named sidebar section (Unassigned remains valid for others) | [scenario-3-sidebar-sections.md](./scenario-3-sidebar-sections.md) | SC-004 |
| 4 | Delete confirm → cancel → confirm | [scenario-4-delete-confirm.md](./scenario-4-delete-confirm.md) | SC-005 |
| 5 | Memory ADR presence + no memory UX required | [scenario-5-memory-adr.md](./scenario-5-memory-adr.md) | SC-006 (docs) |
| Cross-cut | Non-goals absence | [non-goals.md](./non-goals.md) | Out of Scope (must stay absent) |

**Hard gate:** If foundational Pass evidence is missing or Fail, stamp Scenario 6 `VERDICT: Blocked` and stop. Do **not** treat partial US recipes as SC-007 Pass.

**Fail rules:**

1. Fail SC-007 if foundational Pass (T011) is not Pass on the checkout under test.
2. Fail SC-007 if the real desktop path cannot exercise create/use → rename → persona edit → avatar → section assign → overview anti-jobs → delete confirm/cancel/confirm without developer tooling (FR-012).
3. Fail SC-007 if any product Scenario 1–4 required for Phase 2 exit is Fail on the same SHA without an explicit Deferred/Blocked stamp naming the gap.
4. Fail SC-007 if Scenario 5 / SC-006 is Fail (ADR missing or memory product UX treated as required).
5. Fail if Pass evidence required an Out of Scope surface — see [non-goals.md](./non-goals.md).

Does **not** by itself re-open US1–US5 implementation. Does **not** replace T042 (quickstart ↔ recipe gap fixes). Recipe presence alone is **not** SC-007 Done.

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T011) | Any product SC / SC-007 | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Scenarios 1–4 recipes | Interactive FR-012 half | **measured:** recipes landed (T019 / T025 / T035 / T030) |
| Scenario 5 recipe + ADR | SC-006 | **measured:** recipe + ADR on master tip after [#96](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/96) / [#97](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/97) |
| Non-goals complete (T040) | Cross-cut absence | **measured:** [non-goals.md](./non-goals.md) (this polish PR) |
| Product Client surfaces (US1–US4) | Full SC-007 desktop Pass | **inferred:** open until each story’s Client + Verifier stamps land |

**Desktop prerequisites** (full Scenario 6 / SC-007 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot; display available (`DISPLAY` or `xvfb-run`); Scenarios 1–5 recipes present; foundational Pass holds.

**Recipe-only delivery** (this PR): documents how to Pass SC-007 once product slices stamp; does **not** alone mark SC-007 Done.

---

## Fixtures (deterministic strings)

Prefer one bot through the interactive half so Pass/Fail diffs stay greppable. Align with slice recipes when those prescribe values:

| Role | Value |
|------|--------|
| Bot `displayName` (create / first) | `Replay Bot` |
| Rename target | `Replay Renamed` |
| Persona first save | job `review PRs` · voice `terse` · antiJobs `["merge without review"]` |
| Avatar | preset shape and/or color (Scenario 2 markers) |
| Named section | `Replay Section` |
| Delete confirm probe | same bot after cancel-safe check |

Scenario 5 remains docs-only (ADR path + non-goal); no recall demo.

---

## Ordered Phase 2 path (quickstart Scenario 6)

Run in order. Stop and stamp Fail/Blocked on the first hard-gate failure.

| Step | Action | Exit condition | Evidence home |
|------|--------|----------------|---------------|
| 0 | Re-confirm foundational Pass (T011) | Foundations Pass | [README.md](./README.md#foundational-pass-checklist--recorded) |
| 1 | Scenario 1 — persona + overview anti-jobs (+ SC-008 wiring) | SC-001/002/008 Pass or Deferred with reason | Scenario 1 recipe |
| 2 | Scenario 2 — rename + preset avatar | SC-003 Pass or Deferred with reason | Scenario 2 recipe |
| 3 | Scenario 3 — sidebar section assign | SC-004 Pass or Deferred with reason | Scenario 3 recipe |
| 4 | Scenario 4 — delete confirm / cancel / confirm | SC-005 Pass or Deferred with reason | Scenario 4 recipe |
| 5 | Scenario 5 — memory ADR + no memory UX | SC-006 Pass | Scenario 5 recipe |
| 6 | Non-goals absence spot-check | T040 rows still hold; no Out of Scope required | [non-goals.md](./non-goals.md) |
| 7 | Stamp Scenario 6 composite verdict on **this** SHA | Pass only when gate + required product/docs SCs green on real desktop path | `evidence/scenario-6/` |

Prefer **one Desktop session** covering create/use → rename → persona edit → avatar → section assign → overview anti-jobs → delete confirm/cancel/confirm when Client surfaces allow. Scenario 5 may run as a repo docs probe in the same replay. Keyless Host vitest leftovers remain supporting evidence; SC-007 Pass still needs the **real desktop app** path recorded for the interactive half (screenshot/trace or operator note).

---

## Commands (rerunnable)

### Gate — Foundational Pass (required first)

```sh
pnpm exec vitest run apps/desktop/tests/no-electron-identity-bus.spec.ts
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/agent-team/tests/projection-events.spec.ts
test -f specs/002-identity-personas/verifier/instruction-bind.md
```

Confirm [README foundational Pass](./README.md#foundational-pass-checklist--recorded) remains Pass for the tip under test. If Fail or absent → **Blocked** for SC-007.

### Composite pointer — Scenarios 1–5 + non-goals

Execute each scenario’s own Commands / Steps section (authoritative). Minimal pointers:

| Scenario | Open recipe | Notes |
|----------|-------------|-------|
| 1 | [scenario-1-persona-profile.md](./scenario-1-persona-profile.md) | Persona persist + overview anti-jobs; SC-008 wiring only |
| 2 | [scenario-2-rename-avatar.md](./scenario-2-rename-avatar.md) | Preset markers; upload not required |
| 3 | [scenario-3-sidebar-sections.md](./scenario-3-sidebar-sections.md) | Named section + Unassigned |
| 4 | [scenario-4-delete-confirm.md](./scenario-4-delete-confirm.md) | Confirm / cancel / confirm; wipe not a Pass gate |
| 5 | [scenario-5-memory-adr.md](./scenario-5-memory-adr.md) | ADR presence; no recall demo |
| Non-goals | [non-goals.md](./non-goals.md) | T024 / T038 / T040 rows |

### One-shot wrapper (gate first; then invoke each recipe)

```sh
set -euo pipefail
EVIDENCE=specs/002-identity-personas/verifier/evidence/scenario-6
mkdir -p "$EVIDENCE"
ROOT=specs/002-identity-personas/verifier

# --- Gate: Foundational Pass commands ---
pnpm exec vitest run apps/desktop/tests/no-electron-identity-bus.spec.ts \
  | tee "$EVIDENCE/vitest-no-electron-identity-bus.log"
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/agent-team/tests/projection-events.spec.ts \
  | tee "$EVIDENCE/vitest-agent-team-foundations.log"
test -f "$ROOT/instruction-bind.md"

# --- Scenarios 1–5: follow each recipe (do not invent alternate suites) ---
{
  echo "FOUNDATIONAL_GATE: see README foundational Pass + logs above"
  echo "NEXT: run Scenario 1–5 recipe steps; stamp this VERDICT when complete"
  echo "UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "SHA: $(git rev-parse HEAD)"
} | tee "$EVIDENCE/replay-pointer.log"
```

After the gate, run Scenario 1–5 recipes in order and copy their verdicts into the Scenario 6 stamp. Do not mark SC-007 Pass from the pointer log alone.

### Optional live Desktop operator path (FR-012)

1. Launch Desktop under test.
2. Create or select bot **Replay Bot**.
3. Edit job/voice/anti-jobs; save; confirm overview shows anti-jobs (Scenario 1).
4. Rename → **Replay Renamed**; set preset avatar; confirm sidebar/overview (Scenario 2).
5. Assign to **Replay Section**; confirm sidebar membership (Scenario 3).
6. Start delete → cancel (bot intact) → delete → confirm (bot gone from sidebar/overview/section) (Scenario 4).
7. Confirm ADR under `MzM-Docs/adr/` + non-goals (Scenario 5 + T040).
8. Capture screenshot/trace + operator note under `evidence/scenario-6/`.
9. Fail immediately if any step required Electron Main identity bus, image upload, skills library, memory product UX, transcript wipe, P1 re-litigation, or Grok chrome parity.

---

## Assert checklist (all required for SC-007 Pass)

| # | Criterion | How measured | Required |
|---|-----------|--------------|----------|
| 1 | Foundational Pass (T011) **Pass** before product replay | README stamp + optional re-run | Yes (**hard gate**) |
| 2 | Scenario 1 / SC-001–002–008 Pass or documented Deferred with named gap | Scenario 1 recipe | Yes for Phase 2 exit; Deferred only with named gap |
| 3 | Scenario 2 / SC-003 Pass or Deferred with named gap | Scenario 2 recipe | Yes for Phase 2 exit |
| 4 | Scenario 3 / SC-004 Pass or Deferred with named gap | Scenario 3 recipe | Yes for Phase 2 exit |
| 5 | Scenario 4 / SC-005 Pass or Deferred with named gap | Scenario 4 recipe | Yes for Phase 2 exit |
| 6 | Scenario 5 / SC-006 Pass | Scenario 5 recipe (ADR + non-goal) | Yes |
| 7 | Real desktop app path exercised for interactive half (not mock-only) | Operator note / screenshot / trace under `evidence/scenario-6/` | Yes for SC-007 Pass |
| 8 | Non-goals remain absent (T040) | [non-goals.md](./non-goals.md) | Yes |

**Claim tags:** label every SC-007 claim **measured** / **inferred** / **guess**. SC-007 Pass requires **measured** foundational Pass plus **measured** desktop-path evidence for the interactive FR-012 path under test.

| Outcome | When |
|---------|------|
| **Pass (SC-007)** | Criteria 1 + 6–8 green; criteria 2–5 Pass (or explicitly Deferred only when program policy allows named live gap); real desktop evidence under `evidence/scenario-6/`; composite `VERDICT: Pass` |
| **Fail (SC-007)** | Foundational Fail; or required product Scenario Fail; or desktop path cannot complete FR-012; or Out of Scope required |
| **Deferred (SC-007)** | Recipe present (T039) but full replay not yet run on this SHA — stamp `VERDICT: Deferred` + `DEFER_REASON`. **Does not** mark SC-007 Done |
| **Blocked** | Foundational Pass missing/Fail; Desktop unusable; or required US Client slices absent from checkout |

---

## Pass stamp template (fill when evidence lands)

```text
VERDICT: Pass
SC: SC-007
SHA: 144a871133652f2f3b8a65fb9bf8bec5acb5de6b
BRANCH: cursor/p2-verifier-desktop-stamps-92fa
UTC: 2026-09-27T14:48:31Z
OPERATOR: DH Verifier (Composer; acting as Mohammed)
LINEAR: MOH-138 · Epic MOH-88
RECIPE: specs/002-identity-personas/verifier/scenario-6-full-replay.md
FOUNDATIONAL_T011: Pass
SCENARIO_1: Pass
SCENARIO_2: Pass
SCENARIO_3: Pass
SCENARIO_4: Pass
SCENARIO_5: Pass
NON_GOALS: Pass
LIVE_DESKTOP: Pass
EVIDENCE: evidence/scenario-6/
CLAIM: measured
DEFER_REASON: N/A
BLOCKER: none
SCOPE_OUT: skills/memory UX/upload/wipe/P1 re-litigation/Grok chrome/LLM reply adherence
LINEAR_STATUS: leave MOH-138 In Progress until PO merges (do not Done; do not merge)
```

**Rule:** Do not mark SC-007 Done in Linear / Spec without a filled stamp that includes (1) foundational Pass, (2) Scenarios 1–5 exits on the same tip, (3) non-goals green, and (4) real desktop evidence for the interactive FR-012 path. This recipe alone does **not** close Phase 2.

---

## Explicit non-goals

- Implementing Client/Host product surfaces (US1–US4) in this Verifier PR
- Creating or editing `MzM-Docs/adr/**` (Spec T036 — already landed; Scenario 5 owns presence checks)
- Skills library (P3), memory productization UX (P5), image-file avatar upload, transcript/mailbox wipe as Pass gates
- Re-litigating P1 topology / mailbox / auth acceptance
- Grok chrome parity
- Marking SC-001…SC-006 Done from this composite recipe without per-scenario stamps

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 6 | User-facing outline |
| [../spec.md](../spec.md) FR-012 / SC-007 | Acceptance |
| [README.md](./README.md) | Scenario owners map + foundational Pass gate |
| [scenario-1-persona-profile.md](./scenario-1-persona-profile.md) … [scenario-5-memory-adr.md](./scenario-5-memory-adr.md) | Slice recipes |
| [non-goals.md](./non-goals.md) | T024 / T038 / T040 absence checks |
| This file | T039 rerunnable Scenario 6 recipe |
| T042 | Quickstart ↔ recipe gap fix later |

## Evidence for PO / DH Lead

**Recipe delivered (T039) + non-goals completed (T040).** Product SC-007 Pass **not** stamped. Full Scenario 6 Done waits on Scenarios 1–5 product/docs Passes on one tip, then Verifier re-run of the ordered path using the stamp template above.
