/**
 * T021 / FR-004: Host mailbox send path Bot A → Bot B via Agent Teams Lead-log
 * mailbox → target inbox. DeliveryState reconstructs from session logs only —
 * Electron Main invents no bot↔bot messaging bus.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import TeamService, { observeMailboxDeliveryState, TeamMessageId } from '../src/index.ts'
import { teamProjectionDefinition } from '../src/projection.ts'
import type { TeamMemberSnapshot, TeamMessageSnapshot, TeamTaskSnapshot } from '../src/index.ts'
import { TestSessionQuery } from './test-session-query.ts'

const SIGNAL = new AbortController().signal
const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

/** Detached durable Team read through the same projection definition as the service. */
function durable(agent: Agent): {
  members: TeamMemberSnapshot[]
  tasks: TeamTaskSnapshot[]
  pendingMessages: TeamMessageSnapshot[]
} {
  let projected = teamProjectionDefinition.init(agent.session.header)
  for (const event of agent.session.snapshotEvents()) projected = teamProjectionDefinition.apply(projected, event)
  if (projected.failure !== undefined) throw new Error(projected.failure)
  const state = projected
  return {
    members: state.members,
    tasks: state.tasks,
    pendingMessages: state.messages.filter(message => !state.delivered.includes(message.id)),
  }
}

async function storedEvents(ctx: Context, id: SessionId): Promise<readonly SessionEvent[]> {
  const handle = await ctx.sessionPersistence.open(id, 'read')
  try {
    return (await handle.read()).events
  } finally {
    await handle.close()
  }
}

async function setup(script: ConstructorParameters<typeof MockAdapter>[0]) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-mailbox-send-'))
  roots.push(storageRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(TestSessionQuery)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentFork, { providerName: 'fork' })
  await ctx.plugin(TeamService)
  const adapter = new MockAdapter(script)
  ctx.llm.registerAdapter(['mock'], adapter)
  const lead = await ctx.agentLoop.create(SessionId('lead'), { provider: 'mock', model: 'mock' })
  return { ctx, lead, adapter }
}

function content(text: string) {
  return [{ type: 'text' as const, text }]
}

async function waitRunning(ctx: Context, id: SessionId): Promise<Agent> {
  return await vi.waitFor(() => {
    const agent = ctx.agents.get(id)
    if (agent === undefined) throw new Error(`agent "${id}" is not registered`)
    if (agent.status !== 'running') throw new Error(`agent "${id}" status is ${agent.status}`)
    return agent
  }, { timeout: 10_000 })
}

async function waitNoAgent(ctx: Context, id: SessionId): Promise<void> {
  await vi.waitFor(() => {
    if (ctx.agents.get(id) !== undefined) throw new Error(`agent "${id}" still registered`)
  }, { timeout: 10_000 })
}

/** Lead-log edges for one message, ordered as committed. */
function leadMailboxEdges(events: readonly SessionEvent[], messageId: string): string[] {
  return events.flatMap((event) => {
    if (event.type === 'team/message/queued' && event.data.message.id === messageId) {
      return ['team/message/queued']
    }
    if (event.type === 'team/message/delivered' && event.data.messageId === messageId) {
      return ['team/message/delivered']
    }
    return []
  })
}

describe('Host mailbox send path Bot A → Bot B (T021)', () => {
  it('delivers A→B through Lead-log mailbox into B inbox as visible-pending (FR-004/005)', async () => {
    // Keep B busy on its create turn so the handoff stays inbox-pending (FR-005).
    const { ctx, lead } = await setup(['hang', 'hang'])
    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Mailbox Sender',
      modelSelection: { provider: 'mock', model: 'model-a' },
      signal: SIGNAL,
    })
    const agentA = await waitRunning(ctx, botA.id)
    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Mailbox Recipient',
      modelSelection: { provider: 'mock', model: 'model-b' },
      signal: SIGNAL,
    })
    const agentB = await waitRunning(ctx, botB.id)

    expect(observeMailboxDeliveryState(
      lead.session.snapshotEvents(),
      agentB.session.snapshotEvents(),
      TeamMessageId('team-message-not-queued'),
    )).toBeUndefined()

    const sent = await ctx.agentTeams.sendMessage(agentA, {
      target: botB.name,
      content: content('handoff from A to B'),
      signal: SIGNAL,
    })
    expect(sent.status).toBe('accepted')
    expect(durable(lead).pendingMessages.map(message => message.id)).toEqual([])

    const inboxHit = agentB.inbox.nextStep.find(message =>
      message.source.kind === 'team-message' && message.source.messageId === sent.messageId)
    expect(inboxHit?.source.kind === 'team-message' && inboxHit.source.senderId).toBe(botA.id)
    expect(inboxHit?.source.kind === 'team-message' && inboxHit.source.senderName).toBe(botA.name)

    const leadLog = lead.session.snapshotEvents()
    expect(leadMailboxEdges(leadLog, sent.messageId)).toEqual([
      'team/message/queued',
      'team/message/delivered',
    ])
    const queued = leadLog.find(event =>
      event.type === 'team/message/queued' && event.data.message.id === sent.messageId)
    expect(queued?.type === 'team/message/queued' && queued.data.message.senderId).toBe(botA.id)
    expect(queued?.type === 'team/message/queued' && queued.data.message.targetId).toBe(botB.id)
    expect(queued?.type === 'team/message/queued' && queued.data.message.senderName).toBe(botA.name)

    expect(observeMailboxDeliveryState(
      leadLog,
      agentB.session.snapshotEvents(),
      sent.messageId,
    )).toBe('visible-pending')

    ctx.agentTeams.interrupt(lead, botA.name)
    ctx.agentTeams.interrupt(lead, botB.name)
    agentA.cancel({ kind: 'parent' })
    agentB.cancel({ kind: 'parent' })
    await waitNoAgent(ctx, botA.id)
    await waitNoAgent(ctx, botB.id)
  }, 20_000)

  it('reconstructs acted when B cold-resumes and runs a turn on A\'s message', async () => {
    const { ctx, lead } = await setup([
      'hang',
      textResponse('bot-b create turn'),
      textResponse('bot-b acts on handoff'),
    ])
    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Sender A',
      modelSelection: { provider: 'mock', model: 'model-a' },
      signal: SIGNAL,
    })
    const agentA = await waitRunning(ctx, botA.id)
    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Recipient B',
      modelSelection: { provider: 'mock', model: 'model-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botB.id)

    const sent = await ctx.agentTeams.sendMessage(agentA, {
      target: botB.name,
      content: content('please act on this'),
      signal: SIGNAL,
    })
    expect(sent.status).toBe('accepted')
    await waitNoAgent(ctx, botB.id)
    await vi.waitFor(() => { expect(durable(lead).pendingMessages).toEqual([]) })

    const leadLog = await storedEvents(ctx, lead.id)
    const targetLog = await storedEvents(ctx, botB.id)
    expect(leadMailboxEdges(leadLog, sent.messageId)).toEqual([
      'team/message/queued',
      'team/message/delivered',
    ])

    const peer = targetLog.filter(event =>
      event.type === 'user/message' && event.data.source.kind === 'team-message')
    expect(peer).toHaveLength(1)
    const source = peer[0]?.type === 'user/message' ? peer[0].data.source : undefined
    expect(source?.kind === 'team-message' && source.messageId).toBe(sent.messageId)
    expect(source?.kind === 'team-message' && source.senderId).toBe(botA.id)
    expect(source?.kind === 'team-message' && source.senderName).toBe(botA.name)
    expect(source?.kind === 'team-message' && source.teamId).toBe(lead.id)

    expect(observeMailboxDeliveryState(leadLog, targetLog, sent.messageId)).toBe('acted')

    ctx.agentTeams.interrupt(lead, botA.name)
    await waitNoAgent(ctx, botA.id)
  })

  it('keeps deliveryState queued when Host cannot complete delivery yet', async () => {
    const { ctx, lead } = await setup(['hang', textResponse('bot-b create')])
    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Queued Sender',
      modelSelection: { provider: 'mock', model: 'model-a' },
      signal: SIGNAL,
    })
    const agentA = await waitRunning(ctx, botA.id)
    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Queued Recipient',
      modelSelection: { provider: 'mock', model: 'model-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botB.id)

    const openRead = vi.spyOn(ctx.sessionPersistence, 'open').mockRejectedValueOnce(new Error('read unavailable'))
    const sent = await ctx.agentTeams.sendMessage(agentA, {
      target: botB.name,
      content: content('stays queued'),
      signal: SIGNAL,
    })
    openRead.mockRestore()
    expect(sent.status).toBe('queued')

    const leadLog = lead.session.snapshotEvents()
    expect(leadMailboxEdges(leadLog, sent.messageId)).toEqual(['team/message/queued'])
    expect(durable(lead).pendingMessages.map(message => message.id)).toEqual([sent.messageId])

    const targetLog = await storedEvents(ctx, botB.id)
    expect(observeMailboxDeliveryState(leadLog, targetLog, sent.messageId)).toBe('queued')

    ctx.agentTeams.interrupt(lead, botA.name)
    await waitNoAgent(ctx, botA.id)
  })
})
