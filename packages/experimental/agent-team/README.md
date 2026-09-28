---
description: "Run a small team of named agents in one session: durable messages between members and a shared task board, for deployments composing the experimental Team plugins."
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-agent-team

English | [中文](README.zh.md)

## Summary

`dsh-experimental-agent-team` turns one coding session into a small working team: the session's agent becomes the Lead, creates named teammates for delegated work, exchanges durable messages with them, and tracks shared tasks on a common board. Messages and task state survive crashes, reloads, and interruptions, so a teammate that was offline receives its queued messages when it resumes. It provides no tools of its own — mount the sibling `dsh-experimental-tool-agent-team` so the model can create teammates, message them, and use the task board. It is published under its experimental name, carries no stability promise, and needs durable session storage to activate.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Add this package to a composition when one agent should run a small team of named helpers in its own working directory, with messages and task state that survive crashes and restarts. It ships no tools of its own: mount it together with `@deepseek-ai/dsh-experimental-tool-agent-team` so the model can create teammates, message them, and use the task board.

### When to choose it

Choose it when several agents must cooperate on one shared workspace and their roster, messages, and task state must survive crashes and restarts. Avoid it when teammates need separate working directories, when several processes must coordinate over one team, or when a task owner should be released automatically — none of those are supported. The team features need durable session storage to activate.

### Smallest working setup

<a id="smallest-working-setup"></a>

The smallest addition to an existing composition is durable session storage plus both Team packages:

```yaml
# smallest team setup — durable storage plus both Team packages
- name: '@deepseek-ai/dsh-session-persistence-jsonl'
- name: '@deepseek-ai/dsh-experimental-agent-team'
- name: '@deepseek-ai/dsh-experimental-tool-agent-team'
```

With the tools installed, the model does the rest on request — for example, "create a teammate named reviewer to check the diff", then "send reviewer the change summary". All limits are optional and validated at startup:

| Field | Default | Meaning |
|---|---|---|
| `maxMembers` | `16` | Maximum teammates a team may ever create, including failed ones |
| `maxTasks` | `256` | Maximum active tasks on the board |
| `maxPendingMessagesPerMember` | `64` | Maximum queued messages for one member |
| `maxMessageBytes` | `65,536` | Maximum size of one sent message |
| `disposalTimeoutMs` | `5,000` | Time allowed for shutdown cleanup |
| `routineCronTickMs` | `15,000` | Host Routine cron poll period while Agent Teams is loaded |
| `userSkillsRoot` | — | Absolute Host-durable root for `upsertUserSkill` directory bundles |

The generated [configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-experimental-agent-team) is the exhaustive source for every accepted field and its JSDoc.

### Teammates

Ask the Lead to create a teammate: give it a unique lowercase name such as `reviewer` and describe its job. A teammate starts fresh with no memory of the Lead's conversation, or as a fork that inherits the Lead's completed turns; the creation request chooses which. Teammate names are permanent — even a teammate whose creation failed keeps its name, and no name is ever reused. Host callers may also pass per-teammate LLM `agentOptions` (`provider` + `model` [+ optional reasoning effort]) at spawn so each bot keeps its own model route; that field is distinct from the subagent backend `provider`, and Electron Main must not invent or rewrite it. Roster rows project the live LLM pair as `modelSelection` when both ids are present so Client Verifier messaging can compare distinct `(provider, model)` assignments.

Product bot create uses Host `createBot(displayName, modelSelection)`: the Lead-authorized API requires a non-empty `displayName` and exactly one model/provider assignment, derives the durable kebab roster name, and retains `displayName` plus that `modelSelection` on the Host member snapshot. At create (and on cold resume), Agent Teams binds the live Bot through `installModelSelection` so subsequent chats keep that bot’s assignment only — never the Lead’s route. Model calls then resolve through Host `ctx.llm` adapters (`packages/llm/`) with Host `ctx.credentials` resolve for that provider — never a peer bot’s credential, and never Electron Main inventing bot records or routes. Call it through `ctx.agentTeams.createBot` or the generated `agentTeams/createBot` Remote.

Optional Host Bot identity fields on the durable member snapshot — `persona` (`job` / `voice` / `antiJobs`), preset `avatar` (`shape` and/or `color` from fixed Host preset ids), and `sectionId` (`null`/absent ⇒ Unassigned/default) — persist with the Team journal `team/member` path and project onto Client roster views. P1 `modelSelection` ownership stays immutable. Host `updatePersona` replaces job / voice / anti-jobs on an active Bot, projects them on `listMembers` / `agentTeams/view`, and binds non-empty fields into that Bot’s scoped `deployment:persona-prefix` instruction text on create and cold resume (empty fields contribute no prose; Verifier observes assembly wiring, not LLM reply wording). Host `renameBot` persists a non-empty `displayName` (duplicates allowed; kebab `name` immutable; empty rename rejects without writing). Host `setAvatar` replaces a preset shape and/or color marker (at least one required; image-file / URL upload is out of Pass scope — clarify lock 3). Both project through `listMembers` / `agentTeams/view`. Host `createSection` / `renameSection` persist named sidebar catalog rows on `team/section` (empty names reject); Host `assignSection` sets Bot.`sectionId` to a named catalog id or `null` for Unassigned/default without storing an Unassigned row (clarify lock 4). `agentTeams/view` projects `sections` (names + roster-ordered `botIds`) and `unassignedBotIds`. Host `deleteBot` appends an `active` → `deleted` identity tombstone (clears `sectionId`); Client roster / overview / section membership omit the Bot while transcript and mailbox rows are left alone for Pass (clarify lock 5). Electron Main must not invent identity or section records.

Host skill discovery projects `ctx.skills` through `projectSkillCatalog` onto `agentTeams/view.skills` and the loud `agentTeams/listSkills` Remote (`listSkills`): Pass lists exactly one `managed` skill (`mzm-thin-pack` / display `MzM thin pack`); other provider `bundled` skills (office-*) stay in `ctx.skills` for model use but are omitted from discovery; remaining rows map to `user`; a missing skills registry fails loud on `listSkills` (soft empty on `view` for non-Desktop compositions). Electron Main must not invent catalog rows.

Host `upsertUserSkill` creates or updates a user-authored skill: non-empty `displayName` and `instructionalBody` are required (FR-013); empty fields reject with a clear reason and write nothing durable (T028). On success it writes `<userSkillsRoot>/<skillId>/SKILL.md` through `dsh-skill-filesystem` `writeSkillBundle` (Config `userSkillsRoot`; Desktop profile sets `dshHomePath('desktop-user-skills')` to match the Host mount) and registers the skill on `ctx.skills` for immediate discovery. Electron Main must not invent skill files.

Host `attachSkill(botId, skillId)` appends an ordered `{ botId, skillId }` onto that Bot’s durable `skillAttachments` only (multi-attach allowed; never auto-attaches peers). The skill must exist in Host `ctx.skills` or the mutation fails loud without writing. `listMembers` / `agentTeams/view` project those attachments for Client bot skills/overview — never Electron Main storage. After attach (and on create/cold resume), Agent Teams binds non-empty attached instructional bodies into that Bot’s scoped `agent-teams:skill-instructions` system-prompt section (Candidate B sibling to P2 persona prefix; empty/missing bodies contribute no prose; Verifier observes assembly wiring, not LLM reply wording).

Host Routine catalog (P4 Architect Option 3) persists `RoutineRecord` rows on the Lead journal path `team/routine` — keyed by `botId`, with non-empty `intent`, product-supported `scheduleExpr` (`@every 5m` / `@hourly` / `@daily` / 5-field cron), `status: active|paused`, and `lastRunAt`. Host `createRoutine` (US1 T015–T016) rejects empty intent or unsupported schedule with a clear Remote `team-rejected` reason and writes nothing; success persists `status: active` for that `botId` only (SC-006). No confirm step and no separate displayName — pane `identity` derives from intent (SC-007). Host `listRoutinesByBot` (US2 T019 / FR-002) projects `RoutineProjection` (intent/identity, scheduleExpr/scheduleLabel, status, lastRunAt) for one `botId` over authenticated HTTP/WS from that Host catalog only; `agentTeams/view.routines` exposes the same projection set for the Team view. Host `pauseRoutine` / `resumeRoutine` (US3 T022 / FR-003/004) persist durable `status: paused|active`; `isRoutineEligibleForWake` / `routinesEligibleForWake` ensure paused rows MUST NOT receive Host cron wakes. Host cron ticker (US4 T025 / FR-005; Config `routineCronTickMs`) evaluates due **active** rows in the Host process, wakes the bot turn with the routine intent (Agent followup / subagent queue), and updates `lastRunAt` after fire commit; paused rows never wake. This is **not** `@deepseek-ai/dsh-schedule` session reminders and **not** Electron Main storage. Host `routine-cron` validates expressions and computes next-fire / due-ness; optional `ctx.jobs` may later show in-flight fire visibility only.

Host Memory catalog (P5 Host SoT) persists `MemoryRecord` rows on the Lead journal path `team/memory` — `kind: profile|log|note`, `layer: agent|user`, `botId` required when `layer=agent` / null when `layer=user`, non-empty `content`, and timestamps. Host `writeMemory` (T006–T008 / US1 T014 / US2 T017 / US3 T020) rejects empty content and invalid layer/`botId` pairing with a clear Remote `team-rejected` reason and writes nothing; `kind=profile` (FR-001), `kind=log` (FR-002), and `kind=note` (FR-003) validate non-empty content after trim and persist on the Host catalog with distinguishable `kind` on list/view (bot-tool write not required — FR-015). Kinds and layers are orthogonal (FR-017). Host `listMemories` (optional `botId`) projects that bot’s agent-layer rows plus all account-wide user rows over authenticated HTTP/WS; `agentTeams/view.memories` exposes the full catalog. Catalog rows survive Host child restart via Lead Session replay (US4 T023 / FR-004/005) — never a transcript dump. After write (and on create / cold resume), Agent Teams binds eligible curated contents into that Bot’s scoped `agent-teams:memory-recall` system-prompt section (US4 T024 / FR-016; Candidate A sibling to persona/skill binds; empty catalog contributes no prose; Verifier observes assembly wiring, not LLM reply wording). This is **not** Electron Main storage, **not** Client-only SoT, and **not** chat transcript.

`modelAssignmentsAreDistinct` compares two assignments after the same trim as `requiredModelSelection`. Optional reasoning effort does not make them distinct. A row missing either id is not an assignment, and the subagent backend id remains `provider`.

The roster shows every member with its role (`lead` or `teammate`) and current status: `running`, `idle`, `inactive` (a member that exists but is not loaded), `provisioning`, or `failed`. A member that is not loaded receives its messages when it wakes.

Only the Lead can create teammates or interrupt them.

### Messages between teammates

Any member can send a message to any other member or to the Lead. A live member receives it immediately; an offline member's messages queue and arrive when it resumes. Messages are never lost and never delivered twice.

Every message uses Steer: a running target receives it at the nearest step boundary, an idle target starts a turn, and an inactive teammate cold-resumes. The sender always sees the outcome — accepted by the target inbox, or retained as queued when delivery is temporarily unavailable. A queued message is already safely stored, so it must not be resent.

### Shared task board

Any member can add a task with a title, details, optional dependencies on other tasks, and optional hints about which files it will touch. A task is claimable only when everything it depends on is complete.

Tasks have an owner: a member claims a task to start work, completes it when done, releases it back, or reopens it; the Lead can assign a task to any member. Every change is compare-and-set: an update based on an outdated copy is rejected, so two members cannot silently overwrite each other's work.

File hints produce warnings when two in-progress tasks plan to touch overlapping paths — they never block anything. Deleted tasks remain in history but disappear from the active list.

### Waiting and interruption

A member can wait for the next team change — a teammate's status, an incoming message, or a task update — instead of polling repeatedly; the wait reports only whether it timed out, and the caller re-reads the current state afterward.

The Lead can stop a teammate's current turn without deleting its queued messages; task ownership is unchanged.

### What success and failure look like

Success looks like a teammate appearing in the roster, a message reporting `accepted` or `queued`, and task revisions advancing with each change. Likely failures are reported as specific errors instead of silently corrupting state: sending to a name that is not a member, claiming a task that is not ready, editing with an outdated revision, or creating a teammate beyond the member limit.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

This section explains the design decisions behind the service and points at the code that realizes them; the observable behavior is fully covered in [Use this package](#use-this-package).

### Design philosophy

The service is built on one separation and three commitments:

- **Durable log, derived state.** The Lead Session log is the single source of truth; roster, mailbox, and task state are replayed from it on every read.
- **Process-local ownership.** All coordination lives in one process; the guarantee is retry plus de-duplication, never cross-process consensus.
- **Explicit authority.** Every service method takes the exact live calling `Agent`; only the Lead spawns, reassigns, or interrupts.
- **Bounds that fail loud.** Every limit is a validated deployment value, and exhaustion reports a typed error instead of reusing an id or name.

The [Agent Teams Agent Note](../../../.agents/notes/implemented/feature/2026-08-05-agent-teams.md) owns the identity, mailbox, task, and shared-checkout decisions.

### Source map

| File | Role |
|---|---|
| [`src/index.ts`](src/index.ts) | Plugin entry: `Config` schema, service registration, recovery scheduling |
| [`src/roster.ts`](src/roster.ts) | Team identity, membership resolution, provisioning, and roster teardown |
| [`src/mailbox.ts`](src/mailbox.ts) | Durable queue, target-local dispatch, acknowledgement, and recovery |
| [`src/delivery-state.ts`](src/delivery-state.ts) | Product `deliveryState` observation from Lead + target session logs |
| [`src/host-mailbox-message.ts`](src/host-mailbox-message.ts) | Product Host mailbox fields (`fromBotId` / `toBotId` / `body` / `createdAt` / Host-only `source`) from durable logs |
| [`src/task-board.ts`](src/task-board.ts) | Task CAS commands, DAG validation, and derived views |
| [`src/journal.ts`](src/journal.ts) | Serialized Lead-log transactions and commit notification |
| [`src/projection.ts`](src/projection.ts) | Strict replay projection that decodes and validates Team events; `projectSkillCatalog` maps Host skill summaries for Desktop discovery; `skillAttachments` on member snapshots project for Client bot overview |
| [`src/persona-bind.ts`](src/persona-bind.ts) | Scoped `deployment:persona-prefix` bind from durable Host persona |
| [`src/skill-bind.ts`](src/skill-bind.ts) | Scoped `agent-teams:skill-instructions` bind from durable Host `skillAttachments` + catalog bodies |
| [`src/memory-bind.ts`](src/memory-bind.ts) | Scoped `agent-teams:memory-recall` bind from durable Host Memory catalog rows |
| [`src/activity.ts`](src/activity.ts) | One-shot change waiters and disposal release |
| [`src/lifecycle.ts`](src/lifecycle.ts) | Shared admission cutoff and bounded settlement |
| [`src/invariant.ts`](src/invariant.ts) | Invariant companion that replays candidate events before append |

### Team identity and roster

Every ordinary runtime root is the implicit Lead of a Team whose `TeamId` equals its `SessionId`; there is no creation event, and durable state begins with the first member, message, or task record. `spawnTeammate()` first appends and flushes a `provisioning` member record, then asks the configured provider to create the reserved child; a provider failure appends a durable `failed` member. A fresh child starts with no Lead history; a fork child captures the Lead's completed-turn prefix once. Recovery reconciles an unterminated provisioning record against the child's independently persisted Session: a matching direct-parent and continuable descriptor plus a recorded initial user message produces `active`, and anything else produces `failed`. If recovery wins a same-process race, the creator accepts the terminal state or reports `TEAM_PROVISIONING_CONFLICT` and drains the child. Names are reserved by the first provisioning record and never reused.

### Durable mailbox

`sendMessage()` validates peer membership, appends `team/message/queued`, and flushes before attempting delivery. The target message begins with `Team message <id> from <name>:` and keeps the same id and sender in `TeamMessageSource`. A target receipt is acknowledged with `team/message/delivered` only after the target Session durably holds the message identity in its pending inbox or recorded history. Immediate admissions are serialized per target in durable queue order; recovery dispatches queued-minus-delivered records in the same order. Delivery folds both live and persisted target inbox/history state before retrying, so a crash between inbox acceptance and model claim does not duplicate the message. The guarantee is process-local retry plus target-Session de-duplication, not cross-process exactly-once delivery.

Product `deliveryState` (`queued` → `delivered` → `acted` | `visible-pending`) is reconstructed from those Lead-log edges plus the target Session log via `observeMailboxDeliveryState` — never from Electron IPC. `visible-pending` means the recipient holds a durable handoff without a follow-up turn; `acted` means a later `request/header` follows the team-message receipt. Product Host mailbox fields (`id`, `fromBotId`, `toBotId`, `body`, `createdAt`, `deliveryState`, `source: { kind: 'host-mailbox' }`) reconstruct the same way via `readHostMailboxMessage`: aliases map from the Lead `team/message/queued` snapshot (`senderId`→`fromBotId`, `targetId`→`toBotId`, `content`→`body`) and queued event `time`→`createdAt`; `source` is Host-only and must never be Electron IPC. Client observability uses the same reconstruction: `projectMailboxHandoffs` builds `HostMailboxMessage[]` from Lead events plus per-target Session logs, and `agentTeams/view` returns them on `TeamView.handoffs` (never Main-synthesized IPC).

Lead delivery calls `Agent.steer()` directly. Teammate delivery uses the continuation owner's host-only Steer path, which preserves the Team sender source while authorizing the Lead-to-child edge and cold-resuming inactive targets. Sibling messages never impersonate the Lead through the public adjacent-Agent messaging operation.

### Shared task board

Tasks are complete versioned snapshots; every mutation carries `expectedRevision`, and a stale caller receives `TEAM_TASK_STALE_REVISION` instead of overwriting a newer value. Numeric `task-<n>` ids require a safe-integer suffix, and id-space exhaustion reports `TEAM_TASK_LIMIT` instead of reusing the final id. Deleted tasks remain tombstones for replay and id stability but do not consume `maxTasks` or appear in `listTasks()`. `writeScopes` are normalized workspace-relative prefixes; views warn on overlap with in-progress tasks but never block claim or authorize writes.

### Waiting and interruption

`waitForChange()` waits for one roster, task, mailbox, or live-status edge that occurs after registration, from ten seconds through one hour, and reports only whether it timed out; runtime disposal releases current waits. Cancellation preserves an Error reason or reports a non-Error reason through `TEAM_WAIT_ABORTED`. `interrupt()` is Lead-only and delegates to the continuable-subagent interrupt path, which cancels only a live teammate's current turn with `keepInbox`; it neither releases task ownership nor deletes durable mail.

### Durability model

Team events are appended to the exact live Lead Session and flushed before the operation reports success or wakes waiters. `team/member`, `team/section`, `team/routine`, `team/memory`, `team/task`, `team/message/queued`, and `team/message/delivered` are log-only: they never enter the conversation surface, so derived model history is untouched by coordination records. Session event `seq` and `time` own ordering and timing; snapshots do not duplicate them. The `./invariant` companion replays each candidate Team event against its committed prefix and rejects invalid transitions before append.

### Disposal

Disposal closes admission, aborts and awaits admitted creation, mailbox-dispatch, and in-flight Routine cron fire transactions, then asks the continuation owner to release the roster's exact live direct children and their descendants; non-Team continuable children of the Lead remain untouched. Cleanup failures make disposal fail visibly, bounded by `disposalTimeoutMs`.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when the package-level contract is not enough. They move from the shared subsystem types to the tool surface and the decisions behind the design.

- [Agent Teams subsystem](../../../docs/subsystems/agent-team.md) — durable Team types and the `ctx.agentTeams` service API.
- [tool-agent-team package](../tool-agent-team/README.md) — the tools that let the model create, message, and coordinate teammates.
- [Agent Teams Agent Note](../../../.agents/notes/implemented/feature/2026-08-05-agent-teams.md) — identity, mailbox, task, and shared-checkout decisions.
- [Experimental package decision](../../../.agents/notes/implemented/architecture/2026-08-18-experimental-agent-teams-packages.md) — placement, publication, and dependency isolation.

-----

<a id="model-experience"></a>

### Browser Remote

`TeamService` owns the generated `agentTeams/view`, `agentTeams/createBot`, `agentTeams/renameBot`, `agentTeams/updatePersona`, `agentTeams/setAvatar`, `agentTeams/createSection`, `agentTeams/renameSection`, `agentTeams/assignSection`, `agentTeams/deleteBot`, `agentTeams/createRoutine`, `agentTeams/listRoutinesByBot`, `agentTeams/pauseRoutine`, `agentTeams/resumeRoutine`, `agentTeams/writeMemory`, `agentTeams/listMemories`, `agentTeams/createTask`, and `agentTeams/updateTask` Remote methods beside the roster, mailbox, task, and lifecycle operations. `agentTeams/view` returns roster rows (including projected displayName, persona, avatar, and sectionId when present), named `sections` with derived membership, `unassignedBotIds` (clarify lock 4 — no Unassigned catalog row), non-deleted tasks, `handoffs` (Host mailbox product rows), Host skill catalog summaries, Host `routines` projections, and Host `memories` projections. The `./remote` export supplies the Client contribution mounted by the Web UI, while `./client` re-exports the request, view, handoff, identity-mutation, and task-mutation result types that are safe in a browser compilation face. Typert retains transport failures in its outer `RemoteResult`; create and update rejections remain explicit domain results inside a successful transport response, with stale update revisions distinguished as task conflicts.

## Model Experience

### Peer messages

#### What the model sees

Each delivered peer message is a user-role message. A short first text block names its stable message id and sender; the sender's original content blocks follow unchanged. Roster, task, and mailbox records are log-only and never enter derived model history.

#### Token effect

Each peer delivery adds the sender prefix plus message content to the target history. Task and roster mutations add no model tokens; their model-facing representation belongs to `@deepseek-ai/dsh-experimental-tool-agent-team` results.

#### KV Cache effect

Peer messages append after the target's reusable history prefix. Cold resume reuses the persisted conversation before appending a previously undelivered item.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>


These limits describe what a team cannot do yet or what needs special operational care. They are current package constraints, not a comparison with other coordination mechanisms.

- **Experimental prototype with no stability promise** — the package is public, but its contracts can change freely while it incubates.
- **One process and one shared checkout** — members share cwd and observe edits immediately; this package provides no worktree, remote member, merge, or filesystem lock.
- **Advisory write scopes** — Bash, formatters, code generators, and direct external writers can bypass filesystem version checks; Leads must coordinate ownership and review the final diff.
- **Flat roster with Host identity mutations** — only the Lead creates direct teammates; kebab `name` is never reused (including after Host delete tombstones). Host `updatePersona`, `renameBot`, `setAvatar`, `createSection` / `renameSection` / `assignSection`, and `deleteBot` persist and project persona / displayName / preset avatar markers / named sidebar sections + Unassigned / identity removal. Electron Main must not invent a parallel identity or section store.
- **No automatic ownership release** — idle, interruption, process exit, and failed work do not release a task owner.
- **Mailbox is not cross-process exactly-once** — concurrent harness processes over one Team are unsupported.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

This Dev Note is working context for maintainers and is explicitly non-authoritative.

#### Promotion

Promotion to a product-role group requires reviewing the public contract, limitations, test evidence, release payload, runtime dependents, and a named stable owner, per the [experimental subtree rules](../AGENTS.md).

#### Future directions

Undecided directions include nested Teams, automatic ownership release policies, cross-process mailbox transactions, and filesystem isolation via worktrees; none of these are committed.

</details>
