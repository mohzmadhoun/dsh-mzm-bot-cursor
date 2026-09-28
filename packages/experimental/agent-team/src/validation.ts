/** Input normalization shared by Team roster and task commands. */

import type { ModelSelection } from '@deepseek-ai/dsh-agent'
import type { SessionId } from '@deepseek-ai/dsh-session'
import { TeamError } from './error.ts'
import type {
  AvatarColorId,
  AvatarMarker,
  AvatarShapeId,
  BotPersonaProfile,
  MemoryKind,
  MemoryLayer,
  MemoryRecord,
  SkillId,
} from './types.ts'
import { SkillId as toSkillId } from './types.ts'
import { parseScheduleExpr } from './routine-cron.ts'

const PERSONA_FIELD_MAX = 200
const PERSONA_ANTI_JOB_MAX_ITEMS = 64
const MEMORY_CONTENT_MAX = 100_000
const MEMORY_KINDS: ReadonlySet<string> = new Set(['profile', 'log', 'note'])
const MEMORY_LAYERS: ReadonlySet<string> = new Set(['agent', 'user'])

/** Fixed preset shape ids accepted by Host `setAvatar` (FR-005 / clarify lock 3). */
export const AVATAR_SHAPE_IDS = ['circle', 'square', 'triangle', 'hexagon'] as const satisfies readonly AvatarShapeId[]

/** Fixed preset color ids accepted by Host `setAvatar` (FR-005 / clarify lock 3). */
export const AVATAR_COLOR_IDS = ['blue', 'green', 'orange', 'purple', 'red', 'gray'] as const satisfies readonly AvatarColorId[]

const AVATAR_SHAPE_SET: ReadonlySet<string> = new Set(AVATAR_SHAPE_IDS)
const AVATAR_COLOR_SET: ReadonlySet<string> = new Set(AVATAR_COLOR_IDS)

/**
 * Normalize one required human-authored string.
 * @param value - raw input value.
 * @param field - diagnostic field name.
 * @param maxLength - maximum normalized character count.
 * @returns trimmed non-empty text.
 */
export function requiredText(value: string, field: string, maxLength: number): string {
  const text = value.trim()
  if (text.length === 0) throw new TeamError(`${field} must be non-empty`, 'TEAM_INVALID_ARGUMENT')
  if (text.length > maxLength) {
    throw new TeamError(`${field} exceeds ${maxLength} characters`, 'TEAM_INVALID_ARGUMENT')
  }
  return text
}

/**
 * Normalize one required product Bot display name.
 * @param value - raw displayName from Host create.
 * @returns trimmed non-empty label.
 */
export function requiredDisplayName(value: string): string {
  return requiredText(value, 'displayName', 200)
}

/**
 * Normalize one required named sidebar section title (FR-006).
 * Empty / whitespace-only names reject create and rename without writing.
 * @param value - raw section name from Host create/rename.
 * @returns trimmed non-empty title.
 */
export function requiredSectionName(value: string): string {
  return requiredText(value, 'section name', 200)
}

/**
 * Normalize one required skill catalog id (FR-003).
 * @param value - raw skill id from Host attach / authoring.
 * @returns branded non-empty skill id.
 */
export function requiredSkillId(value: string): SkillId {
  return toSkillId(requiredText(value, 'skillId', 200))
}

/**
 * Normalize user-authored skill display name (FR-013).
 * Empty / whitespace-only names reject without writing.
 * @param value - raw display name.
 * @returns trimmed non-empty label.
 */
export function requiredSkillDisplayName(value: string): string {
  return requiredText(value, 'displayName', 200)
}

/**
 * Normalize user-authored skill instructional body (FR-013).
 * Empty / whitespace-only bodies reject without writing.
 * @param value - raw instructional Markdown/body.
 * @returns trimmed non-empty body.
 */
export function requiredSkillInstructionalBody(value: string): string {
  return requiredText(value, 'instructionalBody', 100_000)
}

/**
 * Normalize Host routine wake intent (P4 US1 FR-001 / T015).
 * Empty / whitespace-only intents reject create without writing.
 * @param value - raw intent from Host create.
 * @returns trimmed non-empty intent text.
 */
export function requiredRoutineIntent(value: string): string {
  return requiredText(value, 'intent', 10_000)
}

/**
 * Normalize and validate Host routine scheduleExpr (P4 US1 FR-001 / T015; evaluator T008).
 * Rejects empty / unsupported expressions with a stable TeamError.
 * @param value - raw schedule expression.
 * @returns trimmed product-supported scheduleExpr string.
 */
export function requiredScheduleExpr(value: string): string {
  return parseScheduleExpr(value).expr
}

/**
 * Normalize Host memory content (P5 FR-001…003 / T006 / US1 T014 / US2 T017 / US3 T020).
 * Empty / whitespace-only content rejects write without persisting
 * (`content must be non-empty` — clear Client-visible Remote reason for profile, log, and note).
 * @param value - raw content from Host write.
 * @returns trimmed non-empty curated fact text.
 */
export function requiredMemoryContent(value: string): string {
  return requiredText(value, 'content', MEMORY_CONTENT_MAX)
}

/**
 * Normalize Host memory kind vocabulary (P5 FR-001…003 / FR-017).
 * @param value - raw kind candidate.
 * @returns validated kind (`profile` | `log` | `note`).
 */
export function requiredMemoryKind(value: string): MemoryKind {
  if (typeof value !== 'string') {
    throw new TeamError('kind must be a string', 'TEAM_INVALID_ARGUMENT')
  }
  const kind = value.trim()
  if (!MEMORY_KINDS.has(kind)) {
    throw new TeamError(
      'kind must be one of: profile, log, note',
      'TEAM_INVALID_ARGUMENT',
    )
  }
  return kind as MemoryKind
}

/**
 * Normalize Host memory layer (P5 ADR / FR-006 / FR-017).
 * @param value - raw layer candidate.
 * @returns validated layer (`agent` | `user`).
 */
export function requiredMemoryLayer(value: string): MemoryLayer {
  if (typeof value !== 'string') {
    throw new TeamError('layer must be a string', 'TEAM_INVALID_ARGUMENT')
  }
  const layer = value.trim()
  if (!MEMORY_LAYERS.has(layer)) {
    throw new TeamError(
      'layer must be one of: agent, user',
      'TEAM_INVALID_ARGUMENT',
    )
  }
  return layer as MemoryLayer
}

/**
 * Whether one Host Memory catalog row is eligible for a bot context (US5 T027 / FR-006/007).
 * Agent-layer rows match only that `botId`; user-layer rows are account-wide across bots.
 * Transcript lines are never MemoryRecord rows — this predicate only accepts catalog fields.
 * @param memory - durable Host row (or projection-equivalent layer/botId pair).
 * @param botId - bot Session identity receiving list/browse or memory-recall inject.
 * @returns true when the row belongs in that bot’s agent+user projection.
 */
export function memoryEligibleForBot(
  memory: Pick<MemoryRecord, 'layer' | 'botId'>,
  botId: SessionId,
): boolean {
  return memory.layer === 'user'
    || (memory.layer === 'agent' && memory.botId === botId)
}

/**
 * Derive the durable kebab skill id from a product displayName.
 * @param displayName - already-normalized non-empty display name.
 * @returns skill id accepted by Host catalog naming.
 */
export function skillIdFromDisplayName(displayName: string): SkillId {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
  if (slug.length === 0 || slug.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) {
    throw new TeamError(
      'displayName must yield a lower-kebab-case skill id of at most 64 characters',
      'TEAM_INVALID_ARGUMENT',
    )
  }
  return toSkillId(slug)
}

/**
 * Derive the durable lower-kebab Team roster name from a product displayName.
 * @param displayName - already-normalized non-empty display name.
 * @returns roster name accepted by teammate name rules.
 */
export function teammateNameFromDisplayName(displayName: string): string {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
  if (slug.length === 0 || slug.length > 64 || slug === 'lead' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) {
    throw new TeamError(
      'displayName must yield a lower-kebab-case teammate name of at most 64 characters that is not "lead"',
      'TEAM_INVALID_MEMBER_NAME',
    )
  }
  return slug
}

/**
 * Require exactly one model/provider assignment for Host bot create.
 * @param selection - candidate ModelSelection from the create request.
 * @returns normalized selection with trimmed provider and model ids.
 */
export function requiredModelSelection(selection: ModelSelection): ModelSelection {
  const provider = requiredText(selection.provider, 'modelSelection.provider', 200)
  const model = requiredText(selection.model, 'modelSelection.model', 200)
  return selection.reasoningEffort === undefined
    ? { provider, model }
    : { provider, model, reasoningEffort: selection.reasoningEffort }
}

/**
 * Normalize one Host persona profile for durable replace (FR-002 / FR-003).
 * Empty job, voice, and antiJobs list are allowed; each anti-job item must be non-empty.
 * @param job - primary responsibility; may be empty after trim.
 * @param voice - speaking style; may be empty after trim.
 * @param antiJobs - ordered anti-responsibilities; length ≥ 0.
 * @returns durable persona snapshot ready for journal append.
 */
export function normalizePersonaProfile(
  job: string,
  voice: string,
  antiJobs: readonly string[],
): BotPersonaProfile {
  const normalizedJob = optionalPersonaText(job, 'job')
  const normalizedVoice = optionalPersonaText(voice, 'voice')
  if (!Array.isArray(antiJobs)) {
    throw new TeamError('antiJobs must be an array', 'TEAM_INVALID_ARGUMENT')
  }
  if (antiJobs.length > PERSONA_ANTI_JOB_MAX_ITEMS) {
    throw new TeamError(
      `antiJobs exceeds ${PERSONA_ANTI_JOB_MAX_ITEMS} items`,
      'TEAM_INVALID_ARGUMENT',
    )
  }
  const normalizedAntiJobs = antiJobs.map((item, index) => {
    if (typeof item !== 'string') {
      throw new TeamError(`antiJobs[${index}] must be a string`, 'TEAM_INVALID_ARGUMENT')
    }
    return requiredText(item, `antiJobs[${index}]`, PERSONA_FIELD_MAX)
  })
  return {
    job: normalizedJob,
    voice: normalizedVoice,
    antiJobs: normalizedAntiJobs,
  }
}

/**
 * Trim one optional persona text field; empty after trim is allowed.
 * @param value - raw job or voice text.
 * @param field - diagnostic field name.
 * @returns trimmed text, possibly empty.
 */
function optionalPersonaText(value: string, field: string): string {
  if (typeof value !== 'string') {
    throw new TeamError(`${field} must be a string`, 'TEAM_INVALID_ARGUMENT')
  }
  const text = value.trim()
  if (text.length > PERSONA_FIELD_MAX) {
    throw new TeamError(`${field} exceeds ${PERSONA_FIELD_MAX} characters`, 'TEAM_INVALID_ARGUMENT')
  }
  return text
}

/**
 * Normalize one Host preset avatar marker for durable replace (FR-005).
 * At least one of shape or color is required; both must be ids from the fixed Host preset sets.
 * Image-file / URL fields are not part of {@link AvatarMarker} — no upload path for Pass.
 * Accepts untyped wire/JSON candidates and returns a validated durable marker.
 * @param avatar - candidate marker from Host `setAvatar` (may be untyped at wire).
 * @returns durable marker retaining only present, validated preset fields.
 */
export function normalizeAvatarMarker(avatar: {
  readonly shape?: string
  readonly color?: string
}): AvatarMarker {
  if (avatar === null || typeof avatar !== 'object' || Array.isArray(avatar)) {
    throw new TeamError('avatar must be an object', 'TEAM_INVALID_ARGUMENT')
  }
  const shape = optionalPresetId(avatar.shape, 'avatar.shape', AVATAR_SHAPE_SET)
  const color = optionalPresetId(avatar.color, 'avatar.color', AVATAR_COLOR_SET)
  if (shape === undefined && color === undefined) {
    throw new TeamError(
      'avatar requires at least one of shape or color from the Host preset set',
      'TEAM_INVALID_ARGUMENT',
    )
  }
  return {
    ...shape === undefined ? {} : { shape: shape as AvatarShapeId },
    ...color === undefined ? {} : { color: color as AvatarColorId },
  }
}

/**
 * Accept one optional preset id; absent/undefined stays unset; empty string rejects.
 * @param value - raw shape or color candidate.
 * @param field - diagnostic field name.
 * @param allowed - fixed Host preset id set.
 * @returns trimmed preset id, or undefined when the field was omitted.
 */
function optionalPresetId(
  value: string | undefined,
  field: string,
  allowed: ReadonlySet<string>,
): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string') {
    throw new TeamError(`${field} must be a string`, 'TEAM_INVALID_ARGUMENT')
  }
  const text = value.trim()
  if (text.length === 0) {
    throw new TeamError(`${field} must be non-empty when set`, 'TEAM_INVALID_ARGUMENT')
  }
  if (!allowed.has(text)) {
    throw new TeamError(
      `${field} must be one of: ${[...allowed].join(', ')}`,
      'TEAM_INVALID_ARGUMENT',
    )
  }
  return text
}

/**
 * Report whether two assignments are distinct Verifier `(provider, model)` pairs.
 * Comparison uses the same trim as {@link requiredModelSelection}.
 * `reasoningEffort` does not make two assignments distinct.
 * @param left - candidate assignment.
 * @param right - candidate assignment.
 * @returns true when the normalized provider or model id differs.
 * @throws {TeamError} when either provider or model is empty or longer than 200 characters.
 */
export function modelAssignmentsAreDistinct(left: ModelSelection, right: ModelSelection): boolean {
  const normalizedLeft = requiredModelSelection(left)
  const normalizedRight = requiredModelSelection(right)
  return normalizedLeft.provider !== normalizedRight.provider
    || normalizedLeft.model !== normalizedRight.model
}

/**
 * Normalize one workspace-relative path prefix without treating it as a lock.
 * @param value - user-authored path prefix.
 * @returns normalized slash-separated prefix.
 */
export function writeScope(value: string): string {
  const normalized = value.replaceAll('\\', '/').replace(/^\.\//u, '').replace(/\/+$/u, '')
  const segments = normalized.split('/')
  if (normalized.length === 0 || normalized.startsWith('/') || /^[a-z]:/iu.test(normalized)
    || segments.some(segment => segment.length === 0 || segment === '.' || segment === '..')) {
    throw new TeamError(`invalid workspace-relative write scope ${JSON.stringify(value)}`, 'TEAM_INVALID_WRITE_SCOPE')
  }
  return normalized
}
