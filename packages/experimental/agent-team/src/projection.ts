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
*/

import { z } from 'zod'
import { brandString } from '@deepseek-ai/dsh-brand'
import { ReasoningEffortId, type ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent, SessionEventMap, SessionId } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { readHostMailboxMessage } from './host-mailbox-message.ts'
import type {
  AvatarMarker,
  BotPersonaProfile,
  HostMailboxMessage,
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

/** Current Team state selected by durable Team identity. */
export interface TeamState {
  readonly id: TeamId
  readonly members: TeamMemberSnapshot[]
  /** Named sidebar section catalog only — Unassigned has no row (clarify lock 4). */
  readonly sections: SidebarSectionSnapshot[]
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
  // Bumped when named section catalog joined TeamState (T031).
  stateVersion: 4,
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
 * Maps provider sources onto product `managed` | `user`; thin-pack id `mzm-thin-pack` is
 * always `managed` with human-readable display `MzM thin pack` (FR-001 / discover-load).
 * Electron Main must not invent catalog rows — call only with Host registry results.
 * @param entries - winning skill summaries from the Host skills registry.
 * @returns detached catalog summaries for Agent Teams / Desktop Web discovery.
 */
export function projectSkillCatalog(
  entries: readonly SkillCatalogSourceEntry[],
): readonly SkillCatalogSummary[] {
  return entries.map((summary): SkillCatalogSummary => {
    const managed = summary.source === 'bundled'
      || summary.name === 'mzm-thin-pack'
    const description = summary.description.trim()
    return {
      id: SkillId(summary.name),
      displayName: managed && summary.name === 'mzm-thin-pack'
        ? 'MzM thin pack'
        : (description.length > 0 ? description : summary.name),
      source: managed ? 'managed' : 'user',
      ...(description.length > 0 ? { description } : {}),
    }
  })
}
