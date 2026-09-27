/**
 * Bot chats dispatch through the ctx.llm adapter registered for that Bot's
 * ModelSelection. The adapter resolves that provider's Host credential.
 * A missing named reference fails with MISSING_CREDENTIAL and does not send
 * another Bot's key.
 */

import { createServer } from 'node:http'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import {
  CredentialProvider,
  credentialRef,
} from '@deepseek-ai/dsh-credentials'
import type {
  CredentialInfo,
  CredentialKey,
  CredentialRecord,
  CredentialRecordEntry,
  CredentialRecordInfo,
  CredentialRef,
  ResolvedCredential,
} from '@deepseek-ai/dsh-credentials'
import * as LlmPiAi from '@deepseek-ai/dsh-llm-pi-ai'
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import TeamService from '../src/index.ts'
import { TestSessionQuery } from './test-session-query.ts'

const SIGNAL = new AbortController().signal
const ALPHA_REF = 'ALPHA_BOT_KEY'
const BETA_REF = 'BETA_BOT_KEY'
const ALPHA_TOKEN = 'alpha-store-token'
const BETA_TOKEN = 'beta-store-token'
const AMBIENT_DECOY = 'ambient-decoy-token'

const TEXT_EVENTS = [
  '{"choices":[{"delta":{"role":"assistant","content":""},"index":0,"finish_reason":null}]}',
  '{"choices":[{"delta":{"content":"hello"},"index":0,"finish_reason":null}]}',
  '{"choices":[{"delta":{},"index":0,"finish_reason":"stop"}],"usage":{"prompt_tokens":3,"completion_tokens":1}}',
  '[DONE]',
]

interface CapturedCall {
  path: string
  authorization: string | undefined
  model: unknown
}

/** The store constructed by the latest `ctx.plugin(RecordingCredentials)` call. */
let latestCredentials: RecordingCredentials | undefined

/** In-memory Host credential store. Records each resolve ref and never logs values. */
class RecordingCredentials extends CredentialProvider {
  readonly resolved: CredentialRef[] = []
  private readonly values = new Map<string, string>()
  private readonly records = new Map<CredentialKey, CredentialRecord>()

  constructor(ctx: Context, seed: Record<string, string> = {}) {
    super(ctx)
    latestCredentials = this
    for (const [key, value] of Object.entries(seed)) this.values.set(key, value)
  }

  override resolve(ref: CredentialRef): Promise<ResolvedCredential | undefined> {
    this.resolved.push(ref)
    const value = this.values.get(ref)
    return Promise.resolve(value === undefined || value.length === 0
      ? undefined
      : { value, source: 'memory' })
  }

  override describe(ref: CredentialRef): Promise<CredentialInfo> {
    const value = this.values.get(ref)
    const configured = value !== undefined && value.length > 0
    return Promise.resolve({
      configured,
      ...configured ? { source: 'memory' } : {},
      writable: true,
    })
  }

  override set(ref: CredentialRef, value: string): Promise<void> {
    if (value.length === 0) {
      return Promise.reject(new Error('memory credentials: an empty value cannot be stored; use unset'))
    }
    this.values.set(ref, value)
    this.ctx.emit('credentials/reference-updated', ref)
    return Promise.resolve()
  }

  override unset(ref: CredentialRef): Promise<void> {
    if (this.values.delete(ref)) this.ctx.emit('credentials/reference-updated', ref)
    return Promise.resolve()
  }

  override readRecord(key: CredentialKey): Promise<CredentialRecord | undefined> {
    return Promise.resolve(this.records.get(key))
  }

  override describeRecord(key: CredentialKey): Promise<CredentialRecordInfo> {
    const stored = this.records.get(key)
    return Promise.resolve(stored === undefined
      ? { configured: false, writable: true }
      : { configured: true, kind: stored.kind, writable: true })
  }

  override listRecords(): Promise<readonly CredentialRecordEntry[]> {
    return Promise.resolve([...this.records].map(([key, record]) => ({ key, kind: record.kind })))
  }

  override async modifyRecord(
    key: CredentialKey,
    mutate: (current: CredentialRecord | undefined) => Promise<CredentialRecord | undefined>,
  ): Promise<CredentialRecord | undefined> {
    const current = this.records.get(key)
    const next = await mutate(current)
    if (next === undefined) return current
    this.records.set(key, next)
    this.ctx.emit('credentials/record-updated', key)
    return next
  }

  override deleteRecord(key: CredentialKey): Promise<void> {
    if (this.records.delete(key)) this.ctx.emit('credentials/record-updated', key)
    return Promise.resolve()
  }
}

const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
  vi.unstubAllEnvs()
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
})

function track(cleanup: () => Promise<void>): void {
  cleanups.push(cleanup)
}

/** Loopback stand-in for the provider HTTP call. Binds an ephemeral port. */
async function openProvider(): Promise<{ url: string; calls: CapturedCall[] }> {
  const calls: CapturedCall[] = []
  const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk: Buffer) => { chunks.push(chunk) })
    request.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      let model: unknown
      if (raw.length > 0) {
        const body: unknown = JSON.parse(raw)
        if (typeof body === 'object' && body !== null && 'model' in body) model = body.model
      }
      const authorization = request.headers.authorization
      calls.push({
        path: request.url ?? '',
        authorization: typeof authorization === 'string' ? authorization : undefined,
        model,
      })
      response.writeHead(200, { 'content-type': 'text/event-stream' })
      for (const event of TEXT_EVENTS) response.write(`data: ${event}\n\n`)
      response.end()
    })
  })
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => { resolve() })
  })
  track(() => closeServer(server))
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('provider stand-in has no port')
  return { url: `http://127.0.0.1:${address.port}`, calls }
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => { server.close(() => { resolve() }) })
}

async function storedEvents(ctx: Context, id: SessionId): Promise<readonly SessionEvent[]> {
  const handle = await ctx.sessionPersistence.open(id, 'read')
  try {
    return (await handle.read()).events
  } finally {
    await handle.close()
  }
}

function requestConfigs(events: readonly SessionEvent[]): unknown[] {
  return events.flatMap(event => event.type === 'request/header' ? [event.data.header.config] : [])
}

async function waitNoAgent(ctx: Context, id: SessionId): Promise<void> {
  await vi.waitFor(() => { expect(ctx.agents.get(id)).toBeUndefined() }, { timeout: 5_000 })
}

async function setup(): Promise<{
  ctx: Context
  lead: Agent
  calls: CapturedCall[]
  credentials: RecordingCredentials
}> {
  vi.stubEnv('DEEPSEEK_API_KEY', AMBIENT_DECOY)
  vi.stubEnv(ALPHA_REF, 'ambient-alpha-must-not-win')
  vi.stubEnv(BETA_REF, 'ambient-beta-must-not-win')
  const provider = await openProvider()
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-bot-llm-'))
  track(async () => { rmSync(storageRoot, { recursive: true, force: true }) })
  const ctx = new Context()
  track(async () => { await ctx.fiber.dispose() })
  await mountAgentLoopTestDependencies(ctx)
  latestCredentials = undefined
  await ctx.plugin(RecordingCredentials, {
    [ALPHA_REF]: ALPHA_TOKEN,
    [BETA_REF]: BETA_TOKEN,
  })
  const credentials = latestCredentials
  if (credentials === undefined) throw new Error('credentials plugin did not construct its store')
  await ctx.plugin(LlmPiAi, {
    providers: {
      'acme-alpha': {
        apiKeyEnv: ALPHA_REF,
        api: 'openai-completions',
        baseURL: `${provider.url}/v1`,
        models: [{ id: 'alpha-model', contextWindow: 8192, maxTokens: 256 }],
      },
      'acme-beta': {
        apiKeyEnv: BETA_REF,
        api: 'openai-completions',
        baseURL: `${provider.url}/v1`,
        models: [{ id: 'beta-model', contextWindow: 8192, maxTokens: 256 }],
      },
    },
  })
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(TestSessionQuery)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentFork, { providerName: 'fork' })
  await ctx.plugin(TeamService, {})
  ctx.llm.registerAdapter(['mock'], new MockAdapter([textResponse('lead stays on mock')]))
  const lead = await ctx.agentLoop.create(SessionId('lead'), { provider: 'mock', model: 'mock' })
  return { ctx, lead, calls: provider.calls, credentials }
}

describe('Bot model calls through ctx.llm credentials', () => {
  it('resolves each Bot through its assigned provider adapter and Host credential', async () => {
    const { ctx, lead, calls, credentials } = await setup()

    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Alpha Bot',
      modelSelection: { provider: 'acme-alpha', model: 'alpha-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)
    expect(requestConfigs(await storedEvents(ctx, alpha.id))).toEqual([
      expect.objectContaining({ provider: 'acme-alpha', model: 'alpha-model' }),
    ])
    expect(calls).toEqual([
      expect.objectContaining({
        path: '/v1/chat/completions',
        authorization: `Bearer ${ALPHA_TOKEN}`,
        model: 'alpha-model',
      }),
    ])
    expect(calls.some(call => call.authorization?.includes(BETA_TOKEN))).toBe(false)
    expect(calls.some(call => call.authorization?.includes(AMBIENT_DECOY))).toBe(false)

    const beta = await ctx.agentTeams.createBot(lead, {
      displayName: 'Beta Bot',
      modelSelection: { provider: 'acme-beta', model: 'beta-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, beta.id)
    expect(requestConfigs(await storedEvents(ctx, beta.id))).toEqual([
      expect.objectContaining({ provider: 'acme-beta', model: 'beta-model' }),
    ])
    expect(calls).toHaveLength(2)
    expect(calls[1]).toMatchObject({
      authorization: `Bearer ${BETA_TOKEN}`,
      model: 'beta-model',
    })
    expect(calls[0]?.authorization).toBe(`Bearer ${ALPHA_TOKEN}`)

    const resolvedBeforeMiss = credentials.resolved.length
    const callsBeforeMiss = calls.length
    await ctx.credentials.unset(credentialRef(BETA_REF))
    const followUp = await ctx.agentTeams.sendMessage(lead, {
      target: beta.name,
      content: [{ type: 'text', text: 'second chat after the beta credential is removed' }],
      signal: SIGNAL,
    })
    expect(followUp.status).toBe('accepted')
    await waitNoAgent(ctx, beta.id)
    const betaEvents = await storedEvents(ctx, beta.id)
    expect(betaEvents.filter(event => event.type === 'turn/end').at(-1)).toMatchObject({
      type: 'turn/end',
      data: { reason: { kind: 'error', error: { code: 'MISSING_CREDENTIAL' } } },
    })
    expect(requestConfigs(betaEvents).every(config => (
      typeof config === 'object' && config !== null
      && 'provider' in config && config.provider === 'acme-beta'
      && 'model' in config && config.model === 'beta-model'
    ))).toBe(true)
    expect(calls).toHaveLength(callsBeforeMiss)
    expect(credentials.resolved.slice(resolvedBeforeMiss)).toContain(BETA_REF)
    expect(credentials.resolved.slice(resolvedBeforeMiss)).not.toContain(ALPHA_REF)

    const alphaAgain = await ctx.agentTeams.sendMessage(lead, {
      target: alpha.name,
      content: [{ type: 'text', text: 'alpha still uses its own credential' }],
      signal: SIGNAL,
    })
    expect(alphaAgain.status).toBe('accepted')
    await waitNoAgent(ctx, alpha.id)
    expect(calls.at(-1)).toMatchObject({
      authorization: `Bearer ${ALPHA_TOKEN}`,
      model: 'alpha-model',
    })
    expect(calls.some(call => call.authorization === `Bearer ${BETA_TOKEN}` && call.model === 'alpha-model')).toBe(false)
    expect(requestConfigs(await storedEvents(ctx, alpha.id)).every(config => (
      typeof config === 'object' && config !== null
      && 'provider' in config && config.provider === 'acme-alpha'
      && 'model' in config && config.model === 'alpha-model'
    ))).toBe(true)
  })
})
