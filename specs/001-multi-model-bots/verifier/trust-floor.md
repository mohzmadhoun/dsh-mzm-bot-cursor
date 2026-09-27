# Trust floor — per-bot scope isolation + no external send/post (T013)

**Feature:** `specs/001-multi-model-bots`
**Role:** DH Verifier measured confirms for FR-011 · FR-012 · research R7 · T013
**Spec:** [../spec.md](../spec.md) FR-011, FR-012 · Out of Scope
**Architecture:** [../architecture.md](../architecture.md) Agent scope / trust floor
**Related:** [non-goals.md](./non-goals.md) (FR-010 Shell/Box) · [credentials-ipc.md](./credentials-ipc.md) (FR-008/009) · [t015-model-bind.md](./t015-model-bind.md) (FR-002 bind)

## Verdict (T013) — Verifier Pass

**Pass** recorded at SHA `22e2578864` on `cursor/p1-t013-trust-floor-92fa` (evidence: [evidence/t013-trust-floor/](./evidence/t013-trust-floor/)). Measured Host wiring isolates per-bot model assignment and Agent-scoped tool privilege. Phase 1 product acceptance (SC-001…SC-006) MUST NOT require tools that send or post to external destinations. No DH Runtime code change is required for this claim on the measured tree.

## FR-011 — Per-bot scope isolates model + tool privilege

### Obligations

| Obligation | Rule |
|------------|------|
| Model assignment | Bot A’s `{ provider, model, reasoningEffort? }` MUST NOT rewrite Bot B’s route |
| Tool privilege | Registrations on Bot A’s Agent scope MUST NOT grant Bot B those privileges by default |
| Spawn default | Product Bot create uses a **fresh** child Agent (own Session); it MUST NOT inherit another bot’s scoped tools |

### Measured Host wiring (no Runtime gap)

| Fact | Symbol / location |
|------|-------------------|
| Agent-scoped world | `Agent.ctx` — tools, prompt sections, listeners, `restrict()`, and model bind apply to that Agent alone and unwind on dispose (`packages/core/agent/README.md`; `CreateAgentOptions.setup` in `packages/core/agent/src/index.ts`) |
| Model bind | `installModelSelection(agentCtx, selection)` couples route to that Agent’s `system-prompt/assemble` + `agent/request` only (`packages/core/agent/src/model-selection.ts`) |
| Team bind on create | `TeamService` `agent/created` → `bindTeammateModelSelection` → `agent.ctx.effect(() => installModelSelection(...))` (`packages/experimental/agent-team/src/index.ts`, `model-selection-bind.ts`) |
| Product Bot create | `TeamService.createBot` → `roster.spawn` with `context: 'fresh'`, `provider: 'spawn'`, `agentOptions: modelSelection` (`packages/experimental/agent-team/src/index.ts` `createBot`) |
| Fresh child backend | `SpawnInProcessProvider.inheritsParentContext = false` — child is a new Agent/Session, zero parent conversation (`packages/subagent/subagent-spawn-in-process/src/index.ts`) |
| Continuable start | `TeamRoster.spawn` passes `agentOptions` into `ctx.subagents.startContinuable` (`packages/experimental/agent-team/src/roster.ts`) |
| Team tools per Agent | `tool-agent-team` `install(agent)` registers nine Team tools on `agent.ctx.tools` only; disposed with that Agent (`packages/experimental/tool-agent-team/src/index.ts`) |

**measured:** Composition-wide tools (base registry rows) are shared by design across Agents in the same Host process. FR-011 forbids **cross-bot inheritance of another bot’s Agent-scoped privilege**, not the shared Host floor. Bot-local binds (`installModelSelection`, Team tool install on `agent.ctx`) stay on that Agent.

**measured:** `createBot` always uses `context: 'fresh'`. Model-tool `spawn_teammate` may choose `fork` (Lead history prefix only); fork still mints a distinct child Agent with its own scoped world — history inheritance is not tool-privilege inheritance.

### Rerunnable checks (Verifier)

```sh
# Per-bot ModelSelection isolation (FR-002/011 model half)
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts \
  -t 'binds Bot ModelSelection via installModelSelection'

# Agent-scoped Team tool registration (privilege install path)
pnpm exec vitest run packages/experimental/tool-agent-team/tests/tool-team.spec.ts \
  -t 'installs the complete scoped schema'
```

Cross-link T015 recipe for durable bind + peer isolation detail: [t015-model-bind.md](./t015-model-bind.md).

## FR-012 — No external send/post in P1 acceptance tools

### Obligations

| Obligation | Rule |
|------------|------|
| Acceptance tools | Tools **required** for Scenario 1–5 / SC-001…SC-006 Pass MUST NOT send or post to destinations outside the Host process |
| Host mailbox | Team `send_message` is **in-process** peer delivery (Lead-log mailbox → target inbox). It is not external network publish |
| Non-dependence | Presence of broader Host tools (Shell, web_search/web_fetch, MCP) MUST NOT become a Pass dependency for P1 product scenarios |

### What counts as external send/post

**In scope for Fail:** any acceptance path that requires a tool to publish or POST to an external network destination (webhook, email, Slack/other connectors, browser “submit”, outbound Shell `curl`/`wget` posts, MCP connector product sends).

**Not Fail by themselves:**

- Host LLM provider HTTP (model requests via `ctx.llm` + credentials) — not a model-facing acceptance **tool**
- Host Team mailbox `send_message` / peer Steer — in-process FR-004 path
- Read-oriented Host tools present in base composition but **not required** for SC Pass (same posture as Shell under [non-goals.md](./non-goals.md))

### Measured composition notes

| Layer | Finding |
|-------|---------|
| Agent Teams tools | Nine tools: `spawn_teammate`, `send_message`, `list_agents`, `wait_agent`, `interrupt_agent`, `team_task_*` — Host coordination only (`packages/experimental/tool-agent-team/src/index.ts`) |
| Shell / Box | Not required for P1 acceptance — [non-goals.md](./non-goals.md) (FR-010) |
| Base `tool-web` | `packages/bundle/base/cordis.patch.yml` mounts `web` / `web-search-deepseek` / `web-fetch-http` / `tool-web`. **Pass rule:** presence alone does not fail FR-012; Fail only if a Scenario 1–5 recipe **requires** those (or any external-send) tools to Pass |
| MCP product UX | Explicit non-goal — Out of Scope; [non-goals.md](./non-goals.md) T039 Pass |

### Fail rules

Fail T013 / FR-012 if any of:

- A Phase 1 product Scenario (SC-001…SC-006) recipe requires Shell, Box/computer-use, MCP connector send, webhook/email/Slack publish, or other external send/post to Pass
- Product Bot create stops isolating ModelSelection per Agent (`installModelSelection` unbound or shared across bots)
- Product Bot create defaults to sharing another bot’s Agent-scoped tool registrations (e.g. reusing another bot’s `agent.ctx` registrations instead of a fresh child Agent)

### Pass rules (docs + measured wiring)

- FR-011 measured symbols above remain accurate on the branch under test
- FR-012 acceptance non-dependence holds (no Scenario requires external send/post tools)
- Cross-checks: T010 non-goals Pass baseline; T015 bind isolation green when Verifier records evidence

## DH Runtime blocker

**None on current measured tree.** Isolation and trust-floor posture are already enforced by Agent scope + Team spawn/createBot + Agent-scoped Team tools. If a future change breaks a Fail rule above, open a Runtime task against this recipe before marking MOH-58 Done.

## Evidence home

Pass evidence (stdout + SHA + VERDICT): [evidence/t013-trust-floor/](./evidence/t013-trust-floor/). Re-confirm via the vitest filters and symbol table above when the wiring changes.

## How to re-confirm

1. Re-read the measured symbol table against `packages/core/agent/`, `packages/experimental/agent-team/`, `packages/experimental/tool-agent-team/`, `packages/subagent/subagent-spawn-in-process/`.
2. Re-run the vitest filters above.
3. Confirm no Scenario 1–5 recipe gained an external-send tool dependency.
4. Fail if Runtime wiring diverges from the measured table without an updated blocker note here.
