/** Host scheduleExpr validation and next-fire (P4 T008). */

import { describe, expect, it } from 'vitest'
import { SessionId } from '@deepseek-ai/dsh-session'
import { TeamError } from '../src/error.ts'
import { RoutineId } from '../src/types.ts'
import {
  describeScheduleExpr,
  isRoutineDue,
  isRoutineEligibleForWake,
  MIN_EVERY_INTERVAL_MS,
  nextFireAt,
  parseScheduleExpr,
  routinesDueForWake,
  routinesEligibleForWake,
} from '../src/routine-cron.ts'

describe('routine-cron scheduleExpr stub', () => {
  it('accepts @every 5m and computes next fire', () => {
    const parsed = parseScheduleExpr('  @every 5m ')
    expect(parsed).toEqual({ kind: 'every', intervalMs: MIN_EVERY_INTERVAL_MS, expr: '@every 5m' })
    expect(nextFireAt(parsed, 1_000)).toBe(1_000 + MIN_EVERY_INTERVAL_MS)
    expect(describeScheduleExpr('@every 5m')).toBe('Every 5m')
  })

  it('accepts @hourly, @daily, and 5-field cron', () => {
    expect(parseScheduleExpr('@hourly').kind).toBe('every')
    expect(parseScheduleExpr('@daily').kind).toBe('every')
    const cron = parseScheduleExpr('*/5 * * * *')
    expect(cron.kind).toBe('cron')
    const from = Date.UTC(2026, 0, 1, 12, 0, 30)
    const next = nextFireAt(cron, from)
    expect(next).toBeGreaterThan(from)
    expect(new Date(next).getUTCMinutes() % 5).toBe(0)
  })

  it('rejects empty, sub-5m every, and unsupported expressions', () => {
    expect(() => parseScheduleExpr('')).toThrow(TeamError)
    expect(() => parseScheduleExpr('@every 1m')).toThrow(/at least 5 minutes/)
    expect(() => parseScheduleExpr('@weekly')).toThrow(/unsupported/)
    expect(() => parseScheduleExpr('not-a-cron')).toThrow(/unsupported/)
  })

  it('US3 T022: only active routines are wake-eligible', () => {
    const active = {
      routineId: RoutineId('r-active'),
      botId: SessionId('bot-a'),
      intent: 'Ping',
      scheduleExpr: '@every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const paused = { ...active, routineId: RoutineId('r-paused'), status: 'paused' as const }
    expect(isRoutineEligibleForWake(active)).toBe(true)
    expect(isRoutineEligibleForWake(paused)).toBe(false)
    expect(routinesEligibleForWake([active, paused])).toEqual([active])
  })

  it('US4 T025: isRoutineDue gates on active + next fire ≤ now', () => {
    const createdAt = Date.UTC(2026, 0, 1, 12, 0, 0)
    const active = {
      routineId: RoutineId('r-due'),
      botId: SessionId('bot-a'),
      intent: 'Sweep inbox',
      scheduleExpr: '@every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt,
      updatedAt: createdAt,
    }
    const paused = { ...active, routineId: RoutineId('r-paused'), status: 'paused' as const }
    const eventRow = {
      ...active,
      routineId: RoutineId('r-event'),
      triggerKind: 'event' as const,
      scheduleExpr: '',
      eventTrigger: 'webhook_harness' as const,
    }
    const beforeDue = createdAt + MIN_EVERY_INTERVAL_MS - 1
    const atDue = createdAt + MIN_EVERY_INTERVAL_MS
    expect(isRoutineDue(active, beforeDue)).toBe(false)
    expect(isRoutineDue(active, atDue)).toBe(true)
    expect(isRoutineDue(paused, atDue)).toBe(false)
    expect(isRoutineDue(eventRow, atDue)).toBe(false)
    expect(routinesDueForWake([active, paused, eventRow], atDue)).toEqual([active])

    const afterFire = {
      ...active,
      lastRunAt: atDue,
      updatedAt: atDue,
    }
    expect(isRoutineDue(afterFire, atDue)).toBe(false)
    expect(isRoutineDue(afterFire, atDue + MIN_EVERY_INTERVAL_MS)).toBe(true)
    expect(() => isRoutineDue(active, Number.NaN)).toThrow(/nowMs must be a finite number/)
  })
})
