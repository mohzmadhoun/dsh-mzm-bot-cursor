/**
 * T023 / FR-005: Host session/RPC projections expose mailbox handoffs to Client.
 * `projectMailboxHandoffs` + `remoteView.handoffs` reconstruct product fields from
 * Lead + target Session logs — never Main-synthesized IPC.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId, SessionSeq, type SessionEvent, type SessionEventMap, type SessionEventType } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import TeamService, {
  HOST_MAILBOX_MESSAGE_SOURCE,
  projectMailboxHandoffs,
  TeamId,
  TeamMessageId,
} from '../src/index.ts'
import { TestSessionQuery } from './test-session-query.ts'

const SIGNAL = new AbortController().signal
const roots: string[] = []
const ROOT = SessionId('team-root')
const TEAM = TeamId(ROOT)
const CHILD = SessionId('child-b')

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function event<T extends SessionEventType>(
  type: T,
  data: SessionEventMap[T],
  seq: SessionSeq,
): SessionEvent<T> {
  return { type, data, seq, time: seq * 1000 } as unknown as SessionEvent<T>
}

describe('projectMailboxHandoffs (T023)', () => {
  it('projects Host-only handoffs in Lead queue order with deliveryState fold', () => {
    const firstId = TeamMessageId('message-1')
    const secondId = TeamMessageId('message-2')
    const leadEvents: SessionEvent[] = [
      event('team/message/queued', {
        version: 2,
        teamId: TEAM,
        message: {
          id: firstId,
          senderId: ROOT,
          senderName: 'bot-a',
          targetId: CHILD,
          content: [{ type: 'text', text: 'first handoff' }],
        },
      }, SessionSeq(1)),
      event('team/message/queued', {
        version: 2,
        teamId: TeamId(SessionId('other-team')),
        message: {
          id: TeamMessageId('other-team-message'),
          senderId: ROOT,
          senderName: 'bot-a',
          targetId: CHILD,
          content: [{ type: 'text', text: 'foreign team' }],
        },
      }, SessionSeq(2)),
      event('team/message/delivered', {
        version: 2,
        teamId: TEAM,
        messageId: firstId,
        targetId: CHILD,
      }, SessionSeq(3)),
      event('team/message/queued', {
        version: 2,
        teamId: TEAM,
        message: {
          id: secondId,
          senderId: ROOT,
          senderName: 'bot-a',
          targetId: CHILD,
          content: [{ type: 'text', text: 'second handoff' }],
        },
      }, SessionSeq(4)),
    ]
    const receipt = createUserMessage({
      content: [{ type: 'text', text: 'first handoff' }],
      source: {
        kind: 'team-message',
        teamId: TEAM,
        messageId: firstId,
        senderId: ROOT,
        senderName: 'bot-a',
      },
    })
    const targetEvents: SessionEvent[] = [
      event('user/message', receipt, SessionSeq(10)),
    ]

    const handoffs = projectMailboxHandoffs(
      leadEvents,
      new Map([[CHILD, targetEvents]]),
      TEAM,
    )
    expect(handoffs).toHaveLength(2)
    expect(handoffs[0]).toEqual({
      id: firstId,
      fromBotId: ROOT,
      toBotId: CHILD,
      body: [{ type: 'text', text: 'first handoff' }],
      createdAt: 1000,
      deliveryState: 'visible-pending',
      source: HOST_MAILBOX_MESSAGE_SOURCE,
    })
    expect(handoffs[1]).toMatchObject({
      id: secondId,
      deliveryState: 'queued',
      source: HOST_MAILBOX_MESSAGE_SOURCE,
    })
  })

  it('uses empty target logs when a recipient map entry is absent', () => {
    const messageId = TeamMessageId('message-alone')
    const leadEvents: SessionEvent[] = [
      event('team/message/queued', {
        version: 2,
        teamId: TEAM,
        message: {
          id: messageId,
          senderId: ROOT,
          senderName: 'bot-a',
          targetId: CHILD,
          content: [{ type: 'text', text: 'queued only' }],
        },
      }, SessionSeq(1)),
      event('team/message/delivered', {
        version: 2,
        teamId: TEAM,
        messageId,
        targetId: CHILD,
      }, SessionSeq(2)),
    ]
    expect(projectMailboxHandoffs(leadEvents, new Map(), TEAM)).toEqual([{
      id: messageId,
      fromBotId: ROOT,
      toBotId: CHILD,
      body: [{ type: 'text', text: 'queued only' }],
      createdAt: 1000,
      deliveryState: 'delivered',
      source: HOST_MAILBOX_MESSAGE_SOURCE,
    }])
  })
})

async function setup(script: ConstructorParameters<typeof MockAdapter>[0]) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-handoff-proj-'))
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
  return { ctx, lead, adapter, storageRoot }
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

describe('remoteView handoffs (T023)', () => {
  it('exposes visible-pending handoff on agentTeams/view after A→B send', async () => {
    const { ctx, lead } = await setup(['hang', 'hang'])
    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Handoff Sender',
      modelSelection: { provider: 'mock', model: 'model-a' },
      signal: SIGNAL,
    })
    const agentA = await waitRunning(ctx, botA.id)
    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Handoff Recipient',
      modelSelection: { provider: 'mock', model: 'model-b' },
      signal: SIGNAL,
    })
    const agentB = await waitRunning(ctx, botB.id)

    const sent = await ctx.agentTeams.sendMessage(agentA, {
      target: botB.name,
      content: content('observe me on view'),
      signal: SIGNAL,
    })

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.handoffs).toHaveLength(1)
    expect(view.handoffs[0]).toMatchObject({
      id: sent.messageId,
      fromBotId: botA.id,
      toBotId: botB.id,
      body: content('observe me on view'),
      deliveryState: 'visible-pending',
      source: HOST_MAILBOX_MESSAGE_SOURCE,
    })
    expect(view.handoffs[0]?.source.kind).toBe('host-mailbox')

    ctx.agentTeams.interrupt(lead, botA.name)
    ctx.agentTeams.interrupt(lead, botB.name)
    agentA.cancel({ kind: 'parent' })
    agentB.cancel({ kind: 'parent' })
    await waitNoAgent(ctx, botA.id)
    await waitNoAgent(ctx, botB.id)
  }, 20_000)

  it('folds acted handoff after B cold-resumes on the mailbox message', async () => {
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
      content: content('act on this'),
      signal: SIGNAL,
    })

    const resumed = await waitRunning(ctx, botB.id)
    await vi.waitFor(async () => {
      const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
      expect(view.handoffs).toEqual([expect.objectContaining({
        id: sent.messageId,
        deliveryState: 'acted',
        source: HOST_MAILBOX_MESSAGE_SOURCE,
      })])
    }, { timeout: 10_000 })

    ctx.agentTeams.interrupt(lead, botA.name)
    ctx.agentTeams.interrupt(lead, botB.name)
    agentA.cancel({ kind: 'parent' })
    resumed.cancel({ kind: 'parent' })
    await waitNoAgent(ctx, botA.id)
    await waitNoAgent(ctx, botB.id)
  }, 20_000)
})
