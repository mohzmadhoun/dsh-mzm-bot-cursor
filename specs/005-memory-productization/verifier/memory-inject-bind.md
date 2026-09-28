# T009 — Host MemoryRecallInject / instruction-bind approach (SC-004 inject)

**Status:** Approach locked (Foundational doc; no product behavior change in this PR)
**Owners:** DH Verifier (this doc + SC-004 inject observation) · DH Runtime (T024 implement) · PO (scope)
**Linear:** [MOH-246](https://linear.app/momadhoun/issue/MOH-246) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** T009 — document Host bind of ≥1 curated `MemoryRecord` into subsequent bot-turn instruction assembly (FR-014 / FR-016 / research R5 / SC-004 inject half)
**Inventory basis:** [memory-inject-inventory.md](./memory-inject-inventory.md) (T003 / MOH-240 on master)
**Catalog SoT:** [host-memory-inventory.md](./host-memory-inventory.md) (T002) · [contracts/recall.md](../contracts/recall.md) · [data-model.md](../data-model.md) `MemoryRecallInject`
**Surfaces:** `@deepseek-ai/dsh-system-prompt` (`packages/core/system-prompt/`) · Agent Teams Host (`packages/experimental/agent-team/`) · Host Memory catalog (T006–T008)

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Approach chosen | One normative Host bind path named; Candidates B/C/D deferred or rejected per inventory |
| Compose rule | Join non-empty trimmed curated contents from Host catalog; empty catalog ⇒ **no** instruction prose |
| Attach lifetime | Bind on create **and** cold resume via `agent/created`; live refresh when Host writes rows that should be visible |
| Session-log | Injected fact reconstructable from Lead journal / session log (model-visible ⟺ logged) |
| Verifier bar | SC-004 inject = assembly / wiring / apply indicator — **not** LLM reply wording |
| Non-goals | No T024 code here; no Electron Main inject bus; no transcript dump; no `createBot` user-prompt substitute |

---

## Requirement (FR-016 / SC-004 inject / MemoryRecallInject)

From [spec.md](../spec.md), [contracts/recall.md](../contracts/recall.md), research R5, and the data-model entity:

- After restart, surface recall returns curated kinds (separate Client path — T023 / Scenario 2).
- **Additionally**, Host MUST make ≥1 curated `MemoryRecord` available to a subsequent bot turn via context/instruction injection.
- Injected fact MUST be reconstructable from the session log.
- Prefer scoped instruction section sibling to persona-prefix / skill-instructions.
- Verifier proves the inject/apply path; does **not** score LLM reply wording (FR-014).
- Surface-only without this path fails FR-016 / SC-004. Transcript dump alone fails ([transcript-not-memory.md](./transcript-not-memory.md)).

---

## Chosen approach (normative for T024)

**Host effect on teammate `agent.ctx`** that registers a scoped `agent-teams:memory-recall` system-prompt section whose text is composed from durable Host `MemoryRecord` catalog rows.

| Decision | Choice |
|----------|--------|
| **Primary mechanism** | **Candidate A** — direct `agent.ctx.systemPrompt.section({ name: 'agent-teams:memory-recall', … })` sibling to P2 persona-prefix and P3 skill-instructions |
| Why not Candidate B (`systemPrompt.context`) | Memory is curated durable prose closer to instructions than ephemeral policy context; context channel already carries confinement/approval semantics |
| Why not Candidate C (`dsh-persona` preset) | Stuffing memory into persona prefix mixes identity with curated recall and breaks Verifier kind distinguishability — **rejected** |
| Why not Candidate D (`system-prompt/assemble` waterfall) | Bypasses named section contracts; harder to shadow/dispose with Agent lifetime — **deferred** (YAGNI vs R5) |
| Source of truth | Durable Host `MemoryRecord` catalog on Lead journal (T006–T008) — never Electron Main, never Client-only, never transcript |
| Section identity | `agent-teams:memory-recall` — **distinct** from `deployment:persona-prefix` and `agent-teams:skill-instructions` |
| Section order | Same order family as skill-instructions (`DEPLOYMENT_PERSONA_SUFFIX` / 10200) **or** adjacent; MUST NOT collide section **names**; T024 picks the exact constant |

### Compose (normative empty-catalog rule)

```text
text := joinNonEmpty([
  for row in eligibleMemoryRows(botId):
    content = row.content.trim()
    content ? optionalLabel(row) + content : ''
])
```

- `eligibleMemoryRows(botId)` includes:
  1. ≥0 **agent-layer** rows with `botId` matching the turn’s bot.
  2. ≥0 **user-layer** account rows (available across bots).
- Product MAY inject a subset; Pass needs **≥1** curated fact made model-visible (any kind/layer combination that satisfies SC-004).
- Bot B MUST NOT receive bot A’s **agent-layer** rows as B’s agent memory solely because A saved them (ADR / US5).
- `joinNonEmpty` drops blank parts; if the result is empty, register **no** instruction prose (do not invent filler).
- Optional kind/layer labels are allowed for observability; Verifier asserts **curated content substrings** appear in the rendered memory section (or structured equivalent), not fixed English chrome.
- Exact label strings may be adjusted in T024 if i18n/locale ownership requires it.

### Attach point (parallel to persona / skill binds)

| Hook | Location | Obligation |
|------|----------|------------|
| `ctx.on('agent/created', …)` | `TeamService` (already binds model + persona + skills) | Also bind memory-recall text from durable Host catalog (create + cold resume) |
| Sibling effect | Pattern: `memory-bind.ts` / `bindTeammateMemoryRecall` | Invent sibling effect id (e.g. `agentTeams.memoryRecall`) in T024 |
| Live refresh | Mutable `MemoryBindRef` updated when Host writes/lists rows that should be visible to the live Agent | Parallel to persona/skill refs — subsequent turns see new facts without Agent recreate |

**Forbidden substitutes:** Changing `createBot`’s initial user prompt, dumping chat transcript into the prompt, Client-only persistence, or Electron Main inject IPC does **not** satisfy FR-016.

### Session-log reconstructability (model-visible ⟺ logged)

| Rule | Choice |
|------|--------|
| Primary | Composed section text is a **pure function** of durable Host catalog rows already reconstructable from Lead journal / catalog write events |
| Optional apply stamp | T024 MAY emit an explicit Team/session inject/apply event when the bind applies, for Verifier greppability — MUST NOT invent content absent from the catalog |
| Forbidden | Injecting prose that cannot be rebuilt from Host catalog + session log |

---

## Verifier observation (SC-004 inject)

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Wiring | After ≥1 curated save, for that bot’s Agent scope: `systemPrompt.assemble` / `renderPrompt` (or Host equivalent) includes ≥1 curated fact substring in the memory-recall section (or structured equivalent) | Missing curated fact in assembly |
| Layer honesty | Bot B assembly does not gain A’s agent-layer rows solely because A saved them | Cross-bot agent-layer leakage |
| Lifetime | Bind holds on subsequent turns after save **and** after cold resume / reload that recreates the Agent | Bind only on first create, lost on resume |
| Reconstructability | Injected content matches Host catalog rows present on Lead journal / session log | Orphan inject text with no catalog source |
| Non-observation | Optional Client inject/application indicator when Host exposes one | LLM assistant reply wording, “memory adherence” judgment |

Scenario 2 recipe (T026) owns the rerunnable desktop script for full SC-004 (surface + inject); this doc locks the Host inject approach and the Pass bar those scripts must use for the inject half.

### Suggested Host observation recipe (for T026 / Runtime unit)

1. Persist ≥1 non-empty curated `MemoryRecord` eligible for bot A (agent and/or user layer).
2. Obtain the live Agent scope for A (post-save turn path **or** immediate `assemble({ scope: botAgent.ctx })` after bind).
3. Assert rendered memory-recall section (or full prompt) **contains** that curated content substring.
4. Assert bot B does **not** gain A’s agent-layer content solely from A’s save.
5. Restart / cold-resume Agent A; repeat assemble assert (bind reattached via `agent/created`).
6. Confirm catalog rows remain on Host list after restart (surface half — separate observation).
7. **Do not** assert assistant message text.

---

## Explicit non-goals (this foundational slice)

- No T024 implementation in this PR
- No new prompt protocol outside `system-prompt` sections
- No Electron Main memory inject bus (T010–T011)
- No Verifier gate on LLM reply wording
- No change to P2 persona or P3 skill section semantics beyond coexistence with a sibling memory-recall section
- No stamp of T013 / product SC — Host catalog + Electron guards still required

---

## Traceability

| Artifact | Role |
|----------|------|
| [memory-inject-inventory.md](./memory-inject-inventory.md) | T003 seam candidates A–D + Agent Teams attach map |
| [host-memory-inventory.md](./host-memory-inventory.md) | T002 catalog SoT inventory |
| [transcript-not-memory.md](./transcript-not-memory.md) | T012 Pass-path guard (transcript ≠ curated; Client ≠ SoT) |
| This file | T009 chosen approach + SC-004 inject observation bar |
| T006–T008 | Host types + catalog + Remotes |
| T024 | Runtime implements Host effect + compose |
| T026 | Scenario 2 recipe executes SC-004 on real desktop |

## Evidence for PO / DH Lead

Approach is inventory-derived: **Candidate A** primary (scoped `agent-teams:memory-recall` sibling to persona/skill binds), Candidate B deferred, Candidate C rejected, Candidate D deferred. Verifier SC-004 inject remains wiring-only. Implementation owned by T024; no `packages/` or `apps/` edits in T009.
