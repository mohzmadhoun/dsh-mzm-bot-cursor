/** Agent Teams service façade over roster, mailbox, task, and runtime lifecycle owners. */

import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { randomUUID } from 'node:crypto'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createUserMessage, ToolCallId } from '@deepseek-ai/dsh-llm'
import { publicToolName } from '@deepseek-ai/dsh-mcp-client/src/tools.ts'
import { queueHostSubagentPrompt } from '@deepseek-ai/dsh-subagent/internal'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import { writeSkillBundle } from '@deepseek-ai/dsh-skill-filesystem'
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
import {
  bindTeammatePersona,
  type PersonaBindRef,
} from './persona-bind.ts'
import { readPersistedSession } from './persisted.ts'
import {
  projectConnector,
  projectConnectors,
  projectMailboxHandoffs,
  projectMemory,
  projectMemories,
  projectRoutine,
  projectRoutines,
  projectSidebarSections,
  projectSkillCatalog,
  teamProjectionDefinition,
} from './projection.ts'
import {
  bindTeammateMemoryRecall,
  composeMemoryRecall,
  type MemoryBindRef,
} from './memory-bind.ts'
import {
  bindPassConnectorMcpTools,
  describeConnectorCredential as describeConnectorCredentialRecord,
  isBrokenInstallFixture,
  PASS_BROKEN_INSTALL_ERROR,
  PASS_CONNECTOR_CATALOG,
  PASS_FIXTURE_TOOL_RAW_NAME,
  storeConnectorSecret,
} from './connector-bind.ts'
import { gateConnectorToolApproval } from './connector-approval.ts'
import {
  bindTeammateSkillInstructions,
  composeSkillInstructions,
  type SkillBindRef,
} from './skill-bind.ts'
import { TeamRoster } from './roster.ts'
import type { TeamMembership } from './roster.ts'
import { TeamTaskBoard } from './task-board.ts'
import {
  ConnectorId,
  SidebarSectionId,
  MemoryId,
  RoutineId,
  TeamId,
  TeamTaskId,
} from './types.ts'
import type {
  AuthenticateConnectorInput,
  AuthenticateConnectorRequest,
  AuthenticateConnectorResult,
  Config,
  CreateBotInput,
  CreateBotMutationResult,
  CreateBotRequest,
  CreateBotResult,
  CreateSectionInput,
  CreateSectionRequest,
  CreateSectionResult,
  CreateTeamTaskRequest,
  CreateRoutineInput,
  CreateRoutineRequest,
  CreateRoutineResult,
  AssignSectionInput,
  AssignSectionRequest,
  AssignSectionResult,
  AttachSkillInput,
  AttachSkillRequest,
  AttachSkillResult,
  BotIdentityMutationResult,
  BotPersonaProfile,
  ConnectorRecord,
  DeleteBotInput,
  DeleteBotRequest,
  DeleteBotResult,
  DescribeConnectorCredentialInput,
  DescribeConnectorCredentialRequest,
  DescribeConnectorCredentialResult,
  HostMailboxMessage,
  InstallConnectorInput,
  InstallConnectorRequest,
  InstallConnectorResult,
  InvokeConnectorToolInput,
  InvokeConnectorToolRequest,
  InvokeConnectorToolResult,
  GetTrustPolicyResult,
  SetStandingDenyInput,
  SetStandingDenyResult,
  TrustPolicy,
  ListConnectorCatalogResult,
  ListConnectorsResult,
  ConnectorToolCall,
  ListMemoriesInput,
  ListMemoriesRequest,
  ListMemoriesResult,
  ListRoutinesByBotInput,
  ListRoutinesByBotRequest,
  ListRoutinesByBotResult,
  MemoryRecord,
  PauseRoutineInput,
  PauseRoutineRequest,
  PauseRoutineResult,
  RenameBotInput,
  RenameBotRequest,
  RenameBotResult,
  RenameSectionInput,
  RenameSectionRequest,
  RenameSectionResult,
  ResumeRoutineInput,
  ResumeRoutineRequest,
  ResumeRoutineResult,
  RoutineProjection,
  RoutineRecord,
  RoutineStatus,
  WebhookHarnessDeliveryInput,
  WebhookHarnessDeliveryRequest,
  WebhookHarnessDeliveryResult,
  SendTeamMessageRequest,
  SendTeamMessageResult,
  SetAvatarInput,
  SetAvatarRequest,
  SetAvatarResult,
  SidebarSectionView,
  SkillAttachment,
  SkillCatalogSummary,
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
  UpsertUserSkillInput,
  UpsertUserSkillRequest,
  UpsertUserSkillResult,
  WriteMemoryInput,
  WriteMemoryRequest,
  WriteMemoryResult,
} from './types.ts'
import {
  findConnectorCatalogEntry,
  normalizeAvatarMarker,
  normalizePersonaProfile,
  requiredConnectorCatalogId,
  requiredConnectorSecret,
  requiredDisplayName,
  requiredEventTrigger,
  requiredMemoryContent,
  requiredMemoryKind,
  requiredMemoryLayer,
  requiredModelSelection,
  requiredRoutineIntent,
  requiredRoutineTriggerKind,
  requiredScheduleExpr,
  requiredSectionName,
  requiredSkillDisplayName,
  requiredSkillId,
  requiredSkillInstructionalBody,
  skillIdFromDisplayName,
  teammateNameFromDisplayName,
} from './validation.ts'

export type * from './types.ts'
export type { TeamMembership } from './roster.ts'
export {
  ConnectorId,
  TeamId,
  TeamMessageId,
  TeamTaskId,
  SidebarSectionId,
  SkillId,
  MemoryId,
  RoutineId,
} from './types.ts'
export { TeamError } from './error.ts'
export { observeMailboxDeliveryState } from './delivery-state.ts'
export {
  HOST_MAILBOX_MESSAGE_SOURCE,
  readHostMailboxMessage,
} from './host-mailbox-message.ts'
export {
  projectConnector,
  projectConnectors,
  projectMailboxHandoffs,
  projectMemories,
  projectMemory,
  projectRoutines,
  projectRoutine,
  projectSidebarSections,
  projectSkillCatalog,
} from './projection.ts'
export {
  bindPassConnectorMcpTools,
  CONNECTOR_CREDENTIAL_SCOPE,
  connectorCredentialKey,
  describeConnectorCredential,
  isBrokenInstallFixture,
  PASS_BROKEN_FIXTURE_CATALOG_ID,
  PASS_BROKEN_FIXTURE_SERVER_NAME,
  PASS_BROKEN_INSTALL_ERROR,
  PASS_CONNECTOR_CATALOG,
  PASS_FIXTURE_CATALOG_ID,
  PASS_FIXTURE_SERVER_NAME,
  PASS_FIXTURE_TOOL_RAW_NAME,
  passFixturePublicToolName,
  storeConnectorSecret,
} from './connector-bind.ts'
import {
  isRoutineEligibleForWake,
  isRoutineDue,
  routinesDueForWake,
} from './routine-cron.ts'
import {
  isRoutineWebhookHarnessMatch,
  optionalHarnessRoutineId,
  routinesMatchingWebhookHarness,
  WEBHOOK_HARNESS_FAMILY,
} from './routine-event.ts'
export {
  parseScheduleExpr,
  nextFireAt,
  describeScheduleExpr,
  isRoutineEligibleForWake,
  routinesEligibleForWake,
  isRoutineDue,
  routinesDueForWake,
  MIN_EVERY_INTERVAL_MS,
} from './routine-cron.ts'
export {
  isRoutineWebhookHarnessMatch,
  optionalHarnessRoutineId,
  routinesMatchingWebhookHarness,
  WEBHOOK_HARNESS_FAMILY,
} from './routine-event.ts'
export {
  SKILL_INSTRUCTIONS_SECTION,
  bindTeammateSkillInstructions,
  composeSkillInstructions,
} from './skill-bind.ts'
export type { SkillBindRef } from './skill-bind.ts'
export {
  MEMORY_RECALL_SECTION,
  bindTeammateMemoryRecall,
  composeMemoryRecall,
} from './memory-bind.ts'
export type { MemoryBindRef } from './memory-bind.ts'
export { AVATAR_COLOR_IDS, AVATAR_SHAPE_IDS, memoryEligibleForBot } from './validation.ts'

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
/** Default Host Routine cron poll period (15s — Verifier ≤6 min window needs no sub-5m schedule). */
const DEFAULT_ROUTINE_CRON_TICK_MS = 15_000

/** Stable Host rule id registered on optional `ctx.webhookRuntime` (B1 adapt). */
const WEBHOOK_HARNESS_RULE_ID = 'agent-teams-webhook-harness'

/**
 * Structural face for optional `dsh-webhook` runtime (peer may be absent).
 * Rule callbacks MUST return `null` so Pass fire never creates a new Session.
 */
interface OptionalWebhookRuntime {
  register(rule: {
    readonly id: string
    readonly kind: string
    run(
      delivery: {
        readonly kind: string
        readonly source: string
        readonly deliveryId: string
        readonly event: unknown
        readonly receivedAt: number
      },
      signal: AbortSignal,
    ): null | Promise<null>
  }): () => void | Promise<void>
}

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
    routineCronTickMs: z.number().step(1).min(1).default(DEFAULT_ROUTINE_CRON_TICK_MS),
    userSkillsRoot: z.string().min(1),
  })

  /** Validated deployment limits used by every Team operation. */
  private readonly config: Required<Omit<Config, 'userSkillsRoot'>> & {
    readonly userSkillsRoot: string | undefined
  }

  private readonly activity: TeamActivity
  private readonly lifecycle: TeamRuntimeLifecycle
  private readonly journal: TeamJournal
  private readonly roster: TeamRoster
  private readonly mailbox: TeamMailbox
  private readonly tasks: TeamTaskBoard
  /** Live teammate persona refs for instruction bind updates after Host save. */
  private readonly personaBinds = new Map<SessionId, PersonaBindRef>()
  /** Live teammate skill-instruction refs for FR-014 bind updates after Host attach. */
  private readonly skillBinds = new Map<SessionId, SkillBindRef>()
  /** Live teammate memory-recall refs for FR-016 bind updates after Host write. */
  private readonly memoryBinds = new Map<SessionId, MemoryBindRef>()
  /** Disposers for Host-authored runtime skill registrations (re-register on update). */
  private readonly userSkillRegistrations = new Map<string, () => void>()
  /** In-flight Host Routine fires keyed by routineId (dedupe concurrent ticker ticks). */
  private readonly inFlightFires = new Map<RoutineId, Promise<void>>()
  /** Disposers for Pass MCP fixture tools bound after connector auth ready (P6 T010). */
  private readonly mcpBindDisposers = new Map<ConnectorId, () => void>()

  constructor(ctx: Context, config: Config = {}) {
    super(ctx, 'agentTeams')
    const userSkillsRoot = config.userSkillsRoot?.trim()
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
      routineCronTickMs: positiveLimit(
        'routineCronTickMs',
        config.routineCronTickMs ?? DEFAULT_ROUTINE_CRON_TICK_MS,
      ),
      userSkillsRoot: userSkillsRoot === undefined || userSkillsRoot.length === 0
        ? undefined
        : userSkillsRoot,
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
      this.bindTeammatePersona(agent)
      this.bindTeammateSkillInstructions(agent)
      this.bindTeammateMemoryRecall(agent)
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
    // Host process cron ticker (Architect Option 3) — not Electron Main, not dsh-schedule.
    ctx.effect(() => {
      const timer = setInterval(() => {
        void this.evaluateDueRoutines().catch((error: unknown) => {
          if (this.lifecycle.disposed) return
          this.ctx.logger.warn(`Agent Teams routine cron tick failed: ${errorMessage(error)}`)
        })
      }, this.config.routineCronTickMs)
      return () => { clearInterval(timer) }
    }, 'agentTeams.routineCronTicker()')
    // B1: adapt optional dsh-webhook ingress → Routine wake (existing bot + intent), not new-Session.
    ctx.effect(() => {
      const runtime = ctx.get('webhookRuntime') as OptionalWebhookRuntime | undefined
      if (runtime === undefined) return () => {}
      const dispose = runtime.register({
        id: WEBHOOK_HARNESS_RULE_ID,
        kind: WEBHOOK_HARNESS_FAMILY,
        run: async (delivery, signal) => {
          const event = delivery.event !== null && typeof delivery.event === 'object'
            ? delivery.event as Record<string, unknown>
            : {}
          const routineId = optionalHarnessRoutineId(event.routineId)
          const botIdRaw = typeof event.botId === 'string' ? event.botId.trim() : ''
          await this.deliverWebhookHarness({
            deliveryId: String(delivery.deliveryId),
            receivedAt: delivery.receivedAt,
            ...routineId === undefined ? {} : { routineId },
            ...botIdRaw.length === 0 ? {} : { botId: SessionId(botIdRaw) },
            signal,
          })
          return null
        },
      })
      return () => {
        void Promise.resolve(dispose()).catch((error: unknown) => {
          this.ctx.logger.debug(
            `Agent Teams webhook harness rule dispose: ${errorMessage(error)}`,
          )
        })
      }
    }, 'agentTeams.webhookHarnessRule()')
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
   * Lead-authorized Host rename (FR-004).
   * Persists a non-empty `displayName` on the Bot identity without changing the kebab roster `name`.
   * Duplicate display names are allowed; empty/whitespace-only names reject without writing.
   * Electron Main must not invent rename records — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, replacement displayName, and cancellation.
   * @returns updated Host Bot identity after rename.
   */
  async renameBot(caller: Agent, request: RenameBotRequest): Promise<RenameBotResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can rename a teammate', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const displayName = requiredDisplayName(request.displayName)
    const root = membership.root
    const updated = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const current = this.journal.state(root).members.find(member => member.id === request.botId)
      if (current === undefined || current.phase !== 'active') {
        throw new TeamError(
          `active teammate "${request.botId}" not found`,
          'TEAM_MEMBER_NOT_FOUND',
        )
      }
      const member = { ...current, displayName, description: displayName }
      await this.journal.appendAndFlush(root, 'team/member', {
        version: 2,
        teamId: TeamId(root.id),
        member,
      })
      return member
    })
    const view = this.roster.list(membership).find(row => row.id === updated.id)
    /* v8 ignore next 3 -- journal commit above retains the active roster row. */
    if (view === undefined) {
      throw new TeamError(`active teammate "${updated.id}" not found`, 'TEAM_MEMBER_NOT_FOUND')
    }
    return { id: updated.id, displayName, member: view }
  }

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
  async updatePersona(caller: Agent, request: UpdatePersonaRequest): Promise<UpdatePersonaResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can update teammate persona', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const persona = normalizePersonaProfile(request.job, request.voice, request.antiJobs)
    const root = membership.root
    const updated = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const current = this.journal.state(root).members.find(member => member.id === request.botId)
      if (current === undefined || current.phase !== 'active') {
        throw new TeamError(
          `active teammate "${request.botId}" not found`,
          'TEAM_MEMBER_NOT_FOUND',
        )
      }
      const member = { ...current, persona }
      await this.journal.appendAndFlush(root, 'team/member', {
        version: 2,
        teamId: TeamId(root.id),
        member,
      })
      return member
    })
    this.refreshTeammatePersonaBind(updated.id, persona)
    const view = this.roster.list(membership).find(row => row.id === updated.id)
    /* v8 ignore next 3 -- journal commit above retains the active roster row. */
    if (view === undefined) {
      throw new TeamError(`active teammate "${updated.id}" not found`, 'TEAM_MEMBER_NOT_FOUND')
    }
    return { id: updated.id, persona, member: view }
  }

  /**
   * Lead-authorized Host avatar-marker set (FR-005 / clarify lock 3).
   * Replaces the Bot’s preset shape and/or color marker; at least one field required.
   * Image-file / URL upload is out of Pass scope — Host accepts only fixed preset ids.
   * Electron Main must not invent avatar records — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, avatar marker, and cancellation.
   * @returns updated Host Bot identity after avatar set.
   */
  async setAvatar(caller: Agent, request: SetAvatarRequest): Promise<SetAvatarResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can set a teammate avatar', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const avatar = normalizeAvatarMarker(request.avatar)
    const root = membership.root
    const updated = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const current = this.journal.state(root).members.find(member => member.id === request.botId)
      if (current === undefined || current.phase !== 'active') {
        throw new TeamError(
          `active teammate "${request.botId}" not found`,
          'TEAM_MEMBER_NOT_FOUND',
        )
      }
      const member = { ...current, avatar }
      await this.journal.appendAndFlush(root, 'team/member', {
        version: 2,
        teamId: TeamId(root.id),
        member,
      })
      return member
    })
    const view = this.roster.list(membership).find(row => row.id === updated.id)
    /* v8 ignore next 3 -- journal commit above retains the active roster row. */
    if (view === undefined) {
      throw new TeamError(`active teammate "${updated.id}" not found`, 'TEAM_MEMBER_NOT_FOUND')
    }
    return { id: updated.id, avatar, member: view }
  }

  /**
   * Lead-authorized Host named sidebar section create (FR-006 / T031).
   * Persists a catalog row `{ id, name }` on the Team journal; Unassigned is never stored.
   * Empty / whitespace-only names reject without writing.
   * Electron Main must not invent section records — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - non-empty section name and cancellation.
   * @returns Host-owned named section with empty membership.
   */
  async createSection(caller: Agent, request: CreateSectionRequest): Promise<CreateSectionResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can create a sidebar section', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const name = requiredSectionName(request.name)
    const root = membership.root
    const section = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const id = SidebarSectionId(`section-${randomUUID()}`)
      const row = { id, name }
      await this.journal.appendAndFlush(root, 'team/section', {
        version: 2,
        teamId: TeamId(root.id),
        section: row,
      })
      return row
    })
    return {
      id: section.id,
      name: section.name,
      section: { id: section.id, name: section.name, botIds: [] },
    }
  }

  /**
   * Lead-authorized Host named sidebar section rename (FR-006 / T031).
   * Empty / whitespace-only names reject without writing; missing section id rejects.
   * Electron Main must not invent section records — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - section id, replacement name, and cancellation.
   * @returns Host-owned named section after rename (membership unchanged).
   */
  async renameSection(caller: Agent, request: RenameSectionRequest): Promise<RenameSectionResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can rename a sidebar section', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const name = requiredSectionName(request.name)
    const root = membership.root
    const section = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const current = this.journal.state(root).sections.find(row => row.id === request.sectionId)
      if (current === undefined) {
        throw new TeamError(
          `sidebar section "${request.sectionId}" not found`,
          'TEAM_SECTION_NOT_FOUND',
        )
      }
      const row = { id: current.id, name }
      await this.journal.appendAndFlush(root, 'team/section', {
        version: 2,
        teamId: TeamId(root.id),
        section: row,
      })
      return row
    })
    const view = this.sectionView(root, section.id)
    /* v8 ignore next 3 -- journal commit above retains the catalog row. */
    if (view === undefined) {
      throw new TeamError(`sidebar section "${section.id}" not found`, 'TEAM_SECTION_NOT_FOUND')
    }
    return { id: section.id, name: section.name, section: view }
  }

  /**
   * Lead-authorized Host section assign / move / unassign (FR-006 / T032).
   * `sectionId: null` places the bot under Unassigned/default without a catalog row.
   * Non-null id must name an existing named section; empty named sections may remain.
   * Electron Main must not invent section membership — Host owns the durable write (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, section id or null, and cancellation.
   * @returns updated Host Bot identity after section membership change.
   */
  async assignSection(caller: Agent, request: AssignSectionRequest): Promise<AssignSectionResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can assign a sidebar section', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const root = membership.root
    const updated = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const state = this.journal.state(root)
      if (request.sectionId !== null
        && !state.sections.some(section => section.id === request.sectionId)) {
        throw new TeamError(
          `sidebar section "${request.sectionId}" not found`,
          'TEAM_SECTION_NOT_FOUND',
        )
      }
      const current = state.members.find(member => member.id === request.botId)
      if (current === undefined || current.phase !== 'active') {
        throw new TeamError(
          `active teammate "${request.botId}" not found`,
          'TEAM_MEMBER_NOT_FOUND',
        )
      }
      const member = { ...current, sectionId: request.sectionId }
      await this.journal.appendAndFlush(root, 'team/member', {
        version: 2,
        teamId: TeamId(root.id),
        member,
      })
      return member
    })
    const view = this.roster.list(membership).find(row => row.id === updated.id)
    /* v8 ignore next 3 -- journal commit above retains the active roster row. */
    if (view === undefined) {
      throw new TeamError(`active teammate "${updated.id}" not found`, 'TEAM_MEMBER_NOT_FOUND')
    }
    return { id: updated.id, sectionId: request.sectionId, member: view }
  }

  /**
   * Project named sidebar sections + Unassigned bot ids for one Lead (T033).
   * @param caller - exact live Team member.
   * @returns named section views and Unassigned bot ids (no Unassigned catalog row).
   */
  listSections(caller: Agent): {
    readonly sections: readonly SidebarSectionView[]
    readonly unassignedBotIds: readonly SessionId[]
  } {
    const membership = this.roster.membership(caller)
    return projectSidebarSections(this.journal.state(membership.root))
  }

  /**
   * Build one named section Client view from current journal + roster membership.
   * @param root - exact live Team Lead.
   * @param sectionId - named catalog id.
   * @returns section view, or undefined when the catalog row is absent.
   */
  private sectionView(root: Agent, sectionId: SidebarSectionId): SidebarSectionView | undefined {
    const projected = projectSidebarSections(this.journal.state(root))
    return projected.sections.find(section => section.id === sectionId)
  }

  /**
   * Lead-authorized Host Routine create (P4 US1 FR-001 / T015–T016; P6 US2 T022 additive event).
   * Persists a `RoutineRecord` on the Team journal (`team/routine`); status defaults to `active`.
   * Rejects empty intent or unsupported scheduleExpr without writing (loud TeamError).
   * When `triggerKind=event`, requires Pass `eventTrigger=webhook_harness` and ignores scheduleExpr;
   * empty intent still rejects with a clear reason (FR-004). Cron path remains additive (SC-008).
   * Per-`botId` isolation (SC-006); no confirm step and no separate displayName — identity from intent (SC-007).
   * Electron Main must not invent routine records — Host owns the durable write (research R1).
   * Not `@deepseek-ai/dsh-schedule` session reminders (research R2).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, intent, scheduleExpr or eventTrigger, and cancellation.
   * @returns Host-owned Routine projection after create.
   */
  async createRoutine(caller: Agent, request: CreateRoutineRequest): Promise<CreateRoutineResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can create a routine', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const intent = requiredRoutineIntent(request.intent)
    const triggerKind = requiredRoutineTriggerKind(request.triggerKind)
    let scheduleExpr = ''
    let eventTrigger: RoutineRecord['eventTrigger']
    if (triggerKind === 'cron') {
      if (request.scheduleExpr === undefined) {
        throw new TeamError(
          'scheduleExpr is required when triggerKind is cron',
          'TEAM_INVALID_ARGUMENT',
        )
      }
      scheduleExpr = requiredScheduleExpr(request.scheduleExpr)
    } else {
      eventTrigger = requiredEventTrigger(request.eventTrigger)
    }
    const root = membership.root
    const routine = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const state = this.journal.state(root)
      const bot = state.members.find(member => member.id === request.botId)
      if (bot === undefined || bot.phase !== 'active') {
        throw new TeamError(
          `active teammate "${request.botId}" not found`,
          'TEAM_MEMBER_NOT_FOUND',
        )
      }
      const now = Date.now()
      const row: RoutineRecord = {
        routineId: RoutineId(`routine-${randomUUID()}`),
        botId: request.botId,
        intent,
        scheduleExpr,
        triggerKind,
        ...eventTrigger === undefined ? {} : { eventTrigger },
        status: 'active' as const,
        lastRunAt: null,
        createdAt: now,
        updatedAt: now,
      }
      await this.journal.appendAndFlush(root, 'team/routine', {
        version: 2,
        teamId: TeamId(root.id),
        routine: row,
      })
      return row
    })
    return { routine: projectRoutine(routine) }
  }

  /**
   * Project Host routines for one bot (P4 US2 T019 / FR-002; SC-006).
   * Returns {@link RoutineProjection} rows (intent/identity, schedule, status, lastRunAt)
   * from the Host journal catalog only — never Electron Main or `dsh-schedule`.
   * @param caller - exact live Team member.
   * @param request - bot id and cancellation.
   * @returns that bot’s Host Routine projections only.
   */
  listRoutinesByBot(caller: Agent, request: ListRoutinesByBotRequest): ListRoutinesByBotResult {
    const membership = this.roster.membership(caller)
    request.signal.throwIfAborted()
    return {
      routines: projectRoutines(this.journal.state(membership.root), request.botId),
    }
  }

  /**
   * Lead-authorized Host Memory write (P5 FR-001…003 / T006–T008 / US1 T014 / US2 T017 / US3 T020).
   * Persists a `MemoryRecord` on the Team journal (`team/memory`).
   * For `kind=profile` (FR-001), `kind=log` (FR-002), and `kind=note` (FR-003): validates
   * non-empty `content` after trim; rejects empty/whitespace with a clear
   * `TEAM_INVALID_ARGUMENT` reason and writes nothing. Persisted rows keep distinct `kind`
   * so profile, log, and note are distinguishable on list/view (SC-001…SC-003).
   * Enforces layer/`botId` rules (agent requires active bot; user requires null/absent botId).
   * Kinds are orthogonal to layers (FR-017). Bot-tool write is not required for Pass (FR-015).
   * After commit, refreshes live `agent-teams:memory-recall` binds for eligible bots (US4 T024 / FR-016).
   * Electron Main must not invent memory records — Host owns the durable write (research R1).
   * Not chat transcript (research R6).
   * @param caller - exact live Lead Agent.
   * @param request - kind, layer, optional botId, content, and cancellation.
   * @returns Host-owned Memory projection after write.
   */
  async writeMemory(caller: Agent, request: WriteMemoryRequest): Promise<WriteMemoryResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can write memory', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const kind = requiredMemoryKind(request.kind)
    const layer = requiredMemoryLayer(request.layer)
    const content = requiredMemoryContent(request.content)
    const root = membership.root
    const memory = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const state = this.journal.state(root)
      let botId: MemoryRecord['botId'] = null
      if (layer === 'agent') {
        if (request.botId === undefined || request.botId === null || String(request.botId).trim().length === 0) {
          throw new TeamError(
            'botId is required when layer is agent',
            'TEAM_INVALID_ARGUMENT',
          )
        }
        const bot = state.members.find(member => member.id === request.botId)
        if (bot === undefined || bot.phase !== 'active') {
          throw new TeamError(
            `active teammate "${request.botId}" not found`,
            'TEAM_MEMBER_NOT_FOUND',
          )
        }
        botId = request.botId
      } else if (request.botId !== undefined && request.botId !== null) {
        throw new TeamError(
          'botId must be absent or null when layer is user',
          'TEAM_INVALID_ARGUMENT',
        )
      }
      const now = Date.now()
      const row: MemoryRecord = {
        memoryId: MemoryId(`memory-${randomUUID()}`),
        kind,
        layer,
        botId,
        content,
        createdAt: now,
        updatedAt: now,
      }
      await this.journal.appendAndFlush(root, 'team/memory', {
        version: 2,
        teamId: TeamId(root.id),
        memory: row,
      })
      return row
    })
    this.refreshMemoryBindsAfterWrite(root, memory)
    return { memory: projectMemory(memory) }
  }

  /**
   * Project Host memories for browse / recall (P5 FR-004/005 / FR-006/007 / US4 T023 / US5 T027).
   * When `botId` is set: that bot’s agent-layer rows plus all account-wide user rows
   * (`memoryEligibleForBot` — bot B MUST NOT list A’s agent rows as B’s).
   * When omitted: full Host catalog. Host journal SoT only — never Electron Main or transcript.
   * Rows survive Host child restart via Lead Session `team/memory` replay; kinds stay distinguishable.
   * @param caller - exact live Team member.
   * @param request - optional bot id and cancellation.
   * @returns Host Memory projections for the requested scope.
   */
  listMemories(caller: Agent, request: ListMemoriesRequest): ListMemoriesResult {
    const membership = this.roster.membership(caller)
    request.signal.throwIfAborted()
    return {
      memories: projectMemories(this.journal.state(membership.root), request.botId),
    }
  }


  /**
   * List thin Host connector catalog definitions (P6 T009 / T012 / FR-017).
   * @param caller - exact live Team member.
   * @param signal - cancellation.
   * @returns installable catalog entries.
   */
  listConnectorCatalog(caller: Agent, signal: AbortSignal): ListConnectorCatalogResult {
    this.roster.membership(caller)
    signal.throwIfAborted()
    return { catalog: PASS_CONNECTOR_CATALOG }
  }

  /**
   * Project durable Host connectors (P6 T009 / T012).
   * @param caller - exact live Team member.
   * @param signal - cancellation.
   * @returns Connector projections without secret values.
   */
  listConnectors(caller: Agent, signal: AbortSignal): ListConnectorsResult {
    const membership = this.roster.membership(caller)
    signal.throwIfAborted()
    return {
      connectors: projectConnectors(this.journal.state(membership.root)),
    }
  }

  /**
   * Lead-authorized Host Connector install (P6 T009 / T012 / US1 T017).
   * Catalog availability is not install: thin-catalog entries stay listable until this
   * mutation writes a durable `ConnectorRecord`. Success settles `installState=installed`;
   * known uninstallable Verifier fixtures settle `installState=failed` with a clear `error`
   * (FR-001). Electron Main must not invent connector rows (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - catalog id and cancellation.
   * @returns Host-owned Connector projection after install settlement.
   */
  async installConnector(
    caller: Agent,
    request: InstallConnectorRequest,
  ): Promise<InstallConnectorResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can install a connector', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const catalogId = requiredConnectorCatalogId(request.catalogId)
    const entry = findConnectorCatalogEntry(PASS_CONNECTOR_CATALOG, catalogId)
    if (entry === undefined) {
      throw new TeamError(
        `connector catalog entry "${catalogId}" not found`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const root = membership.root
    const connector = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const state = this.journal.state(root)
      const duplicate = state.connectors.find(
        row => row.catalogId === entry.catalogId && row.installState !== 'failed',
      )
      if (duplicate !== undefined) {
        throw new TeamError(
          `connector catalog entry "${catalogId}" is already installed`,
          'TEAM_INVALID_ARGUMENT',
        )
      }
      const now = Date.now()
      const failedInstall = isBrokenInstallFixture(entry.catalogId)
      const row: ConnectorRecord = failedInstall
        ? {
          connectorId: ConnectorId(`connector-${randomUUID()}`),
          catalogId: entry.catalogId,
          serverName: entry.serverName,
          displayName: entry.displayName,
          installState: 'failed',
          authState: 'none',
          transport: entry.transport,
          error: PASS_BROKEN_INSTALL_ERROR,
          createdAt: now,
          updatedAt: now,
        }
        : {
          connectorId: ConnectorId(`connector-${randomUUID()}`),
          catalogId: entry.catalogId,
          serverName: entry.serverName,
          displayName: entry.displayName,
          installState: 'installed',
          authState: entry.authMode === 'none' ? 'none' : 'needs_auth',
          transport: entry.transport,
          createdAt: now,
          updatedAt: now,
        }
      await this.journal.appendAndFlush(root, 'team/connector', {
        version: 2,
        teamId: TeamId(root.id),
        connector: row,
      })
      return row
    })
    return { connector: projectConnector(connector) }
  }

  /**
   * Lead-authorized Host Connector authenticate (P6 T011 / T012 / US1 T018 / US4 T029).
   * Stores secret in Host credentials only; binds Pass MCP fixture tools when ready.
   * Chat-paste is not the primary auth path — secret enters via this Host credential
   * seam (FR-002/008). Journal / session-log / exportable dumps receive the
   * value-free `credentialKey` address only (FR-007).
   * @param caller - exact live Lead Agent.
   * @param request - connector id, secret, and cancellation.
   * @returns Host-owned Connector projection after auth ready (never embeds secret).
   */
  async authenticateConnector(
    caller: Agent,
    request: AuthenticateConnectorRequest,
  ): Promise<AuthenticateConnectorResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can authenticate a connector', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const connectorId = ConnectorId(String(request.connectorId).trim())
    if (connectorId.length === 0) {
      throw new TeamError('connectorId must be non-empty', 'TEAM_INVALID_ARGUMENT')
    }
    const secret = requiredConnectorSecret(request.secret)
    const root = membership.root
    const connector = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const current = this.journal.state(root).connectors.find(row => row.connectorId === connectorId)
      if (current === undefined) {
        throw new TeamError(
          `connector "${connectorId}" not found`,
          'TEAM_INVALID_ARGUMENT',
        )
      }
      if (current.installState !== 'installed') {
        throw new TeamError(
          `connector "${connectorId}" must be installed before auth`,
          'TEAM_INVALID_ARGUMENT',
        )
      }
      if (current.authState === 'ready') {
        throw new TeamError(
          `connector "${connectorId}" is already authenticated`,
          'TEAM_INVALID_ARGUMENT',
        )
      }
      // Credential seam owns the value; journal row below stores address only (US4 T029).
      const key = await storeConnectorSecret(this.ctx, connectorId, secret)
      const row: ConnectorRecord = {
        ...current,
        authState: 'ready',
        credentialKey: String(key),
        updatedAt: Date.now(),
      }
      await this.journal.appendAndFlush(root, 'team/connector', {
        version: 2,
        teamId: TeamId(root.id),
        connector: row,
      })
      return row
    })
    this.bindConnectorMcpTools(connector)
    return { connector: projectConnector(connector) }
  }

  /**
   * Invoke one MCP tool from an authenticated connector (P6 US1 T018 / US3 T026).
   * Requires `installState=installed` and `authState=ready` with tools bound on `ctx.tools`.
   * When `ctx.approval` is mounted, gates through `dsh-user-approval` before execute —
   * user-deny or standing `never` returns `outcome=denied` without treating the call as
   * success (FR-006). Returns a Host-observable {@link ConnectorToolCall}
   * (`outcome=success|denied|error`) — Verifier MUST NOT score LLM reply wording
   * (FR-003 / FR-016).
   * @param caller - exact live Team member.
   * @param request - connector id, optional tool name / arguments, and cancellation.
   * @returns observable tool-call outcome (success for Story 1; denied for Story 3).
   */
  async invokeConnectorTool(
    caller: Agent,
    request: InvokeConnectorToolRequest,
  ): Promise<InvokeConnectorToolResult> {
    this.roster.membership(caller)
    request.signal.throwIfAborted()
    const connectorId = ConnectorId(String(request.connectorId).trim())
    if (connectorId.length === 0) {
      throw new TeamError('connectorId must be non-empty', 'TEAM_INVALID_ARGUMENT')
    }
    const membership = this.roster.membership(caller)
    const current = this.journal.state(membership.root).connectors
      .find(row => row.connectorId === connectorId)
    if (current === undefined) {
      throw new TeamError(
        `connector "${connectorId}" not found`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    if (current.installState !== 'installed') {
      throw new TeamError(
        `connector "${connectorId}" must be installed before tool invoke`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    if (current.authState !== 'ready') {
      throw new TeamError(
        `connector "${connectorId}" must be authState=ready before tool invoke`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    this.bindConnectorMcpTools(current)
    const tools = this.ctx.get('tools')
    if (tools === undefined) {
      throw new TeamError(
        'Host tools registry is not mounted; connector tool invoke requires dsh-tools',
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const toolName = request.toolName === undefined || String(request.toolName).trim().length === 0
      ? publicToolName(current.serverName, PASS_FIXTURE_TOOL_RAW_NAME)
      : String(request.toolName).trim()
    if (tools.get(toolName) === undefined) {
      throw new TeamError(
        `connector tool "${toolName}" is not bound on Host`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const expectedPrefix = `mcp__${current.serverName}__`
    if (!toolName.startsWith(expectedPrefix)) {
      throw new TeamError(
        `toolName must be under connector serverName namespace "${expectedPrefix}"`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const callId = ToolCallId(`connector-tool-${randomUUID()}`)
    const gate = await gateConnectorToolApproval(this.ctx, {
      agent: caller,
      toolName,
      callId,
      signal: request.signal,
    })
    if (gate.kind === 'denied') {
      return {
        toolCall: {
          connectorId,
          toolName,
          outcome: 'denied',
          detail: gate.detail,
        },
      }
    }
    const result = await tools.execute({
      signal: request.signal,
      callId,
      name: toolName,
      agent: caller,
      arguments: request.arguments === undefined ? {} : { ...request.arguments },
    })
    const toolCall: ConnectorToolCall = result.isError
      ? {
        connectorId,
        toolName,
        outcome: 'error',
        detail: result.error.message,
      }
      : {
        connectorId,
        toolName,
        outcome: 'success',
        ...connectorToolCallDetail(result.content),
      }
    return { toolCall }
  }


  /**
   * Read effective Host approval policy for standing deny (P6 US3 T027).
   * When `ctx.approval` is absent, reports `ask` (pre-gate allow path).
   * @param caller - exact live Team member.
   * @param signal - cancellation.
   * @returns current trust policy (`ask` | `never`).
   */
  getTrustPolicy(caller: Agent, signal: AbortSignal): GetTrustPolicyResult {
    this.roster.membership(caller)
    signal.throwIfAborted()
    const approval = this.ctx.get('approval')
    if (approval === undefined) return { policy: 'ask' }
    const override = approval.overrideOf(caller.session)
    const policy: TrustPolicy = override ?? 'ask'
    return { policy }
  }

  /**
   * Enable or clear standing deny on the caller's session (P6 US3 T027 / FR-006 Path B).
   * Maps to `dsh-user-approval` policy `never` | `ask` via Host HTTP — never Electron Main.
   * @param caller - exact live Team member.
   * @param request - enabled flag and cancellation.
   * @returns resulting trust policy.
   */
  setStandingDeny(
    caller: Agent,
    request: SetStandingDenyInput & { readonly signal: AbortSignal },
  ): SetStandingDenyResult {
    this.roster.membership(caller)
    request.signal.throwIfAborted()
    const approval = this.ctx.get('approval')
    if (approval === undefined) {
      throw new TeamError(
        'Host approval service is not mounted; standing deny requires dsh-user-approval',
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const policy: TrustPolicy = request.enabled ? 'never' : 'ask'
    approval.setPolicy(caller, policy)
    return { policy }
  }

  /**
   * Describe one connector credential without returning the secret (P6 T011 / FR-007).
   * @param caller - exact live Team member.
   * @param request - connector id and cancellation.
   * @returns configured/writable facts only.
   */
  async describeConnectorCredential(
    caller: Agent,
    request: DescribeConnectorCredentialRequest,
  ): Promise<DescribeConnectorCredentialResult> {
    this.roster.membership(caller)
    request.signal.throwIfAborted()
    const connectorId = ConnectorId(String(request.connectorId).trim())
    if (connectorId.length === 0) {
      throw new TeamError('connectorId must be non-empty', 'TEAM_INVALID_ARGUMENT')
    }
    const membership = this.roster.membership(caller)
    const current = this.journal.state(membership.root).connectors
      .find(row => row.connectorId === connectorId)
    if (current === undefined) {
      throw new TeamError(
        `connector "${connectorId}" not found`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const info = await describeConnectorCredentialRecord(this.ctx, connectorId)
    return {
      connectorId,
      credentialKey: String(info.credentialKey),
      configured: info.configured,
      writable: info.writable,
      ...info.kind === undefined ? {} : { kind: info.kind },
    }
  }

  /**
   * Bind or re-bind Pass MCP fixture tools for a ready connector (P6 T010 / US1 T018).
   * @param connector - durable row at auth ready.
   */
  private bindConnectorMcpTools(connector: ConnectorRecord): void {
    const prior = this.mcpBindDisposers.get(connector.connectorId)
    prior?.()
    this.mcpBindDisposers.delete(connector.connectorId)
    if (connector.authState !== 'ready' || connector.installState !== 'installed') return
    const dispose = bindPassConnectorMcpTools(this.ctx, connector)
    this.mcpBindDisposers.set(connector.connectorId, dispose)
  }

  /**
   * Lead-authorized Host Routine pause (P4 US3 T022 / FR-003).
   * Persists `status: paused` on the catalog row; Host cron wake MUST NOT fire while paused.
   * Idempotent when already paused. Electron Main must not invent pause flags (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - routine id and cancellation.
   * @returns Host-owned Routine projection after pause.
   */
  async pauseRoutine(caller: Agent, request: PauseRoutineRequest): Promise<PauseRoutineResult> {
    return this.setRoutineStatus(caller, request.routineId, 'paused', request.signal)
  }

  /**
   * Lead-authorized Host Routine resume (P4 US3 T022 / FR-004).
   * Persists `status: active` so the row is eligible for Host cron wake again.
   * Idempotent when already active. Electron Main must not invent resume flags (research R1).
   * @param caller - exact live Lead Agent.
   * @param request - routine id and cancellation.
   * @returns Host-owned Routine projection after resume.
   */
  async resumeRoutine(caller: Agent, request: ResumeRoutineRequest): Promise<ResumeRoutineResult> {
    return this.setRoutineStatus(caller, request.routineId, 'active', request.signal)
  }

  /**
   * Persist one Host Routine lifecycle status on the Lead journal catalog.
   * @param caller - exact live Lead Agent.
   * @param routineId - catalog row id.
   * @param status - next durable status (`paused` suppresses wake; `active` restores eligibility).
   * @param signal - cancellation.
   * @returns projected row after the durable write.
   */
  private async setRoutineStatus(
    caller: Agent,
    routineId: RoutineId,
    status: RoutineStatus,
    signal: AbortSignal,
  ): Promise<PauseRoutineResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError(
        `only the Team Lead can ${status === 'paused' ? 'pause' : 'resume'} a routine`,
        'TEAM_LEAD_REQUIRED',
      )
    }
    signal.throwIfAborted()
    const id = RoutineId(String(routineId).trim())
    if (id.length === 0) {
      throw new TeamError('routineId must be non-empty', 'TEAM_INVALID_ARGUMENT')
    }
    const root = membership.root
    const routine = await this.journal.transact(root.id, async () => {
      signal.throwIfAborted()
      const current = this.journal.state(root).routines.find(row => row.routineId === id)
      if (current === undefined) {
        throw new TeamError(
          `routine "${id}" not found`,
          'TEAM_ROUTINE_NOT_FOUND',
        )
      }
      const row: RoutineRecord = {
        ...current,
        status,
        updatedAt: Date.now(),
      }
      await this.journal.appendAndFlush(root, 'team/routine', {
        version: 2,
        teamId: TeamId(root.id),
        routine: row,
      })
      return row
    })
    return { routine: projectRoutine(routine) }
  }

  /**
   * Host cron evaluator (P4 US4 T025 / FR-005): wake due **active** routines and commit `lastRunAt`.
   * Paused catalog rows never fire (FR-003). Uses Agent inbox wake via subagent queue (followup),
   * not `dsh-schedule` reminder dispatch and not Electron Main timers (research R3).
   * Safe to call from the Host ticker or tests with an explicit wall-clock sample.
   * @param nowMs - wall-clock sample; defaults to `Date.now()`.
   * @returns projections for routines whose fire committed (lastRunAt updated).
   */
  async evaluateDueRoutines(nowMs: number = Date.now()): Promise<readonly RoutineProjection[]> {
    if (this.lifecycle.disposed) return []
    if (!Number.isFinite(nowMs)) {
      throw new TeamError('evaluateDueRoutines nowMs must be a finite number', 'TEAM_INVALID_ARGUMENT')
    }
    const committed: RoutineProjection[] = []
    for (const agent of this.ctx.agents.list()) {
      /* v8 ignore next -- disposal races the Host ticker mid-scan. */
      if (this.lifecycle.disposed) break
      const membership = this.roster.tryMembership(agent)
      if (membership === undefined || membership.role !== 'lead') continue
      const root = membership.root
      let due: readonly RoutineRecord[]
      try {
        due = routinesDueForWake(this.journal.state(root).routines, nowMs)
      } catch (error: unknown) {
        /* v8 ignore next 4 -- journal rows are create-validated; corrupt expr is defensive only. */
        this.ctx.logger.warn(
          `Agent Teams routine due-scan for lead "${root.id}" failed: ${errorMessage(error)}`,
        )
        continue
      }
      for (const routine of due) {
        /* v8 ignore next -- disposal races the Host ticker mid-fire loop. */
        if (this.lifecycle.disposed) break
        if (this.inFlightFires.has(routine.routineId)) continue
        const fired = await this.commitRoutineFire(root, routine, nowMs, 'cron')
        if (fired !== undefined) committed.push(fired)
      }
    }
    return committed
  }

  /**
   * Host webhook-harness delivery (P6 US2 T023 / FR-005 / FR-018; Architect Path A B1).
   * Matches active `triggerKind=event` + `eventTrigger=webhook_harness` catalog rows, wakes
   * each existing bot with that row's intent (same followup / subagent shape as cron fire),
   * and commits `lastRunAt`. Paused rows never fire. Cron rows never match (SC-008).
   * Manual “Run now” alone is insufficient for Pass — this harness path (or
   * `webhookRuntime.dispatch` kind `webhook_harness`) is required.
   * Default webhookRuntime new-Session creation is **not** the Pass fire path.
   * @param request - delivery id, optional targeting, and cancellation.
   * @returns projections for routines whose fire committed.
   */
  async deliverWebhookHarness(
    request: WebhookHarnessDeliveryRequest,
  ): Promise<WebhookHarnessDeliveryResult> {
    request.signal.throwIfAborted()
    const deliveryId = request.deliveryId.trim()
    if (deliveryId.length === 0) {
      throw new TeamError('deliveryId must be non-empty', 'TEAM_INVALID_ARGUMENT')
    }
    const receivedAt = request.receivedAt ?? Date.now()
    if (!Number.isFinite(receivedAt) || !Number.isSafeInteger(receivedAt) || receivedAt < 0) {
      throw new TeamError(
        'receivedAt must be a non-negative safe integer',
        'TEAM_INVALID_ARGUMENT',
      )
    }
    if (this.lifecycle.disposed) {
      return { fired: [], deliveryId, receivedAt }
    }
    const fired: RoutineProjection[] = []
    for (const agent of this.ctx.agents.list()) {
      if (this.lifecycle.disposed) break
      const membership = this.roster.tryMembership(agent)
      if (membership === undefined || membership.role !== 'lead') continue
      const root = membership.root
      const matched = routinesMatchingWebhookHarness(this.journal.state(root).routines, {
        ...request.routineId === undefined ? {} : { routineId: request.routineId },
        ...request.botId === undefined ? {} : { botId: request.botId },
      })
      for (const routine of matched) {
        if (this.lifecycle.disposed) break
        request.signal.throwIfAborted()
        if (this.inFlightFires.has(routine.routineId)) continue
        const committed = await this.commitRoutineFire(root, routine, receivedAt, 'webhook_harness')
        if (committed !== undefined) fired.push(committed)
      }
    }
    return { fired, deliveryId, receivedAt }
  }

  /**
   * Wake one routine's bot with intent, then persist `lastRunAt` after enqueue succeeds.
   * @param root - exact live Team Lead owning the catalog.
   * @param routine - catalog row (re-checked under journal lock before write).
   * @param firedAt - fire commit timestamp written to `lastRunAt`.
   * @param source - `cron` requires due-ness; `webhook_harness` requires event match (B1).
   * @returns projection after fire commit, or undefined when wake/commit skipped.
   */
  private async commitRoutineFire(
    root: Agent,
    routine: RoutineRecord,
    firedAt: number,
    source: 'cron' | 'webhook_harness',
  ): Promise<RoutineProjection | undefined> {
    /* v8 ignore next -- concurrent ticker ticks share one in-flight slot per routineId. */
    if (this.inFlightFires.has(routine.routineId)) return undefined
    const signal = this.lifecycle.signal
    let releaseInFlight!: () => void
    const tracked = new Promise<void>((resolve) => { releaseInFlight = resolve })
    this.inFlightFires.set(routine.routineId, tracked)
    try {
      /* v8 ignore next -- disposal races an admitted fire. */
      if (this.lifecycle.disposed) return undefined
      // Re-check eligibility under current catalog (pause may have landed since match/due-scan).
      const latest = this.journal.state(root).routines.find(row => row.routineId === routine.routineId)
      /* v8 ignore next -- pause/delete races the due-scan. */
      if (latest === undefined || !isRoutineEligibleForWake(latest)) return undefined
      if (source === 'cron') {
        /* v8 ignore next -- lastRunAt commit from a peer tick advances the anchor. */
        if (!isRoutineDue(latest, firedAt)) return undefined
      } else if (!isRoutineWebhookHarnessMatch(latest)) {
        return undefined
      }
      const bot = this.journal.state(root).members.find(member => member.id === latest.botId)
      if (bot === undefined || bot.phase !== 'active') {
        this.ctx.logger.warn(
          `Agent Teams routine "${latest.routineId}" skipped: active bot "${latest.botId}" not found`,
        )
        return undefined
      }
      try {
        const live = this.ctx.agents.get(latest.botId)
        const content = [{ type: 'text' as const, text: latest.intent }]
        const messageSource = { kind: 'user' as const }
        if (live !== undefined) {
          live.followup(createUserMessage({ content, source: messageSource }))
        } else {
          await queueHostSubagentPrompt(
            this.ctx.subagents,
            root,
            latest.botId,
            content,
            messageSource,
            signal,
          )
        }
      } catch (error: unknown) {
        /* v8 ignore next -- disposal aborts wake enqueue. */
        if (this.lifecycle.disposed) return undefined
        this.ctx.logger.warn(
          `Agent Teams routine "${latest.routineId}" wake failed: ${errorMessage(error)}`,
        )
        return undefined
      }
      // Fire commit: durable lastRunAt only after wake enqueue succeeds (FR-005).
      const updated = await this.journal.transact(root.id, async () => {
        signal.throwIfAborted()
        const current = this.journal.state(root).routines.find(row => row.routineId === latest.routineId)
        /* v8 ignore next -- pause races the fire commit write. */
        if (current === undefined || !isRoutineEligibleForWake(current)) return undefined
        if (source === 'webhook_harness' && !isRoutineWebhookHarnessMatch(current)) return undefined
        const row: RoutineRecord = {
          ...current,
          lastRunAt: firedAt,
          updatedAt: firedAt,
        }
        await this.journal.appendAndFlush(root, 'team/routine', {
          version: 2,
          teamId: TeamId(root.id),
          routine: row,
        })
        return row
      })
      /* v8 ignore next -- pause race returns undefined from the journal transaction. */
      return updated === undefined ? undefined : projectRoutine(updated)
    } finally {
      releaseInFlight()
      /* v8 ignore next -- overlapping ticks may replace the tracked promise. */
      if (this.inFlightFires.get(routine.routineId) === tracked) {
        this.inFlightFires.delete(routine.routineId)
      }
    }
  }

  /**
   * Lead-authorized Host skill attach (FR-003 / FR-005 / T020).
   * Appends `{ botId, skillId }` onto that Bot’s ordered `skillAttachments` (multi-attach allowed).
   * Requires the skill to exist in Host `ctx.skills`; does not auto-attach other bots.
   * After commit, refreshes that Bot’s skill-instruction bind for subsequent turns (FR-014 / T021).
   * Electron Main must not invent attachment records (research R4).
   * @param caller - exact live Lead Agent.
   * @param request - bot id, skill id, and cancellation.
   * @returns updated Host Bot identity after attach.
   */
  async attachSkill(caller: Agent, request: AttachSkillRequest): Promise<AttachSkillResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can attach a skill to a teammate', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const skillId = requiredSkillId(String(request.skillId))
    const skills = this.ctx.get('skills')
    if (skills === undefined) {
      throw new TeamError(
        'skill catalog is unavailable: Host skills registry is not mounted',
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const definition = await skills.get(skillId, { signal: request.signal }) as
      | { readonly content?: string }
      | undefined
    if (definition === undefined) {
      throw new TeamError(
        `skill "${skillId}" is not available in the Host catalog`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const root = membership.root
    const updated = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const current = this.journal.state(root).members.find(member => member.id === request.botId)
      if (current === undefined || current.phase !== 'active') {
        throw new TeamError(
          `active teammate "${request.botId}" not found`,
          'TEAM_MEMBER_NOT_FOUND',
        )
      }
      const prior = current.skillAttachments ?? []
      const attachment: SkillAttachment = {
        botId: current.id,
        skillId,
        attachedAt: Date.now(),
      }
      const skillAttachments = [...prior, attachment]
      const member = { ...current, skillAttachments }
      await this.journal.appendAndFlush(root, 'team/member', {
        version: 2,
        teamId: TeamId(root.id),
        member,
      })
      return member
    })
    await this.refreshTeammateSkillBind(updated.id, updated.skillAttachments, request.signal)
    const view = this.roster.list(membership).find(row => row.id === updated.id)
    /* v8 ignore next 3 -- journal commit above retains the active roster row. */
    if (view === undefined) {
      throw new TeamError(`active teammate "${updated.id}" not found`, 'TEAM_MEMBER_NOT_FOUND')
    }
    return {
      id: updated.id,
      skillAttachments: updated.skillAttachments ?? [],
      member: view,
    }
  }

  /**
   * Lead-authorized Host user-skill create/update (FR-006 / FR-013 / T027).
   * Rejects empty `displayName` or `instructionalBody` without writing (T028).
   * Persists a directory-bundle `SKILL.md` under Config `userSkillsRoot`, then
   * registers a runtime catalog entry when `ctx.skills` is mounted so discovery
   * sees the skill before the filesystem watcher refreshes.
   * Electron Main must not invent skill records (research R3).
   * @param caller - exact live Lead Agent.
   * @param request - display name, instructional body, optional skill id, and cancellation.
   * @returns Host-owned skill catalog summary after durable write (+ optional runtime register).
   */
  async upsertUserSkill(caller: Agent, request: UpsertUserSkillRequest): Promise<UpsertUserSkillResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can author a user skill', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const displayName = requiredSkillDisplayName(request.displayName)
    const instructionalBody = requiredSkillInstructionalBody(request.instructionalBody)
    const userSkillsRoot = this.config.userSkillsRoot
    if (userSkillsRoot === undefined) {
      throw new TeamError(
        'user skills root is not configured: set agent-team Config.userSkillsRoot to the Host-durable authoring directory',
        'TEAM_INVALID_CONFIG',
      )
    }
    const skillId = request.skillId === undefined || String(request.skillId).trim().length === 0
      ? skillIdFromDisplayName(displayName)
      : requiredSkillId(String(request.skillId))
    const description = request.description?.trim() || displayName
    const skill: SkillCatalogSummary = {
      id: skillId,
      displayName,
      source: 'user',
      description,
    }
    request.signal.throwIfAborted()
    try {
      await writeSkillBundle(userSkillsRoot, {
        name: skillId,
        description,
        body: instructionalBody,
      })
    } catch (error) {
      throw new TeamError(
        `failed to persist user skill "${skillId}": ${errorMessage(error)}`,
        'TEAM_INVALID_ARGUMENT',
        { cause: error },
      )
    }
    const skills = this.ctx.get('skills')
    if (skills !== undefined) {
      this.userSkillRegistrations.get(skillId)?.()
      const dispose = skills.register({
        name: skillId,
        description,
        content: instructionalBody,
        source: 'user-dsh',
      })
      this.userSkillRegistrations.set(skillId, dispose)
    }
    return { skill }
  }

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
  async deleteBot(caller: Agent, request: DeleteBotRequest): Promise<DeleteBotResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can delete a teammate', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const root = membership.root
    const deletedId = await this.journal.transact(root.id, async () => {
      request.signal.throwIfAborted()
      const current = this.journal.state(root).members.find(member => member.id === request.botId)
      if (current === undefined || current.phase !== 'active') {
        throw new TeamError(
          `active teammate "${request.botId}" not found`,
          'TEAM_MEMBER_NOT_FOUND',
        )
      }
      const member: typeof current = {
        ...current,
        phase: 'deleted',
        sectionId: null,
      }
      await this.journal.appendAndFlush(root, 'team/member', {
        version: 2,
        teamId: TeamId(root.id),
        member,
      })
      return current.id
    })
    return { id: deletedId }
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
   * Read the current roster, non-deleted task board, sidebar sections + Unassigned,
   * Host mailbox handoffs, skill catalog summaries, Host Routine catalog, and Host
   * Memory catalog through the generated Remote API (FR-005 / FR-006 / P3 T011 / P4 T009 / P5 T008).
   * Handoffs reconstruct from Lead Session + target Session logs — never Main-synthesized IPC.
   * Skills project from Host `ctx.skills` when present — never Electron-synthesized.
   * Routines project from Host journal `team/routine` — never `dsh-schedule` or Electron Main.
   * Memories project from Host journal `team/memory` — never Electron Main, Client-only, or transcript.
   * @param agent - exact live Team member used as the authority credential.
   * @param signal - cancellation for cold target Session reads.
   * @returns detached current roster, task, section, handoff, skill, routine, and memory views.
   */
  @Remote('view')
  async remoteView(agent: Agent, signal: AbortSignal): Promise<TeamView> {
    const membership = this.roster.membership(agent)
    const state = this.journal.state(membership.root)
    const { sections, unassignedBotIds } = projectSidebarSections(state)
    return {
      members: this.listMembers(agent),
      tasks: this.listTasks(agent),
      sections,
      unassignedBotIds,
      handoffs: await this.listHandoffs(membership.root, signal),
      skills: await this.listSkillCatalog(signal),
      routines: projectRoutines(state),
      memories: projectMemories(state),
      connectors: projectConnectors(state),
    }
  }

  /**
   * List Host skill catalog summaries for Desktop Web discovery (US1 / FR-001 / T015).
   * Requires the Host skills registry (Desktop Host thin-pack mount). Fails loud when absent —
   * no silent empty success (discover-load; Client T018 owns user-visible copy).
   * @param caller - exact live Team member used as the authority credential.
   * @param signal - cancellation for provider list.
   * @returns managed thin pack + user-authored skills when present.
   */
  async listSkills(caller: Agent, signal: AbortSignal): Promise<readonly SkillCatalogSummary[]> {
    this.roster.membership(caller)
    const skills = this.ctx.get('skills')
    if (skills === undefined) {
      throw new TeamError(
        'skill catalog is unavailable: Host skills registry is not mounted',
        'TEAM_INVALID_ARGUMENT',
      )
    }
    signal.throwIfAborted()
    const summaries = await skills.list({ signal }) as ReadonlyArray<{
      readonly name: string
      readonly description: string
      readonly source: string
    }>
    return projectSkillCatalog(summaries)
  }

  /**
   * List Host skill catalog through the generated Remote API (US1 / T015).
   * @param agent - exact live Team member authorizing the read.
   * @param signal - Remote call cancellation.
   * @returns catalog summaries or a typed Team rejection when the registry is absent.
   */
  @Remote('listSkills')
  remoteListSkills(
    agent: Agent,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<{ readonly skills: readonly SkillCatalogSummary[] }>> {
    return this.botIdentityMutationResult(
      this.listSkills(agent, signal).then(skills => ({ skills })),
    )
  }

  /**
   * Project Host skill catalog summaries for Client discovery (T011 / T015).
   * Soft path for {@link remoteView}: empty when the skills service is absent
   * (non-Desktop compositions). Prefer {@link listSkills} for discovery that must fail loud.
   * @param signal - cancellation for provider list.
   * @returns catalog rows, or `[]` when the skills service is absent.
   */
  private async listSkillCatalog(signal: AbortSignal): Promise<readonly SkillCatalogSummary[]> {
    const skills = this.ctx.get('skills')
    if (skills === undefined) return []
    const summaries = await skills.list({ signal }) as ReadonlyArray<{
      readonly name: string
      readonly description: string
      readonly source: string
    }>
    return projectSkillCatalog(summaries)
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
   * Create one named sidebar section through the generated Remote API (FR-006).
   * @param agent - exact live Lead Agent authorizing create.
   * @param request - non-empty section name.
   * @param signal - Remote call cancellation.
   * @returns the created section or a typed Team rejection.
   */
  @Remote('createSection')
  remoteCreateSection(
    agent: Agent,
    request: CreateSectionInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<CreateSectionResult>> {
    return this.botIdentityMutationResult(this.createSection(agent, { ...request, signal }))
  }

  /**
   * Create one Host Routine through the generated Remote API (P4 US1 T015–T016 / T009).
   * Empty intent or unsupported scheduleExpr return `{ ok: false, error.message }` for Client display.
   * @param agent - exact live Lead Agent authorizing create.
   * @param request - bot id, intent, and scheduleExpr (no confirm / displayName fields).
   * @param signal - Remote call cancellation.
   * @returns the Routine projection or a typed Team rejection with a clear reason.
   */
  @Remote('createRoutine')
  remoteCreateRoutine(
    agent: Agent,
    request: CreateRoutineInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<CreateRoutineResult>> {
    return this.botIdentityMutationResult(this.createRoutine(agent, { ...request, signal }))
  }

  /**
   * List Host Routines for one bot through the generated Remote API (P4 US2 T019 / FR-002).
   * Projects intent/identity, scheduleExpr/scheduleLabel, status, and lastRunAt over authenticated HTTP/WS.
   * @param agent - exact live Team member authorizing the read.
   * @param request - bot id filter.
   * @param signal - Remote call cancellation.
   * @returns that bot’s Routine projections or a typed Team rejection.
   */
  @Remote('listRoutinesByBot')
  remoteListRoutinesByBot(
    agent: Agent,
    request: ListRoutinesByBotInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<ListRoutinesByBotResult>> {
    return this.botIdentityMutationResult(
      Promise.resolve(this.listRoutinesByBot(agent, { ...request, signal })),
    )
  }

  /**
   * Pause one Host Routine through the generated Remote API (P4 US3 T022 / FR-003).
   * Persists `status: paused`; Host cron wake MUST NOT fire while paused.
   * @param agent - exact live Lead Agent authorizing pause.
   * @param request - routine id.
   * @param signal - Remote call cancellation.
   * @returns the Routine projection or a typed Team rejection.
   */
  @Remote('pauseRoutine')
  remotePauseRoutine(
    agent: Agent,
    request: PauseRoutineInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<PauseRoutineResult>> {
    return this.botIdentityMutationResult(this.pauseRoutine(agent, { ...request, signal }))
  }

  /**
   * Resume one Host Routine through the generated Remote API (P4 US3 T022 / FR-004).
   * Persists `status: active` so the row is eligible for Host cron wake again.
   * @param agent - exact live Lead Agent authorizing resume.
   * @param request - routine id.
   * @param signal - Remote call cancellation.
   * @returns the Routine projection or a typed Team rejection.
   */
  @Remote('resumeRoutine')
  remoteResumeRoutine(
    agent: Agent,
    request: ResumeRoutineInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<ResumeRoutineResult>> {
    return this.botIdentityMutationResult(this.resumeRoutine(agent, { ...request, signal }))
  }

  /**
   * Deliver one Host webhook-harness event through the generated Remote API (P6 US2 T023 / FR-005).
   * Matches active event routines and wakes existing bots — not new-Session Pass; not Electron Main.
   * @param agent - exact live Lead Agent (authority for Team catalog scan).
   * @param request - delivery id and optional routine/bot targeting.
   * @param signal - Remote call cancellation.
   * @returns fired Routine projections or a typed Team rejection.
   */
  @Remote('deliverWebhookHarness')
  remoteDeliverWebhookHarness(
    agent: Agent,
    request: WebhookHarnessDeliveryInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<WebhookHarnessDeliveryResult>> {
    return this.botIdentityMutationResult((async () => {
      const membership = this.roster.membership(agent)
      if (membership.role !== 'lead') {
        throw new TeamError(
          'only the Team Lead can deliver a webhook harness event',
          'TEAM_LEAD_REQUIRED',
        )
      }
      return await this.deliverWebhookHarness({ ...request, signal })
    })())
  }

  /**
   * Write one Host Memory through the generated Remote API
   * (P5 T006–T008 / US1 T014 / US2 T017 / US3 T020 / FR-001…003).
   * Authenticated Desktop Host HTTP/WS data plane — Client MUST NOT persist SoT.
   * Empty profile, log, or note content rejects as `team-rejected` with a clear reason.
   * @param agent - exact live Lead Agent.
   * @param request - kind, layer, optional botId, content.
   * @param signal - cancellation.
   * @returns the Memory projection or a typed Team rejection with a clear reason.
   */
  @Remote('writeMemory')
  remoteWriteMemory(
    agent: Agent,
    request: WriteMemoryInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<WriteMemoryResult>> {
    return this.botIdentityMutationResult(this.writeMemory(agent, { ...request, signal }))
  }

  /**
   * List/browse Host Memories through the generated Remote API (P5 T007–T008 / FR-007).
   * When `botId` is set: that bot’s agent rows plus account-wide user rows.
   * @param agent - exact live Team member.
   * @param request - optional bot id filter.
   * @param signal - cancellation.
   * @returns Memory projections or a typed Team rejection.
   */
  @Remote('listMemories')
  remoteListMemories(
    agent: Agent,
    request: ListMemoriesInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<ListMemoriesResult>> {
    return this.botIdentityMutationResult(
      Promise.resolve(this.listMemories(agent, { ...request, signal })),
    )
  }

  /** List thin Host connector catalog through Host HTTP/WS (P6 T009 / T012). */
  @Remote('listConnectorCatalog')
  remoteListConnectorCatalog(
    agent: Agent,
    _request: Record<string, never>,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<ListConnectorCatalogResult>> {
    return this.botIdentityMutationResult(
      Promise.resolve(this.listConnectorCatalog(agent, signal)),
    )
  }

  /** List durable Host connectors through Host HTTP/WS (P6 T009 / T012). */
  @Remote('listConnectors')
  remoteListConnectors(
    agent: Agent,
    _request: Record<string, never>,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<ListConnectorsResult>> {
    return this.botIdentityMutationResult(
      Promise.resolve(this.listConnectors(agent, signal)),
    )
  }

  /** Install one Host Connector through Host HTTP/WS (P6 T009 / T012). */
  @Remote('installConnector')
  remoteInstallConnector(
    agent: Agent,
    request: InstallConnectorInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<InstallConnectorResult>> {
    return this.botIdentityMutationResult(this.installConnector(agent, { ...request, signal }))
  }

  /** Authenticate one Host Connector; secret stays in credentials (P6 T011 / T012 / US1 T018). */
  @Remote('authenticateConnector')
  remoteAuthenticateConnector(
    agent: Agent,
    request: AuthenticateConnectorInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<AuthenticateConnectorResult>> {
    return this.botIdentityMutationResult(
      this.authenticateConnector(agent, { ...request, signal }),
    )
  }

  /** Invoke one authenticated connector MCP tool; returns outcome without LLM wording (US1 T018). */
  @Remote('invokeConnectorTool')
  remoteInvokeConnectorTool(
    agent: Agent,
    request: InvokeConnectorToolInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<InvokeConnectorToolResult>> {
    return this.botIdentityMutationResult(
      this.invokeConnectorTool(agent, { ...request, signal }),
    )
  }


  /** Read Host trust policy for standing deny (P6 US3 T027). */
  @Remote('getTrustPolicy')
  remoteGetTrustPolicy(
    agent: Agent,
    _request: Record<string, never>,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<GetTrustPolicyResult>> {
    return this.botIdentityMutationResult(
      Promise.resolve(this.getTrustPolicy(agent, signal)),
    )
  }

  /** Set standing deny (never) or restore ask (P6 US3 T027 / FR-006 Path B). */
  @Remote('setStandingDeny')
  remoteSetStandingDeny(
    agent: Agent,
    request: SetStandingDenyInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<SetStandingDenyResult>> {
    return this.botIdentityMutationResult(
      Promise.resolve(this.setStandingDeny(agent, { ...request, signal })),
    )
  }

  /** Describe connector credential without secret values (P6 T011 / FR-007). */
  @Remote('describeConnectorCredential')
  remoteDescribeConnectorCredential(
    agent: Agent,
    request: DescribeConnectorCredentialInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<DescribeConnectorCredentialResult>> {
    return this.botIdentityMutationResult(
      this.describeConnectorCredential(agent, { ...request, signal }),
    )
  }

  /**
   * Rename one named sidebar section through the generated Remote API (FR-006).
   * @param agent - exact live Lead Agent authorizing rename.
   * @param request - section id and non-empty replacement name.
   * @param signal - Remote call cancellation.
   * @returns the renamed section or a typed Team rejection.
   */
  @Remote('renameSection')
  remoteRenameSection(
    agent: Agent,
    request: RenameSectionInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<RenameSectionResult>> {
    return this.botIdentityMutationResult(this.renameSection(agent, { ...request, signal }))
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
   * Attach one catalog skill to a product Bot through the generated Remote API (FR-003).
   * @param agent - exact live Lead Agent authorizing attach.
   * @param request - bot id and skill id.
   * @param signal - Remote call cancellation.
   * @returns the updated Bot or a typed Team rejection.
   */
  @Remote('attachSkill')
  remoteAttachSkill(
    agent: Agent,
    request: AttachSkillInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<AttachSkillResult>> {
    return this.botIdentityMutationResult(this.attachSkill(agent, { ...request, signal }))
  }

  /**
   * Create or update one user-authored skill through the generated Remote API (FR-006 / FR-013).
   * Empty displayName or instructionalBody reject without writing.
   * @param agent - exact live Lead Agent authorizing authoring.
   * @param request - display name, instructional body, optional skill id.
   * @param signal - Remote call cancellation.
   * @returns the skill summary or a typed Team rejection.
   */
  @Remote('upsertUserSkill')
  remoteUpsertUserSkill(
    agent: Agent,
    request: UpsertUserSkillInput,
    signal: AbortSignal,
  ): Promise<BotIdentityMutationResult<UpsertUserSkillResult>> {
    return this.botIdentityMutationResult(this.upsertUserSkill(agent, { ...request, signal }))
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

  /**
   * Bind one teammate Agent's durable Host persona into system-prompt assembly (FR-013).
   * Lead Agents and non-Team children are left unbound. Empty persona contributes no prose.
   * @param agent - newly created or resumed exact live Agent.
   */
  private bindTeammatePersona(agent: Agent): void {
    const membership = this.roster.tryMembership(agent)
    if (membership === undefined || membership.role !== 'teammate') return
    const member = this.journal.state(membership.root).members.find(row => row.id === agent.id)
    const ref: PersonaBindRef = { current: member?.persona }
    this.personaBinds.set(agent.id, ref)
    bindTeammatePersona(agent, ref, () => {
      this.personaBinds.delete(agent.id)
    })
  }

  /**
   * Push a saved persona onto the live Agent bind when the Bot is currently activated.
   * Cold resume rebinds from the durable snapshot via {@link bindTeammatePersona}.
   * @param botId - teammate Session identity.
   * @param persona - newly committed Host persona profile.
   */
  private refreshTeammatePersonaBind(botId: SessionId, persona: BotPersonaProfile): void {
    const existing = this.personaBinds.get(botId)
    if (existing === undefined) return
    existing.current = persona
  }

  /**
   * Bind one teammate Agent's durable Host skill attachments into system-prompt assembly (FR-014).
   * Lead Agents and non-Team children are left unbound. Empty / missing bodies contribute no prose.
   * Cold resume resolves catalog bodies asynchronously onto the mutable ref before subsequent turns.
   * @param agent - newly created or resumed exact live Agent.
   */
  private bindTeammateSkillInstructions(agent: Agent): void {
    const membership = this.roster.tryMembership(agent)
    if (membership === undefined || membership.role !== 'teammate') return
    const member = this.journal.state(membership.root).members.find(row => row.id === agent.id)
    const ref: SkillBindRef = { current: '' }
    this.skillBinds.set(agent.id, ref)
    bindTeammateSkillInstructions(agent, ref, () => {
      this.skillBinds.delete(agent.id)
    })
    void this.refreshTeammateSkillBind(agent.id, member?.skillAttachments).catch((error: unknown) => {
      this.ctx.logger.warn(
        `agentTeams: failed to resolve skill-instruction bind for "${agent.id}": ${errorMessage(error)}`,
      )
    })
  }

  /**
   * Recompose attached skill bodies onto the live Agent bind when the Bot is activated.
   * Cold resume starts from an empty ref and fills via this path; Host `attachSkill` refreshes live.
   * @param botId - teammate Session identity.
   * @param attachments - durable ordered attachments for that Bot, or undefined when none.
   * @param signal - optional cancellation for catalog loads.
   */
  private async refreshTeammateSkillBind(
    botId: SessionId,
    attachments: readonly SkillAttachment[] | undefined,
    signal?: AbortSignal,
  ): Promise<void> {
    const existing = this.skillBinds.get(botId)
    if (existing === undefined) return
    existing.current = await this.composeAttachedSkillBodies(attachments, signal)
  }

  /**
   * Load Host catalog bodies for one Bot's attachments in stable order and join non-empty text.
   * Missing skills or empty bodies skip that attachment's prose (instruction-bind compose rule).
   * @param attachments - durable ordered attachments, or undefined when none.
   * @param signal - optional cancellation for provider get.
   * @returns composed instructional text, or `''` when nothing contributes.
   */
  private async composeAttachedSkillBodies(
    attachments: readonly SkillAttachment[] | undefined,
    signal?: AbortSignal,
  ): Promise<string> {
    if (attachments === undefined || attachments.length === 0) return ''
    const skills = this.ctx.get('skills')
    if (skills === undefined) return ''
    const bodies: (string | undefined)[] = []
    for (const attachment of attachments) {
      signal?.throwIfAborted()
      const definition = await skills.get(String(attachment.skillId), { signal }) as
        | { readonly content?: string }
        | undefined
      bodies.push(definition?.content)
    }
    return composeSkillInstructions(bodies)
  }

  /**
   * Bind one teammate Agent's eligible Host Memory catalog rows into system-prompt assembly (FR-016).
   * Lead Agents and non-Team children are left unbound. Empty catalog contributes no prose.
   * Cold resume recomposes from the durable Lead journal via {@link refreshTeammateMemoryBind}.
   * @param agent - newly created or resumed exact live Agent.
   */
  private bindTeammateMemoryRecall(agent: Agent): void {
    const membership = this.roster.tryMembership(agent)
    if (membership === undefined || membership.role !== 'teammate') return
    const ref: MemoryBindRef = { current: '' }
    this.memoryBinds.set(agent.id, ref)
    bindTeammateMemoryRecall(agent, ref, () => {
      this.memoryBinds.delete(agent.id)
    })
    this.refreshTeammateMemoryBind(agent.id, membership.root)
  }

  /**
   * Push eligible catalog rows onto live Agent binds after a Host memory write.
   * Agent-layer writes refresh that bot only; user-layer writes refresh every live teammate bind.
   * @param root - exact live Lead owning the catalog.
   * @param memory - newly committed Host Memory row.
   */
  private refreshMemoryBindsAfterWrite(root: Agent, memory: MemoryRecord): void {
    if (memory.layer === 'agent') {
      if (memory.botId === null) return
      this.refreshTeammateMemoryBind(memory.botId, root)
      return
    }
    for (const botId of this.memoryBinds.keys()) {
      this.refreshTeammateMemoryBind(botId, root)
    }
  }

  /**
   * Recompose eligible Host Memory rows onto the live Agent bind when the Bot is activated.
   * Cold resume and Host `writeMemory` refresh through this path so subsequent turns see new facts.
   * @param botId - teammate Session identity.
   * @param root - exact live Lead owning the catalog.
   */
  private refreshTeammateMemoryBind(botId: SessionId, root: Agent): void {
    const existing = this.memoryBinds.get(botId)
    if (existing === undefined) return
    existing.current = composeMemoryRecall(this.journal.state(root).memories, botId)
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
    await this.lifecycle.settle([...this.inFlightFires.values()], failures)
    this.inFlightFires.clear()
    for (const dispose of this.mcpBindDisposers.values()) dispose()
    this.mcpBindDisposers.clear()
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

/**
 * Extract optional non-secret text detail from a successful tool result for Verifier visibility.
 * @param content - ToolRuntime content blocks from a successful execute.
 * @returns detail field when text is present; otherwise empty object.
 */
function connectorToolCallDetail(
  content: readonly { readonly type: string; readonly text?: string }[],
): { readonly detail: string } | Record<string, never> {
  const textBlocks = content
    .filter((block): block is { type: 'text'; text: string } =>
      block.type === 'text' && typeof block.text === 'string' && block.text.trim().length > 0)
    .map(block => block.text.trim())
  const joined = textBlocks.join('\n')
  return joined.length > 0 ? { detail: joined } : {}
}

export default TeamService
