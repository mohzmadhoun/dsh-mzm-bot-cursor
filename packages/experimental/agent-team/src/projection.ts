/** Host-only Team state projected incrementally from committed Session events.

Persona (`job` / `voice` / `antiJobs`), avatar, displayName, sectionId, and
`skillAttachments` on `team/member` snapshots are Host→Client readable here —
Electron Main must not invent a parallel identity or skills store (T008–T011 /
T022 / FR-002 / FR-003 / FR-005).
Post-active Host `renameBot` / `setAvatar` / `attachSkill` journal writes update
`displayName`, preset avatar markers, and skill attachments; `listMembers` /
`agentTeams/view` re-read those fields for Client roster / sidebar / overview /
bot skills (T011 / T022 / FR-003 / FR-004 / FR-005).
Host `deleteBot` appends an `active` → `deleted` tombstone (clears `sectionId`);
Client roster / overview omit deleted rows (T026 / FR-008 / clarify lock 5).
Named sidebar sections persist as `team/section` catalog rows; membership is
Bot.`sectionId`. Unassigned/default is null/absent sectionId — no catalog row
(T031–T033 / FR-006 / clarify lock 4).
Host Routine catalog rows persist as `team/routine` (P4 Architect Option 3 SoT) —
not `dsh-schedule` session reminders; Electron Main must not invent parallel rows.
P6 extends RoutineRecord additively with `triggerKind` + `eventTrigger` (absent → cron).
Host Memory catalog rows persist as `team/memory` (P5 Host Memory catalog SoT) —
not chat transcript; Electron Main must not invent parallel rows (research R1/R6/R7).
Host Connector catalog rows persist as `team/connector` (P6 Architect Path A SoT) —
not Electron Main; secrets stay in the credential seam (research R1/R5).
*/

import { z } from 'zod'
import { brandString } from '@deepseek-ai/dsh-brand'
import { ReasoningEffortId, type ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent, SessionEventMap, SessionId } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { readHostMailboxMessage } from './host-mailbox-message.ts'
import { describeScheduleExpr } from './routine-cron.ts'
import { memoryEligibleForBot } from './validation.ts'
import type {
  AvatarMarker,
  BotPersonaProfile,
  ConnectorProjection,
  ConnectorRecord,
  HostMailboxMessage,
  MemoryProjection,
  MemoryRecord,
  RoutineEventTrigger,
  RoutineProjection,
  RoutineRecord,
  RoutineTriggerKind,
  SidebarSectionSnapshot,
  SidebarSectionView,
  SkillCatalogSummary,
  TeamId,
  TeamMemberSnapshot,
  TeamMessageId,
  TeamMessageSnapshot,
  TeamTaskSnapshot,
} from './types.ts'
import {
  ConnectorId as toConnectorId,
  MemoryId as toMemoryId,
  RoutineId as toRoutineId,
  SidebarSectionId as toSidebarSectionId,
  SkillId,
  TeamId as toTeamId,
  TeamMessageId as toTeamMessageId,
  TeamTaskId as toTeamTaskId,
} from './types.ts'
import { assertTaskGraphCandidate } from './task-graph.ts'

const nonNegativeSafeInteger = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
const positiveSafeInteger = nonNegativeSafeInteger.min(1)
const sessionIdSchema = z.string().min(1).transform(value => brandString<SessionId>(value))
const teamIdSchema = z.string().min(1).transform(value => toTeamId(value))
const numericTaskIdPattern = /^task-(\d+)$/u
const teamTaskIdSchema = z.string().min(1).refine((value) => {
  const match = numericTaskIdPattern.exec(value)
  return match === null || Number.isSafeInteger(Number(match[1]))
}, { message: 'numeric task id suffix must be a safe integer' }).transform(value => toTeamTaskId(value))
const teamMessageIdSchema = z.string().min(1).transform(value => toTeamMessageId(value))

const coreContentBlockTypes = new Set(['text', 'reasoning', 'image', 'tool-call', 'tool-result'])
const imageAttachmentSchema = z.object({
  attachmentId: z.string().min(1),
  mediaType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  bytes: nonNegativeSafeInteger,
  width: positiveSafeInteger,
  height: positiveSafeInteger,
  name: z.string().optional(),
}).strict()

// ContentBlockMap is merge-extensible. Validate every core variant exactly,
// while retaining JSON-decoded plugin variants under an unknown type tag.
const contentBlockSchema: z.ZodType<ContentBlock> = z.lazy(() => z.union([
  z.object({ type: z.literal('text'), text: z.string() }).strict(),
  z.object({ type: z.literal('reasoning'), text: z.string() }).strict(),
  z.object({ type: z.literal('image'), attachment: imageAttachmentSchema }).strict(),
  z.object({
    type: z.literal('tool-call'),
    id: z.string().min(1),
    name: z.string(),
    arguments: z.string(),
  }).strict(),
  z.object({
    type: z.literal('tool-result'),
    toolCallId: z.string().min(1),
    content: z.array(contentBlockSchema),
    isError: z.boolean().optional(),
  }).strict(),
  z.object({ type: z.string().min(1) }).loose().refine(
    block => !coreContentBlockTypes.has(block.type),
    { message: 'known content block types must match their declared fields' },
  ),
])) as z.ZodType<ContentBlock>

const modelSelectionSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  reasoningEffort: z.string().min(1).transform(value => ReasoningEffortId(value)).optional(),
}).strict()

const botPersonaProfileSchema = z.object({
  job: z.string(),
  voice: z.string(),
  antiJobs: z.array(z.string()),
}).strict() as z.ZodType<BotPersonaProfile>

const avatarMarkerSchema = z.object({
  shape: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
}).strict() as z.ZodType<AvatarMarker>

const sidebarSectionIdSchema = z.string().min(1).transform(value => toSidebarSectionId(value))

const teamMemberSnapshotSchema = z.object({
  id: sessionIdSchema,
  name: z.string(),
  description: z.string(),
  displayName: z.string().optional(),
  modelSelection: modelSelectionSchema.optional(),
  persona: botPersonaProfileSchema.optional(),
  avatar: avatarMarkerSchema.optional(),
  sectionId: z.union([sidebarSectionIdSchema, z.null()]).optional(),
  skillAttachments: z.array(z.object({
    botId: sessionIdSchema,
    skillId: z.string().min(1).transform(value => SkillId(value)),
    attachedAt: z.number().optional(),
  }).strict()).optional(),
  provider: z.string(),
  context: z.enum(['fresh', 'fork']),
  phase: z.enum(['provisioning', 'active', 'failed', 'deleted']),
  error: z.string().optional(),
}).strict() as z.ZodType<TeamMemberSnapshot>

const teamTaskSnapshotSchema = z.object({
  id: teamTaskIdSchema,
  revision: positiveSafeInteger,
  subject: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'deleted']),
  ownerId: sessionIdSchema.optional(),
  blockedBy: z.array(teamTaskIdSchema),
  writeScopes: z.array(z.string()),
}).strict() as z.ZodType<TeamTaskSnapshot>

const teamMessageSnapshotSchema = z.object({
  id: teamMessageIdSchema,
  senderId: sessionIdSchema,
  senderName: z.string(),
  targetId: sessionIdSchema,
  content: z.array(contentBlockSchema),
}).strict() as z.ZodType<TeamMessageSnapshot>

const teamEventSelectorSchema = z.object({
  version: nonNegativeSafeInteger,
  teamId: teamIdSchema,
}).loose()

const teamMemberEventSchema = z.object({
  version: z.literal(2),
  teamId: teamIdSchema,
  member: teamMemberSnapshotSchema,
}).strict() as z.ZodType<SessionEventMap['team/member']>

const teamTaskEventSchema = z.object({
  version: z.literal(2),
  teamId: teamIdSchema,
  task: teamTaskSnapshotSchema,
}).strict() as z.ZodType<SessionEventMap['team/task']>

const teamMessageQueuedEventSchema = z.object({
  version: z.literal(2),
  teamId: teamIdSchema,
  message: teamMessageSnapshotSchema,
}).strict() as z.ZodType<SessionEventMap['team/message/queued']>

const teamMessageDeliveredEventSchema = z.object({
  version: z.literal(2),
  teamId: teamIdSchema,
  messageId: teamMessageIdSchema,
  targetId: sessionIdSchema,
}).strict() as z.ZodType<SessionEventMap['team/message/delivered']>

const sidebarSectionSnapshotSchema = z.object({
  id: sidebarSectionIdSchema,
  name: z.string().min(1),
}).strict() as z.ZodType<SidebarSectionSnapshot>

const teamSectionEventSchema = z.object({
  version: z.literal(2),
  teamId: teamIdSchema,
  section: sidebarSectionSnapshotSchema,
}).strict() as z.ZodType<SessionEventMap['team/section']>

const routineIdSchema = z.string().min(1).transform(value => toRoutineId(value))

const routineRecordSchema = z.object({
  routineId: routineIdSchema,
  botId: sessionIdSchema,
  intent: z.string().min(1),
  scheduleExpr: z.string(),
  triggerKind: z.enum(['cron', 'event']).optional(),
  eventTrigger: z.enum(['webhook_harness']).optional(),
  status: z.enum(['active', 'paused']),
  lastRunAt: z.union([z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), z.null()]),
  createdAt: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  updatedAt: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict().transform((row): RoutineRecord => {
  const triggerKind: RoutineTriggerKind = row.triggerKind ?? 'cron'
  if (triggerKind === 'cron' && row.scheduleExpr.trim().length === 0) {
    throw new Error(`routine "${row.routineId}" cron scheduleExpr must be non-empty`)
  }
  if (triggerKind === 'event') {
    if (row.eventTrigger !== 'webhook_harness') {
      throw new Error(`routine "${row.routineId}" event rows require eventTrigger=webhook_harness`)
    }
    return {
      ...row,
      triggerKind,
      scheduleExpr: '',
      eventTrigger: row.eventTrigger,
    }
  }
  return {
    routineId: row.routineId,
    botId: row.botId,
    intent: row.intent,
    scheduleExpr: row.scheduleExpr,
    triggerKind,
    status: row.status,
    lastRunAt: row.lastRunAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
})

const teamRoutineEventSchema = z.object({
  version: z.literal(2),
  teamId: teamIdSchema,
  routine: routineRecordSchema,
}).strict() as z.ZodType<SessionEventMap['team/routine']>

const memoryIdSchema = z.string().min(1).transform(value => toMemoryId(value))

const memoryRecordSchema = z.object({
  memoryId: memoryIdSchema,
  kind: z.enum(['profile', 'log', 'note']),
  layer: z.enum(['agent', 'user']),
  botId: z.union([sessionIdSchema, z.null()]),
  content: z.string().min(1),
  createdAt: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  updatedAt: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict() as z.ZodType<MemoryRecord>

const teamMemoryEventSchema = z.object({
  version: z.literal(2),
  teamId: teamIdSchema,
  memory: memoryRecordSchema,
}).strict() as z.ZodType<SessionEventMap['team/memory']>

const connectorIdSchema = z.string().min(1).transform(value => toConnectorId(value))

const connectorRecordSchema = z.object({
  connectorId: connectorIdSchema,
  catalogId: z.string().min(1),
  serverName: z.string().min(1),
  displayName: z.string().min(1),
  installState: z.enum(['available', 'installing', 'installed', 'failed']),
  authState: z.enum(['none', 'needs_auth', 'authenticating', 'ready', 'failed']),
  transport: z.enum(['stdio', 'streamable-http']),
  credentialKey: z.string().min(1).optional(),
  error: z.string().min(1).optional(),
  createdAt: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  updatedAt: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict() as z.ZodType<ConnectorRecord>

const teamConnectorEventSchema = z.object({
  version: z.literal(2),
  teamId: teamIdSchema,
  connector: connectorRecordSchema,
}).strict() as z.ZodType<SessionEventMap['team/connector']>

/** Current Team state selected by durable Team identity. */
export interface TeamState {
  readonly id: TeamId
  readonly members: TeamMemberSnapshot[]
  /** Named sidebar section catalog only — Unassigned has no row (clarify lock 4). */
  readonly sections: SidebarSectionSnapshot[]
  /** Host Routine catalog (P4 Architect Option 3 SoT; P6 additive event fields). */
  readonly routines: RoutineRecord[]
  /** Host Memory catalog (P5 Host Memory catalog SoT). */
  readonly memories: MemoryRecord[]
  /** Host Connector catalog (P6 Architect Path A SoT). */
  readonly connectors: ConnectorRecord[]
  readonly tasks: TeamTaskSnapshot[]
  readonly messages: TeamMessageSnapshot[]
  readonly delivered: TeamMessageId[]
  nextTaskNumber: number
}

/**
 * Construct empty state for one Team identity.
 * @param rootId - root Session identity.
 * @returns mutable empty Team state.
 */
export function emptyTeamState(rootId: SessionId): TeamProjectionState {
  return {
    id: toTeamId(rootId),
    members: [],
    sections: [],
    routines: [],
    memories: [],
    connectors: [],
    tasks: [],
    messages: [],
    delivered: [],
    nextTaskNumber: 1,
  }
}

/** Checkpoint-safe state for the Team owned by the projected Session. */
export interface TeamProjectionState extends TeamState {
  failure?: string
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    agentTeam: TeamProjectionState
  }
}

const teamProjectionEntrySchema = z.object({
  id: teamIdSchema,
  members: z.array(teamMemberSnapshotSchema),
  sections: z.array(sidebarSectionSnapshotSchema),
  routines: z.array(routineRecordSchema),
  memories: z.array(memoryRecordSchema),
  connectors: z.array(connectorRecordSchema),
  tasks: z.array(teamTaskSnapshotSchema),
  messages: z.array(teamMessageSnapshotSchema),
  delivered: z.array(teamMessageIdSchema),
  nextTaskNumber: positiveSafeInteger,
  failure: z.string().optional(),
}).strict() as z.ZodType<TeamProjectionState>

/** Whether one event belongs to the Team domain. */
export type TeamEventType =
  | 'team/member'
  | 'team/task'
  | 'team/section'
  | 'team/routine'
  | 'team/memory'
  | 'team/connector'
  | 'team/message/queued'
  | 'team/message/delivered'

/** One event owned by the Team domain. */
type TeamSessionEvent = SessionEvent<TeamEventType>

/**
 * Test whether a Session event belongs to the Team domain.
 * @param event - candidate Session event.
 * @returns whether the event has a Team-owned type.
 */
export function isTeamEvent(event: SessionEvent): event is TeamSessionEvent {
  return event.type === 'team/member'
    || event.type === 'team/task'
    || event.type === 'team/section'
    || event.type === 'team/routine'
    || event.type === 'team/memory'
    || event.type === 'team/connector'
    || event.type === 'team/message/queued'
    || event.type === 'team/message/delivered'
}

/** Decode one persisted Team value and retain the schema failure as its cause. */
function parsePersisted<T>(type: TeamEventType, schema: z.ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value)
  } catch (error: unknown) {
    throw new Error(`persisted Agent Teams ${type} payload is invalid`, { cause: error })
  }
}

/** Decode the complete current-version payload selected by one Team event type. */
function parseCurrentTeamEvent(event: TeamSessionEvent): TeamSessionEvent {
  switch (event.type) {
    case 'team/member':
      return { ...event, data: parsePersisted(event.type, teamMemberEventSchema, event.data) }
    case 'team/task':
      return { ...event, data: parsePersisted(event.type, teamTaskEventSchema, event.data) }
    case 'team/section':
      return { ...event, data: parsePersisted(event.type, teamSectionEventSchema, event.data) }
    case 'team/routine':
      return { ...event, data: parsePersisted(event.type, teamRoutineEventSchema, event.data) }
    case 'team/memory':
      return { ...event, data: parsePersisted(event.type, teamMemoryEventSchema, event.data) }
    case 'team/connector':
      return { ...event, data: parsePersisted(event.type, teamConnectorEventSchema, event.data) }
    case 'team/message/queued':
      return { ...event, data: parsePersisted(event.type, teamMessageQueuedEventSchema, event.data) }
    case 'team/message/delivered':
      return { ...event, data: parsePersisted(event.type, teamMessageDeliveredEventSchema, event.data) }
    /* v8 ignore next 2 -- TeamEventType is closed and every member is handled above. */
    default:
      return event
  }
}

function applyProjectionEvent(state: TeamProjectionState, event: SessionEvent): void {
  if (state.failure !== undefined) return
  if (!isTeamEvent(event)) return
  try {
    const selector = parsePersisted(event.type, teamEventSelectorSchema, event.data)
    if (selector.teamId !== state.id) return
    if (selector.version !== 2) {
      throw new Error(`unsupported Agent Teams event version ${String(selector.version)}`)
    }
    applyCurrentTeamEvent(state, parseCurrentTeamEvent(event))
  } catch (error: unknown) {
    /* v8 ignore next -- the owned Team transition throws Error instances. */
    state.failure = error instanceof Error ? error.message : String(error)
  }
}

function applyCurrentTeamEvent(state: TeamState, event: TeamSessionEvent): void {
  switch (event.type) {
    case 'team/member': {
      const member = event.data.member
      const index = state.members.findIndex(candidate => candidate.id === member.id)
      const prior = state.members[index]
      const named = state.members.find(candidate => candidate.name === member.name)
      if (named !== undefined && named.id !== member.id) {
        throw new Error(`teammate name "${member.name}" is reused by another member`)
      }
      if (prior === undefined) {
        if (member.phase !== 'provisioning') throw new Error(`teammate "${member.name}" must begin provisioning`)
      } else {
        if (prior.name !== member.name
          || prior.provider !== member.provider
          || prior.context !== member.context
          || !sameModelSelection(prior.modelSelection, member.modelSelection)) {
          throw new Error(`teammate "${member.id}" changed immutable identity fields`)
        }
        if (prior.phase === 'provisioning') {
          if (member.phase === 'provisioning') {
            throw new Error(`teammate "${member.name}" has an invalid ${prior.phase} -> ${member.phase} transition`)
          }
          // provisioning → active|failed: retain create-time displayName and optional P2 identity fields.
          if (prior.displayName !== member.displayName
            || !samePersona(prior.persona, member.persona)
            || !sameAvatar(prior.avatar, member.avatar)
            || !sameSectionId(prior.sectionId, member.sectionId)
            || !sameSkillAttachments(prior.skillAttachments, member.skillAttachments)) {
            throw new Error(`teammate "${member.id}" changed identity fields during provisioning settlement`)
          }
        } else if (prior.phase === 'active' && member.phase === 'active') {
          // Post-active Host identity mutations (rename / persona / avatar / section / skills).
          // displayName, persona, avatar, sectionId, skillAttachments, and description may change;
          // modelSelection may not.
        } else if (prior.phase === 'active' && member.phase === 'deleted') {
          // Host delete tombstone (FR-008): clear section membership; other presentation
          // fields may stay for audit. Transcript / mailbox rows are not rewritten here.
        } else {
          throw new Error(`teammate "${member.name}" has an invalid ${prior.phase} -> ${member.phase} transition`)
        }
      }
      if (index < 0) state.members.push(member)
      else state.members[index] = member
      break
    }
    case 'team/task': {
      const task = event.data.task
      const index = state.tasks.findIndex(candidate => candidate.id === task.id)
      const prior = state.tasks[index]
      if (prior === undefined && task.revision !== 1) {
        throw new Error(`team task "${task.id}" must begin at revision 1`)
      }
      if (prior !== undefined && task.revision !== prior.revision + 1) {
        throw new Error(`team task "${task.id}" revision is not contiguous`)
      }
      assertTaskGraphCandidate(state.tasks, task)
      const match = numericTaskIdPattern.exec(task.id)
      if (match !== null) {
        const number = Number(match[1])
        state.nextTaskNumber = Math.max(
          state.nextTaskNumber,
          number === Number.MAX_SAFE_INTEGER ? number : number + 1,
        )
      }
      if (index < 0) state.tasks.push(task)
      else state.tasks[index] = task
      break
    }
    case 'team/section': {
      const section = event.data.section
      if (section.name.trim().length === 0) {
        throw new Error(`sidebar section "${section.id}" name must be non-empty`)
      }
      const index = state.sections.findIndex(candidate => candidate.id === section.id)
      if (index < 0) state.sections.push(section)
      else state.sections[index] = section
      break
    }
    case 'team/routine': {
      const routine = event.data.routine
      if (routine.intent.trim().length === 0) {
        throw new Error(`routine "${routine.routineId}" intent must be non-empty`)
      }
      const triggerKind = routine.triggerKind ?? 'cron'
      if (triggerKind === 'cron' && routine.scheduleExpr.trim().length === 0) {
        throw new Error(`routine "${routine.routineId}" scheduleExpr must be non-empty`)
      }
      if (triggerKind === 'event' && routine.eventTrigger !== 'webhook_harness') {
        throw new Error(`routine "${routine.routineId}" event rows require eventTrigger=webhook_harness`)
      }
      if (routine.status !== 'active' && routine.status !== 'paused') {
        throw new Error(`routine "${routine.routineId}" status must be active or paused`)
      }
      const index = state.routines.findIndex(candidate => candidate.routineId === routine.routineId)
      if (index < 0) state.routines.push(routine)
      else state.routines[index] = routine
      break
    }
    case 'team/memory': {
      const memory = event.data.memory
      if (memory.content.trim().length === 0) {
        throw new Error(`memory "${memory.memoryId}" content must be non-empty`)
      }
      if (memory.kind !== 'profile' && memory.kind !== 'log' && memory.kind !== 'note') {
        throw new Error(`memory "${memory.memoryId}" kind must be profile, log, or note`)
      }
      if (memory.layer !== 'agent' && memory.layer !== 'user') {
        throw new Error(`memory "${memory.memoryId}" layer must be agent or user`)
      }
      if (memory.layer === 'agent') {
        if (memory.botId === null || String(memory.botId).trim().length === 0) {
          throw new Error(`memory "${memory.memoryId}" agent layer requires botId`)
        }
      } else if (memory.botId !== null) {
        throw new Error(`memory "${memory.memoryId}" user layer must not set botId`)
      }
      const index = state.memories.findIndex(candidate => candidate.memoryId === memory.memoryId)
      if (index < 0) state.memories.push(memory)
      else state.memories[index] = memory
      break
    }
    case 'team/connector': {
      const connector = event.data.connector
      if (connector.catalogId.trim().length === 0) {
        throw new Error(`connector "${connector.connectorId}" catalogId must be non-empty`)
      }
      if (connector.serverName.trim().length === 0) {
        throw new Error(`connector "${connector.connectorId}" serverName must be non-empty`)
      }
      if (connector.displayName.trim().length === 0) {
        throw new Error(`connector "${connector.connectorId}" displayName must be non-empty`)
      }
      const index = state.connectors.findIndex(candidate => candidate.connectorId === connector.connectorId)
      if (index < 0) state.connectors.push(connector)
      else state.connectors[index] = connector
      break
    }
    case 'team/message/queued': {
      const message = event.data.message
      if (state.messages.some(candidate => candidate.id === message.id)) {
        throw new Error(`team message "${message.id}" was queued twice`)
      }
      state.messages.push(message)
      break
    }
    case 'team/message/delivered': {
      const queued = state.messages.find(message => message.id === event.data.messageId)
      if (queued === undefined) throw new Error(`team message "${event.data.messageId}" was delivered before queueing`)
      if (queued.targetId !== event.data.targetId) throw new Error(`team message "${event.data.messageId}" target changed`)
      if (state.delivered.includes(event.data.messageId)) throw new Error(`team message "${event.data.messageId}" was delivered twice`)
      state.delivered.push(event.data.messageId)
      break
    }
    /* v8 ignore next 2 -- TeamEventType is closed and every member is handled above. */
    default:
      return
  }
}

/** Compare durable per-bot ModelSelection rows for identity immutability. */
function sameModelSelection(
  left: TeamMemberSnapshot['modelSelection'],
  right: TeamMemberSnapshot['modelSelection'],
): boolean {
  if (left === right) return true
  if (left === undefined || right === undefined) return false
  return left.provider === right.provider
    && left.model === right.model
    && left.reasoningEffort === right.reasoningEffort
}

/** Compare durable persona profiles during provisioning settlement. */
function samePersona(
  left: TeamMemberSnapshot['persona'],
  right: TeamMemberSnapshot['persona'],
): boolean {
  if (left === right) return true
  if (left === undefined || right === undefined) return false
  return left.job === right.job
    && left.voice === right.voice
    && left.antiJobs.length === right.antiJobs.length
    && left.antiJobs.every((item, index) => item === right.antiJobs[index])
}

/** Compare durable avatar markers during provisioning settlement. */
function sameAvatar(
  left: TeamMemberSnapshot['avatar'],
  right: TeamMemberSnapshot['avatar'],
): boolean {
  if (left === right) return true
  if (left === undefined || right === undefined) return false
  return left.shape === right.shape && left.color === right.color
}

/** Compare section membership during provisioning settlement (`null` and absent differ). */
function sameSectionId(
  left: TeamMemberSnapshot['sectionId'],
  right: TeamMemberSnapshot['sectionId'],
): boolean {
  return left === right
}

/** Compare ordered skill attachments during provisioning settlement. */
function sameSkillAttachments(
  left: TeamMemberSnapshot['skillAttachments'],
  right: TeamMemberSnapshot['skillAttachments'],
): boolean {
  if (left === right) return true
  if (left === undefined || right === undefined) return left === right
  if (left.length !== right.length) return false
  return left.every((item, index) => {
    const other = right[index]
    return other !== undefined
      && item.botId === other.botId
      && item.skillId === other.skillId
      && item.attachedAt === other.attachedAt
  })
}

/** Host-only Team projection selected by the projected Session identity. */
export const teamProjectionDefinition = {
  key: 'agentTeam',
  // Bumped when Host Connector catalog joined TeamState (P6 T009).
  stateVersion: 7,
  stateSchema: teamProjectionEntrySchema,
  init: header => emptyTeamState(header.id),
  apply: (state, event) => {
    applyProjectionEvent(state, event)
    return state
  },
} satisfies ProjectionDefinition<'agentTeam', TeamProjectionState>

/**
 * Derive Client sidebar section views from the Host catalog + roster membership.
 * Unassigned/default is {@link unassignedBotIds} — never a stored section row (clarify lock 4).
 * @param state - projected Team state (named catalog + members).
 * @returns named sections with roster-ordered botIds, plus Unassigned bot ids.
 */
export function projectSidebarSections(state: TeamState): {
  readonly sections: readonly SidebarSectionView[]
  readonly unassignedBotIds: readonly SessionId[]
} {
  const catalogIds = new Set(state.sections.map(section => section.id))
  const teammates = state.members.filter(member => member.phase !== 'deleted')
  const sections: SidebarSectionView[] = state.sections.map(section => ({
    id: section.id,
    name: section.name,
    botIds: teammates
      .filter(member => member.sectionId === section.id)
      .map(member => member.id),
  }))
  const unassignedBotIds = teammates
    .filter(member => member.sectionId == null || !catalogIds.has(member.sectionId))
    .map(member => member.id)
  return { sections, unassignedBotIds }
}

/**
 * Project Host Routine catalog rows for Client pane list (P4 US2 T019 / FR-002).
 * Host journal SoT only — never invent rows from Electron Main or `ui-schedule`.
 * @param state - projected Team state.
 * @param botId - when set, restrict to that bot’s routines (SC-006); omit for full catalog.
 * @returns Client {@link RoutineProjection} rows in catalog order.
 */
export function projectRoutines(
  state: TeamState,
  botId?: SessionId,
): readonly RoutineProjection[] {
  const rows = botId === undefined
    ? state.routines
    : state.routines.filter(routine => routine.botId === botId)
  return rows.map(projectRoutine)
}

/**
 * Map one durable {@link RoutineRecord} to a Client pane {@link RoutineProjection}.
 * Identity derives from intent; scheduleLabel is human-readable (cron) or event-family
 * label (P6); status and lastRunAt pass through.
 * @param routine - Host catalog row.
 * @returns pane-ready projection (US2 T019 / FR-002; P6 event distinguishable).
 */
export function projectRoutine(routine: RoutineRecord): RoutineProjection {
  const triggerKind = routine.triggerKind ?? 'cron'
  const eventTrigger = routine.eventTrigger
  return {
    routineId: routine.routineId,
    botId: routine.botId,
    identity: routine.intent,
    intent: routine.intent,
    triggerKind,
    scheduleExpr: routine.scheduleExpr,
    scheduleLabel: triggerKind === 'event'
      ? describeEventTrigger(eventTrigger)
      : describeScheduleExpr(routine.scheduleExpr),
    ...eventTrigger === undefined ? {} : { eventTrigger },
    status: routine.status,
    lastRunAt: routine.lastRunAt,
    createdAt: routine.createdAt,
    updatedAt: routine.updatedAt,
  }
}

/**
 * Human-readable event-family label for Client pane projection.
 * @param trigger - Pass event trigger id, when present.
 * @returns pane label.
 */
function describeEventTrigger(trigger: RoutineEventTrigger | undefined): string {
  if (trigger === 'webhook_harness') return 'Webhook harness'
  return 'Event'
}

/**
 * Project Host Memory catalog rows for Client browse / recall (P5 FR-007 / US5 T027).
 * Host journal SoT only — never invent rows from Electron Main, Client local store, or transcript.
 * When `botId` is set: that bot’s agent-layer rows plus all account-wide user-layer rows
 * ({@link memoryEligibleForBot} — bot B MUST NOT list A’s agent rows as B’s).
 * When omitted: full catalog.
 * @param state - projected Team state.
 * @param botId - optional bot context for agent isolation + user sharing.
 * @returns Client {@link MemoryProjection} rows in catalog order.
 */
export function projectMemories(
  state: TeamState,
  botId?: SessionId,
): readonly MemoryProjection[] {
  const rows = botId === undefined
    ? state.memories
    : state.memories.filter(memory => memoryEligibleForBot(memory, botId))
  return rows.map(projectMemory)
}

/**
 * Map one durable {@link MemoryRecord} to a Client {@link MemoryProjection}.
 * @param memory - Host catalog row.
 * @returns browse-ready projection (kinds and layers distinguishable).
 */
export function projectMemory(memory: MemoryRecord): MemoryProjection {
  return {
    memoryId: memory.memoryId,
    kind: memory.kind,
    layer: memory.layer,
    botId: memory.botId,
    content: memory.content,
    createdAt: memory.createdAt,
    updatedAt: memory.updatedAt,
  }
}

/**
 * Project Host Connector catalog rows for Client install/auth surfaces (P6 T009 / T012).
 * Host journal SoT only — never invent rows from Electron Main or Client local store.
 * Secret values are never projected (`credentialConfigured` is boolean only).
 * @param state - projected Team state.
 * @returns Client {@link ConnectorProjection} rows in catalog order.
 */
export function projectConnectors(state: TeamState): readonly ConnectorProjection[] {
  return state.connectors.map(projectConnector)
}

/**
 * Map one durable {@link ConnectorRecord} to a Client {@link ConnectorProjection}.
 * @param connector - Host catalog row.
 * @returns install/auth-ready projection without secret values.
 */
export function projectConnector(connector: ConnectorRecord): ConnectorProjection {
  return {
    connectorId: connector.connectorId,
    catalogId: connector.catalogId,
    serverName: connector.serverName,
    displayName: connector.displayName,
    installState: connector.installState,
    authState: connector.authState,
    transport: connector.transport,
    credentialConfigured: connector.credentialKey !== undefined
      && connector.credentialKey.trim().length > 0
      && connector.authState === 'ready',
    ...connector.error === undefined ? {} : { error: connector.error },
    createdAt: connector.createdAt,
    updatedAt: connector.updatedAt,
  }
}

/**
 * Project Client-visible Host mailbox handoffs from Lead Session events plus
 * per-target Session logs (FR-005). Order follows Lead queue order. Each row is
 * a product {@link HostMailboxMessage} with Host-only `source` — never Electron IPC.
 * @param leadEvents - Lead Session events (owns `team/message/*`).
 * @param targetEventsById - recipient Session event logs keyed by `toBotId`.
 * @param teamId - durable Team identity; events for other Teams are ignored.
 * @returns detached handoff rows reconstructable without Main-synthesized IPC.
 */
export function projectMailboxHandoffs(
  leadEvents: readonly SessionEvent[],
  targetEventsById: ReadonlyMap<SessionId, readonly SessionEvent[]>,
  teamId: TeamId,
): HostMailboxMessage[] {
  const handoffs: HostMailboxMessage[] = []
  for (const event of leadEvents) {
    if (event.type !== 'team/message/queued') continue
    if (event.data.teamId !== teamId) continue
    const messageId = event.data.message.id
    const targetId = event.data.message.targetId
    const targetEvents = targetEventsById.get(targetId) ?? []
    const handoff = readHostMailboxMessage(leadEvents, targetEvents, messageId)
    if (handoff !== undefined) handoffs.push(handoff)
  }
  return handoffs
}

/** Provider skill summary fields consumed when projecting the Host product catalog (T015). */
export interface SkillCatalogSourceEntry {
  readonly name: string
  readonly description: string
  readonly source: string
}

/**
 * Project Host `ctx.skills` (or equivalent) summaries into Client-readable catalog rows.
 * Pass discovery lists exactly one `managed` skill: id `mzm-thin-pack` with display
 * `MzM thin pack` (FR-001 / FR-008 / SC-004). Other provider `bundled` skills (office-*,
 * badges) stay installed in `ctx.skills` for model use but are omitted from this surface.
 * Remaining non-bundled rows map to product `user`. Electron Main must not invent catalog
 * rows — call only with Host registry results.
 * @param entries - winning skill summaries from the Host skills registry.
 * @returns detached catalog summaries for Agent Teams / Desktop Web discovery.
 */
export function projectSkillCatalog(
  entries: readonly SkillCatalogSourceEntry[],
): readonly SkillCatalogSummary[] {
  const catalog: SkillCatalogSummary[] = []
  for (const summary of entries) {
    // Omit non-thin-pack bundled skills from Pass discovery (SC-004 / T032).
    if (summary.source === 'bundled' && summary.name !== 'mzm-thin-pack') continue
    const managed = summary.name === 'mzm-thin-pack'
    const description = summary.description.trim()
    catalog.push({
      id: SkillId(summary.name),
      displayName: managed
        ? 'MzM thin pack'
        : (description.length > 0 ? description : summary.name),
      source: managed ? 'managed' : 'user',
      ...(description.length > 0 ? { description } : {}),
    })
  }
  return catalog
}
