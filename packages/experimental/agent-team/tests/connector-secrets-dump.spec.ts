/**
 * P6 US4 T029 — Host connector secrets stay in the credential seam only.
 * Path A: prove secret values are absent from session-log / exportable dump
 * plaintext and from describe/view projections (FR-007/008). Chat-paste is not
 * the primary auth path — Host `authenticateConnector` writes credentials only.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import { SESSION_FORMAT_VERSION, SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import TeamService, {
  PASS_FIXTURE_CATALOG_ID,
  connectorCredentialKey,
} from '../src/index.ts'
import { TestSessionQuery } from './test-session-query.ts'

const SIGNAL = new AbortController().signal
/** Unique plaintext probe — must never appear in dumps/describe after auth. */
const SECRET = 'US4_PLAINTEXT_MUST_NOT_APPEAR_IN_DUMPS_9f3c2a1b'
const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

/**
 * Read committed session events (the same payload session-log export serializes).
 * @param ctx - Host context with session persistence.
 * @param id - session to dump.
 * @returns committed events in seq order.
 */
async function storedEvents(ctx: Context, id: SessionId): Promise<readonly SessionEvent[]> {
  const handle = await ctx.sessionPersistence.open(id, 'read')
  try {
    return (await handle.read()).events
  } finally {
    await handle.close()
  }
}

/**
 * Canonical exportable session-log dump text (header + events JSONL).
 * Mirrors `dsh-session-log-export` `serializeSessionLog` without mounting Web export.
 * @param ctx - Host context with session persistence.
 * @param id - session to export.
 * @returns plaintext dump that Verifier / `/export` would expose.
 */
async function exportableSessionDump(ctx: Context, id: SessionId): Promise<string> {
  const handle = await ctx.sessionPersistence.open(id, 'read')
  try {
    const header = handle.header
    const { events } = await handle.read()
    const lines = [JSON.stringify({
      type: 'session',
      version: header.version ?? SESSION_FORMAT_VERSION,
      id: header.id,
      createdAt: header.createdAt,
      ...header.cwd !== undefined ? { cwd: header.cwd } : {},
      ...header.parentSession !== undefined ? { parentSession: header.parentSession } : {},
      isSeeded: header.isSeeded,
      ...header.origin !== undefined ? { origin: header.origin } : {},
      delegationDepth: header.delegationDepth ?? 0,
      ...header.agentPreset !== undefined ? { agentPreset: header.agentPreset } : {},
    })]
    for (const event of events) lines.push(JSON.stringify(event))
    return `${lines.join('\n')}\n`
  } finally {
    await handle.close()
  }
}

async function setup(script: ConstructorParameters<typeof MockAdapter>[0] = []) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-secrets-dump-'))
  roots.push(storageRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(TestSessionQuery)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentFork, { providerName: 'fork' })
  await ctx.plugin(MemoryCredentials)
  await ctx.plugin(TeamService)
  const adapter = new MockAdapter(script)
  ctx.llm.registerAdapter(['mock'], adapter)
  const lead = await ctx.agentLoop.create(SessionId('lead'), { provider: 'mock', model: 'mock' })
  return { ctx, lead }
}

describe('P6 US4 T029 Host connector secrets absent from dumps', () => {
  it('stores secret only in credentials; session dump / describe / view omit plaintext', async () => {
    const { ctx, lead } = await setup([textResponse('us4 secrets dump')])
    await ctx.agentTeams.createBot(lead, {
      displayName: 'Secrets Dump Bot',
      modelSelection: { provider: 'mock', model: 's4' },
      signal: SIGNAL,
    })

    const installed = await ctx.agentTeams.installConnector(lead, {
      catalogId: PASS_FIXTURE_CATALOG_ID,
      signal: SIGNAL,
    })
    const connectorId = installed.connector.connectorId
    const key = connectorCredentialKey(connectorId)

    // Primary auth path = Host credential seam Remote (FR-008) — not chat-paste.
    const ready = await ctx.agentTeams.authenticateConnector(lead, {
      connectorId,
      secret: SECRET,
      signal: SIGNAL,
    })
    expect(ready.connector).toMatchObject({
      connectorId,
      authState: 'ready',
      credentialConfigured: true,
    })
    expect(JSON.stringify(ready)).not.toContain(SECRET)

    // Secret value lives only in Host credentials (FR-007 SoT).
    const stored = await ctx.credentials.readRecord(key)
    expect(stored).toEqual({ kind: 'api-key', key: SECRET })

    const described = await ctx.agentTeams.describeConnectorCredential(lead, {
      connectorId,
      signal: SIGNAL,
    })
    expect(described).toMatchObject({
      connectorId,
      credentialKey: String(key),
      configured: true,
      kind: 'api-key',
    })
    expect(JSON.stringify(described)).not.toContain(SECRET)

    const listed = await ctx.credentials.listRecords()
    expect(listed.some(entry => entry.key === key && entry.kind === 'api-key')).toBe(true)
    expect(JSON.stringify(listed)).not.toContain(SECRET)

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(JSON.stringify(view)).not.toContain(SECRET)
    expect(view.connectors[0]?.credentialConfigured).toBe(true)

    const connectors = ctx.agentTeams.listConnectors(lead, SIGNAL)
    expect(JSON.stringify(connectors)).not.toContain(SECRET)

    // Lead journal / session-log events (team/connector) carry credentialKey address only.
    const leadEvents = await storedEvents(ctx, lead.id)
    const connectorEvents = leadEvents.filter(event => event.type === 'team/connector')
    expect(connectorEvents.length).toBeGreaterThanOrEqual(2)
    for (const event of connectorEvents) {
      expect(event.type).toBe('team/connector')
      if (event.type !== 'team/connector') continue
      expect(JSON.stringify(event)).not.toContain(SECRET)
      if (event.data.connector.authState === 'ready') {
        expect(event.data.connector.credentialKey).toBe(String(key))
      }
    }

    // Exportable dump plaintext (same serialization session-log-export ships) omits secret.
    const dump = await exportableSessionDump(ctx, lead.id)
    expect(dump).toContain('team/connector')
    expect(dump).not.toContain(SECRET)

    // Chat-paste is not primary: no user/message on the Lead log carries the secret.
    const userMessages = leadEvents.filter(event => event.type === 'user/message')
    for (const event of userMessages) {
      expect(JSON.stringify(event)).not.toContain(SECRET)
    }
  })

  it('rejects empty secret without writing credentials or journal auth-ready', async () => {
    const { ctx, lead } = await setup([textResponse('us4 empty secret')])
    await ctx.agentTeams.createBot(lead, {
      displayName: 'Empty Secret Bot',
      modelSelection: { provider: 'mock', model: 's4e' },
      signal: SIGNAL,
    })
    const installed = await ctx.agentTeams.installConnector(lead, {
      catalogId: PASS_FIXTURE_CATALOG_ID,
      signal: SIGNAL,
    })
    const connectorId = installed.connector.connectorId
    const key = connectorCredentialKey(connectorId)

    await expect(ctx.agentTeams.authenticateConnector(lead, {
      connectorId,
      secret: '   ',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT', message: /secret must be non-empty/ })

    expect(await ctx.credentials.readRecord(key)).toBeUndefined()
    const dump = await exportableSessionDump(ctx, lead.id)
    expect(dump).not.toContain(SECRET)
    expect(ctx.agentTeams.listConnectors(lead, SIGNAL).connectors[0]?.authState).toBe('needs_auth')
  })
})
