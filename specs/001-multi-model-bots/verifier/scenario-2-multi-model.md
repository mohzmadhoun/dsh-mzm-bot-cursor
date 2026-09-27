# Scenario 2 — Multi-model team session (distinct `(provider, model)`)

**Status:** T018 distinct-assignment rule + Client messaging **Pass** (unit/client). T019 documents the clean-machine TTFT path and SC-001 wall-clock fields below. Live SC-001 wall-clock run and full SC-002 multi-provider session Pass remain **Verifier-owned** (may defer until credentials UI / Desktop session path is ready).
**Acceptance slice:** FR-003 / SC-002 rule (T018 measured). SC-001 path + recording fields (T019 docs). SC-001 wall-clock Pass and SC-002 session Pass require a Verifier live run against this recipe.
**Contract:** [../contracts/bot-create-model.md](../contracts/bot-create-model.md) section “Verifier rule for different”
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Data model:** [../data-model.md](../data-model.md) Work session `startedAt` / `completedAt`
**Branch (T018 implement):** `cursor/p1-t018-distinct-models-92fa`
**Branch (T019 docs):** `cursor/p1-t019-ttft-docs-92fa`

## Verifier rule — “different models”

Quoted from the contract:

> Any two distinct configured `(provider, model)` assignments available in the verification environment. No fixed marketing catalog.

Accepted edges for this slice:

- A second bot with the **same** `(provider, model)` pair may be created. That pair does not satisfy the ≥2-distinct exit.
- If only one provider/model is configured, bots may still be created. Verifier cannot Pass the ≥2-distinct-models exit until a second distinct configured assignment exists.
- `reasoningEffort` does not make two assignments distinct. Distinct means the `(provider, model)` tuple differs after the same trim as `requiredModelSelection` (`modelAssignmentsAreDistinct`).
- Count only bots that expose both an LLM provider and a model on `modelSelection`. The Lead row often has no product bot assignment. A missing pair is not an assignment. The subagent backend id on `provider` without an LLM model is not an assignment.
- The catalog is the verification environment’s configured assignments. Do not require a brand list.

## What this recipe proves (T018)

1. The open team panel states the rule: different models means any two distinct configured `(provider, model)` assignments, not a fixed catalog.
2. When teammate rows expose fewer than 2 distinct pairs, the panel says a multi-model distinct-models check cannot pass yet. When they expose ≥2, it says the roster meets that rule. This is messaging, not a chat blocker.
3. Near New bot, a complete draft says whether it is a new distinct assignment relative to bots that already have both ids. The same assignment still submits. An incomplete draft (empty or longer than 200 characters after trim) does not show that comparison.
4. Host roster rows set `modelSelection` from the live Agent route only. An unloaded teammate does not inherit the Lead pair.

Does **not** by itself prove SC-001 wall-clock under 30 minutes. T019 adds the path and recording fields; Verifier owns the timed live run.

## How to observe the Client messages

Open the team panel on a loaded roster.

- `data-team-distinct-models` shows `multiModelPending` or `multiModelReady`.
- **New bot** shows `distinctModelsHint` (`data-team-distinct-models-hint`).
- A draft that matches a teammate `modelSelection` shows `duplicateAssignment` (`data-team-duplicate-assignment`). Save stays enabled.
- A complete draft that differs shows `draftDistinctAssignment` (`data-team-draft-distinct`).

Copy is locale-owned (`packages/experimental/client-ui-agent-team/src/client/locales.ts`). Client tests assert the Chinese dictionary strings.

## Commands (rerunnable) — T018 rule slice

```sh
pnpm exec vitest run \
  packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'distinct|createBot|creates a Host-owned bot|model assignment'
```

In this workspace, `pnpm exec` may refuse to run because install rewrites `core.hooksPath`. The same filter via the local binary:

```sh
./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/team.spec.ts \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'distinct|createBot|creates a Host-owned bot|model assignment'
```

## Pass criteria (T018 slice)

- `modelAssignmentsAreDistinct` tests cover the same pair, a different model, a different provider, ignored `reasoningEffort`, trim, and empty rejection.
- Client tests show same-assignment `createBot`, the distinct-draft message, one teammate pair as not-yet, and two distinct teammate pairs as meets-rule.
- This slice alone does not claim SC-001 or SC-002 session Pass.

---

## T019 — Clean-machine TTFT path (SC-001)

**Owner:** DH Spec (this path + fields) · DH Verifier (wall-clock measurement + Pass/Fail stamp)
**Criterion:** [../spec.md](../spec.md) SC-001 — time from **first launch** to **first completed multi-model team session** < 30 minutes on a clean machine following this path.
**TTFT here** means time-to-first completed multi-model team session (not model token latency).

### Preconditions (before the clock)

These steps are **outside** the 30-minute window. Record them for replay, but do not charge them to SC-001.

| # | Precondition | Notes |
|---|--------------|--------|
| P1 | Scenario 0 / SC-007 Topology handshake **Pass** recorded | Gate: product SC Done closed without it ([README](./README.md#handshake-pass-gate-sc-007--fr-013)) |
| P2 | Repo checkout at the SHA under test; `pnpm install` complete | Node `^22.19 \|\| >=24` |
| P3 | Desktop apps present (`apps/desktop`, `apps/desktop-host`) | Buildable via `pnpm run dev:desktop` or packaged Desktop |
| P4 | ≥2 distinct configured `(provider, model)` assignments available | Configuration catalog — no fixed marketing list |
| P5 | Valid provider credentials available to the operator | In-app entry is the primary product path (US4 / Scenario 1). Env/key-file shortcuts are CI-only and **do not** count as SC-006 evidence |
| P6 | Fresh Desktop profile (or cleared credentials + empty team roster) for the timed run | Clean-machine intent: no pre-created bots, no prior multi-model session |

### Ordered clean-machine path (clock starts at step 1)

Follow in order. Stop and Fail SC-001 if any step is skipped or performed outside the app solely to reach another model stack.

| Step | Action | Exit condition for this step |
|------|--------|------------------------------|
| 1 | **First launch** of Desktop under test | App window up; Host `ready` / Web client usable. **Stamp `T_START` (UTC).** |
| 2 | Open Agent Team / team panel | Team UI visible (create path from T014/T017) |
| 3 | Enter credentials **in-app** for providers needed by the two assignments | Credentials accepted for bot use; not pasted into chat as transcript content |
| 4 | Create **Bot A** with display name + assignment `(provider, model) = X` | Bot A appears on roster with `modelSelection` = X |
| 5 | Create **Bot B** with display name + assignment `(provider, model) = Y`, Y distinct from X | Roster exposes ≥2 distinct configured pairs (`multiModelReady` / Verifier rule above) |
| 6 | Run one **real work session** that uses both bots inside the app | Session completes a real task without opening a second product solely for model access (SC-002 content) |
| 7 | Confirm session complete | User-visible completion (final result or equivalent). **Stamp `T_END` (UTC).** |

Wall-clock elapsed: `TTFT_SECONDS = T_END − T_START` (same clock, UTC). Pass requires `TTFT_SECONDS < 1800` (30 minutes).

### Wall-clock recording fields (SC-001)

Copy into `evidence/scenario-2/VERDICT.txt` (or a sibling `TTFT.txt`) when Verifier runs the timed path. Every time field is **required** for SC-001 Pass evidence.

| Field | Required | Meaning |
|-------|----------|---------|
| `VERDICT` | Yes | `Pass` / `Fail` / `Deferred` for SC-001 |
| `SC` | Yes | `SC-001` |
| `SHA` | Yes | `git rev-parse HEAD` of the build under test |
| `BRANCH` | Yes | Branch or release tag under test |
| `OPERATOR` | Yes | Who ran the path (e.g. Verifier acting as Mohammed) |
| `MACHINE` | Yes | OS / arch / clean-machine note (fresh profile? VM?) |
| `LAUNCH_MODE` | Yes | `dev:desktop` \| `start:desktop` \| packaged installer path |
| `T_START_UTC` | Yes | ISO-8601 UTC at step 1 (first launch) |
| `T_END_UTC` | Yes | ISO-8601 UTC at step 7 (first completed multi-model session) |
| `TTFT_SECONDS` | Yes | Integer seconds `T_END − T_START` |
| `TTFT_LIMIT_SECONDS` | Yes | Always `1800` |
| `BOT_A` | Yes | `displayName` + `(provider, model)` for Bot A |
| `BOT_B` | Yes | `displayName` + `(provider, model)` for Bot B |
| `DISTINCT_CHECK` | Yes | `Pass` if `modelAssignmentsAreDistinct(A, B)` (or equivalent Verifier observation) |
| `SESSION_NOTE` | Yes | One line: what real task completed using both bots |
| `EVIDENCE` | Yes | Paths to log / screenshot / trace under `evidence/scenario-2/` |
| `DEFER_REASON` | If `Deferred` | Why wall-clock was not run (e.g. credentials UI not yet primary; no dual-provider keys on Verifier host) |

Minimal stamp template:

```text
VERDICT: Pass|Fail|Deferred
SC: SC-001
SHA: <git rev-parse HEAD>
BRANCH: <branch>
OPERATOR: <name>
MACHINE: <os/arch; clean profile yes|no>
LAUNCH_MODE: dev:desktop|start:desktop|packaged
T_START_UTC: <ISO-8601>
T_END_UTC: <ISO-8601>
TTFT_SECONDS: <int>
TTFT_LIMIT_SECONDS: 1800
BOT_A: <name> (<provider>, <model>)
BOT_B: <name> (<provider>, <model>)
DISTINCT_CHECK: Pass|Fail
SESSION_NOTE: <one line>
EVIDENCE: evidence/scenario-2/<files>
DEFER_REASON: <only when Deferred>
```

### Pass / Fail measurement notes (DH Verifier)

**Claim tags:** label every SC-001 claim **measured** / **inferred** / **guess**. SC-001 Pass requires **measured** wall-clock.

| Outcome | When |
|---------|------|
| **Pass (SC-001)** | Ordered path followed; `T_START`/`T_END` **measured**; `TTFT_SECONDS < 1800`; ≥2 bots with distinct configured assignments; multi-model session completed in-app; stamp + evidence under `evidence/scenario-2/` |
| **Fail (SC-001)** | Path followed but `TTFT_SECONDS ≥ 1800`; or missing start/end stamps; or session completed only by leaving the app for another model product; or fewer than 2 distinct assignments at end |
| **Deferred (SC-001)** | Recipe and fields exist (this doc) but Verifier has not yet run the timed live path. Record `VERDICT: Deferred` + `DEFER_REASON`. **Does not** mark SC-001 Done. T019 docs alone are not SC-001 Pass |
| **Blocked** | Preconditions fail (no Scenario 0 Pass, no second assignment, no credentials, Desktop not launchable). Do not start the clock; note blocker |

**Measurement rules:**

1. Clock starts at **first launch** of the Desktop under test for this clean run — not at `pnpm install`, not at clone.
2. Clock ends at **first completed** multi-model team session (≥2 bots, distinct assignments, real task finished in-app). Partial create without a completed session does not stop the clock for Pass.
3. Use one wall clock (UTC ISO-8601). Do not sum pause intervals unless the operator explicitly records a pause policy in `SESSION_NOTE` (default: no pauses).
4. Same-assignment second bot does not satisfy the distinct-models exit — Fail or continue until a distinct Y exists (still inside the same timed run).
5. Env/key-file credential injection may be used only when documenting a CI shortcut; SC-001 evidence that claims in-app primary must use step 3 in-app entry (US4). Until US4 Pass, Verifier may **Defer** SC-001 with reason rather than Pass on env shortcuts.
6. T018 unit/client Pass does **not** imply SC-001 Pass.

### Deferred live runs (Verifier may leave deferred)

| Item | Status after T019 docs | Owner |
|------|------------------------|--------|
| SC-001 wall-clock < 30 min (timed live Desktop run) | **Documented**; measurement may be `Deferred` until Verifier runs | Verifier + Electron |
| SC-002 full live work session (≥2 distinct assignments, in-app) | Still requires live session evidence | Verifier + Runtime + Client |
| Evidence stamp with filled `T_START_UTC` / `T_END_UTC` / `TTFT_SECONDS` | Required for SC-001 Pass; optional Deferred stamp allowed | Verifier |

---

## Evidence home

| Slice | Location |
|-------|----------|
| T018 distinct-rule | [evidence/scenario-2/](./evidence/scenario-2/) — VERDICT + vitest stdout (recorded) |
| T019 / SC-001 TTFT | Same directory — extend VERDICT or add `TTFT.txt` using the fields above when the wall-clock run happens (or stamp `Deferred`) |

## Topology unchanged

Electron Main invents neither bots nor LLM routes. Create stays Host Remote `agentTeams/createBot`. Web under `dsh-app://` uses authenticated Host HTTP/WS.
