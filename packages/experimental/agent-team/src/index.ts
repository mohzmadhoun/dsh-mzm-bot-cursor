/** Agent Teams service façade over roster, mailbox, task, and runtime lifecycle owners. */

import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { SessionEvent, SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { TeamActivity } from './activity.ts'
import { errorMessage, TeamError } from './error.ts'
import { TeamJournal } from './journal.ts'
import { TeamRuntimeLifecycle } from './lifecycle.ts'
import { TeamMailbox } from './mailbox.ts'
import {
  bindTeammateModelSelection,
  resolveTeammateModelSelection,
} from './model-selection-bind.ts'
import { readPersistedSession } from './persisted.ts'
import { projectMailboxHandoffs, teamProjectionDefinition } from './projection.ts'
import { TeamRoster } from './roster.ts'
import type { TeamMembership } from './roster.ts'
import { TeamTaskBoard } from './task-board.ts'
import { TeamId, TeamTaskId } from './types.ts'
import type {
  Config,
  CreateBotInput,
  CreateBotMutationResult,
  CreateBotRequest,
  CreateBotResult,
  CreateTeamTaskRequest,
  AssignSectionInput,
  AssignSectionRequest,
  AssignSectionResult,
  BotIdentityMutationResult,
  DeleteBotInput,
  DeleteBotRequest,
  DeleteBotResult,
  HostMailboxMessage,
  RenameBotInput,
  RenameBotRequest,
  RenameBotResult,
  SendTeamMessageRequest,
  SendTeamMessageResult,
  SetAvatarInput,
  SetAvatarRequest,
  SetAvatarResult,
  SpawnTeammateRequest,
  SpawnTeammateResult,
  TeamMemberView,
  TeamTaskMutationResult,
  TeamTaskView,
  TeamView,
  TeamWaitResult,
  UpdatePersonaInput,
  UpdatePersonaRequest,
  UpdatePersonaResult,
  UpdateTeamTaskRequest,
} from './types.ts'
import {
  requiredDisplayName,
  requiredModelSelection,
  teammateNameFromDisplayName,
} from './validation.ts'

export type * from './types.ts'
export type { TeamMembership } from './roster.ts'
export { TeamId, TeamMessageId, TeamTaskId, SidebarSectionId } from './types.ts'
export { TeamError } from './error.ts'
export { observeMailboxDeliveryState } from './delivery-state.ts'
export {
  HOST_MAILBOX_MESSAGE_SOURCE,
  readHostMailboxMessage,
} from './host-mailbox-message.ts'
export { projectMailboxHandoffs } from './projection.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    agentTeams: TeamService
  }
}

const DEFAULT_MAX_MEMBERS = 16
const DEFAULT_MAX_TASKS = 256
const DEFAULT_MAX_PENDING_MESSAGES = 64
const DEFAULT_MAX_MESSAGE_BYTES = 65_536
const DEFAULT_DISPOSAL_TIMEOUT_MS = 5_000

/** Validate one positive safe-integer deployment limit. */
function positiveLimit(name: string, value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TeamError(`${name} must be a positive safe integer`, 'TEAM_INVALID_CONFIG')
  }
  return value
}

/** Agent Teams service backed by the exact live Lead Session log. */
export class TeamService extends TypertRemoteService {
  static inject = ['agents', 'sessions', 'sessionPersistence', 'sessionProjections', 'subagents']

  static Config: z<Config> = z.object({
    maxMembers: z.number().step(1).min(1).default(DEFAULT_MAX_MEMBERS),
    maxTasks: z.number().step(1).min(1).default(DEFAULT_MAX_TASKS),
    maxPendingMessagesPerMember: z.number().step(1).min(1).default(DEFAULT_MAX_PENDING_MESSAGES),
    maxMessageBytes: z.number().step(1).min(1).default(DEFAULT_MAX_MESSAGE_BYTES),
    disposalTimeoutMs: z.number().step(1).min(1).default(DEFAULT_DISPOSAL_TIMEOUT_MS),
  })

  /** Validated deployment limits used by every Team operation. */
  private readonly config: Required<Config>

  private readonly activity: TeamActivity
  private readonly lifecycle: TeamRuntimeLifecycle
  private readonly journal: TeamJournal
  private readonly roster: TeamRoster
  private readonly mailbox: TeamMailbox
  private readonly tasks: TeamTaskBoard

  constructor(ctx: Context, config: Config = {}) {
    super(ctx, 'agentTeams')
    this.config = {
      maxMembers: positiveLimit('maxMembers', config.maxMembers ?? DEFAULT_MAX_MEMBERS),
      maxTasks: positiveLimit('maxTasks', config.maxTasks ?? DEFAULT_MAX_TASKS),
      maxPendingMessagesPerMember: positiveLimit(
        'maxPendingMessagesPerMember',
        config.maxPendingMessagesPerMember ?? DEFAULT_MAX_PENDING_MESSAGES,
      ),
      maxMessageBytes: positiveLimit('maxMessageBytes', config.maxMessageBytes ?? DEFAULT_MAX_MESSAGE_BYTES),
      disposalTimeoutMs: positiveLimit(
        'disposalTimeoutMs',
        config.disposalTimeoutMs ?? DEFAULT_DISPOSAL_TIMEOUT_MS,
      ),
    }

    this.activity = new TeamActivity()
    this.lifecycle = new TeamRuntimeLifecycle(this.config.disposalTimeoutMs)
    this.journal = new TeamJournal(ctx, (root) => { this.activity.notify(TeamId(root.id)) })
    this.roster = new TeamRoster(ctx, this.journal, this.lifecycle, this.config.maxMembers)
    this.mailbox = new TeamMailbox(
      ctx,
      this.journal,
      this.roster,
      this.lifecycle,
      this.config.maxPendingMessagesPerMember,
      this.config.maxMessageBytes,
    )
    this.tasks = new TeamTaskBoard(this.journal, this.config.maxTasks)

    ctx.on('session/event', (session, event) => { this.mailbox.observeSessionEvent(session, event) })
    ctx.on('agent/created', ({ agent }) => {
      this.bindTeammateModelSelection(agent)
      this.scheduleRecovery(agent)
    })
    ctx.on('agent/status', ({ agent }) => {
      const membership = this.roster.tryMembership(agent)
      if (membership !== undefined) this.activity.notify(membership.id)
    })
    ctx.effect(() => {
      const disposeProjection = ctx.root.sessionProjections.register(teamProjectionDefinition)
      return async () => {
        try {
          await this.disposeRuntime()
        } finally {
          disposeProjection()
        }
      }
    }, 'agentTeams.runtimeLifecycle()')
    for (const agent of ctx.agents.list()) this.scheduleRecovery(agent)
  }

  /**
   * Resolve one exact live Agent's Team role.
   * @param agent - exact live Agent used as the authority credential.
   * @returns its root, Team identity, role, and model-facing name.
   */
  membership(agent: Agent): TeamMembership {
    return this.roster.membership(agent)
  }

  /**
   * List the runtime-enriched roster visible to one Team member.
   * @param agent - exact live Team member.
   * @returns Lead and teammate rows in creation order.
   */
  listMembers(agent: Agent): TeamMemberView[] {
    return this.roster.list(this.roster.membership(agent))
  }

  /**
   * Create one named, continuable direct child of the Team Lead.
   * @param caller - exact live Lead Agent.
   * @param request - immutable name, description, prompt, context mode, subagent provider, optional LLM `agentOptions`, and cancellation.
   * @returns the active roster row.
   */
  async spawnTeammate(caller: Agent, request: SpawnTeammateRequest): Promise<SpawnTeammateResult> {
    return await this.roster.spawn(caller, request)
  }

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
  async createBot(caller: Agent, request: CreateBotRequest): Promise<CreateBotResult> {
    const displayName = requiredDisplayName(request.displayName)
    const modelSelection = requiredModelSelection(request.modelSelection)
    const name = teammateNameFromDisplayName(displayName)
    const { member } = await this.roster.spawn(caller, {
      name,
      description: displayName,
      displayName,
      prompt: [{ type: 'text', text: `You are bot "${displayName}".` }],
      context: 'fresh',
      provider: 'spawn',
      agentOptions: modelSelection,
      signal: request.signal,
    })
    return {
      id: member.id,
      displayName,
      name,
      modelSelection,
      member,
    }
  }

  /**
   * Lead-authorized Host rename stub (FR-004).
   * Persists a non-empty `displayName` on the Bot identity without changing the kebab roster `name`.
   * Electron Main must not invent rename records — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, replacement displayName, and cancellation.
   * @returns updated Host Bot identity after rename.
   */
  async renameBot(caller: Agent, request: RenameBotRequest): Promise<RenameBotResult> {
    void caller
    void request
    throw new TeamError('Host renameBot is not implemented yet', 'TEAM_NOT_IMPLEMENTED')
  }

  /**
   * Lead-authorized Host persona update stub (FR-002 / FR-003).
   * Replaces job / voice / antiJobs on the Bot; empty fields are allowed.
   * Electron Main must not invent persona records — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, persona fields, and cancellation.
   * @returns updated Host Bot identity after persona save.
   */
  async updatePersona(caller: Agent, request: UpdatePersonaRequest): Promise<UpdatePersonaResult> {
    void caller
    void request
    throw new TeamError('Host updatePersona is not implemented yet', 'TEAM_NOT_IMPLEMENTED')
  }

  /**
   * Lead-authorized Host avatar-marker stub (FR-005).
   * Sets a preset shape and/or color marker; image upload is out of Pass scope.
   * Electron Main must not invent avatar records — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, avatar marker, and cancellation.
   * @returns updated Host Bot identity after avatar set.
   */
  async setAvatar(caller: Agent, request: SetAvatarRequest): Promise<SetAvatarResult> {
    void caller
    void request
    throw new TeamError('Host setAvatar is not implemented yet', 'TEAM_NOT_IMPLEMENTED')
  }

  /**
   * Lead-authorized Host section assign / unassign stub (FR-006).
   * `sectionId: null` places the bot under Unassigned/default.
   * Electron Main must not invent section membership — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, section id or null, and cancellation.
   * @returns updated Host Bot identity after section membership change.
   */
  async assignSection(caller: Agent, request: AssignSectionRequest): Promise<AssignSectionResult> {
    void caller
    void request
    throw new TeamError('Host assignSection is not implemented yet', 'TEAM_NOT_IMPLEMENTED')
  }

  /**
   * Lead-authorized Host delete stub (FR-007 / FR-008).
   * Removes Bot identity from roster / overview / section membership; transcript cleanup is out of band.
   * Electron Main must not invent delete records — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - bot id and cancellation.
   * @returns acknowledgement after durable identity removal.
   */
  async deleteBot(caller: Agent, request: DeleteBotRequest): Promise<DeleteBotResult> {
    void caller
    void request
    throw new TeamError('Host deleteBot is not implemented yet', 'TEAM_NOT_IMPLEMENTED')
  }

  /**
   * Queue one durable peer message, then attempt immediate delivery.
   * @param caller - exact live sending Team member.
   * @param request - target name, content, and pre-queue cancellation.
   * @returns durable message identity and immediate-delivery observation.
   */
  async sendMessage(caller: Agent, request: SendTeamMessageRequest): Promise<SendTeamMessageResult> {
    return await this.mailbox.send(caller, request)
  }

  /**
   * Create one unowned pending task in the Team Lead log.
   * @param caller - exact live Team member creating the task.
   * @param request - task text, blockers, and advisory write scopes.
   * @returns the revision-one task view.
   */
  async createTask(caller: Agent, request: CreateTeamTaskRequest): Promise<TeamTaskView> {
    return await this.tasks.create(this.roster.membership(caller), request)
  }

  /**
   * Return one task, including a deleted tombstone.
   * @param caller - exact live Team member reading the task.
   * @param id - Team-local task identity.
   * @returns the latest task value and derived readiness diagnostics.
   */
  getTask(caller: Agent, id: TeamTaskId): TeamTaskView {
    return this.tasks.get(this.roster.membership(caller), id)
  }

  /**
   * List current non-deleted tasks in numeric creation order.
   * @param caller - exact live Team member reading the board.
   * @returns detached current task views.
   */
  listTasks(caller: Agent): TeamTaskView[] {
    return this.tasks.list(this.roster.membership(caller))
  }

  /**
   * Compare-and-set one authorized task transition.
   * @param caller - exact live Team member authorizing the mutation.
   * @param request - task identity, expected revision, action, and action fields.
   * @returns the committed next task revision.
   */
  async updateTask(caller: Agent, request: UpdateTeamTaskRequest): Promise<TeamTaskView> {
    return await this.tasks.update(caller, this.roster.membership(caller), request)
  }

  /**
   * Wait for the next Team-domain or member-status change.
   * @param caller - exact live Team member waiting for activity.
   * @param timeoutMs - bounded wait duration from ten seconds through one hour.
   * @param signal - caller cancellation for the wait only.
   * @returns one observed change or a timeout result.
   */
  async waitForChange(caller: Agent, timeoutMs: number, signal: AbortSignal): Promise<TeamWaitResult> {
    const membership = this.roster.membership(caller)
    return await this.activity.wait(membership.id, timeoutMs, signal)
  }

  /**
   * Interrupt one live teammate turn without clearing its pending inbox.
   * @param caller - exact live Lead Agent.
   * @param targetName - durable teammate name.
   * @returns the target status sampled before cancellation.
   */
  interrupt(caller: Agent, targetName: string): { previousStatus: 'running' | 'idle' | 'inactive' } {
    return this.roster.interrupt(caller, targetName)
  }

  /**
   * Resolve a caller without throwing, used by scoped-tool installation and observers.
   * @param agent - candidate exact live Agent.
   * @returns Team membership, or undefined for non-Team subagents and stale identities.
   */
  tryMembership(agent: Agent): TeamMembership | undefined {
    return this.roster.tryMembership(agent)
  }

  /**
   * Read the current roster, non-deleted task board, and Host mailbox handoffs
   * through the generated Remote API (FR-005). Handoffs reconstruct from Lead
   * Session + target Session logs — never Main-synthesized IPC.
   * @param agent - exact live Team member used as the authority credential.
   * @param signal - cancellation for cold target Session reads.
   * @returns detached current roster, task, and handoff views.
   */
  @Remote('view')
  async remoteView(agent: Agent, signal: AbortSignal): Promise<TeamView> {
    const membership = this.roster.membership(agent)
    return {
      members: this.listMembers(agent),
      tasks: this.listTasks(agent),
      handoffs: await this.listHandoffs(membership.root, signal),
    }
  }

  /**
   * Project Host mailbox handoffs for one Lead from session/RPC projections.
   * @param root - exact live Team Lead.
   * @param signal - cancellation for persisted target Session reads.
   * @returns product {@link HostMailboxMessage} rows in Lead queue order.
   */
  async listHandoffs(root: Agent, signal: AbortSignal): Promise<HostMailboxMessage[]> {
    const state = this.journal.state(root)
    const leadEvents = root.session.snapshotEvents()
    const targetIds = [...new Set(state.messages.map(message => message.targetId))]
    const targetEventsById = new Map<SessionId, readonly SessionEvent[]>()
    for (const targetId of targetIds) {
      targetEventsById.set(targetId, await this.targetEventsFor(targetId, signal))
    }
    return projectMailboxHandoffs(leadEvents, targetEventsById, state.id)
  }

  /**
   * Read one target Session log for handoff deliveryState fold.
   * Prefers the live Agent snapshot; falls back to short-lived persistence read.
   * @param targetId - recipient Bot Session identity.
   * @param signal - cancellation for the persistence open/read.
   * @returns detached events, or `[]` when the target log is unavailable.
   */
  private async targetEventsFor(
    targetId: SessionId,
    signal: AbortSignal,
  ): Promise<readonly SessionEvent[]> {
    const live = this.ctx.agents.get(targetId)
    if (live !== undefined) return live.session.snapshotEvents()
    try {
      const stored = await readPersistedSession(this.ctx.sessionPersistence, targetId, signal)
      return stored.events
    } catch (error: unknown) {
      this.ctx.logger.warn(
        `cannot read Team handoff target "${targetId}": ${errorMessage(error)}`,
      )
      return []
    }
  }

  /**
   * Create one shared task through the generated Remote API.
   * @param agent - exact live Team member creating the task.
   * @param request - task text, blockers, and advisory write scopes.
   * @returns the revision-one task or a typed Team rejection.
   */
  @Remote('createTask')
  remoteCreateTask(agent: Agent, request: CreateTeamTaskRequest): Promise<TeamTaskMutationResult> {
    return this.taskMutationResult(this.createTask(agent, request))
  }

  /**
   * Create one product Bot through the generated Remote API (FR-001 / FR-002).
   * @param agent - exact live Lead Agent authorizing create.
   * @param request - displayName and exactly one model/provider assignment.
   * @param signal - Remote call cancellation forwarded to teammate provisioning.
   * @returns the retained Bot or a typed Team rejection.
   */
  @Remote('createBot')
  remoteCreateBot(
    agent: Agent,
    request: CreateBotInput,
    signal: AbortSignal,
  ): Promise<CreateBotMutationResult> {
    return this.createBotMutationResult(this.createBot(agent, { ...request, signal }))
  }

  /**
   * Rename one product Bot through the generated Remote API (FR-004).
   * @param agent - exact live Lead Agent authorizing rename.
   * @param request - bot id and non-empty replacement displayName.
   * @param signal - Remote call cancellation.
   * @returns the renamed Bot or a typed Team rejection.
   */
  @Remote('renameBot')
  remoteRenameBot(
    agent: Agent,
    request: RenameBotInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<RenameBotResult>> {
    return this.botIdentityMutationResult(this.renameBot(agent, { ...request, signal }))
  }

  /**
   * Update one product Bot persona through the generated Remote API (FR-002 / FR-003).
   * @param agent - exact live Lead Agent authorizing the update.
   * @param request - bot id plus job / voice / antiJobs (empty allowed).
   * @param signal - Remote call cancellation.
   * @returns the updated Bot or a typed Team rejection.
   */
  @Remote('updatePersona')
  remoteUpdatePersona(
    agent: Agent,
    request: UpdatePersonaInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<UpdatePersonaResult>> {
    return this.botIdentityMutationResult(this.updatePersona(agent, { ...request, signal }))
  }

  /**
   * Set one product Bot avatar marker through the generated Remote API (FR-005).
   * @param agent - exact live Lead Agent authorizing the update.
   * @param request - bot id and preset avatar marker.
   * @param signal - Remote call cancellation.
   * @returns the updated Bot or a typed Team rejection.
   */
  @Remote('setAvatar')
  remoteSetAvatar(
    agent: Agent,
    request: SetAvatarInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<SetAvatarResult>> {
    return this.botIdentityMutationResult(this.setAvatar(agent, { ...request, signal }))
  }

  /**
   * Assign or unassign one product Bot sidebar section through the generated Remote API (FR-006).
   * @param agent - exact live Lead Agent authorizing the update.
   * @param request - bot id and section id or `null` for Unassigned/default.
   * @param signal - Remote call cancellation.
   * @returns the updated Bot or a typed Team rejection.
   */
  @Remote('assignSection')
  remoteAssignSection(
    agent: Agent,
    request: AssignSectionInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<AssignSectionResult>> {
    return this.botIdentityMutationResult(this.assignSection(agent, { ...request, signal }))
  }

  /**
   * Delete one product Bot identity through the generated Remote API (FR-007 / FR-008).
   * @param agent - exact live Lead Agent authorizing delete.
   * @param request - bot id to remove.
   * @param signal - Remote call cancellation.
   * @returns deletion acknowledgement or a typed Team rejection.
   */
  @Remote('deleteBot')
  remoteDeleteBot(
    agent: Agent,
    request: DeleteBotInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<DeleteBotResult>> {
    return this.botIdentityMutationResult(this.deleteBot(agent, { ...request, signal }))
  }

  /**
   * Apply one task mutation and preserve Team rejections as business results.
   * @param agent - exact live Team member authorizing the mutation.
   * @param request - task identity, expected revision, action, and action fields.
   * @returns the committed task or a typed Team rejection.
   */
  @Remote('updateTask')
  remoteUpdateTask(agent: Agent, request: UpdateTeamTaskRequest): Promise<TeamTaskMutationResult> {
    return this.taskMutationResult(this.updateTask(agent, request))
  }

  /** Preserve Team task rejections while allowing unexpected failures to reject the Remote call. */
  private async taskMutationResult(operation: Promise<TeamTaskView>): Promise<TeamTaskMutationResult> {
    try {
      return { ok: true, value: await operation }
    } catch (error) {
      if (!(error instanceof TeamError)) throw error
      return {
        ok: false,
        error: {
          code: error.code === 'TEAM_TASK_STALE_REVISION' ? 'team-task-conflict' : 'team-rejected',
          message: error.message,
        },
      }
    }
  }

  /** Preserve Team createBot rejections while allowing unexpected failures to reject the Remote call. */
  private createBotMutationResult(operation: Promise<CreateBotResult>): Promise<CreateBotMutationResult> {
    return this.botIdentityMutationResult(operation)
  }

  /** Preserve Team bot-identity rejections while allowing unexpected failures to reject the Remote call. */
  private async botIdentityMutationResult<T>(operation: Promise<T>): Promise<BotIdentityMutationResult<T>> {
    try {
      return { ok: true, value: await operation }
    } catch (error) {
      if (!(error instanceof TeamError)) throw error
      return {
        ok: false,
        error: {
          code: 'team-rejected',
          message: error.message,
        },
      }
    }
  }

  /** Queue one contained recovery pass after publication has unwound. */
  private scheduleRecovery(agent: Agent): void {
    queueMicrotask(() => {
      if (this.lifecycle.disposed) return
      void this.recoverFor(agent).catch((error: unknown) => {
        if (this.lifecycle.disposed) return
        this.ctx.logger.warn(`Agent Teams recovery for "${agent.id}" failed: ${errorMessage(error)}`)
      })
    })
  }

  /**
   * Bind one teammate Agent to its durable Host ModelSelection via installModelSelection.
   * Lead Agents and non-Team children are left unbound (FR-002 applies per Bot).
   * @param agent - newly created or resumed exact live Agent.
   */
  private bindTeammateModelSelection(agent: Agent): void {
    const membership = this.roster.tryMembership(agent)
    if (membership === undefined || membership.role !== 'teammate') return
    const member = this.journal.state(membership.root).members.find(row => row.id === agent.id)
    const selection = resolveTeammateModelSelection(agent, member)
    if (selection === undefined) return
    bindTeammateModelSelection(agent, selection)
  }

  /** Reconcile roster provisioning before retrying that member's pending mailbox. */
  private async recoverFor(agent: Agent): Promise<void> {
    await this.roster.recoverFor(agent, this.lifecycle.signal)
    await this.mailbox.recoverFor(agent, this.lifecycle.signal)
  }

  /** Stop Team-owned live branches and release every waiter before service disposal completes. */
  private async disposeRuntime(): Promise<void> {
    this.lifecycle.close()
    this.activity.close()

    const failures: unknown[] = []
    await this.lifecycle.settle(this.roster.pendingCreations(), failures)
    await this.lifecycle.settle(this.mailbox.pendingDispatches(), failures)
    for (const [root, childIds] of this.roster.liveChildrenByRoot()) {
      try {
        await this.roster.stopTeammates(root, childIds)
      } catch (error: unknown) {
        failures.push(error)
      }
    }
    if (failures.length > 0) throw new AggregateError(failures, 'Agent Teams runtime disposal failed')
  }
}

export default TeamService
