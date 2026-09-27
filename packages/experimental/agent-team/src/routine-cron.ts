/** Host product scheduleExpr validation and next-fire computation (P4 T008).

Architect Option 3: Host owns cron evaluation — not `dsh-schedule` session reminders.
Supports product shorthands (`@every 5m`, `@hourly`, `@daily`) and 5-field cron.
Wake eligibility (US3 T022): only `status: active` routines may receive cron wakes.
*/

import { TeamError } from './error.ts'
import type { RoutineRecord, RoutineStatus } from './types.ts'

/** Minimum `@every` interval accepted for Pass (clarify — no sub-5m test schedule). */
export const MIN_EVERY_INTERVAL_MS = 5 * 60 * 1000

/** Parsed product schedule ready for next-fire evaluation. */
export type ParsedScheduleExpr =
  | { readonly kind: 'every'; readonly intervalMs: number; readonly expr: string }
  | { readonly kind: 'cron'; readonly fields: CronFields; readonly expr: string }

/** One validated 5-field cron (minute hour day-of-month month day-of-week). */
export interface CronFields {
  readonly minute: ReadonlySet<number>
  readonly hour: ReadonlySet<number>
  readonly dayOfMonth: ReadonlySet<number>
  readonly month: ReadonlySet<number>
  readonly dayOfWeek: ReadonlySet<number>
}

const EVERY_PATTERN = /^@every\s+(\d+)(m|h|d)$/iu
const CRON_FIELD_PATTERN = /^[\d*,/\-]+$/u

/**
 * Normalize and validate one product-supported `scheduleExpr`.
 * Empty / unsupported expressions reject with a stable TeamError (FR-001).
 * @param value - raw schedule expression from Host create.
 * @returns trimmed expr plus parsed form for next-fire.
 */
export function parseScheduleExpr(value: string): ParsedScheduleExpr {
  const expr = value.trim()
  if (expr.length === 0) {
    throw new TeamError('scheduleExpr must be non-empty', 'TEAM_INVALID_ARGUMENT')
  }
  const every = EVERY_PATTERN.exec(expr)
  if (every !== null) {
    const amountToken = every[1]
    const unitToken = every[2]
    if (amountToken === undefined || unitToken === undefined) {
      throw new TeamError(
        `scheduleExpr "${expr}" every form is incomplete`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const amount = Number(amountToken)
    const unit = unitToken.toLowerCase()
    if (!Number.isSafeInteger(amount) || amount < 1) {
      throw new TeamError(
        `scheduleExpr "${expr}" every amount must be a positive integer`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    const intervalMs = unit === 'm'
      ? amount * 60_000
      : unit === 'h'
        ? amount * 3_600_000
        : amount * 86_400_000
    if (intervalMs < MIN_EVERY_INTERVAL_MS) {
      throw new TeamError(
        `scheduleExpr "${expr}" every interval must be at least 5 minutes`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    return { kind: 'every', intervalMs, expr }
  }
  const lower = expr.toLowerCase()
  if (lower === '@hourly') {
    return { kind: 'every', intervalMs: 3_600_000, expr: '@hourly' }
  }
  if (lower === '@daily') {
    return { kind: 'every', intervalMs: 86_400_000, expr: '@daily' }
  }
  const parts = expr.split(/\s+/u)
  const [minuteField, hourField, dayOfMonthField, monthField, dayOfWeekField] = parts
  if (
    parts.length === 5
    && minuteField !== undefined
    && hourField !== undefined
    && dayOfMonthField !== undefined
    && monthField !== undefined
    && dayOfWeekField !== undefined
  ) {
    return {
      kind: 'cron',
      fields: {
        minute: parseCronField(minuteField, 0, 59, 'minute', expr),
        hour: parseCronField(hourField, 0, 23, 'hour', expr),
        dayOfMonth: parseCronField(dayOfMonthField, 1, 31, 'day-of-month', expr),
        month: parseCronField(monthField, 1, 12, 'month', expr),
        dayOfWeek: parseCronField(dayOfWeekField, 0, 6, 'day-of-week', expr),
      },
      expr,
    }
  }
  throw new TeamError(
    `scheduleExpr "${expr}" is unsupported; use @every Nm|Nh|Nd (≥5m), @hourly, @daily, or 5-field cron`,
    'TEAM_INVALID_ARGUMENT',
  )
}

/**
 * Compute the next fire instant strictly after `fromMs` for a parsed schedule.
 * @param parsed - validated schedule from {@link parseScheduleExpr}.
 * @param fromMs - exclusive lower bound (typically Date.now()).
 * @returns epoch milliseconds of the next eligible fire.
 */
export function nextFireAt(parsed: ParsedScheduleExpr, fromMs: number): number {
  if (!Number.isFinite(fromMs)) {
    throw new TeamError('nextFireAt fromMs must be a finite number', 'TEAM_INVALID_ARGUMENT')
  }
  if (parsed.kind === 'every') {
    return fromMs + parsed.intervalMs
  }
  // Walk minute boundaries for up to 8 days — sufficient for Verifier ≤6 min windows and daily cron.
  const start = Math.floor(fromMs / 60_000) * 60_000 + 60_000
  const horizon = start + 8 * 86_400_000
  for (let candidate = start; candidate <= horizon; candidate += 60_000) {
    if (cronMatches(parsed.fields, new Date(candidate))) return candidate
  }
  throw new TeamError(
    `scheduleExpr "${parsed.expr}" has no fire within 8 days of ${fromMs}`,
    'TEAM_INVALID_ARGUMENT',
  )
}

/**
 * Whether a Host Routine may receive a cron wake (P4 US3 T022 / FR-003).
 * Paused routines MUST NOT fire; active routines remain eligible (FR-004).
 * Host cron evaluator (US4 T025) MUST gate every wake through this check.
 * @param routine - catalog row (or any status-bearing projection of it).
 * @returns true only when status is `active`.
 */
export function isRoutineEligibleForWake(
  routine: { readonly status: RoutineStatus },
): boolean {
  return routine.status === 'active'
}

/**
 * Filter Host catalog rows to those eligible for cron wake (FR-003 / FR-004).
 * @param routines - durable catalog rows.
 * @returns only `status: active` rows; paused rows are omitted.
 */
export function routinesEligibleForWake(
  routines: readonly RoutineRecord[],
): readonly RoutineRecord[] {
  return routines.filter(isRoutineEligibleForWake)
}

/**
 * Whether one Host Routine is due for a cron wake at `nowMs` (P4 US4 T025 / FR-005).
 * Paused rows are never due. Anchor is `lastRunAt` after a fire, else `createdAt`.
 * @param routine - durable catalog row.
 * @param nowMs - wall-clock sample (epoch ms).
 * @returns true when the row is active and its next fire instant is ≤ `nowMs`.
 */
export function isRoutineDue(routine: RoutineRecord, nowMs: number): boolean {
  if (!isRoutineEligibleForWake(routine)) return false
  if (!Number.isFinite(nowMs)) {
    throw new TeamError('isRoutineDue nowMs must be a finite number', 'TEAM_INVALID_ARGUMENT')
  }
  const parsed = parseScheduleExpr(routine.scheduleExpr)
  const anchor = routine.lastRunAt ?? routine.createdAt
  return nextFireAt(parsed, anchor) <= nowMs
}

/**
 * Filter Host catalog rows that are due for cron wake at `nowMs`.
 * Paused rows are omitted even when their schedule would match (FR-003).
 * @param routines - durable catalog rows.
 * @param nowMs - wall-clock sample (epoch ms).
 * @returns active rows whose next fire instant is ≤ `nowMs`.
 */
export function routinesDueForWake(
  routines: readonly RoutineRecord[],
  nowMs: number,
): readonly RoutineRecord[] {
  return routines.filter(routine => isRoutineDue(routine, nowMs))
}

/**
 * Human-readable schedule label for Client pane projection.
 * @param expr - durable scheduleExpr string.
 * @returns short display form (falls back to the raw expr when parsing fails).
 */
export function describeScheduleExpr(expr: string): string {
  try {
    const parsed = parseScheduleExpr(expr)
    if (parsed.kind === 'every') {
      if (parsed.expr === '@hourly') return 'Every hour'
      if (parsed.expr === '@daily') return 'Every day'
      const minutes = parsed.intervalMs / 60_000
      if (minutes < 60) return `Every ${minutes}m`
      const hours = minutes / 60
      if (Number.isInteger(hours) && hours < 24) return `Every ${hours}h`
      const days = hours / 24
      if (Number.isInteger(days)) return `Every ${days}d`
      return `Every ${minutes}m`
    }
    return parsed.expr
  } catch {
    return expr
  }
}

/**
 * Parse one cron field (`*`, `n`, `n-m`, star/step, range/step, comma lists).
 * @param field - raw field token.
 * @param min - inclusive lower bound.
 * @param max - inclusive upper bound.
 * @param name - diagnostic field name.
 * @param expr - full expression for errors.
 * @returns the set of matching values.
 */
function parseCronField(
  field: string,
  min: number,
  max: number,
  name: string,
  expr: string,
): ReadonlySet<number> {
  if (!CRON_FIELD_PATTERN.test(field)) {
    throw new TeamError(
      `scheduleExpr "${expr}" ${name} field "${field}" is invalid`,
      'TEAM_INVALID_ARGUMENT',
    )
  }
  const values = new Set<number>()
  for (const part of field.split(',')) {
    const [rangePart, stepPart] = part.split('/')
    const step = stepPart === undefined ? 1 : Number(stepPart)
    if (!Number.isSafeInteger(step) || step < 1) {
      throw new TeamError(
        `scheduleExpr "${expr}" ${name} step must be a positive integer`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    let start: number
    let end: number
    if (rangePart === '*' || rangePart === undefined) {
      start = min
      end = max
    } else if (rangePart.includes('-')) {
      const [rawStart, rawEnd] = rangePart.split('-')
      start = Number(rawStart)
      end = Number(rawEnd)
    } else {
      start = Number(rangePart)
      end = start
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)
      || start < min || end > max || start > end) {
      throw new TeamError(
        `scheduleExpr "${expr}" ${name} field "${field}" is out of range ${min}-${max}`,
        'TEAM_INVALID_ARGUMENT',
      )
    }
    for (let value = start; value <= end; value += step) values.add(value)
  }
  if (values.size === 0) {
    throw new TeamError(
      `scheduleExpr "${expr}" ${name} field "${field}" matches no values`,
      'TEAM_INVALID_ARGUMENT',
    )
  }
  return values
}

/**
 * Test whether one UTC wall-clock instant matches cron fields.
 * Day-of-week uses Date#getUTCDay (0=Sunday).
 * @param fields - validated cron fields.
 * @param when - candidate instant.
 * @returns whether all five fields match.
 */
function cronMatches(fields: CronFields, when: Date): boolean {
  return fields.minute.has(when.getUTCMinutes())
    && fields.hour.has(when.getUTCHours())
    && fields.dayOfMonth.has(when.getUTCDate())
    && fields.month.has(when.getUTCMonth() + 1)
    && fields.dayOfWeek.has(when.getUTCDay())
}
