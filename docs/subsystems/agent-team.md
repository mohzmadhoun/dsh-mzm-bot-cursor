# Agent Teams

English | [中文](agent-team.zh.md)

Types shared by the experimental implicit-root Team domain, model tools, and host adapters. The [Agent Teams Agent Note](../../.agents/notes/implemented/feature/2026-08-05-agent-teams.md) owns identity, mailbox, task, and shared-checkout decisions; this page records the literal durable forms from [`packages/experimental/agent-team/src/types.ts`](../../packages/experimental/agent-team/src/types.ts).

## Identity and roster

`TeamId` is the root `SessionId` under a distinct [brand](core.md#branded-ids). `TeamTaskId` is Team-local and monotonically allocated as `task-<n>`; `TeamMessageId` is globally random. A teammate's Session id remains its persistent identity, while `name` is an immutable model/UI label.

```ts type-equiv
/** Whole durable value written on every teammate lifecycle change. */
interface TeamMemberSnapshot {
  readonly id: SessionId
  readonly name: string
  readonly description: string
  /**
   * Product-facing Bot label from Host create (FR-001).
   * Absent on model-tool `spawn_teammate` rows that only supply a kebab roster name.
   * Mutable after active via Host rename (FR-004); kebab {@link name} stays immutable.
   */
  readonly displayName?: string
  /**
   * Durable per-bot LLM route from spawn `agentOptions` / Host create (FR-002).
   * Bound onto the live Agent via `installModelSelection` so subsequent chats
   * keep this assignment. Absent when spawn omitted `agentOptions`.
   * P1 ownership unchanged — immutable after first durable write.
   */
  readonly modelSelection?: ModelSelection
  /**
   * Optional persona profile retained with the Bot (FR-002 / FR-003).
   * Mutable after active via Host `updatePersona`.
   */
  readonly persona?: BotPersonaProfile
  /**
   * Optional preset avatar marker (FR-005).
   * Mutable after active via Host `setAvatar`.
   */
  readonly avatar?: AvatarMarker
  /**
   * Named sidebar section membership, or `null` / absent ⇒ Unassigned/default (FR-006).
   * Mutable after active via Host `assignSection`.
   */
  readonly sectionId?: SidebarSectionId | null
  readonly provider: string
  readonly context: 'fresh' | 'fork'
  readonly phase: TeamMemberPhase
  readonly error?: string
}
```

Every member starts in `provisioning` and reaches exactly one terminal roster phase, `active` or `failed`. After `active`, Host identity mutations may append further `active` snapshots that change only mutable product fields (`displayName`, `persona`, `avatar`, `sectionId`, `description`); kebab `name`, subagent `provider`, `context`, and `modelSelection` stay immutable. Runtime `running`/`idle`/`inactive` status is derived separately and never rewrites this record.

## Named sidebar sections

Named sidebar sections are optional overlays on the Team journal. Catalog rows store only `id` and a non-empty `name`. Membership is Bot.`sectionId` on `team/member`; Unassigned/default is null/absent `sectionId` and is never a stored catalog row. Client views derive ordered `botIds` from non-deleted teammates sharing a section id, and list Unassigned bots separately.

```ts type-equiv
/**
 * Durable named sidebar section catalog row (FR-006 / clarify lock 4).
 * Membership is Bot.`sectionId`, not an embedded list — Unassigned has no catalog row.
 */
interface SidebarSectionSnapshot {
  readonly id: SidebarSectionId
  /** Non-empty user-visible section title. */
  readonly name: string
}
```

## Durable mailbox

The Lead Session first stores the complete queued message. A target receipt is acknowledged only after its pending inbox item or recorded user message is durable, leaving queued-minus-delivered as the recovery mailbox.

```ts type-equiv
/** One peer message retained until its target Session records it. */
interface TeamMessageSnapshot {
  readonly id: TeamMessageId
  readonly senderId: SessionId
  readonly senderName: string
  readonly targetId: SessionId
  readonly content: ContentBlock[]
}
```

Every message attempts Steer delivery. A running target receives it at the nearest step boundary, an idle target starts a turn, and an inactive teammate cold-resumes. Scheduling is not stored in the durable record because callers cannot select another mode.

The target Session keeps message identity and sender attribution on both the pending inbox item and the eventual user message. Folding that source across inbox and history is the target-side de-duplication key; the model-visible framing repeats the id and sender.

```ts type-equiv
/** Source retained by the target Session for durable mailbox de-duplication. */
interface TeamMessageSource {
  readonly kind: 'team-message'
  readonly teamId: TeamId
  readonly messageId: TeamMessageId
  readonly senderId: SessionId
  readonly senderName: string
}
```

## Shared task DAG

Every task event stores a complete snapshot. `revision` is the compare-and-set value and increments by one per mutation. `blockedBy` edges must name non-deleted tasks and keep the graph acyclic. `writeScopes` are normalized advisory path prefixes rather than locks.

```ts type-equiv
/** Whole durable task snapshot; every mutation increments {@link revision}. */
interface TeamTaskSnapshot {
  readonly id: TeamTaskId
  readonly revision: number
  readonly subject: string
  readonly description: string
  readonly status: TeamTaskStatus
  readonly ownerId?: SessionId
  readonly blockedBy: TeamTaskId[]
  readonly writeScopes: string[]
}
```

`pending` is unstarted or released, `in_progress` carries an owner, `completed` satisfies blockers, and `deleted` is a retained tombstone. Views add owner name, readiness, and write-scope overlap warnings without changing the durable snapshot.

## Replay

`foldTeam()` replays one root Session into the roster, task board, and queued-minus-delivered mailbox that every Team operation reads. It selects records by `TeamId`, so events inherited by an ordinary fork retain the ancestor id and never enter the new root's state. Session event `seq` and `time` remain the ordering and timing record; Team snapshots do not duplicate them. Roster and task reads reach callers as views; pending mail stays internal to delivery and recovery. The package [README](../../packages/experimental/agent-team/README.md) owns operation, authorization, recovery, and limit behavior.

<!-- BEGIN GENERATED cordis-surface (gen-cordis-catalog.ts) — do not edit between markers -->

<a id="cordis-surface"></a>

## Cordis API

Generated from source by `scripts/gen-cordis-catalog.ts` (verified fresh by `pnpm run verify-cordis-catalog` in doc-sync; regenerate with `pnpm run gen-cordis-catalog`) — the language sides differ only in locale-specific paired document paths. Signature blocks use a `ts cordis-catalog` fence and keep the original source JSDoc; dispatch modes are defined in the [primer](../cordis-primer.md#dispatch-modes), and the framework-inherited `ctx` API lives in [cordis-api/inherited.md](../cordis-api/inherited.md).

<a id="ctxagentteams--teamservice"></a>

### `ctx.agentTeams` — `TeamService`

Agent Teams service backed by the exact live Lead Session log.

```ts cordis-catalog
/**
 * Resolve one exact live Agent's Team role.
 * @param agent - exact live Agent used as the authority credential.
 * @returns its root, Team identity, role, and model-facing name.
 */
membership(agent: Agent): TeamMembership

/**
 * List the runtime-enriched roster visible to one Team member.
 * @param agent - exact live Team member.
 * @returns Lead and teammate rows in creation order.
 */
listMembers(agent: Agent): TeamMemberView[]

/**
 * Create one named, continuable direct child of the Team Lead.
 * @param caller - exact live Lead Agent.
 * @param request - immutable name, description, prompt, context mode, subagent provider, optional LLM `agentOptions`, and cancellation.
 * @returns the active roster row.
 */
async spawnTeammate(caller: Agent, request: SpawnTeammateRequest): Promise<SpawnTeammateResult>

/**
 * Lead-authorized product Bot create: required non-empty `displayName` plus exactly one model assignment.
 * Persists the Bot on the Host Team roster with durable `modelSelection`, spawns with `agentOptions`,
 * and binds the live Agent through `installModelSelection` so subsequent chats keep that assignment.
 * Model calls resolve through Host `ctx.llm` adapters under `packages/llm/` using that assignment and
 * Host `ctx.credentials` resolve — Electron Main must not invent bot records or route models.
 * @param caller - exact live Lead Agent.
 * @param request - displayName, ModelSelection, and cancellation.
 * @returns Host-owned Bot identity, derived roster name, retained model assignment, and roster row.
 */
async createBot(caller: Agent, request: CreateBotRequest): Promise<CreateBotResult>

/**
 * Lead-authorized Host rename (FR-004).
 * Persists a non-empty `displayName` on the Bot identity without changing the kebab roster `name`.
 * Duplicate display names are allowed; empty/whitespace-only names reject without writing.
 * Electron Main must not invent rename records — Host owns the durable write (research R1).
 * @param caller - exact live Lead Agent.
 * @param request - bot id, replacement displayName, and cancellation.
 * @returns updated Host Bot identity after rename.
 */
async renameBot(caller: Agent, request: RenameBotRequest): Promise<RenameBotResult>

/**
 * Lead-authorized Host persona update (FR-002 / FR-003 / FR-013).
 * Replaces job / voice / antiJobs on the Bot; empty fields are allowed.
 * Persists on the Team journal and refreshes live instruction bind when the Bot Agent is up.
 * Rejects without writing when the caller is not Lead, the Bot is missing/inactive, or the
 * signal is aborted — prior durable persona values stay unchanged (T018 Host reject path).
 * Electron Main must not invent persona records — Host owns the durable write (research R1).
 * @param caller - exact live Lead Agent.
 * @param request - bot id, persona fields, and cancellation.
 * @returns updated Host Bot identity after persona save.
 */
async updatePersona(caller: Agent, request: UpdatePersonaRequest): Promise<UpdatePersonaResult>

/**
 * Lead-authorized Host avatar-marker set (FR-005 / clarify lock 3).
 * Replaces the Bot’s preset shape and/or color marker; at least one field required.
 * Image-file / URL upload is out of Pass scope — Host accepts only fixed preset ids.
 * Electron Main must not invent avatar records — Host owns the durable write (research R1).
 * @param caller - exact live Lead Agent.
 * @param request - bot id, avatar marker, and cancellation.
 * @returns updated Host Bot identity after avatar set.
 */
async setAvatar(caller: Agent, request: SetAvatarRequest): Promise<SetAvatarResult>

/**
 * Lead-authorized Host named sidebar section create (FR-006 / T031).
 * Persists a catalog row `{ id, name }` on the Team journal; Unassigned is never stored.
 * Empty / whitespace-only names reject without writing.
 * Electron Main must not invent section records — Host owns the durable write (research R1).
 * @param caller - exact live Lead Agent.
 * @param request - non-empty section name and cancellation.
 * @returns Host-owned named section with empty membership.
 */
async createSection(caller: Agent, request: CreateSectionRequest): Promise<CreateSectionResult>

/**
 * Lead-authorized Host named sidebar section rename (FR-006 / T031).
 * Empty / whitespace-only names reject without writing; missing section id rejects.
 * Electron Main must not invent section records — Host owns the durable write (research R1).
 * @param caller - exact live Lead Agent.
 * @param request - section id, replacement name, and cancellation.
 * @returns Host-owned named section after rename (membership unchanged).
 */
async renameSection(caller: Agent, request: RenameSectionRequest): Promise<RenameSectionResult>

/**
 * Lead-authorized Host section assign / move / unassign (FR-006 / T032).
 * `sectionId: null` places the bot under Unassigned/default without a catalog row.
 * Non-null id must name an existing named section; empty named sections may remain.
 * Electron Main must not invent section membership — Host owns the durable write (research R1).
 * @param caller - exact live Lead Agent.
 * @param request - bot id, section id or null, and cancellation.
 * @returns updated Host Bot identity after section membership change.
 */
async assignSection(caller: Agent, request: AssignSectionRequest): Promise<AssignSectionResult>

/**
 * Project named sidebar sections + Unassigned bot ids for one Lead (T033).
 * @param caller - exact live Team member.
 * @returns named section views and Unassigned bot ids (no Unassigned catalog row).
 */
listSections(caller: Agent): { readonly sections: readonly SidebarSectionView[] readonly unassignedBotIds: readonly SessionId[] }

/**
 * Lead-authorized Host delete (FR-007 / FR-008 / clarify lock 5).
 * Appends an `active` → `deleted` identity tombstone and clears section membership.
 * Client roster / overview / section projections omit the Bot after commit.
 * Transcript and mailbox cleanup MAY follow Host/session rules later and MUST NOT
 * block this mutation or Pass — this path does not wipe them.
 * Mid-flight reject / abort leaves the prior active row listed (T029 Host).
 * Electron Main must not invent delete records — Host owns the durable write (research R1).
 * @param caller - exact live Lead Agent.
 * @param request - bot id and cancellation.
 * @returns acknowledgement after durable identity removal.
 */
async deleteBot(caller: Agent, request: DeleteBotRequest): Promise<DeleteBotResult>

/**
 * Queue one durable peer message, then attempt immediate delivery.
 * @param caller - exact live sending Team member.
 * @param request - target name, content, and pre-queue cancellation.
 * @returns durable message identity and immediate-delivery observation.
 */
async sendMessage(caller: Agent, request: SendTeamMessageRequest): Promise<SendTeamMessageResult>

/**
 * Create one unowned pending task in the Team Lead log.
 * @param caller - exact live Team member creating the task.
 * @param request - task text, blockers, and advisory write scopes.
 * @returns the revision-one task view.
 */
async createTask(caller: Agent, request: CreateTeamTaskRequest): Promise<TeamTaskView>

/**
 * Return one task, including a deleted tombstone.
 * @param caller - exact live Team member reading the task.
 * @param id - Team-local task identity.
 * @returns the latest task value and derived readiness diagnostics.
 */
getTask(caller: Agent, id: TeamTaskId): TeamTaskView

/**
 * List current non-deleted tasks in numeric creation order.
 * @param caller - exact live Team member reading the board.
 * @returns detached current task views.
 */
listTasks(caller: Agent): TeamTaskView[]

/**
 * Compare-and-set one authorized task transition.
 * @param caller - exact live Team member authorizing the mutation.
 * @param request - task identity, expected revision, action, and action fields.
 * @returns the committed next task revision.
 */
async updateTask(caller: Agent, request: UpdateTeamTaskRequest): Promise<TeamTaskView>

/**
 * Wait for the next Team-domain or member-status change.
 * @param caller - exact live Team member waiting for activity.
 * @param timeoutMs - bounded wait duration from ten seconds through one hour.
 * @param signal - caller cancellation for the wait only.
 * @returns one observed change or a timeout result.
 */
async waitForChange(caller: Agent, timeoutMs: number, signal: AbortSignal): Promise<TeamWaitResult>

/**
 * Interrupt one live teammate turn without clearing its pending inbox.
 * @param caller - exact live Lead Agent.
 * @param targetName - durable teammate name.
 * @returns the target status sampled before cancellation.
 */
interrupt(caller: Agent, targetName: string): { previousStatus: 'running' | 'idle' | 'inactive' }

/**
 * Resolve a caller without throwing, used by scoped-tool installation and observers.
 * @param agent - candidate exact live Agent.
 * @returns Team membership, or undefined for non-Team subagents and stale identities.
 */
tryMembership(agent: Agent): TeamMembership | undefined

/**
 * Read the current roster, non-deleted task board, sidebar sections + Unassigned,
 * and Host mailbox handoffs through the generated Remote API (FR-005 / FR-006).
 * Handoffs reconstruct from Lead Session + target Session logs — never Main-synthesized IPC.
 * @param agent - exact live Team member used as the authority credential.
 * @param signal - cancellation for cold target Session reads.
 * @returns detached current roster, task, section, and handoff views.
 */
@Remote('view') async remoteView(agent: Agent, signal: AbortSignal): Promise<TeamView>

/**
 * Project Host mailbox handoffs for one Lead from session/RPC projections.
 * @param root - exact live Team Lead.
 * @param signal - cancellation for persisted target Session reads.
 * @returns product {@link HostMailboxMessage} rows in Lead queue order.
 */
async listHandoffs(root: Agent, signal: AbortSignal): Promise<HostMailboxMessage[]>

/**
 * Create one shared task through the generated Remote API.
 * @param agent - exact live Team member creating the task.
 * @param request - task text, blockers, and advisory write scopes.
 * @returns the revision-one task or a typed Team rejection.
 */
@Remote('createTask') remoteCreateTask(agent: Agent, request: CreateTeamTaskRequest): Promise<TeamTaskMutationResult>

/**
 * Create one product Bot through the generated Remote API (FR-001 / FR-002).
 * @param agent - exact live Lead Agent authorizing create.
 * @param request - displayName and exactly one model/provider assignment.
 * @param signal - Remote call cancellation forwarded to teammate provisioning.
 * @returns the retained Bot or a typed Team rejection.
 */
@Remote('createBot') remoteCreateBot( agent: Agent, request: CreateBotInput, signal: AbortSignal, ): Promise<CreateBotMutationResult>

/**
 * Rename one product Bot through the generated Remote API (FR-004).
 * @param agent - exact live Lead Agent authorizing rename.
 * @param request - bot id and non-empty replacement displayName.
 * @param signal - Remote call cancellation.
 * @returns the renamed Bot or a typed Team rejection.
 */
@Remote('renameBot') remoteRenameBot( agent: Agent, request: RenameBotInput, signal: AbortSignal, ): Promise<BotIdentityMutationResult<RenameBotResult>>

/**
 * Update one product Bot persona through the generated Remote API (FR-002 / FR-003).
 * @param agent - exact live Lead Agent authorizing the update.
 * @param request - bot id plus job / voice / antiJobs (empty allowed).
 * @param signal - Remote call cancellation.
 * @returns the updated Bot or a typed Team rejection.
 */
@Remote('updatePersona') remoteUpdatePersona( agent: Agent, request: UpdatePersonaInput, signal: AbortSignal, ): Promise<BotIdentityMutationResult<UpdatePersonaResult>>

/**
 * Set one product Bot avatar marker through the generated Remote API (FR-005).
 * @param agent - exact live Lead Agent authorizing the update.
 * @param request - bot id and preset avatar marker.
 * @param signal - Remote call cancellation.
 * @returns the updated Bot or a typed Team rejection.
 */
@Remote('setAvatar') remoteSetAvatar( agent: Agent, request: SetAvatarInput, signal: AbortSignal, ): Promise<BotIdentityMutationResult<SetAvatarResult>>

/**
 * Create one named sidebar section through the generated Remote API (FR-006).
 * @param agent - exact live Lead Agent authorizing create.
 * @param request - non-empty section name.
 * @param signal - Remote call cancellation.
 * @returns the created section or a typed Team rejection.
 */
@Remote('createSection') remoteCreateSection( agent: Agent, request: CreateSectionInput, signal: AbortSignal, ): Promise<BotIdentityMutationResult<CreateSectionResult>>

/**
 * Rename one named sidebar section through the generated Remote API (FR-006).
 * @param agent - exact live Lead Agent authorizing rename.
 * @param request - section id and non-empty replacement name.
 * @param signal - Remote call cancellation.
 * @returns the renamed section or a typed Team rejection.
 */
@Remote('renameSection') remoteRenameSection( agent: Agent, request: RenameSectionInput, signal: AbortSignal, ): Promise<BotIdentityMutationResult<RenameSectionResult>>

/**
 * Assign or unassign one product Bot sidebar section through the generated Remote API (FR-006).
 * @param agent - exact live Lead Agent authorizing the update.
 * @param request - bot id and section id or `null` for Unassigned/default.
 * @param signal - Remote call cancellation.
 * @returns the updated Bot or a typed Team rejection.
 */
@Remote('assignSection') remoteAssignSection( agent: Agent, request: AssignSectionInput, signal: AbortSignal, ): Promise<BotIdentityMutationResult<AssignSectionResult>>

/**
 * Delete one product Bot identity through the generated Remote API (FR-007 / FR-008).
 * @param agent - exact live Lead Agent authorizing delete.
 * @param request - bot id to remove.
 * @param signal - Remote call cancellation.
 * @returns deletion acknowledgement or a typed Team rejection.
 */
@Remote('deleteBot') remoteDeleteBot( agent: Agent, request: DeleteBotInput, signal: AbortSignal, ): Promise<BotIdentityMutationResult<DeleteBotResult>>

/**
 * Apply one task mutation and preserve Team rejections as business results.
 * @param agent - exact live Team member authorizing the mutation.
 * @param request - task identity, expected revision, action, and action fields.
 * @returns the committed task or a typed Team rejection.
 */
@Remote('updateTask') remoteUpdateTask(agent: Agent, request: UpdateTeamTaskRequest): Promise<TeamTaskMutationResult>
```

Types: [Agent](core.md) · [SessionId](core.md)

Source: [`packages/experimental/agent-team/src/index.ts`](../../packages/experimental/agent-team/src/index.ts)
<!-- END GENERATED cordis-surface -->
