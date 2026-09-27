# Scenario 5 — Full Phase 4 Verifier replay (SC-005)

**Status:** Recipe + composite SC-005 Pass stamped — see [evidence/scenario-5/VERDICT.txt](./evidence/scenario-5/VERDICT.txt)
**Owners:** DH Verifier (this recipe + composite evidence) · DH Runtime / Client / Electron (slice owners under Scenarios 1–4) · PO (scope)
**Linear:** T031 [MOH-224](https://linear.app/momadhoun/issue/MOH-224) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance slice:** T031 — Verifier Scenario 5 recipe covering FR-010/011 / SC-005
**Companion:** T029 — non-goals in [non-goals.md](./non-goals.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 5
**Spec:** [../spec.md](../spec.md) SC-005 · FR-010 · FR-011
**Gate:** **Foundational Pass (T014) MUST hold before any Scenario 5 evidence counts toward product SC Done** ([README foundational Pass](./README.md#foundational-pass-checklist--recorded))
**Non-goals:** [non-goals.md](./non-goals.md) — absence checks must remain green; do not Fail Pass for Out of Scope absence
**Evidence:** `evidence/scenario-5/` (T030 placeholders + this stamp)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents the ordered FR-010/011 path + Pass/Fail + stamp template |
| SC coverage | SC-005 composite: re-run Scenarios 1–3 on the **real desktop app** + Scenario 4 absence + foundational stamp |
| Hard gate | Foundational Pass (T014) recorded Pass before product replay counts |
| Desktop visual | FR-010/011 screenshots and/or recordings committed under `verifier/evidence/` + PR embeds (SO 11+12) |
| Product SC stamp | See `evidence/scenario-5/VERDICT.txt` — honest measured / blocked rows only |

---

## What this recipe proves (SC-005 / FR-010/011)

DH Verifier re-runs the documented Phase 4 acceptance path on the real desktop app and records pass/fail against [spec.md](../spec.md):

| Order | Action | Scenario recipe | Product SC |
|-------|--------|-----------------|------------|
| **Gate** | Foundational Pass (T014) | [README.md](./README.md#foundational-pass-checklist--recorded) | Foundations only — **required Pass first** |
| 1 | Create + pane list (+ durability) | [scenario-1-create-list.md](./scenario-1-create-list.md) · [scenario-2-pane-list.md](./scenario-2-pane-list.md) | SC-001, SC-006, SC-007 · FR-002 |
| 2 | Pause / resume | [scenario-3-pause-resume.md](./scenario-3-pause-resume.md) | SC-002 |
| 3 | Cron fire + last-run | [scenario-4-cron-fire.md](./scenario-4-cron-fire.md) | SC-003 |
| Cross-cut | Non-goals / seam absence | [non-goals.md](./non-goals.md) · [schedule-not-routines.md](./schedule-not-routines.md) | SC-004 (must stay absent) |

**Hard gate:** If foundational Pass evidence is missing or Fail, stamp Scenario 5 `VERDICT: Blocked` and stop. Do **not** treat partial US recipes as SC-005 Pass.

**Fail rules:**

1. Fail SC-005 if foundational Pass (T014) is not Pass on the checkout under test.
2. Fail SC-005 if the real desktop path cannot exercise create/list → pause/resume → fire/last-run without developer tooling (FR-010).
3. Fail SC-005 if any product Scenario 1–3 required for Phase 4 exit is Fail on the same SHA without an explicit Deferred/Blocked stamp naming the gap.
4. Fail SC-005 if Scenario 4 / non-goals is Fail (Out of Scope treated as required).
5. Fail if Pass evidence required an Out of Scope surface — see [non-goals.md](./non-goals.md).
6. Fail if Pass was claimed via Schedule overlay / Electron Main bus / jobs-as-catalog SoT.

Does **not** by itself re-open US1–US4 implementation. Recipe presence alone is **not** SC-005 Done. Do **not** invent new product code in this task.

---

## Scope and prerequisites

| Layer | Required for | Status at T031 polish |
|-------|--------------|------------------------|
| Foundational Pass (T014) | Any product SC / SC-005 | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Scenario 1 create (T018 01–03) | Full SC-001 | **measured:** Pass under `evidence/scenario-1/` (`01–03` + create walkthrough) |
| Scenario 1 pane durability (T021) | FR-002 half | **measured:** Pass under `evidence/scenario-1/` |
| Scenario 2 pause/resume (T024) | SC-002 | **measured:** Pass under `evidence/scenario-2/` |
| Scenario 3 cron fire (T028) | SC-003 | **measured:** Pass under `evidence/scenario-3/` |
| Scenario 4 + non-goals (T029) | Cross-cut absence | **measured:** [non-goals.md](./non-goals.md) + T033/T034 logs |
| Optional T026 jobs | Not required | **left unchecked** |

**Desktop prerequisites** (full Scenario 5 / SC-005 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1–P3 bots; display available (`DISPLAY` or `xvfb-run`); Scenarios 1–3 recipes present with FR-010 media; foundational Pass holds.

---

## Ordered Phase 4 path (quickstart Scenario 5)

Run in order. Stop and stamp Fail/Blocked on the first hard-gate failure.

| Step | Action | Exit condition | Evidence home |
|------|--------|----------------|---------------|
| 0 | Re-confirm foundational Pass (T014) | Foundations Pass | [README.md](./README.md#foundational-pass-checklist--recorded) |
| 1 | Scenario 1 — create + pane list | SC-001/006/007 Pass or Deferred with reason | [evidence/scenario-1/](./evidence/scenario-1/) |
| 2 | Scenario 2 — pause / resume | SC-002 Pass or Deferred with reason | [evidence/scenario-2/](./evidence/scenario-2/) |
| 3 | Scenario 3 — cron fire + last-run | SC-003 Pass or Deferred with reason | [evidence/scenario-3/](./evidence/scenario-3/) |
| 4 | Scenario 4 / non-goals absence spot-check | T029 rows still hold; no Out of Scope required | [evidence/non-goals/](./evidence/non-goals/) · [non-goals.md](./non-goals.md) |
| 5 | Stamp Scenario 5 composite verdict on **this** SHA | Pass only when gate + required product SCs green on real desktop path | [evidence/scenario-5/](./evidence/scenario-5/) |

Prefer **one Desktop session** covering create → pause/resume → fire indicator when Client surfaces allow. Keyless Host vitest leftovers remain supporting evidence; SC-005 Pass still needs the **real desktop app** path recorded for the interactive half (screenshot/recording or cited existing SO11 media).

---

## Commands (rerunnable)

### Gate — Foundational Pass (required first)

```sh
pnpm exec vitest run packages/experimental/agent-team -t 'routine|Host Routine|exports Team views|createRoutine'
pnpm exec vitest run apps/desktop/tests/no-electron-routines-bus.spec.ts
pnpm exec tsx scripts/persistence-changes.ts
test -f specs/004-routines-cron/verifier/schedule-not-routines.md
test -f specs/004-routines-cron/verifier/optional-jobs-visibility.md
rg -n "export interface RoutineRecord" packages/experimental/agent-team/src/types.ts
```

Confirm [README foundational Pass](./README.md#foundational-pass-checklist--recorded) remains Pass for the tip under test. If Fail or absent → **Blocked** for SC-005.

### Composite pointer — Scenarios 1–3 + non-goals

Execute each scenario’s own Commands / Steps section (authoritative). Minimal pointers:

| Scenario | Open recipe | Notes |
|----------|-------------|-------|
| 1 | [scenario-1-create-list.md](./scenario-1-create-list.md) · [scenario-2-pane-list.md](./scenario-2-pane-list.md) | Create + reject + isolation + durability; evidence `scenario-1/` |
| 2 | [scenario-3-pause-resume.md](./scenario-3-pause-resume.md) | Pause/resume; evidence `scenario-2/` |
| 3 | [scenario-4-cron-fire.md](./scenario-4-cron-fire.md) | Host fire + last-run; evidence `scenario-3/` |
| 4 / Non-goals | [non-goals.md](./non-goals.md) | SC-004 absences; evidence `non-goals/` (alias `scenario-4/`) |

### One-shot wrapper (gate first; then invoke each recipe)

```sh
set -euo pipefail
EVIDENCE=specs/004-routines-cron/verifier/evidence/scenario-5
mkdir -p "$EVIDENCE"
ROOT=specs/004-routines-cron/verifier

# --- Gate: Foundational / Electron bus ---
pnpm exec vitest run apps/desktop/tests/no-electron-routines-bus.spec.ts \
  | tee "$EVIDENCE/vitest-electron-bus.log"
test -f "$ROOT/schedule-not-routines.md"
test -f "$ROOT/non-goals.md"

# --- Scenarios 1–3: follow each recipe (do not invent alternate suites) ---
{
  echo "FOUNDATIONAL_GATE: see README foundational Pass + electron bus log"
  echo "NEXT: cite Scenario 1–3 evidence dirs; stamp VERDICT when complete"
  echo "UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "SHA: $(git rev-parse HEAD)"
} | tee "$EVIDENCE/replay-pointer.log"
```

---

## Desktop visual evidence (mandatory for GUI half)

Standing orders **11** + **12** / FR-010/011:

1. Capture screenshots and/or a short screen recording of the **real Desktop** app for Scenarios 1–3 GUI steps (or cite already-committed media under `evidence/scenario-{1,2,3}/`).
2. Save walkthrough copies under `/opt/cursor/artifacts/` **and** commit under `verifier/evidence/` (prefer scenario homes; Scenario 5 may pointer-cite).
3. GUI PR body MUST embed absolute `/opt/cursor/artifacts/…` paths via HTML `<img>` / `<video controls>`.

Unit/jsdom alone **fails** SC-005 GUI half. Scenario 4 docs/absence does not require screenshots.

---

## Stamp template

Write `evidence/scenario-5/VERDICT.txt` with:

- Tip SHA + UTC
- Foundational Pass row (Pass/Fail)
- Per-scenario rows (Pass / Deferred / Blocked) with evidence paths
- FR-010/011 claim tags (**measured** / **inferred** / **guess**)
- Explicit Blocked reason if SC-001 create media still Pending
- Scope lock: do not mark Linear Done; leave to PO

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 5 | Operator outline |
| [README.md](./README.md) | Foundational Pass + Scenario owners map |
| [non-goals.md](./non-goals.md) | SC-004 |
| [evidence/scenario-5/](./evidence/scenario-5/) | Composite stamp home |
| T031 [MOH-224](https://linear.app/momadhoun/issue/MOH-224) | This recipe |
