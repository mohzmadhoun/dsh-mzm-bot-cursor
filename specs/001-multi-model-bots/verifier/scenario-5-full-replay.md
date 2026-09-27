# Scenario 5 — Full Phase 1 Verifier replay (SC-005)

**Status:** Recipe present (T038). Full Phase 1 acceptance-path outline for DH Verifier re-run on the **real desktop app**. Recipe + evidence stubs only — **does not** stamp SC-005 Pass. US3 (T027–T032) is complete on `master` (T030/T031 landed); Scenario 0 / SC-007 Topology handshake **Pass** already recorded.
**Owners:** DH Verifier (this recipe + composite evidence) · DH Electron / Runtime / Client (slice owners under Scenarios 0–4)
**Acceptance:** Spec SC-005 · FR-007 (usable desktop UI path under Electron) · quickstart Scenario 5
**Gate:** **Scenario 0 / SC-007 Pass MUST hold before any Scenario 5 evidence counts toward product SC Done** ([README handshake gate](./README.md#handshake-pass-gate-sc-007--fr-013))
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 5
**Spec:** [../spec.md](../spec.md) SC-005
**Non-goals:** [non-goals.md](./non-goals.md) (T039) — absence checks must remain green; do not Fail Pass for Out of Scope absence
**Branch (T038 recipe):** `cursor/p1-t038-scenario5-92fa` (base `master` @ T030/T031)
**Evidence:** [evidence/scenario-5/](./evidence/scenario-5/)

## What this recipe proves (SC-005)

DH Verifier re-runs the documented Phase 1 acceptance path on the real desktop app and records pass/fail against [spec.md](../spec.md):

| Order | Scenario | Recipe | Product SC |
|-------|----------|--------|------------|
| **Gate** | 0 Topology handshake | [scenario-0-topology.md](./scenario-0-topology.md) | SC-007 — **required Pass first** |
| 1 | In-app auth + clean dump | [scenario-1-credentials.md](./scenario-1-credentials.md) | SC-006 |
| 2 | Multi-model team session | [scenario-2-multi-model.md](./scenario-2-multi-model.md) | SC-001, SC-002 |
| 3 | Host mailbox 1:1 | [scenario-3-mailbox.md](./scenario-3-mailbox.md) | SC-003 |
| 4 | Progress + final | [scenario-4-progress-final.md](./scenario-4-progress-final.md) | SC-004 |
| Cross-cut | Non-goals absence | [non-goals.md](./non-goals.md) | Out of Scope (must stay absent) |

**Hard gate:** If Scenario 0 evidence is missing or Fail, stamp Scenario 5 `VERDICT: Blocked` and stop. Do **not** treat Scenarios 1–4 keyless leftovers as SC-005 Pass.

**Fail rules:**

1. Fail SC-005 if Scenario 0 is not Pass on the checkout under test (or Pass evidence is absent / outdated relative to a topology change).
2. Fail SC-005 if the real desktop path cannot exercise create-bot, assign-model, chat progress+final, and observe-handoff without developer tooling (FR-007 / US3).
3. Fail SC-005 if any product Scenario 1–4 required for wedge exit is Fail on the same SHA without an explicit Deferred/Blocked stamp naming the gap.
4. Fail if Pass evidence required an Out of Scope surface (Box/Shell backends, MCP/1Password vault product flow, personas/skills/routines/memory product UX, pixel Grok chrome) — see [non-goals.md](./non-goals.md).

Does **not** by itself re-open US1–US4 implementation. Does **not** claim SC-001 wall-clock or SC-002 live multi-provider Pass when those remain Deferred under Scenario 2. Does **not** replace T042 (quickstart outline validation / recipe-gap fixes). Recipe presence alone is **not** SC-005 Done.

## Preconditions

- [x] Scenario 0 / SC-007 Topology handshake **Pass** recorded — [evidence/scenario-0/VERDICT.txt](./evidence/scenario-0/VERDICT.txt) (**measured** Pass; gate for this recipe)
- [ ] Checkout includes US1–US4 implement slices needed for the replay (US3 T027–T032 on `master`; US2 T021–T025; US4 T033–T037 as applicable)
- [ ] `pnpm install` complete; Desktop app launchable (`apps/desktop`, `apps/desktop-host`)
- [ ] Node `^22.19 || >=24`
- [ ] Display available for real desktop path (`DISPLAY` set, or `xvfb-run`)
- [ ] For SC-001/002/006 live stamps: ≥2 distinct configured `(provider, model)` assignments and in-app credentials (env/key-file secondary only — FR-009)
- [ ] Slice recipes 0–4 present under `specs/001-multi-model-bots/verifier/`

## Ordered Phase 1 path (quickstart Scenario 5)

Run in order. Stop and stamp Fail/Blocked on the first hard-gate failure.

| Step | Action | Exit condition | Evidence home |
|------|--------|----------------|---------------|
| 0 | Re-confirm Scenario 0 Pass (rerun topology automation or accept recorded Pass when topology unchanged) | SC-007 Pass | [evidence/scenario-0/](./evidence/scenario-0/) |
| 1 | Scenario 1 — in-app auth + clean dump | SC-006 Pass or Deferred with reason | [evidence/scenario-1/](./evidence/scenario-1/) |
| 2 | Scenario 2 — multi-model team (≥2 distinct assignments) | SC-001/002 Pass or Deferred (TTFT/live) with reason | [evidence/scenario-2/](./evidence/scenario-2/) |
| 3 | Scenario 3 — Host mailbox A→B + visible handoff | SC-003 Pass (keyless and/or live) | [evidence/scenario-3/](./evidence/scenario-3/) |
| 4 | Scenario 4 — ≥1 Host-stream progress + session-log final | SC-004 Pass | [evidence/scenario-4/](./evidence/scenario-4/) |
| 5 | Non-goals absence spot-check | T039 rows still hold; no Out of Scope required | [evidence/t039-non-goals/](./evidence/t039-non-goals/) |
| 6 | Stamp Scenario 5 composite verdict on **this** SHA | Pass only when gate + required product SCs green on real desktop path | [evidence/scenario-5/](./evidence/scenario-5/) |

Prefer one Desktop session that covers create-bot → assign-model → multi-model work → mailbox handoff → progress+final when credentials allow. Keyless slice re-runs remain valid supporting evidence; SC-005 Pass still needs the **real desktop app** path recorded (screenshot/trace or operator note).

## Commands (rerunnable)

### Gate — Scenario 0 (required first)

```sh
xvfb-run -a ./node_modules/.bin/vitest run apps/desktop/tests/topology-handshake.spec.ts
```

Confirm [evidence/scenario-0/VERDICT.txt](./evidence/scenario-0/VERDICT.txt) is `Pass` for the topology under test. If Fail or absent → **Blocked** for SC-005.

### Composite pointer — Scenarios 1–4

Execute each scenario’s own Commands section (authoritative). Minimal pointers:

| Scenario | Open recipe | Keyless entry (when applicable) |
|----------|-------------|-----------------------------------|
| 1 | [scenario-1-credentials.md](./scenario-1-credentials.md) | Host `llm-route` + Models write-only + preload/`ipc` `rg` |
| 2 | [scenario-2-multi-model.md](./scenario-2-multi-model.md) | T018 distinct-models suites; live TTFT under T019 |
| 3 | [scenario-3-mailbox.md](./scenario-3-mailbox.md) | T021–T024 + topology `rejects fake mailbox` |
| 4 | [scenario-4-progress-final.md](./scenario-4-progress-final.md) | T029 + T030 ui-chat + shell negative IPC |

### One-shot wrapper (gate first; then invoke each recipe’s one-shot / commands)

```sh
set -euo pipefail
EVIDENCE=specs/001-multi-model-bots/verifier/evidence/scenario-5
mkdir -p "$EVIDENCE"
VITEST=./node_modules/.bin/vitest
ROOT=specs/001-multi-model-bots/verifier

# --- Gate: Scenario 0 ---
xvfb-run -a $VITEST run apps/desktop/tests/topology-handshake.spec.ts \
  | tee "$EVIDENCE/vitest-scenario-0.log"
if ! grep -q '^VERDICT: Pass' "$ROOT/evidence/scenario-0/VERDICT.txt" 2>/dev/null; then
  echo "BLOCKED: Scenario 0 VERDICT is not Pass — abort SC-005" \
    | tee "$EVIDENCE/blocked-no-scenario-0.txt"
  exit 1
fi

# --- Scenarios 1–4: follow each recipe’s Commands (do not invent alternate suites) ---
# Record pointer log; operator pastes per-scenario exits into VERDICT.txt
{
  echo "SCENARIO_0_GATE: Pass (see evidence/scenario-0/)"
  echo "NEXT: run Scenario 1–4 recipe commands; stamp this VERDICT when complete"
  echo "UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "SHA: $(git rev-parse HEAD)"
} | tee "$EVIDENCE/replay-pointer.log"
```

After the gate, run Scenario 1–4 recipes in order and copy their verdicts into the Scenario 5 stamp. Do not mark SC-005 Pass from the pointer log alone.

### Optional live Desktop operator path

1. Launch Desktop under test (`pnpm` / app packaging path documented for the checkout).
2. Enter credentials **in-app** (Scenario 1); create ≥2 bots with distinct `(provider, model)` (Scenario 2).
3. Trigger Host mailbox A→B; confirm visible handoff (Scenario 3).
4. Run a scripted chat; observe ≥1 Host-stream progress then session-log final (Scenario 4).
5. Capture screenshot/trace + operator note under `evidence/scenario-5/`.
6. Fail immediately if any step required Electron Main mailbox/credential/model routers or Out of Scope product UX.

## Assert checklist (all required for SC-005 Pass)

| # | Criterion | How measured | Required |
|---|-----------|--------------|----------|
| 1 | Scenario 0 / SC-007 **Pass** before product replay | `evidence/scenario-0/VERDICT.txt` + optional re-run | Yes (**hard gate**) |
| 2 | Scenario 1 / SC-006 Pass or documented Deferred with hygiene path green | Scenario 1 recipe | Yes for wedge exit; Deferred allowed only with named gap |
| 3 | Scenario 2 / SC-001–002 Pass or Deferred (TTFT/live) with T018 rule green | Scenario 2 recipe | Yes for wedge exit; live TTFT may Deferred |
| 4 | Scenario 3 / SC-003 Pass (keyless minimum) | Scenario 3 recipe | Yes |
| 5 | Scenario 4 / SC-004 Pass (T029+T030 on checkout) | Scenario 4 recipe | Yes |
| 6 | Real desktop app path exercised (not mock-only for SC-005 Pass) | Operator note / screenshot / trace under `evidence/scenario-5/` | Yes for SC-005 Pass |
| 7 | Non-goals remain absent (T039) | [non-goals.md](./non-goals.md) | Yes |

**Claim tags:** label every SC-005 claim **measured** / **inferred** / **guess**. SC-005 Pass requires **measured** Scenario 0 Pass plus **measured** desktop-path evidence for the product path under test.

| Outcome | When |
|---------|------|
| **Pass (SC-005)** | Criteria 1 + 4–7 green; criteria 2–3 Pass or explicitly Deferred with named live gap that does not block wedge exit policy; real desktop evidence under `evidence/scenario-5/`; composite `VERDICT: Pass` |
| **Fail (SC-005)** | Scenario 0 Fail; or required product Scenario Fail; or desktop path cannot complete FR-007 surfaces; or Out of Scope required |
| **Deferred (SC-005)** | Recipe present (T038) but full replay not yet run on this SHA — stamp `VERDICT: Deferred` + `DEFER_REASON`. **Does not** mark SC-005 Done |
| **Blocked** | Scenario 0 Pass missing/Fail; Desktop unusable; or US3/progress-final slices absent from checkout |

## Evidence home

Record under [evidence/scenario-5/](./evidence/scenario-5/):

| Artifact | Suggested name | Required? |
|----------|----------------|-----------|
| Verdict stamp | `VERDICT.txt` | Yes |
| Scenario 0 gate re-run log (when re-run) | `vitest-scenario-0.log` | Recommended |
| Blocked note (no Scenario 0 Pass) | `blocked-no-scenario-0.txt` | When Blocked on gate |
| Replay pointer / composite command log | `replay-pointer.log` | Recommended |
| Live Desktop operator note / screenshot | `live-desktop.(txt\|png\|webm)` | Yes for SC-005 Pass |
| Per-scenario verdict cross-refs | cited in `VERDICT.txt` | Yes for Pass |

Minimal stamp template:

```text
VERDICT: Pass|Fail|Deferred|Blocked
SC: SC-005
SHA: <git rev-parse HEAD>
BRANCH: <branch>
UTC: <ISO-8601>
OPERATOR: <name>
LINEAR: MOH-83 (project DeepSeek Harness - Cursor / P-MOH-2); epic MOH-37
RECIPE: specs/001-multi-model-bots/verifier/scenario-5-full-replay.md
SCENARIO_0: Pass|Fail|Blocked
SCENARIO_1: Pass|Fail|Deferred|Blocked
SCENARIO_2: Pass|Fail|Deferred|Blocked
SCENARIO_3: Pass|Fail|Deferred|Blocked
SCENARIO_4: Pass|Fail|Deferred|Blocked
NON_GOALS: Pass|Fail
LIVE_DESKTOP: Pass|Fail|Deferred|Skipped
EVIDENCE: evidence/scenario-5/<files>
CLAIM: measured|inferred|guess
DEFER_REASON: <only when Deferred>
BLOCKER: <only when Blocked>
SCOPE_OUT: <what this Pass does not claim>
LINEAR_STATUS: leave MOH-83 In Progress (do not Done; do not merge)
```

## Topology / trust floor unchanged

Locked Desktop topology remains: Electron Main + preload lifecycle IPC only; Web under `dsh-app://` talks Host HTTP/WS. Full replay MUST NOT invent a second messaging bus or secret IPC. Trust floor: Phase 1 acceptance tools MUST NOT send/post externally ([trust-floor.md](./trust-floor.md)).

## Related

- Quickstart Scenario 5: [../quickstart.md](../quickstart.md)
- Handshake gate: [README.md](./README.md#handshake-pass-gate-sc-007--fr-013)
- Scenario 0: [scenario-0-topology.md](./scenario-0-topology.md)
- Scenario 1: [scenario-1-credentials.md](./scenario-1-credentials.md)
- Scenario 2: [scenario-2-multi-model.md](./scenario-2-multi-model.md)
- Scenario 3: [scenario-3-mailbox.md](./scenario-3-mailbox.md)
- Scenario 4: [scenario-4-progress-final.md](./scenario-4-progress-final.md)
- Non-goals: [non-goals.md](./non-goals.md)
- T042 (later): quickstart Scenario 0–5 validation outline against recipes — not this task
