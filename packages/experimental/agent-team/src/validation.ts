/** Input normalization shared by Team roster and task commands. */

import type { ModelSelection } from '@deepseek-ai/dsh-agent'
import { TeamError } from './error.ts'

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
