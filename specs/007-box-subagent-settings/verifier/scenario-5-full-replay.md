# Scenario 5 — Full Phase 7 Verifier replay (SC-006)

**Status:** Recipe delivered (T030) — composite SC-006 product stamp **not claimed** (requires ordered Desktop composite run + `evidence/scenario-5/VERDICT.txt`)
**Owners:** DH Verifier (this recipe + composite evidence) · DH Runtime / Client / Electron (slice owners under Scenarios 1–4) · PO (scope)
**Linear:** [MOH-386](https://linear.app/momadhoun/issue/MOH-386/t030-verifier-scenario-5-full-replay-sc-006) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project `P-MOH-2` only
**Acceptance slice:** T030 — Verifier Scenario 5 recipe covering FR-012 / FR-013 / FR-014 / SC-006
**Companion:** T028 — [non-goals.md](./non-goals.md) · T029 — evidence READMEs · T032 — bus reconfirm
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 5
**Spec:** [../spec.md](../spec.md) SC-006 · FR-012 · FR-013 · FR-014
**Gate:** **Foundational Pass (T015) MUST hold before any Scenario 5 evidence counts toward product SC Done** ([README foundational Pass](./README.md#foundational-pass-checklist--recorded))
**Non-goals:** [contracts/non-goals.md](../contracts/non-goals.md) · Verifier [non-goals.md](./non-goals.md) — absence checks must remain green; do not Fail Pass for Out of Scope absence
**Evidence:** `evidence/scenario-5/` (composite stamp home) + cited GUI slices `shell-box/` · `computer-use/` · `settings/`

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents the ordered FR-012 path + Pass/Fail + stamp template |
| SC coverage | SC-006 composite: Scenarios 1–4 + foundational stamp on the **real desktop app** for GUI slices |
| Hard gate | Foundational Pass (T015) recorded Pass before product replay counts |
| Desktop visual | FR-013/014 screenshots and/or recordings committed under `verifier/evidence/{shell-box,computer-use,settings}/` + PR embeds (SO 11+12) for GUI slices |
| Bus guard | T032 — `apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts` green + host-protocol exclusions hold |
| Product SC stamp | Fill `evidence/scenario-5/VERDICT.txt` only after composite Desktop run — **not** claimed by this recipe-only delivery |

---

## What this recipe proves (SC-006 / FR-012)

DH Verifier re-runs the documented Phase 7 acceptance path on the real desktop app and records pass/fail against [spec.md](../spec.md):

| Order | Action | Scenario recipe | Product SC |
|-------|--------|-----------------|------------|
| **Gate** | Foundational Pass (T015) | [README.md](./README.md#foundational-pass-checklist--recorded) | Foundations only — **required Pass first** |
| 1 | Local Shell/box tool success | [scenario-1-shell-box.md](./scenario-1-shell-box.md) | SC-001 |
| 2 | computerUse screenshot + handoff | [scenario-2-computer-use.md](./scenario-2-computer-use.md) | SC-002 |
| 3 | Settings → Computer rows | [scenario-3-settings-computer.md](./scenario-3-settings-computer.md) | SC-003, SC-004 |
| 4 | Non-goals / seam absence | [non-goals.md](./non-goals.md) · [contracts/non-goals.md](../contracts/non-goals.md) · T014/T032 bus | SC-005 |

**Hard gate:** If foundational Pass evidence is missing or Fail, stamp Scenario 5 `VERDICT: Blocked` and stop. Do **not** treat partial US recipes as SC-006 Pass.

**Fail rules:**

1. Fail SC-006 if foundational Pass (T015) is not Pass on the checkout under test.
2. Fail SC-006 if the real desktop path cannot exercise Shell/box → computerUse → Settings without developer tooling for the GUI half (FR-013).
3. Fail SC-006 if any product Scenario 1–3 required for Phase 7 exit is Fail on the same tip without an explicit Deferred/Blocked stamp naming the gap.
4. Fail SC-006 if Scenario 4 / non-goals is Fail (Out of Scope treated as required).
5. Fail if Pass evidence required an Out of Scope surface — see [non-goals.md](./non-goals.md).
6. Fail if Pass was claimed via Electron Main box/Shell/computerUse bus / Client-only SoT / interactive-browser required / PTC-as-Shell Pass / settings chrome alone = Done.

Does **not** by itself re-open US1–US3 implementation. Recipe presence alone is **not** SC-006 Done. Do **not** invent new product code in this task.

**Time-boxed composite (allowed):** When a fresh one-session GUI full replay is not feasible, Verifier MAY stamp Pass by (a) citing already-committed Scenario 1–3 Pass stamps + FR-013/014 media on master under the three GUI slices, (b) reconfirming T032 bus green, (c) running a measured Desktop smoke that Shell/box + computerUse + Settings → Computer surfaces remain live, and (d) filing Scenario 4 absence via [non-goals.md](./non-goals.md) + contracts + spotcheck. Do **not** invent alternate GUI suites. Do **not** claim product SC-006 Pass on this recipe-only PR without that composite run.

---

## Scope and prerequisites

| Layer | Required for | Status at T030 |
|-------|--------------|----------------|
| Foundational Pass (T015) | Any product SC / SC-006 | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Scenario 1 Shell/box (T016–T019) | SC-001 | **measured:** Pass under [evidence/shell-box/](./evidence/shell-box/) |
| Scenario 2 computerUse (T020–T023) | SC-002 | **measured:** Pass under [evidence/computer-use/](./evidence/computer-use/) |
| Scenario 3 Settings (T024–T027) | SC-003 / SC-004 | **measured:** Pass under [evidence/settings/](./evidence/settings/) |
| Scenario 4 + non-goals (T028) | Cross-cut absence | **recipe:** [non-goals.md](./non-goals.md) + [evidence/non-goals/](./evidence/non-goals/) placeholders |
| T032 bus reconfirm | Seam honesty | Pending polish T032 (Electron) |
| T029 evidence READMEs | FR-014 filename lock | **recipe:** READMEs under each GUI slice |

**Desktop prerequisites** (full Scenario 5 / SC-006 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1–P6 bots; display available (`DISPLAY` or `xvfb-run`); Scenarios 1–3 recipes present with FR-013/014 media; foundational Pass holds.

---

## Ordered Phase 7 path (quickstart Scenario 5)

Run in order. Stop and stamp Fail/Blocked on the first hard-gate failure.

| Step | Action | Exit condition | Evidence home |
|------|--------|----------------|---------------|
| 0 | Re-confirm foundational Pass (T015) + T032 bus | Foundations Pass; bus green | [README.md](./README.md#foundational-pass-checklist--recorded) · this dir |
| 1 | Scenario 1 — local Shell/box tool success | SC-001 Pass or Deferred with reason | [evidence/shell-box/](./evidence/shell-box/) |
| 2 | Scenario 2 — computerUse screenshot + handoff | SC-002 Pass or Deferred with reason | [evidence/computer-use/](./evidence/computer-use/) |
| 3 | Scenario 3 — Settings → Computer rows | SC-003 / SC-004 Pass or Deferred with reason | [evidence/settings/](./evidence/settings/) |
| 4 | Scenario 4 / non-goals absence spot-check | T028 rows still hold; no Out of Scope required | [evidence/non-goals/](./evidence/non-goals/) · this dir spotcheck |
| 5 | Stamp Scenario 5 composite verdict on **this** tip | Pass only when gate + required product SCs green on real desktop path | [evidence/scenario-5/](./evidence/scenario-5/) |

Prefer **one Desktop session** covering Shell/box → computerUse → Settings when Client surfaces allow. Keyless Host vitest leftovers remain supporting evidence; SC-006 Pass still needs the **real desktop app** path recorded for the interactive half (screenshot/recording or cited existing SO11 media + fresh smoke). Scenario 4 docs/absence remains non-GUI OK.

---

## Commands (rerunnable)

### Gate — Foundational Pass + T032 bus (required first)

```sh
pnpm exec vitest run apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts
test -f specs/007-box-subagent-settings/verifier/non-goals.md
test -f specs/007-box-subagent-settings/contracts/non-goals.md
test -f specs/007-box-subagent-settings/verifier/computer-use-pass-provider.md
rg -n 'shell-exec|box-ready|computer-use-control|computer-screenshot|computer-settings-mutate' \
  apps/desktop/src/host-protocol.ts apps/desktop/src/ipc.ts | head -20
```

Confirm [README foundational Pass](./README.md#foundational-pass-checklist--recorded) remains Pass for the tip under test. If Fail or absent → **Blocked** for SC-006.

### Composite pointer — Scenarios 1–4 + non-goals

Execute each scenario’s own Commands / Steps section (authoritative). Minimal pointers:

| Scenario | Open recipe | Notes |
|----------|-------------|-------|
| 1 | [scenario-1-shell-box.md](./scenario-1-shell-box.md) | Local Shell/box success; evidence `shell-box/` |
| 2 | [scenario-2-computer-use.md](./scenario-2-computer-use.md) | Screenshot + handoff; evidence `computer-use/` |
| 3 | [scenario-3-settings-computer.md](./scenario-3-settings-computer.md) | Settings → Computer rows; evidence `settings/` |
| 4 / Non-goals | [non-goals.md](./non-goals.md) · [contracts/non-goals.md](../contracts/non-goals.md) | SC-005 absences; evidence `non-goals/` |

### One-shot wrapper (gate first; then cite each recipe)

```sh
set -euo pipefail
EVIDENCE=specs/007-box-subagent-settings/verifier/evidence/scenario-5
mkdir -p "$EVIDENCE"
ROOT=specs/007-box-subagent-settings/verifier

# --- Gate: Foundational / Electron bus (T032) ---
pnpm exec vitest run apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts \
  | tee "$EVIDENCE/vitest-electron-bus.log"
test -f "$ROOT/non-goals.md"
test -f specs/007-box-subagent-settings/contracts/non-goals.md

# --- Scenarios 1–4: follow each recipe (do not invent alternate suites) ---
{
  echo "FOUNDATIONAL_GATE: see README foundational Pass + electron bus log"
  echo "NEXT: cite Scenario 1–3 evidence dirs + Scenario 4 non-goals; stamp VERDICT when composite Desktop run complete"
  echo "UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "SHA: $(git rev-parse HEAD)"
  echo "SC-006_PRODUCT_PASS: not claimed until VERDICT.txt filled after composite Desktop evidence"
} | tee "$EVIDENCE/replay-pointer.log"
```

---

## Desktop visual evidence (mandatory for GUI half)

Standing orders **11** + **12** / FR-013/014:

1. Capture screenshots and/or a short screen recording of the **real Desktop** app for Scenarios 1–3 GUI steps (or cite already-committed media under `evidence/{shell-box,computer-use,settings}/` — see T029 READMEs).
2. Save walkthrough copies under `/opt/cursor/artifacts/` **and** commit under `verifier/evidence/` (prefer scenario homes; Scenario 5 may pointer-cite + add a fresh SC-006 smoke frame under `evidence/scenario-5/`).
3. GUI PR body MUST embed absolute `/opt/cursor/artifacts/…` paths via HTML `<img>` / `<video controls>`.

Unit/jsdom alone **fails** SC-006 GUI half. Scenario 4 docs/absence does not require screenshots.

**Required GUI slice filenames** (locked by T029):

| Slice | Minimum media |
|-------|---------------|
| [evidence/shell-box/](./evidence/shell-box/) | `01-shell-box-ready.png` · `02-shell-box-success.png` (+ optional not-ready / walkthrough) |
| [evidence/computer-use/](./evidence/computer-use/) | `01-computer-use-observation.png` · `02-computer-use-parent-handoff.png` |
| [evidence/settings/](./evidence/settings/) | `01-settings-computer-section.png` · `02-settings-shell-readiness.png` |

---

## Stamp template

Write `evidence/scenario-5/VERDICT.txt` with:

- Tip SHA + UTC
- Foundational Pass row (Pass/Fail)
- T032 bus row (Pass/Fail)
- Per-scenario rows (Pass / Deferred / Blocked) with evidence paths
- FR-013/014 claim tags (**measured** / **inferred** / **guess**)
- Explicit Blocked reason if required GUI media still Pending
- Scope lock: do not mark Linear Done; leave to PO

**This T030 delivery:** Recipe + `evidence/scenario-5/` placeholders only. **Do not** fill `VERDICT.txt` with product Pass until a composite Desktop evidence run completes.

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 5 | Operator outline |
| [README.md](./README.md) | Foundational Pass + Scenario owners map |
| [non-goals.md](./non-goals.md) | SC-005 absences |
| [contracts/non-goals.md](../contracts/non-goals.md) | Contract absences |
| [evidence/scenario-5/](./evidence/scenario-5/) | Composite stamp home |
| [evidence/shell-box/](./evidence/shell-box/) · [computer-use/](./evidence/computer-use/) · [settings/](./evidence/settings/) | GUI FR-013/014 homes |
| T028 / T029 / T030 / T031 | Non-goals + evidence layout + this recipe + map re-validation |
