# Scenario 6 — Full Phase 6 Verifier replay (SC-006)

**Status:** Recipe delivered (T035) — composite SC-006 product stamp **Pass** under [evidence/scenario-6/VERDICT.txt](./evidence/scenario-6/VERDICT.txt) (2026-09-28 time-boxed composite)
**Owners:** DH Verifier (this recipe + composite evidence) · DH Runtime / Client / Electron (slice owners under Scenarios 1–5) · PO (scope)
**Linear:** **Blocked** — PR-only tracking (Epic MOH-281 / `P-MOH-2`; no invented issue ids)
**Acceptance slice:** T035 — Verifier Scenario 6 recipe covering FR-013 / FR-014/015 / SC-006
**Companion:** T033 — [non-goals.md](./non-goals.md) · T034 — evidence placeholders · T037 — bus reconfirm
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 6
**Spec:** [../spec.md](../spec.md) SC-006 · FR-013 · FR-014 · FR-015
**Gate:** **Foundational Pass (T016) MUST hold before any Scenario 6 evidence counts toward product SC Done** ([README foundational Pass](./README.md#foundational-pass-checklist--recorded))
**Non-goals:** [contracts/non-goals.md](../contracts/non-goals.md) · Verifier [non-goals.md](./non-goals.md) — absence checks must remain green; do not Fail Pass for Out of Scope absence
**Evidence:** `evidence/scenario-6/` (this stamp)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents the ordered FR-013 path + Pass/Fail + stamp template |
| SC coverage | SC-006 composite: Scenarios 1–5 + foundational stamp on the **real desktop app** for GUI slices |
| Hard gate | Foundational Pass (T016) recorded Pass before product replay counts |
| Desktop visual | FR-014/015 screenshots and/or recordings committed under `verifier/evidence/` + PR embeds (SO 11+12) for GUI slices |
| Bus guard | T037 — `apps/desktop/tests/no-electron-connectors-events-trust-bus.spec.ts` green + host-protocol exclusions hold |
| Product SC stamp | See `evidence/scenario-6/VERDICT.txt` — honest measured / blocked rows only |

---

## What this recipe proves (SC-006 / FR-013)

DH Verifier re-runs the documented Phase 6 acceptance path on the real desktop app and records pass/fail against [spec.md](../spec.md):

| Order | Action | Scenario recipe | Product SC |
|-------|--------|-----------------|------------|
| **Gate** | Foundational Pass (T016) | [README.md](./README.md#foundational-pass-checklist--recorded) | Foundations only — **required Pass first** |
| 1 | Connector install → auth → tool | [scenario-1-connector.md](./scenario-1-connector.md) | SC-001 |
| 1b | Credential UX deep (US5) | [scenario-5-credential-ux.md](./scenario-5-credential-ux.md) · [credential-ux-in-app.md](./credential-ux-in-app.md) | SC-007 |
| 2 | Event routine create + harness fire | [scenario-2-event-routine.md](./scenario-2-event-routine.md) | SC-002, SC-008 |
| 3 | Denied permission | [scenario-3-trust-deny.md](./scenario-3-trust-deny.md) | SC-003 |
| 4 | Secrets absent from dumps | [scenario-4-secrets-absent.md](./scenario-4-secrets-absent.md) | SC-004 |
| Cross-cut | Non-goals / seam absence | [non-goals.md](./non-goals.md) · [contracts/non-goals.md](../contracts/non-goals.md) · T014/T037 bus | SC-005, SC-008 |

**Hard gate:** If foundational Pass evidence is missing or Fail, stamp Scenario 6 `VERDICT: Blocked` and stop. Do **not** treat partial US recipes as SC-006 Pass.

**Fail rules:**

1. Fail SC-006 if foundational Pass (T016) is not Pass on the checkout under test.
2. Fail SC-006 if the real desktop path cannot exercise connector → event → deny without developer tooling for the GUI half (FR-014).
3. Fail SC-006 if any product Scenario 1–4 (or US5 auth) required for Phase 6 exit is Fail on the same tip without an explicit Deferred/Blocked stamp naming the gap.
4. Fail SC-006 if Scenario 5 / non-goals is Fail (Out of Scope treated as required).
5. Fail if Pass evidence required an Out of Scope surface — see [non-goals.md](./non-goals.md).
6. Fail if Pass was claimed via Electron Main connector/event/trust bus / Client-only SoT / live Slack-GitHub-only / fixed named connector / mandatory vault when in-app works.

Does **not** by itself re-open US1–US5 implementation. Recipe presence alone is **not** SC-006 Done. Do **not** invent new product code in this task.

**Time-boxed composite (allowed):** When a fresh one-session GUI full replay is not feasible, Verifier MAY stamp Pass by (a) citing already-committed Scenario 1–4 Pass stamps + FR-014 media on master, (b) reconfirming T037 bus green, (c) running a measured Desktop smoke that Agent Team + connector/event surfaces remain live, and (d) filing Scenario 5 absence via [non-goals.md](./non-goals.md) + contracts + spotcheck. Do **not** invent alternate GUI suites.

---

## Scope and prerequisites

| Layer | Required for | Status at T035 |
|-------|--------------|----------------|
| Foundational Pass (T016) | Any product SC / SC-006 | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · [evidence/foundation-host/](./evidence/foundation-host/) |
| Scenario 1 connector (T019–T021) | SC-001 | **measured:** Pass under `evidence/scenario-1/` |
| US5 credential UX (T031–T032) | SC-007 | **measured:** Pass under `evidence/scenario-1/` (`VERDICT-T031.txt`) |
| Scenario 2 event routine (T024–T025) | SC-002 / SC-008 | **measured:** Pass under `evidence/scenario-2/` |
| Scenario 3 trust deny (T027–T028) | SC-003 | **measured:** Pass under `evidence/scenario-3/` |
| Scenario 4 secrets absent (T029–T030) | SC-004 | **measured:** Pass under `evidence/scenario-4/` |
| Scenario 5 + non-goals (T033) | Cross-cut absence | **measured:** [non-goals.md](./non-goals.md) + [evidence/non-goals/](./evidence/non-goals/) placeholders |
| T037 bus reconfirm | Seam honesty | Pending polish T037 (placeholder under scenario-6 / non-goals) |

**Desktop prerequisites** (full Scenario 6 / SC-006 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1–P5 bots; display available (`DISPLAY` or `xvfb-run`); Scenarios 1–3 recipes present with FR-014 media; foundational Pass holds.

---

## Ordered Phase 6 path (quickstart Scenario 6)

Run in order. Stop and stamp Fail/Blocked on the first hard-gate failure.

| Step | Action | Exit condition | Evidence home |
|------|--------|----------------|---------------|
| 0 | Re-confirm foundational Pass (T016) + T037 bus | Foundations Pass; bus green | [README.md](./README.md#foundational-pass-checklist--recorded) · this dir |
| 1 | Scenario 1 — install → auth → tool (+ US5 auth surface) | SC-001 / SC-007 Pass or Deferred with reason | [evidence/scenario-1/](./evidence/scenario-1/) |
| 2 | Scenario 2 — event routine create + harness fire | SC-002 / SC-008 Pass or Deferred with reason | [evidence/scenario-2/](./evidence/scenario-2/) |
| 3 | Scenario 3 — denied permission | SC-003 Pass or Deferred with reason | [evidence/scenario-3/](./evidence/scenario-3/) |
| 4 | Scenario 4 — secrets absent dump | SC-004 Pass or Deferred with reason | [evidence/scenario-4/](./evidence/scenario-4/) |
| 5 | Scenario 5 / non-goals absence spot-check | T033 rows still hold; no Out of Scope required | [evidence/non-goals/](./evidence/non-goals/) · this dir spotcheck |
| 6 | Stamp Scenario 6 composite verdict on **this** tip | Pass only when gate + required product SCs green on real desktop path | [evidence/scenario-6/](./evidence/scenario-6/) |

Prefer **one Desktop session** covering connector → event → deny when Client surfaces allow. Keyless Host vitest leftovers remain supporting evidence; SC-006 Pass still needs the **real desktop app** path recorded for the interactive half (screenshot/recording or cited existing SO11 media + fresh smoke). Scenario 4 dump-only remains non-GUI OK.

---

## Commands (rerunnable)

### Gate — Foundational Pass + T037 bus (required first)

```sh
pnpm exec vitest run packages/experimental/agent-team -t 'connector|Connector|eventTrigger|triggerKind'
pnpm exec vitest run apps/desktop/tests/no-electron-connectors-events-trust-bus.spec.ts
test -f specs/006-connectors-mcp-events-trust/verifier/webhook-harness-b1.md
test -f specs/006-connectors-mcp-events-trust/verifier/non-goals.md
test -f specs/006-connectors-mcp-events-trust/contracts/non-goals.md
rg -n "export interface ConnectorRecord" packages/experimental/agent-team/src/types.ts
rg -n 'connector-catalog|event-routine|credential-value' apps/desktop/src/host-protocol.ts
```

Confirm [README foundational Pass](./README.md#foundational-pass-checklist--recorded) remains Pass for the tip under test. If Fail or absent → **Blocked** for SC-006.

### Composite pointer — Scenarios 1–5 + non-goals

Execute each scenario’s own Commands / Steps section (authoritative). Minimal pointers:

| Scenario | Open recipe | Notes |
|----------|-------------|-------|
| 1 | [scenario-1-connector.md](./scenario-1-connector.md) | Install → auth → tool; evidence `scenario-1/` |
| 1b / US5 | [scenario-5-credential-ux.md](./scenario-5-credential-ux.md) | Auth surface / vault optional; evidence still `scenario-1/` |
| 2 | [scenario-2-event-routine.md](./scenario-2-event-routine.md) | Event create + harness fire + pause; evidence `scenario-2/` |
| 3 | [scenario-3-trust-deny.md](./scenario-3-trust-deny.md) | Deny ≠ success; evidence `scenario-3/` |
| 4 | [scenario-4-secrets-absent.md](./scenario-4-secrets-absent.md) | Dump inspection; evidence `scenario-4/` |
| 5 / Non-goals | [non-goals.md](./non-goals.md) · [contracts/non-goals.md](../contracts/non-goals.md) | SC-005 absences; evidence `non-goals/` |

### One-shot wrapper (gate first; then cite each recipe)

```sh
set -euo pipefail
EVIDENCE=specs/006-connectors-mcp-events-trust/verifier/evidence/scenario-6
mkdir -p "$EVIDENCE"
ROOT=specs/006-connectors-mcp-events-trust/verifier

# --- Gate: Foundational / Electron bus (T037) ---
pnpm exec vitest run apps/desktop/tests/no-electron-connectors-events-trust-bus.spec.ts \
  | tee "$EVIDENCE/vitest-electron-bus.log"
test -f "$ROOT/non-goals.md"
test -f specs/006-connectors-mcp-events-trust/contracts/non-goals.md

# --- Scenarios 1–5: follow each recipe (do not invent alternate suites) ---
{
  echo "FOUNDATIONAL_GATE: see README foundational Pass + electron bus log"
  echo "NEXT: cite Scenario 1–5 evidence dirs; stamp VERDICT when complete"
  echo "UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "SHA: $(git rev-parse HEAD)"
} | tee "$EVIDENCE/replay-pointer.log"
```

---

## Desktop visual evidence (mandatory for GUI half)

Standing orders **11** + **12** / FR-014/015:

1. Capture screenshots and/or a short screen recording of the **real Desktop** app for Scenarios 1–3 GUI steps (or cite already-committed media under `evidence/scenario-{1,2,3}/`).
2. Save walkthrough copies under `/opt/cursor/artifacts/` **and** commit under `verifier/evidence/` (prefer scenario homes; Scenario 6 may pointer-cite + add a fresh SC-006 smoke frame).
3. GUI PR body MUST embed absolute `/opt/cursor/artifacts/…` paths via HTML `<img>` / `<video controls>`.

Unit/jsdom alone **fails** SC-006 GUI half. Scenario 4 dump-inspection and Scenario 5 docs/absence do not require screenshots.

---

## Stamp template

Write `evidence/scenario-6/VERDICT.txt` with:

- Tip SHA + UTC
- Foundational Pass row (Pass/Fail)
- T037 bus row (Pass/Fail)
- Per-scenario rows (Pass / Deferred / Blocked) with evidence paths
- FR-014/015 claim tags (**measured** / **inferred** / **guess**)
- Explicit Blocked reason if required GUI media still Pending
- Scope lock: do not mark Linear Done; leave to PO

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 6 | Operator outline |
| [README.md](./README.md) | Foundational Pass + Scenario owners map |
| [non-goals.md](./non-goals.md) | SC-005 absences |
| [contracts/non-goals.md](../contracts/non-goals.md) | Contract absences |
| [evidence/scenario-6/](./evidence/scenario-6/) | Composite stamp home |
| T033 / T034 / T035 / T036 | Non-goals + evidence layout + this recipe + map re-validation |
