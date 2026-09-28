# Scenario 5 — Full Phase 5 Verifier replay (SC-007)

**Status:** Recipe + composite SC-007 Pass stamped — see [evidence/scenario-5/VERDICT.txt](./evidence/scenario-5/VERDICT.txt)
**Owners:** DH Verifier (this recipe + composite evidence) · DH Runtime / Client / Electron (slice owners under Scenarios 1–4) · PO (scope)
**Linear:** T033 [MOH-271](https://linear.app/momadhoun/issue/MOH-271) · T035 [MOH-273](https://linear.app/momadhoun/issue/MOH-273) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** T033 — Verifier Scenario 5 recipe covering FR-011/012 / SC-007
**Companion:** T035 — `no-electron-memory-bus.spec.ts` reconfirm; T031 — [non-goals.md](./non-goals.md) (polish docs #194)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 5
**Spec:** [../spec.md](../spec.md) SC-007 · FR-010 · FR-011 · FR-012
**Gate:** **Foundational Pass (T013) MUST hold before any Scenario 5 evidence counts toward product SC Done** ([README foundational Pass](./README.md#foundational-pass-checklist--recorded))
**Non-goals:** [contracts/non-goals.md](../contracts/non-goals.md) · Verifier [non-goals.md](./non-goals.md) when merged — absence checks must remain green; do not Fail Pass for Out of Scope absence
**Evidence:** `evidence/scenario-5/` (this stamp)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents the ordered FR-011/012 path + Pass/Fail + stamp template |
| SC coverage | SC-007 composite: Scenarios 1–3 on the **real desktop app** + Scenario 4 absence + foundational stamp |
| Hard gate | Foundational Pass (T013) recorded Pass before product replay counts |
| Desktop visual | FR-011/012 screenshots and/or recordings committed under `verifier/evidence/` + PR embeds (SO 11+12) |
| Bus guard | T035 — `apps/desktop/tests/no-electron-memory-bus.spec.ts` green + host-protocol exclusions hold |
| Product SC stamp | See `evidence/scenario-5/VERDICT.txt` — honest measured / blocked rows only |

---

## What this recipe proves (SC-007 / FR-011/012)

DH Verifier re-runs the documented Phase 5 acceptance path on the real desktop app and records pass/fail against [spec.md](../spec.md):

| Order | Action | Scenario recipe | Product SC |
|-------|--------|-----------------|------------|
| **Gate** | Foundational Pass (T013) | [README.md](./README.md#foundational-pass-checklist--recorded) | Foundations only — **required Pass first** |
| 1 | Write profile / log / note | [scenario-1-write-kinds.md](./scenario-1-write-kinds.md) | SC-001, SC-002, SC-003, SC-009 |
| 2 | Recall after restart | [scenario-2-recall.md](./scenario-2-recall.md) | SC-004 |
| 3 | Agent vs user layers | [scenario-3-layers.md](./scenario-3-layers.md) | SC-005, SC-010 |
| Cross-cut | Non-goals / seam absence | [non-goals.md](./non-goals.md) (when present) · [contracts/non-goals.md](../contracts/non-goals.md) · T011/T035 bus | SC-006, SC-008…010 |

**Hard gate:** If foundational Pass evidence is missing or Fail, stamp Scenario 5 `VERDICT: Blocked` and stop. Do **not** treat partial US recipes as SC-007 Pass.

**Fail rules:**

1. Fail SC-007 if foundational Pass (T013) is not Pass on the checkout under test.
2. Fail SC-007 if the real desktop path cannot exercise write → recall → layers without developer tooling (FR-011).
3. Fail SC-007 if any product Scenario 1–3 required for Phase 5 exit is Fail on the same tip without an explicit Deferred/Blocked stamp naming the gap.
4. Fail SC-007 if Scenario 4 / non-goals is Fail (Out of Scope treated as required).
5. Fail if Pass evidence required an Out of Scope surface — see [contracts/non-goals.md](../contracts/non-goals.md).
6. Fail if Pass was claimed via Electron Main memory bus / transcript dump / Client-only SoT.

Does **not** by itself re-open US1–US5 implementation. Recipe presence alone is **not** SC-007 Done. Do **not** invent new product code in this task.

**Time-boxed composite (allowed):** When a fresh one-session GUI full replay is not feasible, Verifier MAY stamp Pass by (a) citing already-committed Scenario 1–3 Pass stamps + FR-011 media on master, (b) reconfirming T035 bus green, (c) running a measured Desktop smoke that Agent Team + memory surface remain live, and (d) filing Scenario 4 absence via [non-goals.md](./non-goals.md) + contracts + spotcheck. Do **not** invent alternate GUI suites.

---

## Scope and prerequisites

| Layer | Required for | Status at T033 |
|-------|--------------|----------------|
| Foundational Pass (T013) | Any product SC / SC-007 | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · [evidence/foundation-host/](./evidence/foundation-host/) |
| Scenario 1 write kinds (T016/T019/T022) | SC-001…003 | **measured:** Pass under `evidence/scenario-1/` |
| Scenario 2 recall (T026) | SC-004 | **measured:** Pass under `evidence/scenario-2/` |
| Scenario 3 layers (T030) | SC-005 / SC-010 | **measured:** Pass under `evidence/scenario-3/` |
| Scenario 4 + non-goals (T031) | Cross-cut absence | **measured:** [non-goals.md](./non-goals.md) + [evidence/non-goals/](./evidence/non-goals/) (#194) · contracts + T035 bus + spotcheck |
| T035 bus reconfirm | Seam honesty | **measured:** this stamp `vitest-electron-bus.log` |

**Desktop prerequisites** (full Scenario 5 / SC-007 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1–P4 bots; display available (`DISPLAY` or `xvfb-run`); Scenarios 1–3 recipes present with FR-011 media; foundational Pass holds.

---

## Ordered Phase 5 path (quickstart Scenario 5)

Run in order. Stop and stamp Fail/Blocked on the first hard-gate failure.

| Step | Action | Exit condition | Evidence home |
|------|--------|----------------|---------------|
| 0 | Re-confirm foundational Pass (T013) + T035 bus | Foundations Pass; bus 3/3 | [README.md](./README.md#foundational-pass-checklist--recorded) · this dir |
| 1 | Scenario 1 — write profile/log/note | SC-001…003 Pass or Deferred with reason | [evidence/scenario-1/](./evidence/scenario-1/) |
| 2 | Scenario 2 — recall after restart | SC-004 Pass or Deferred with reason | [evidence/scenario-2/](./evidence/scenario-2/) |
| 3 | Scenario 3 — agent vs user layers | SC-005/SC-010 Pass or Deferred with reason | [evidence/scenario-3/](./evidence/scenario-3/) |
| 4 | Scenario 4 / non-goals absence spot-check | T031 rows still hold; no Out of Scope required | [evidence/non-goals/](./evidence/non-goals/) · this dir spotcheck |
| 5 | Stamp Scenario 5 composite verdict on **this** tip | Pass only when gate + required product SCs green on real desktop path | [evidence/scenario-5/](./evidence/scenario-5/) |

Prefer **one Desktop session** covering write → recall → layers when Client surfaces allow. Keyless Host vitest leftovers remain supporting evidence; SC-007 Pass still needs the **real desktop app** path recorded for the interactive half (screenshot/recording or cited existing SO11 media + fresh smoke).

---

## Commands (rerunnable)

### Gate — Foundational Pass + T035 bus (required first)

```sh
pnpm exec vitest run packages/experimental/agent-team -t 'memory|Memory|writeMemory|listMemories'
pnpm exec vitest run apps/desktop/tests/no-electron-memory-bus.spec.ts
test -f specs/005-memory-productization/verifier/memory-inject-bind.md
test -f specs/005-memory-productization/verifier/transcript-not-memory.md
rg -n "export interface MemoryRecord" packages/experimental/agent-team/src/types.ts
rg -n 'memory-catalog|memory-injection' apps/desktop/src/host-protocol.ts
```

Confirm [README foundational Pass](./README.md#foundational-pass-checklist--recorded) remains Pass for the tip under test. If Fail or absent → **Blocked** for SC-007.

### Composite pointer — Scenarios 1–3 + non-goals

Execute each scenario’s own Commands / Steps section (authoritative). Minimal pointers:

| Scenario | Open recipe | Notes |
|----------|-------------|-------|
| 1 | [scenario-1-write-kinds.md](./scenario-1-write-kinds.md) | Profile + log + note; evidence `scenario-1/` |
| 2 | [scenario-2-recall.md](./scenario-2-recall.md) | Cold restart + inject wiring; evidence `scenario-2/` |
| 3 | [scenario-3-layers.md](./scenario-3-layers.md) | Agent isolation + user share + orthogonality; evidence `scenario-3/` |
| 4 / Non-goals | [non-goals.md](./non-goals.md) when present · [contracts/non-goals.md](../contracts/non-goals.md) | SC-006 absences; evidence `non-goals/` (alias `scenario-4/`) |

### One-shot wrapper (gate first; then cite each recipe)

```sh
set -euo pipefail
EVIDENCE=specs/005-memory-productization/verifier/evidence/scenario-5
mkdir -p "$EVIDENCE"
ROOT=specs/005-memory-productization/verifier

# --- Gate: Foundational / Electron bus (T035) ---
pnpm exec vitest run apps/desktop/tests/no-electron-memory-bus.spec.ts \
  | tee "$EVIDENCE/vitest-electron-bus.log"
test -f "$ROOT/transcript-not-memory.md"
test -f specs/005-memory-productization/contracts/non-goals.md

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

Standing orders **11** + **12** / FR-011/012:

1. Capture screenshots and/or a short screen recording of the **real Desktop** app for Scenarios 1–3 GUI steps (or cite already-committed media under `evidence/scenario-{1,2,3}/`).
2. Save walkthrough copies under `/opt/cursor/artifacts/` **and** commit under `verifier/evidence/` (prefer scenario homes; Scenario 5 may pointer-cite + add a fresh SC-007 smoke frame).
3. GUI PR body MUST embed absolute `/opt/cursor/artifacts/…` paths via HTML `<img>` / `<video controls>`.

Unit/jsdom alone **fails** SC-007 GUI half. Scenario 4 docs/absence does not require screenshots.

---

## Stamp template

Write `evidence/scenario-5/VERDICT.txt` with:

- Tip SHA + UTC
- Foundational Pass row (Pass/Fail)
- T035 bus row (Pass/Fail)
- Per-scenario rows (Pass / Deferred / Blocked) with evidence paths
- FR-011/012 claim tags (**measured** / **inferred** / **guess**)
- Explicit Blocked reason if required GUI media still Pending
- Scope lock: do not mark Linear Done; leave to PO

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 5 | Operator outline |
| [README.md](./README.md) | Foundational Pass + Scenario owners map |
| [contracts/non-goals.md](../contracts/non-goals.md) | SC-006 absences |
| [evidence/scenario-5/](./evidence/scenario-5/) | Composite stamp home |
| T033 [MOH-271](https://linear.app/momadhoun/issue/MOH-271) | This recipe |
| T035 [MOH-273](https://linear.app/momadhoun/issue/MOH-273) | Bus reconfirm |
