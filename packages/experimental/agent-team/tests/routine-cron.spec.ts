/** Host scheduleExpr validation and next-fire (P4 T008). */

import { describe, expect, it } from 'vitest'
import { TeamError } from '../src/error.ts'
import {
  describeScheduleExpr,
  MIN_EVERY_INTERVAL_MS,
  nextFireAt,
  parseScheduleExpr,
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
})
