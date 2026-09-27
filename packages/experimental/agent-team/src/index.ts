/** Agent Teams service façade over roster, mailbox, task, and runtime lifecycle owners. */

import { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { randomUUID } from 'node:crypto'
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
import {
  bindTeammatePersona,
  type PersonaBindRef,
} from './persona-bind.ts'
import { readPersistedSession } from './persisted.ts'
import { projectMailboxHandoffs, projectSidebarSections, projectSkillCatalog, teamProjectionDefinition } from './projection.ts'
import {
  bindTeammateSkillInstructions,
  composeSkillInstructions,
  type SkillBindRef,
} from './skill-bind.ts'
import { TeamRoster } from './roster.ts'
import type { TeamMembership } from './roster.ts'
import { TeamTaskBoard } from './task-board.ts'
import { SidebarSectionId, TeamId, TeamTaskId } from './types.ts'
import type {
  Config,
  CreateBotInput,
  CreateBotMutationResult,
  CreateBotRequest,
  CreateBotResult,
  CreateSectionInput,
  CreateSectionRequest,
  CreateSectionResult,
  CreateTeamTaskRequest,
  AssignSectionInput,
  AssignSectionRequest,
  AssignSectionResult,
  AttachSkillInput,
  AttachSkillRequest,
  AttachSkillResult,
  BotIdentityMutationResult,
  BotPersonaProfile,
  DeleteBotInput,
  DeleteBotRequest,
  DeleteBotResult,
  HostMailboxMessage,
  RenameBotInput,
  RenameBotRequest,
  RenameBotResult,
  RenameSectionInput,
  RenameSectionRequest,
  RenameSectionResult,
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
} from './types.ts'
import {
  normalizeAvatarMarker,
  normalizePersonaProfile,
  requiredDisplayName,
  requiredModelSelection,
  requiredSectionName,
  requiredSkillDisplayName,
  requiredSkillId,
  requiredSkillInstructionalBody,
  skillIdFromDisplayName,
  teammateNameFromDisplayName,
} from './validation.ts'

export type * from './types.ts'
export type { TeamMembership } from './roster.ts'
export { TeamId, TeamMessageId, TeamTaskId, SidebarSectionId, SkillId } from './types.ts'
export { TeamError } from './error.ts'
export { observeMailboxDeliveryState } from './delivery-state.ts'
export {
  HOST_MAILBOX_MESSAGE_SOURCE,
  readHostMailboxMessage,
} from './host-mailbox-message.ts'
export { projectMailboxHandoffs, projectSidebarSections, projectSkillCatalog } from './projection.ts'
export {
  SKILL_INSTRUCTIONS_SECTION,
  bindTeammateSkillInstructions,
  composeSkillInstructions,
} from './skill-bind.ts'
export type { SkillBindRef } from './skill-bind.ts'
export { AVATAR_COLOR_IDS, AVATAR_SHAPE_IDS } from './validation.ts'

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
  /** Live teammate persona refs for instruction bind updates after Host save. */
  private readonly personaBinds = new Map<SessionId, PersonaBindRef>()
  /** Live teammate skill-instruction refs for FR-014 bind updates after Host attach. */
  private readonly skillBinds = new Map<SessionId, SkillBindRef>()

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
      this.bindTeammatePersona(agent)
      this.bindTeammateSkillInstructions(agent)
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
   * Lead-authorized Host user-skill create/update stub (FR-006 / FR-013).
   * Rejects empty `displayName` or `instructionalBody` without writing.
   * When `ctx.skills` is present, registers a runtime catalog entry for this Host process
   * (T027 owns Host-durable filesystem authoring under the Desktop user skills root).
   * Electron Main must not invent skill records (research R3).
   * @param caller - exact live Lead Agent.
   * @param request - display name, instructional body, optional skill id, and cancellation.
   * @returns Host-owned skill catalog summary after validation (+ optional runtime register).
   */
  async upsertUserSkill(caller: Agent, request: UpsertUserSkillRequest): Promise<UpsertUserSkillResult> {
    const membership = this.roster.membership(caller)
    if (membership.role !== 'lead') {
      throw new TeamError('only the Team Lead can author a user skill', 'TEAM_LEAD_REQUIRED')
    }
    request.signal.throwIfAborted()
    const displayName = requiredSkillDisplayName(request.displayName)
    const instructionalBody = requiredSkillInstructionalBody(request.instructionalBody)
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
    const skills = this.ctx.get('skills')
    if (skills !== undefined) {
      skills.register({
        name: skillId,
        description,
        content: instructionalBody,
        source: 'user-dsh',
      })
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
   * Host mailbox handoffs, and skill catalog summaries through the generated Remote API
   * (FR-005 / FR-006 / P3 T011).
   * Handoffs reconstruct from Lead Session + target Session logs — never Main-synthesized IPC.
   * Skills project from Host `ctx.skills` when present — never Electron-synthesized.
   * @param agent - exact live Team member used as the authority credential.
   * @param signal - cancellation for cold target Session reads.
   * @returns detached current roster, task, section, handoff, and skill catalog views.
   */
  @Remote('view')
  async remoteView(agent: Agent, signal: AbortSignal): Promise<TeamView> {
    const membership = this.roster.membership(agent)
    const { sections, unassignedBotIds } = projectSidebarSections(this.journal.state(membership.root))
    return {
      members: this.listMembers(agent),
      tasks: this.listTasks(agent),
      sections,
      unassignedBotIds,
      handoffs: await this.listHandoffs(membership.root, signal),
      skills: await this.listSkillCatalog(signal),
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
