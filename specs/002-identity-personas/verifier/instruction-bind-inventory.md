# T003 — Instruction-bind seam candidates (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (SC-008 wiring later) · PO (scope)
**Linear:** [MOH-102](https://linear.app/momadhoun/issue/MOH-102) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** Setup T003 — inventory instruction-bind candidates for FR-013 / [contracts/persona-profile.md](../contracts/persona-profile.md) clarify lock 1
**Branch:** `cursor/p2-t002-t003-inventory-92fa`
**Surfaces inventoried:** `packages/preset/persona/src/index.ts`, `packages/core/system-prompt/src/`, Agent Teams spawn/scope under `packages/experimental/agent-team/src/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Seam candidates named | ≥2 concrete Host paths that can place job/voice/anti-jobs into prompt assembly |
| Scope wiring located | Agent Teams live-Agent bind hook + subagent child-composition precedent called out |
| Empty-field rule | Empty job/voice/antiJobs contribute **no** instruction text (clarify lock 1) |
| Verifier bar | SC-008 = observe assembly/wiring, **not** LLM reply wording |
| Non-goals | No T005 type edits; no T014 bind implementation in this PR |

---

## Requirement (FR-013 / SC-008)

From [spec.md](../spec.md) + [contracts/persona-profile.md](../contracts/persona-profile.md) + research R2:

- After save, non-empty `job` / `voice` / `antiJobs` MUST appear in that bot’s **instruction / system-prompt assembly** on subsequent turns.
- Empty fields contribute no instruction text.
- Verifier Pass checks wiring presence in assembly (or equivalent Host observation), not LLM reply adherence.

---

## Candidate A — `@deepseek-ai/dsh-persona` (preset row)

**Source:** `packages/preset/persona/src/index.ts`

| Fact | Detail |
|------|--------|
| Role | Scope-only Cordis row; registers `deployment:persona-prefix` + `deployment:persona-suffix` via `ctx.systemPrompt.section` |
| Config | `prefix` (required string), optional `suffix`, `complete`, `includeRuntimeContext` |
| Shadowing | Same section names as deployment; scoped registration shadows global `dsh-system-prompt` persona |
| Mount rule | Must run inside an **agent scope**; global mount collides with registry’s own persona registration and fails loud |
| Empty text | Empty prefix/suffix still shadow deployment slots, then drop at `renderPrompt` (empty sections omitted) |
| Ship use today | Static YAML in agent presets (`packages/preset/agent-presets/presets/*/agent.cordis.yml`) — not wired to Host Bot identity |

**Fit for P2:** Research R2 preferred reuse. Compose saved job/voice/anti-jobs into `prefix` (and optionally `suffix`) text for that bot’s Agent scope. Prefer dynamic Host bind over editing preset YAML per bot.

**Compose sketch (non-normative; T009/T014 decide):**

```text
prefix := joinNonEmpty([
  job ? `Job: ${job}` : '',
  voice ? `Voice: ${voice}` : '',
  antiJobs.length ? `Anti-jobs:\n- ${antiJobs.join('\n- ')}` : '',
])
# empty join ⇒ no instruction prose (still may need shadowing policy vs deployment preset persona)
```

---

## Candidate B — Direct `systemPrompt.section` on Agent scope

**Source:** `packages/core/system-prompt/src/index.ts` (+ subagent precedent)

| Fact | Detail |
|------|--------|
| Registry | `SystemPrompt.section` / `assemble` / `renderPrompt`; scoped layers shadow globals by section name |
| Shared names | `PERSONA_PREFIX_SECTION` = `deployment:persona-prefix`; `PERSONA_SUFFIX_SECTION` = `deployment:persona-suffix` |
| Orders | `DEPLOYMENT_PERSONA_PREFIX` (0), `DEPLOYMENT_PERSONA_SUFFIX` (10200) via `getSectionOrder` |
| Assembly | `assemble({ scope, signal? })` → sections/contexts/tools/variables; scoped listeners via waterfall |
| Empty | Empty section text filtered out in `renderPrompt` |
| Precedent | `applyChildComposition` in `packages/subagent/subagent/src/child-agent.ts` registers a scoped `deployment:persona-prefix` from a string `composition.persona` without mounting the persona plugin |

**Fit for P2:** Same shadowing semantics as Candidate A with less plugin mount ceremony. Mirrors subagent in-process child persona. Good if Host prefers an effect on `agent.ctx` (like model-selection bind) over `ctx.plugin(Persona, …)`.

---

## Candidate C — `system-prompt/assemble` waterfall inject (weaker)

| Fact | Detail |
|------|--------|
| Hook | Cordis waterfall `system-prompt/assemble` can mutate `PromptAssembly` |
| Risk | Easy to bypass shadowing contracts; harder to reason about vs named persona sections; YAGNI vs R2 “reuse persona/system-prompt seam” |
| Verdict | **Defer** unless A/B cannot express multi-field composition |

---

## Agent Teams spawn / scope wiring (today)

### Product create path

`TeamService.createBot` (`packages/experimental/agent-team/src/index.ts`):

1. Persists Bot on roster via `TeamRoster.spawn` with `agentOptions: modelSelection`.
2. Sets spawn **initial user prompt** to ``You are bot "${displayName}".`` — this is a **user/message**, **not** the system-prompt persona slot.
3. On `agent/created`, `bindTeammateModelSelection` installs `installModelSelection` on `agent.ctx` so subsequent turns keep the bot’s LLM route.

**Gap:** No persona / system-prompt section bind from durable Bot identity. CreateBot does not call `dsh-persona` or `systemPrompt.section` for job/voice/anti-jobs (fields do not exist yet — see [host-identity-inventory.md](./host-identity-inventory.md)).

### Live-bind hook (best Host attach point)

| Hook | Location | Parallel |
|------|----------|----------|
| `ctx.on('agent/created', …)` | `TeamService` constructor | Already binds model selection; natural place to bind instruction text from durable snapshot (create + cold resume) |
| `bindTeammateModelSelection` | `model-selection-bind.ts` | Pattern: `agent.ctx.effect(() => …, 'agentTeams.modelSelection')` — invent sibling `agentTeams.persona` / instruction bind effect (T014) |

### Continuable child composition (adjacent precedent, not product path)

In-process subagent spawn (`applyChildComposition`):

1. `agentPresets.composeFrom(childCtx, parent.ctx)` — child joins parent preset (which may already include static `dsh-persona`).
2. Optional scoped `systemPrompt.section({ name: 'deployment:persona-prefix', text: composition.persona })` shadows for that child only.

Agent Teams product bots use provider `spawn` continuable children; they inherit preset join behavior from the subagent stack, **not** Host-owned job/voice/anti-jobs. P2 must **override/shadow** with Host-durable persona fields so FR-013 is Host-authoritative (research R1/R2).

---

## Recommended bind approach (inventory opinion → T009)

| Prefer | Why |
|--------|-----|
| **Host effect on teammate `agent.ctx`** registering scoped `deployment:persona-prefix` (Candidate A via `ctx.plugin` **or** Candidate B direct `section`) | Matches model-selection bind lifetime; works on create + resume via `agent/created`; Verifier can `assemble({ scope: botAgent.ctx … })` / render and assert substrings |
| Source of truth | Durable Bot `persona` on Team member snapshot (T005–T006), not Electron, not Client-only |
| Empty fields | Omit from composed text; do not invent filler instructions |
| Preset static persona | Host bot fields should shadow preset/deployment persona for that Agent so product edits win |

Document the chosen approach in T009 (`verifier/instruction-bind.md`); implement in T014.

---

## Observability map (SC-008 later)

| Observation | How |
|-------------|-----|
| Durable profile | Host snapshot / Client overview (SC-001/002) — separate from bind |
| Instruction wiring | After save + subsequent turn (or immediate `systemPrompt.assemble` for bot scope): rendered persona section contains each non-empty saved field (or structured equivalent) |
| Non-observation | LLM assistant reply wording |

---

## Explicit non-touch (Setup)

- No change to `createBot` prompt string as a substitute for system-prompt bind (user message ≠ FR-013)
- No new prompt protocol outside system-prompt (research R2)
- No Electron Main instruction store
- Foundational doc T009 + implement T014 own the final pick and code

---

## Evidence for Verifier / PO

Inventory is source-derived from persona + system-prompt packages and Agent Teams / subagent child-composition seams on branch tip. Setup T003 delivers this note only; SC-008 recipes land with T009/T019.
