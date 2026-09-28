/** P6 T007–T012: Host Connector catalog + additive event routines + MCP/credential bind. */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import { SessionId } from '@deepseek-ai/dsh-session'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import TeamService, {
  PASS_CONNECTOR_CATALOG,
  PASS_FIXTURE_CATALOG_ID,
  PASS_FIXTURE_SERVER_NAME,
  connectorCredentialKey,
  passFixturePublicToolName,
  routinesDueForWake,
} from '../src/index.ts'
import { TestSessionQuery } from './test-session-query.ts'

const SIGNAL = new AbortController().signal
const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

async function setup(script: ConstructorParameters<typeof MockAdapter>[0] = []) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-connector-'))
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

async function waitNoAgent(ctx: Context, id: SessionId): Promise<void> {
  await vi.waitFor(() => { expect(ctx.agents.get(id)).toBeUndefined() }, { timeout: 5_000 })
}

describe('P6 T007-T012 Host connector + event routine foundation', () => {
  it('T007/T009/T012: listConnectorCatalog + installConnector persist Host journal rows', async () => {
    const { ctx, lead } = await setup([textResponse('connector install')])
    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Connector Bot',
      modelSelection: { provider: 'mock', model: 'c1' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)

    const catalog = ctx.agentTeams.listConnectorCatalog(lead, SIGNAL)
    expect(catalog.catalog).toEqual(PASS_CONNECTOR_CATALOG)
    expect(catalog.catalog.some(entry => entry.catalogId === PASS_FIXTURE_CATALOG_ID)).toBe(true)

    await expect(ctx.agentTeams.installConnector(lead, {
      catalogId: 'missing-catalog',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT', message: /not found/ })

    const installed = await ctx.agentTeams.installConnector(lead, {
      catalogId: PASS_FIXTURE_CATALOG_ID,
      signal: SIGNAL,
    })
    expect(installed.connector).toMatchObject({
      catalogId: PASS_FIXTURE_CATALOG_ID,
      serverName: PASS_FIXTURE_SERVER_NAME,
      displayName: 'Verifier Fixture Connector',
      installState: 'installed',
      authState: 'needs_auth',
      transport: 'stdio',
      credentialConfigured: false,
    })

    const listed = ctx.agentTeams.listConnectors(lead, SIGNAL)
    expect(listed.connectors).toEqual([installed.connector])

    const remoteCatalog = await ctx.agentTeams.remoteListConnectorCatalog(lead, {}, SIGNAL)
    expect(remoteCatalog).toMatchObject({ ok: true, value: { catalog: PASS_CONNECTOR_CATALOG } })
    const remoteList = await ctx.agentTeams.remoteListConnectors(lead, {}, SIGNAL)
    expect(remoteList).toMatchObject({ ok: true, value: { connectors: [installed.connector] } })

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.connectors).toEqual([installed.connector])
  })

  it('T010/T011: authenticateConnector stores secret in credentials and binds MCP fixture tools', async () => {
    const { ctx, lead } = await setup([textResponse('connector auth')])
    await ctx.agentTeams.createBot(lead, {
      displayName: 'Auth Bot',
      modelSelection: { provider: 'mock', model: 'c2' },
      signal: SIGNAL,
    })

    const installed = await ctx.agentTeams.installConnector(lead, {
      catalogId: PASS_FIXTURE_CATALOG_ID,
      signal: SIGNAL,
    })
    const connectorId = installed.connector.connectorId
    const secret = 'fixture-token-not-for-dumps'

    await expect(ctx.agentTeams.authenticateConnector(lead, {
      connectorId,
      secret: '   ',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT', message: /secret must be non-empty/ })

    const ready = await ctx.agentTeams.authenticateConnector(lead, {
      connectorId,
      secret,
      signal: SIGNAL,
    })
    expect(ready.connector).toMatchObject({
      connectorId,
      authState: 'ready',
      installState: 'installed',
      credentialConfigured: true,
    })

    const described = await ctx.agentTeams.describeConnectorCredential(lead, {
      connectorId,
      signal: SIGNAL,
    })
    expect(described).toMatchObject({
      connectorId,
      credentialKey: String(connectorCredentialKey(connectorId)),
      configured: true,
      writable: true,
      kind: 'api-key',
    })
    expect(JSON.stringify(described)).not.toContain(secret)

    const remoteDescribe = await ctx.agentTeams.remoteDescribeConnectorCredential(
      lead,
      { connectorId },
      SIGNAL,
    )
    expect(remoteDescribe).toMatchObject({
      ok: true,
      value: { configured: true, kind: 'api-key' },
    })
    if (!remoteDescribe.ok) throw new Error('describe failed')
    expect(JSON.stringify(remoteDescribe.value)).not.toContain(secret)

    const publicName = passFixturePublicToolName()
    expect(publicName).toBe(`mcp__${PASS_FIXTURE_SERVER_NAME}__ping`)
    expect(ctx.tools.get(publicName)).toBeDefined()

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(JSON.stringify(view)).not.toContain(secret)
    expect(view.connectors[0]?.authState).toBe('ready')
  })

  it('T008/T012: createRoutine event path is additive; cron still due; event not cron-due', async () => {
    const { ctx, lead } = await setup([
      textResponse('event routine a'),
      textResponse('event routine b'),
    ])
    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Event Bot',
      modelSelection: { provider: 'mock', model: 'e1' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)

    await expect(ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Handle webhook',
      triggerKind: 'event',
      signal: SIGNAL,
    })).rejects.toMatchObject({
      code: 'TEAM_INVALID_ARGUMENT',
      message: /eventTrigger is required/,
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

    const eventCreated = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Handle webhook harness',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      signal: SIGNAL,
    })
    expect(eventCreated.routine).toMatchObject({
      botId: bot.id,
      intent: 'Handle webhook harness',
      identity: 'Handle webhook harness',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
      scheduleExpr: '',
      scheduleLabel: 'Webhook harness',
      status: 'active',
      lastRunAt: null,
    })

    const cronCreated = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Cron still works',
      scheduleExpr: '@every 5m',
      signal: SIGNAL,
    })
    expect(cronCreated.routine.triggerKind).toBe('cron')
    expect(cronCreated.routine.scheduleExpr).toBe('@every 5m')

    const listed = ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines
    expect(listed).toHaveLength(2)
    expect(listed.map(row => row.triggerKind).sort()).toEqual(['cron', 'event'])

    const dueAt = cronCreated.routine.createdAt + 5 * 60_000
    const journalRows = listed.map(row => ({
      routineId: row.routineId,
      botId: row.botId,
      intent: row.intent,
      scheduleExpr: row.scheduleExpr,
      triggerKind: row.triggerKind,
      ...row.eventTrigger === undefined ? {} : { eventTrigger: row.eventTrigger },
      status: row.status,
      lastRunAt: row.lastRunAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
    expect(routinesDueForWake(journalRows, dueAt).map(row => row.routineId))
      .toEqual([cronCreated.routine.routineId])

    const remote = await ctx.agentTeams.remoteCreateRoutine(lead, {
      botId: bot.id,
      intent: 'Second event',
      triggerKind: 'event',
      eventTrigger: 'webhook_harness',
    }, SIGNAL)
    expect(remote).toMatchObject({
      ok: true,
      value: { routine: { triggerKind: 'event', scheduleLabel: 'Webhook harness' } },
    })
  })
})
