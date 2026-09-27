/**
 * T022 / FR-004: Persist durable Host mailbox message fields on the Host path.
 * Product aliases (`fromBotId`, `toBotId`, `body`, `createdAt`, `source`) reconstruct
 * from Lead-log + target Session persistence — never Electron IPC.
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
import TeamService, {
  HOST_MAILBOX_MESSAGE_SOURCE,
  readHostMailboxMessage,
} from '../src/index.ts'
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

async function setup(script: ConstructorParameters<typeof MockAdapter>[0]) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-mailbox-persist-'))
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

describe('Host mailbox message field persistence (T022)', () => {
  it('persists product fields on Lead-log and reconstructs after cold read', async () => {
    const { ctx, lead } = await setup([
      'hang',
      textResponse('bot-b create turn'),
      textResponse('bot-b acts on handoff'),
    ])
    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Persist Sender',
      modelSelection: { provider: 'mock', model: 'model-a' },
      signal: SIGNAL,
    })
    const agentA = await waitRunning(ctx, botA.id)
    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Persist Recipient',
      modelSelection: { provider: 'mock', model: 'model-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botB.id)

    const bodyText = 'durable handoff body for T022'
    const sent = await ctx.agentTeams.sendMessage(agentA, {
      target: botB.name,
      content: content(bodyText),
      signal: SIGNAL,
    })
    expect(sent.status).toBe('accepted')
    await waitNoAgent(ctx, botB.id)

    const liveQueued = lead.session.snapshotEvents().find(event =>
      event.type === 'team/message/queued' && event.data.message.id === sent.messageId)
    expect(liveQueued?.type).toBe('team/message/queued')
    const liveCreatedAt = liveQueued?.type === 'team/message/queued' ? liveQueued.time : undefined
    expect(typeof liveCreatedAt).toBe('number')

    // Cold read through session persistence — product fields must survive Host storage.
    const leadLog = await storedEvents(ctx, lead.id)
    const targetLog = await storedEvents(ctx, botB.id)
    const record = readHostMailboxMessage(leadLog, targetLog, sent.messageId)
    expect(record).toEqual({
      id: sent.messageId,
      fromBotId: botA.id,
      toBotId: botB.id,
      body: content(bodyText),
      createdAt: liveCreatedAt,
      deliveryState: 'acted',
      source: HOST_MAILBOX_MESSAGE_SOURCE,
    })
    expect(record?.source.kind).toBe('host-mailbox')
    // Target durable receipt keeps team-message provenance (Host), never Electron IPC.
    const peer = targetLog.find(event =>
      event.type === 'user/message' && event.data.source.kind === 'team-message'
      && event.data.source.messageId === sent.messageId)
    expect(peer?.type === 'user/message' && peer.data.source.kind).toBe('team-message')
    expect(JSON.stringify(record)).not.toMatch(/electron-ipc|electron\/ipc/i)

    ctx.agentTeams.interrupt(lead, botA.name)
    await waitNoAgent(ctx, botA.id)
  }, 20_000)

  it('keeps Host-only source when deliveryState stays queued', async () => {
    const { ctx, lead } = await setup(['hang', textResponse('bot-b create')])
    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Queued Persist Sender',
      modelSelection: { provider: 'mock', model: 'model-a' },
      signal: SIGNAL,
    })
    const agentA = await waitRunning(ctx, botA.id)
    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Queued Persist Recipient',
      modelSelection: { provider: 'mock', model: 'model-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botB.id)

    const openRead = vi.spyOn(ctx.sessionPersistence, 'open').mockRejectedValueOnce(new Error('read unavailable'))
    const sent = await ctx.agentTeams.sendMessage(agentA, {
      target: botB.name,
      content: content('queued but durable'),
      signal: SIGNAL,
    })
    openRead.mockRestore()
    expect(sent.status).toBe('queued')

    const leadLog = await storedEvents(ctx, lead.id)
    const targetLog = await storedEvents(ctx, botB.id)
    const record = readHostMailboxMessage(leadLog, targetLog, sent.messageId)
    expect(record?.id).toBe(sent.messageId)
    expect(record?.fromBotId).toBe(botA.id)
    expect(record?.toBotId).toBe(botB.id)
    expect(record?.body).toEqual(content('queued but durable'))
    expect(record?.deliveryState).toBe('queued')
    expect(record?.source).toEqual(HOST_MAILBOX_MESSAGE_SOURCE)
    expect(typeof record?.createdAt).toBe('number')

    ctx.agentTeams.interrupt(lead, botA.name)
    await waitNoAgent(ctx, botA.id)
  })
})
