/** P6 US2 T022–T023 Host event routine create + webhook-harness wake. */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import TeamService, {
  isRoutineWebhookHarnessMatch,
  optionalHarnessRoutineId,
  routinesMatchingWebhookHarness,
  WEBHOOK_HARNESS_FAMILY,
} from '../src/index.ts'
import { RoutineId } from '../src/types.ts'
import { TestSessionQuery } from './test-session-query.ts'

const SIGNAL = new AbortController().signal
const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

async function storedEvents(ctx: Context, id: SessionId): Promise<readonly SessionEvent[]> {
  const handle = await ctx.sessionPersistence.open(id, 'read')
  try {
    return (await handle.read()).events
  } finally {
    await handle.close()
  }
}

async function setup(script: ConstructorParameters<typeof MockAdapter>[0] = []) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-event-'))
  roots.push(storageRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(TestSessionQuery)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentFork, { providerName: 'fork' })
  await ctx.plugin(TeamService, { routineCronTickMs: 60_000 })
  const adapter = new MockAdapter(script)
  ctx.llm.registerAdapter(['mock'], adapter)
  const lead = await ctx.agentLoop.create(SessionId('lead'), { provider: 'mock', model: 'mock' })
  return { ctx, lead, adapter }
}

async function waitNoAgent(ctx: Context, id: SessionId): Promise<void> {
  await vi.waitFor(() => { expect(ctx.agents.get(id)).toBeUndefined() }, { timeout: 5_000 })
}

describe('routine-event match helpers', () => {
  it('T023: matches only active webhook_harness event rows', () => {
    const active = {
      routineId: RoutineId('r-event'),
      botId: SessionId('bot-a'),
      intent: 'Handle delivery',
      scheduleExpr: '',
      triggerKind: 'event' as const,
      eventTrigger: 'webhook_harness' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const paused = { ...active, routineId: RoutineId('r-paused'), status: 'paused' as const }
    const cron = {
      ...active,
      routineId: RoutineId('r-cron'),
      triggerKind: 'cron' as const,
      scheduleExpr: '@every 5m',
      eventTrigger: undefined,
    }
    expect(isRoutineWebhookHarnessMatch(active)).toBe(true)
    expect(isRoutineWebhookHarnessMatch(paused)).toBe(false)
    expect(isRoutineWebhookHarnessMatch(cron)).toBe(false)
    expect(routinesMatchingWebhookHarness([active, paused, cron]).map(row => row.routineId))
      .toEqual([active.routineId])
    expect(routinesMatchingWebhookHarness([active, paused], { botId: SessionId('other') }))
      .toEqual([])
    expect(routinesMatchingWebhookHarness([active, paused], { routineId: RoutineId('r-other') }))
      .toEqual([])
    expect(routinesMatchingWebhookHarness([active], { routineId: active.routineId }))
      .toEqual([active])
    expect(optionalHarnessRoutineId('  r-1  ')).toBe(RoutineId('r-1'))
    expect(optionalHarnessRoutineId('')).toBeUndefined()
    expect(optionalHarnessRoutineId(1)).toBeUndefined()
    expect(WEBHOOK_HARNESS_FAMILY).toBe('webhook_harness')
  })
})

describe('P6 US2 T022 Host createRoutine event path', () => {
  it('T022: createRoutine event + webhook_harness requires non-empty intent; persists active row', async () => {
    const { ctx, lead } = await setup([
      textResponse('t022 create a'),
      textResponse('t022 create b'),
    ])
    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Event Create Bot',
      modelSelection: { provider: 'mock', model: 'e-create' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)

    await expect(ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: '',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      signal: SIGNAL,
    })).rejects.toMatchObject({
      code: 'TEAM_INVALID_ARGUMENT',
      message: /intent must be non-empty/,
    })
    await expect(ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: '   ',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      signal: SIGNAL,
    })).rejects.toMatchObject({
      code: 'TEAM_INVALID_ARGUMENT',
      message: /intent must be non-empty/,
    })
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines)
      .toEqual([])

    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'React to harness delivery',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      signal: SIGNAL,
    })
    expect(created.routine).toMatchObject({
      botId: bot.id,
      intent: 'React to harness delivery',
      identity: 'React to harness delivery',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      scheduleExpr: '',
      scheduleLabel: 'Webhook harness',
      status: 'active',
      lastRunAt: null,
    })

    const remote = await ctx.agentTeams.remoteCreateRoutine(lead, {
      botId: bot.id,
      intent: '',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
    }, SIGNAL)
    expect(remote).toMatchObject({
      ok: false,
      error: { message: expect.stringMatching(/intent must be non-empty/) },
    })
  })
})

describe('P6 US2 T023 Host webhook-harness wake', () => {
  it('T023: harness delivery wakes existing bot, updates lastRunAt; pause suppresses fire', async () => {
    const { ctx, lead } = await setup([
      textResponse('t023 create'),
      textResponse('t023 fire turn'),
      textResponse('t023 paused create'),
    ])
    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Harness Bot',
      modelSelection: { provider: 'mock', model: 'harness-1' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)

    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Harness wake intent',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      signal: SIGNAL,
    })
    expect(created.routine.lastRunAt).toBeNull()

    expect(await ctx.agentTeams.evaluateDueRoutines(created.routine.createdAt + 60_000))
      .toEqual([])
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines[0]?.lastRunAt)
      .toBeNull()

    await expect(ctx.agentTeams.deliverWebhookHarness({
      deliveryId: '  ',
      signal: SIGNAL,
    })).rejects.toMatchObject({ message: /deliveryId must be non-empty/ })
    await expect(ctx.agentTeams.deliverWebhookHarness({
      deliveryId: 'bad-time',
      receivedAt: Number.NaN,
      signal: SIGNAL,
    })).rejects.toMatchObject({ message: /receivedAt must be a non-negative safe integer/ })
    await expect(ctx.agentTeams.deliverWebhookHarness({
      deliveryId: 'bad-time-2',
      receivedAt: -1,
      signal: SIGNAL,
    })).rejects.toMatchObject({ message: /receivedAt must be a non-negative safe integer/ })

    const receivedAt = created.routine.createdAt + 1_000
    const result = await ctx.agentTeams.deliverWebhookHarness({
      deliveryId: 'delivery-1',
      receivedAt,
      routineId: created.routine.routineId,
      signal: SIGNAL,
    })
    expect(result).toMatchObject({
      deliveryId: 'delivery-1',
      receivedAt,
      fired: [{
        routineId: created.routine.routineId,
        botId: bot.id,
        intent: 'Harness wake intent',
        status: 'active',
        lastRunAt: receivedAt,
        triggerKind: 'event',
        eventTrigger: 'webhook_harness',
      }],
    })
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines[0]?.lastRunAt)
      .toBe(receivedAt)

    const events = await storedEvents(ctx, bot.id)
    expect(events.some(event =>
      event.type === 'user/message'
      && Array.isArray(event.data.content)
      && event.data.content.some(
        block => block.type === 'text' && block.text === 'Harness wake intent',
      ))).toBe(true)

    await ctx.agentTeams.pauseRoutine(lead, {
      routineId: created.routine.routineId,
      signal: SIGNAL,
    })
    const pausedAt = receivedAt + 5_000
    const suppressed = await ctx.agentTeams.deliverWebhookHarness({
      deliveryId: 'delivery-paused',
      receivedAt: pausedAt,
      routineId: created.routine.routineId,
      signal: SIGNAL,
    })
    expect(suppressed.fired).toEqual([])
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines[0])
      .toMatchObject({
        status: 'paused',
        lastRunAt: receivedAt,
      })

    const remote = await ctx.agentTeams.remoteDeliverWebhookHarness(lead, {
      deliveryId: 'delivery-remote',
      receivedAt: pausedAt + 1,
      routineId: created.routine.routineId,
    }, SIGNAL)
    expect(remote).toMatchObject({
      ok: true,
      value: { fired: [], deliveryId: 'delivery-remote' },
    })
  }, 15_000)

  it('T023: optional webhookRuntime ingress dispatches into Host wake (B1 adapt)', async () => {
    type Rule = {
      readonly id: string
      readonly kind: string
      run(
        delivery: {
          readonly kind: string
          readonly source: string
          readonly deliveryId: string
          readonly event: unknown
          readonly receivedAt: number
        },
        signal: AbortSignal,
      ): null | Promise<null>
    }
    const rules: Rule[] = []
    const fakeRuntime = {
      register(rule: Rule) {
        rules.push(rule)
        return () => {
          const index = rules.indexOf(rule)
          if (index >= 0) rules.splice(index, 1)
        }
      },
      async dispatch(delivery: {
        readonly kind: string
        readonly source: string
        readonly deliveryId: string
        readonly event: unknown
        readonly receivedAt: number
      }) {
        for (const rule of [...rules]) {
          if (rule.kind !== delivery.kind) continue
          await rule.run(delivery, SIGNAL)
        }
      },
    }

    const ctx = new Context()
    await mountAgentLoopTestDependencies(ctx)
    const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-webhook-ingress-'))
    roots.push(storageRoot)
    await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
    await ctx.plugin(TestSessionQuery)
    await ctx.plugin(AgentLoop, { agents: [] })
    await ctx.plugin(SubagentService)
    await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
    await ctx.plugin(SubagentFork, { providerName: 'fork' })
    ctx.provide('webhookRuntime', fakeRuntime as never)
    await ctx.plugin(TeamService, { routineCronTickMs: 60_000 })
    const adapter = new MockAdapter([
      textResponse('ingress create'),
      textResponse('ingress fire'),
    ])
    ctx.llm.registerAdapter(['mock'], adapter)
    const lead = await ctx.agentLoop.create(SessionId('lead'), { provider: 'mock', model: 'mock' })

    expect(rules).toHaveLength(1)
    expect(rules[0]?.kind).toBe('webhook_harness')

    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Ingress Bot',
      modelSelection: { provider: 'mock', model: 'ingress-1' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)
    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Ingress wake',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      signal: SIGNAL,
    })
    const receivedAt = created.routine.createdAt + 2_000
    await fakeRuntime.dispatch({
      kind: 'webhook_harness',
      source: 'verifier-fixture',
      deliveryId: 'ingress-delivery',
      event: { routineId: created.routine.routineId },
      receivedAt,
    })
    await vi.waitFor(() => {
      expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines[0]?.lastRunAt)
        .toBe(receivedAt)
    }, { timeout: 5_000 })
  }, 15_000)

  it('T023: live followup wake + wake failure leaves lastRunAt unchanged', async () => {
    const { ctx, lead } = await setup([textResponse('live event create')])
    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Live Event Bot',
      modelSelection: { provider: 'mock', model: 'live-event' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)
    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Live event intent',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      signal: SIGNAL,
    })
    const followup = vi.fn()
    const originalGet = ctx.agents.get.bind(ctx.agents)
    const getSpy = vi.spyOn(ctx.agents, 'get').mockImplementation((id) => {
      if (id === bot.id) {
        return { id: bot.id, status: 'idle', followup } as unknown as Agent
      }
      return originalGet(id)
    })
    const receivedAt = created.routine.createdAt + 100
    const fired = await ctx.agentTeams.deliverWebhookHarness({
      deliveryId: 'live-1',
      receivedAt,
      botId: bot.id,
      signal: SIGNAL,
    })
    expect(fired.fired).toHaveLength(1)
    expect(followup).toHaveBeenCalledTimes(1)

    followup.mockImplementation(() => {
      throw new Error('followup rejected')
    })
    const failed = await ctx.agentTeams.deliverWebhookHarness({
      deliveryId: 'live-2',
      receivedAt: receivedAt + 1,
      botId: bot.id,
      signal: SIGNAL,
    })
    expect(failed.fired).toEqual([])
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines[0]?.lastRunAt)
      .toBe(receivedAt)
    getSpy.mockRestore()
  }, 15_000)
})
