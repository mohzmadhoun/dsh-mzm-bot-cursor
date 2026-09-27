/** Input normalization shared by Team roster and task commands. */

import type { ModelSelection } from '@deepseek-ai/dsh-agent'
import { TeamError } from './error.ts'
import type {
  AvatarColorId,
  AvatarMarker,
  AvatarShapeId,
  BotPersonaProfile,
} from './types.ts'

const PERSONA_FIELD_MAX = 200
const PERSONA_ANTI_JOB_MAX_ITEMS = 64

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
