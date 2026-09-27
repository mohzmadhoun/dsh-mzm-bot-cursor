# Scenario 5 — Full Phase 3 Verifier replay (SC-005)

**Status:** Recipe delivered (T036) — product SC-005 **not** stamped (await Scenario 1–3 Passes on one tip + foundational Pass; Scenario 3 Client stamp may still be open)
**Owners:** DH Verifier (this recipe + composite evidence) · DH Runtime / Client (slice owners under Scenarios 1–3) · PO (scope)
**Linear:** [MOH-183](https://linear.app/momadhoun/issue/MOH-183) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** T036 — Verifier Scenario 5 recipe covering FR-012 / SC-005
**Companion:** T038 — re-validate non-goals in [non-goals.md](./non-goals.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 5
**Spec:** [../spec.md](../spec.md) SC-005 · FR-012
**Gate:** **Foundational Pass (T014) MUST hold before any Scenario 5 evidence counts toward product SC Done** ([README foundational Pass](./README.md#foundational-pass-checklist--recorded))
**Non-goals:** [non-goals.md](./non-goals.md) — absence checks must remain green; do not Fail Pass for Out of Scope absence
**Evidence:** `evidence/scenario-5/` (create when replaying; placeholder README from T035)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents the ordered FR-012 path + Pass/Fail + stamp template |
| SC coverage | SC-005 composite: re-run Scenarios 1–3 on the **real desktop app** with FR-012 evidence |
| Hard gate | Foundational Pass (T014) recorded Pass before product replay counts |
| Product SC stamp | Deferred until Scenarios 1–3 product Passes hold on the same SHA and Verifier fills the stamp |

---

## What this recipe proves (SC-005 / FR-012)

DH Verifier re-runs the documented Phase 3 acceptance path on the real desktop app and records pass/fail against [spec.md](../spec.md):

| Order | Action (FR-012) | Scenario recipe | Product SC |
|-------|-----------------|-----------------|------------|
| **Gate** | Foundational Pass (T014) | [README.md](./README.md#foundational-pass-checklist--recorded) | Foundations only — **required Pass first** |
| 1 | Discover / load thin-pack managed skill | [scenario-1-discover-load.md](./scenario-1-discover-load.md) | SC-001 |
| 2 | Attach / run on a bot (+ per-bot + instruction wiring) | [scenario-2-attach-run.md](./scenario-2-attach-run.md) | SC-002, SC-006, SC-007 |
| 3 | Author skill (+ reject empty) | [scenario-3-skill-authoring.md](./scenario-3-skill-authoring.md) | SC-003 |
| Cross-cut | Thin pack / non-goals absence | [scenario-4-thin-pack.md](./scenario-4-thin-pack.md) · [non-goals.md](./non-goals.md) | SC-004 (must stay absent) |

**Hard gate:** If foundational Pass evidence is missing or Fail, stamp Scenario 5 `VERDICT: Blocked` and stop. Do **not** treat partial US recipes as SC-005 Pass.

**Fail rules:**

1. Fail SC-005 if foundational Pass (T014) is not Pass on the checkout under test.
2. Fail SC-005 if the real desktop path cannot exercise discover/load → attach/run → author (reject empty + happy path) without developer tooling (FR-012).
3. Fail SC-005 if any product Scenario 1–3 required for Phase 3 exit is Fail on the same SHA without an explicit Deferred/Blocked stamp naming the gap.
4. Fail SC-005 if Scenario 4 / non-goals is Fail (Out of Scope treated as required).
5. Fail if Pass evidence required an Out of Scope surface — see [non-goals.md](./non-goals.md).

Does **not** by itself re-open US1–US4 implementation. Recipe presence alone is **not** SC-005 Done.

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T014) | Any product SC / SC-005 | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Scenarios 1–3 recipes | Interactive FR-012 half | **measured:** recipes landed (T019 / T026 / T031) |
| Scenario 4 + non-goals (T033/T034/T038) | Cross-cut absence | **measured:** recipes landed; T038 rows in this polish PR |
| Product Client surfaces (US1–US3) | Full SC-005 desktop Pass | **inferred:** Scenario 1–2 stamped on master; Scenario 3 Client stamp may still be open |

**Desktop prerequisites** (full Scenario 5 / SC-005 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot + P2 identity; display available (`DISPLAY` or `xvfb-run`); Scenarios 1–3 recipes present; foundational Pass holds.

**Recipe-only delivery** (this PR): documents how to Pass SC-005 once product slices stamp; does **not** alone mark SC-005 Done.

---

## Fixtures (deterministic strings)

Prefer one thin-pack path through Scenarios 1–2, then one authored skill for Scenario 3. Align with slice recipes:

| Role | Value |
|------|--------|
| Managed skill id | `mzm-thin-pack` |
| Managed discovery label | `MzM thin pack` |
| Greppable instructional body | `Follow the MzM thin-pack playbook for Pass.` |
| Authored display name | `MzM authored skill` (Scenario 3 fixture) |
| Bot A / Bot B | Two bots for SC-006 (Scenario 2) |

Do **not** invent a second managed skill for chrome parity ([thin-pack-skill.md](./thin-pack-skill.md)).

---

## Ordered Phase 3 path (quickstart Scenario 5)

Run in order. Stop and stamp Fail/Blocked on the first hard-gate failure.

| Step | Action | Exit condition | Evidence home |
|------|--------|----------------|---------------|
| 0 | Re-confirm foundational Pass (T014) | Foundations Pass | [README.md](./README.md#foundational-pass-checklist--recorded) |
| 1 | Scenario 1 — discover / load | SC-001 Pass or Deferred with reason | [evidence/scenario-1/](./evidence/scenario-1/) |
| 2 | Scenario 2 — attach / run (+ SC-006/007) | SC-002/006/007 Pass or Deferred with reason | [evidence/scenario-2/](./evidence/scenario-2/) |
| 3 | Scenario 3 — author (+ reject empty) | SC-003 Pass or Deferred with reason | [evidence/scenario-3/](./evidence/scenario-3/) |
| 4 | Scenario 4 / non-goals absence spot-check | T033/T038 rows still hold; no Out of Scope required | [evidence/non-goals/](./evidence/non-goals/) · [non-goals.md](./non-goals.md) |
| 5 | Stamp Scenario 5 composite verdict on **this** SHA | Pass only when gate + required product SCs green on real desktop path | [evidence/scenario-5/](./evidence/scenario-5/) |

Prefer **one Desktop session** covering discover/load → attach/run → author when Client surfaces allow. Keyless Host vitest leftovers remain supporting evidence; SC-005 Pass still needs the **real desktop app** path recorded for the interactive half (screenshot/recording or operator note).

---

## Commands (rerunnable)

### Gate — Foundational Pass (required first)

```sh
pnpm exec vitest run apps/desktop-host/tests/managed-skills.spec.ts \
  apps/desktop/tests/no-electron-skills-bus.spec.ts
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'persists attachSkill'
test -f apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
test -f specs/003-skills-ux/verifier/instruction-bind.md
rg -n 'Follow the MzM thin-pack playbook for Pass\.' \
  apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
```

Confirm [README foundational Pass](./README.md#foundational-pass-checklist--recorded) remains Pass for the tip under test. If Fail or absent → **Blocked** for SC-005.

### Composite pointer — Scenarios 1–3 + non-goals

Execute each scenario’s own Commands / Steps section (authoritative). Minimal pointers:

| Scenario | Open recipe | Notes |
|----------|-------------|-------|
| 1 | [scenario-1-discover-load.md](./scenario-1-discover-load.md) | Discover + available-to-attach + persist |
| 2 | [scenario-2-attach-run.md](./scenario-2-attach-run.md) | Attach + run/active + SC-006/007; no LLM score |
| 3 | [scenario-3-skill-authoring.md](./scenario-3-skill-authoring.md) | Reject empty + author + discovery |
| 4 / Non-goals | [scenario-4-thin-pack.md](./scenario-4-thin-pack.md) · [non-goals.md](./non-goals.md) | Thin pack count + T033/T038 absences |

### One-shot wrapper (gate first; then invoke each recipe)

```sh
set -euo pipefail
EVIDENCE=specs/003-skills-ux/verifier/evidence/scenario-5
mkdir -p "$EVIDENCE"
ROOT=specs/003-skills-ux/verifier

# --- Gate: Foundational Pass commands ---
pnpm exec vitest run apps/desktop-host/tests/managed-skills.spec.ts \
  apps/desktop/tests/no-electron-skills-bus.spec.ts \
  | tee "$EVIDENCE/vitest-foundations.log"
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  -t 'persists attachSkill' \
  | tee "$EVIDENCE/vitest-attachSkill.log"
test -f apps/desktop-host/managed-skills/mzm-thin-pack/SKILL.md
test -f "$ROOT/instruction-bind.md"

# --- Scenarios 1–3: follow each recipe (do not invent alternate suites) ---
{
  echo "FOUNDATIONAL_GATE: see README foundational Pass + logs above"
  echo "NEXT: run Scenario 1–3 recipe steps; stamp this VERDICT when complete"
  echo "UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "SHA: $(git rev-parse HEAD)"
} | tee "$EVIDENCE/replay-pointer.log"
```

After the gate, run Scenario 1–3 recipes in order and copy their verdicts into the Scenario 5 stamp. Do not mark SC-005 Pass from the pointer log alone.

### Optional live Desktop operator path (FR-012)

1. Launch Desktop under test.
2. Open skills discovery; confirm `MzM thin pack`; make available to attach (Scenario 1).
3. Attach to bot A; confirm bot B not attached; run/active UI; restart retains (Scenario 2).
4. Reject empty author save; author non-empty skill; see in discovery (Scenario 3).
5. Confirm thin-pack / non-goals absences (Scenario 4 + T038).
6. Capture screenshot/recording + operator note under `evidence/scenario-5/` (or link Scenario 1–3 evidence on same tip).
7. Fail immediately if any step required full catalog, learn-from-demo, plugin skills, memory UX, routines, MCP, Box/Shell, detach-as-Pass-gate, Electron skills bus, or LLM reply wording.

---

## Assert checklist (all required for SC-005 Pass)

| # | Criterion | How measured | Required |
|---|-----------|--------------|----------|
| 1 | Foundational Pass (T014) **Pass** before product replay | README stamp + optional re-run | Yes (**hard gate**) |
| 2 | Scenario 1 / SC-001 Pass or documented Deferred with named gap | Scenario 1 recipe | Yes for Phase 3 exit; Deferred only with named gap |
| 3 | Scenario 2 / SC-002 (+ SC-006/007) Pass or Deferred with named gap | Scenario 2 recipe | Yes for Phase 3 exit |
| 4 | Scenario 3 / SC-003 Pass or Deferred with named gap | Scenario 3 recipe | Yes for Phase 3 exit |
| 5 | Real desktop app path exercised for interactive half (not mock-only) | Operator note / screenshot / recording under `evidence/scenario-5/` or linked Scenario 1–3 dirs | Yes for SC-005 Pass |
| 6 | Non-goals remain absent (T033 / T038) | [non-goals.md](./non-goals.md) | Yes |

**Claim tags:** label every SC-005 claim **measured** / **inferred** / **guess**. SC-005 Pass requires **measured** foundational Pass plus **measured** desktop-path evidence for the interactive FR-012 path under test.

| Outcome | When |
|---------|------|
| **Pass (SC-005)** | Criteria 1 + 5–6 green; criteria 2–4 Pass (or explicitly Deferred only when program policy allows named live gap); real desktop evidence; composite `VERDICT: Pass` |
| **Fail (SC-005)** | Foundational Fail; or required product Scenario Fail; or desktop path cannot complete FR-012; or Out of Scope required |
| **Deferred (SC-005)** | Recipe present (T036) but full replay not yet run on this SHA — stamp `VERDICT: Deferred` + `DEFER_REASON`. **Does not** mark SC-005 Done |
| **Blocked** | Foundational Pass missing/Fail; Desktop unusable; or required US Client slices absent from checkout |

---

## Pass stamp template (fill when evidence lands)

```text
VERDICT: Pass
SC: SC-005
SHA: <fill>
BRANCH: <fill>
UTC: <fill>
OPERATOR: DH Verifier
LINEAR: MOH-183 · Epic MOH-142
RECIPE: specs/003-skills-ux/verifier/scenario-5-full-replay.md
FOUNDATIONAL_T014: Pass
SCENARIO_1: Pass
SCENARIO_2: Pass
SCENARIO_3: Pass
NON_GOALS: Pass
LIVE_DESKTOP: Pass
EVIDENCE: evidence/scenario-5/
CLAIM: measured
DEFER_REASON: N/A
BLOCKER: none
SCOPE_OUT: full-catalog/learn-from-demo/plugin-skills/memory-UX/routines/MCP/Box-Shell/detach-as-Pass-gate/LLM reply adherence
LINEAR_STATUS: leave MOH-183 In Progress until PO merges (do not Done; do not merge)
```

**Rule:** Do not mark SC-005 Done in Linear / Spec without a filled stamp that includes (1) foundational Pass, (2) Scenarios 1–3 exits on the same tip, (3) non-goals green, and (4) real desktop evidence for the interactive FR-012 path. This recipe alone does **not** close Phase 3.

---

## Explicit non-goals

- Implementing Client/Host product surfaces (US1–US4) in this Verifier PR
- Full managed catalog, learn-from-demonstration, plugin/connector skills
- Memory UX, routines, MCP, Box/Shell, detach-as-Pass-gate as Pass requirements
- Scoring LLM reply wording for SC-007
- Marking SC-001…SC-004 Done from this composite recipe without per-scenario stamps

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 5 | User-facing outline |
| [../spec.md](../spec.md) FR-012 / SC-005 | Acceptance |
| [README.md](./README.md) | Scenario owners map + foundational Pass gate |
| [scenario-1-discover-load.md](./scenario-1-discover-load.md) … [scenario-3-skill-authoring.md](./scenario-3-skill-authoring.md) | Slice recipes |
| [scenario-4-thin-pack.md](./scenario-4-thin-pack.md) · [non-goals.md](./non-goals.md) | SC-004 / T033 / T038 |
| [evidence/scenario-5/README.md](./evidence/scenario-5/README.md) | Filename expectations (T035) |
| This file | T036 rerunnable Scenario 5 recipe |
| T037 | Quickstart ↔ recipe cross-links |

## Evidence for PO / DH Lead

**Recipe delivered (T036).** Product SC-005 Pass **not** stamped. Full Scenario 5 Done waits on Scenarios 1–3 product Passes on one tip (including Scenario 3 Client stamp when open), then Verifier re-run of the ordered path using the stamp template above.
