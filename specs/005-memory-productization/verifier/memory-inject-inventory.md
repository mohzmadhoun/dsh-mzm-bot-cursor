# T003 — Model-visible recall / instruction-bind candidates (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change)
**Owners:** DH Runtime (author) · DH Verifier (SC-004 inject wiring later) · PO (scope)
**Linear:** [MOH-240](https://linear.app/momadhoun/issue/MOH-240) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** Setup T003 — inventory model-visible recall / instruction-bind candidates for FR-016 / [contracts/recall.md](../contracts/recall.md) (research R5)
**Branch:** `cursor/p5-setup-runtime-t002-t003-fe1d`
**Surfaces inventoried:** `packages/experimental/agent-team/src/{persona-bind,skill-bind,index}.ts`, `packages/preset/persona/src/`, `packages/core/system-prompt/src/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Seam candidates named | ≥2 concrete Host paths that can place curated memory into prompt assembly |
| Sibling binds located | P2 persona-bind + P3 skill-bind + `agent/created` hook called out |
| Catalog source named | Inject reads Host Memory catalog (see [host-memory-inventory.md](./host-memory-inventory.md)) — not transcript |
| Verifier bar | SC-004 inject = observe assembly/wiring / apply indicator, **not** LLM reply wording |
| Non-goals | No T006 catalog types; no T009 bind doc claimed as final; no T014 implement in this PR |

---

## Requirement (FR-016 / SC-004 / MemoryRecallInject)

From [spec.md](../spec.md), [contracts/recall.md](../contracts/recall.md), [data-model.md](../data-model.md) `MemoryRecallInject`, research R5:

- After restart, surface recall returns curated kinds (separate Client path).
- **Additionally**, Host MUST make ≥1 curated `MemoryRecord` available to a subsequent bot turn via context/instruction injection.
- Injected fact MUST be reconstructable from the session log (model-visible ⟺ logged).
- Prefer scoped instruction section sibling to persona-prefix / skill-instructions (e.g. `agent-teams:memory-recall`).
- Verifier proves the inject/apply path; does **not** score LLM reply wording (FR-014).
- Surface-only without this path fails FR-016 / SC-004. Transcript dump alone fails.

---

## Candidate A — Sibling scoped `systemPrompt.section` (preferred family)

**Sources:** `packages/experimental/agent-team/src/skill-bind.ts`, `persona-bind.ts`, `packages/core/system-prompt/src/index.ts`

| Fact | Detail |
|------|--------|
| Precedent | P2 `bindTeammatePersona` → `deployment:persona-prefix`; P3 `bindTeammateSkillInstructions` → `agent-teams:skill-instructions` |
| Hook | `TeamService` constructor `ctx.on('agent/created', …)` already binds model + persona + skills |
| Mechanism | `agent.ctx.effect(() => agent.ctx.systemPrompt.section({ name, order, text: () => ref.current }), 'agentTeams.memoryRecall')` |
| Suggested section | `agent-teams:memory-recall` (research R5 sketch) — **distinct** from persona-prefix and skill-instructions |
| Order | Skill-bind reuses `DEPLOYMENT_PERSONA_SUFFIX` (10200) order slot with a **different section name**; memory can reuse that order or sit adjacent — T009 picks exact order without colliding names |
| Empty rule | Empty composed text drops at `renderPrompt` (same as persona/skill) |
| Live refresh | Mutable `MemoryBindRef` updated when Host writes/lists rows that should be visible to the live Agent (parallel to persona/skill refs) |
| Session-log honesty | Prefer emitting a reconstructable Team/session event when inject applies, **or** ensuring composed text is derived only from catalog rows already on the Lead log (T009 decides; constitution model-visible ⟺ logged) |

**Fit for P5:** Strongest match to research R5 “cheapest Host injection / sibling bind.” Verifier can `systemPrompt.assemble` + `renderPrompt` for the bot scope and assert ≥1 curated fact substring / section presence.

---

## Candidate B — Direct `systemPrompt.context` on Agent scope

**Source:** `packages/core/system-prompt/src/index.ts` (`context()`, `CONTEXT_ORDERS`)

| Fact | Detail |
|------|--------|
| Role | Dynamic runtime contexts (sandbox policy, approval, subagent delegation) separate from ordered sections |
| Fit | Memory is curated durable prose closer to **instructions** than ephemeral policy context |
| Risk | Context channel is already used for confinement/approval semantics; easier to confuse Verifier observation |
| Verdict | **Defer** unless T009 finds section-channel insufficient |

---

## Candidate C — `@deepseek-ai/dsh-persona` preset row (weaker)

**Source:** `packages/preset/persona/src/index.ts`

| Fact | Detail |
|------|--------|
| Role | Scope-only Cordis row registering `deployment:persona-prefix` / `suffix` |
| Conflict | P2 Host already binds Host-authored persona into the **same** prefix section via Candidate A sibling |
| Fit | Stuffing memory into persona prefix mixes identity with curated recall and breaks Verifier kind distinguishability |
| Verdict | **Reject** as memory inject channel — keep persona for job/voice/anti-jobs only |

---

## Candidate D — `system-prompt/assemble` waterfall mutate (weaker)

| Fact | Detail |
|------|--------|
| Hook | Cordis waterfall `system-prompt/assemble` can mutate `PromptAssembly` |
| Risk | Bypasses named section contracts; harder to shadow/dispose with Agent lifetime |
| Verdict | **Defer** — YAGNI vs R5 sibling section |

---

## Agent Teams spawn / scope wiring (today)

### Live-bind hook (best Host attach point)

| Hook | Location | Parallel |
|------|----------|----------|
| `ctx.on('agent/created', …)` | `TeamService` constructor | Already calls `bindTeammateModelSelection`, `bindTeammatePersona`, `bindTeammateSkillInstructions` |
| Pattern | `*-bind.ts` + private `bindTeammate*` on service | Invent sibling `memory-bind.ts` / `bindTeammateMemoryRecall` (T014 after T009) |

### What exists vs gap

| Piece | Status |
|-------|--------|
| Persona compose + bind | **Present** — `composePersonaPrefix` / `bindTeammatePersona` |
| Skill compose + bind | **Present** — `composeSkillInstructions` / `bindTeammateSkillInstructions` |
| Memory catalog rows | **Absent** — see [host-memory-inventory.md](./host-memory-inventory.md) |
| Memory compose + bind | **Absent** — foundational T009 doc + T014 implement |
| CreateBot user prompt | ``You are bot "${displayName}".`` — **user/message**, not FR-016 inject |

### Layer selection for inject (Pass)

For a subsequent turn on bot B:

1. Include ≥0 **agent-layer** rows with `botId === B` (product may inject a subset).
2. Include ≥0 **user-layer** account rows (available across bots).
3. Pass needs **≥1** curated fact made model-visible (any kind/layer combination that satisfies SC-004).

Bot B MUST NOT receive bot A’s **agent-layer** rows as B’s agent memory solely because A saved them (ADR / US5) — inject filter must honor `botId` + `layer`.

---

## Recommended bind approach (inventory opinion → T009)

| Prefer | Why |
|--------|-----|
| **Host effect on teammate `agent.ctx`** registering scoped `agent-teams:memory-recall` section (Candidate A) | Same lifetime as persona/skill binds; create + cold resume via `agent/created`; Verifier assemble/render proof path already proven in P2/P3 tests |
| Source of truth | Durable Host `MemoryRecord` catalog on Lead journal — not Electron, not Client, not transcript |
| Compose rule | Join non-empty trimmed contents (optionally label kind/layer for observability); empty catalog ⇒ empty section |
| Session-log | Document how inject remains reconstructable (catalog events on Lead log and/or explicit inject event) |
| Do not | Overwrite persona-prefix or skill-instructions; do not use createBot user prompt as substitute |

Document the chosen approach in T009 (`verifier/memory-inject-bind.md`); implement in T014 / US4 Host tasks.

---

## Observability map (SC-004 inject later)

| Observation | How |
|-------------|-----|
| Durable catalog | Host list / Client surface after restart (SC-004 surface half) |
| Instruction wiring | After save + subsequent turn (or immediate `systemPrompt.assemble` for bot scope): rendered memory section contains ≥1 curated fact (or structured equivalent) |
| Optional indicator | Client may show inject/application indicator when Host exposes one — not required to score LLM wording |
| Non-observation | LLM assistant reply paraphrase |

---

## Explicit non-touch (Setup)

- No change to `createBot` prompt string as a substitute for memory inject
- No new prompt protocol outside system-prompt (research R5)
- No Electron Main injection bus
- Catalog SoT inventory is [host-memory-inventory.md](./host-memory-inventory.md) (T002)
- Foundational doc T009 + implement T014 own the final pick and code

---

## Evidence for Verifier / PO

Inventory is source-derived from persona-bind, skill-bind, TeamService `agent/created` wiring, `dsh-persona`, and `dsh-system-prompt` on branch tip vs [contracts/recall.md](../contracts/recall.md). Setup T003 delivers this note only; SC-004 inject recipes land with T009/T026.
