import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  AssignSectionInput,
  AssignSectionResult,
  AttachSkillInput,
  AttachSkillResult,
  AuthenticateConnectorInput,
  AuthenticateConnectorResult,
  AvatarColorId,
  AvatarMarker,
  AvatarShapeId,
  BotIdentityMutationResult,
  ConnectorAuthState,
  ConnectorCatalogEntry,
  ConnectorId,
  ConnectorInstallState,
  ConnectorProjection,
  CreateBotInput,
  CreateBotMutationResult,
  CreateBotResult,
  CreateRoutineInput,
  CreateRoutineResult,
  CreateSectionInput,
  CreateSectionResult,
  DeleteBotInput,
  DeleteBotResult,
  DescribeConnectorCredentialInput,
  DescribeConnectorCredentialResult,
  HostMailboxMessage,
  InstallConnectorInput,
  InstallConnectorResult,
  InvokeConnectorToolResult,
  ListConnectorCatalogResult,
  ListConnectorsResult,
  ConnectorToolCall,
  ListMemoriesInput,
  ListMemoriesResult,
  MemoryId,
  MemoryKind,
  MemoryLayer,
  MemoryProjection,
  PauseRoutineInput,
  PauseRoutineResult,
  RenameBotInput,
  RenameBotResult,
  RenameSectionInput,
  RenameSectionResult,
  ResumeRoutineInput,
  ResumeRoutineResult,
  RoutineEventTrigger,
  RoutineId,
  RoutineProjection,
  RoutineStatus,
  RoutineTriggerKind,
  SetAvatarInput,
  SetAvatarResult,
  SidebarSectionId,
  SidebarSectionView,
  SkillAttachment,
  SkillCatalogSummary,
  SkillId,
  TeamMailboxDeliveryState,
  TeamMemberView as TeamRosterMember,
  TeamTaskAction,
  TeamTaskId,
  TeamTaskMutationResult,
  TeamTaskView as TeamTask,
  TeamView,
  UpdatePersonaInput,
  UpdatePersonaResult,
  UpsertUserSkillInput,
  UpsertUserSkillResult,
  WriteMemoryInput,
  WriteMemoryResult,
} from '@deepseek-ai/dsh-experimental-agent-team/client'
import type { RemoteResult } from '@deepseek-ai/dsh-api-remotes/client'
import {
  IconCheckOutline14, IconCloseOutline16, IconEditOutline16, IconPauseOutline16,
  IconPlayOutline16, IconPlusOutline16, IconRefreshOutline14, IconTrashOutline16,
  IconUserOutline16, StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { NS, type TeamKey } from './locales.ts'
import css from './TeamAction.module.css'

/** Generated Remote result consumed directly by the Team UI. */
export type TeamActionResult<T> = RemoteResult<T>

/** Generated Remote result whose business value preserves Team task rejections. */
export type TeamTaskActionResult = RemoteResult<TeamTaskMutationResult>

/** Generated Remote result whose business value preserves Team createBot rejections. */
export type TeamCreateBotActionResult = RemoteResult<CreateBotMutationResult>

/** Generated Remote result whose business value preserves Team updatePersona rejections. */
export type TeamUpdatePersonaActionResult = RemoteResult<BotIdentityMutationResult<UpdatePersonaResult>>

/** Generated Remote result whose business value preserves Team renameBot rejections. */
export type TeamRenameBotActionResult = RemoteResult<BotIdentityMutationResult<RenameBotResult>>

/** Generated Remote result whose business value preserves Team setAvatar rejections. */
export type TeamSetAvatarActionResult = RemoteResult<BotIdentityMutationResult<SetAvatarResult>>

/** Generated Remote result whose business value preserves Team deleteBot rejections. */
export type TeamDeleteBotActionResult = RemoteResult<BotIdentityMutationResult<DeleteBotResult>>

/** Generated Remote result whose business value preserves Team createSection rejections. */
export type TeamCreateSectionActionResult = RemoteResult<BotIdentityMutationResult<CreateSectionResult>>

/** Generated Remote result whose business value preserves Team renameSection rejections. */
export type TeamRenameSectionActionResult = RemoteResult<BotIdentityMutationResult<RenameSectionResult>>

/** Generated Remote result whose business value preserves Team assignSection rejections. */
export type TeamAssignSectionActionResult = RemoteResult<BotIdentityMutationResult<AssignSectionResult>>

/** Generated Remote result whose business value preserves Team attachSkill rejections. */
export type TeamAttachSkillActionResult = RemoteResult<BotIdentityMutationResult<AttachSkillResult>>

/** Generated Remote result whose business value preserves Team upsertUserSkill rejections. */
export type TeamUpsertUserSkillActionResult = RemoteResult<BotIdentityMutationResult<UpsertUserSkillResult>>

/** Generated Remote result whose business value preserves Team createRoutine rejections. */
export type TeamCreateRoutineActionResult = RemoteResult<BotIdentityMutationResult<CreateRoutineResult>>

/** Generated Remote result whose business value preserves Team pauseRoutine rejections. */
export type TeamPauseRoutineActionResult = RemoteResult<BotIdentityMutationResult<PauseRoutineResult>>

/** Generated Remote result whose business value preserves Team resumeRoutine rejections. */
export type TeamResumeRoutineActionResult = RemoteResult<BotIdentityMutationResult<ResumeRoutineResult>>

/** Generated Remote result whose business value preserves Team writeMemory rejections. */
export type TeamWriteMemoryActionResult = RemoteResult<BotIdentityMutationResult<WriteMemoryResult>>

/** Generated Remote result whose business value preserves Team listMemories rejections. */
export type TeamListMemoriesActionResult = RemoteResult<BotIdentityMutationResult<ListMemoriesResult>>

/** Generated Remote result whose business value preserves Team listConnectorCatalog rejections. */
export type TeamListConnectorCatalogActionResult =
  RemoteResult<BotIdentityMutationResult<ListConnectorCatalogResult>>

/** Generated Remote result whose business value preserves Team listConnectors rejections. */
export type TeamListConnectorsActionResult =
  RemoteResult<BotIdentityMutationResult<ListConnectorsResult>>

/** Generated Remote result whose business value preserves Team installConnector rejections. */
export type TeamInstallConnectorActionResult =
  RemoteResult<BotIdentityMutationResult<InstallConnectorResult>>

/** Generated Remote result whose business value preserves Team authenticateConnector rejections. */
export type TeamAuthenticateConnectorActionResult =
  RemoteResult<BotIdentityMutationResult<AuthenticateConnectorResult>>

/** Generated Remote result whose business value preserves Team describeConnectorCredential rejections. */
export type TeamDescribeConnectorCredentialActionResult =
  RemoteResult<BotIdentityMutationResult<DescribeConnectorCredentialResult>>

/**
 * Host / Client connector tool-invoke input (P6 US1 T020).
 * Invokes one tool exposed by an authenticated connector for user-visible outcome.
 * Narrower than Host `InvokeConnectorToolInput` (optional toolName / arguments).
 */
export interface InvokeConnectorToolInput {
  readonly connectorId: ConnectorId
}

/**
 * Host RPC business value for `invokeConnectorTool` — wraps {@link ConnectorToolCall}.
 * Matches Host `InvokeConnectorToolResult` wire (`{ toolCall }`); do not flatten.
 */
export type ConnectorToolInvokeResult = InvokeConnectorToolResult

/** Generated Remote result whose business value preserves Team invokeConnectorTool rejections. */
export type TeamInvokeConnectorToolActionResult =
  RemoteResult<BotIdentityMutationResult<InvokeConnectorToolResult>>

/**
 * Host trust policy for connector / approval gates (P6 US3 T027 / research R4).
 * `never` = standing deny; `ask` = interactive answerer may prompt.
 */
export type TrustPolicy = 'ask' | 'never'

/** Host getTrustPolicy business value (standing deny state). */
export interface GetTrustPolicyResult {
  readonly policy: TrustPolicy
}

/** Host setStandingDeny input — `enabled: true` maps to policy `never`. */
export interface SetStandingDenyInput {
  readonly enabled: boolean
}

/** Host setStandingDeny business value after policy write. */
export interface SetStandingDenyResult {
  readonly policy: TrustPolicy
}

/**
 * One pending approval for the Team deny card (P6 US3 T027).
 * Answered on Host HTTP via mount answerer bridge — never Electron Main.
 */
export interface PendingTrustApproval {
  readonly requestId: string
  readonly toolName: string
  readonly reason?: string
  readonly connectorId?: ConnectorId
}

/** Host/Client answerTrustApproval input (user deny or complementary allow-once). */
export interface AnswerTrustApprovalInput {
  readonly requestId: string
  readonly decision: 'deny' | 'allow'
}

/** Host/Client answerTrustApproval result. */
export interface AnswerTrustApprovalResult {
  readonly requestId: string
  readonly outcome: 'rejected' | 'allowed-once'
  readonly source: 'user_deny' | 'user_allow'
}

/** Generated Remote result for getTrustPolicy. */
export type TeamGetTrustPolicyActionResult =
  RemoteResult<BotIdentityMutationResult<GetTrustPolicyResult>>

/** Generated Remote result for setStandingDeny. */
export type TeamSetStandingDenyActionResult =
  RemoteResult<BotIdentityMutationResult<SetStandingDenyResult>>

/** Business actions injected by the browser plugin. */
export interface TeamActionInjected {
  load: (sessionId: SessionId) => Promise<TeamActionResult<TeamView>>
  createBot: (sessionId: SessionId, input: CreateBotInput) => Promise<TeamCreateBotActionResult>
  updatePersona: (sessionId: SessionId, input: UpdatePersonaInput) => Promise<TeamUpdatePersonaActionResult>
  renameBot: (sessionId: SessionId, input: RenameBotInput) => Promise<TeamRenameBotActionResult>
  setAvatar: (sessionId: SessionId, input: SetAvatarInput) => Promise<TeamSetAvatarActionResult>
  deleteBot: (sessionId: SessionId, input: DeleteBotInput) => Promise<TeamDeleteBotActionResult>
  createSection: (sessionId: SessionId, input: CreateSectionInput) => Promise<TeamCreateSectionActionResult>
  renameSection: (sessionId: SessionId, input: RenameSectionInput) => Promise<TeamRenameSectionActionResult>
  assignSection: (sessionId: SessionId, input: AssignSectionInput) => Promise<TeamAssignSectionActionResult>
  attachSkill: (sessionId: SessionId, input: AttachSkillInput) => Promise<TeamAttachSkillActionResult>
  upsertUserSkill: (sessionId: SessionId, input: UpsertUserSkillInput) => Promise<TeamUpsertUserSkillActionResult>
  createRoutine: (sessionId: SessionId, input: CreateRoutineInput) => Promise<TeamCreateRoutineActionResult>
  pauseRoutine: (sessionId: SessionId, input: PauseRoutineInput) => Promise<TeamPauseRoutineActionResult>
  resumeRoutine: (sessionId: SessionId, input: ResumeRoutineInput) => Promise<TeamResumeRoutineActionResult>
  writeMemory: (sessionId: SessionId, input: WriteMemoryInput) => Promise<TeamWriteMemoryActionResult>
  listMemories: (sessionId: SessionId, input: ListMemoriesInput) => Promise<TeamListMemoriesActionResult>
  listConnectorCatalog: (sessionId: SessionId) => Promise<TeamListConnectorCatalogActionResult>
  listConnectors: (sessionId: SessionId) => Promise<TeamListConnectorsActionResult>
  installConnector: (
    sessionId: SessionId,
    input: InstallConnectorInput,
  ) => Promise<TeamInstallConnectorActionResult>
  authenticateConnector: (
    sessionId: SessionId,
    input: AuthenticateConnectorInput,
  ) => Promise<TeamAuthenticateConnectorActionResult>
  describeConnectorCredential: (
    sessionId: SessionId,
    input: DescribeConnectorCredentialInput,
  ) => Promise<TeamDescribeConnectorCredentialActionResult>
  invokeConnectorTool: (
    sessionId: SessionId,
    input: InvokeConnectorToolInput,
  ) => Promise<TeamInvokeConnectorToolActionResult>
  /** Host trust policy read (standing deny / ask) — Host HTTP only (P6 T027). */
  getTrustPolicy: (sessionId: SessionId) => Promise<TeamGetTrustPolicyActionResult>
  /** Host standing deny toggle — maps to approval policy never|ask (P6 T027). */
  setStandingDeny: (
    sessionId: SessionId,
    input: SetStandingDenyInput,
  ) => Promise<TeamSetStandingDenyActionResult>
  /**
   * Snapshot of pending Host approval prompts for the deny card.
   * Populated by the Client mount Host-HTTP answerer bridge (approval/request).
   */
  listPendingTrustApprovals: (sessionId: SessionId) => Promise<readonly PendingTrustApproval[]>
  /** Answer one pending approval on Host HTTP (user deny / allow-once). */
  answerTrustApproval: (
    sessionId: SessionId,
    input: AnswerTrustApprovalInput,
  ) => Promise<AnswerTrustApprovalResult>
  /** Subscribe to pending approval card updates from the Host HTTP answerer bridge. */
  subscribePendingTrustApprovals: (
    listener: (approvals: readonly PendingTrustApproval[]) => void,
  ) => () => void
  createTask: (sessionId: SessionId, input: {
    subject: string
    description: string
    blockedBy: TeamTaskId[]
    writeScopes: string[]
  }) => Promise<TeamTaskActionResult>
  updateTask: (sessionId: SessionId, input: {
    taskId: TeamTaskId
    expectedRevision: number
    action: TeamTaskAction
    subject?: string
    description?: string
    blockedBy?: TeamTaskId[]
    writeScopes?: string[]
    owner?: string
  }) => Promise<TeamTaskActionResult>
  openTeammate: (sessionId: SessionId, member: TeamRosterMember) => Promise<void>
  /**
   * Open Settings → Models for in-app credential entry / re-entry.
   * Used when create/chat surfaces Host `MISSING_CREDENTIAL`, `AUTH`, or
   * `INVALID_CREDENTIAL` (not 1Password).
   */
  openModelsSettings: () => void
}

/** Full props of the Team conversation-header action. */
export type TeamActionProps =
  PropsRuntime<'conversation.session.header.actions'> & TeamActionInjected & PropsLocale<typeof NS>

interface Draft {
  subject: string
  description: string
  blockers: string
  scopes: string
}

interface BotDraft {
  displayName: string
  provider: string
  model: string
}

/** Draft fields for the Host persona profile editor (job / voice / anti-jobs). */
interface PersonaDraft {
  job: string
  voice: string
  antiJobs: string
}

/** Draft fields for the Host rename editor (non-empty displayName). */
interface RenameDraft {
  displayName: string
}

/**
 * Draft fields for the Host preset avatar picker (shape and/or color).
 * Empty string means unset for that axis; at least one must be set to save.
 * Image-file / URL upload is omitted for P2 Pass (clarify lock 3 / T024).
 */
interface AvatarDraft {
  shape: AvatarShapeId | ''
  color: AvatarColorId | ''
}

/** Draft fields for Host named sidebar section create / rename (non-empty name). */
interface SectionNameDraft {
  name: string
}

/** Draft skill id for Host attachSkill (must be available-to-attach). */
interface AttachSkillDraft {
  skillId: SkillId | ''
}

/**
 * Draft fields for Host user-skill create/edit (FR-006 / FR-013).
 * Both displayName and instructionalBody MUST be non-empty after trim.
 */
interface SkillAuthorDraft {
  displayName: string
  instructionalBody: string
}

/**
 * Draft fields for Host createRoutine (P4 FR-001 / T017; P6 US2 T024 event).
 * Cron: intent + product-supported scheduleExpr. Event: intent + Pass family webhook_harness.
 */
interface CreateRoutineDraft {
  intent: string
  /** Defaults to cron so P4 create path stays one-select away from schedule. */
  triggerKind: RoutineTriggerKind
  scheduleExpr: string
  /** Pass event family when triggerKind=event (FR-018). */
  eventTrigger: RoutineEventTrigger
}

/**
 * Writable kinds on the shared Host writeMemory surface for P5 US1–US3.
 * Host already accepts profile | log | note; Client exposes all three (T015 / T018 / T021).
 */
type MemoryWriteKind = MemoryKind

/**
 * Draft fields for Host writeMemory on the shared surface (P5 FR-001–FR-003 / T015+T018+T021).
 * Kind is profile | log | note; content MUST be non-empty after trim; layer is agent | user (FR-017 orthogonal).
 */
interface WriteMemoryDraft {
  kind: MemoryWriteKind | ''
  content: string
  layer: MemoryLayer | ''
}

/**
 * Ephemeral draft secret for Host authenticateConnector (P6 T020 / T031).
 * Lives only in React state — never localStorage / sessionStorage / IndexedDB.
 */
interface ConnectorAuthDraft {
  secret: string
}

/** Last Host-projected connector tool outcome shown on the Connectors panel (T020). */
interface ConnectorToolOutcomeView {
  readonly toolName: string
  readonly outcome: ConnectorToolCall['outcome']
}

const EMPTY_DRAFT: Draft = { subject: '', description: '', blockers: '', scopes: '' }
const EMPTY_BOT_DRAFT: BotDraft = { displayName: '', provider: '', model: '' }
const EMPTY_PERSONA_DRAFT: PersonaDraft = { job: '', voice: '', antiJobs: '' }
const EMPTY_RENAME_DRAFT: RenameDraft = { displayName: '' }
const EMPTY_AVATAR_DRAFT: AvatarDraft = { shape: '', color: '' }
const EMPTY_SECTION_NAME_DRAFT: SectionNameDraft = { name: '' }
const EMPTY_ATTACH_SKILL_DRAFT: AttachSkillDraft = { skillId: '' }
const EMPTY_SKILL_AUTHOR_DRAFT: SkillAuthorDraft = { displayName: '', instructionalBody: '' }
const EMPTY_CREATE_ROUTINE_DRAFT: CreateRoutineDraft = {
  intent: '',
  triggerKind: 'cron',
  scheduleExpr: '',
  eventTrigger: 'webhook_harness',
}
const EMPTY_WRITE_MEMORY_DRAFT: WriteMemoryDraft = { kind: '', content: '', layer: '' }
const EMPTY_CONNECTOR_AUTH_DRAFT: ConnectorAuthDraft = { secret: '' }

/** Locale key for Host connector installState labels. */
function connectorInstallStateKey(
  state: ConnectorInstallState,
): `connectorInstallState.${ConnectorInstallState}` {
  return `connectorInstallState.${state}`
}

/** Locale key for Host connector authState labels. */
function connectorAuthStateKey(
  state: ConnectorAuthState,
): `connectorAuthState.${ConnectorAuthState}` {
  return `connectorAuthState.${state}`
}

/** Public MCP tool name for Host Pass fixture / thin-catalog serverName (FR-017). */
function connectorPublicToolName(serverName: string): string {
  return `mcp__${serverName}__ping`
}


/** Select sentinel for Unassigned/default — never a Host catalog id (clarify lock 4). */
const UNASSIGNED_OPTION = ''

/** Select sentinel for attach picker — never a Host skill id. */
const ATTACH_SKILL_NONE = ''

/** Select sentinel for routine schedule — never a product scheduleExpr. */
const ROUTINE_SCHEDULE_NONE = ''

/** Select sentinel for memory kind — never a Host MemoryKind value. */
const MEMORY_KIND_NONE = ''

/** Select sentinel for memory layer — never a Host MemoryLayer value. */
const MEMORY_LAYER_NONE = ''

/** Product-supported schedule presets for Host createRoutine (P4 T008 / FR-001). */
const ROUTINE_SCHEDULE_PRESETS = [
  { value: '@every 5m', label: 'routineSchedule.every5m' },
  { value: '@hourly', label: 'routineSchedule.hourly' },
  { value: '@daily', label: 'routineSchedule.daily' },
] as const satisfies readonly { readonly value: string; readonly label: TeamKey }[]

/** Trigger kinds for Host createRoutine (P4 cron + P6 event / T024). */
const ROUTINE_TRIGGER_KIND_OPTIONS = [
  { value: 'cron', label: 'routineTrigger.cron' },
  { value: 'event', label: 'routineTrigger.event' },
] as const satisfies readonly { readonly value: RoutineTriggerKind; readonly label: TeamKey }[]

/** Pass event-family options for Host createRoutine triggerKind=event (FR-018). */
const ROUTINE_EVENT_TRIGGER_OPTIONS = [
  { value: 'webhook_harness', label: 'routineEventTrigger.webhook_harness' },
] as const satisfies readonly { readonly value: RoutineEventTrigger; readonly label: TeamKey }[]

/** Writable kinds on the shared writeMemory surface (US1 profile + US2 log + US3 note). */
const MEMORY_WRITE_KIND_OPTIONS = [
  { value: 'profile', label: 'memoryKind.profile' },
  { value: 'log', label: 'memoryKind.log' },
  { value: 'note', label: 'memoryKind.note' },
] as const satisfies readonly { readonly value: MemoryWriteKind; readonly label: TeamKey }[]

/** Product layer choices for Host writeMemory (FR-017 — orthogonal to kind). */
const MEMORY_LAYER_OPTIONS = [
  { value: 'agent', label: 'memoryLayer.agent' },
  { value: 'user', label: 'memoryLayer.user' },
] as const satisfies readonly { readonly value: MemoryLayer; readonly label: TeamKey }[]

/** Stable Client key for session-active run indication on one bot×skill pair (FR-004). */
function skillSessionActiveKey(botId: SessionId, skillId: SkillId): string {
  return `${botId}\0${skillId}`
}

/**
 * Host listMemories filter mirrored for Client display from `TeamView.memories`.
 * Agent-layer rows for this bot plus all account-wide user rows (P5 T007–T008 / US5).
 * @param memories - Host Memory projections from `agentTeams/view` or `listMemories`.
 * @param botId - Bot Session whose agent-layer rows are in scope.
 * @returns memories visible in that bot’s memory surface.
 */
function memoriesForBot(
  memories: readonly MemoryProjection[],
  botId: SessionId,
): MemoryProjection[] {
  return memories.filter(memory => (
    memory.layer === 'user'
    || (memory.layer === 'agent' && memory.botId === botId)
  ))
}

/**
 * Browse layer filter on the Bot memory surface (P5 US5 T028 / FR-006 / FR-007).
 * `all` keeps Host bot-scoped projection; `agent` / `user` narrow to that layer.
 */
type MemoryBrowseLayerFilter = MemoryLayer | 'all'

/** Select sentinel — never a Host MemoryLayer or product filter value. */
const MEMORY_BROWSE_LAYER_FILTER_ALL = 'all' as const satisfies MemoryBrowseLayerFilter

/** Product browse layer filter choices (US5 — distinguishable Agent vs User). */
const MEMORY_BROWSE_LAYER_FILTER_OPTIONS = [
  { value: 'all', label: 'memoryBrowseLayerFilter.all' },
  { value: 'agent', label: 'memoryLayer.agent' },
  { value: 'user', label: 'memoryLayer.user' },
] as const satisfies readonly { readonly value: MemoryBrowseLayerFilter; readonly label: TeamKey }[]

/**
 * Narrow bot-scoped Host memories by Client browse layer filter (US5 T028).
 * @param memories - Host Memory projections already scoped by `memoriesForBot`.
 * @param layerFilter - `all` | `agent` | `user`.
 * @returns memories matching the browse filter.
 */
function memoriesForBrowseLayer(
  memories: readonly MemoryProjection[],
  layerFilter: MemoryBrowseLayerFilter,
): readonly MemoryProjection[] {
  if (layerFilter === 'all') return memories
  return memories.filter(memory => memory.layer === layerFilter)
}


/**
 * Optional Host memory-recall inject/apply stamp (P5 US4 / data-model `MemoryRecallInject`).
 * Host T024 MAY project these on `TeamView`; Client shows an indicator only when present.
 */
interface MemoryRecallInjectProjection {
  readonly memoryIds: readonly MemoryId[]
  readonly botId: SessionId
  readonly assembledAt: number
}

/** TeamView extended with optional Host inject stamps (wire field when Host exposes it). */
type TeamViewWithOptionalInject = TeamView & {
  readonly memoryRecallInjects?: readonly MemoryRecallInjectProjection[]
}

/**
 * Read optional Host memory-recall inject stamps from a Team view.
 * Absent / empty ⇒ no Client inject indicator (optional when present — FR-016 / SC-004).
 * @param view - Host `agentTeams/view` projection.
 * @returns inject stamps Host exposed, or empty.
 */
function memoryRecallInjectsFromView(view: TeamView): readonly MemoryRecallInjectProjection[] {
  return (view as TeamViewWithOptionalInject).memoryRecallInjects ?? []
}

/**
 * Inject stamp for one bot when Host exposed it on the Team view.
 * @param view - Host Team view (may omit inject field).
 * @param botId - teammate whose inject stamp is requested.
 * @returns that bot’s inject stamp, or null when Host did not expose one.
 */
function memoryRecallInjectForBot(
  view: TeamView,
  botId: SessionId,
): MemoryRecallInjectProjection | null {
  return memoryRecallInjectsFromView(view).find(stamp => stamp.botId === botId) ?? null
}

/**
 * Locale copy for an optional Host inject/apply indicator (P5 US4 T025).
 * @param assembledAt - Host inject assembly timestamp ms.
 * @param t - locale lookup.
 * @returns inject-applied copy for the memory recall surface.
 */
function memoryInjectAppliedLabel(
  assembledAt: number,
  t: TeamActionProps['t'],
): string {
  return t('memoryInjectApplied', { time: new Date(assembledAt).toISOString() })
}

/** Locale key for one Host Memory kind label. */
function memoryKindKey(kind: MemoryKind): TeamKey {
  switch (kind) {
    case 'profile':
      return 'memoryKind.profile'
    case 'log':
      return 'memoryKind.log'
    case 'note':
      return 'memoryKind.note'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

/** Locale key for one Host Memory layer label. */
function memoryLayerKey(layer: MemoryLayer): TeamKey {
  switch (layer) {
    case 'agent':
      return 'memoryLayer.agent'
    case 'user':
      return 'memoryLayer.user'
    default: {
      const _exhaustive: never = layer
      return _exhaustive
    }
  }
}

/** Fixed Host avatar shape presets mirrored for the Client picker (FR-005). */
const AVATAR_SHAPE_IDS = ['circle', 'square', 'triangle', 'hexagon'] as const satisfies readonly AvatarShapeId[]

/** Fixed Host avatar color presets mirrored for the Client picker (FR-005). */
const AVATAR_COLOR_IDS = ['blue', 'green', 'orange', 'purple', 'red', 'gray'] as const satisfies readonly AvatarColorId[]

function avatarShapeKey(shape: AvatarShapeId): TeamKey {
  switch (shape) {
    case 'circle': return 'avatarShape.circle'
    case 'square': return 'avatarShape.square'
    case 'triangle': return 'avatarShape.triangle'
    case 'hexagon': return 'avatarShape.hexagon'
  }
}

function avatarColorKey(color: AvatarColorId): TeamKey {
  switch (color) {
    case 'blue': return 'avatarColor.blue'
    case 'green': return 'avatarColor.green'
    case 'orange': return 'avatarColor.orange'
    case 'purple': return 'avatarColor.purple'
    case 'red': return 'avatarColor.red'
    case 'gray': return 'avatarColor.gray'
  }
}

/** Build a Host avatar marker from the picker draft, or undefined when neither axis is set. */
function avatarFromDraft(draft: AvatarDraft): AvatarMarker | undefined {
  if (draft.shape === '' && draft.color === '') return undefined
  return {
    ...draft.shape === '' ? {} : { shape: draft.shape },
    ...draft.color === '' ? {} : { color: draft.color },
  }
}

function items(value: string): string[] {
  return [...new Set(value.split(',').map(item => item.trim()).filter(Boolean))]
}

/** Split anti-jobs draft text into ordered non-empty lines (Host list items). */
function antiJobItems(value: string): string[] {
  return value.split(/\r?\n/u).map(item => item.trim()).filter(Boolean)
}

function taskIds(value: string): TeamTaskId[] {
  return items(value) as TeamTaskId[]
}

/**
 * One failure line for either carrier: a Remote failure, or a Team business
 * rejection whose codes stay local to this seam and never ride the wire.
 */
function failureText(error: { readonly code: string; readonly message: string }): string {
  return `${error.message} (${error.code})`
}

/** Host LLM credential-failure codes that offer in-app Models re-entry. */
const CREDENTIAL_REENTRY_CODES = new Set(['MISSING_CREDENTIAL', 'AUTH', 'INVALID_CREDENTIAL'])

function credentialReentryCopy(
  code: string,
  t: TeamActionProps['t'],
): string {
  switch (code) {
    case 'AUTH':
      return t('invalidCredential')
    case 'INVALID_CREDENTIAL':
      return t('invalidCredential')
    default:
      return t('missingCredential')
  }
}

/**
 * Trim and length limits match Host `requiredModelSelection`.
 * This browser bundle cannot import that Host module.
 */
const MODEL_ASSIGNMENT_MAX_LENGTH = 200

/** Stable key for one Verifier `(provider, model)` assignment. */
function assignmentKey(provider: string, model: string): string {
  return `${provider}\0${model}`
}

/**
 * Normalize one draft or roster pair the same way Host create trims ids.
 * @param provider - raw provider id.
 * @param model - raw model id.
 * @returns a comparison key, or undefined when either id is empty or longer than 200 characters.
 */
function comparableAssignment(provider: string, model: string): string | undefined {
  const trimmedProvider = provider.trim()
  const trimmedModel = model.trim()
  if (trimmedProvider.length === 0 || trimmedModel.length === 0) return undefined
  if (trimmedProvider.length > MODEL_ASSIGNMENT_MAX_LENGTH || trimmedModel.length > MODEL_ASSIGNMENT_MAX_LENGTH) {
    return undefined
  }
  return assignmentKey(trimmedProvider, trimmedModel)
}

/**
 * Collect distinct LLM `(provider, model)` keys from teammate rows that expose both ids.
 * The Lead row is omitted. A backend `provider` without `modelSelection` is not an assignment.
 * @param members - current TeamMemberView rows.
 * @returns set of assignment keys present on product bots.
 */
function rosterAssignmentKeys(members: readonly TeamRosterMember[]): Set<string> {
  const keys = new Set<string>()
  for (const member of members) {
    if (member.role !== 'teammate') continue
    const selection = member.modelSelection
    if (selection === undefined) continue
    const key = comparableAssignment(selection.provider, selection.model)
    if (key !== undefined) keys.add(key)
  }
  return keys
}

function statusKey(status: TeamTask['status']): TeamKey {
  switch (status) {
    case 'pending': return 'status.pending'
    case 'in_progress': return 'status.in_progress'
    case 'completed': return 'status.completed'
    /* v8 ignore next -- Team views omit deleted task tombstones. */
    case 'deleted': return 'status.completed'
  }
}

function memberStatusKey(status: TeamRosterMember['status']): TeamKey {
  switch (status) {
    case 'running': return 'memberStatus.running'
    case 'idle': return 'memberStatus.idle'
    case 'inactive': return 'memberStatus.inactive'
    case 'provisioning': return 'memberStatus.provisioning'
    case 'failed': return 'memberStatus.failed'
  }
}

function deliveryStateKey(state: TeamMailboxDeliveryState): TeamKey {
  switch (state) {
    case 'queued': return 'deliveryState.queued'
    case 'delivered': return 'deliveryState.delivered'
    case 'visible-pending': return 'deliveryState.visible-pending'
    case 'acted': return 'deliveryState.acted'
  }
}

/** Locale key for Host skill catalog source bucket (managed thin pack vs user). */
function skillSourceKey(source: SkillCatalogSummary['source']): TeamKey {
  switch (source) {
    case 'managed': return 'skillSourceManaged'
    case 'user': return 'skillSourceUser'
  }
}

/** Locale key for Host Routine status (active / paused). */
function routineStatusKey(status: RoutineStatus): TeamKey {
  switch (status) {
    case 'active': return 'routineStatus.active'
    case 'paused': return 'routineStatus.paused'
  }
}

/** Locale key for Host Routine triggerKind (cron / event) — pane distinguishability (T024). */
function routineTriggerKindKey(kind: RoutineTriggerKind): TeamKey {
  switch (kind) {
    case 'cron': return 'routineTrigger.cron'
    case 'event': return 'routineTrigger.event'
  }
}

/**
 * Pane last-run / fire-indicator copy for Host `lastRunAt` (P4 US4 T027 / FR-005).
 * Projects Host RoutineProjection only — never invents a Client fire clock.
 * Uses UTC ISO so the Client does not invent a locale clock.
 * @param lastRunAt - Host fire timestamp ms, or null before first fire.
 * @param t - locale lookup.
 * @returns last-run / fire-indicator copy for the routines pane row.
 */
function routineLastRunLabel(
  lastRunAt: number | null,
  t: TeamActionProps['t'],
): string {
  if (lastRunAt === null) return t('routineLastRunNever')
  return t('routineLastRun', { time: new Date(lastRunAt).toISOString() })
}

/** Fire-indicator discriminant from Host `lastRunAt` (never | fired). */
function routineFireIndicator(lastRunAt: number | null): 'never' | 'fired' {
  return lastRunAt === null ? 'never' : 'fired'
}

/** First text block from a Host mailbox body for the handoff list preview. */
function handoffBodyPreview(body: HostMailboxMessage['body']): string {
  for (const block of body) {
    if (block.type === 'text' && block.text.trim() !== '') return block.text
  }
  return ''
}

/** Resolve a Bot display label from the current Team roster when known. */
function memberLabel(
  members: readonly TeamRosterMember[],
  id: HostMailboxMessage['fromBotId'],
): string {
  const member = members.find(row => row.id === id)
  if (member === undefined) return id
  return member.displayName ?? member.name
}

/** Render the live Team roster, sidebar sections, Host mailbox handoffs, bot-create form, and task board. */
export function TeamAction({
  sessionId, load, createBot, updatePersona, renameBot, setAvatar, deleteBot,
  createSection, renameSection, assignSection, attachSkill, upsertUserSkill,
  createRoutine, pauseRoutine, resumeRoutine, writeMemory, listMemories,
  listConnectorCatalog, listConnectors, installConnector, authenticateConnector,
  describeConnectorCredential, invokeConnectorTool,
  getTrustPolicy, setStandingDeny, listPendingTrustApprovals, answerTrustApproval,
  subscribePendingTrustApprovals,
  createTask, updateTask, openTeammate, openModelsSettings, t,
}: TeamActionProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<TeamView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [credentialFailureCode, setCredentialFailureCode] = useState<string | null>(null)
  const [creatingBot, setCreatingBot] = useState(false)
  const [botDraft, setBotDraft] = useState<BotDraft>(EMPTY_BOT_DRAFT)
  const [editingPersona, setEditingPersona] = useState<SessionId | null>(null)
  const [personaDraft, setPersonaDraft] = useState<PersonaDraft>(EMPTY_PERSONA_DRAFT)
  const [editingRename, setEditingRename] = useState<SessionId | null>(null)
  const [renameDraft, setRenameDraft] = useState<RenameDraft>(EMPTY_RENAME_DRAFT)
  const [editingAvatar, setEditingAvatar] = useState<SessionId | null>(null)
  const [avatarDraft, setAvatarDraft] = useState<AvatarDraft>(EMPTY_AVATAR_DRAFT)
  /** Delete confirmation phase: null = idle; SessionId = pending-confirm (data-model.md). */
  const [pendingDelete, setPendingDelete] = useState<SessionId | null>(null)
  const [creatingSection, setCreatingSection] = useState(false)
  const [sectionDraft, setSectionDraft] = useState<SectionNameDraft>(EMPTY_SECTION_NAME_DRAFT)
  const [editingSectionId, setEditingSectionId] = useState<SidebarSectionId | null>(null)
  const [sectionRenameDraft, setSectionRenameDraft] = useState<SectionNameDraft>(EMPTY_SECTION_NAME_DRAFT)
  const [assigningBotId, setAssigningBotId] = useState<SessionId | null>(null)
  /** Bot whose Host attachSkill picker is open (per-bot skills surface; T023). */
  const [attachingBotId, setAttachingBotId] = useState<SessionId | null>(null)
  const [attachSkillDraft, setAttachSkillDraft] = useState<AttachSkillDraft>(EMPTY_ATTACH_SKILL_DRAFT)
  /** Host user-skill create form open (T029). */
  const [creatingSkill, setCreatingSkill] = useState(false)
  /** Host user-skill edit target id, or null when not editing (T029). */
  const [editingSkillId, setEditingSkillId] = useState<SkillId | null>(null)
  const [skillAuthorDraft, setSkillAuthorDraft] = useState<SkillAuthorDraft>(EMPTY_SKILL_AUTHOR_DRAFT)
  /** Bot whose Host createRoutine editor is open (US1 / T017). */
  const [creatingRoutineBotId, setCreatingRoutineBotId] = useState<SessionId | null>(null)
  const [createRoutineDraft, setCreateRoutineDraft] = useState<CreateRoutineDraft>(EMPTY_CREATE_ROUTINE_DRAFT)
  /** Bot whose Host writeMemory (profile|log|note) editor is open (P5 US1–US3 / T015+T018+T021). */
  const [writingMemoryBotId, setWritingMemoryBotId] = useState<SessionId | null>(null)
  const [writeMemoryDraft, setWriteMemoryDraft] = useState<WriteMemoryDraft>(EMPTY_WRITE_MEMORY_DRAFT)
  /** Browse layer filter on Bot memory panes (P5 US5 T028 — all | agent | user). */
  const [memoryBrowseLayerFilter, setMemoryBrowseLayerFilter] = useState<MemoryBrowseLayerFilter>(
    MEMORY_BROWSE_LAYER_FILTER_ALL,
  )
  /**
   * Thin Host connector catalog (P6 T019). Loaded via listConnectorCatalog —
   * not inventable from Electron Main or Client local store.
   */
  const [connectorCatalog, setConnectorCatalog] = useState<readonly ConnectorCatalogEntry[] | null>(null)
  /** True when Host listConnectorCatalog failed or returned empty (not silent success). */
  const [connectorCatalogUnavailable, setConnectorCatalogUnavailable] = useState(false)
  /** Connector whose in-app auth editor is open (P6 T020). */
  const [authenticatingConnectorId, setAuthenticatingConnectorId] = useState<ConnectorId | null>(null)
  const [connectorAuthDraft, setConnectorAuthDraft] = useState<ConnectorAuthDraft>(EMPTY_CONNECTOR_AUTH_DRAFT)
  /**
   * Last Host RPC tool outcomes keyed by connectorId (P6 T020).
   * Cleared on session switch; never a Client SoT for install/auth.
   */
  const [connectorToolOutcomes, setConnectorToolOutcomes] = useState<
    ReadonlyMap<ConnectorId, ConnectorToolOutcomeView>
  >(() => new Map())
  /**
   * Host trust policy (ask | never) for standing deny (P6 US3 T027).
   * Null until first Host getTrustPolicy settles; unavailable when Remote fails.
   */
  const [trustPolicy, setTrustPolicy] = useState<TrustPolicy | null>(null)
  /** True when Host trust Remotes failed or are missing (not silent success). */
  const [trustPolicyUnavailable, setTrustPolicyUnavailable] = useState(false)
  /** Pending Host HTTP approvals for the deny card (P6 US3 T027). */
  const [pendingTrustApprovals, setPendingTrustApprovals] = useState<readonly PendingTrustApproval[]>(
    [],
  )
  /**
   * Session-local instructional bodies from successful upserts (edit prefill).
   * Host catalog summaries omit body; this cache is Client-only for reopen/edit.
   */
  const [authoredBodies, setAuthoredBodies] = useState<ReadonlyMap<SkillId, string>>(() => new Map())
  /**
   * Session-active run indication for attached bot×skill pairs (clarify lock 4 / FR-004).
   * Client-local observability — does not require LLM reply text match.
   */
  const [sessionActiveSkills, setSessionActiveSkills] = useState<ReadonlySet<string>>(() => new Set())
  /**
   * Skills selected for attach (clarify lock 2 / FR-002): load = available-to-attach.
   * Client-local selection only — Host catalog owns persistence across restart.
   */
  const [availableToAttach, setAvailableToAttach] = useState<ReadonlySet<SkillId>>(() => new Set())
  const [creating, setCreating] = useState(false)
  const [createDraft, setCreateDraft] = useState<Draft>(EMPTY_DRAFT)
  const [editing, setEditing] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT)
  const [pendingTasks, setPendingTasks] = useState<ReadonlySet<string>>(() => new Set())
  const sessionRef = useRef(sessionId)
  const refreshGeneration = useRef(0)
  sessionRef.current = sessionId

  const clearError = useCallback((): void => {
    setError(null)
    setCredentialFailureCode(null)
  }, [])

  const reportFailure = useCallback((failure: { readonly code: string; readonly message: string }): void => {
    if (CREDENTIAL_REENTRY_CODES.has(failure.code)) {
      setError(credentialReentryCopy(failure.code, t))
      setCredentialFailureCode(failure.code)
      return
    }
    setError(failureText(failure))
    setCredentialFailureCode(null)
  }, [t])

  useEffect(() => {
    refreshGeneration.current += 1
    setOpen(false)
    setLoading(false)
    setView(null)
    clearError()
    setCreatingBot(false)
    setBotDraft(EMPTY_BOT_DRAFT)
    setEditingPersona(null)
    setPersonaDraft(EMPTY_PERSONA_DRAFT)
    setEditingRename(null)
    setRenameDraft(EMPTY_RENAME_DRAFT)
    setEditingAvatar(null)
    setAvatarDraft(EMPTY_AVATAR_DRAFT)
    setPendingDelete(null)
    setCreatingSection(false)
    setSectionDraft(EMPTY_SECTION_NAME_DRAFT)
    setEditingSectionId(null)
    setSectionRenameDraft(EMPTY_SECTION_NAME_DRAFT)
    setAssigningBotId(null)
    setAttachingBotId(null)
    setAttachSkillDraft(EMPTY_ATTACH_SKILL_DRAFT)
    setCreatingSkill(false)
    setEditingSkillId(null)
    setSkillAuthorDraft(EMPTY_SKILL_AUTHOR_DRAFT)
    setCreatingRoutineBotId(null)
    setCreateRoutineDraft(EMPTY_CREATE_ROUTINE_DRAFT)
    setWritingMemoryBotId(null)
    setWriteMemoryDraft(EMPTY_WRITE_MEMORY_DRAFT)
    setConnectorCatalog(null)
    setConnectorCatalogUnavailable(false)
    setAuthenticatingConnectorId(null)
    setConnectorAuthDraft(EMPTY_CONNECTOR_AUTH_DRAFT)
    setConnectorToolOutcomes(new Map())
    setTrustPolicy(null)
    setTrustPolicyUnavailable(false)
    setPendingTrustApprovals([])
    setAuthoredBodies(new Map())
    setSessionActiveSkills(new Set())
    setAvailableToAttach(new Set())
    setCreating(false)
    setCreateDraft(EMPTY_DRAFT)
    setEditing(null)
    setEditDraft(EMPTY_DRAFT)
    setPendingTasks(new Set())
  }, [clearError, sessionId])

  useEffect(() => {
    return subscribePendingTrustApprovals((approvals) => {
      setPendingTrustApprovals(approvals)
    })
  }, [subscribePendingTrustApprovals])


  const refresh = useCallback(async (): Promise<boolean> => {
    const requestedSession = sessionId
    const generation = ++refreshGeneration.current
    setLoading(true)
    const result = await load(requestedSession)
    if (sessionRef.current !== requestedSession || refreshGeneration.current !== generation) return false
    setLoading(false)
    if (result.ok) {
      setView(result.value)
      // Drop available-to-attach marks for skills no longer in the Host catalog.
      setAvailableToAttach((current) => {
        if (current.size === 0) return current
        const catalogIds = new Set(result.value.skills.map(skill => skill.id))
        let changed = false
        const next = new Set<SkillId>()
        for (const id of current) {
          if (catalogIds.has(id)) next.add(id)
          else changed = true
        }
        return changed ? next : current
      })
      clearError()
      // Host thin connector catalog (T019) — fail loud on empty / transport failure.
      const catalogResult = await listConnectorCatalog(requestedSession)
      if (sessionRef.current !== requestedSession || refreshGeneration.current !== generation) {
        return true
      }
      if (!catalogResult.ok) {
        setConnectorCatalog(null)
        setConnectorCatalogUnavailable(true)
        reportFailure(catalogResult.error)
      } else if (!catalogResult.value.ok) {
        setConnectorCatalog(null)
        setConnectorCatalogUnavailable(true)
        reportFailure(catalogResult.value.error)
      } else if (catalogResult.value.value.catalog.length === 0) {
        setConnectorCatalog([])
        setConnectorCatalogUnavailable(true)
      } else {
        setConnectorCatalog(catalogResult.value.value.catalog)
        setConnectorCatalogUnavailable(false)
      }
      // Host trust policy (T027) — fail loud when Remotes unavailable.
      const policyResult = await getTrustPolicy(requestedSession)
      if (sessionRef.current !== requestedSession || refreshGeneration.current !== generation) {
        return true
      }
      if (!policyResult.ok) {
        setTrustPolicy(null)
        setTrustPolicyUnavailable(true)
        reportFailure(policyResult.error)
      } else if (!policyResult.value.ok) {
        setTrustPolicy(null)
        setTrustPolicyUnavailable(true)
        reportFailure(policyResult.value.error)
      } else {
        setTrustPolicy(policyResult.value.value.policy)
        setTrustPolicyUnavailable(false)
      }
      const pending = await listPendingTrustApprovals(requestedSession)
      if (sessionRef.current !== requestedSession || refreshGeneration.current !== generation) {
        return true
      }
      setPendingTrustApprovals(pending)
      return true
    } else {
      reportFailure(result.error)
      return false
    }
  }, [
    clearError,
    getTrustPolicy,
    listConnectorCatalog,
    listPendingTrustApprovals,
    load,
    reportFailure,
    sessionId,
  ])

  /** Clarify lock 2 / FR-002: selecting a discovered skill makes it available to attach (no wizard). */
  const makeAvailableToAttach = useCallback((skillId: SkillId): void => {
    setAvailableToAttach((current) => {
      if (current.has(skillId)) return current
      const next = new Set(current)
      next.add(skillId)
      return next
    })
  }, [])

  const invalidateRefresh = useCallback((): void => {
    refreshGeneration.current += 1
    setLoading(false)
  }, [])

  const settleTask = useCallback(async (
    taskId: string,
    operation: () => Promise<TeamTaskActionResult>,
  ): Promise<TeamTask | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(taskId))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        if (result.value.error.code === 'team-task-conflict') {
          const reloaded = await refresh()
          if (sessionRef.current !== requestedSession) return undefined
          if (reloaded) {
            setError(t('conflict'))
            setCredentialFailureCode(null)
          }
        } else {
          reportFailure(result.value.error)
        }
        return undefined
      }
      const task = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return task
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(taskId)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId, t])

  const settleCreateBot = useCallback(async (
    operation: () => Promise<TeamCreateBotActionResult>,
  ): Promise<CreateBotResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add('create-bot'))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const created = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return created
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete('create-bot')
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleUpdatePersona = useCallback(async (
    botId: SessionId,
    operation: () => Promise<TeamUpdatePersonaActionResult>,
  ): Promise<UpdatePersonaResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`persona:${botId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        // Transport / Host-unavailable: keep prior durable persona in the loaded view.
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        // Team rejection: Host did not write; overview still shows prior durable fields.
        reportFailure(result.value.error)
        return undefined
      }
      const updated = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return updated
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`persona:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleRenameBot = useCallback(async (
    botId: SessionId,
    operation: () => Promise<TeamRenameBotActionResult>,
  ): Promise<RenameBotResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`rename:${botId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const updated = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return updated
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`rename:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleSetAvatar = useCallback(async (
    botId: SessionId,
    operation: () => Promise<TeamSetAvatarActionResult>,
  ): Promise<SetAvatarResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`avatar:${botId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const updated = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return updated
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`avatar:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleDeleteBot = useCallback(async (
    botId: SessionId,
    operation: () => Promise<TeamDeleteBotActionResult>,
  ): Promise<DeleteBotResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`delete:${botId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        // Transport / Host-unavailable: keep bot listed until a successful delete.
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        // Team rejection: Host did not remove; overview still lists the bot.
        reportFailure(result.value.error)
        return undefined
      }
      const deleted = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return deleted
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`delete:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleCreateSection = useCallback(async (
    operation: () => Promise<TeamCreateSectionActionResult>,
  ): Promise<CreateSectionResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add('create-section'))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const created = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return created
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete('create-section')
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleRenameSection = useCallback(async (
    sectionId: SidebarSectionId,
    operation: () => Promise<TeamRenameSectionActionResult>,
  ): Promise<RenameSectionResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`rename-section:${sectionId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const updated = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return updated
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`rename-section:${sectionId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleAssignSection = useCallback(async (
    botId: SessionId,
    operation: () => Promise<TeamAssignSectionActionResult>,
  ): Promise<AssignSectionResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`assign-section:${botId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const updated = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return updated
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`assign-section:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleAttachSkill = useCallback(async (
    botId: SessionId,
    operation: () => Promise<TeamAttachSkillActionResult>,
  ): Promise<AttachSkillResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`attach-skill:${botId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        // Transport / Host-unavailable: keep prior durable attachments in the loaded view.
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        // Team rejection: Host did not write; overview still shows prior attachments.
        reportFailure(result.value.error)
        return undefined
      }
      const attached = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return attached
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`attach-skill:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleCreateRoutine = useCallback(async (
    botId: SessionId,
    operation: () => Promise<TeamCreateRoutineActionResult>,
  ): Promise<CreateRoutineResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`create-routine:${botId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        // Transport / Host-unavailable: keep prior Host routines in the loaded view.
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        // Team rejection: Host did not write; pane still shows prior routines.
        reportFailure(result.value.error)
        return undefined
      }
      const created = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return created
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`create-routine:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleWriteMemory = useCallback(async (
    botId: SessionId,
    operation: () => Promise<TeamWriteMemoryActionResult>,
  ): Promise<WriteMemoryResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`write-memory:${botId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        // Transport / Host-unavailable: keep prior Host memories in the loaded view.
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        // Team rejection: Host did not write; pane still shows prior memories.
        reportFailure(result.value.error)
        return undefined
      }
      const written = result.value.value
      // Browse/return via Host listMemories Remote (same catalog as view.memories).
      const listed = await listMemories(requestedSession, { botId })
      if (sessionRef.current !== requestedSession) return undefined
      if (!listed.ok) {
        reportFailure(listed.error)
        return undefined
      }
      if (!listed.value.ok) {
        reportFailure(listed.value.error)
        return undefined
      }
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return written
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`write-memory:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, listMemories, refresh, reportFailure, sessionId])

  /**
   * Browse / recall Host listMemories for one bot after restart (P5 US4 T025 / FR-005 / SC-004).
   * Calls authenticated Host HTTP/WS only — never Electron Main IPC or transcript dump.
   * Reloads Team view so kinds remain distinguishable on the recall surface.
   */
  const settleBrowseMemories = useCallback(async (botId: SessionId): Promise<boolean> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`browse-memory:${botId}`))
    try {
      const listed = await listMemories(requestedSession, { botId })
      if (sessionRef.current !== requestedSession) return false
      if (!listed.ok) {
        reportFailure(listed.error)
        return false
      }
      if (!listed.value.ok) {
        reportFailure(listed.value.error)
        return false
      }
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return false
      return true
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`browse-memory:${botId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, listMemories, refresh, reportFailure, sessionId])

  const settleInstallConnector = useCallback(async (
    catalogId: string,
    operation: () => Promise<TeamInstallConnectorActionResult>,
  ): Promise<InstallConnectorResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`install-connector:${catalogId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const installed = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return installed
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`install-connector:${catalogId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleAuthenticateConnector = useCallback(async (
    connectorId: ConnectorId,
    operation: () => Promise<TeamAuthenticateConnectorActionResult>,
  ): Promise<AuthenticateConnectorResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`auth-connector:${connectorId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const authenticated = result.value.value
      const described = await describeConnectorCredential(requestedSession, { connectorId })
      if (sessionRef.current !== requestedSession) return undefined
      if (!described.ok) {
        reportFailure(described.error)
        return undefined
      }
      if (!described.value.ok) {
        reportFailure(described.value.error)
        return undefined
      }
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return authenticated
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`auth-connector:${connectorId}`)
          return next
        })
      }
    }
  }, [
    clearError, describeConnectorCredential, invalidateRefresh, refresh, reportFailure, sessionId,
  ])

  const settleInvokeConnectorTool = useCallback(async (
    connectorId: ConnectorId,
    operation: () => Promise<TeamInvokeConnectorToolActionResult>,
  ): Promise<ConnectorToolCall | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`invoke-connector:${connectorId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      // Host InvokeConnectorToolResult = { toolCall }; unwrap before panel projection.
      const toolCall = result.value.value.toolCall
      setConnectorToolOutcomes((current) => {
        const next = new Map(current)
        next.set(connectorId, { toolName: toolCall.toolName, outcome: toolCall.outcome })
        return next
      })
      const listed = await listConnectors(requestedSession)
      if (sessionRef.current !== requestedSession) return undefined
      if (!listed.ok) {
        reportFailure(listed.error)
        return undefined
      }
      if (!listed.value.ok) {
        reportFailure(listed.value.error)
        return undefined
      }
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return toolCall
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`invoke-connector:${connectorId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, listConnectors, refresh, reportFailure, sessionId])

  const settleStandingDeny = useCallback(async (
    enabled: boolean,
  ): Promise<TrustPolicy | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add('standing-deny'))
    try {
      const result = await setStandingDeny(requestedSession, { enabled })
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        reportFailure(result.value.error)
        return undefined
      }
      const policy = result.value.value.policy
      setTrustPolicy(policy)
      setTrustPolicyUnavailable(false)
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return policy
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete('standing-deny')
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId, setStandingDeny])

  const settleAnswerTrustApproval = useCallback(async (
    input: AnswerTrustApprovalInput,
  ): Promise<AnswerTrustApprovalResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`answer-trust:${input.requestId}`))
    try {
      const answered = await answerTrustApproval(requestedSession, input)
      if (sessionRef.current !== requestedSession) return undefined
      clearError()
      const pending = await listPendingTrustApprovals(requestedSession)
      if (sessionRef.current !== requestedSession) return undefined
      setPendingTrustApprovals(pending)
      return answered
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`answer-trust:${input.requestId}`)
          return next
        })
      }
    }
  }, [
    answerTrustApproval, clearError, invalidateRefresh, listPendingTrustApprovals, sessionId,
  ])

  const settleRoutineStatus = useCallback(async (
    routineId: RoutineId,
    operation: () => Promise<TeamPauseRoutineActionResult | TeamResumeRoutineActionResult>,
  ): Promise<PauseRoutineResult | ResumeRoutineResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add(`routine-status:${routineId}`))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        // Transport / Host-unavailable: keep prior Host status in the loaded view.
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        // Team rejection: Host did not write; pane still shows prior status.
        reportFailure(result.value.error)
        return undefined
      }
      const updated = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return updated
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete(`routine-status:${routineId}`)
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const settleUpsertUserSkill = useCallback(async (
    operation: () => Promise<TeamUpsertUserSkillActionResult>,
  ): Promise<UpsertUserSkillResult | undefined> => {
    const requestedSession = sessionId
    invalidateRefresh()
    setPendingTasks(current => new Set(current).add('upsert-user-skill'))
    try {
      const result = await operation()
      if (sessionRef.current !== requestedSession) return undefined
      if (!result.ok) {
        reportFailure(result.error)
        return undefined
      }
      if (!result.value.ok) {
        // Host empty-reject / author failure: clear reason; catalog unchanged.
        reportFailure(result.value.error)
        return undefined
      }
      const authored = result.value.value
      clearError()
      await refresh()
      if (sessionRef.current !== requestedSession) return undefined
      return authored
    } finally {
      if (sessionRef.current === requestedSession) {
        setPendingTasks((current) => {
          const next = new Set(current)
          next.delete('upsert-user-skill')
          return next
        })
      }
    }
  }, [clearError, invalidateRefresh, refresh, reportFailure, sessionId])

  const submitCreateBot = async (): Promise<void> => {
    const displayName = botDraft.displayName.trim()
    const provider = botDraft.provider.trim()
    const model = botDraft.model.trim()
    /* v8 ignore next -- BotCreateForm disables Save while any normalized field is empty. */
    if (displayName === '' || provider === '' || model === '') return
    const created = await settleCreateBot(() => createBot(sessionId, {
      displayName,
      modelSelection: { provider, model },
    }))
    if (created === undefined) return
    setBotDraft(EMPTY_BOT_DRAFT)
    setCreatingBot(false)
  }

  const startEditPersona = (member: TeamRosterMember): void => {
    setEditingPersona(member.id)
    setPersonaDraft({
      job: member.persona?.job ?? '',
      voice: member.persona?.voice ?? '',
      antiJobs: member.persona?.antiJobs.join('\n') ?? '',
    })
    setEditingRename(null)
    setEditingAvatar(null)
    setPendingDelete(null)
    setAssigningBotId(null)
    setAttachingBotId(null)
    setCreatingRoutineBotId(null)
    setWritingMemoryBotId(null)
  }

  const submitPersona = async (member: TeamRosterMember): Promise<void> => {
    const saved = await settleUpdatePersona(member.id, () => updatePersona(sessionId, {
      botId: member.id,
      job: personaDraft.job,
      voice: personaDraft.voice,
      antiJobs: antiJobItems(personaDraft.antiJobs),
    }))
    if (saved === undefined) return
    setEditingPersona(null)
    setPersonaDraft(EMPTY_PERSONA_DRAFT)
  }

  const startRename = (member: TeamRosterMember): void => {
    setEditingRename(member.id)
    setRenameDraft({ displayName: member.displayName ?? member.name })
    setEditingAvatar(null)
    setEditingPersona(null)
    setPendingDelete(null)
    setAssigningBotId(null)
    setAttachingBotId(null)
    setCreatingRoutineBotId(null)
    setWritingMemoryBotId(null)
  }

  const submitRename = async (member: TeamRosterMember): Promise<void> => {
    const displayName = renameDraft.displayName.trim()
    /* v8 ignore next -- RenameForm disables Save while the normalized name is empty. */
    if (displayName === '') return
    const saved = await settleRenameBot(member.id, () => renameBot(sessionId, {
      botId: member.id,
      displayName,
    }))
    if (saved === undefined) return
    setEditingRename(null)
    setRenameDraft(EMPTY_RENAME_DRAFT)
  }

  const startEditAvatar = (member: TeamRosterMember): void => {
    setEditingAvatar(member.id)
    setAvatarDraft({
      shape: member.avatar?.shape ?? '',
      color: member.avatar?.color ?? '',
    })
    setEditingRename(null)
    setEditingPersona(null)
    setPendingDelete(null)
    setAssigningBotId(null)
    setAttachingBotId(null)
    setCreatingRoutineBotId(null)
    setWritingMemoryBotId(null)
  }

  const submitAvatar = async (member: TeamRosterMember): Promise<void> => {
    const avatar = avatarFromDraft(avatarDraft)
    /* v8 ignore next -- AvatarForm disables Save while neither preset axis is set. */
    if (avatar === undefined) return
    const saved = await settleSetAvatar(member.id, () => setAvatar(sessionId, {
      botId: member.id,
      avatar,
    }))
    if (saved === undefined) return
    setEditingAvatar(null)
    setAvatarDraft(EMPTY_AVATAR_DRAFT)
  }

  /** Enter pending-confirm; Host deleteBot is not called until confirm (FR-007). */
  const startDelete = (member: TeamRosterMember): void => {
    setPendingDelete(member.id)
    setEditingRename(null)
    setEditingAvatar(null)
    setEditingPersona(null)
    setAssigningBotId(null)
    setAttachingBotId(null)
    setCreatingRoutineBotId(null)
    setWritingMemoryBotId(null)
  }

  /** Cancel / dismiss confirm → idle with profile unchanged (data-model cancelled → idle). */
  const cancelDelete = (): void => {
    setPendingDelete(null)
  }

  const confirmDelete = async (member: TeamRosterMember): Promise<void> => {
    const deleted = await settleDeleteBot(member.id, () => deleteBot(sessionId, {
      botId: member.id,
    }))
    if (deleted === undefined) return
    setPendingDelete(null)
  }

  const submitCreateSection = async (): Promise<void> => {
    const name = sectionDraft.name.trim()
    /* v8 ignore next -- SectionNameForm disables Save while the normalized name is empty. */
    if (name === '') return
    const created = await settleCreateSection(() => createSection(sessionId, { name }))
    if (created === undefined) return
    setSectionDraft(EMPTY_SECTION_NAME_DRAFT)
    setCreatingSection(false)
  }

  const startRenameSection = (section: SidebarSectionView): void => {
    setEditingSectionId(section.id)
    setSectionRenameDraft({ name: section.name })
    setCreatingSection(false)
    setAssigningBotId(null)
  }

  const submitRenameSection = async (section: SidebarSectionView): Promise<void> => {
    const name = sectionRenameDraft.name.trim()
    /* v8 ignore next -- SectionNameForm disables Save while the normalized name is empty. */
    if (name === '') return
    const saved = await settleRenameSection(section.id, () => renameSection(sessionId, {
      sectionId: section.id,
      name,
    }))
    if (saved === undefined) return
    setEditingSectionId(null)
    setSectionRenameDraft(EMPTY_SECTION_NAME_DRAFT)
  }

  const startAssignSection = (member: TeamRosterMember): void => {
    setAssigningBotId(member.id)
    setEditingRename(null)
    setEditingAvatar(null)
    setEditingPersona(null)
    setPendingDelete(null)
    setEditingSectionId(null)
    setAttachingBotId(null)
    setCreatingRoutineBotId(null)
    setWritingMemoryBotId(null)
  }

  const submitAssignSection = async (
    member: TeamRosterMember,
    sectionId: SidebarSectionId | null,
  ): Promise<void> => {
    const saved = await settleAssignSection(member.id, () => assignSection(sessionId, {
      botId: member.id,
      sectionId,
    }))
    if (saved === undefined) return
    setAssigningBotId(null)
  }

  const startAttachSkill = (member: TeamRosterMember): void => {
    setAttachingBotId(member.id)
    setAttachSkillDraft(EMPTY_ATTACH_SKILL_DRAFT)
    setEditingRename(null)
    setEditingAvatar(null)
    setEditingPersona(null)
    setPendingDelete(null)
    setAssigningBotId(null)
    setEditingSectionId(null)
    setCreatingRoutineBotId(null)
    setWritingMemoryBotId(null)
    setCreateRoutineDraft(EMPTY_CREATE_ROUTINE_DRAFT)
  }

  const submitAttachSkill = async (member: TeamRosterMember): Promise<void> => {
    const skillId = attachSkillDraft.skillId
    /* v8 ignore next -- AttachSkillForm disables Save while no skill is selected. */
    if (skillId === '') return
    const saved = await settleAttachSkill(member.id, () => attachSkill(sessionId, {
      botId: member.id,
      skillId,
    }))
    if (saved === undefined) return
    setAttachingBotId(null)
    setAttachSkillDraft(EMPTY_ATTACH_SKILL_DRAFT)
  }

  const startCreateRoutine = (member: TeamRosterMember): void => {
    setCreatingRoutineBotId(member.id)
    setCreateRoutineDraft(EMPTY_CREATE_ROUTINE_DRAFT)
    setWritingMemoryBotId(null)
    setWriteMemoryDraft(EMPTY_WRITE_MEMORY_DRAFT)
    setAttachingBotId(null)
    setAttachSkillDraft(EMPTY_ATTACH_SKILL_DRAFT)
    setEditingRename(null)
    setEditingAvatar(null)
    setEditingPersona(null)
    setPendingDelete(null)
    setAssigningBotId(null)
    setEditingSectionId(null)
  }

  /**
   * Host createRoutine in bot context (P4 FR-001 / SC-007 / T017; P6 US2 T024 event).
   * Cron: empty intent or schedule reject Client-side. Event: empty intent reject; Pass family webhook_harness.
   * Host rejects leave catalog unchanged. No confirm step and no separate displayName.
   */
  const submitCreateRoutine = async (member: TeamRosterMember): Promise<void> => {
    const intent = createRoutineDraft.intent.trim()
    const triggerKind = createRoutineDraft.triggerKind
    if (triggerKind === 'event') {
      /* v8 ignore next -- CreateRoutineForm disables Save while intent is empty for event. */
      if (intent === '') return
      const saved = await settleCreateRoutine(member.id, () => createRoutine(sessionId, {
        botId: member.id,
        intent,
        triggerKind: 'event',
        eventTrigger: createRoutineDraft.eventTrigger,
      }))
      if (saved === undefined) return
    } else {
      const scheduleExpr = createRoutineDraft.scheduleExpr.trim()
      /* v8 ignore next -- CreateRoutineForm disables Save while either normalized field is empty. */
      if (intent === '' || scheduleExpr === '') return
      const saved = await settleCreateRoutine(member.id, () => createRoutine(sessionId, {
        botId: member.id,
        intent,
        scheduleExpr,
        triggerKind: 'cron',
      }))
      if (saved === undefined) return
    }
    setCreatingRoutineBotId(null)
    setWritingMemoryBotId(null)
    setCreateRoutineDraft(EMPTY_CREATE_ROUTINE_DRAFT)
  }

  const startWriteMemory = (member: TeamRosterMember): void => {
    setWritingMemoryBotId(member.id)
    setWriteMemoryDraft(EMPTY_WRITE_MEMORY_DRAFT)
    setCreatingRoutineBotId(null)
    setCreateRoutineDraft(EMPTY_CREATE_ROUTINE_DRAFT)
    setAttachingBotId(null)
    setAttachSkillDraft(EMPTY_ATTACH_SKILL_DRAFT)
    setEditingRename(null)
    setEditingAvatar(null)
    setEditingPersona(null)
    setPendingDelete(null)
    setAssigningBotId(null)
    setEditingSectionId(null)
  }

  /**
   * Host writeMemory profile|log|note fact in bot context (P5 FR-001–FR-003 / T015+T018+T021).
   * Empty content rejects Client-side; kind and layer are required; layer is orthogonal (FR-017).
   * Agent layer requires this botId; user layer omits botId (account-wide).
   * Calls authenticated Host HTTP/WS only — never Electron Main IPC.
   */
  const submitWriteMemory = async (member: TeamRosterMember): Promise<void> => {
    const kind = writeMemoryDraft.kind
    const content = writeMemoryDraft.content.trim()
    const layer = writeMemoryDraft.layer
    /* v8 ignore next -- WriteMemoryForm disables Save while kind, content, or layer is empty. */
    if (kind === '' || content === '' || layer === '') return
    const saved = await settleWriteMemory(member.id, () => writeMemory(sessionId, {
      kind,
      layer,
      content,
      ...layer === 'agent' ? { botId: member.id } : { botId: null },
    }))
    if (saved === undefined) return
    setWritingMemoryBotId(null)
    setWriteMemoryDraft(EMPTY_WRITE_MEMORY_DRAFT)
  }

  /**
   * Host listMemories browse / recall for one bot after restart (P5 US4 T025 / FR-005).
   * Projects Host catalog rows with kinds distinguishable; never transcript dump.
   */
  const submitBrowseMemories = async (member: TeamRosterMember): Promise<void> => {
    await settleBrowseMemories(member.id)
  }

  /**
   * Host installConnector for one thin-catalog / fixture entry (P6 T019 / FR-001 / FR-017).
   * Available ≠ installed; calls authenticated Host HTTP/WS only — never Electron Main IPC.
   */
  const submitInstallConnector = async (catalogId: string): Promise<void> => {
    await settleInstallConnector(catalogId, () => installConnector(sessionId, { catalogId }))
  }

  /** Open in-app connector credential editor (P6 T020 / T031 / FR-002 / FR-008). */
  const startAuthenticateConnector = (connector: ConnectorProjection): void => {
    setAuthenticatingConnectorId(connector.connectorId)
    setConnectorAuthDraft(EMPTY_CONNECTOR_AUTH_DRAFT)
  }

  /**
   * Host authenticateConnector with in-app secret (P6 T020 / T031 / FR-008 / FR-009).
   * Empty secret rejects Client-side; secret is Host-RPC-only and cleared from draft on success.
   * Vault / 1Password-class is not required when this path completes Pass fixture auth.
   */
  const submitAuthenticateConnector = async (connectorId: ConnectorId): Promise<void> => {
    const secret = connectorAuthDraft.secret.trim()
    /* v8 ignore next -- ConnectorAuthForm disables Save while secret is empty. */
    if (secret === '') return
    const saved = await settleAuthenticateConnector(connectorId, () => authenticateConnector(sessionId, {
      connectorId,
      secret,
    }))
    if (saved === undefined) return
    setAuthenticatingConnectorId(null)
    setConnectorAuthDraft(EMPTY_CONNECTOR_AUTH_DRAFT)
  }

  /**
   * Host RPC connector tool invoke for user-visible success (P6 T020 / FR-003 / FR-016).
   * Requires authState=ready; outcome indicator does not score LLM wording.
   */
  const submitInvokeConnectorTool = async (connectorId: ConnectorId): Promise<void> => {
    await settleInvokeConnectorTool(connectorId, () => invokeConnectorTool(sessionId, { connectorId }))
  }

  /**
   * Host setStandingDeny — standing never / ask (P6 US3 T027 / FR-006 Path B).
   * Answers on Host HTTP only; Electron Main does not own the trust bus.
   */
  const submitStandingDeny = async (enabled: boolean): Promise<void> => {
    await settleStandingDeny(enabled)
  }

  /**
   * Host HTTP answerer deny/allow for the Team approval card (P6 US3 T027 Path A).
   */
  const submitAnswerTrustApproval = async (
    requestId: string,
    decision: AnswerTrustApprovalInput['decision'],
  ): Promise<void> => {
    await settleAnswerTrustApproval({ requestId, decision })
  }

  /**
   * Host pauseRoutine for one listed active routine (P4 FR-003 / SC-002 / T023).
   * Calls authenticated Host HTTP/WS only — never Electron Main IPC.
   */
  const submitPauseRoutine = async (routineId: RoutineId): Promise<void> => {
    await settleRoutineStatus(routineId, () => pauseRoutine(sessionId, { routineId }))
  }

  /**
   * Host resumeRoutine for one listed paused routine (P4 FR-004 / SC-002 / T023).
   * Calls authenticated Host HTTP/WS only — never Electron Main IPC.
   */
  const submitResumeRoutine = async (routineId: RoutineId): Promise<void> => {
    await settleRoutineStatus(routineId, () => resumeRoutine(sessionId, { routineId }))
  }

  /** Dedicated run control: mark attached skill session-active on this bot (FR-004). */
  const markSkillSessionActive = (botId: SessionId, skillId: SkillId): void => {
    setSessionActiveSkills((current) => {
      const key = skillSessionActiveKey(botId, skillId)
      if (current.has(key)) return current
      const next = new Set(current)
      next.add(key)
      return next
    })
  }

  const startCreateSkill = (): void => {
    setCreatingSkill(true)
    setEditingSkillId(null)
    setSkillAuthorDraft(EMPTY_SKILL_AUTHOR_DRAFT)
  }

  const startEditSkill = (skill: SkillCatalogSummary): void => {
    /* v8 ignore next -- Edit is only rendered for user-source catalog rows. */
    if (skill.source !== 'user') return
    setEditingSkillId(skill.id)
    setCreatingSkill(false)
    setSkillAuthorDraft({
      displayName: skill.displayName,
      instructionalBody: authoredBodies.get(skill.id) ?? '',
    })
  }

  const cancelSkillAuthor = (): void => {
    setCreatingSkill(false)
    setEditingSkillId(null)
    setSkillAuthorDraft(EMPTY_SKILL_AUTHOR_DRAFT)
  }

  /**
   * Host upsertUserSkill create/edit (FR-006 / FR-013 / T029).
   * Empty name or body reject Client-side with clear copy; Host rejects do not invent catalog rows.
   * Success refreshes discovery and marks the skill available-to-attach (T030).
   */
  const submitSkillAuthor = async (): Promise<void> => {
    const displayName = skillAuthorDraft.displayName.trim()
    const instructionalBody = skillAuthorDraft.instructionalBody.trim()
    /* v8 ignore next -- SkillAuthorForm disables Save while either normalized field is empty. */
    if (displayName === '' || instructionalBody === '') return
    const saved = await settleUpsertUserSkill(() => upsertUserSkill(sessionId, {
      ...editingSkillId === null ? {} : { skillId: editingSkillId },
      displayName,
      instructionalBody,
    }))
    if (saved === undefined) return
    setAuthoredBodies((current) => {
      const next = new Map(current)
      next.set(saved.skill.id, instructionalBody)
      return next
    })
    // T030: authored user skills enter discovery via refresh and behave like managed for attach/run.
    makeAvailableToAttach(saved.skill.id)
    cancelSkillAuthor()
  }

  const submitCreate = async (): Promise<void> => {
    const subject = createDraft.subject.trim()
    const description = createDraft.description.trim()
    /* v8 ignore next -- TaskForm disables Save while either normalized field is empty. */
    if (subject === '' || description === '') return
    const created = await settleTask('create', () => createTask(sessionId, {
      subject,
      description,
      blockedBy: taskIds(createDraft.blockers),
      writeScopes: items(createDraft.scopes),
    }))
    if (created === undefined) return
    setCreateDraft(EMPTY_DRAFT)
    setCreating(false)
  }

  const startEdit = (task: TeamTask): void => {
    setEditing(task.id)
    setEditDraft({
      subject: task.subject,
      description: task.description,
      blockers: task.blockedBy.join(', '),
      scopes: task.writeScopes.join(', '),
    })
  }

  const submitEdit = async (task: TeamTask): Promise<void> => {
    const requestedSession = sessionId
    const edited = await settleTask(task.id, () => updateTask(requestedSession, {
      taskId: task.id,
      expectedRevision: task.revision,
      action: 'edit',
      subject: editDraft.subject.trim(),
      description: editDraft.description.trim(),
      writeScopes: items(editDraft.scopes),
    }))
    if (edited === undefined) return
    const blockedBy = taskIds(editDraft.blockers)
    if (blockedBy.length === edited.blockedBy.length
      && blockedBy.every((blocker, index) => blocker === edited.blockedBy[index])) {
      setEditing(null)
      return
    }
    const dependencyTask = await settleTask(task.id, () => updateTask(requestedSession, {
      taskId: task.id,
      expectedRevision: edited.revision,
      action: 'set_dependencies',
      blockedBy,
    }))
    if (dependencyTask === undefined) return
    setEditing(null)
  }

  const teammates = view?.members.filter(member => member.role === 'teammate') ?? []
  const assignable = view?.members.filter(member => member.status !== 'failed' && member.status !== 'provisioning') ?? []
  const assignmentKeys = view === null ? new Set<string>() : rosterAssignmentKeys(view.members)
  const membersById = view === null
    ? new Map<SessionId, TeamRosterMember>()
    : new Map(view.members.map(member => [member.id, member]))

  const renderMemberCard = (member: TeamRosterMember): ReactNode => {
    const antiJobs = member.persona?.antiJobs ?? []
    const canEditIdentity = member.role === 'teammate'
      && member.status !== 'failed'
      && member.status !== 'provisioning'
    const personaPending = pendingTasks.has(`persona:${member.id}`)
    const renamePending = pendingTasks.has(`rename:${member.id}`)
    const avatarPending = pendingTasks.has(`avatar:${member.id}`)
    const deletePending = pendingTasks.has(`delete:${member.id}`)
    const assignPending = pendingTasks.has(`assign-section:${member.id}`)
    const attachPending = pendingTasks.has(`attach-skill:${member.id}`)
    const createRoutinePending = pendingTasks.has(`create-routine:${member.id}`)
    const writeMemoryPending = pendingTasks.has(`write-memory:${member.id}`)
    const browseMemoryPending = pendingTasks.has(`browse-memory:${member.id}`)
    const confirmPending = pendingDelete === member.id
    const assignOpen = assigningBotId === member.id
    const attachOpen = attachingBotId === member.id
    const createRoutineOpen = creatingRoutineBotId === member.id
    const writeMemoryOpen = writingMemoryBotId === member.id
    const attachments = member.skillAttachments ?? []
    const botRoutines = view === null
      ? []
      : view.routines.filter((routine: RoutineProjection) => routine.botId === member.id)
    const botMemories = view === null
      ? []
      : memoriesForBrowseLayer(
        memoriesForBot(view.memories ?? [], member.id),
        memoryBrowseLayerFilter,
      )
    const memoryInject = view === null ? null : memoryRecallInjectForBot(view, member.id)
    const identityBusy = personaPending || renamePending || avatarPending
      || deletePending || assignPending || attachPending || createRoutinePending
      || writeMemoryPending || browseMemoryPending
      || botRoutines.some(routine => pendingTasks.has(`routine-status:${routine.routineId}`))
    const catalogById = view === null
      ? new Map<SkillId, SkillCatalogSummary>()
      : new Map(view.skills.map(skill => [skill.id, skill]))
    const attachCandidates = view === null
      ? []
      : view.skills.filter(skill => availableToAttach.has(skill.id))
    return (
      <div
        key={member.id}
        className={css.memberCard}
        data-team-member={member.id}
        data-section-id={member.sectionId ?? ''}
      >
        <button
          type="button"
          className={css.member}
          disabled={member.role === 'lead' || member.status === 'failed' || member.status === 'provisioning'}
          title={member.role === 'teammate' ? t('open') : undefined}
          onClick={() => {
            void openTeammate(sessionId, member).catch((reason: unknown) => {
              setError(String(reason))
              setCredentialFailureCode(null)
            })
          }}
        >
          {member.avatar !== undefined && (
            <span
              className={css.avatarMarker}
              data-team-avatar=""
              data-avatar-shape={member.avatar.shape ?? ''}
              data-avatar-color={member.avatar.color ?? ''}
              title={[
                member.avatar.shape === undefined ? null : t(avatarShapeKey(member.avatar.shape)),
                member.avatar.color === undefined ? null : t(avatarColorKey(member.avatar.color)),
              ].filter(Boolean).join(' · ')}
              aria-label={[
                member.avatar.shape === undefined ? null : t(avatarShapeKey(member.avatar.shape)),
                member.avatar.color === undefined ? null : t(avatarColorKey(member.avatar.color)),
              ].filter(Boolean).join(' · ')}
            />
          )}
          <StateDot state={member.status === 'running' ? 'ongoing' : member.status === 'failed' ? 'error' : 'done'} />
          <span className={css.memberText}>
            <span data-team-display-name>{member.displayName ?? member.name}</span>
            <small>
              {member.displayName !== undefined ? `${member.name} · ` : ''}
              {t(memberStatusKey(member.status))}
              {member.modelSelection !== undefined
                ? ` · ${t('model')}: ${member.modelSelection.provider}/${member.modelSelection.model}`
                : member.model === undefined ? '' : ` · ${t('model')}: ${member.model}`}
            </small>
            {member.diagnostics.map(diagnostic => <small key={diagnostic} className={css.diagnostic}>{diagnostic}</small>)}
          </span>
        </button>
        {antiJobs.length > 0 && (
          <div className={css.antiJobs} data-team-anti-jobs>
            <span className={css.antiJobsLabel}>{t('antiJobs')}</span>
            <ul>
              {antiJobs.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {member.role === 'teammate' && (
          <div
            className={css.botSkills}
            data-team-bot-skills={member.id}
          >
            <div className={css.botSkillsHeader}>
              <span className={css.botSkillsLabel}>{t('botSkills')}</span>
            </div>
            <p className={css.hint}>{t('botSkillsHint')}</p>
            {attachments.length === 0
              ? <div className={css.notice} data-team-bot-skills-empty={member.id}>{t('botSkillsEmpty')}</div>
              : (
                <ul className={css.botSkillsList} data-team-bot-skills-list={member.id}>
                  {attachments.map((attachment: SkillAttachment) => {
                    const catalog = catalogById.get(attachment.skillId)
                    const active = sessionActiveSkills.has(
                      skillSessionActiveKey(member.id, attachment.skillId),
                    )
                    const label = catalog?.displayName ?? attachment.skillId
                    return (
                      <li
                        key={`${attachment.botId}:${attachment.skillId}:${attachment.attachedAt ?? ''}`}
                        className={css.botSkillRow}
                        data-team-bot-skill={attachment.skillId}
                        data-skill-active={active ? 'true' : 'false'}
                      >
                        <span data-team-bot-skill-label>{label}</span>
                        <span className={css.botSkillAttached}>{t('skillAttached')}</span>
                        {active
                          ? (
                            <span
                              className={css.skillActiveBadge}
                              data-team-skill-active={attachment.skillId}
                            >
                              <IconCheckOutline14 /> {t('skillActive')}
                            </span>
                          )
                          : (
                            <button
                              type="button"
                              className={css.personaButton}
                              data-team-skill-run={attachment.skillId}
                              onClick={() => { markSkillSessionActive(member.id, attachment.skillId) }}
                            >
                              {t('skillRun')}
                            </button>
                          )}
                      </li>
                    )
                  })}
                </ul>
              )}
            {attachments.length > 0 && (
              <p className={css.hint} data-team-skill-active-hint="">{t('skillActiveHint')}</p>
            )}
            {canEditIdentity && attachOpen && (
              <AttachSkillForm
                draft={attachSkillDraft}
                setDraft={setAttachSkillDraft}
                candidates={attachCandidates}
                pending={attachPending}
                onSave={() => { void submitAttachSkill(member) }}
                onCancel={() => {
                  setAttachingBotId(null)
                  setAttachSkillDraft(EMPTY_ATTACH_SKILL_DRAFT)
                }}
                t={t}
              />
            )}
            {canEditIdentity && !attachOpen
              && !createRoutineOpen
              && !writeMemoryOpen
              && editingRename !== member.id
              && editingAvatar !== member.id
              && editingPersona !== member.id
              && !confirmPending
              && !assignOpen && (
              <button
                type="button"
                className={css.personaButton}
                disabled={identityBusy}
                data-team-attach-skill={member.id}
                onClick={() => { startAttachSkill(member) }}
              >
                <IconPlusOutline16 size={13} /> {t('attachSkill')}
              </button>
            )}
          </div>
        )}
        {member.role === 'teammate' && (
          <div
            className={css.botRoutines}
            data-team-bot-routines={member.id}
            data-team-routines-pane={member.id}
          >
            <div className={css.botRoutinesHeader}>
              <span className={css.botRoutinesLabel}>{t('botRoutines')}</span>
            </div>
            <p className={css.hint} data-team-bot-routines-hint="">{t('botRoutinesHint')}</p>
            <p className={css.hint} data-team-bot-routines-fire-hint="">{t('routineFireHint')}</p>
            {botRoutines.length === 0
              ? <div className={css.notice} data-team-bot-routines-empty={member.id}>{t('botRoutinesEmpty')}</div>
              : (
                <ul className={css.botRoutinesList} data-team-bot-routines-list={member.id}>
                  {botRoutines.map((routine: RoutineProjection) => {
                    const statusPending = pendingTasks.has(`routine-status:${routine.routineId}`)
                    const fireIndicator = routineFireIndicator(routine.lastRunAt)
                    return (
                      <li
                        key={routine.routineId}
                        className={css.botRoutineRow}
                        data-team-routine={routine.routineId}
                        data-team-routine-status={routine.status}
                        data-team-routine-trigger-kind={routine.triggerKind}
                        data-team-routine-schedule-expr={routine.scheduleExpr}
                        {...routine.eventTrigger !== undefined
                          ? { 'data-team-routine-event-trigger': routine.eventTrigger }
                          : {}}
                        data-team-routine-fire-indicator={fireIndicator}
                      >
                        <span data-team-routine-identity>{routine.identity}</span>
                        <span
                          className={css.botRoutineTriggerKind}
                          data-team-routine-trigger-kind-label={routine.triggerKind}
                        >
                          {t(routineTriggerKindKey(routine.triggerKind))}
                        </span>
                        <span
                          className={css.botRoutineMeta}
                          data-team-routine-schedule=""
                        >
                          {routine.scheduleLabel}
                        </span>
                        <span
                          className={
                            routine.status === 'paused'
                              ? css.botRoutineStatusPaused
                              : css.botRoutineStatusActive
                          }
                          data-team-routine-status-label=""
                        >
                          {t(routineStatusKey(routine.status))}
                        </span>
                        <span
                          className={
                            fireIndicator === 'fired'
                              ? css.botRoutineLastRunFired
                              : css.botRoutineLastRunNever
                          }
                          data-team-routine-last-run={
                            routine.lastRunAt === null ? 'never' : String(routine.lastRunAt)
                          }
                          data-team-routine-fire-indicator={fireIndicator}
                          title={t('routineFireHint')}
                        >
                          <StateDot
                            state={fireIndicator === 'fired' ? 'done' : 'idle'}
                            size={8}
                          />
                          {routineLastRunLabel(routine.lastRunAt, t)}
                        </span>
                        {canEditIdentity && routine.status === 'active' && (
                          <button
                            type="button"
                            className={css.botRoutineAction}
                            disabled={identityBusy || statusPending}
                            data-team-routine-pause={routine.routineId}
                            onClick={() => { void submitPauseRoutine(routine.routineId) }}
                          >
                            <IconPauseOutline16 size={13} /> {t('pauseRoutine')}
                          </button>
                        )}
                        {canEditIdentity && routine.status === 'paused' && (
                          <button
                            type="button"
                            className={css.botRoutineAction}
                            disabled={identityBusy || statusPending}
                            data-team-routine-resume={routine.routineId}
                            onClick={() => { void submitResumeRoutine(routine.routineId) }}
                          >
                            <IconPlayOutline16 size={13} /> {t('resumeRoutine')}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            {canEditIdentity && createRoutineOpen && (
              <CreateRoutineForm
                draft={createRoutineDraft}
                setDraft={setCreateRoutineDraft}
                pending={createRoutinePending}
                onSave={() => { void submitCreateRoutine(member) }}
                onCancel={() => {
                  setCreatingRoutineBotId(null)
                  setWritingMemoryBotId(null)
                  setCreateRoutineDraft(EMPTY_CREATE_ROUTINE_DRAFT)
                }}
                t={t}
              />
            )}
            {canEditIdentity && !createRoutineOpen
              && !writeMemoryOpen
              && !attachOpen
              && editingRename !== member.id
              && editingAvatar !== member.id
              && editingPersona !== member.id
              && !confirmPending
              && !assignOpen && (
              <button
                type="button"
                className={css.personaButton}
                disabled={identityBusy}
                data-team-create-routine={member.id}
                onClick={() => { startCreateRoutine(member) }}
              >
                <IconPlusOutline16 size={13} /> {t('createRoutine')}
              </button>
            )}
          </div>
        )}
        {member.role === 'teammate' && (
          <div
            className={css.botMemories}
            data-team-bot-memories={member.id}
            data-team-memory-recall-surface={member.id}
          >
            <div className={css.botMemoriesHeader}>
              <span className={css.botMemoriesLabel}>{t('botMemories')}</span>
              <select
                className={css.memoryBrowseLayerFilter}
                aria-label={t('memoryBrowseLayerFilter')}
                data-team-memory-layer-filter={memoryBrowseLayerFilter}
                value={memoryBrowseLayerFilter}
                disabled={identityBusy}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  const value = event.target.value
                  if (value === 'all' || value === 'agent' || value === 'user') {
                    setMemoryBrowseLayerFilter(value)
                  }
                }}
              >
                {MEMORY_BROWSE_LAYER_FILTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </div>
            <p className={css.hint} data-team-bot-memories-hint="">{t('botMemoriesHint')}</p>
            <p className={css.hint} data-team-memory-browse-hint="">{t('browseMemoriesHint')}</p>
            <p className={css.hint} data-team-memory-layer-filter-hint="">{t('memoryBrowseLayerFilterHint')}</p>
            {memoryInject !== null && (
              <div
                className={css.memoryInjectIndicator}
                data-team-memory-inject-indicator="applied"
                data-team-memory-inject-bot={member.id}
                data-team-memory-inject-at={String(memoryInject.assembledAt)}
                data-team-memory-inject-ids={memoryInject.memoryIds.join(',')}
                title={t('memoryInjectHint')}
              >
                <StateDot state="done" size={8} />
                <span>{memoryInjectAppliedLabel(memoryInject.assembledAt, t)}</span>
              </div>
            )}
            {botMemories.length === 0
              ? <div className={css.notice} data-team-bot-memories-empty={member.id}>{t('botMemoriesEmpty')}</div>
              : (
                <ul className={css.botMemoriesList} data-team-bot-memories-list={member.id}>
                  {botMemories.map((memory: MemoryProjection) => (
                    <li
                      key={memory.memoryId}
                      className={css.botMemoryRow}
                      data-team-memory-row={memory.memoryId}
                      data-team-memory-kind={memory.kind}
                      data-team-memory-layer={memory.layer}
                    >
                      <span
                        className={css.botMemoryKind}
                        data-team-memory-kind-label={memory.kind}
                      >
                        {t(memoryKindKey(memory.kind))}
                      </span>
                      <span
                        className={css.botMemoryLayer}
                        data-team-memory-layer-label={memory.layer}
                      >
                        {t(memoryLayerKey(memory.layer))}
                      </span>
                      <span data-team-memory-content={memory.memoryId}>{memory.content}</span>
                    </li>
                  ))}
                </ul>
              )}
            {canEditIdentity && writeMemoryOpen && (
              <WriteMemoryForm
                draft={writeMemoryDraft}
                setDraft={setWriteMemoryDraft}
                pending={writeMemoryPending}
                onSave={() => { void submitWriteMemory(member) }}
                onCancel={() => {
                  setWritingMemoryBotId(null)
                  setWriteMemoryDraft(EMPTY_WRITE_MEMORY_DRAFT)
                }}
                t={t}
              />
            )}
            {canEditIdentity && !writeMemoryOpen
              && !createRoutineOpen
              && !attachOpen
              && editingRename !== member.id
              && editingAvatar !== member.id
              && editingPersona !== member.id
              && !confirmPending
              && !assignOpen && (
              <div className={css.botMemoryActions}>
                <button
                  type="button"
                  className={css.personaButton}
                  disabled={identityBusy}
                  data-team-browse-memories={member.id}
                  data-team-recall-memories={member.id}
                  onClick={() => { void submitBrowseMemories(member) }}
                >
                  <IconRefreshOutline14 /> {browseMemoryPending ? t('loading') : t('browseMemories')}
                </button>
                <button
                  type="button"
                  className={css.personaButton}
                  disabled={identityBusy}
                  data-team-write-memory={member.id}
                  onClick={() => { startWriteMemory(member) }}
                >
                  <IconPlusOutline16 size={13} /> {t('writeMemory')}
                </button>
              </div>
            )}
          </div>
        )}
        {canEditIdentity && editingRename === member.id && (
          <RenameForm
            draft={renameDraft}
            setDraft={setRenameDraft}
            pending={renamePending}
            onSave={() => { void submitRename(member) }}
            onCancel={() => {
              setEditingRename(null)
              setRenameDraft(EMPTY_RENAME_DRAFT)
            }}
            t={t}
          />
        )}
        {canEditIdentity && editingAvatar === member.id && (
          <AvatarForm
            draft={avatarDraft}
            setDraft={setAvatarDraft}
            pending={avatarPending}
            onSave={() => { void submitAvatar(member) }}
            onCancel={() => {
              setEditingAvatar(null)
              setAvatarDraft(EMPTY_AVATAR_DRAFT)
            }}
            t={t}
          />
        )}
        {canEditIdentity && editingPersona === member.id && (
          <PersonaForm
            draft={personaDraft}
            setDraft={setPersonaDraft}
            pending={personaPending}
            onSave={() => { void submitPersona(member) }}
            onCancel={() => {
              setEditingPersona(null)
              setPersonaDraft(EMPTY_PERSONA_DRAFT)
            }}
            t={t}
          />
        )}
        {canEditIdentity && confirmPending && (
          <DeleteConfirmForm
            pending={deletePending}
            onConfirm={() => { void confirmDelete(member) }}
            onCancel={cancelDelete}
            t={t}
          />
        )}
        {canEditIdentity && assignOpen && view !== null && (
          <AssignSectionForm
            sections={view.sections}
            currentSectionId={member.sectionId ?? null}
            pending={assignPending}
            onAssign={(sectionId) => { void submitAssignSection(member, sectionId) }}
            onCancel={() => { setAssigningBotId(null) }}
            t={t}
          />
        )}
        {canEditIdentity && editingRename !== member.id
          && editingAvatar !== member.id
          && editingPersona !== member.id
          && !confirmPending
          && !assignOpen
          && !attachOpen
          && !createRoutineOpen
          && !writeMemoryOpen && (
          <div className={css.identityActions}>
            <button
              type="button"
              className={css.personaButton}
              disabled={identityBusy}
              data-team-rename={member.id}
              onClick={() => { startRename(member) }}
            >
              <IconEditOutline16 size={13} /> {t('rename')}
            </button>
            <button
              type="button"
              className={css.personaButton}
              disabled={identityBusy}
              data-team-edit-avatar={member.id}
              onClick={() => { startEditAvatar(member) }}
            >
              <IconEditOutline16 size={13} /> {t('editAvatar')}
            </button>
            <button
              type="button"
              className={css.personaButton}
              disabled={identityBusy}
              data-team-edit-persona={member.id}
              onClick={() => { startEditPersona(member) }}
            >
              <IconEditOutline16 size={13} /> {t('editPersona')}
            </button>
            <button
              type="button"
              className={css.personaButton}
              disabled={identityBusy}
              data-team-assign-section={member.id}
              onClick={() => { startAssignSection(member) }}
            >
              <IconEditOutline16 size={13} /> {t('assignSection')}
            </button>
            <button
              type="button"
              className={css.deleteBotButton}
              disabled={identityBusy}
              data-team-delete={member.id}
              onClick={() => { startDelete(member) }}
            >
              <IconTrashOutline16 size={13} /> {t('deleteBot')}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={css.root} data-team-action>
      <button
        type="button"
        className={css.trigger}
        aria-expanded={open}
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) void refresh()
        }}
      >
        <IconUserOutline16 size={14} />
        <span>{t('trigger')}</span>
        {teammates.length > 0 && <span className={css.count}>{teammates.length}</span>}
      </button>
      {open && (
        <div className={css.panel} role="dialog" aria-label={t('trigger')}>
          <div className={css.toolbar}>
            <strong>{t('trigger')}</strong>
            <span className={css.spacer} />
            <button type="button" className={css.iconButton} aria-label={t('refresh')} onClick={() => { void refresh() }}>
              <IconRefreshOutline14 />
            </button>
            <button type="button" className={css.iconButton} aria-label={t('close')} onClick={() => { setOpen(false) }}>
              <IconCloseOutline16 size={14} />
            </button>
          </div>
          {error !== null && (
            <div
              className={css.error}
              role="alert"
              {...credentialFailureCode !== null ? { 'data-team-error': credentialFailureCode } : {}}
            >
              <span>{error}</span>
              {credentialFailureCode !== null && (
                <button
                  type="button"
                  className={css.credentialHandoff}
                  {...credentialFailureCode === 'MISSING_CREDENTIAL'
                    ? { 'data-missing-credential-handoff': true }
                    : { 'data-invalid-credential-handoff': true }}
                  onClick={openModelsSettings}
                >
                  {t('openModelsSettings')}
                </button>
              )}
            </div>
          )}
          {loading && view === null && <div className={css.notice}>{t('loading')}</div>}
          {view !== null && (
            <>
              <section>
                <div className={css.sectionTitle}>
                  <h3>{t('roster')}</h3>
                  <button type="button" className={css.smallButton} onClick={() => { setCreatingBot(true) }}>
                    <IconPlusOutline16 size={13} /> {t('createBot')}
                  </button>
                </div>
                <div className={css.notice} data-team-distinct-models>
                  {assignmentKeys.size >= 2 ? t('multiModelReady') : t('multiModelPending')}
                </div>
                {creatingBot && (
                  <BotCreateForm
                    draft={botDraft}
                    setDraft={setBotDraft}
                    pending={pendingTasks.has('create-bot')}
                    existingAssignments={assignmentKeys}
                    onSave={() => { void submitCreateBot() }}
                    onCancel={() => { setCreatingBot(false) }}
                    t={t}
                  />
                )}
                <div className={css.sectionTitle}>
                  <h3>{t('sections')}</h3>
                  <button
                    type="button"
                    className={css.smallButton}
                    data-team-create-section
                    onClick={() => {
                      setCreatingSection(true)
                      setEditingSectionId(null)
                    }}
                  >
                    <IconPlusOutline16 size={13} /> {t('createSection')}
                  </button>
                </div>
                {creatingSection && (
                  <SectionNameForm
                    draft={sectionDraft}
                    setDraft={setSectionDraft}
                    pending={pendingTasks.has('create-section')}
                    hintKey="sectionHint"
                    placeholderKey="sectionNamePlaceholder"
                    onSave={() => { void submitCreateSection() }}
                    onCancel={() => {
                      setCreatingSection(false)
                      setSectionDraft(EMPTY_SECTION_NAME_DRAFT)
                    }}
                    t={t}
                    editor="create"
                  />
                )}
                <div className={css.sectionGroups} data-team-sections>
                  {view.sections.map((section) => {
                    const renamePending = pendingTasks.has(`rename-section:${section.id}`)
                    return (
                      <div
                        key={section.id}
                        className={css.sectionGroup}
                        data-team-section={section.id}
                        data-section-name={section.name}
                      >
                        <div className={css.sectionGroupHeader}>
                          <strong data-team-section-name>{section.name}</strong>
                          <span className={css.spacer} />
                          {editingSectionId !== section.id && (
                            <button
                              type="button"
                              className={css.personaButton}
                              disabled={renamePending}
                              data-team-rename-section={section.id}
                              onClick={() => { startRenameSection(section) }}
                            >
                              <IconEditOutline16 size={13} /> {t('renameSection')}
                            </button>
                          )}
                        </div>
                        {editingSectionId === section.id && (
                          <SectionNameForm
                            draft={sectionRenameDraft}
                            setDraft={setSectionRenameDraft}
                            pending={renamePending}
                            hintKey="renameSectionHint"
                            placeholderKey="renameSectionPlaceholder"
                            onSave={() => { void submitRenameSection(section) }}
                            onCancel={() => {
                              setEditingSectionId(null)
                              setSectionRenameDraft(EMPTY_SECTION_NAME_DRAFT)
                            }}
                            t={t}
                            editor="rename"
                          />
                        )}
                        <div className={css.roster}>
                          {section.botIds.map((botId) => {
                            const member = membersById.get(botId)
                            return member === undefined ? null : renderMemberCard(member)
                          })}
                        </div>
                      </div>
                    )
                  })}
                  <div
                    className={css.sectionGroup}
                    data-team-section-unassigned=""
                  >
                    <div className={css.sectionGroupHeader}>
                      <strong data-team-unassigned-label>{t('unassigned')}</strong>
                    </div>
                    <p className={css.hint}>{t('unassignedHint')}</p>
                    <div className={css.roster}>
                      {view.unassignedBotIds.map((botId) => {
                        const member = membersById.get(botId)
                        return member === undefined ? null : renderMemberCard(member)
                      })}
                    </div>
                  </div>
                </div>
              </section>
              <section data-team-skills>
                <div className={css.sectionTitle}>
                  <h3>{t('skills')}</h3>
                  <button
                    type="button"
                    className={css.smallButton}
                    data-team-create-skill
                    onClick={() => { startCreateSkill() }}
                  >
                    <IconPlusOutline16 size={13} /> {t('createSkill')}
                  </button>
                </div>
                <p className={css.hint}>{t('skillsHint')}</p>
                {(creatingSkill || editingSkillId !== null) && (
                  <SkillAuthorForm
                    draft={skillAuthorDraft}
                    setDraft={setSkillAuthorDraft}
                    pending={pendingTasks.has('upsert-user-skill')}
                    mode={editingSkillId === null ? 'create' : 'edit'}
                    onSave={() => { void submitSkillAuthor() }}
                    onCancel={cancelSkillAuthor}
                    t={t}
                  />
                )}
                {view.skills.length === 0
                  ? (
                    <div
                      className={css.error}
                      role="alert"
                      data-team-skills-catalog-unavailable=""
                    >
                      {t('skillsCatalogUnavailable')}
                    </div>
                  )
                  : (
                    <>
                      <p className={css.hint}>{t('skillSelectHint')}</p>
                      <div className={css.skillsList} data-team-skills-list>
                        {view.skills.map((skill) => {
                          const available = availableToAttach.has(skill.id)
                          const editingThis = editingSkillId === skill.id
                          return (
                            <article
                              key={skill.id}
                              className={css.skillCard}
                              data-team-skill={skill.id}
                              data-skill-source={skill.source}
                              data-skill-available={available ? 'true' : 'false'}
                            >
                              <div className={css.skillTitle}>
                                <strong data-team-skill-display-name>{skill.displayName}</strong>
                                <span data-team-skill-source={skill.source}>
                                  {t(skillSourceKey(skill.source))}
                                </span>
                              </div>
                              <div className={css.meta}>
                                <span data-team-skill-id>{skill.id}</span>
                                {skill.description !== undefined && skill.description.trim() !== ''
                                  && <span>{skill.description}</span>}
                              </div>
                              <div className={css.identityActions}>
                                {available
                                  ? (
                                    <div
                                      className={css.skillAvailable}
                                      data-team-skill-available={skill.id}
                                    >
                                      <IconCheckOutline14 /> {t('skillAvailable')}
                                    </div>
                                  )
                                  : (
                                    <button
                                      type="button"
                                      className={css.personaButton}
                                      data-team-skill-load={skill.id}
                                      onClick={() => { makeAvailableToAttach(skill.id) }}
                                    >
                                      {t('skillMakeAvailable')}
                                    </button>
                                  )}
                                {skill.source === 'user' && !editingThis && (
                                  <button
                                    type="button"
                                    className={css.personaButton}
                                    data-team-skill-edit={skill.id}
                                    disabled={pendingTasks.has('upsert-user-skill')}
                                    onClick={() => { startEditSkill(skill) }}
                                  >
                                    <IconEditOutline16 size={13} /> {t('editSkill')}
                                  </button>
                                )}
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </>
                  )}
              </section>
              <section data-team-connectors>
                <div className={css.sectionTitle}>
                  <h3>{t('connectors')}</h3>
                </div>
                <p className={css.hint}>{t('connectorsHint')}</p>
                <div
                  className={css.trustDenySection}
                  data-team-trust-deny=""
                  data-team-standing-deny-policy={trustPolicy ?? 'unknown'}
                  data-team-standing-deny={trustPolicy === 'never' ? 'on' : 'off'}
                >
                  <div className={css.botSkillsHeader}>
                    <span className={css.botSkillsLabel}>{t('trustDeny')}</span>
                  </div>
                  <p className={css.hint}>{t('trustDenyHint')}</p>
                  {trustPolicyUnavailable
                    ? (
                      <div
                        className={css.error}
                        role="alert"
                        data-team-standing-deny-unavailable=""
                      >
                        {t('standingDenyUnavailable')}
                      </div>
                    )
                    : (
                      <>
                        <div
                          className={trustPolicy === 'never' ? css.standingDenyActive : css.meta}
                          data-team-standing-deny-status={trustPolicy ?? 'loading'}
                        >
                          {trustPolicy === 'never'
                            ? t('standingDenyActive')
                            : trustPolicy === 'ask'
                              ? t('standingDenyInactive')
                              : t('loading')}
                          {trustPolicy !== null && (
                            <span className={css.meta} data-team-trust-policy={trustPolicy}>
                              {t(`trustPolicy.${trustPolicy}`)}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className={css.personaButton}
                          data-team-standing-deny-toggle=""
                          disabled={pendingTasks.has('standing-deny') || trustPolicy === null}
                          onClick={() => {
                            void submitStandingDeny(trustPolicy !== 'never')
                          }}
                        >
                          {trustPolicy === 'never' ? t('standingDenyDisable') : t('standingDenyEnable')}
                        </button>
                      </>
                    )}
                  <div className={css.botSkillsHeader}>
                    <span className={css.botSkillsLabel}>{t('approvalDenyCard')}</span>
                  </div>
                  <p className={css.hint}>{t('approvalDenyHint')}</p>
                  {pendingTrustApprovals.length === 0
                    ? (
                      <div className={css.notice} data-team-approval-deny-empty="">
                        {t('approvalDenyEmpty')}
                      </div>
                    )
                    : pendingTrustApprovals.map((pending) => {
                      const answerPending = pendingTasks.has(`answer-trust:${pending.requestId}`)
                      return (
                        <div
                          key={pending.requestId}
                          className={css.approvalDenyCard}
                          data-team-approval-deny-card={pending.requestId}
                          data-team-approval-deny-tool={pending.toolName}
                        >
                          <strong>{pending.reason ?? pending.toolName}</strong>
                          <span className={css.meta}>{pending.toolName}</span>
                          <div className={css.formActions}>
                            <button
                              type="button"
                              className={css.personaButton}
                              data-team-approval-deny-reject={pending.requestId}
                              disabled={answerPending}
                              onClick={() => {
                                void submitAnswerTrustApproval(pending.requestId, 'deny')
                              }}
                            >
                              {t('approvalDenyReject')}
                            </button>
                            <button
                              type="button"
                              className={css.personaButton}
                              data-team-approval-deny-allow={pending.requestId}
                              disabled={answerPending}
                              onClick={() => {
                                void submitAnswerTrustApproval(pending.requestId, 'allow')
                              }}
                            >
                              {t('approvalDenyAllow')}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
                {connectorCatalogUnavailable
                  ? (
                    <div
                      className={css.error}
                      role="alert"
                      data-team-connectors-catalog-unavailable=""
                    >
                      {t('connectorsCatalogUnavailable')}
                    </div>
                  )
                  : connectorCatalog === null
                    ? null
                    : (
                      <div className={css.connectorsList} data-team-connectors-catalog>
                        {connectorCatalog.map((entry) => {
                          const installedRow = (view.connectors ?? []).find(
                            row => row.catalogId === entry.catalogId && row.installState !== 'failed',
                          )
                          const installPending = pendingTasks.has(`install-connector:${entry.catalogId}`)
                          return (
                            <article
                              key={entry.catalogId}
                              className={css.connectorCard}
                              data-team-connector-catalog={entry.catalogId}
                              data-connector-fixture={entry.fixture ? 'true' : 'false'}
                              data-connector-installed={installedRow === undefined ? 'false' : 'true'}
                            >
                              <div className={css.connectorTitle}>
                                <strong data-team-connector-catalog-name>{entry.displayName}</strong>
                                {entry.fixture
                                  && <span data-team-connector-fixture="">{t('connectorFixture')}</span>}
                              </div>
                              <div className={css.meta}>
                                <span data-team-connector-catalog-id>{entry.catalogId}</span>
                                <span data-team-connector-server-name>{entry.serverName}</span>
                                <span>{t(connectorInstallStateKey(
                                  installedRow?.installState ?? 'available',
                                ))}
                                </span>
                              </div>
                              {installedRow === undefined
                                ? (
                                  <button
                                    type="button"
                                    className={css.personaButton}
                                    data-team-connector-install={entry.catalogId}
                                    disabled={installPending}
                                    onClick={() => { void submitInstallConnector(entry.catalogId) }}
                                  >
                                    <IconPlusOutline16 size={13} />
                                    {installPending ? t('connectorInstalling') : t('connectorInstall')}
                                  </button>
                                )
                                : (
                                  <div
                                    className={css.connectorInstalledBadge}
                                    data-team-connector-installed-badge={entry.catalogId}
                                  >
                                    <IconCheckOutline14 /> {t('connectorInstalled')}
                                  </div>
                                )}
                            </article>
                          )
                        })}
                      </div>
                    )}
                <div className={css.connectorsInstalled} data-team-connectors-installed>
                  <div className={css.botSkillsHeader}>
                    <span className={css.botSkillsLabel}>{t('connectorsInstalled')}</span>
                  </div>
                  <p className={css.hint}>{t('connectorsInstalledHint')}</p>
                  {(view.connectors ?? []).length === 0
                    ? (
                      <div className={css.notice} data-team-connectors-empty="">
                        {t('connectorsEmptyInstalled')}
                      </div>
                    )
                    : (
                      <ul className={css.connectorsInstalledList} data-team-connectors-list>
                        {(view.connectors ?? []).map((connector: ConnectorProjection) => {
                          const authPending = pendingTasks.has(
                            `auth-connector:${connector.connectorId}`,
                          )
                          const invokePending = pendingTasks.has(
                            `invoke-connector:${connector.connectorId}`,
                          )
                          const editingAuth = authenticatingConnectorId === connector.connectorId
                          const toolOutcome = connectorToolOutcomes.get(connector.connectorId)
                          const toolsReady = connector.installState === 'installed'
                            && connector.authState === 'ready'
                          return (
                            <li
                              key={connector.connectorId}
                              className={css.connectorInstalledRow}
                              data-team-connector={connector.connectorId}
                              data-team-connector-install-state={connector.installState}
                              data-team-connector-auth-state={connector.authState}
                              data-team-connector-tools-ready={toolsReady ? 'true' : 'false'}
                              {...toolOutcome === undefined
                                ? {}
                                : { 'data-team-connector-tool-outcome': toolOutcome.outcome }}
                            >
                              <div className={css.connectorTitle}>
                                <strong data-team-connector-display-name>
                                  {connector.displayName}
                                </strong>
                                <span data-team-connector-install-label>
                                  {t(connectorInstallStateKey(connector.installState))}
                                </span>
                                <span data-team-connector-auth-label>
                                  {t(connectorAuthStateKey(connector.authState))}
                                </span>
                                {connector.credentialConfigured
                                  && (
                                    <span data-team-connector-credential-configured="">
                                      {t('connectorCredentialConfigured')}
                                    </span>
                                  )}
                              </div>
                              <div className={css.meta}>
                                <span data-team-connector-id>{connector.connectorId}</span>
                                <span data-team-connector-catalog-ref>{connector.catalogId}</span>
                                {connector.error !== undefined && connector.error.trim() !== ''
                                  && (
                                    <span data-team-connector-error={connector.connectorId}>
                                      {connector.error}
                                    </span>
                                  )}
                              </div>
                              {connector.installState === 'failed'
                                && (
                                  <div
                                    className={css.error}
                                    role="alert"
                                    data-team-connector-install-failed=""
                                  >
                                    {t('connectorInstallFailed')}
                                  </div>
                                )}
                              {editingAuth && (
                                <ConnectorAuthForm
                                  draft={connectorAuthDraft}
                                  setDraft={setConnectorAuthDraft}
                                  pending={authPending}
                                  onSave={() => {
                                    void submitAuthenticateConnector(connector.connectorId)
                                  }}
                                  onCancel={() => {
                                    setAuthenticatingConnectorId(null)
                                    setConnectorAuthDraft(EMPTY_CONNECTOR_AUTH_DRAFT)
                                  }}
                                  t={t}
                                />
                              )}
                              {!editingAuth && connector.installState === 'installed'
                                && (connector.authState === 'needs_auth'
                                  || connector.authState === 'failed') && (
                                <button
                                  type="button"
                                  className={css.personaButton}
                                  data-team-connector-auth={connector.connectorId}
                                  disabled={authPending}
                                  onClick={() => { startAuthenticateConnector(connector) }}
                                >
                                  {t('connectorAuth')}
                                </button>
                              )}
                              {toolsReady && (
                                <>
                                  <div
                                    className={css.connectorToolsReady}
                                    data-team-connector-tools-bound={connector.connectorId}
                                  >
                                    <IconCheckOutline14 /> {t('connectorToolsReady')}
                                    <span className={css.meta}>
                                      {connectorPublicToolName(connector.serverName)}
                                    </span>
                                  </div>
                                  <p className={css.hint}>{t('connectorToolsReadyHint')}</p>
                                  <button
                                    type="button"
                                    className={css.personaButton}
                                    data-team-connector-invoke={connector.connectorId}
                                    disabled={invokePending}
                                    onClick={() => {
                                      void submitInvokeConnectorTool(connector.connectorId)
                                    }}
                                  >
                                    <IconPlayOutline16 size={13} /> {t('connectorInvokeTool')}
                                  </button>
                                </>
                              )}
                              {toolOutcome !== undefined && (
                                <>
                                  <div
                                    className={
                                      toolOutcome.outcome === 'success'
                                        ? css.connectorToolSuccess
                                        : toolOutcome.outcome === 'denied'
                                          ? css.connectorToolBlocked
                                          : css.connectorToolFailure
                                    }
                                    data-team-connector-tool-outcome-label={toolOutcome.outcome}
                                    data-team-connector-tool-name={toolOutcome.toolName}
                                    {...toolOutcome.outcome === 'denied'
                                      ? { 'data-team-connector-blocked': '' }
                                      : {}}
                                  >
                                    {toolOutcome.outcome === 'success'
                                      ? <><IconCheckOutline14 /> {t('connectorToolSuccess')}</>
                                      : toolOutcome.outcome === 'denied'
                                        ? t('connectorToolBlocked')
                                        : t('connectorToolError')}
                                    <span className={css.meta}>{toolOutcome.toolName}</span>
                                  </div>
                                  <p className={css.hint}>
                                    {toolOutcome.outcome === 'denied'
                                      ? t('connectorToolBlockedHint')
                                      : t('connectorToolOutcomeHint')}
                                  </p>
                                </>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                </div>
              </section>
              <section data-team-handoffs>
                <div className={css.sectionTitle}>
                  <h3>{t('handoffs')}</h3>
                </div>
                {view.handoffs.length === 0 && <div className={css.notice}>{t('handoffsEmpty')}</div>}
                <div className={css.handoffs}>
                  {view.handoffs.map(handoff => (
                    <article
                      key={handoff.id}
                      className={css.handoff}
                      data-team-handoff
                      data-handoff-id={handoff.id}
                      data-delivery-state={handoff.deliveryState}
                      data-handoff-source={handoff.source.kind}
                    >
                      <div className={css.taskTitle}>
                        <strong>{handoffBodyPreview(handoff.body) || handoff.id}</strong>
                        <span>{t(deliveryStateKey(handoff.deliveryState))}</span>
                      </div>
                      <div className={css.meta}>
                        <span>{t('handoffFrom')}: {memberLabel(view.members, handoff.fromBotId)}</span>
                        <span>{t('handoffTo')}: {memberLabel(view.members, handoff.toBotId)}</span>
                        <span>{handoff.id}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <section>
                <div className={css.sectionTitle}>
                  <h3>{t('tasks')}</h3>
                  <button type="button" className={css.smallButton} onClick={() => { setCreating(true) }}>
                    <IconPlusOutline16 size={13} /> {t('create')}
                  </button>
                </div>
                {creating && (
                  <TaskForm
                    draft={createDraft}
                    setDraft={setCreateDraft}
                    pending={pendingTasks.has('create')}
                    onSave={() => { void submitCreate() }}
                    onCancel={() => { setCreating(false) }}
                    t={t}
                  />
                )}
                {view.tasks.length === 0 && !creating && <div className={css.notice}>{t('empty')}</div>}
                <div className={css.tasks}>
                  {view.tasks.map(task => editing === task.id
                    ? (
                      <TaskForm
                        key={task.id}
                        draft={editDraft}
                        setDraft={setEditDraft}
                        pending={pendingTasks.has(task.id)}
                        onSave={() => { void submitEdit(task) }}
                        onCancel={() => { setEditing(null) }}
                        t={t}
                      />
                    )
                    : (
                      <article key={task.id} className={css.task}>
                        <div className={css.taskTitle}>
                          <strong>{task.subject}</strong>
                          <span>{t(statusKey(task.status))}</span>
                        </div>
                        <p>{task.description}</p>
                        <div className={css.meta}>
                          <span>{task.id}</span>
                          {task.status === 'pending' && <span>{task.ready ? t('ready') : t('blocked')}</span>}
                          {task.blockedBy.length > 0 && <span>{t('blockedBy')}: {task.blockedBy.join(', ')}</span>}
                          {task.writeScopes.length > 0 && <span>{t('writeScopes')}: {task.writeScopes.join(', ')}</span>}
                          {task.writeScopeWarnings.map(warning => <span key={warning} className={css.warning}>{warning}</span>)}
                        </div>
                        <div className={css.taskActions}>
                          <label>
                            {t('owner')}
                            <select
                              aria-label={t('owner')}
                              value={task.ownerName ?? ''}
                              disabled={pendingTasks.has(task.id) || task.status === 'completed'}
                              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                                const owner = event.target.value
                                void settleTask(task.id, () => updateTask(sessionId, {
                                  taskId: task.id,
                                  expectedRevision: task.revision,
                                  action: 'reassign',
                                  ...owner === '' ? {} : { owner },
                                }))
                              }}
                            >
                              <option value="">{t('unowned')}</option>
                              {assignable.map(member => <option key={member.id} value={member.name}>{member.name}</option>)}
                            </select>
                          </label>
                          <button type="button" onClick={() => { startEdit(task) }} disabled={pendingTasks.has(task.id)}>
                            <IconEditOutline16 size={13} /> {t('edit')}
                          </button>
                          {task.status === 'in_progress' && (
                            <button type="button" disabled={pendingTasks.has(task.id)} onClick={() => {
                              void settleTask(task.id, () => updateTask(sessionId, {
                                taskId: task.id, expectedRevision: task.revision, action: 'complete',
                              }))
                            }}><IconCheckOutline14 /> {t('complete')}</button>
                          )}
                          {task.status === 'completed' && (
                            <button type="button" disabled={pendingTasks.has(task.id)} onClick={() => {
                              void settleTask(task.id, () => updateTask(sessionId, {
                                taskId: task.id, expectedRevision: task.revision, action: 'reopen',
                              }))
                            }}>{t('reopen')}</button>
                          )}
                          <button type="button" disabled={pendingTasks.has(task.id)} onClick={() => {
                            void settleTask(task.id, () => updateTask(sessionId, {
                              taskId: task.id, expectedRevision: task.revision, action: 'delete',
                            }))
                          }}><IconTrashOutline16 size={13} /> {t('delete')}</button>
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface BotCreateFormProps {
  draft: BotDraft
  setDraft: (draft: BotDraft) => void
  pending: boolean
  existingAssignments: ReadonlySet<string>
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

function BotCreateForm({
  draft, setDraft, pending, existingAssignments, onSave, onCancel, t,
}: BotCreateFormProps) {
  const field = (key: keyof BotDraft, value: string): void => { setDraft({ ...draft, [key]: value }) }
  const provider = draft.provider.trim()
  const model = draft.model.trim()
  const ready = draft.displayName.trim() !== '' && provider !== '' && model !== ''
  const draftKey = comparableAssignment(draft.provider, draft.model)
  const comparable = draftKey !== undefined && existingAssignments.size > 0
  const duplicatesExisting = comparable && existingAssignments.has(draftKey)
  const distinctDraft = comparable && !existingAssignments.has(draftKey)
  return (
    <div className={css.form} data-team-create-bot>
      <p className={css.hint} data-team-distinct-models-hint>{t('distinctModelsHint')}</p>
      <input
        value={draft.displayName}
        aria-label={t('displayName')}
        placeholder={t('displayNamePlaceholder')}
        onChange={(event: ChangeEvent<HTMLInputElement>) => { field('displayName', event.target.value) }}
      />
      <input
        value={draft.provider}
        aria-label={t('provider')}
        placeholder={t('providerPlaceholder')}
        onChange={(event: ChangeEvent<HTMLInputElement>) => { field('provider', event.target.value) }}
      />
      <input
        value={draft.model}
        aria-label={t('modelId')}
        placeholder={t('modelIdPlaceholder')}
        onChange={(event: ChangeEvent<HTMLInputElement>) => { field('model', event.target.value) }}
      />
      {duplicatesExisting && (
        <div className={css.warning} role="status" data-team-duplicate-assignment>
          {t('duplicateAssignment')}
        </div>
      )}
      {distinctDraft && (
        <p className={css.hint} role="status" data-team-draft-distinct>
          {t('draftDistinctAssignment')}
        </p>
      )}
      <div className={css.formActions}>
        <button type="button" disabled={pending || !ready} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

interface RenameFormProps {
  draft: RenameDraft
  setDraft: (draft: RenameDraft) => void
  pending: boolean
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/** Host rename editor: non-empty displayName (FR-004). */
function RenameForm({
  draft, setDraft, pending, onSave, onCancel, t,
}: RenameFormProps) {
  const ready = draft.displayName.trim() !== ''
  return (
    <div className={css.form} data-team-rename-editor>
      <p className={css.hint}>{t('renameHint')}</p>
      <input
        value={draft.displayName}
        aria-label={t('displayName')}
        placeholder={t('renamePlaceholder')}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setDraft({ displayName: event.target.value })
        }}
      />
      <div className={css.formActions}>
        <button type="button" disabled={pending || !ready} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

interface SectionNameFormProps {
  draft: SectionNameDraft
  setDraft: (draft: SectionNameDraft) => void
  pending: boolean
  hintKey: 'sectionHint' | 'renameSectionHint'
  placeholderKey: 'sectionNamePlaceholder' | 'renameSectionPlaceholder'
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
  /** Marker attribute for create vs rename editors (Verifier / tests). */
  editor: 'create' | 'rename'
}

/** Host named sidebar section create / rename editor (FR-006; empty name blocked). */
function SectionNameForm({
  draft, setDraft, pending, hintKey, placeholderKey, onSave, onCancel, t, editor,
}: SectionNameFormProps) {
  const ready = draft.name.trim() !== ''
  return (
    <div
      className={css.form}
      {...editor === 'create'
        ? { 'data-team-create-section-editor': true }
        : { 'data-team-rename-section-editor': true }}
    >
      <p className={css.hint}>{t(hintKey)}</p>
      <input
        value={draft.name}
        aria-label={t('sectionName')}
        placeholder={t(placeholderKey)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setDraft({ name: event.target.value })
        }}
      />
      <div className={css.formActions}>
        <button type="button" disabled={pending || !ready} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

interface AssignSectionFormProps {
  sections: readonly SidebarSectionView[]
  currentSectionId: SidebarSectionId | null
  pending: boolean
  onAssign: (sectionId: SidebarSectionId | null) => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/**
 * Host section assign / move / unassign picker (FR-006 / clarify lock 4).
 * Empty option ⇒ Unassigned/default (`sectionId: null`); never a catalog row.
 */
function AssignSectionForm({
  sections, currentSectionId, pending, onAssign, onCancel, t,
}: AssignSectionFormProps) {
  const [selected, setSelected] = useState(
    currentSectionId === null ? UNASSIGNED_OPTION : currentSectionId,
  )
  const changed = selected === UNASSIGNED_OPTION
    ? currentSectionId !== null
    : selected !== currentSectionId
  return (
    <div className={css.form} data-team-assign-section-editor>
      <p className={css.hint}>{t('assignSectionHint')}</p>
      <select
        aria-label={t('assignSection')}
        data-team-assign-section-select=""
        value={selected}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          setSelected(event.target.value === UNASSIGNED_OPTION
            ? UNASSIGNED_OPTION
            : event.target.value as SidebarSectionId)
        }}
      >
        <option value={UNASSIGNED_OPTION}>{t('unassigned')}</option>
        {sections.map(section => (
          <option key={section.id} value={section.id}>{section.name}</option>
        ))}
      </select>
      <div className={css.formActions}>
        <button
          type="button"
          disabled={pending || !changed}
          onClick={() => {
            onAssign(selected === UNASSIGNED_OPTION ? null : selected as SidebarSectionId)
          }}
        >
          {t('save')}
        </button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

interface AvatarFormProps {
  draft: AvatarDraft
  setDraft: (draft: AvatarDraft) => void
  pending: boolean
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/**
 * Host preset avatar picker: shape and/or color markers (FR-005 / clarify lock 3).
 * No image-file / URL upload control — omitted for P2 Pass (T024).
 */
function AvatarForm({
  draft, setDraft, pending, onSave, onCancel, t,
}: AvatarFormProps) {
  const ready = draft.shape !== '' || draft.color !== ''
  return (
    <div className={css.form} data-team-avatar-editor>
      <p className={css.hint}>{t('avatarHint')}</p>
      <fieldset className={css.presetFieldset}>
        <legend>{t('avatarShape')}</legend>
        <div className={css.presetRow} role="group" aria-label={t('avatarShape')}>
          <button
            type="button"
            className={draft.shape === '' ? css.presetSelected : css.presetChip}
            aria-pressed={draft.shape === ''}
            onClick={() => { setDraft({ ...draft, shape: '' }) }}
          >
            {t('avatarUnset')}
          </button>
          {AVATAR_SHAPE_IDS.map(shape => (
            <button
              key={shape}
              type="button"
              className={draft.shape === shape ? css.presetSelected : css.presetChip}
              aria-pressed={draft.shape === shape}
              data-avatar-shape-option={shape}
              onClick={() => { setDraft({ ...draft, shape }) }}
            >
              {t(avatarShapeKey(shape))}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={css.presetFieldset}>
        <legend>{t('avatarColor')}</legend>
        <div className={css.presetRow} role="group" aria-label={t('avatarColor')}>
          <button
            type="button"
            className={draft.color === '' ? css.presetSelected : css.presetChip}
            aria-pressed={draft.color === ''}
            onClick={() => { setDraft({ ...draft, color: '' }) }}
          >
            {t('avatarUnset')}
          </button>
          {AVATAR_COLOR_IDS.map(color => (
            <button
              key={color}
              type="button"
              className={draft.color === color ? css.presetSelected : css.presetChip}
              aria-pressed={draft.color === color}
              data-avatar-color-option={color}
              data-avatar-swatch={color}
              onClick={() => { setDraft({ ...draft, color }) }}
            >
              {t(avatarColorKey(color))}
            </button>
          ))}
        </div>
      </fieldset>
      <div className={css.formActions}>
        <button type="button" disabled={pending || !ready} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

interface PersonaFormProps {
  draft: PersonaDraft
  setDraft: (draft: PersonaDraft) => void
  pending: boolean
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/** Host persona editor: job, voice, and anti-jobs list (FR-002 / FR-003). */
function PersonaForm({
  draft, setDraft, pending, onSave, onCancel, t,
}: PersonaFormProps) {
  const field = (key: keyof PersonaDraft, value: string): void => { setDraft({ ...draft, [key]: value }) }
  return (
    <div className={css.form} data-team-persona-editor>
      <p className={css.hint}>{t('personaHint')}</p>
      <input
        value={draft.job}
        aria-label={t('personaJob')}
        placeholder={t('personaJobPlaceholder')}
        onChange={(event: ChangeEvent<HTMLInputElement>) => { field('job', event.target.value) }}
      />
      <input
        value={draft.voice}
        aria-label={t('personaVoice')}
        placeholder={t('personaVoicePlaceholder')}
        onChange={(event: ChangeEvent<HTMLInputElement>) => { field('voice', event.target.value) }}
      />
      <textarea
        value={draft.antiJobs}
        aria-label={t('personaAntiJobs')}
        placeholder={t('personaAntiJobsPlaceholder')}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => { field('antiJobs', event.target.value) }}
      />
      <div className={css.formActions}>
        <button type="button" disabled={pending} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

interface DeleteConfirmFormProps {
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/**
 * Explicit Client delete confirmation (FR-007 / data-model pending-confirm).
 * Host `deleteBot` runs only on confirm; cancel returns to idle unchanged.
 * Transcript/mailbox wipe is not required for Pass (clarify lock 5).
 */
function DeleteConfirmForm({
  pending, onConfirm, onCancel, t,
}: DeleteConfirmFormProps) {
  return (
    <div className={css.form} data-team-delete-confirm role="group" aria-label={t('deleteBot')}>
      <p className={css.hint}>{t('deleteConfirmHint')}</p>
      <div className={css.formActions}>
        <button
          type="button"
          className={css.confirmDeleteButton}
          disabled={pending}
          data-team-confirm-delete
          onClick={onConfirm}
        >
          {t('confirmDelete')}
        </button>
        <button
          type="button"
          disabled={pending}
          data-team-cancel-delete
          onClick={onCancel}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}

interface CreateRoutineFormProps {
  draft: CreateRoutineDraft
  setDraft: (draft: CreateRoutineDraft) => void
  pending: boolean
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/**
 * Host createRoutine editor in bot context (P4 FR-001 / SC-007 / T017; P6 US2 T024 event).
 * Cron: empty intent or schedule show a clear reject and block Save.
 * Event: empty intent blocks Save; Pass family is webhook_harness (FR-018).
 * No confirm step.
 */
function CreateRoutineForm({
  draft, setDraft, pending, onSave, onCancel, t,
}: CreateRoutineFormProps) {
  const intentReady = draft.intent.trim() !== ''
  const cronReady = intentReady && draft.scheduleExpr.trim() !== ''
  const eventReady = intentReady
  const ready = draft.triggerKind === 'event' ? eventReady : cronReady
  return (
    <div
      className={css.form}
      data-team-create-routine-editor=""
      data-team-create-routine-trigger-kind={draft.triggerKind}
    >
      <p className={css.hint}>{t('createRoutineHint')}</p>
      {!ready && (
        <div
          className={css.error}
          role="alert"
          data-team-create-routine-reject=""
        >
          {t('routineCreateReject')}
        </div>
      )}
      <select
        aria-label={t('routineTriggerKind')}
        data-team-routine-trigger-kind-select=""
        value={draft.triggerKind}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const value = event.target.value
          if (value !== 'cron' && value !== 'event') return
          setDraft({
            ...draft,
            triggerKind: value,
            // Clear the opposite field so Save readiness matches the chosen kind.
            ...value === 'cron'
              ? { eventTrigger: 'webhook_harness' as const }
              : { scheduleExpr: '' },
          })
        }}
      >
        {ROUTINE_TRIGGER_KIND_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
      <input
        aria-label={t('routineIntent')}
        data-team-routine-intent=""
        value={draft.intent}
        placeholder={t('routineIntentPlaceholder')}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setDraft({ ...draft, intent: event.target.value })
        }}
      />
      {draft.triggerKind === 'cron' && (
        <select
          aria-label={t('routineSchedule')}
          data-team-routine-schedule-select=""
          value={draft.scheduleExpr === '' ? ROUTINE_SCHEDULE_NONE : draft.scheduleExpr}
          disabled={pending}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value
            setDraft({
              ...draft,
              scheduleExpr: value === ROUTINE_SCHEDULE_NONE ? '' : value,
            })
          }}
        >
          <option value={ROUTINE_SCHEDULE_NONE}>{t('routineSchedulePlaceholder')}</option>
          {ROUTINE_SCHEDULE_PRESETS.map(preset => (
            <option key={preset.value} value={preset.value}>
              {t(preset.label)}
            </option>
          ))}
        </select>
      )}
      {draft.triggerKind === 'event' && (
        <select
          aria-label={t('routineEventTrigger')}
          data-team-routine-event-trigger-select=""
          value={draft.eventTrigger}
          disabled={pending}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value
            if (value !== 'webhook_harness') return
            setDraft({ ...draft, eventTrigger: value })
          }}
        >
          {ROUTINE_EVENT_TRIGGER_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      )}
      <div className={css.formActions}>
        <button type="button" disabled={pending || !ready} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}


interface WriteMemoryFormProps {
  draft: WriteMemoryDraft
  setDraft: (draft: WriteMemoryDraft) => void
  pending: boolean
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/**
 * Host writeMemory editor for profile|log|note on the shared surface (P5 FR-001–FR-003 / T015+T018+T021).
 * Missing kind/layer or empty content show a clear reject and block Save.
 * Layer choice is orthogonal to kind (FR-017). Calls Host Remotes only.
 */
function WriteMemoryForm({
  draft, setDraft, pending, onSave, onCancel, t,
}: WriteMemoryFormProps) {
  const ready = draft.kind !== '' && draft.content.trim() !== '' && draft.layer !== ''
  const contentPlaceholder = (() => {
    switch (draft.kind) {
      case 'log':
        return t('memoryContentPlaceholder.log')
      case 'note':
        return t('memoryContentPlaceholder.note')
      case 'profile':
      case '':
        return t('memoryContentPlaceholder.profile')
      default: {
        const _exhaustive: never = draft.kind
        return _exhaustive
      }
    }
  })()
  return (
    <div
      className={css.form}
      data-team-write-memory-editor=""
      {...draft.kind !== '' ? { 'data-team-write-memory-kind': draft.kind } : {}}
    >
      <p className={css.hint}>{t('writeMemoryHint')}</p>
      {!ready && (
        <div
          className={css.error}
          role="alert"
          data-team-write-memory-reject=""
        >
          {t('memoryWriteReject')}
        </div>
      )}
      <select
        aria-label={t('memoryKind')}
        data-team-memory-kind-select=""
        value={draft.kind === '' ? MEMORY_KIND_NONE : draft.kind}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const value = event.target.value
          setDraft({
            ...draft,
            kind: value === MEMORY_KIND_NONE ? '' : value as MemoryWriteKind,
          })
        }}
      >
        <option value={MEMORY_KIND_NONE}>{t('memoryKindPlaceholder')}</option>
        {MEMORY_WRITE_KIND_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
      <textarea
        aria-label={t('memoryContent')}
        data-team-memory-content-input=""
        value={draft.content}
        placeholder={contentPlaceholder}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          setDraft({ ...draft, content: event.target.value })
        }}
      />
      <select
        aria-label={t('memoryLayer')}
        data-team-memory-layer-select=""
        value={draft.layer === '' ? MEMORY_LAYER_NONE : draft.layer}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          const value = event.target.value
          setDraft({
            ...draft,
            layer: value === MEMORY_LAYER_NONE ? '' : value as MemoryLayer,
          })
        }}
      >
        <option value={MEMORY_LAYER_NONE}>{t('memoryLayerPlaceholder')}</option>
        {MEMORY_LAYER_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
      <div className={css.formActions}>
        <button type="button" disabled={pending || !ready} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

interface AttachSkillFormProps {
  draft: AttachSkillDraft
  setDraft: (draft: AttachSkillDraft) => void
  candidates: readonly SkillCatalogSummary[]
  pending: boolean
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

interface SkillAuthorFormProps {
  draft: SkillAuthorDraft
  setDraft: (draft: SkillAuthorDraft) => void
  pending: boolean
  mode: 'create' | 'edit'
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/**
 * Host user-skill create/edit editor (FR-006 / FR-013 / T029).
 * Empty displayName or instructionalBody show a clear reject and block Save.
 */
function SkillAuthorForm({
  draft, setDraft, pending, mode, onSave, onCancel, t,
}: SkillAuthorFormProps) {
  const ready = draft.displayName.trim() !== '' && draft.instructionalBody.trim() !== ''
  return (
    <div
      className={css.form}
      data-team-skill-author-editor={mode}
    >
      <p className={css.hint}>{t('skillAuthorHint')}</p>
      {!ready && (
        <div
          className={css.error}
          role="alert"
          data-team-skill-author-reject=""
        >
          {t('skillAuthorEmptyReject')}
        </div>
      )}
      <input
        aria-label={t('displayName')}
        data-team-skill-author-name=""
        value={draft.displayName}
        placeholder={t('skillAuthorNamePlaceholder')}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setDraft({ ...draft, displayName: event.target.value })
        }}
      />
      <textarea
        aria-label={t('description')}
        data-team-skill-author-body=""
        value={draft.instructionalBody}
        placeholder={t('skillAuthorBodyPlaceholder')}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
          setDraft({ ...draft, instructionalBody: event.target.value })
        }}
      />
      <div className={css.formActions}>
        <button type="button" disabled={pending || !ready} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

/**
 * Host attachSkill picker on a bot’s skills surface (FR-003 / T023).
 * Candidates are Client available-to-attach skills from the Host catalog.
 */
function AttachSkillForm({
  draft, setDraft, candidates, pending, onSave, onCancel, t,
}: AttachSkillFormProps) {
  const ready = draft.skillId !== '' && candidates.some(skill => skill.id === draft.skillId)
  return (
    <div className={css.form} data-team-attach-skill-editor>
      <p className={css.hint}>{t('attachSkillHint')}</p>
      {candidates.length === 0
        ? (
          <div className={css.notice} data-team-attach-skill-none="">
            {t('attachSkillNoneAvailable')}
          </div>
        )
        : (
          <select
            aria-label={t('attachSkill')}
            data-team-attach-skill-select=""
            value={draft.skillId === '' ? ATTACH_SKILL_NONE : draft.skillId}
            disabled={pending}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              const value = event.target.value
              setDraft({
                skillId: value === ATTACH_SKILL_NONE ? '' : value as SkillId,
              })
            }}
          >
            <option value={ATTACH_SKILL_NONE}>{t('attachSkillPlaceholder')}</option>
            {candidates.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.displayName} ({t(skillSourceKey(skill.source))})
              </option>
            ))}
          </select>
        )}
      <div className={css.formActions}>
        <button type="button" disabled={pending || !ready} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

interface TaskFormProps {
  draft: Draft
  setDraft: (draft: Draft) => void
  pending: boolean
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

/**
 * In-app Host authenticateConnector credential form (P6 T020 / T031 / FR-002 / FR-008 / FR-009).
 * Secret is never shown after save; chat-paste is not the primary path; vault not required for Pass.
 */
interface ConnectorAuthFormProps {
  draft: ConnectorAuthDraft
  setDraft: (draft: ConnectorAuthDraft) => void
  pending: boolean
  onSave: () => void
  onCancel: () => void
  t: TeamActionProps['t']
}

function ConnectorAuthForm({
  draft, setDraft, pending, onSave, onCancel, t,
}: ConnectorAuthFormProps) {
  const ready = draft.secret.trim() !== ''
  return (
    <div
      className={css.form}
      data-team-connector-auth-editor=""
      data-team-connector-auth-mode="in_app"
    >
      <p className={css.hint}>{t('connectorAuthHint')}</p>
      <p
        className={css.hint}
        data-team-connector-vault-not-required=""
      >
        {t('connectorAuthVaultOptional')}
      </p>
      {!ready && (
        <div className={css.notice} data-team-connector-auth-reject="">
          {t('connectorAuthReject')}
        </div>
      )}
      <input
        type="password"
        autoComplete="off"
        aria-label={t('connectorAuthSecret')}
        data-team-connector-auth-secret=""
        placeholder={t('connectorAuthSecretPlaceholder')}
        value={draft.secret}
        disabled={pending}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setDraft({ secret: event.target.value })
        }}
      />
      <div className={css.formActions}>
        <button
          type="button"
          disabled={pending || !ready}
          data-team-connector-auth-save=""
          onClick={onSave}
        >
          {t('connectorAuthSave')}
        </button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}

function TaskForm({ draft, setDraft, pending, onSave, onCancel, t }: TaskFormProps) {
  const field = (key: keyof Draft, value: string): void => { setDraft({ ...draft, [key]: value }) }
  return (
    <div className={css.form}>
      <input value={draft.subject} placeholder={t('subject')} onChange={(event: ChangeEvent<HTMLInputElement>) => { field('subject', event.target.value) }} />
      <textarea value={draft.description} placeholder={t('description')} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => { field('description', event.target.value) }} />
      <input value={draft.blockers} placeholder={t('blockers')} onChange={(event: ChangeEvent<HTMLInputElement>) => { field('blockers', event.target.value) }} />
      <input value={draft.scopes} placeholder={t('scopes')} onChange={(event: ChangeEvent<HTMLInputElement>) => { field('scopes', event.target.value) }} />
      <div className={css.formActions}>
        <button type="button" disabled={pending || draft.subject.trim() === '' || draft.description.trim() === ''} onClick={onSave}>{t('save')}</button>
        <button type="button" disabled={pending} onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  )
}
