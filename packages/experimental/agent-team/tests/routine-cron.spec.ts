/** Host scheduleExpr validation and next-fire (P4 T008). */

import { describe, expect, it } from 'vitest'
import { SessionId } from '@deepseek-ai/dsh-session'
import { TeamError } from '../src/error.ts'
import { RoutineId } from '../src/types.ts'
import {
  describeScheduleExpr,
  isRoutineEligibleForWake,
  MIN_EVERY_INTERVAL_MS,
  nextFireAt,
  parseScheduleExpr,
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
})
