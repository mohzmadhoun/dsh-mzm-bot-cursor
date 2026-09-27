# T003 — Bot attachment + instruction-bind candidates (Setup inventory)

**Status:** Inventory complete (Setup; no product behavior change in this doc alone)
**Owners:** DH Runtime (author) · DH Verifier (SC-007 wiring later) · PO (scope)
**Linear:** [MOH-150](https://linear.app/momadhoun/issue/MOH-150) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** Setup T003 — inventory bot-attachment + instruction-bind candidates for FR-003/014 / [contracts/attach-run.md](../contracts/attach-run.md) (clarify lock 5)
**Branch:** `cursor/p3-foundation-host-fe1d`
**Surfaces inventoried:** `packages/experimental/agent-team/src/{types,roster,index,projection}.ts`, `packages/preset/persona/src/`, `packages/core/system-prompt/src/`

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Attachment store candidates named | ≥1 Host-owned path for per-bot `skillAttachments` (prefer Bot snapshot) |
| Bind seam candidates named | ≥2 concrete Host paths that can place attached skill bodies into prompt assembly |
| Scope wiring located | Agent Teams live-Agent hook (`agent/created` + persona-bind sibling) called out |
| Verifier bar | SC-007 = observe assembly/wiring, **not** LLM reply wording |
| Non-goals | No T008 type edits claimed here; no US2 Client attach UI; no Electron attachment store |

---

## Requirement (FR-003 / FR-014 / SC-007)

From [spec.md](../spec.md), research R4/R6, and attach-run contract:

- Attach associates a load-available Skill to one Bot; A’s attachment does not imply B’s.
- Multi-attach per Bot allowed; Pass proves ≥1.
- After attach, Skill `instructionalBody` participates in that Bot’s instruction assembly on subsequent turns.
- Verifier Pass checks wiring presence in assembly (or equivalent Host observation), not LLM reply adherence (clarify lock 5).

---

## Attachment store candidates

### Preferred — extend Host Bot snapshot (`skillAttachments`)

**Source:** `packages/experimental/agent-team/src/types.ts` + `projection.ts` + `journal.ts` + `roster.ts`

| Fact | Detail |
|------|--------|
| Precedent | P2 `persona` / `avatar` / `sectionId` on `TeamMemberSnapshot`; post-active `team/member` appends |
| Target field | Ordered `skillAttachments: { botId, skillId }[]` (≥0) on the Bot row ([data-model.md](../data-model.md)) |
| Persistence | Lead Session `team/member` via `TeamJournal` — restart/reload rebuilds from projection (research R4) |
| Projection | Extend Zod snapshot schema + `TeamMemberView`; allow active→active mutation like persona |
| Mutations | New Host `attachSkill` (+ optional detach stub) Remotes on `TeamService` — Electron Main must not invent rows |

**Fit for P3:** Simplest Host-owned store; matches research R4 “preferred extension of Agent Teams bot record.”

### Alternate — separate Host attachment map service

| Fact | Detail |
|------|--------|
| Shape | Map keyed by `botId` → ordered `skillId[]`, outside `team/member` |
| Cost | New journal event type / projection key; more seams for same Pass bar |
| Verdict | **Defer** unless Runtime hits snapshot/immutability conflicts (Architect confirm only) |

### Rejected — Electron Main attachment store

Parallel bus; violates thin shell / research R2/R4. Guard owned by Electron T013.

---

## Instruction-bind seam candidates

### Candidate A — `@deepseek-ai/dsh-persona` (preset row)

**Source:** `packages/preset/persona/src/index.ts`

| Fact | Detail |
|------|--------|
| Role | Scope-only Cordis row; registers `deployment:persona-prefix` + `deployment:persona-suffix` |
| Config | `prefix` (required), optional `suffix` |
| Constraint | Must mount inside an **agent scope**; global mount collides with registry persona |
| Fit | Compose attached skill bodies into `prefix`/`suffix` text; risks colliding with P2 persona prefix already bound by Host |

### Candidate B — Direct `systemPrompt.section` on Agent scope (preferred family)

**Source:** `packages/core/system-prompt/src/index.ts` + P2 `persona-bind.ts`

| Fact | Detail |
|------|--------|
| Precedent | `bindTeammatePersona` registers scoped `deployment:persona-prefix` from durable Bot persona |
| Registry | `SystemPrompt.section` / `assemble` / `renderPrompt`; empty text omitted at render |
| Fit | Sibling Host effect (e.g. dedicated section name or composed suffix) that injects attached skill instructional bodies without a second prompt protocol (research R6) |

### Candidate C — `system-prompt/assemble` waterfall mutate (weaker)

| Fact | Detail |
|------|--------|
| Hook | Waterfall can mutate `PromptAssembly` |
| Risk | Bypasses named section shadowing; YAGNI vs R6 |
| Verdict | **Defer** |

---

## Agent Teams spawn / scope wiring (today)

### Product create + P2 persona bind

`TeamService` (`packages/experimental/agent-team/src/index.ts`):

1. `createBot` → roster spawn → durable `team/member`.
2. On `agent/created`: `bindTeammateModelSelection` + `bindTeammatePersona` (P2 FR-013).
3. Persona compose lives in `persona-bind.ts` → `deployment:persona-prefix`.

**Gap:** No `skillAttachments` on snapshot/view; no attach Remote; no skill-body section bind (T008–T012 / T020–T021).

### Live-bind hook (best Host attach point for FR-014)

| Hook | Location | P3 note |
|------|----------|---------|
| `ctx.on('agent/created', …)` | Already binds model + persona | Add skill-instruction bind from durable `skillAttachments` + catalog bodies (T021; approach locked in T012) |
| Post-attach refresh | Parallel to `refreshTeammatePersonaBind` | Live Agent should see new attachments without requiring Agent recreate |

### Roster / projection today

| Surface | Attachment support |
|---------|-------------------|
| `TeamMemberSnapshot` / `TeamMemberView` | **Absent** `skillAttachments` |
| `identityViewFields` in `roster.ts` | Forwards persona/avatar/sectionId only |
| Projection immutability | active→active allows persona/avatar/section/displayName; extend for attachments |
| `TeamView` | Roster + tasks + sections + handoffs; **no** skill catalog summary yet (T011) |

---

## Compose sketch (non-normative; T012 decides)

```text
# After attach, for each skillAttachments[i] in order:
skillBodies := joinNonEmpty(load(skillId).instructionalBody for each attachment)
# Inject via Candidate B sibling section (or persona suffix) so SC-007 can observe bodies in assemble/render
# Do not score LLM assistant replies
```

---

## Explicit non-touch (Setup)

- Electron Main skills/attachment bus (T013)
- Client attach/run UI (US2)
- Full instruction-bind **implementation** (T021) — inventory + T012 approach doc only
- Detach-as-Pass-gate; plugin skills; learn-from-demo

---

## Traceability

| Artifact | Role |
|----------|------|
| This file | T003 candidates for attachment store + bind seams |
| [host-skills-inventory.md](./host-skills-inventory.md) | T002 catalog / thin-pack mount map |
| T008–T011 | Types, persistence, mutation stubs, projection |
| T012 | Chosen instruction-bind approach + SC-007 observation bar |
| T020–T021 | Attach mutation + live bind implementation |

## Evidence for Verifier / PO

Inventory is source-derived from Agent Teams + persona/system-prompt packages on branch tip vs [data-model.md](../data-model.md) and [contracts/attach-run.md](../contracts/attach-run.md). No behavior tests required for Setup T003 alone.
