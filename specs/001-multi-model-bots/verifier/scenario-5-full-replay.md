# Scenario 5 — Full Phase 1 Verifier replay

**Status:** Recipe outline present (T042 Spec validation against quickstart). Verifier expands evidence recording and live Desktop stamps under **T038** — this file closes the Scenario 5 citation gap; it does not claim SC-005 Pass.
**Owners:** DH Verifier (this recipe + evidence) · DH Spec (outline / quickstart link integrity)
**Acceptance:** Spec SC-005 — Verifier re-runs the documented Phase 1 acceptance path on the real desktop app and records pass/fail evidence against [../spec.md](../spec.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 5
**Gate:** Scenario 0 / SC-007 Topology handshake **Pass** MUST be recorded before Scenario 5 evidence counts toward phase Done ([README gate](./README.md#handshake-pass-gate-sc-007--fr-013))
**Evidence (T038):** Create under `evidence/scenario-5/` when Verifier records a replay run (directory absent until first stamp)

## What this recipe proves (SC-005)

1. The Phase 1 path documented in [../quickstart.md](../quickstart.md) Scenarios **0–4** is re-runnable as one Verifier replay on the real desktop app (or documented keyless composites where a scenario recipe allows).
2. Each scenario’s owning recipe is the authority for commands, fail rules, and Pass/Fail stamps — this recipe only orders the replay and aggregates the verdict.
3. Replay **starts only after** Scenario 0 Pass; product SC-001…SC-006 stamps from this replay remain closed without that gate.

Does **not** replace Scenarios 0–4 recipes. Does **not** invent Box/Shell, MCP/1Password, personas/skills/routines/memory, or pixel Grok checks ([non-goals.md](./non-goals.md)).

## Ordered Phase 1 replay

Execute in order. Stop and stamp **Blocked** on SC-005 if Scenario 0 is not Pass.

| Order | Quickstart | Recipe | Acceptance |
|-------|------------|--------|------------|
| 1 | Scenario 0 | [scenario-0-topology.md](./scenario-0-topology.md) | SC-007 (gate — must Pass) |
| 2 | Scenario 1 | [scenario-1-credentials.md](./scenario-1-credentials.md) | SC-006 |
| 3 | Scenario 2 | [scenario-2-multi-model.md](./scenario-2-multi-model.md) | SC-001, SC-002 |
| 4 | Scenario 3 | [scenario-3-mailbox.md](./scenario-3-mailbox.md) | SC-003 |
| 5 | Scenario 4 | [scenario-4-progress-final.md](./scenario-4-progress-final.md) | SC-004 |

Out-of-scope absence checks: [non-goals.md](./non-goals.md) (do not Fail Pass for absence of non-goals).

## Preconditions

- [ ] Scenario 0 / SC-007 **Pass** recorded under [evidence/scenario-0/](./evidence/scenario-0/)
- [ ] Checkout includes Desktop apps (`apps/desktop`, `apps/desktop-host`) and Scenario 1–4 recipe surfaces required by those recipes
- [ ] `pnpm install` complete; Node `^22.19 || >=24`
- [ ] In-app credential path available for SC-006 / live SC-001–002 (env/key-file CI-only secondary)
- [ ] Display / `xvfb-run` when a GUI path is exercised

## Commands (rerunnable)

Follow each scenario recipe’s **Commands** section in the order above. Prefer the recipe’s focused vitest / Electron automation paths for keyless composites; use live Desktop operator steps only where that recipe requires them for Pass.

Aggregate after the ordered run (T038 fills evidence files):

```sh
# Example: after Scenario 0 Pass, run each recipe’s documented command block in order.
# Record stdout + VERDICT under evidence/scenario-5/ (T038).
```

## Verdict rules

| Result | When |
|--------|------|
| **Pass (SC-005)** | Scenario 0 Pass held; Scenarios 1–4 each stamp Pass (or documented Deferred only where that recipe’s Deferred rule still applies and does not claim product Done); aggregate VERDICT + logs under `evidence/scenario-5/` |
| **Fail** | Any scenario Fail under its recipe fail rules, or replay claimed without Scenario 0 Pass |
| **Deferred** | Outline present (this doc) but Verifier has not yet recorded a full ordered replay — stamp `VERDICT: Deferred` + `DEFER_REASON`. **Does not** mark SC-005 Done |
| **Blocked** | Scenario 0 not Pass, or a required recipe surface missing from checkout |

Minimal stamp template (T038):

```text
VERDICT: Pass|Fail|Deferred|Blocked
SC: SC-005
SHA: <git rev-parse HEAD>
BRANCH: <branch>
UTC: <ISO-8601>
OPERATOR: <name>
RECIPE: specs/001-multi-model-bots/verifier/scenario-5-full-replay.md
SCENARIO_0: Pass|Fail|Blocked
SCENARIO_1: Pass|Fail|Deferred|Blocked
SCENARIO_2: Pass|Fail|Deferred|Blocked
SCENARIO_3: Pass|Fail|Deferred|Blocked
SCENARIO_4: Pass|Fail|Deferred|Blocked
EVIDENCE: evidence/scenario-5/<files>
CLAIM: measured|inferred|guess
DEFER_REASON: <only when Deferred>
BLOCKER: <only when Blocked>
```

## Related

- Quickstart Scenario 5: [../quickstart.md](../quickstart.md)
- Spec SC-005: [../spec.md](../spec.md)
- Owners map: [README.md](./README.md#scenario-05-owners-map)
- Scenario 0 gate: [scenario-0-topology.md](./scenario-0-topology.md)
- Non-goals: [non-goals.md](./non-goals.md)
