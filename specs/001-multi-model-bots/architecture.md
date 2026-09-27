# Architecture: Phase 1 Wedge A — capability → plugin ownership

| Field | Value |
|-------|-------|
| **Status** | Draft (Architect seam map) |
| **Feature** | `specs/001-multi-model-bots` |
| **Spec** | [spec.md](./spec.md) |
| **Program** | [MzM-Docs/mzm-bot-plan.md](../../MzM-Docs/mzm-bot-plan.md) P1 |
| **Linear** | MOH-40 (parent MOH-37) · project **DeepSeek Harness - Cursor** |
| **Audience** | DH Spec (plan/acceptance), DH Runtime, DH Electron, DH Verifier |
| **Non-goal** | Feature implementation code in this change |

This note maps wedge A capabilities onto DeepSeek Harness plugins and the Electron shell. Prefer reuse. Novel seams list options and a pick. Electron (shell) vs Desktop Host (runtime) stay explicit.

## Process topology (locked entry gate)

```text
┌──────────────────────────── Electron shell (Main + preload) ────────────────────────────┐
│  Window loads dsh-app://app (packaged Web assets)                                         │
│  Node IPC: ready / fatal / shutdown / update-tasks only                                   │
│  Forwards app HTTP to authenticated Host; WS credentials only for owned window            │
└──────────────────────────────────────────┬───────────────────────────────────────────────┘
                                           │ spawn ELECTRON_RUN_AS_NODE child
                                           ▼
┌──────────────────────────── Desktop Host (apps/desktop-host) ───────────────────────────┐
│  Shared CLI profile runner · $DSH_HOME/profiles/desktop · complete Web composition        │
│  Owns: sessions, agents, ctx.llm, credentials, tools, mailbox, RPC/streams                │
│  Default listen :19387 (profile-overridable)                                              │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

Shipped Desktop already matches: bundled Electron-as-Node Host child, Node IPC lifecycle-only, `dsh-app://`, Web HTTP/WS data plane ([architecture.md Desktop](../../docs/architecture.md#desktop-application), [thin-wrapper note](../../.agents/notes/implemented/architecture/2026-09-10-desktop-web-wrapper.md), [RunAsNode note](../../.agents/notes/implemented/architecture/2026-09-11-desktop-electron-node-runtime.md)).

Program plan wording still says “framed pipes.” Treat that phrase as **open B** relative to the shipped data plane (see [Novel seam: Shell↔Host data plane](#novel-seam-shellhost-data-plane)).

## Capability → ownership map

| Capability (spec) | Data / boundary | Host (Runtime) owner | Electron (Shell) owner | Reuse |
|---|---|---|---|---|
| Per-bot model/provider | Bot → one `ModelSelection` (`provider` + `model` [+ effort]); scoped to that Agent | `ctx.agents` / `agentLoop.create` + `installModelSelection`; adapters on `ctx.llm` (`dsh-llm`, `dsh-llm-deepseek`, `dsh-llm-pi-ai`) | UI: create/assign controls in Web client under shell; no model routing in Main | **Reuse** agent options + model-selection + llm adapters |
| Basic bot create | Bot identity: display name + model assignment; durable Agent/Session | Agent create / Team roster create path (chosen below); session persistence | Usable create form in renderer (Web UI); Main does not invent bot records | **Reuse** agent/session; product create UX on Client |
| Host mailbox async 1:1 | Durable peer message; delivery into target Agent inbox; no Electron bus | `ctx.agentTeams` Lead-log mailbox → target inbox (`team/message/*` + Steer) | Observe only via Host session/RPC projections; **no** parallel IPC/message bus | **Reuse** experimental Agent Teams mailbox |
| Chat progress + final | Progress = in-flight session/agent stream events; final = turn completion / assistant result in log | Session log + agent stream (`agent/assistant-stream`, turn close); Client projections | Renderer shows Web chat cards; shell does not synthesize progress | **Reuse** ui-chat / ui-conversation + session events |
| Usable desktop UI | Create bot, assign model, chat, see handoff | Host APIs unchanged | Electron carries Web app; thin shell chrome only | **Reuse** Desktop Web wrapper |
| In-app credentials | `CredentialRef` in settings; secret values in Host store; never renderer, never session dump | `ctx.credentials` + `dsh-credentials-local`; write-only Settings Models UI | Main: no secret IPC; preload exposes no credential API | **Reuse** credentials seam + Models page |
| Agent scope / trust floor | Per-bot model isolate; no shared tool privilege by default; no external send/post tools in P1 acceptance | Scoped registrations (`dsh-scope`); chat-only Host tools (no local Shell/Box backends in P1 acceptance) | N/A | **Reuse** scope + desktop profile composition |
| Shell↔Host handshake | Ready URL + injections; `dsh-app://` document; authenticated HTTP/WS | desktop-host ready IPC + Web listen | Main spawn/supervise Host; load `dsh-app://app`; forward HTTP | **Reuse** shipped Desktop Host process |

## Ownership roles (who implements)

| Role | Owns in P1 |
|---|---|
| **DH Runtime** | Host plugins: per-bot `ModelSelection` at create; Agent Teams mount + mailbox delivery; credential resolution for llm adapters; chat-only tool set; any small gap to pass `agentOptions` into Team spawn |
| **DH Electron** | Shell lifecycle (spawn Host, IPC ready/fatal/shutdown), `dsh-app://`, HTTP forward, recovery; no mailbox, no credential store, no model router |
| **DH Client / Web UI** (under Electron) | Bot create / model assign forms, chat progress+final, handoff visibility, Models credential entry (write-only) |
| **DH Spec** | Turn this map into plan acceptance; encode Verifier handshake criteria into tasks |
| **DH Verifier** | Script topology handshake first; then product paths from [spec.md](./spec.md) SC-* |

## Data shapes (named before mechanisms)

| Name | Meaning |
|---|---|
| **Bot** | User-visible agent with immutable-enough display name and exactly one assigned model route for P1 |
| **Model assignment** | `{ provider: string, model: string, reasoningEffort?: … }` bound via `installModelSelection` / `agentOptions` |
| **Provider credential** | Secret behind `CredentialRef`; Host `resolve(ref)` per model request; UI sees `CredentialInfo` only |
| **Host mailbox message** | Durable peer send: Team queued record → target Session inbox / `user/message` with `team-message` source |
| **Chat progress** | User-visible streaming / step updates from Host session events while a turn is open |
| **Chat final** | Durable completed assistant (or handoff) result for that turn path |
| **Shell↔Host control event** | IPC only: `ready` `{ url, injections? }`, `fatal`, `shutdown-complete`, `update-tasks` |

## Novel seams — options and picks

### Novel seam: multi-bot identity + peer 1:1

Wedge needs ≥2 bots and peer messaging. Parent↔child `send_message` (`dsh-tool-subagent-control`) is not peer. Agent Teams already owns a durable peer mailbox on the Lead Session log.

| Option | Pros | Cons |
|---|---|---|
| **A. Agent Teams roster + mailbox** | Durable peer 1:1 already; handoff survives cold resume; UI panel exists (experimental) | Experimental; task board unused in P1; Lead authority model; Team `provider` field is subagent backend id, not LLM route |
| **B. Independent root Sessions + new Host mailbox plugin** | Symmetric bots | New seam; duplicates Team mailbox; violates “prefer reuse” |
| **C. Continuable children + parent↔child `send_message` only** | Stable non-experimental tools | Not true peer; weak vs FR-004 “bot-to-bot” |

**Pick: A.** Mount experimental Agent Teams for P1 messaging. Product “bot create” maps to Lead-authorized teammate spawn (or equivalent Host API Spec names). Do not fork an Electron bus. Defer task-board productization (P4-ish) — presence of the board is OK if unused by acceptance.

**Runtime path:** Host `TeamService.createBot({ displayName, modelSelection })` (and Remote `agentTeams/createBot`) is the product create API: Lead-authorized, requires non-empty `displayName` plus exactly one `ModelSelection`, derives the durable kebab roster name, and retains `displayName` plus that `modelSelection` on the Host member snapshot. Internally it calls teammate spawn with required `agentOptions` (distinct from Team `provider`, the subagent backend id) and binds the live Bot through `installModelSelection` so subsequent chats keep that assignment. Model calls resolve through Host `ctx.llm` adapters (`dsh-llm`, `dsh-llm-deepseek`, `dsh-llm-pi-ai`) using that assignment and Host `ctx.credentials.resolve` for the provider’s `CredentialRef` — never a peer bot’s credential, and never Electron Main inventing bot records or rewriting the route.

### Novel seam: Shell↔Host data plane

Plan freeze text: “bundled-Node Desktop Host child + framed pipes + Node IPC lifecycle-only + `dsh-app://`.” Shipped Desktop uses HTTP/WS for app traffic; framed pipes were explicitly dropped for shared Web serving ([thin-wrapper note](../../.agents/notes/implemented/architecture/2026-09-10-desktop-web-wrapper.md)).

| Option | Pros | Cons |
|---|---|---|
| **1. Reintroduce framed pipes for all app I/O** | Literal plan string | Regresses Web reuse; large Electron+Runtime rewrite; blocks wedge |
| **2. Adopt shipped topology; amend plan wording** | Matches code; Web auth/RPC/streams intact; IPC stays lifecycle-only | Requires plan amendment ack (Lead/PO) for “framed pipes” phrase |
| **3. Hybrid: framed control pipes + HTTP app** | Keeps “framed” word | Two transports; no product gain over shipped IPC events |

**Pick: 2.** Entry gate topology = **Electron RunAsNode Desktop Host child + Node IPC lifecycle-only + `dsh-app://` + authenticated Host HTTP/WS**. Verifier handshake scripts that topology (below). PO/Lead amend plan freeze string when convenient; Architect does not reopen a second bus.

### Novel seam: in-app credential storage

Auth primary is locked **in-app** (not 1Password). Plan table mentions OS secure store.

| Option | Pros | Cons |
|---|---|---|
| **I. Host `credentials-local` YAML under `$DSH_HOME`** | Already in-app Models UI; write-only keys; secrets off renderer; env override for CI | File-backed, not OS keychain |
| **II. Electron Main OS secure store as `ctx.credentials` provider** | Matches “OS secure store” wording | New provider; Electron↔Host secret plumbing risk |
| **III. Dual-write Main keychain + Host file** | Redundant durability story | Complexity; two sources of truth |

**Pick: I for P1.** Satisfies FR-008/009 and ship/no-ship “in-app.” Env/key files remain dev/CI only. OS secure store stays a later provider swap behind the same `CredentialRef` seam (P6-class if needed). Renderer never receives secret values; session dumps must not include them (SC-006).

## Verifier criteria — topology handshake

Script before feature fan-out (Electron + Verifier). Pass = all of:

1. **Spawn**: Electron Main starts exactly one Desktop Host child with `ELECTRON_RUN_AS_NODE` (or documented equivalent) against reserved `$DSH_HOME/profiles/desktop`.
2. **IPC lifecycle**: Child emits a valid `ready` event with `url: string` (and optional `injections`) over Node IPC; no application chat/mailbox payloads on IPC.
3. **Document origin**: Primary window main frame loads `dsh-app://app` (or `/` under that scheme); remote/shell frames cannot exercise privileged preload APIs.
4. **Authenticated data plane**: After ready, renderer reaches Host HTTP and at least one authenticated WebSocket/stream against the reported URL; shell forwards HTTP without putting provider API keys in renderer storage.
5. **Shutdown**: Ordered stop yields Host `shutdown-complete` (or clean exit) without requiring a second messaging bus.
6. **Negative**: Injecting a fake “mailbox” or “bot message” over Electron IPC is rejected or impossible by API surface (no such Main handler).

Evidence: scripted log + one screenshot or trace of `ready` + successful authenticated Host round-trip. Feature SC-001…SC-006 run only after this gate passes.

## Handoff to DH Spec

Encode in Spec Kit `plan` / acceptance:

- Topology gate = Verifier criteria above (plan entry, not product FR expansion).
- Bot create + per-bot model = Host Agent/`ModelSelection`; Team spawn must accept per-bot LLM route.
- 1:1 = Agent Teams mailbox only; assert no Electron parallel bus in architecture tests/docs.
- Chat = existing progress stream + final delivery; no new chat protocol.
- Auth = in-app Models/`credentials-local`; env secondary; secrets absent from dumps.
- Explicit non-goals unchanged (Box/Shell, MCP, personas UX, skills, routines, memory productization).

## Open questions

1. **PO/Lead**: Confirm plan amend — drop literal “framed pipes” in favor of shipped HTTP data plane (Architect pick 2).
2. **Runtime**: ~~Exact API for user-initiated bot create (Lead spawn vs dedicated Host RPC)~~ — **Closed (T014):** `TeamService.createBot` / Remote `agentTeams/createBot` (Lead-authorized; required `displayName` + `modelSelection`).
3. **Mohammed**: Minimum provider catalog for SC-001 (≥2 distinct models) — configuration, not a fixed marketing list.
4. **Experimental Teams**: Accept experimental package mount for P1 wedge, with promotion deferred.

## Traceability

| Spec FR / SC | Architecture row |
|---|---|
| FR-001…003, FR-011 / SC-001…002 | Per-bot model + bot create |
| FR-004…005 / SC-003 | Agent Teams Host mailbox |
| FR-006 / SC-004 | Chat progress + final |
| FR-007 / SC-005 | Desktop Web UI under Electron |
| FR-008…009, FR-012 / SC-006 | credentials-local in-app + trust floor |
| FR-010 | Chat-only Host (no Shell/Box backends) |
| Topology assumption | Verifier handshake section |
