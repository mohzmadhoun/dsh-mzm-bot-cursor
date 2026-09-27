# T012 — Host instruction-bind for attached skills (SC-007)

**Status:** Approach locked (Foundational doc; no live bind implementation in this PR — T021 owns code)
**Owners:** DH Verifier (this doc + SC-007 observation) · DH Runtime (T021 implement) · PO (scope)
**Linear:** [MOH-159](https://linear.app/momadhoun/issue/MOH-159) · Epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142)
**Acceptance slice:** T012 — document Host bind of attached skill instructional bodies into bot instruction assembly (FR-014 / clarify lock 5 / SC-007)
**Inventory basis:** [attachment-bind-inventory.md](./attachment-bind-inventory.md) (T003 / MOH-150)
**Contract:** [attach-run.md](../contracts/attach-run.md)
**Surfaces:** `@deepseek-ai/dsh-persona` · `@deepseek-ai/dsh-system-prompt` · Agent Teams Host (`packages/experimental/agent-team/`) · `ctx.skills` catalog

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Approach chosen | One normative Host bind path named; Candidate C deferred |
| Compose rule | Each attached skill’s non-empty instructional body appears in assembly order; empty/missing bodies contribute **no** prose |
| Attach lifetime | Bind on create/resume **and** refresh after Host attach while Agent is live |
| Verifier bar | SC-007 = assembly / wiring observation only — **not** LLM reply wording |
| Non-goals | No T021 code here; no Electron Main store; no persona-field overwrite of P2 job/voice/antiJobs |

---

## Requirement (FR-014 / SC-007)

From [spec.md](../spec.md), research R6, and the attach-run contract:

- After attach, Skill `instructionalBody` MUST appear in that bot’s **instruction / system-prompt assembly** on subsequent turns.
- Multi-attach: all attached bodies for **that** bot participate; bot B is unaffected by A’s attachments (SC-006).
- Verifier Pass checks wiring presence in assembly (or equivalent Host observation), **not** LLM reply adherence (clarify lock 5).

---

## Chosen approach (normative for T021)

**Host effect on teammate `agent.ctx`** that registers a scoped system-prompt section whose text is composed from durable `skillAttachments` + catalog skill bodies (`ctx.skills.get`).

| Decision | Choice |
|----------|--------|
| **Primary mechanism** | **Candidate B** — direct `agent.ctx.systemPrompt.section({ … })` sibling to P2 `bindTeammatePersona` |
| Why not Candidate A as primary | P2 already owns `deployment:persona-prefix` for job/voice/antiJobs; mounting `dsh-persona` again would collide or overwrite persona |
| Candidate A allowed? | **Only** if Runtime composes skill bodies into `deployment:persona-suffix` via in-scope `dsh-persona` **without** clearing P2 prefix — equivalent alternate, not a second channel |
| Candidate C (`assemble` waterfall) | **Deferred** — YAGNI vs research R6 |
| Source of truth | Durable Host Bot `skillAttachments` on the Team member snapshot + Host `ctx.skills` bodies — never Electron Main, never Client-only |
| Section identity | Prefer a dedicated Host section name (e.g. `agent-teams:skill-instructions`) **or** `deployment:persona-suffix` if Architect prefers reuse of the persona suffix slot; must not erase P2 persona prefix |

### Compose (normative empty-body rule)

```text
text := joinNonEmpty([
  for attachment in skillAttachments (stable Host order):
    body = skills.get(attachment.skillId)?.content
    body?.trim() ? body.trim() : ''   # skip missing / empty
])
```

- If the join is empty, register **no** instruction prose for this bind (do not invent filler).
- Verifier asserts **instructional body substrings** appear in the rendered section (or structured equivalent), not fixed English chrome around them.
- Do not fold skill bodies into P2 `job` / `voice` / `antiJobs` fields.

### Attach point (parallel to persona bind)

| Hook | Location | Obligation |
|------|----------|------------|
| `ctx.on('agent/created', …)` | `TeamService` (already binds model + persona) | Also bind skill-instruction text from durable `skillAttachments` |
| Post-attach refresh | Sibling of `refreshTeammatePersonaBind` | Update live ref after Host `attachSkill` so subsequent turns see new bodies without Agent recreate |
| Body load | `ctx.skills.get(skillId)` (Host catalog) | Missing skill ⇒ skip that attachment’s prose; do not fail the whole assemble silently as success if Pass requires the body — T021 may fail-loud when the attached id is unknown at attach time |

**Forbidden substitute:** Showing the skill only on a Client catalog row, or putting the body solely in the createBot user prompt, does **not** satisfy FR-014.

---

## Verifier observation (SC-007)

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Wiring | After attach, for that bot’s Agent scope: `systemPrompt.assemble` / `renderPrompt` (or Host equivalent) includes each attached skill’s instructional body text | Missing attached body in assembly |
| Per-bot | Bot B assembly does not gain A’s attachments solely because A attached | Cross-bot leakage |
| Lifetime | Bind holds on subsequent turns after attach **and** after cold resume / reload that recreates the Agent | Bind only until first turn, lost on resume |
| Non-observation | — | LLM assistant reply wording, “skill adherence” judgment, detach-as-Pass-gate |

Scenario 2 recipe (T026) owns the rerunnable desktop script; this doc locks the Host approach and the Pass bar those scripts must use.

### Suggested Host observation recipe (for T026 / Runtime unit)

1. Attach `mzm-thin-pack` (body contains `Follow the MzM thin-pack playbook for Pass.`) to bot A; leave bot B without that attachment.
2. Obtain live Agent scope for A (post-attach path **or** `assemble({ scope: botAgent.ctx })` after bind).
3. Assert rendered prompt / skill section **contains** the greppable thin-pack body.
4. Assert bot B assembly does **not** gain that body solely from A’s attach.
5. Restart / cold-resume Agent A; repeat assemble assert.
6. **Do not** assert assistant message text.

---

## Explicit non-goals (this foundational slice)

- No T021 implementation in this PR
- No new prompt protocol outside `system-prompt` sections
- No Electron Main instruction or skill store
- No Verifier gate on LLM reply wording
- No change to P2 persona field semantics beyond coexistence with a sibling skill-instruction section

---

## Traceability

| Artifact | Role |
|----------|------|
| [attachment-bind-inventory.md](./attachment-bind-inventory.md) | T003 seam candidates A/B/C + Agent Teams attach map |
| This file | T012 chosen approach + SC-007 observation bar |
| T008–T011 | Types / persistence / mutation stubs / projection for `skillAttachments` |
| T021 | Runtime implements Host effect + compose |
| T026 | Scenario 2 recipe executes SC-002 / SC-006 / SC-007 on real desktop |

## Evidence for PO / DH Lead

Approach is inventory-derived: Candidate B primary (direct scoped system-prompt section sibling to P2 persona bind), Candidate A only as persona-suffix equivalent that preserves P2 prefix, Candidate C deferred. Verifier SC-007 remains wiring-only. Implementation owned by T021.
