# Scenario 1 — Persona profile (job / voice / anti-jobs)

**Status:** Product SC Pass stamped — see [evidence/scenario-1/VERDICT.txt](./evidence/scenario-1/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host persist + instruction bind) · DH Client (profile / overview UI)
**Linear:** [MOH-118](https://linear.app/momadhoun/issue/MOH-118) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** T019 — Verifier Scenario 1 recipe covering SC-001, SC-002, SC-008
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1
**Contract:** [../contracts/persona-profile.md](../contracts/persona-profile.md)
**Instruction-bind bar:** [instruction-bind.md](./instruction-bind.md) (clarify lock 1; SC-008 wiring only)
**Host path landed:** [#83](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/83) (T013–T015 `updatePersona` + `deployment:persona-prefix` bind)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-001 durability · SC-002 overview anti-jobs · SC-008 assembly wiring |
| Non-observation | **Do not** score LLM assistant reply wording (clarify lock 1) |
| Product SC stamp | Deferred until Client profile/overview (T016/T017) + Verifier desktop evidence land |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T011) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host `updatePersona` + journal persist (T013/T015) | SC-001 Host half · SC-008 | **measured:** merge [#83](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/83) |
| Host persona instruction bind (T014) | SC-008 | **measured:** `persona-bind.ts` + team bind case in [#83](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/83) |
| Client profile editor (T016) | SC-001 desktop path | **inferred:** open until Client lands |
| Client overview anti-jobs (T017) | SC-002 | **inferred:** open until Client lands |

**Desktop prerequisites** (full Scenario 1 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot + model assignment; ability to open bot identity/profile and overview.

**Host-only rehearsal** (does **not** alone mark SC-001/SC-002 Done): Agent Teams vitest path below — proves Host durability + SC-008 wiring before Client UI.

---

## Fixtures (deterministic strings)

Use these exact values on the first save so Pass/Fail diffs stay greppable:

| Field | First save | Second save (replace) |
|-------|------------|------------------------|
| `job` | `review PRs` | `ship releases` |
| `voice` | `terse` | `warm` |
| `antiJobs` | `["merge without review"]` (≥1) | `["docs-only chores", "deploy alone"]` |

Optional empty-field probe (SC-008): after a Pass run, clear `voice` to `''` and assert assembly has **no** voice prose for that field while job/anti-jobs remain.

---

## Step A — SC-001 durability (profile persist + restart/reload)

**User / Verifier path (desktop):**

1. Create a bot (P1) or select an existing one.
2. Open identity/profile; set job, voice, and ≥1 anti-job from the fixture table; save.
3. Leave profile and reopen — same values remain.
4. Restart the desktop app **or** reload durable Host Team state.
5. Reopen profile — job, voice, and anti-jobs still match the last successful save.
6. Change to the **second save** fixture; save — prior values are replaced (no merge of old anti-jobs).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'persists updatePersona'
```

Assert via Host API / durable snapshot / `listMembers` / Team view that `persona.job`, `persona.voice`, and `persona.antiJobs` match the saved fixture after mutation and after any cold-resume / journal-replay case the suite covers.

| Observation | Pass | Fail |
|-------------|------|------|
| Leave/return | Profile shows saved job, voice, ≥1 anti-job | Values blank, stale, or Client-only |
| Restart/reload | Same values on Host-durable path | Lost after restart; Electron Main invents identity |
| Re-edit | Second save replaces prior persona | Old anti-jobs accumulate or Host rejects silently |

**Claim tags:** desktop UI observations → **measured**; Host vitest-only rehearsal → **measured** (Host half) + **inferred** (does not complete SC-001 without Client).

---

## Step B — SC-002 overview anti-jobs

**User / Verifier path (desktop):**

1. With a bot that has ≥1 saved non-empty anti-job (Step A).
2. Open the **bot overview** (not a hidden/advanced-only editor).
3. Confirm each anti-job string is visible without copy-paste or developer tooling.
4. After the second save in Step A, overview shows the **new** anti-jobs list only.

| Observation | Pass | Fail |
|-------------|------|------|
| Visibility | Anti-jobs readable on overview chrome | Only in profile editor, DevTools, or Host logs |
| Sync | Overview matches last durable save | Overview stale vs profile |

**Blocked until T017** for product SC-002 Done. Host projection of `persona.antiJobs` on Team member views is a supporting signal only (**inferred** for SC-002; not a substitute for overview UI).

---

## Step C — SC-008 instruction assembly wiring (not LLM wording)

**Normative Host bind:** [instruction-bind.md](./instruction-bind.md) — Candidate B `deployment:persona-prefix` from durable Bot persona; empty fields contribute no prose.

**User / Verifier path (desktop + Host observation):**

1. After a successful persona save with non-empty job, voice, and ≥1 anti-job.
2. Trigger a subsequent turn for that bot **or** assemble system prompt for that bot’s Agent scope.
3. Assert rendered persona-prefix (or full prompt / Host equivalent) **contains** each non-empty saved field **value**.
4. Assert intentionally empty fields contribute **no** corresponding instruction prose.
5. After cold resume / Agent recreate, repeat assemble assert (bind reattached via `agent/created`).
6. **Stop.** Do **not** assert assistant message text, “persona adherence,” or paraphrase quality.

**Host rehearsal (keyless):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/persona-bind.spec.ts packages/experimental/agent-team/tests/team.spec.ts -t 'binds saved persona'
```

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Wiring | Assembly / `renderPrompt` includes each non-empty saved value | Missing field in persona prefix |
| Empty fields | No filler prose for empty job/voice/antiJobs | Invented “Job:” / “Voice:” chrome for empties |
| Lifetime | Bind holds on subsequent turn and after Agent recreate | Bind only on first create |
| Non-observation | — | LLM reply wording, skills/memory UX |

---

## Pass stamp template (fill when evidence lands)

```text
Verdict: Pass
Stamp: 2026-09-27 · tip 144a87113365 · desktop DSH Local Build 0.1.6-alpha.2 (DISPLAY=:1 CDP 9222)
Linear: MOH-118 · Epic MOH-88
SC-001: Pass — evidence: evidence/scenario-1/{01-persona-saved,02-reopen-overview,03-post-reload,04-post-reload-persona}.png + post-reload.txt
SC-002: Pass — evidence: evidence/scenario-1/01-persona-saved.png (Anti-jobs on overview)
SC-008: Pass — evidence: evidence/scenario-1/vitest-sc008.log (Host wiring only; no LLM reply quotes)
Blockers: none
```

**Rule:** Do not mark SC-001…SC-008 Done in Linear / Spec without a filled stamp that includes desktop evidence for SC-001/SC-002 once Client UI exists. Host vitest alone may advance SC-008 wiring confidence but does **not** close US1.

---

## Explicit non-goals

- Client UI implementation (T016/T017) — out of this Verifier recipe PR
- LLM reply-adherence proofs
- Skills library / memory UX / avatar / rename / sections / delete
- Changing P1 model-assignment rules
- Electron Main persona store (forbidden; T010)

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 1 | User-facing outline |
| [../contracts/persona-profile.md](../contracts/persona-profile.md) | Contract Pass bars |
| [instruction-bind.md](./instruction-bind.md) | SC-008 Host approach + observation bar |
| [README.md](./README.md) | Scenario owners map + foundational Pass |
| This file | T019 rerunnable Scenario 1 recipe |
| T016 / T017 | Client profile + overview for desktop SC-001/SC-002 |
| T042 | Quickstart ↔ recipe gap fix later |

## Evidence for PO / DH Lead

**Recipe delivered (T019).** Product SC Pass **not** stamped. Host path for persist + SC-008 wiring is on master via [#83](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/83). Full Scenario 1 Done waits on Client profile/overview (T016/T017) plus Verifier desktop evidence using Steps A–C above.
