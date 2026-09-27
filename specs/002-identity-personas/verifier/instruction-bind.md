# T009 — Host instruction-bind approach (SC-008)

**Status:** Approach locked (Foundational doc; no product behavior change in this PR)
**Owners:** DH Verifier (this doc + SC-008 observation) · DH Runtime (T014 implement) · PO (scope)
**Linear:** [MOH-108](https://linear.app/momadhoun/issue/MOH-108) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** T009 — document Host bind of saved non-empty job / voice / anti-jobs into bot instruction assembly (FR-013 / clarify lock 1 / SC-008)
**Inventory basis:** [instruction-bind-inventory.md](./instruction-bind-inventory.md) (T003 / MOH-102 on master)
**Contract:** [persona-profile.md](../contracts/persona-profile.md)
**Surfaces:** `@deepseek-ai/dsh-persona` (`packages/preset/persona/`) · `@deepseek-ai/dsh-system-prompt` (`packages/core/system-prompt/`) · Agent Teams Host (`packages/experimental/agent-team/`)

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Approach chosen | One normative Host bind path named; Candidate C deferred |
| Compose rule | Non-empty job / voice / antiJobs → instruction text; empty fields contribute **no** instruction prose |
| Attach lifetime | Bind on create **and** cold resume via the same live-Agent hook as model selection |
| Verifier bar | SC-008 = assembly / wiring observation only — **not** LLM reply wording |
| Non-goals | No T014 code here; no Electron Main store; no `createBot` user-prompt substitute |

---

## Requirement (FR-013 / SC-008)

From [spec.md](../spec.md), research R2, and the persona-profile contract:

- After save, non-empty `job` / `voice` / `antiJobs` MUST appear in that bot’s **instruction / system-prompt assembly** on subsequent turns.
- Empty fields contribute no instruction text.
- Verifier Pass checks wiring presence in assembly (or equivalent Host observation), **not** LLM reply adherence (clarify lock 1).

---

## Chosen approach (normative for T014)

**Host effect on teammate `agent.ctx`** that registers a scoped `deployment:persona-prefix` section whose text is composed from the durable Bot persona snapshot.

| Decision | Choice |
|----------|--------|
| **Primary mechanism** | **Candidate B** — direct `agent.ctx.systemPrompt.section({ name: 'deployment:persona-prefix', … })` |
| Why not Candidate A as primary | Same section names and shadowing; direct section matches subagent `applyChildComposition` and avoids persona-plugin mount ceremony / global-collision rules on Agent Teams product bots |
| Candidate A allowed? | **Equivalent alternate** only if Runtime mounts `@deepseek-ai/dsh-persona` **inside the agent scope** with `prefix` = the same composed text (and optional unused `suffix`). Must not invent a second prompt channel |
| Candidate C (`system-prompt/assemble` waterfall mutate) | **Deferred** — bypasses named persona shadowing; YAGNI vs research R2 |
| Source of truth | Durable Host Bot `persona` on the Team member snapshot (T005–T006), never Electron Main, never Client-only |
| Shadowing | Host-composed prefix **shadows** preset / deployment persona for that Agent so product edits win |

### Compose (normative empty-field rule)

```text
prefix := joinNonEmpty([
  job ? `Job: ${job}` : '',
  voice ? `Voice: ${voice}` : '',
  antiJobs.length ? `Anti-jobs:\n- ${antiJobs.join('\n- ')}` : '',
])
```

- `joinNonEmpty` drops blank parts; if the result is empty, register **no** instruction prose for this bind (do not invent filler).
- Exact label strings may be adjusted in T014 if i18n/locale ownership requires it; Verifier asserts **field values** appear in the rendered persona section (or structured equivalent), not fixed English chrome.
- Optional `deployment:persona-suffix` remains unused unless a later task needs it; empty suffix must not add filler text.

### Attach point (parallel to model-selection bind)

| Hook | Location | Obligation |
|------|----------|------------|
| `ctx.on('agent/created', …)` | `TeamService` (already binds model selection) | Also bind instruction text from durable persona snapshot (create + cold resume) |
| Sibling effect | Pattern: `agent.ctx.effect(() => …, 'agentTeams.modelSelection')` | Invent sibling effect id (e.g. `agentTeams.persona` / instruction bind) in T014 |
| Section order | `getSectionOrder('DEPLOYMENT_PERSONA_PREFIX')` | Keep deployment persona prefix order so assembly stays ordered with existing system-prompt contracts |

**Forbidden substitute:** Changing `createBot`’s initial user prompt (`You are bot "…".`) does **not** satisfy FR-013. That string is a user/message, not the system-prompt persona slot.

### Continuable children / presets

Agent Teams product bots inherit preset join from the subagent stack. Host-owned job / voice / anti-jobs MUST **override/shadow** any static preset `dsh-persona` for that Agent so FR-013 is Host-authoritative (inventory + research R1/R2).

---

## Verifier observation (SC-008)

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Wiring | After save, for that bot’s Agent scope: `systemPrompt.assemble` / `renderPrompt` (or Host equivalent) includes each **non-empty** saved job, voice, and anti-job value in the persona prefix (or structured equivalent) | Missing non-empty field in assembly |
| Empty fields | Empty job / voice / antiJobs add **no** instruction prose for those fields | Filler text invented for empty fields |
| Lifetime | Bind holds on subsequent turns after save **and** after cold resume / reload that recreates the Agent | Bind only on first create, lost on resume |
| Non-observation | — | LLM assistant reply wording, “persona adherence” judgment, skills/memory UX |

Scenario 1 recipe (T019) owns the rerunnable desktop script; this doc locks the Host approach and the Pass bar those scripts must use.

### Suggested Host observation recipe (for T019 / Runtime unit)

1. Persist non-empty `job`, `voice`, ≥1 `antiJob` on a bot; leave one other persona field empty if present.
2. Obtain the live Agent scope (post-save turn path **or** immediate `assemble({ scope: botAgent.ctx })` after bind).
3. Assert rendered persona-prefix (or full prompt) **contains** each non-empty saved value.
4. Assert the intentionally empty field contributes no corresponding instruction prose.
5. Restart / cold-resume Agent; repeat assemble assert (bind reattached via `agent/created`).
6. **Do not** assert assistant message text.

---

## Explicit non-goals (this foundational slice)

- No T014 implementation in this PR
- No new prompt protocol outside `system-prompt` persona sections
- No Electron Main instruction or persona store
- No Verifier gate on LLM reply wording
- No change to P1 model-assignment bind semantics beyond adding a sibling persona effect later

---

## Traceability

| Artifact | Role |
|----------|------|
| [instruction-bind-inventory.md](./instruction-bind-inventory.md) | T003 seam candidates A/B/C + Agent Teams attach map |
| This file | T009 chosen approach + SC-008 observation bar |
| T014 | Runtime implements Host effect + compose |
| T019 | Scenario 1 recipe executes SC-001 / SC-002 / SC-008 on real desktop |
| T011 | Foundational Pass checklist requires this doc present |

## Evidence for PO / DH Lead

Approach is inventory-derived: Candidate B primary (direct scoped `deployment:persona-prefix`), Candidate A equivalent only via in-scope `dsh-persona` with the same composed `prefix`, Candidate C deferred. Verifier SC-008 remains wiring-only. Implementation owned by T014; no `packages/` or `apps/` edits in T009.
