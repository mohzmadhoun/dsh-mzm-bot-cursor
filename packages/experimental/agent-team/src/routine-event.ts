/** Host webhook-harness event-routine match (P6 US2 T023 / FR-005 / FR-018).

Architect Path A B1: match active `triggerKind=event` + `eventTrigger=webhook_harness`
rows for Routine wake — not cron due-scan, not webhookRuntime new-Session Pass.
*/

import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { isRoutineEligibleForWake } from './routine-cron.ts'
import type { RoutineRecord } from './types.ts'
import { RoutineId } from './types.ts'

/** Pass event-family id for the Host webhook harness (FR-018). */
export const WEBHOOK_HARNESS_FAMILY = 'webhook_harness' as const

/**
 * Whether one Host Routine matches the webhook-harness Pass fire path.
 * Paused rows never match (FR-005). Cron rows never match (SC-008).
 * @param routine - durable catalog row.
 * @returns true only for active `event` + `webhook_harness` rows.
 */
export function isRoutineWebhookHarnessMatch(routine: RoutineRecord): boolean {
  if (!isRoutineEligibleForWake(routine)) return false
  return routine.triggerKind === 'event' && routine.eventTrigger === WEBHOOK_HARNESS_FAMILY
}

/**
 * Filter Host catalog rows that match one webhook-harness delivery.
 * Optional `routineId` / `botId` narrow the match; omission matches all harness rows.
 * @param routines - durable catalog rows for one Team.
 * @param filter - optional routine / bot targeting from the harness delivery.
 * @returns active webhook-harness event rows that match the filter.
 */
export function routinesMatchingWebhookHarness(
  routines: readonly RoutineRecord[],
  filter: {
    readonly routineId?: RoutineId
    readonly botId?: SessionId
  } = {},
): readonly RoutineRecord[] {
  return routines.filter((routine) => {
    if (!isRoutineWebhookHarnessMatch(routine)) return false
    if (filter.routineId !== undefined && routine.routineId !== filter.routineId) return false
    if (filter.botId !== undefined && routine.botId !== filter.botId) return false
    return true
  })
}

/**
 * Normalize an optional routine id filter from harness delivery JSON.
 * @param value - raw routine id candidate.
 * @returns branded id, or undefined when absent/empty.
 */
export function optionalHarnessRoutineId(value: unknown): RoutineId | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : RoutineId(trimmed)
}
