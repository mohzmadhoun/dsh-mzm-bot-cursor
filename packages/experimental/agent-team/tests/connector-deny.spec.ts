/** P6 US3 T026 — Host connector-tool deny via dsh-user-approval (Path A). */

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
import ApprovalService, {
  setApprovalPolicy,
  type ApprovalOutcome,
} from '@deepseek-ai/dsh-user-approval'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { MemoryCredentials } from '../../../credentials/credentials/tests/memory.ts'
import TeamService, {
  PASS_FIXTURE_CATALOG_ID,
  passFixturePublicToolName,
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
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-deny-'))
  roots.push(storageRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(TestSessionQuery)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentFork, { providerName: 'fork' })
  await ctx.plugin(MemoryCredentials)
  await ctx.plugin(ApprovalService)
  await ctx.plugin(TeamService)
  const adapter = new MockAdapter(script)
  ctx.llm.registerAdapter(['mock'], adapter)
  const lead = await ctx.agentLoop.create(SessionId('lead'), { provider: 'mock', model: 'mock' })
  return { ctx, lead }
}

async function readyConnector(ctx: Context, lead: Awaited<ReturnType<typeof setup>>['lead']) {
  await ctx.agentTeams.createBot(lead, {
    displayName: 'Deny Bot',
    modelSelection: { provider: 'mock', model: 'd1' },
    signal: SIGNAL,
  })
  const installed = await ctx.agentTeams.installConnector(lead, {
    catalogId: PASS_FIXTURE_CATALOG_ID,
    signal: SIGNAL,
  })
  const connectorId = installed.connector.connectorId
  await ctx.agentTeams.authenticateConnector(lead, {
    connectorId,
    secret: 'deny-path-token',
    signal: SIGNAL,
  })
  return connectorId
}

describe('P6 T026 Host connector tool deny path', () => {
  it('standing never → invokeConnectorTool outcome=denied (not success)', async () => {
    const { ctx, lead } = await setup([textResponse('deny never')])
    const connectorId = await readyConnector(ctx, lead)
    setApprovalPolicy(lead.session, 'never')

    const executed = vi.fn()
    const tools = ctx.get('tools')
    if (tools === undefined) throw new Error('expected ctx.tools')
    const originalExecute = tools.execute.bind(tools)
    tools.execute = (async (...args: Parameters<typeof originalExecute>) => {
      executed()
      return originalExecute(...args)
    }) as typeof tools.execute

    const invoked = await ctx.agentTeams.invokeConnectorTool(lead, {
      connectorId,
      arguments: { message: 'must-not-run' },
      signal: SIGNAL,
    })
    expect(invoked.toolCall).toMatchObject({
      connectorId,
      toolName: passFixturePublicToolName(),
      outcome: 'denied',
    })
    expect(invoked.toolCall.outcome).not.toBe('success')
    expect(invoked.toolCall.detail).toMatch(/denied|never|user-deny/i)
    expect(executed).not.toHaveBeenCalled()

    const remote = await ctx.agentTeams.remoteInvokeConnectorTool(lead, {
      connectorId,
      arguments: { message: 'remote-must-not-run' },
    }, SIGNAL)
    expect(remote).toMatchObject({
      ok: true,
      value: {
        toolCall: {
          connectorId,
          toolName: passFixturePublicToolName(),
          outcome: 'denied',
        },
      },
    })
  })

  it('user-deny answerer rejected → invokeConnectorTool outcome=denied', async () => {
    const { ctx, lead } = await setup([textResponse('deny user')])
    const connectorId = await readyConnector(ctx, lead)
    setApprovalPolicy(lead.session, 'ask')
    ctx.on('approval/request', () => Promise.resolve<ApprovalOutcome>('rejected'))

    const invoked = await ctx.agentTeams.invokeConnectorTool(lead, {
      connectorId,
      signal: SIGNAL,
    })
    expect(invoked.toolCall.outcome).toBe('denied')
    expect(invoked.toolCall.outcome).not.toBe('success')
    expect(invoked.toolCall.detail).toMatch(/denied/i)
  })

  it('ask + allowed-once still yields outcome=success', async () => {
    const { ctx, lead } = await setup([textResponse('deny allow')])
    const connectorId = await readyConnector(ctx, lead)
    setApprovalPolicy(lead.session, 'ask')
    ctx.on('approval/request', () => Promise.resolve<ApprovalOutcome>('allowed-once'))

    const invoked = await ctx.agentTeams.invokeConnectorTool(lead, {
      connectorId,
      arguments: { message: 'after-allow' },
      signal: SIGNAL,
    })
    expect(invoked.toolCall).toMatchObject({
      connectorId,
      toolName: passFixturePublicToolName(),
      outcome: 'success',
    })
    expect(invoked.toolCall.detail).toMatch(/after-allow/)
  })
})
