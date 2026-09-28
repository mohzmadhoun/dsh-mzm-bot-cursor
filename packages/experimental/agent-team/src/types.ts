/** Public Agent Teams identities, durable records, and service request values. */

import type { ModelSelection } from '@deepseek-ai/dsh-agent'
import type { Branded } from '@deepseek-ai/dsh-brand'
import type { ContentBlock } from '@deepseek-ai/dsh-llm/types'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Identifies the implicit team rooted at one top-level Session. */
export type TeamId = Branded<'TeamId'>

/**
 * Brand one root Session identity as its implicit Team identity.
 * @param id - Root Session identity.
 * @returns the same string branded as a Team identity.
 */
export function TeamId(id: SessionId | string): TeamId {
  return id as TeamId
}

/** Stable identifier for one task in a Team. */
export type TeamTaskId = Branded<'TeamTaskId'>

/**
 * Brand a validated task id.
 * @param id - Team-local task identity.
 * @returns the same string branded as a Team task identity.
 */
export function TeamTaskId(id: string): TeamTaskId {
  return id as TeamTaskId
}

/** Stable identifier for one durable peer message. */
export type TeamMessageId = Branded<'TeamMessageId'>

/**
 * Brand a generated peer-message id.
 * @param id - Durable mailbox message identity.
 * @returns the same string branded as a Team message identity.
 */
export function TeamMessageId(id: string): TeamMessageId {
  return id as TeamMessageId
}

/**
 * Durable teammate lifecycle.
 * `deleted` is a Host identity tombstone (FR-007 / FR-008): absent from Client
 * roster / overview / section membership projections; kebab `name` stays reserved.
 */
export type TeamMemberPhase = 'provisioning' | 'active' | 'failed' | 'deleted'

/** Stable Host id for one named sidebar section grouping. */
export type SidebarSectionId = Branded<'SidebarSectionId'>

/**
 * Brand a validated sidebar section id.
 * @param id - Host section identity.
 * @returns the same string branded as a sidebar section identity.
 */
export function SidebarSectionId(id: string): SidebarSectionId {
  return id as SidebarSectionId
}

/**
 * Per-bot persona profile (job / voice / anti-jobs).
 * Empty job, voice, or antiJobs list are allowed; empty fields contribute no instruction text.
 */
export interface BotPersonaProfile {
  /** Primary responsibility statement; may be empty. */
  readonly job: string
  /** How the bot should speak / present; may be empty. */
  readonly voice: string
  /** Explicit anti-responsibilities in order; length ≥ 0. */
  readonly antiJobs: readonly string[]
}

/** Opaque Host skill identity (kebab skill catalog name for filesystem-backed skills). */
export type SkillId = Branded<'SkillId'>

/**
 * Brand a validated skill catalog id.
 * @param id - Host skill identity (typically the winning `ctx.skills` name).
 * @returns the same string branded as a Skill identity.
 */
export function SkillId(id: string): SkillId {
  return id as SkillId
}

/** Opaque Host Routine catalog identity (P4 Architect Option 3 SoT). */
export type RoutineId = Branded<'RoutineId'>

/**
 * Brand a validated Host routine id.
 * @param id - Host routine identity.
 * @returns the same string branded as a Routine identity.
 */
export function RoutineId(id: string): RoutineId {
  return id as RoutineId
}

/** Durable Host routine lifecycle for cron wake eligibility. */
export type RoutineStatus = 'active' | 'paused'

/**
 * Host-owned durable Routine catalog row (data-model `RoutineRecord`).
 * Persists on the Lead Session `team/routine` journal path — not Electron Main,
 * not Client local store, not `dsh-schedule` session reminders (research R1/R2).
 */
export interface RoutineRecord {
  /** Immutable Host routine id. */
  readonly routineId: RoutineId
  /** Owning Bot Session id (per-bot isolation SC-006). */
  readonly botId: SessionId
  /** Non-empty wake intent; identity MAY derive from this (no separate displayName required). */
  readonly intent: string
  /** Product-supported schedule expression (5-field cron and/or `@every` / `@hourly` / `@daily`). */
  readonly scheduleExpr: string
  /** Wake eligibility; default `active` on create. */
  readonly status: RoutineStatus
  /** Epoch ms of last committed fire, or null until first fire. */
  readonly lastRunAt: number | null
  /** Epoch ms when the routine was created. */
  readonly createdAt: number
  /** Epoch ms of the latest durable mutation. */
  readonly updatedAt: number
}

/**
 * Client-readable Routine projection derived only from Host (data-model `RoutineProjection`).
 * Never invent rows from Electron Main or `ui-schedule` session reminders.
 */
export interface RoutineProjection {
  readonly routineId: RoutineId
  readonly botId: SessionId
  /** Intent text (or intent-derived identity for the pane). */
  readonly identity: string
  readonly intent: string
  readonly scheduleExpr: string
  /** Human-readable schedule label for the pane. */
  readonly scheduleLabel: string
  readonly status: RoutineStatus
  readonly lastRunAt: number | null
  readonly createdAt: number
  readonly updatedAt: number
}

/** Opaque Host Memory catalog identity (P5 Host Memory catalog SoT). */
export type MemoryId = Branded<'MemoryId'>

/**
 * Brand a validated Host memory id.
 * @param id - Host memory identity.
 * @returns the same string branded as a Memory identity.
 */
export function MemoryId(id: string): MemoryId {
  return id as MemoryId
}

/** Curated memory kind vocabulary — orthogonal to {@link MemoryLayer} (FR-017). */
export type MemoryKind = 'profile' | 'log' | 'note'

/** ADR memory layer: agent-scoped (one bot) or user-scoped (account-wide). */
export type MemoryLayer = 'agent' | 'user'

/**
 * Host-owned durable Memory catalog row (data-model `MemoryRecord`).
 * Persists on the Lead Session `team/memory` journal path — not Electron Main,
 * not Client local store, not chat transcript (research R1/R6/R7).
 */
export interface MemoryRecord {
  /** Immutable Host memory id. */
  readonly memoryId: MemoryId
  /** Curated kind; independent of layer. */
  readonly kind: MemoryKind
  /** ADR scope: agent (bot-keyed) or user (account-wide). */
  readonly layer: MemoryLayer
  /**
   * Owning Bot Session id when `layer=agent`; null when `layer=user`.
   * Absent is not used on durable rows — normalize to null for user layer.
   */
  readonly botId: SessionId | null
  /** Non-empty curated fact text (empty rejects without write). */
  readonly content: string
  /** Epoch ms when the memory was created. */
  readonly createdAt: number
  /** Epoch ms of the latest durable mutation. */
  readonly updatedAt: number
}

/**
 * Client-readable Memory projection derived only from Host (data-model `MemoryProjection`).
 * Never invent rows from Electron Main, Client local store, or transcript dump.
 */
export interface MemoryProjection {
  readonly memoryId: MemoryId
  readonly kind: MemoryKind
  readonly layer: MemoryLayer
  readonly botId: SessionId | null
  readonly content: string
  readonly createdAt: number
  readonly updatedAt: number
}

/**
 * Association of one Skill to one Bot (FR-003 / FR-005).
 * Stored on the Bot snapshot; `botId` matches the owning member id.
 */
export interface SkillAttachment {
  /** Owning Bot Session id. */
  readonly botId: SessionId
  /** Attached skill catalog id. */
  readonly skillId: SkillId
  /** Optional attach timestamp for observability (not required for Pass). */
  readonly attachedAt?: number
}

/**
 * Client-readable skill catalog summary (managed thin pack + user-authored).
 * Host projects from `ctx.skills`; Electron Main must not invent rows.
 */
export interface SkillCatalogSummary {
  /** Host skill id (catalog name). */
  readonly id: SkillId
  /** Human-readable discovery label. */
  readonly displayName: string
  /** Product source bucket for Pass. */
  readonly source: 'managed' | 'user'
  /** Optional short discovery description. */
  readonly description?: string
}

/** Fixed Host avatar shape preset ids (clarify lock 3 — no image upload). */
export type AvatarShapeId = 'circle' | 'square' | 'triangle' | 'hexagon'

/** Fixed Host avatar color preset ids (clarify lock 3 — no image upload). */
export type AvatarColorId = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray'

/**
 * Preset avatar marker (shape and/or color ids).
 * When a user sets an avatar for Pass, at least one of shape or color is required.
 * Image-file / URL upload is out of P2 Pass scope.
 */
export interface AvatarMarker {
  /** Preset shape id from the fixed Host set. */
  readonly shape?: AvatarShapeId
  /** Preset color id from the fixed Host set. */
  readonly color?: AvatarColorId
}

/** Whole durable value written on every teammate lifecycle change. */
export interface TeamMemberSnapshot {
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
  /**
   * Ordered skill attachments for this Bot (FR-003 / FR-005).
   * ≥0 items; same skill may attach to multiple bots independently.
   * Mutable after active via Host `attachSkill` (detach optional / not Pass-gated).
   */
  readonly skillAttachments?: readonly SkillAttachment[]
  readonly provider: string
  readonly context: 'fresh' | 'fork'
  readonly phase: TeamMemberPhase
  readonly error?: string
}

/** Current runtime-enriched roster row. */
export interface TeamMemberView {
  readonly id: SessionId
  readonly name: string
  readonly role: 'lead' | 'teammate'
  readonly status: 'running' | 'idle' | 'inactive' | 'provisioning' | 'failed'
  readonly description?: string
  /** Product-facing Bot label when create retained one. */
  readonly displayName?: string
  /**
   * Subagent backend id used to spawn this teammate (not the LLM provider).
   * LLM route identity lives on {@link modelSelection}.
   */
  readonly provider?: string
  readonly context?: 'fresh' | 'fork'
  readonly model?: string
  /**
   * LLM `(provider, model)` assignment when known from the live Agent route.
   * Verifier “different models” compares these pairs (FR-003 / SC-002).
   */
  readonly modelSelection?: Pick<ModelSelection, 'provider' | 'model'>
  /**
   * Durable persona profile when Host retained one (overview reads `antiJobs` here).
   */
  readonly persona?: BotPersonaProfile
  /** Preset avatar marker when Host retained one. */
  readonly avatar?: AvatarMarker
  /**
   * Named sidebar section id when assigned; `null` or absent ⇒ Unassigned/default.
   */
  readonly sectionId?: SidebarSectionId | null
  /**
   * Ordered skill attachments when Host retained any (FR-003).
   * Empty / absent ⇒ none attached; Client bot skills surface reads this list.
   */
  readonly skillAttachments?: readonly SkillAttachment[]
  readonly diagnostics: string[]
}

/** Durable task lifecycle. */
export type TeamTaskStatus = 'pending' | 'in_progress' | 'completed' | 'deleted'

/** Whole durable task snapshot; every mutation increments {@link revision}. */
export interface TeamTaskSnapshot {
  readonly id: TeamTaskId
  readonly revision: number
  readonly subject: string
  readonly description: string
  readonly status: TeamTaskStatus
  readonly ownerId?: SessionId
  readonly blockedBy: TeamTaskId[]
  readonly writeScopes: string[]
}

/** Runtime-enriched task view returned to tools and hosts. */
export interface TeamTaskView {
  readonly id: TeamTaskId
  readonly revision: number
  readonly subject: string
  readonly description: string
  readonly status: TeamTaskStatus
  readonly blockedBy: TeamTaskId[]
  readonly writeScopes: string[]
  readonly ownerName?: string
  readonly ready: boolean
  readonly writeScopeWarnings: string[]
}

/**
 * Durable named sidebar section catalog row (FR-006 / clarify lock 4).
 * Membership is Bot.`sectionId`, not an embedded list — Unassigned has no catalog row.
 */
export interface SidebarSectionSnapshot {
  readonly id: SidebarSectionId
  /** Non-empty user-visible section title. */
  readonly name: string
}

/**
 * Client-readable named sidebar section with membership derived from roster order.
 * Empty `botIds` is allowed after last-bot remove (contract Pass).
 */
export interface SidebarSectionView {
  readonly id: SidebarSectionId
  readonly name: string
  /** Non-deleted teammate ids whose `sectionId` matches, in Host roster order. */
  readonly botIds: readonly SessionId[]
}

/** Point-in-time roster, task-board, sections, and Host mailbox handoff projection for browser clients. */
export interface TeamView {
  readonly members: TeamMemberView[]
  readonly tasks: TeamTaskView[]
  /**
   * Named sidebar sections in Host catalog order with derived membership (FR-006).
   * Unassigned/default is {@link unassignedBotIds} — never a stored catalog row (clarify lock 4).
   */
  readonly sections: readonly SidebarSectionView[]
  /**
   * Non-deleted teammate ids with null/absent `sectionId` (or dangling unknown id).
   * Client renders Unassigned/default from this list; Host never persists an Unassigned row.
   */
  readonly unassignedBotIds: readonly SessionId[]
  /**
   * Host mailbox 1:1 handoffs reconstructed from Lead `team/message/*` plus target
   * Session logs (`HostMailboxMessage`). Never Main-synthesized IPC (FR-005).
   */
  readonly handoffs: HostMailboxMessage[]
  /**
   * Host skill catalog summaries (managed thin pack + user skills) for Client discovery.
   * Empty when the Host skills registry is unavailable; never Electron-synthesized.
   */
  readonly skills: readonly SkillCatalogSummary[]
  /**
   * Host Routine catalog projections (P4 Architect Option 3 SoT).
   * Empty until create; never `dsh-schedule` session reminders or Electron Main rows.
   */
  readonly routines: readonly RoutineProjection[]
  /**
   * Host Memory catalog projections (P5 Host Memory catalog SoT).
   * Empty until write; never Electron Main, Client-only, or transcript rows.
   */
  readonly memories: readonly MemoryProjection[]
}

/** One peer message retained until its target Session records it. */
export interface TeamMessageSnapshot {
  readonly id: TeamMessageId
  readonly senderId: SessionId
  readonly senderName: string
  readonly targetId: SessionId
  readonly content: ContentBlock[]
}

/** Source retained by the target Session for durable mailbox de-duplication. */
export interface TeamMessageSource {
  readonly kind: 'team-message'
  readonly teamId: TeamId
  readonly messageId: TeamMessageId
  readonly senderId: SessionId
  readonly senderName: string
}

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'team-message': TeamMessageSource
  }
}

/** Team-service deployment limits. */
export interface Config {
  /** Maximum immutable teammate names retained by one Team. */
  readonly maxMembers?: number
  /** Maximum non-deleted tasks retained by one Team. */
  readonly maxTasks?: number
  /** Maximum queued-minus-delivered messages for one target member. */
  readonly maxPendingMessagesPerMember?: number
  /** Maximum UTF-8 bytes in one complete sender-framed delivery. */
  readonly maxMessageBytes?: number
  /** Maximum milliseconds allowed for Team-owned runtime disposal. */
  readonly disposalTimeoutMs?: number
  /**
   * Host Routine cron ticker period in milliseconds (P4 US4 T025 / FR-005).
   * While Agent Teams is loaded, the Host process polls the Routine catalog on this
   * interval and wakes due **active** rows. Changeable from cordis.yml — not Electron Main.
   */
  readonly routineCronTickMs?: number
  /**
   * Absolute Host-durable user skills root for `upsertUserSkill` (FR-006 / FR-013).
   * Desktop mounts the same path via `dsh-skill-filesystem` customSkillDirs
   * (`desktop-user-skills` under `$DSH_HOME`). Required for durable authoring;
   * Electron Main must not invent this store.
   */
  readonly userSkillsRoot?: string
}

/** Input for creating one durable teammate. */
export interface SpawnTeammateRequest {
  readonly name: string
  readonly description: string
  /**
   * Optional product-facing Bot label retained on the durable member snapshot.
   * Host {@link CreateBotRequest} sets this; model-tool spawn may omit it.
   */
  readonly displayName?: string
  readonly prompt: ContentBlock[]
  readonly context: 'fresh' | 'fork'
  /**
   * Subagent backend id used for continuable child creation (`spawn`, `fork`, …).
   * Not the LLM provider route — that belongs on {@link SpawnTeammateRequest.agentOptions}.
   */
  readonly provider: string
  /**
   * Per-bot LLM {@link ModelSelection} applied at continuable create.
   * Distinct from {@link SpawnTeammateRequest.provider} (subagent backend). Omission inherits the
   * Lead's route through continuable child option resolution. Electron Main
   * must not invent or rewrite this route.
   */
  readonly agentOptions?: ModelSelection
  readonly signal: AbortSignal
}

/** Result after one teammate reaches a durable active or failed edge. */
export interface SpawnTeammateResult {
  readonly member: TeamMemberView
}

/**
 * Product bot-create inputs (FR-001 / FR-002).
 * Host persists the Bot; Electron Main must not invent bot records or LLM routes.
 */
export interface CreateBotInput {
  /** Non-empty human-facing Bot label. */
  readonly displayName: string
  /** Exactly one model/provider assignment for this Bot. */
  readonly modelSelection: ModelSelection
}

/** Lead-authorized Host create for one Bot, including creation cancellation. */
export interface CreateBotRequest extends CreateBotInput {
  readonly signal: AbortSignal
}

/**
 * Host-owned Bot retained after create.
 * `name` is the durable Team roster id derived from {@link CreateBotInput.displayName}.
 */
export interface CreateBotResult {
  readonly id: SessionId
  readonly displayName: string
  readonly name: string
  readonly modelSelection: ModelSelection
  readonly member: TeamMemberView
}

/** Browser create result with Team rejections kept distinct from transport failures. */
export type CreateBotMutationResult =
  | { readonly ok: true; readonly value: CreateBotResult }
  | {
    readonly ok: false
    readonly error: {
      readonly code: 'team-rejected'
      readonly message: string
    }
  }

/**
 * Browser result envelope for Host bot-identity mutations beyond P1 create.
 * Team rejections stay distinct from transport failures (same pattern as createBot).
 */
export type BotIdentityMutationResult<T> =
  | { readonly ok: true; readonly value: T }
  | {
    readonly ok: false
    readonly error: {
      readonly code: 'team-rejected'
      readonly message: string
    }
  }

/**
 * Host rename input (FR-004).
 * New displayName MUST be non-empty; kebab roster `name` does not change; duplicates allowed.
 */
export interface RenameBotInput {
  /** Existing Bot Session id. */
  readonly botId: SessionId
  /** Replacement product-facing label (non-empty after trim). */
  readonly displayName: string
}

/** Lead-authorized Host rename, including cancellation. */
export interface RenameBotRequest extends RenameBotInput {
  readonly signal: AbortSignal
}

/** Host-owned Bot identity after a successful rename. */
export interface RenameBotResult {
  readonly id: SessionId
  readonly displayName: string
  readonly member: TeamMemberView
}

/**
 * Host persona update input (FR-002 / FR-003).
 * Values replace the prior profile; empty job/voice/antiJobs are allowed.
 */
export interface UpdatePersonaInput {
  readonly botId: SessionId
  readonly job: string
  readonly voice: string
  readonly antiJobs: readonly string[]
}

/** Lead-authorized Host persona update, including cancellation. */
export interface UpdatePersonaRequest extends UpdatePersonaInput {
  readonly signal: AbortSignal
}

/** Host-owned Bot identity after a successful persona update. */
export interface UpdatePersonaResult {
  readonly id: SessionId
  readonly persona: BotPersonaProfile
  readonly member: TeamMemberView
}

/**
 * Host avatar-marker input (FR-005).
 * At least one of shape or color required when setting an avatar for Pass.
 */
export interface SetAvatarInput {
  readonly botId: SessionId
  readonly avatar: AvatarMarker
}

/** Lead-authorized Host avatar set, including cancellation. */
export interface SetAvatarRequest extends SetAvatarInput {
  readonly signal: AbortSignal
}

/** Host-owned Bot identity after a successful avatar set. */
export interface SetAvatarResult {
  readonly id: SessionId
  readonly avatar: AvatarMarker
  readonly member: TeamMemberView
}

/**
 * Host named sidebar section create input (FR-006).
 * Name must be non-empty after trim; Host allocates an opaque section id.
 */
export interface CreateSectionInput {
  readonly name: string
}

/** Lead-authorized Host section create, including cancellation. */
export interface CreateSectionRequest extends CreateSectionInput {
  readonly signal: AbortSignal
}

/** Host-owned named section after a successful create. */
export interface CreateSectionResult {
  readonly id: SidebarSectionId
  readonly name: string
  readonly section: SidebarSectionView
}

/**
 * Host named sidebar section rename input (FR-006).
 * Name must be non-empty after trim; empty rename rejects without writing.
 */
export interface RenameSectionInput {
  readonly sectionId: SidebarSectionId
  readonly name: string
}

/** Lead-authorized Host section rename, including cancellation. */
export interface RenameSectionRequest extends RenameSectionInput {
  readonly signal: AbortSignal
}

/** Host-owned named section after a successful rename. */
export interface RenameSectionResult {
  readonly id: SidebarSectionId
  readonly name: string
  readonly section: SidebarSectionView
}

/**
 * Host section assign / move / unassign input (FR-006).
 * `sectionId: null` places the bot under Unassigned/default (no catalog row).
 * Non-null id must name an existing Host catalog section.
 */
export interface AssignSectionInput {
  readonly botId: SessionId
  readonly sectionId: SidebarSectionId | null
}

/** Lead-authorized Host section membership update, including cancellation. */
export interface AssignSectionRequest extends AssignSectionInput {
  readonly signal: AbortSignal
}

/** Host-owned Bot identity after a successful section assign/unassign. */
export interface AssignSectionResult {
  readonly id: SessionId
  readonly sectionId: SidebarSectionId | null
  readonly member: TeamMemberView
}

/**
 * Host skill attach input (FR-003 / FR-005).
 * `skillId` must name a load-available catalog skill; multi-attach allowed.
 * Electron Main must not invent attachment records — Host owns the durable write.
 */
export interface AttachSkillInput {
  readonly botId: SessionId
  readonly skillId: SkillId | string
}

/** Lead-authorized Host skill attach, including cancellation. */
export interface AttachSkillRequest extends AttachSkillInput {
  readonly signal: AbortSignal
}

/** Host-owned Bot identity after a successful skill attach. */
export interface AttachSkillResult {
  readonly id: SessionId
  readonly skillAttachments: readonly SkillAttachment[]
  readonly member: TeamMemberView
}

/**
 * Host user-authored skill create/update input (FR-006 / FR-013).
 * `displayName` and `instructionalBody` MUST be non-empty after trim; empty rejects without writing.
 */
export interface UpsertUserSkillInput {
  /** Existing skill id for update; omit / empty for create (Host allocates kebab id from displayName). */
  readonly skillId?: SkillId | string
  readonly displayName: string
  readonly instructionalBody: string
  /** Optional short discovery description. */
  readonly description?: string
}

/** Lead-authorized Host user-skill upsert, including cancellation. */
export interface UpsertUserSkillRequest extends UpsertUserSkillInput {
  readonly signal: AbortSignal
}

/** Host-owned user skill after a successful create/update. */
export interface UpsertUserSkillResult {
  readonly skill: SkillCatalogSummary
}

/**
 * Host create-routine input (P4 FR-001 / T015–T016).
 * Non-empty `intent` and product-supported `scheduleExpr` required; empty / invalid reject without writing.
 * Scoped by `botId` (SC-006). No confirm token and no separate `displayName` —
 * pane identity derives from `intent` (SC-007 / FR-001).
 * Electron Main must not invent routine records — Host owns the durable write (research R1).
 */
export interface CreateRoutineInput {
  readonly botId: SessionId
  readonly intent: string
  readonly scheduleExpr: string
}

/** Lead-authorized Host routine create, including cancellation. */
export interface CreateRoutineRequest extends CreateRoutineInput {
  readonly signal: AbortSignal
}

/** Host-owned Routine after a successful create (status `active`, lastRunAt null). */
export interface CreateRoutineResult {
  readonly routine: RoutineProjection
}

/**
 * Host list-routines-by-bot input (P4 US2 T019 / FR-002).
 * Returns only that bot’s Host catalog rows (SC-006).
 */
export interface ListRoutinesByBotInput {
  readonly botId: SessionId
}

/** Lead-authorized Host routine list, including cancellation. */
export interface ListRoutinesByBotRequest extends ListRoutinesByBotInput {
  readonly signal: AbortSignal
}

/** Host Routine projections for one bot. */
export interface ListRoutinesByBotResult {
  readonly routines: readonly RoutineProjection[]
}

/**
 * Host pause-routine input (P4 US3 T022 / FR-003).
 * Sets durable `status: paused` so Host cron wake MUST NOT fire for that row.
 * Client T023 calls Host Remote `pauseRoutine` with this input over HTTP/WS.
 */
export interface PauseRoutineInput {
  readonly routineId: RoutineId
}

/** Lead-authorized Host routine pause, including cancellation. */
export interface PauseRoutineRequest extends PauseRoutineInput {
  readonly signal: AbortSignal
}

/** Host-owned Routine after a successful pause (`status: paused`). */
export interface PauseRoutineResult {
  readonly routine: RoutineProjection
}

/**
 * Host resume-routine input (P4 US3 T022 / FR-004).
 * Sets durable `status: active` so the row is eligible for Host cron wake again.
 * Client T023 calls Host Remote `resumeRoutine` with this input over HTTP/WS.
 */
export interface ResumeRoutineInput {
  readonly routineId: RoutineId
}

/** Lead-authorized Host routine resume, including cancellation. */
export interface ResumeRoutineRequest extends ResumeRoutineInput {
  readonly signal: AbortSignal
}

/** Host-owned Routine after a successful resume (`status: active`). */
export interface ResumeRoutineResult {
  readonly routine: RoutineProjection
}

/**
 * Host write-memory input (P5 FR-001…003 / T006–T008 / US1 T014 / US2 T017 / US3 T020).
 * Non-empty `content` required after trim; empty rejects without writing
 * (FR-001 profile, FR-002 log, FR-003 note). Persisted `kind` distinguishes
 * profile, log, and note on list/view.
 * `kind` and `layer` are independently chosen (FR-017).
 * When `layer=agent`, `botId` is required and must name an active Bot.
 * When `layer=user`, `botId` must be absent or null (account-wide).
 * Electron Main must not invent memory records — Host owns the durable write (research R1).
 * Bot-tool write is not required for Pass (FR-015).
 */
export interface WriteMemoryInput {
  readonly kind: MemoryKind
  readonly layer: MemoryLayer
  readonly botId?: SessionId | null
  readonly content: string
}

/** Lead-authorized Host memory write, including cancellation. */
export interface WriteMemoryRequest extends WriteMemoryInput {
  readonly signal: AbortSignal
}

/** Host-owned Memory after a successful write. */
export interface WriteMemoryResult {
  readonly memory: MemoryProjection
}

/**
 * Host list/browse memories input (P5 FR-007 / US5 / T007–T008).
 * When `botId` is set: that bot’s agent-layer rows plus all account-wide user rows.
 * When omitted: full Host catalog (same as `agentTeams/view.memories`).
 */
export interface ListMemoriesInput {
  readonly botId?: SessionId
}

/** Lead-authorized Host memory list, including cancellation. */
export interface ListMemoriesRequest extends ListMemoriesInput {
  readonly signal: AbortSignal
}

/** Host Memory projections for browse / recall surface. */
export interface ListMemoriesResult {
  readonly memories: readonly MemoryProjection[]
}

/**
 * Host delete input (FR-007 / FR-008 / clarify lock 5).
 * Confirm UX is Client-owned; this mutation performs identity removal when invoked.
 * Pass = absence from sidebar / overview / section membership — not transcript wipe.
 */
export interface DeleteBotInput {
  readonly botId: SessionId
}

/** Lead-authorized Host delete, including cancellation. */
export interface DeleteBotRequest extends DeleteBotInput {
  readonly signal: AbortSignal
}

/**
 * Host acknowledgement after durable Bot identity removal.
 * Mid-flight failure must leave the Bot listed until a successful call (T029 Host).
 */
export interface DeleteBotResult {
  readonly id: SessionId
}

/** Input for one durable peer message. */
export interface SendTeamMessageRequest {
  readonly target: string
  readonly content: ContentBlock[]
  readonly signal: AbortSignal
}

/** Result after a peer message enters the durable mailbox. */
export interface SendTeamMessageResult {
  readonly messageId: TeamMessageId
  readonly status: 'accepted' | 'queued'
}

/**
 * Product Host mailbox delivery observation (FR-004 / FR-005).
 * Reconstruct from Lead `team/message/*` edges plus the target Session log —
 * never from Electron IPC.
 *
 * Transitions: `queued` → `delivered` → `acted` | `visible-pending`.
 */
export type TeamMailboxDeliveryState =
  | 'queued'
  | 'delivered'
  | 'acted'
  | 'visible-pending'

/**
 * Product Host mailbox provenance (data-model `source`).
 * Always Host Agent Teams Lead-log / team-message path — never Electron IPC.
 */
export interface HostMailboxMessageSource {
  readonly kind: 'host-mailbox'
}

/**
 * Product Host mailbox message fields (spec data-model Host mailbox message).
 * Durable on the Lead Session `team/message/*` log (+ target receipt for deliveryState);
 * reconstruct with `readHostMailboxMessage` — never from Electron IPC.
 *
 * Internal Team snapshot aliases: `fromBotId`←`senderId`, `toBotId`←`targetId`,
 * `body`←`content`, `createdAt`←queued event `time`.
 */
export interface HostMailboxMessage {
  readonly id: TeamMessageId
  readonly fromBotId: SessionId
  readonly toBotId: SessionId
  readonly body: ContentBlock[]
  readonly createdAt: number
  readonly deliveryState: TeamMailboxDeliveryState
  readonly source: HostMailboxMessageSource
}

/** Input for creating one shared task. */
export interface CreateTeamTaskRequest {
  readonly subject: string
  readonly description: string
  readonly blockedBy?: readonly TeamTaskId[]
  readonly writeScopes?: readonly string[]
}

/** Supported task mutation actions. */
export type TeamTaskAction =
  | 'claim'
  | 'release'
  | 'edit'
  | 'set_dependencies'
  | 'complete'
  | 'reopen'
  | 'reassign'
  | 'delete'

/** Compare-and-set mutation of one shared task. */
export interface UpdateTeamTaskRequest {
  readonly taskId: TeamTaskId
  readonly expectedRevision: number
  readonly action: TeamTaskAction
  readonly subject?: string
  readonly description?: string
  readonly blockedBy?: readonly TeamTaskId[]
  readonly writeScopes?: readonly string[]
  readonly owner?: string
}

/** Browser task mutation result with stale revisions kept distinct from other Team rejections. */
export type TeamTaskMutationResult =
  | { readonly ok: true; readonly value: TeamTaskView }
  | {
    readonly ok: false
    readonly error: {
      readonly code: 'team-task-conflict' | 'team-rejected'
      readonly message: string
    }
  }

/** Result of waiting for Team activity. */
export interface TeamWaitResult {
  readonly timedOut: boolean
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /** Whole teammate lifecycle value, stored only in the Team Lead Session. */
    'team/member': { version: 2; teamId: TeamId; member: TeamMemberSnapshot }
    /** Whole shared-task value, stored only in the Team Lead Session. */
    'team/task': { version: 2; teamId: TeamId; task: TeamTaskSnapshot }
    /**
     * Named sidebar section catalog row (id + non-empty name), Lead Session only.
     * Membership lives on `team/member`.sectionId; Unassigned has no catalog event.
     */
    'team/section': { version: 2; teamId: TeamId; section: SidebarSectionSnapshot }
    /**
     * Host Routine catalog row (P4 Architect Option 3 SoT), Lead Session only.
     * Not `dsh-schedule` session reminders; Electron Main must not invent parallel rows.
     */
    'team/routine': { version: 2; teamId: TeamId; routine: RoutineRecord }
    /**
     * Host Memory catalog row (P5 Host Memory catalog SoT), Lead Session only.
     * Not chat transcript; Electron Main must not invent parallel rows (research R1/R6/R7).
     */
    'team/memory': { version: 2; teamId: TeamId; memory: MemoryRecord }
    /** Durable mailbox enqueue, stored before delivery is attempted. */
    'team/message/queued': { version: 2; teamId: TeamId; message: TeamMessageSnapshot }
    /** Durable acknowledgement that the target Session recorded the message. */
    'team/message/delivered': {
      version: 2
      teamId: TeamId
      messageId: TeamMessageId
      targetId: SessionId
    }
  }
}
