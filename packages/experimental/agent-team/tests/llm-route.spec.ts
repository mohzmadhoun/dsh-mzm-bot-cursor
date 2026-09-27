/**
 * T016 / FR-002: Bot model calls resolve through Host `ctx.llm` adapters and
 * Host credential resolve — not Electron Main inventing bot records or routes.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-credentials'
import { LlmError } from '@deepseek-ai/dsh-llm'
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import TeamService from '../src/index.ts'
import { CredentialResolvingAdapter } from './credential-resolving-adapter.ts'
import { TestSessionQuery } from './test-session-query.ts'

const SIGNAL = new AbortController().signal
const PROVIDER_A = 'provider-a'
const PROVIDER_B = 'provider-b'
const REF_A = credentialRef('BOT_PROVIDER_A_KEY')
const REF_B = credentialRef('BOT_PROVIDER_B_KEY')
const SECRET_A = 'sk-host-credential-a-only'
const SECRET_B = 'sk-host-credential-b-only'

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

function content(text: string) {
  return [{ type: 'text' as const, text }]
}

async function waitNoAgent(ctx: Context, id: SessionId): Promise<void> {
  await vi.waitFor(() => { expect(ctx.agents.get(id)).toBeUndefined() }, { timeout: 5_000 })
}

async function setupCredentialRoute(script: ConstructorParameters<typeof CredentialResolvingAdapter>[2]) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-llm-route-'))
  roots.push(storageRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(TestSessionQuery)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentFork, { providerName: 'fork' })
  await ctx.plugin(TeamService)
  // Host credentials seam (product primary = credentials-local; in-memory for unit proof).
  await ctx.plugin(MemoryCredentials, { [REF_A]: SECRET_A })
  // Lead keeps a mock route so Team bootstrap never invents a model router in Electron.
  ctx.llm.registerAdapter(['mock'], new MockAdapter([]))
  const adapter = new CredentialResolvingAdapter(
    ctx,
    new Map([[PROVIDER_A, REF_A], [PROVIDER_B, REF_B]]),
    script,
  )
  ctx.llm.registerAdapter([PROVIDER_A, PROVIDER_B], adapter)
  const lead = await ctx.agentLoop.create(SessionId('lead'), { provider: 'mock', model: 'mock' })
  return { ctx, lead, adapter }
}

describe('Bot model calls via ctx.llm + Host credentials (T016)', () => {
  it('routes Bot chats through ctx.llm adapters using the bot assignment and Host credential resolve', async () => {
    const { ctx, lead, adapter } = await setupCredentialRoute([
      textResponse('bot-a first'),
      textResponse('bot-a follow-up'),
    ])
    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Route Bot A',
      modelSelection: { provider: PROVIDER_A, model: 'model-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, created.id)

    const followUp = await ctx.agentTeams.sendMessage(lead, {
      target: created.name,
      content: content('second chat uses the same Host llm route'),
      signal: SIGNAL,
    })
    expect(followUp.status).toBe('accepted')
    await waitNoAgent(ctx, created.id)

    // agent-loop dispatches via prepareCall → adapter.stream (Host ctx.llm registration).
    expect(adapter.requests.length).toBeGreaterThanOrEqual(2)
    for (const request of adapter.requests) {
      expect(request).toMatchObject({ provider: PROVIDER_A, model: 'model-a' })
    }
    expect(adapter.resolves.length).toBe(adapter.requests.length)
    for (const hit of adapter.resolves) {
      expect(hit).toEqual({
        provider: PROVIDER_A,
        model: 'model-a',
        ref: REF_A,
        value: SECRET_A,
      })
    }

    const headers = (await storedEvents(ctx, created.id))
      .filter(event => event.type === 'request/header')
    expect(headers.length).toBeGreaterThanOrEqual(2)
    for (const event of headers) {
      expect(event.type === 'request/header' && event.data.header.config).toMatchObject({
        provider: PROVIDER_A,
        model: 'model-a',
      })
    }
    // Session log must not embed the raw Host credential secret.
    const dump = JSON.stringify(await storedEvents(ctx, created.id))
    expect(dump).not.toContain(SECRET_A)
  })

  it('fails MISSING_CREDENTIAL for a bot provider without Host resolve and never uses a peer bot credential', async () => {
    const { ctx, lead, adapter } = await setupCredentialRoute([
      textResponse('bot-a ok'),
      textResponse('bot-b recovered'),
    ])
    // Only REF_A is seeded; REF_B is absent — Bot B must not silently use SECRET_A.
    expect(await ctx.credentials.resolve(REF_B)).toBeUndefined()
    expect(await ctx.credentials.resolve(REF_A)).toEqual({ value: SECRET_A, source: 'memory' })

    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Cred Bot A',
      modelSelection: { provider: PROVIDER_A, model: 'model-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botA.id)
    expect(adapter.resolves).toEqual([{
      provider: PROVIDER_A,
      model: 'model-a',
      ref: REF_A,
      value: SECRET_A,
    }])

    const errors: unknown[] = []
    ctx.on('agent/error', ({ error }) => { errors.push(error) })

    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Cred Bot B',
      modelSelection: { provider: PROVIDER_B, model: 'model-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botB.id)

    expect(adapter.requests.some(request => request.provider === PROVIDER_B && request.model === 'model-b'))
      .toBe(true)
    // Peer credential never resolved for provider-b.
    expect(adapter.resolves.every(hit => hit.ref === REF_A && hit.value === SECRET_A)).toBe(true)
    expect(adapter.resolves.some(hit => hit.provider === PROVIDER_B)).toBe(false)

    const missing = errors.find((error): error is LlmError => (
      error instanceof LlmError && error.failure.code === 'MISSING_CREDENTIAL'
    ))
    expect(missing).toBeDefined()
    expect(missing!.failure.message).toMatch(/provider-b|BOT_PROVIDER_B_KEY|no silent fallback/i)

    // Storing Bot B's own Host credential later still requires its own ref — not A's.
    await ctx.credentials.set(REF_B, SECRET_B)
    const followUp = await ctx.agentTeams.sendMessage(lead, {
      target: botB.name,
      content: content('retry after Host credential entry'),
      signal: SIGNAL,
    })
    expect(followUp.status).toBe('accepted')
    await waitNoAgent(ctx, botB.id)
    expect(adapter.resolves).toEqual([
      {
        provider: PROVIDER_A,
        model: 'model-a',
        ref: REF_A,
        value: SECRET_A,
      },
      {
        provider: PROVIDER_B,
        model: 'model-b',
        ref: REF_B,
        value: SECRET_B,
      },
    ])
    expect(adapter.resolves.some(hit => hit.provider === PROVIDER_B && hit.value === SECRET_A)).toBe(false)
  })
})
