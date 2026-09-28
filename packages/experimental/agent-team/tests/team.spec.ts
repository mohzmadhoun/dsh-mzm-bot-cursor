import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionLogOffset, SessionId, type Session, type SessionEvent } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import SubagentService from '@deepseek-ai/dsh-subagent'
import { deliverSubagentPrompt, type HostPromptDeliverer } from '@deepseek-ai/dsh-subagent/internal'
import * as SubagentFork from '@deepseek-ai/dsh-subagent-fork-in-process'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm/brand'
import { MockAdapter, textResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import TeamService, {
  SidebarSectionId,
  TeamError,
  TeamId,
  TeamMessageId,
  TeamTaskId,
  RoutineId,
  isRoutineEligibleForWake,
  MIN_EVERY_INTERVAL_MS,
  routinesEligibleForWake,
} from '../src/index.ts'
import {
  modelAssignmentsAreDistinct,
  normalizeAvatarMarker,
  normalizePersonaProfile,
} from '../src/validation.ts'
import { TeamRuntimeLifecycle } from '../src/lifecycle.ts'
import { teamProjectionDefinition } from '../src/projection.ts'
import type { TeamMemberSnapshot, TeamMessageSnapshot, TeamTaskSnapshot } from '../src/index.ts'
import { TestSessionQuery } from './test-session-query.ts'

const SIGNAL = new AbortController().signal
const roots: string[] = []

afterEach(() => {
  vi.useRealTimers()
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

/** Detached durable Team read through the same projection definition as the service. */
function durable(agent: Agent): {
  members: TeamMemberSnapshot[]
  sections: import('../src/index.ts').SidebarSectionSnapshot[]
  tasks: TeamTaskSnapshot[]
  pendingMessages: TeamMessageSnapshot[]
} {
  let projected = teamProjectionDefinition.init(agent.session.header)
  for (const event of agent.session.snapshotEvents()) projected = teamProjectionDefinition.apply(projected, event)
  if (projected.failure !== undefined) throw new Error(projected.failure)
  const state = projected
  return {
    members: state.members,
    sections: state.sections,
    tasks: state.tasks,
    pendingMessages: state.messages.filter(message => !state.delivered.includes(message.id)),
  }
}

/** Read one stored session's full event log through a short-lived read handle. */
async function storedEvents(ctx: Context, id: SessionId): Promise<readonly SessionEvent[]> {
  const handle = await ctx.sessionPersistence.open(id, 'read')
  try {
    return (await handle.read()).events
  } finally {
    await handle.close()
  }
}

async function setup(
  script: ConstructorParameters<typeof MockAdapter>[0],
  config: ConstructorParameters<typeof TeamService>[1] = {},
) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-'))
  roots.push(storageRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(TestSessionQuery)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(SubagentFork, { providerName: 'fork' })
  const teamFiber = await ctx.plugin(TeamService, config)
  const adapter = new MockAdapter(script)
  ctx.llm.registerAdapter(['mock'], adapter)
  const lead = await ctx.agentLoop.create(SessionId('lead'), { provider: 'mock', model: 'mock' })
  return { ctx, lead, adapter, storageRoot, teamFiber }
}

function content(text: string) {
  return [{ type: 'text' as const, text }]
}

interface TeamServiceInternals {
  readonly roster: {
    readonly inFlightCreations: Set<Promise<unknown>>
    checkpointInitialPrompt(childId: SessionId, messageId: string, signal: AbortSignal): Promise<void>
    reconcileProvisioning(root: Agent, signal: AbortSignal): Promise<void>
    liveChildrenByRoot(): Map<Agent, SessionId[]>
  }
  readonly mailbox: {
    tryDispatch(root: Agent, message: TeamMessageSnapshot, signal: AbortSignal): Promise<boolean>
    serializeDispatch(message: TeamMessageSnapshot, operation: () => Promise<boolean>): Promise<boolean>
    markDelivered(root: Agent, messageId: ReturnType<typeof TeamMessageId>, targetId: SessionId): Promise<void>
  }
  readonly journal: {
    state(root: Agent): unknown
  }
  disposeRuntime(): Promise<void>
  recoverFor(agent: Agent): Promise<void>
  scheduleRecovery(agent: Agent): void
}

/** White-box access follows the runtime owners so coverage does not widen the service API. */
function teamInternals(ctx: Context): TeamServiceInternals {
  return ctx.agentTeams as unknown as TeamServiceInternals
}

function spawn(
  ctx: Context,
  lead: Agent,
  name: string,
  options: {
    context?: 'fresh' | 'fork'
    provider?: string
    agentOptions?: { provider: string; model: string }
  } = {},
) {
  const context = options.context ?? 'fresh'
  return ctx.agentTeams.spawnTeammate(lead, {
    name,
    description: `${name} responsibility`,
    prompt: content(`${name} initial`),
    context,
    provider: options.provider ?? (context === 'fork' ? 'fork' : 'spawn'),
    ...options.agentOptions === undefined ? {} : { agentOptions: options.agentOptions },
    signal: SIGNAL,
  })
}

async function waitNoAgent(ctx: Context, id: SessionId): Promise<void> {
  await vi.waitFor(() => { expect(ctx.agents.get(id)).toBeUndefined() }, { timeout: 5_000 })
}

async function waitRunning(ctx: Context, id: SessionId): Promise<Agent> {
  return vi.waitFor(() => {
    const agent = ctx.agents.get(id)
    expect(agent?.status).toBe('running')
    return agent!
  }, { timeout: 5_000 })
}

describe('modelAssignmentsAreDistinct', () => {
  it('treats trimmed (provider, model) tuples as distinct and ignores reasoningEffort', () => {
    expect(modelAssignmentsAreDistinct(
      { provider: ' prov-a ', model: ' model-a ' },
      { provider: 'prov-a', model: 'model-a', reasoningEffort: ReasoningEffortId('high') },
    )).toBe(false)
    expect(modelAssignmentsAreDistinct(
      { provider: 'prov-a', model: 'model-a', reasoningEffort: ReasoningEffortId('low') },
      { provider: 'prov-a', model: 'model-b', reasoningEffort: ReasoningEffortId('high') },
    )).toBe(true)
    expect(modelAssignmentsAreDistinct(
      { provider: 'prov-a', model: 'shared-id' },
      { provider: 'prov-b', model: 'shared-id' },
    )).toBe(true)
  })

  it('rejects an empty provider or model through required text', () => {
    expect(() => modelAssignmentsAreDistinct(
      { provider: '  ', model: 'model-a' },
      { provider: 'prov-a', model: 'model-a' },
    )).toThrow(expect.objectContaining({ code: 'TEAM_INVALID_ARGUMENT' }))
    expect(() => modelAssignmentsAreDistinct(
      { provider: 'prov-a', model: 'model-a' },
      { provider: 'prov-a', model: '' },
    )).toThrow(expect.objectContaining({ code: 'TEAM_INVALID_ARGUMENT' }))
  })

  it('does not project the Lead pair as an inactive teammate modelSelection', async () => {
    const { ctx, lead } = await setup([textResponse('done')])
    const spawned = await spawn(ctx, lead, 'quiet-bot', {
      agentOptions: { provider: 'mock', model: 'quiet-model' },
    })
    await waitNoAgent(ctx, spawned.member.id)
    const row = ctx.agentTeams.listMembers(lead).find(member => member.name === 'quiet-bot')
    // Durable Host assignment (FR-002) survives unload; Lead pair stays on the Lead row only.
    expect(row).toMatchObject({
      provider: 'spawn',
      model: 'quiet-model',
      modelSelection: { provider: 'mock', model: 'quiet-model' },
    })
    expect(ctx.agentTeams.listMembers(lead)[0]).toMatchObject({
      role: 'lead',
      modelSelection: { provider: 'mock', model: 'mock' },
    })
  })
})

describe('normalizePersonaProfile', () => {
  it('trims fields, allows empty job/voice, and requires non-empty anti-job items', () => {
    expect(normalizePersonaProfile('  ship ', '  warm ', [' docs ', 'ops'])).toEqual({
      job: 'ship',
      voice: 'warm',
      antiJobs: ['docs', 'ops'],
    })
    expect(normalizePersonaProfile('', '', [])).toEqual({
      job: '',
      voice: '',
      antiJobs: [],
    })
    expect(() => normalizePersonaProfile('job', 'voice', ['  ']))
      .toThrow(/antiJobs\[0\] must be non-empty/)
    expect(() => normalizePersonaProfile('job', 'voice', { length: 0 } as unknown as string[]))
      .toThrow(/antiJobs must be an array/)
    expect(() => normalizePersonaProfile('job', 'voice', Array.from({ length: 65 }, () => 'x')))
      .toThrow(/antiJobs exceeds 64 items/)
    expect(() => normalizePersonaProfile('job', 'voice', [1 as unknown as string]))
      .toThrow(/antiJobs\[0\] must be a string/)
    expect(() => normalizePersonaProfile(1 as unknown as string, 'voice', []))
      .toThrow(/job must be a string/)
    expect(() => normalizePersonaProfile('j'.repeat(201), 'voice', []))
      .toThrow(/job exceeds 200 characters/)
  })
})

describe('normalizeAvatarMarker', () => {
  it('requires at least one preset shape or color and rejects unknown ids', () => {
    expect(normalizeAvatarMarker({ shape: ' circle ', color: ' blue ' })).toEqual({
      shape: 'circle',
      color: 'blue',
    })
    expect(normalizeAvatarMarker({ shape: 'square' })).toEqual({ shape: 'square' })
    expect(normalizeAvatarMarker({ color: 'green' })).toEqual({ color: 'green' })
    expect(() => normalizeAvatarMarker({})).toThrow(/at least one of shape or color/)
    expect(() => normalizeAvatarMarker({ shape: '  ' })).toThrow(/avatar\.shape must be non-empty/)
    expect(() => normalizeAvatarMarker({ shape: 'blob' })).toThrow(/avatar\.shape must be one of/)
    expect(() => normalizeAvatarMarker({ color: 'neon' })).toThrow(/avatar\.color must be one of/)
    expect(() => normalizeAvatarMarker(null as unknown as { shape?: string }))
      .toThrow(/avatar must be an object/)
  })
})

describe('Team identity and provisioning', () => {
  it('rejects missing and failed authoritative Team projections', async () => {
    const first = await setup([])
    const journal = teamInternals(first.ctx).journal
    const stateOf = first.ctx.sessionProjections.stateOf.bind(first.ctx.sessionProjections)
    const stateOfSpy = vi.spyOn(first.ctx.sessionProjections, 'stateOf').mockImplementation((session, key) => (
      key === 'agentTeam' ? undefined : stateOf(session, key)
    ))
    expect(() => journal.state(first.lead)).toThrow('Agent Teams projection is not registered')
    stateOfSpy.mockImplementation((session, key) => key === 'agentTeam'
      ? { ...teamProjectionDefinition.init(session.header), failure: 'failed Team projection' }
      : stateOf(session, key))
    expect(() => journal.state(first.lead)).toThrow('failed Team projection')
    stateOfSpy.mockRestore()
  })

  it('rejects deployment limits that are not positive safe integers', async () => {
    const fields = [
      'maxMembers',
      'maxTasks',
      'maxPendingMessagesPerMember',
      'maxMessageBytes',
      'disposalTimeoutMs',
    ] as const
    for (const field of fields) {
      for (const value of [0, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
        await expect(setup([], { [field]: value })).rejects.toThrow()
      }
    }
  })

  it('supports direct-constructor defaults and recovers roots that already exist', async () => {
    const ctx = new Context()
    await mountAgentLoopTestDependencies(ctx)
    const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-direct-'))
    roots.push(storageRoot)
    await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
    await ctx.plugin(AgentLoop, { agents: [] })
    await ctx.plugin(SubagentService)
    const lead = await ctx.agentLoop.create(SessionId('preexisting-lead'), {})
    const service = new TeamService(ctx)

    expect(service.listMembers(lead)).toEqual([expect.objectContaining({
      name: 'lead',
      status: 'idle',
      diagnostics: [],
    })])
    const provisioning = {
      id: SessionId('preexisting-child'),
      name: 'preexisting-worker',
      description: 'preexisting responsibility',
      provider: 'spawn',
      context: 'fresh' as const,
      phase: 'provisioning' as const,
    }
    lead.session.append('team/member', {
      version: 2,
      teamId: TeamId(lead.id),
      member: provisioning,
    })
    expect(service.listMembers(lead)[1]).toEqual(expect.objectContaining({
      name: 'preexisting-worker',
      status: 'provisioning',
      diagnostics: [],
    }))
    expect(service.listMembers(lead)[1]).not.toHaveProperty('model')
    await Promise.resolve()
  })

  it('creates fresh and fork teammates with immutable names and bounded roster size', async () => {
    const { ctx, lead } = await setup([
      textResponse('lead answer'),
      textResponse('fork answer'),
      textResponse('fresh answer'),
    ], { maxMembers: 2 })
    lead.followup(createUserMessage({ content: content('lead turn'), source: { kind: 'user' } }))
    await lead.whenIdle()

    const forked = await spawn(ctx, lead, 'fork-worker', { context: 'fork' })
    await waitNoAgent(ctx, forked.member.id)
    const fresh = await spawn(ctx, lead, 'fresh-worker')
    await waitNoAgent(ctx, fresh.member.id)

    expect((await ctx.sessionPersistence.stat(forked.member.id))?.header.isSeeded).toBe(true)
    expect((await ctx.sessionPersistence.stat(fresh.member.id))?.header.isSeeded).toBe(false)
    expect(ctx.agentTeams.listMembers(lead).map(row => [row.name, row.context, row.status])).toEqual([
      ['lead', undefined, 'idle'],
      ['fork-worker', 'fork', 'inactive'],
      ['fresh-worker', 'fresh', 'inactive'],
    ])
    await expect(spawn(ctx, lead, 'third-worker')).rejects.toMatchObject({ code: 'TEAM_MEMBER_LIMIT' })
    await expect(spawn(ctx, lead, 'fresh-worker')).rejects.toMatchObject({ code: 'TEAM_MEMBER_NAME_TAKEN' })
  })

  it('applies per-teammate LLM agentOptions at create without sharing the Lead route', async () => {
    const { ctx, lead } = await setup(['hang', 'hang'])
    expect(lead.options).toMatchObject({ provider: 'mock', model: 'mock' })

    const alpha = await spawn(ctx, lead, 'alpha-bot', {
      agentOptions: { provider: 'mock', model: 'alpha-model' },
    })
    const alphaLive = await waitRunning(ctx, alpha.member.id)
    expect(alphaLive.options).toMatchObject({ provider: 'mock', model: 'alpha-model' })
    expect(alpha.member).toMatchObject({
      name: 'alpha-bot',
      model: 'alpha-model',
      modelSelection: { provider: 'mock', model: 'alpha-model' },
    })
    expect(lead.options.model).toBe('mock')

    const beta = await spawn(ctx, lead, 'beta-bot', {
      agentOptions: { provider: 'mock', model: 'beta-model' },
    })
    const betaLive = await waitRunning(ctx, beta.member.id)
    expect(betaLive.options).toMatchObject({ provider: 'mock', model: 'beta-model' })
    expect(beta.member).toMatchObject({
      name: 'beta-bot',
      model: 'beta-model',
      modelSelection: { provider: 'mock', model: 'beta-model' },
    })
    expect(alphaLive.options.model).toBe('alpha-model')

    const alphaDescriptor = (await storedEvents(ctx, alpha.member.id))
      .find(event => event.type === 'subagent/descriptor')
    expect(alphaDescriptor?.data).toMatchObject({
      agentProvider: 'mock',
      agentModel: 'alpha-model',
    })
  })

  it('creates a Host-owned bot from displayName plus required model assignment', async () => {
    const { ctx, lead } = await setup(['hang', 'hang'])

    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Research Bot',
      modelSelection: { provider: 'mock', model: 'research-model' },
      signal: SIGNAL,
    })
    expect(created).toMatchObject({
      displayName: 'Research Bot',
      name: 'research-bot',
      modelSelection: { provider: 'mock', model: 'research-model' },
      member: {
        name: 'research-bot',
        displayName: 'Research Bot',
        model: 'research-model',
        modelSelection: { provider: 'mock', model: 'research-model' },
        role: 'teammate',
      },
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.modelSelection).toEqual({
      provider: 'mock',
      model: 'research-model',
    })
    const live = await waitRunning(ctx, created.id)
    expect(live.options).toMatchObject({ provider: 'mock', model: 'research-model' })
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)).toMatchObject({
      displayName: 'Research Bot',
      model: 'research-model',
      modelSelection: { provider: 'mock', model: 'research-model' },
    })

    const second = await ctx.agentTeams.createBot(lead, {
      displayName: 'Coding Bot',
      modelSelection: { provider: 'mock', model: 'coding-model' },
      signal: SIGNAL,
    })
    expect(second.modelSelection.model).toBe('coding-model')
    expect(second.name).toBe('coding-bot')
  })

  it('rejects Host bot create without displayName or model assignment', async () => {
    const { ctx, lead } = await setup([])
    await expect(ctx.agentTeams.createBot(lead, {
      displayName: '   ',
      modelSelection: { provider: 'mock', model: 'mock' },
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT', message: expect.stringContaining('displayName') })
    await expect(ctx.agentTeams.createBot(lead, {
      displayName: 'Valid Bot',
      modelSelection: { provider: '', model: 'mock' },
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT', message: expect.stringContaining('modelSelection.provider') })
    await expect(ctx.agentTeams.createBot(lead, {
      displayName: 'Valid Bot',
      modelSelection: { provider: 'mock', model: '  ' },
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT', message: expect.stringContaining('modelSelection.model') })
    await expect(ctx.agentTeams.createBot(lead, {
      displayName: '!!!',
      modelSelection: { provider: 'mock', model: 'mock' },
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_MEMBER_NAME' })
  })

  it('rejects non-Lead Host bot create and surfaces Remote createBot rejections', async () => {
    const { ctx, lead } = await setup(['hang'])
    const teammate = await spawn(ctx, lead, 'helper', {
      agentOptions: { provider: 'mock', model: 'mock' },
    })
    const child = await waitRunning(ctx, teammate.member.id)
    await expect(ctx.agentTeams.createBot(child, {
      displayName: 'Peer Bot',
      modelSelection: { provider: 'mock', model: 'mock' },
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_LEAD_REQUIRED' })

    const remote = await ctx.agentTeams.remoteCreateBot(lead, {
      displayName: ' ',
      modelSelection: { provider: 'mock', model: 'mock' },
    }, SIGNAL)
    expect(remote).toEqual({
      ok: false,
      error: { code: 'team-rejected', message: 'displayName must be non-empty' },
    })
    const accepted = await ctx.agentTeams.remoteCreateBot(lead, {
      displayName: 'Remote Bot',
      modelSelection: { provider: 'mock', model: 'remote-model' },
    }, SIGNAL)
    expect(accepted).toMatchObject({
      ok: true,
      value: {
        displayName: 'Remote Bot',
        name: 'remote-bot',
        modelSelection: { provider: 'mock', model: 'remote-model' },
      },
    })
  })

  it('persists createSection / assignSection / unassign and projects Unassigned without a catalog row', async () => {
    const { ctx, lead } = await setup([
      textResponse('section bot a'),
      textResponse('section bot b'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Section Alpha',
      modelSelection: { provider: 'mock', model: 'sec-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)
    const beta = await ctx.agentTeams.createBot(lead, {
      displayName: 'Section Beta',
      modelSelection: { provider: 'mock', model: 'sec-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, beta.id)

    await expect(ctx.agentTeams.createSection(lead, {
      name: '   ',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })

    const created = await ctx.agentTeams.createSection(lead, {
      name: ' Reviews ',
      signal: SIGNAL,
    })
    expect(created).toMatchObject({
      name: 'Reviews',
      section: { name: 'Reviews', botIds: [] },
    })
    expect(durable(lead).sections).toEqual([{ id: created.id, name: 'Reviews' }])
    // Clarify lock 4: no Unassigned catalog row.
    expect(durable(lead).sections.some(row => /unassigned/i.test(row.name))).toBe(false)

    const assigned = await ctx.agentTeams.assignSection(lead, {
      botId: alpha.id,
      sectionId: created.id,
      signal: SIGNAL,
    })
    expect(assigned).toMatchObject({
      id: alpha.id,
      sectionId: created.id,
      member: { id: alpha.id, sectionId: created.id },
    })
    expect(durable(lead).members.find(row => row.id === alpha.id)?.sectionId).toBe(created.id)

    const renamed = await ctx.agentTeams.renameSection(lead, {
      sectionId: created.id,
      name: 'Code Reviews',
      signal: SIGNAL,
    })
    expect(renamed).toMatchObject({
      id: created.id,
      name: 'Code Reviews',
      section: { id: created.id, name: 'Code Reviews', botIds: [alpha.id] },
    })

    await expect(ctx.agentTeams.renameSection(lead, {
      sectionId: created.id,
      name: '',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    expect(durable(lead).sections.find(row => row.id === created.id)?.name).toBe('Code Reviews')

    await expect(ctx.agentTeams.assignSection(lead, {
      botId: alpha.id,
      sectionId: SidebarSectionId('missing-section'),
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_SECTION_NOT_FOUND' })

    const moved = await ctx.agentTeams.remoteAssignSection(lead, {
      botId: alpha.id,
      sectionId: null,
    }, SIGNAL)
    expect(moved).toMatchObject({
      ok: true,
      value: { id: alpha.id, sectionId: null },
    })
    expect(durable(lead).members.find(row => row.id === alpha.id)?.sectionId).toBeNull()
    // Empty named section may remain after last-bot remove.
    expect(durable(lead).sections).toEqual([{ id: created.id, name: 'Code Reviews' }])

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.sections).toEqual([{
      id: created.id,
      name: 'Code Reviews',
      botIds: [],
    }])
    expect(view.unassignedBotIds).toEqual(expect.arrayContaining([alpha.id, beta.id]))
    expect(view.members.find(row => row.id === alpha.id)?.sectionId).toBeNull()
    expect(view.members.find(row => row.id === beta.id)?.sectionId).toBeUndefined()

    const reassigned = await ctx.agentTeams.assignSection(lead, {
      botId: beta.id,
      sectionId: created.id,
      signal: SIGNAL,
    })
    expect(reassigned.sectionId).toBe(created.id)
    expect(ctx.agentTeams.listSections(lead)).toEqual({
      sections: [{ id: created.id, name: 'Code Reviews', botIds: [beta.id] }],
      unassignedBotIds: [alpha.id],
    })

    const remoteCreate = await ctx.agentTeams.remoteCreateSection(lead, {
      name: 'Ops',
    }, SIGNAL)
    expect(remoteCreate).toMatchObject({ ok: true, value: { name: 'Ops' } })
    expect(await ctx.agentTeams.remoteRenameSection(lead, {
      sectionId: created.id,
      name: '',
    }, SIGNAL)).toMatchObject({ ok: false, error: { code: 'team-rejected' } })
  })

  it('persists deleteBot tombstone, omits identity from view, and rejects without removing prior', async () => {
    const { ctx, lead } = await setup([
      textResponse('delete create'),
      textResponse('delete peer'),
    ])
    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Delete Bot',
      modelSelection: { provider: 'mock', model: 'delete-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, created.id)
    const priorName = created.name

    const peer = await ctx.agentTeams.createBot(lead, {
      displayName: 'Peer Survives',
      modelSelection: { provider: 'mock', model: 'peer-delete' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, peer.id)

    // Leave a mailbox row targeting the bot — Pass must not require wiping it (clarify lock 5).
    await ctx.agentTeams.sendMessage(lead, {
      target: priorName,
      content: [{ type: 'text', text: 'still queued after identity delete' }],
      signal: SIGNAL,
    })
    const mailboxBefore = durable(lead).pendingMessages.length
    expect(mailboxBefore).toBeGreaterThan(0)

    const deleted = await ctx.agentTeams.deleteBot(lead, {
      botId: created.id,
      signal: SIGNAL,
    })
    expect(deleted).toEqual({ id: created.id })

    expect(durable(lead).members.find(row => row.id === created.id)).toMatchObject({
      name: priorName,
      phase: 'deleted',
      sectionId: null,
      displayName: 'Delete Bot',
    })
    // Client-visible roster / overview omit the tombstone (FR-008).
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)).toBeUndefined()
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === peer.id)?.displayName)
      .toBe('Peer Survives')

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.members.find(row => row.id === created.id)).toBeUndefined()
    expect(view.members.find(row => row.id === peer.id)?.displayName).toBe('Peer Survives')

    // Mailbox history is not wiped by identity delete (clarify lock 5).
    expect(durable(lead).pendingMessages.length).toBe(mailboxBefore)

    // Kebab name stays reserved after delete.
    await expect(ctx.agentTeams.createBot(lead, {
      displayName: 'Delete Bot',
      modelSelection: { provider: 'mock', model: 'reuse-blocked' },
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_MEMBER_NAME_TAKEN' })

    const remoteOk = await ctx.agentTeams.remoteDeleteBot(lead, {
      botId: peer.id,
    }, SIGNAL)
    expect(remoteOk).toMatchObject({ ok: true, value: { id: peer.id } })
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === peer.id)).toBeUndefined()
    expect(durable(lead).members.find(row => row.id === peer.id)?.phase).toBe('deleted')

    // Already-deleted / missing / non-Lead / abort leave remaining identity intact.
    expect(await ctx.agentTeams.remoteDeleteBot(lead, {
      botId: created.id,
    }, SIGNAL)).toMatchObject({
      ok: false,
      error: { code: 'team-rejected' },
    })
    expect(await ctx.agentTeams.remoteDeleteBot(lead, {
      botId: SessionId('missing-bot'),
    }, SIGNAL)).toMatchObject({
      ok: false,
      error: { code: 'team-rejected' },
    })

    const hang = await setup(['hang'])
    const hungChild = (await spawn(hang.ctx, hang.lead, 'peer-writer', {
      agentOptions: { provider: 'mock', model: 'peer' },
    })).member
    const liveChild = await waitRunning(hang.ctx, hungChild.id)
    await expect(hang.ctx.agentTeams.deleteBot(liveChild, {
      botId: hungChild.id,
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_LEAD_REQUIRED' })
    expect(durable(hang.lead).members.find(row => row.id === hungChild.id)?.phase).toBe('active')
    expect(hang.ctx.agentTeams.listMembers(hang.lead).find(row => row.id === hungChild.id))
      .toBeDefined()

    const aborted = new AbortController()
    aborted.abort()
    await expect(hang.ctx.agentTeams.deleteBot(hang.lead, {
      botId: hungChild.id,
      signal: aborted.signal,
    })).rejects.toBeTruthy()
    expect(durable(hang.lead).members.find(row => row.id === hungChild.id)?.phase).toBe('active')
    expect(hang.ctx.agentTeams.listMembers(hang.lead).find(row => row.id === hungChild.id))
      .toBeDefined()
  })

  it('persists renameBot, projects displayName on view, and rejects empty rename without changing prior', async () => {
    const { ctx, lead } = await setup([
      textResponse('rename create'),
      textResponse('rename peer'),
    ])
    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Rename Bot',
      modelSelection: { provider: 'mock', model: 'rename-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, created.id)
    const priorName = created.name

    const saved = await ctx.agentTeams.renameBot(lead, {
      botId: created.id,
      displayName: '  Renamed Label ',
      signal: SIGNAL,
    })
    expect(saved.displayName).toBe('Renamed Label')
    expect(saved.member).toMatchObject({
      id: created.id,
      name: priorName,
      displayName: 'Renamed Label',
    })
    expect(durable(lead).members.find(row => row.id === created.id)).toMatchObject({
      name: priorName,
      displayName: 'Renamed Label',
      description: 'Renamed Label',
    })
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)?.displayName)
      .toBe('Renamed Label')

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.members.find(row => row.id === created.id)?.displayName).toBe('Renamed Label')

    const remoteOk = await ctx.agentTeams.remoteRenameBot(lead, {
      botId: created.id,
      displayName: 'Remote Renamed',
    }, SIGNAL)
    expect(remoteOk).toMatchObject({
      ok: true,
      value: { displayName: 'Remote Renamed' },
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.displayName)
      .toBe('Remote Renamed')
    // Kebab roster name stays immutable across renames (FR-004).
    expect(durable(lead).members.find(row => row.id === created.id)?.name).toBe(priorName)

    // Duplicate display names are allowed.
    const peer = await ctx.agentTeams.createBot(lead, {
      displayName: 'Peer Distinct',
      modelSelection: { provider: 'mock', model: 'peer-rename' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, peer.id)
    await expect(ctx.agentTeams.renameBot(lead, {
      botId: peer.id,
      displayName: 'Remote Renamed',
      signal: SIGNAL,
    })).resolves.toMatchObject({ displayName: 'Remote Renamed' })

    await expect(ctx.agentTeams.renameBot(lead, {
      botId: created.id,
      displayName: '   ',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT', message: expect.stringContaining('displayName') })
    expect(durable(lead).members.find(row => row.id === created.id)?.displayName)
      .toBe('Remote Renamed')

    expect(await ctx.agentTeams.remoteRenameBot(lead, {
      botId: created.id,
      displayName: '',
    }, SIGNAL)).toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringContaining('displayName') },
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.displayName)
      .toBe('Remote Renamed')

    const aborted = new AbortController()
    aborted.abort()
    await expect(ctx.agentTeams.renameBot(lead, {
      botId: created.id,
      displayName: 'Should Not Persist',
      signal: aborted.signal,
    })).rejects.toBeTruthy()
    expect(durable(lead).members.find(row => row.id === created.id)?.displayName)
      .toBe('Remote Renamed')

    expect(await ctx.agentTeams.remoteRenameBot(lead, {
      botId: SessionId('missing-bot'),
      displayName: 'Ghost',
    }, SIGNAL)).toMatchObject({
      ok: false,
      error: { code: 'team-rejected' },
    })

    const hang = await setup(['hang'])
    const hungChild = (await spawn(hang.ctx, hang.lead, 'peer-writer', {
      agentOptions: { provider: 'mock', model: 'peer' },
    })).member
    const liveChild = await waitRunning(hang.ctx, hungChild.id)
    await expect(hang.ctx.agentTeams.renameBot(liveChild, {
      botId: hungChild.id,
      displayName: 'Hijack',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_LEAD_REQUIRED' })
  })

  it('persists setAvatar, projects preset marker on view, and rejects empty/unknown markers', async () => {
    const { ctx, lead } = await setup([textResponse('avatar create')])
    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Avatar Bot',
      modelSelection: { provider: 'mock', model: 'avatar-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, created.id)

    const saved = await ctx.agentTeams.setAvatar(lead, {
      botId: created.id,
      avatar: { shape: 'circle', color: 'blue' },
      signal: SIGNAL,
    })
    expect(saved.avatar).toEqual({ shape: 'circle', color: 'blue' })
    expect(durable(lead).members.find(row => row.id === created.id)?.avatar).toEqual(saved.avatar)
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)?.avatar)
      .toEqual(saved.avatar)

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.members.find(row => row.id === created.id)?.avatar).toEqual(saved.avatar)

    // Shape-only and color-only markers are valid Pass paths (clarify lock 3).
    const shapeOnly = await ctx.agentTeams.remoteSetAvatar(lead, {
      botId: created.id,
      avatar: { shape: 'square' },
    }, SIGNAL)
    expect(shapeOnly).toMatchObject({
      ok: true,
      value: { avatar: { shape: 'square' } },
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.avatar)
      .toEqual({ shape: 'square' })

    const colorOnly = await ctx.agentTeams.setAvatar(lead, {
      botId: created.id,
      avatar: { color: 'orange' },
      signal: SIGNAL,
    })
    expect(colorOnly.avatar).toEqual({ color: 'orange' })
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)?.avatar)
      .toEqual({ color: 'orange' })

    await expect(ctx.agentTeams.setAvatar(lead, {
      botId: created.id,
      avatar: {},
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    expect(durable(lead).members.find(row => row.id === created.id)?.avatar)
      .toEqual({ color: 'orange' })

    expect(await ctx.agentTeams.remoteSetAvatar(lead, {
      botId: created.id,
      avatar: { shape: 'blob' as 'circle' },
    }, SIGNAL)).toMatchObject({
      ok: false,
      error: { code: 'team-rejected' },
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.avatar)
      .toEqual({ color: 'orange' })

    const aborted = new AbortController()
    aborted.abort()
    await expect(ctx.agentTeams.setAvatar(lead, {
      botId: created.id,
      avatar: { shape: 'hexagon', color: 'red' },
      signal: aborted.signal,
    })).rejects.toBeTruthy()
    expect(durable(lead).members.find(row => row.id === created.id)?.avatar)
      .toEqual({ color: 'orange' })

    expect(await ctx.agentTeams.remoteSetAvatar(lead, {
      botId: SessionId('missing-bot'),
      avatar: { shape: 'circle' },
    }, SIGNAL)).toMatchObject({
      ok: false,
      error: { code: 'team-rejected' },
    })

    const hang = await setup(['hang'])
    const hungChild = (await spawn(hang.ctx, hang.lead, 'peer-writer', {
      agentOptions: { provider: 'mock', model: 'peer' },
    })).member
    const liveChild = await waitRunning(hang.ctx, hungChild.id)
    await expect(hang.ctx.agentTeams.setAvatar(liveChild, {
      botId: hungChild.id,
      avatar: { shape: 'triangle' },
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_LEAD_REQUIRED' })
    expect(durable(hang.lead).members.find(row => row.id === hungChild.id)?.avatar).toBeUndefined()
  })

  it('persists updatePersona, projects persona on view, and rejects without changing prior values', async () => {
    const { ctx, lead } = await setup([
      textResponse('persona create'),
      textResponse('persona follow-up'),
    ])
    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Persona Bot',
      modelSelection: { provider: 'mock', model: 'persona-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, created.id)

    const saved = await ctx.agentTeams.updatePersona(lead, {
      botId: created.id,
      job: ' review PRs ',
      voice: ' terse ',
      antiJobs: [' merge ', 'docs'],
      signal: SIGNAL,
    })
    expect(saved.persona).toEqual({
      job: 'review PRs',
      voice: 'terse',
      antiJobs: ['merge', 'docs'],
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.persona).toEqual(saved.persona)
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)?.persona)
      .toEqual(saved.persona)

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.members.find(row => row.id === created.id)?.persona).toEqual(saved.persona)

    const remoteOk = await ctx.agentTeams.remoteUpdatePersona(lead, {
      botId: created.id,
      job: 'ship',
      voice: '',
      antiJobs: ['ops'],
    }, SIGNAL)
    expect(remoteOk).toMatchObject({
      ok: true,
      value: { persona: { job: 'ship', voice: '', antiJobs: ['ops'] } },
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.persona).toEqual({
      job: 'ship',
      voice: '',
      antiJobs: ['ops'],
    })

    const aborted = new AbortController()
    aborted.abort()
    await expect(ctx.agentTeams.updatePersona(lead, {
      botId: created.id,
      job: 'should-not-persist',
      voice: 'nope',
      antiJobs: ['x'],
      signal: aborted.signal,
    })).rejects.toBeTruthy()
    expect(durable(lead).members.find(row => row.id === created.id)?.persona).toEqual({
      job: 'ship',
      voice: '',
      antiJobs: ['ops'],
    })

    expect(await ctx.agentTeams.remoteUpdatePersona(lead, {
      botId: SessionId('missing-bot'),
      job: 'ghost',
      voice: '',
      antiJobs: [],
    }, SIGNAL)).toMatchObject({
      ok: false,
      error: { code: 'team-rejected' },
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.persona).toEqual({
      job: 'ship',
      voice: '',
      antiJobs: ['ops'],
    })

    const hang = await setup(['hang'])
    const hungChild = (await spawn(hang.ctx, hang.lead, 'peer-writer', {
      agentOptions: { provider: 'mock', model: 'peer' },
    })).member
    const liveChild = await waitRunning(hang.ctx, hungChild.id)
    await expect(hang.ctx.agentTeams.updatePersona(liveChild, {
      botId: hungChild.id,
      job: 'hijack',
      voice: '',
      antiJobs: [],
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_LEAD_REQUIRED' })
    expect(durable(hang.lead).members.find(row => row.id === hungChild.id)?.persona).toBeUndefined()
  })

  it('binds saved persona fields into Bot instruction assembly on subsequent turns', async () => {
    const { ctx, lead } = await setup([
      textResponse('bound persona first'),
      textResponse('bound persona second'),
      textResponse('bound persona live update'),
    ])
    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Bound Persona',
      modelSelection: { provider: 'mock', model: 'bound-persona' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, created.id)

    await ctx.agentTeams.updatePersona(lead, {
      botId: created.id,
      job: 'code review',
      voice: 'direct',
      antiJobs: ['merge without tests'],
      signal: SIGNAL,
    })

    const followUp = await ctx.agentTeams.sendMessage(lead, {
      target: created.name,
      content: content('second turn with persona bind'),
      signal: SIGNAL,
    })
    expect(followUp.status).toBe('accepted')
    const live = await waitRunning(ctx, created.id)
    const prompt = renderPrompt(await ctx.systemPrompt.assemble(assembleContextFor(live)))
    expect(prompt).toContain('code review')
    expect(prompt).toContain('direct')
    expect(prompt).toContain('merge without tests')
    expect(prompt).not.toContain('Job: \n')

    // Live Host save refreshes the mutable bind without requiring cold resume.
    await ctx.agentTeams.updatePersona(lead, {
      botId: created.id,
      job: 'ship features',
      voice: '',
      antiJobs: [],
      signal: SIGNAL,
    })
    const livePrompt = renderPrompt(await ctx.systemPrompt.assemble(assembleContextFor(live)))
    expect(livePrompt).toContain('ship features')
    expect(livePrompt).not.toContain('code review')
    await waitNoAgent(ctx, created.id)
  })

  it('binds Bot ModelSelection via installModelSelection for subsequent chats only', async () => {
    const { ctx, lead } = await setup([
      textResponse('bound first turn'),
      textResponse('bound follow-up turn'),
      textResponse('peer first turn'),
    ])

    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Bound Bot',
      modelSelection: { provider: 'mock', model: 'bound-model' },
      signal: SIGNAL,
    })
    expect(durable(lead).members.find(row => row.id === created.id)?.modelSelection).toEqual({
      provider: 'mock',
      model: 'bound-model',
    })
    expect(created.member.model).toBe('bound-model')
    await waitNoAgent(ctx, created.id)

    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)).toMatchObject({
      model: 'bound-model',
      status: 'inactive',
    })
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)?.model)
      .not.toBe(lead.options.model)

    const followUp = await ctx.agentTeams.sendMessage(lead, {
      target: created.name,
      content: content('second chat for the same bot'),
      signal: SIGNAL,
    })
    expect(followUp.status).toBe('accepted')
    await waitNoAgent(ctx, created.id)
    await vi.waitFor(() => { expect(durable(lead).pendingMessages).toEqual([]) })

    const headers = (await storedEvents(ctx, created.id))
      .filter(event => event.type === 'request/header')
    expect(headers.length).toBeGreaterThanOrEqual(2)
    expect(headers.map(event => event.type === 'request/header'
      ? event.data.header.config
      : undefined)).toEqual(expect.arrayContaining([
      expect.objectContaining({ provider: 'mock', model: 'bound-model' }),
    ]))
    for (const event of headers) {
      expect(event.type === 'request/header' && event.data.header.config).toMatchObject({
        provider: 'mock',
        model: 'bound-model',
      })
    }
    expect(lead.options.model).toBe('mock')

    const peer = await ctx.agentTeams.createBot(lead, {
      displayName: 'Peer Bot',
      modelSelection: { provider: 'mock', model: 'peer-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, peer.id)
    const peerHeaders = (await storedEvents(ctx, peer.id))
      .filter(event => event.type === 'request/header')
    expect(peerHeaders.length).toBeGreaterThanOrEqual(1)
    for (const event of peerHeaders) {
      expect(event.type === 'request/header' && event.data.header.config).toMatchObject({
        provider: 'mock',
        model: 'peer-model',
      })
    }
    const boundHeaders = (await storedEvents(ctx, created.id))
      .filter(event => event.type === 'request/header')
    for (const event of boundHeaders) {
      expect(event.type === 'request/header' && event.data.header.config.model).toBe('bound-model')
    }
  })

  it('flushes the accepted child prompt before committing the active roster edge', async () => {
    const { ctx, lead } = await setup([textResponse('checkpointed child answer')])
    const flush = ctx.sessions.flush.bind(ctx.sessions)
    const order: string[] = []
    vi.spyOn(ctx.sessions, 'flush').mockImplementation(async (session) => {
      if (session.id === lead.id && durable(lead).members[0]?.phase === 'active') {
        order.push('lead-active')
      } else if (session.id !== lead.id) {
        order.push('child')
      }
      return flush(session)
    })

    const started = await spawn(ctx, lead, 'checkpoint-worker')
    expect(order.indexOf('child')).toBeGreaterThanOrEqual(0)
    expect(order.indexOf('child')).toBeLessThan(order.indexOf('lead-active'))
    await waitNoAgent(ctx, started.member.id)
  })

  it('checkpoints live and detached inbox receipts and aborts an unresolved checkpoint', async () => {
    const { ctx, lead } = await setup([])
    const internal = teamInternals(ctx).roster
    let liveSession: Session | undefined
    const liveFiber = await ctx.plugin(Object.assign(function checkpointFixture(childCtx: Context) {
      liveSession = childCtx.sessions.create(SessionId('checkpoint-child'))
    }, { inject: ['sessions'] }))
    if (liveSession === undefined) throw new Error('checkpoint fixture did not create its Session')
    const initial = createUserMessage({ content: content('checkpoint me'), source: { kind: 'user' } })
    const checkpoint = internal.checkpointInitialPrompt(liveSession.id, initial.id, SIGNAL)
    await Promise.resolve()
    lead.inject(createUserMessage({ content: content('unrelated progress'), source: { kind: 'user' } }))
    const unrelatedFiber = await ctx.plugin(Object.assign(function unrelatedCheckpointFixture(childCtx: Context) {
      childCtx.sessions.create(SessionId('unrelated-checkpoint-child'))
    }, { inject: ['sessions'] }))
    await unrelatedFiber.dispose()
    liveSession.append('agent/inbox/spliced', {
      target: 'next-turn', start: 0, inserted: [initial],
    })
    await checkpoint
    // Live sessions persist only through an attached agent-loop writer; this
    // bare fixture session seeds its durable log directly for the cold reread.
    const persisted = await ctx.sessionPersistence.create(liveSession.header)
    await persisted.append(liveSession.snapshotEvents())
    await persisted.close()
    await liveFiber.dispose()

    await expect(internal.checkpointInitialPrompt(liveSession.id, initial.id, SIGNAL)).resolves.toBeUndefined()
    const missing = createUserMessage({ content: content('missing'), source: { kind: 'user' } })
    await expect(internal.checkpointInitialPrompt(liveSession.id, missing.id, SIGNAL))
      .rejects.toMatchObject({ code: 'TEAM_PROVISIONING_CONFLICT' })

    let disposedSession: Session | undefined
    const disposedFiber = await ctx.plugin(Object.assign(function disposedCheckpointFixture(childCtx: Context) {
      disposedSession = childCtx.sessions.create(SessionId('disposed-checkpoint-child'))
    }, { inject: ['sessions'] }))
    if (disposedSession === undefined) throw new Error('disposed checkpoint fixture did not create its Session')
    const disposed = internal.checkpointInitialPrompt(disposedSession.id, missing.id, SIGNAL)
    const disposedResult = expect(disposed).rejects.toThrow('not found')
    await Promise.resolve()
    await disposedFiber.dispose()
    await disposedResult

    let abortedSession: Session | undefined
    const abortedFiber = await ctx.plugin(Object.assign(function abortedCheckpointFixture(childCtx: Context) {
      abortedSession = childCtx.sessions.create(SessionId('aborted-checkpoint-child'))
    }, { inject: ['sessions'] }))
    if (abortedSession === undefined) throw new Error('aborted checkpoint fixture did not create its Session')
    const controller = new AbortController()
    const aborted = internal.checkpointInitialPrompt(abortedSession.id, missing.id, controller.signal)
    await Promise.resolve()
    controller.abort({ kind: 'test' })
    await expect(aborted).rejects.toMatchObject({ code: 'TEAM_DISPOSED' })

    const errorController = new AbortController()
    const errorAborted = internal.checkpointInitialPrompt(abortedSession.id, missing.id, errorController.signal)
    const errorResult = expect(errorAborted).rejects.toThrow('checkpoint stopped')
    await Promise.resolve()
    errorController.abort(new Error('checkpoint stopped'))
    await errorResult
    await abortedFiber.dispose()
  })

  it('drains an accepted child when its initial durability checkpoint fails', async () => {
    const { ctx, lead } = await setup(['hang'])
    vi.spyOn(teamInternals(ctx).roster, 'checkpointInitialPrompt')
      .mockRejectedValueOnce(new Error('checkpoint failed'))

    await expect(spawn(ctx, lead, 'checkpoint-failure')).rejects.toThrow('checkpoint failed')
    const member = durable(lead).members[0]
    expect(member).toMatchObject({ phase: 'failed', error: 'checkpoint failed' })
    if (member !== undefined) await waitNoAgent(ctx, member.id)
  })

  it('records failed provisioning durably, reserves its name, and counts it against the limit', async () => {
    const { ctx, lead } = await setup([], { maxMembers: 1 })
    await expect(spawn(ctx, lead, 'failed-worker', { provider: 'missing' })).rejects.toThrow()

    expect(ctx.agentTeams.listMembers(lead)[1]).toMatchObject({
      name: 'failed-worker',
      status: 'failed',
      provider: 'missing',
    })
    await expect(spawn(ctx, lead, 'failed-worker')).rejects.toMatchObject({ code: 'TEAM_MEMBER_NAME_TAKEN' })
    await expect(spawn(ctx, lead, 'other-worker')).rejects.toMatchObject({ code: 'TEAM_MEMBER_LIMIT' })
  })

  it('records non-Error provider failures and contains a reversed provisioning settlement race', async () => {
    const first = await setup([])
    vi.spyOn(first.ctx.subagents, 'startContinuable').mockRejectedValueOnce('string provider failure')
    await expect(spawn(first.ctx, first.lead, 'string-failure')).rejects.toBe('string provider failure')
    expect(first.ctx.agentTeams.listMembers(first.lead)[1]).toMatchObject({
      status: 'failed',
      diagnostics: ['string provider failure'],
    })
    await expect(first.ctx.agentTeams.sendMessage(first.lead, {
      target: 'string-failure', content: content('cannot deliver'), signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_MEMBER_NOT_FOUND' })

    const second = await setup([])
    vi.spyOn(second.ctx.subagents, 'startContinuable').mockImplementationOnce(async () => {
      const provisioning = durable(second.lead).members[0]
      if (provisioning === undefined) throw new Error('missing provisioning edge')
      second.lead.session.append('team/member', {
        version: 2,
        teamId: TeamId(second.lead.id),
        member: { ...provisioning, phase: 'active' },
      })
      await second.ctx.sessions.flush(second.lead.session)
      throw new Error('creator failed after recovery settled active')
    })
    await expect(spawn(second.ctx, second.lead, 'reverse-race')).rejects.toBeInstanceOf(AggregateError)
    expect(durable(second.lead).members[0]?.phase).toBe('active')
  })

  it('cleans up a child when recovery settles its provisioning record first', async () => {
    const { ctx, lead } = await setup(['hang'])
    const start = ctx.subagents.startContinuable.bind(ctx.subagents)
    const entered = Promise.withResolvers<undefined>()
    const release = Promise.withResolvers<undefined>()
    let childId: SessionId | undefined
    vi.spyOn(ctx.subagents, 'startContinuable').mockImplementation(async (spec) => {
      childId = spec.childId
      entered.resolve(undefined)
      await release.promise
      return start(spec)
    })

    const spawning = spawn(ctx, lead, 'racing-worker')
    const rejected = expect(spawning).rejects.toMatchObject({ code: 'TEAM_PROVISIONING_CONFLICT' })
    await entered.promise
    await teamInternals(ctx).roster.reconcileProvisioning(lead, SIGNAL)
    expect(durable(lead).members[0]?.phase).toBe('failed')

    release.resolve(undefined)
    await rejected
    if (childId === undefined) throw new Error('reserved child id was not observed')
    await waitNoAgent(ctx, childId)
  })

  it('handles a continuation that settles before the active roster view or conflict cleanup lookup', async () => {
    const first = await setup([])
    vi.spyOn(teamInternals(first.ctx).roster, 'checkpointInitialPrompt').mockResolvedValueOnce()
    vi.spyOn(first.ctx.subagents, 'startContinuable').mockImplementationOnce(async spec => ({
      childId: spec.childId!,
      messageId: createUserMessage({ content: content('accepted'), source: { kind: 'user' } }).id,
    }))
    const inactive = await spawn(first.ctx, first.lead, 'instant-worker')
    expect(inactive.member).toMatchObject({ status: 'inactive', diagnostics: [] })
    expect(inactive.member).not.toHaveProperty('model')

    const second = await setup([])
    vi.spyOn(teamInternals(second.ctx).roster, 'checkpointInitialPrompt').mockResolvedValueOnce()
    const entered = Promise.withResolvers<undefined>()
    const release = Promise.withResolvers<undefined>()
    vi.spyOn(second.ctx.subagents, 'startContinuable').mockImplementationOnce(async (spec) => {
      entered.resolve(undefined)
      await release.promise
      return {
        childId: spec.childId!,
        messageId: createUserMessage({ content: content('accepted'), source: { kind: 'user' } }).id,
      }
    })
    const spawning = spawn(second.ctx, second.lead, 'instant-conflict')
    const rejected = expect(spawning).rejects.toMatchObject({ code: 'TEAM_PROVISIONING_CONFLICT' })
    await entered.promise
    await teamInternals(second.ctx).roster.reconcileProvisioning(second.lead, SIGNAL)
    release.resolve(undefined)
    await rejected
  })

  it('validates names and permits only the Lead to create or interrupt teammates', async () => {
    const { ctx, lead } = await setup(['hang'])
    for (const name of ['Lead', 'lead', '-bad', 'bad-', 'bad_name', 'x'.repeat(65)]) {
      await expect(spawn(ctx, lead, name)).rejects.toMatchObject({ code: 'TEAM_INVALID_MEMBER_NAME' })
    }
    const started = await spawn(ctx, lead, 'worker')
    const worker = await waitRunning(ctx, started.member.id)
    await expect(spawn(ctx, worker, 'nested')).rejects.toMatchObject({ code: 'TEAM_LEAD_REQUIRED' })
    expect(() => ctx.agentTeams.interrupt(worker, 'worker')).toThrow(expect.objectContaining({ code: 'TEAM_LEAD_REQUIRED' }))
    expect(ctx.agentTeams.interrupt(lead, 'worker')).toEqual({ previousStatus: 'running' })
    await waitNoAgent(ctx, worker.id)
    expect(ctx.agentTeams.interrupt(lead, 'worker')).toEqual({ previousStatus: 'inactive' })
    expect(() => ctx.agentTeams.interrupt(lead, 'lead')).toThrow(expect.objectContaining({ code: 'TEAM_INVALID_TARGET' }))
  })

  it('validates teammate text fields and pre-provisioning cancellation', async () => {
    const { ctx, lead } = await setup([])
    await expect(ctx.agentTeams.spawnTeammate(lead, {
      name: 'empty-description',
      description: ' ',
      prompt: content('unused'),
      context: 'fresh',
      provider: 'spawn',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    await expect(ctx.agentTeams.spawnTeammate(lead, {
      name: 'empty-provider',
      description: 'valid description',
      prompt: content('unused'),
      context: 'fresh',
      provider: ' ',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    const controller = new AbortController()
    controller.abort(new TeamError('cancelled before provisioning', 'TEST_CANCELLED'))
    await expect(ctx.agentTeams.spawnTeammate(lead, {
      name: 'cancelled-worker',
      description: 'never provisioned',
      prompt: content('unused'),
      context: 'fresh',
      provider: 'spawn',
      signal: controller.signal,
    })).rejects.toMatchObject({ code: 'TEST_CANCELLED' })
    expect(durable(lead).members).toEqual([])
  })

  it('treats an ordinary fork as a new Root Team and filters inherited Team state', async () => {
    const { ctx, lead } = await setup([])
    await ctx.agentTeams.createTask(lead, { subject: 'parent task', description: 'belongs to parent' })
    const handle = await ctx.agents.create({
      sessionId: SessionId('ordinary-fork'),
      seed: lead.session.snapshotEvents(),
      meta: { parentSession: lead.id, isSeeded: true },
      inheritedEventCount: SessionLogOffset(lead.session.seq),
      agentOptions: { provider: 'mock', model: 'mock' },
    })

    expect(ctx.agentTeams.membership(handle.agent)).toMatchObject({
      id: TeamId(handle.agent.id),
      role: 'lead',
      name: 'lead',
    })
    expect(durable(handle.agent)).toMatchObject({ members: [], tasks: [], pendingMessages: [] })
    await handle.dispose()
  })

  it('rejects stale Agent identities and non-Team subagent children', async () => {
    const { ctx, lead } = await setup([textResponse('done')])
    const started = await ctx.subagents.startContinuable({
      provider: 'spawn',
      label: 'ordinary worker',
      request: { prompt: content('ordinary'), parent: lead },
      signal: SIGNAL,
    })
    const live = ctx.agents.get(started.childId)
    if (live !== undefined) expect(ctx.agentTeams.tryMembership(live)).toBeUndefined()
    await waitNoAgent(ctx, started.childId)
    expect(() => ctx.agentTeams.membership(lead)).not.toThrow()

    const impostor = { ...lead } as Agent
    expect(ctx.agentTeams.tryMembership(impostor)).toBeUndefined()
    expect(() => ctx.agentTeams.membership(impostor)).toThrow(expect.objectContaining({ code: 'TEAM_NOT_MEMBER' }))

    const orphanRoot = await ctx.agents.create({
      sessionId: SessionId('orphan-ordinary-root'),
      meta: { parentSession: SessionId('absent-parent') },
      agentOptions: { provider: 'mock', model: 'mock' },
    })
    expect(ctx.agentTeams.membership(orphanRoot.agent)).toMatchObject({ role: 'lead', name: 'lead' })
    await orphanRoot.dispose()
  })

  it('does not reinterpret an orphaned provider child or malformed parent stream as a Team root', async () => {
    const first = await setup([textResponse('ordinary child done')])
    const parent = await first.ctx.agents.create({
      sessionId: SessionId('temporary-parent'),
      agentOptions: { provider: 'mock', model: 'mock' },
    })
    const started = await first.ctx.subagents.startContinuable({
      provider: 'spawn',
      label: 'ordinary child',
      request: { prompt: content('finish'), parent: parent.agent },
      signal: SIGNAL,
    })
    await waitNoAgent(first.ctx, started.childId)
    await parent.dispose()
    const orphan = await first.ctx.agents.resume({
      resumeSessionId: started.childId,
      agentOptions: { provider: 'mock', model: 'mock' },
    })
    expect(first.ctx.agentTeams.tryMembership(orphan.agent)).toBeUndefined()
    expect(teamInternals(first.ctx).roster.liveChildrenByRoot()).toEqual(new Map())
    await orphan.dispose()

    const second = await setup([])
    const child = await second.ctx.agents.create({
      sessionId: SessionId('malformed-parent-child'),
      meta: { parentSession: second.lead.id },
      agentOptions: { provider: 'mock', model: 'mock' },
    })
    const journal = teamInternals(second.ctx).journal
    const state = journal.state.bind(journal)
    journal.state = () => { throw new Error('malformed Team stream') }
    expect(second.ctx.agentTeams.tryMembership(child.agent)).toBeUndefined()
    journal.state = state
    await child.dispose()
  })
})

describe('Team shared task DAG', () => {
  it('fails loudly when the durable numeric task id space is exhausted', async () => {
    const { ctx, lead } = await setup([])
    const id = TeamTaskId(`task-${Number.MAX_SAFE_INTEGER}`)
    lead.session.append('team/task', {
      version: 2,
      teamId: TeamId(lead.id),
      task: {
        id,
        revision: 1,
        subject: 'last numeric task',
        description: 'occupies the final safe numeric task id',
        status: 'pending',
        blockedBy: [],
        writeScopes: [],
      },
    })
    await ctx.sessions.flush(lead.session)

    await expect(ctx.agentTeams.createTask(lead, {
      subject: 'cannot allocate',
      description: 'no safe numeric task id remains',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_LIMIT' })
  })

  it('bounds non-deleted tasks while retaining deleted task ids as tombstones', async () => {
    const { ctx, lead } = await setup([], { maxTasks: 1 })
    const first = await ctx.agentTeams.createTask(lead, { subject: 'first', description: 'first task' })
    await expect(ctx.agentTeams.createTask(lead, { subject: 'overflow', description: 'overflow task' }))
      .rejects.toMatchObject({ code: 'TEAM_TASK_LIMIT' })

    const deleted = await ctx.agentTeams.updateTask(lead, {
      taskId: first.id,
      expectedRevision: first.revision,
      action: 'delete',
    })
    const second = await ctx.agentTeams.createTask(lead, { subject: 'second', description: 'second task' })
    expect(deleted.status).toBe('deleted')
    expect(second.id).toBe(TeamTaskId('task-2'))
    expect(ctx.agentTeams.getTask(lead, first.id).status).toBe('deleted')
    expect(ctx.agentTeams.listTasks(lead).map(task => task.id)).toEqual([second.id])
  })

  it('enforces CAS, ownership, dependencies, transitions, and write-scope warnings', async () => {
    const { ctx, lead } = await setup(['hang', 'hang', textResponse('beta integrated update')])
    const firstMember = await spawn(ctx, lead, 'alpha')
    const alpha = await waitRunning(ctx, firstMember.member.id)
    const secondMember = await spawn(ctx, lead, 'beta')
    const beta = await waitRunning(ctx, secondMember.member.id)

    const first = await ctx.agentTeams.createTask(alpha, {
      subject: 'first',
      description: 'first task',
      writeScopes: ['src', './src/', 'src'],
    })
    const second = await ctx.agentTeams.createTask(beta, {
      subject: 'second',
      description: 'second task',
      blockedBy: [first.id],
      writeScopes: ['src/feature'],
    })
    expect(first.writeScopes).toEqual(['src'])
    await expect(ctx.agentTeams.updateTask(beta, {
      taskId: second.id,
      expectedRevision: second.revision,
      action: 'claim',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_BLOCKED' })

    const claimed = await ctx.agentTeams.updateTask(alpha, {
      taskId: first.id,
      expectedRevision: first.revision,
      action: 'claim',
    })
    await expect(ctx.agentTeams.updateTask(beta, {
      taskId: first.id,
      expectedRevision: claimed.revision,
      action: 'claim',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_ALREADY_CLAIMED' })
    expect(ctx.agentTeams.getTask(beta, second.id)).toMatchObject({
      ready: false,
      writeScopeWarnings: [`write scopes overlap with ${first.id}`],
    })
    await expect(ctx.agentTeams.updateTask(beta, {
      taskId: first.id,
      expectedRevision: claimed.revision,
      action: 'edit',
      subject: 'stolen',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_UNAUTHORIZED' })
    await expect(ctx.agentTeams.updateTask(alpha, {
      taskId: first.id,
      expectedRevision: first.revision,
      action: 'complete',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_STALE_REVISION' })

    const completed = await ctx.agentTeams.updateTask(alpha, {
      taskId: first.id,
      expectedRevision: claimed.revision,
      action: 'complete',
    })
    expect(completed.status).toBe('completed')
    expect(ctx.agentTeams.getTask(beta, second.id).ready).toBe(true)
    const secondClaim = await ctx.agentTeams.updateTask(beta, {
      taskId: second.id,
      expectedRevision: second.revision,
      action: 'claim',
    })
    const released = await ctx.agentTeams.updateTask(beta, {
      taskId: second.id,
      expectedRevision: secondClaim.revision,
      action: 'release',
    })
    expect(released).toMatchObject({ status: 'pending', ready: true })
    expect('ownerId' in released).toBe(false)

    ctx.agentTeams.interrupt(lead, 'alpha')
    ctx.agentTeams.interrupt(lead, 'beta')
    await Promise.all([waitNoAgent(ctx, alpha.id), waitNoAgent(ctx, beta.id)])
  })

  it('rejects malformed scopes and every invalid dependency relation', async () => {
    const { ctx, lead } = await setup([])
    const first = await ctx.agentTeams.createTask(lead, { subject: 'one', description: 'one' })
    const second = await ctx.agentTeams.createTask(lead, {
      subject: 'two', description: 'two', blockedBy: [first.id],
    })
    await expect(ctx.agentTeams.createTask(lead, {
      subject: 'bad', description: 'bad', blockedBy: [TeamTaskId('missing')],
    })).rejects.toMatchObject({ code: 'TEAM_TASK_NOT_FOUND' })
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: first.id,
      expectedRevision: first.revision,
      action: 'set_dependencies',
      blockedBy: [second.id],
    })).rejects.toMatchObject({ code: 'TEAM_TASK_DEPENDENCY_CYCLE' })
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: first.id,
      expectedRevision: first.revision,
      action: 'set_dependencies',
      blockedBy: [first.id],
    })).rejects.toMatchObject({ code: 'TEAM_TASK_DEPENDENCY_CYCLE' })
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: first.id,
      expectedRevision: first.revision,
      action: 'set_dependencies',
      blockedBy: [second.id, second.id],
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    for (const scope of ['', '.', '..', '/root', 'C:\\root', 'C:root', 'a//b', 'a/../b']) {
      await expect(ctx.agentTeams.createTask(lead, {
        subject: 'scope', description: 'scope', writeScopes: [scope],
      })).rejects.toMatchObject({ code: 'TEAM_INVALID_WRITE_SCOPE' })
    }
  })

  it('rejects incomplete mutations, invalid transitions, and deletion of a live blocker', async () => {
    const { ctx, lead } = await setup([])
    await expect(ctx.agentTeams.createTask(lead, { subject: ' ', description: 'invalid' }))
      .rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    await expect(ctx.agentTeams.createTask(lead, { subject: 'invalid', description: '' }))
      .rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    await expect(ctx.agentTeams.createTask(lead, { subject: 'x'.repeat(201), description: 'too long' }))
      .rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    const blocker = await ctx.agentTeams.createTask(lead, { subject: 'blocker', description: 'blocker' })
    await ctx.agentTeams.createTask(lead, {
      subject: 'dependent', description: 'dependent', blockedBy: [blocker.id],
    })
    expect(() => ctx.agentTeams.getTask(lead, TeamTaskId('missing')))
      .toThrow(expect.objectContaining({ code: 'TEAM_TASK_NOT_FOUND' }))
    for (const action of ['release', 'complete', 'reopen'] as const) {
      await expect(ctx.agentTeams.updateTask(lead, {
        taskId: blocker.id,
        expectedRevision: blocker.revision,
        action,
      })).rejects.toMatchObject({ code: 'TEAM_TASK_INVALID_TRANSITION' })
    }
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: blocker.id,
      expectedRevision: blocker.revision,
      action: 'edit',
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: blocker.id,
      expectedRevision: blocker.revision,
      action: 'set_dependencies',
    })).rejects.toMatchObject({ code: 'TEAM_INVALID_ARGUMENT' })
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: blocker.id,
      expectedRevision: blocker.revision,
      action: 'delete',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_HAS_DEPENDENTS' })
  })

  it('supports Lead reassignment, completion, reopen, and deletion permissions', async () => {
    const { ctx, lead } = await setup(['hang'])
    const started = await spawn(ctx, lead, 'owner')
    const owner = await waitRunning(ctx, started.member.id)
    const task = await ctx.agentTeams.createTask(owner, { subject: 'lifecycle', description: 'lifecycle' })
    const assigned = await ctx.agentTeams.updateTask(lead, {
      taskId: task.id,
      expectedRevision: task.revision,
      action: 'reassign',
      owner: 'owner',
    })
    await expect(ctx.agentTeams.updateTask(owner, {
      taskId: task.id,
      expectedRevision: assigned.revision,
      action: 'reassign',
      owner: 'lead',
    })).rejects.toMatchObject({ code: 'TEAM_LEAD_REQUIRED' })
    const complete = await ctx.agentTeams.updateTask(owner, {
      taskId: task.id,
      expectedRevision: assigned.revision,
      action: 'complete',
    })
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: task.id,
      expectedRevision: complete.revision,
      action: 'reassign',
      owner: 'lead',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_INVALID_TRANSITION' })
    const reopened = await ctx.agentTeams.updateTask(owner, {
      taskId: task.id,
      expectedRevision: complete.revision,
      action: 'reopen',
    })
    const claimed = await ctx.agentTeams.updateTask(owner, {
      taskId: task.id,
      expectedRevision: reopened.revision,
      action: 'claim',
    })
    const deleted = await ctx.agentTeams.updateTask(owner, {
      taskId: task.id,
      expectedRevision: claimed.revision,
      action: 'delete',
    })
    expect(deleted.status).toBe('deleted')
    expect(ctx.agentTeams.listTasks(lead)).toEqual([])
    await expect(ctx.agentTeams.updateTask(owner, {
      taskId: task.id,
      expectedRevision: deleted.revision,
      action: 'edit',
      subject: 'late',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_DELETED' })
    ctx.agentTeams.interrupt(lead, 'owner')
    await waitNoAgent(ctx, owner.id)
  })

  it('covers partial edits, Lead ownership, unassignment, and blocked reassignment', async () => {
    const { ctx, lead } = await setup(['hang'])
    const started = await spawn(ctx, lead, 'editor')
    const editor = await waitRunning(ctx, started.member.id)
    const blocker = await ctx.agentTeams.createTask(lead, { subject: 'blocker', description: 'blocker' })
    const task = await ctx.agentTeams.createTask(lead, {
      subject: 'draft',
      description: 'draft description',
      blockedBy: [blocker.id],
    })
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: TeamTaskId('missing-update'), expectedRevision: 1, action: 'delete',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_NOT_FOUND' })
    await expect(ctx.agentTeams.updateTask(lead, {
      taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: 'editor',
    })).rejects.toMatchObject({ code: 'TEAM_TASK_BLOCKED' })

    const leadClaim = await ctx.agentTeams.updateTask(lead, {
      taskId: blocker.id, expectedRevision: blocker.revision, action: 'claim',
    })
    expect(leadClaim.ownerName).toBe('lead')
    const completedBlocker = await ctx.agentTeams.updateTask(lead, {
      taskId: blocker.id, expectedRevision: leadClaim.revision, action: 'complete',
    })
    expect(completedBlocker.status).toBe('completed')
    const assigned = await ctx.agentTeams.updateTask(lead, {
      taskId: task.id, expectedRevision: task.revision, action: 'reassign', owner: 'editor',
    })
    const subject = await ctx.agentTeams.updateTask(editor, {
      taskId: task.id, expectedRevision: assigned.revision, action: 'edit', subject: 'edited subject',
    })
    const description = await ctx.agentTeams.updateTask(editor, {
      taskId: task.id,
      expectedRevision: subject.revision,
      action: 'edit',
      description: 'edited description',
    })
    const scopes = await ctx.agentTeams.updateTask(editor, {
      taskId: task.id,
      expectedRevision: description.revision,
      action: 'edit',
      writeScopes: ['src/nested'],
    })
    expect(scopes).toMatchObject({
      subject: 'edited subject',
      description: 'edited description',
      writeScopes: ['src/nested'],
    })
    const unassigned = await ctx.agentTeams.updateTask(lead, {
      taskId: task.id, expectedRevision: scopes.revision, action: 'reassign', owner: ' ',
    })
    expect(unassigned).toMatchObject({ status: 'pending' })
    expect('ownerId' in unassigned).toBe(false)

    const broad = await ctx.agentTeams.createTask(lead, {
      subject: 'broad scope', description: 'broad scope', writeScopes: ['src'],
    })
    const narrow = await ctx.agentTeams.createTask(lead, {
      subject: 'narrow scope', description: 'narrow scope', writeScopes: ['src/nested'],
    })
    const disjoint = await ctx.agentTeams.createTask(lead, {
      subject: 'disjoint scope', description: 'disjoint scope', writeScopes: ['docs'],
    })
    await ctx.agentTeams.updateTask(lead, {
      taskId: broad.id, expectedRevision: broad.revision, action: 'claim',
    })
    await ctx.agentTeams.updateTask(lead, {
      taskId: narrow.id, expectedRevision: narrow.revision, action: 'claim',
    })
    await ctx.agentTeams.updateTask(lead, {
      taskId: disjoint.id, expectedRevision: disjoint.revision, action: 'claim',
    })
    expect(ctx.agentTeams.getTask(lead, broad.id).writeScopeWarnings)
      .toEqual([`write scopes overlap with ${narrow.id}`])

    ctx.agentTeams.interrupt(lead, 'editor')
    await waitNoAgent(ctx, editor.id)
  })
})

describe('Team Remote API', () => {
  it('exports Team views and task mutations from the owning service', async () => {
    const { ctx, lead } = await setup([])
    expect(ctx.agentTeams.typertRemote).toMatchObject({ serviceKey: 'agentTeams', namespace: 'agentTeams' })
    await expect(ctx.agentTeams.remoteView(lead, SIGNAL)).resolves.toEqual({
      members: [expect.objectContaining({ name: 'lead', role: 'lead', status: 'idle' })],
      tasks: [],
      sections: [],
      unassignedBotIds: [],
      handoffs: [],
      skills: [],
      routines: [],
      memories: [],
    })

    const createdResult = await ctx.agentTeams.remoteCreateTask(lead, {
      subject: 'Remote task',
      description: 'Created through the generated API',
      blockedBy: [],
      writeScopes: ['packages/experimental/agent-team'],
    })
    expect(createdResult).toMatchObject({ ok: true, value: { revision: 1 } })
    if (!createdResult.ok) throw new Error('Remote task creation did not succeed')
    const created = createdResult.value
    await expect(ctx.agentTeams.remoteUpdateTask(lead, {
      taskId: created.id,
      expectedRevision: created.revision,
      action: 'claim',
    })).resolves.toMatchObject({
      ok: true,
      value: { id: created.id, revision: 2, ownerName: 'lead' },
    })
    await expect(ctx.agentTeams.remoteView(lead, SIGNAL)).resolves.toMatchObject({
      tasks: [expect.objectContaining({ id: created.id })],
      handoffs: [],
      skills: [],
      routines: [],
      memories: [],
    })
  })

  it('P5 T006-T008: writeMemory / listMemories persist Host catalog over Remotes', async () => {
    const { ctx, lead } = await setup([
      textResponse('memory alpha'),
      textResponse('memory beta'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Memory Alpha',
      modelSelection: { provider: 'mock', model: 'memory-a' },
      signal: SIGNAL,
    })
    const beta = await ctx.agentTeams.createBot(lead, {
      displayName: 'Memory Beta',
      modelSelection: { provider: 'mock', model: 'memory-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)
    await waitNoAgent(ctx, beta.id)

    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: '   ',
      signal: SIGNAL,
    })).rejects.toThrow(/content must be non-empty/)
    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'agent',
      content: 'missing bot',
      signal: SIGNAL,
    })).rejects.toThrow(/botId is required/)
    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'user',
      botId: alpha.id,
      content: 'user with bot',
      signal: SIGNAL,
    })).rejects.toThrow(/must be absent or null/)
    await expect(ctx.agentTeams.remoteWriteMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: '  ',
    }, SIGNAL)).resolves.toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringMatching(/content must be non-empty/) },
    })
    expect(ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories)
      .toEqual([])

    const agentProfile = await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: 'Alpha prefers UTC',
      signal: SIGNAL,
    })
    expect(agentProfile.memory).toMatchObject({
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: 'Alpha prefers UTC',
    })
    const userNote = await ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'user',
      botId: null,
      content: 'Account timezone America/New_York',
      signal: SIGNAL,
    })
    expect(userNote.memory).toMatchObject({
      kind: 'note',
      layer: 'user',
      botId: null,
      content: 'Account timezone America/New_York',
    })
    const agentLog = await ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: beta.id,
      content: 'Beta shipped P5 foundation',
      signal: SIGNAL,
    })

    // Agent isolation: bot B must not list A's agent rows as B's agent memory.
    const alphaListed = ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories
    expect(alphaListed).toEqual([agentProfile.memory, userNote.memory])
    const betaListed = ctx.agentTeams.listMemories(lead, { botId: beta.id, signal: SIGNAL }).memories
    expect(betaListed).toEqual([userNote.memory, agentLog.memory])

    // User sharing: same user row visible in both bot contexts.
    expect(alphaListed.some(row => row.memoryId === userNote.memory.memoryId)).toBe(true)
    expect(betaListed.some(row => row.memoryId === userNote.memory.memoryId)).toBe(true)

    // Orthogonality: kinds independent of layers (profile on agent, note on user, log on agent).
    expect(new Set(alphaListed.map(row => row.kind))).toEqual(new Set(['profile', 'note']))
    expect(new Set([agentProfile.memory.layer, userNote.memory.layer, agentLog.memory.layer]))
      .toEqual(new Set(['agent', 'user']))

    const remoteList = await ctx.agentTeams.remoteListMemories(lead, { botId: alpha.id }, SIGNAL)
    expect(remoteList).toMatchObject({ ok: true, value: { memories: alphaListed } })
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.memories).toHaveLength(3)
    expect(view.memories).toEqual([
      agentProfile.memory,
      userNote.memory,
      agentLog.memory,
    ])
  })

  it('US1 T014: writeMemory kind=profile validates non-empty content, rejects empty, persists on Host catalog', async () => {
    const { ctx, lead } = await setup([
      textResponse('profile validate a'),
      textResponse('profile validate b'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Profile Alpha',
      modelSelection: { provider: 'mock', model: 'profile-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)

    // Empty / whitespace-only profile content rejects without writing (FR-001 / SC-001).
    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: '',
      signal: SIGNAL,
    })).rejects.toThrow(/content must be non-empty/)
    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: '   \t\n  ',
      signal: SIGNAL,
    })).rejects.toThrow(/content must be non-empty/)
    await expect(ctx.agentTeams.remoteWriteMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: '  ',
    }, SIGNAL)).resolves.toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringMatching(/content must be non-empty/) },
    })
    expect(ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories)
      .toEqual([])

    // Non-empty profile persists on Host catalog (agent layer + account-wide user layer).
    const agentProfile = await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: '  Prefers concise answers  ',
      signal: SIGNAL,
    })
    expect(agentProfile.memory).toMatchObject({
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: 'Prefers concise answers',
    })
    const userProfile = await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'user',
      botId: null,
      content: 'Account prefers UTC',
      signal: SIGNAL,
    })
    expect(userProfile.memory).toMatchObject({
      kind: 'profile',
      layer: 'user',
      botId: null,
      content: 'Account prefers UTC',
    })

    // Leave/return without restart: list + view still show the same curated profile rows.
    const listed = ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories
    expect(listed).toEqual([agentProfile.memory, userProfile.memory])
    expect(listed.every(row => row.kind === 'profile')).toBe(true)
    const remoteList = await ctx.agentTeams.remoteListMemories(lead, { botId: alpha.id }, SIGNAL)
    expect(remoteList).toMatchObject({ ok: true, value: { memories: listed } })
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.memories).toEqual([agentProfile.memory, userProfile.memory])

    // Remote success path for profile write (FR-015: Host Remote write — bot-tool not required).
    const remoteWrite = await ctx.agentTeams.remoteWriteMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: 'Second profile fact',
    }, SIGNAL)
    expect(remoteWrite).toMatchObject({
      ok: true,
      value: {
        memory: {
          kind: 'profile',
          layer: 'agent',
          botId: alpha.id,
          content: 'Second profile fact',
        },
      },
    })
  })

  it('US2 T017: writeMemory kind=log validates non-empty content, rejects empty, persists distinguishable from profile', async () => {
    const { ctx, lead } = await setup([
      textResponse('log validate a'),
      textResponse('log validate b'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Log Alpha',
      modelSelection: { provider: 'mock', model: 'log-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)

    // Empty / whitespace-only log content rejects without writing (FR-002 / SC-002).
    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: '',
      signal: SIGNAL,
    })).rejects.toThrow(/content must be non-empty/)
    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: '   \t\n  ',
      signal: SIGNAL,
    })).rejects.toThrow(/content must be non-empty/)
    await expect(ctx.agentTeams.remoteWriteMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: '  ',
    }, SIGNAL)).resolves.toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringMatching(/content must be non-empty/) },
    })
    expect(ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories)
      .toEqual([])

    // Non-empty log persists on Host catalog (agent layer + account-wide user layer).
    const agentLog = await ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: '  Shipped memory log write  ',
      signal: SIGNAL,
    })
    expect(agentLog.memory).toMatchObject({
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: 'Shipped memory log write',
    })
    const userLog = await ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'user',
      botId: null,
      content: 'Account noted P5 US2',
      signal: SIGNAL,
    })
    expect(userLog.memory).toMatchObject({
      kind: 'log',
      layer: 'user',
      botId: null,
      content: 'Account noted P5 US2',
    })

    // Leave/return without restart: list + view still show the same curated log rows.
    const listed = ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories
    expect(listed).toEqual([agentLog.memory, userLog.memory])
    expect(listed.every(row => row.kind === 'log')).toBe(true)
    const remoteList = await ctx.agentTeams.remoteListMemories(lead, { botId: alpha.id }, SIGNAL)
    expect(remoteList).toMatchObject({ ok: true, value: { memories: listed } })
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.memories).toEqual([agentLog.memory, userLog.memory])

    // Distinguishable from profile: co-exist with a profile row; kinds remain distinct (SC-002).
    const profile = await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: 'Prefers short logs',
      signal: SIGNAL,
    })
    const mixed = ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories
    expect(mixed).toEqual([agentLog.memory, userLog.memory, profile.memory])
    expect(new Set(mixed.map(row => row.kind))).toEqual(new Set(['log', 'profile']))
    expect(mixed.filter(row => row.kind === 'log')).toEqual([agentLog.memory, userLog.memory])
    expect(mixed.filter(row => row.kind === 'profile')).toEqual([profile.memory])

    // Remote success path for log write (FR-015: Host Remote write — bot-tool not required).
    const remoteWrite = await ctx.agentTeams.remoteWriteMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: 'Second log fact',
    }, SIGNAL)
    expect(remoteWrite).toMatchObject({
      ok: true,
      value: {
        memory: {
          kind: 'log',
          layer: 'agent',
          botId: alpha.id,
          content: 'Second log fact',
        },
      },
    })
  })

  it('US3 T020: writeMemory kind=note validates non-empty content, rejects empty, persists distinguishable from profile and log', async () => {
    const { ctx, lead } = await setup([
      textResponse('note validate a'),
      textResponse('note validate b'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Note Alpha',
      modelSelection: { provider: 'mock', model: 'note-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)

    // Empty / whitespace-only note content rejects without writing (FR-003 / SC-003).
    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'agent',
      botId: alpha.id,
      content: '',
      signal: SIGNAL,
    })).rejects.toThrow(/content must be non-empty/)
    await expect(ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'agent',
      botId: alpha.id,
      content: '   \t\n  ',
      signal: SIGNAL,
    })).rejects.toThrow(/content must be non-empty/)
    await expect(ctx.agentTeams.remoteWriteMemory(lead, {
      kind: 'note',
      layer: 'agent',
      botId: alpha.id,
      content: '  ',
    }, SIGNAL)).resolves.toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringMatching(/content must be non-empty/) },
    })
    expect(ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories)
      .toEqual([])

    // Non-empty note persists on Host catalog (agent layer + account-wide user layer).
    const agentNote = await ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'agent',
      botId: alpha.id,
      content: '  Freeform scratch for P5 US3  ',
      signal: SIGNAL,
    })
    expect(agentNote.memory).toMatchObject({
      kind: 'note',
      layer: 'agent',
      botId: alpha.id,
      content: 'Freeform scratch for P5 US3',
    })
    const userNote = await ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'user',
      botId: null,
      content: 'Account noted P5 US3',
      signal: SIGNAL,
    })
    expect(userNote.memory).toMatchObject({
      kind: 'note',
      layer: 'user',
      botId: null,
      content: 'Account noted P5 US3',
    })

    // Leave/return without restart: list + view still show the same curated note rows.
    const listed = ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories
    expect(listed).toEqual([agentNote.memory, userNote.memory])
    expect(listed.every(row => row.kind === 'note')).toBe(true)
    const remoteList = await ctx.agentTeams.remoteListMemories(lead, { botId: alpha.id }, SIGNAL)
    expect(remoteList).toMatchObject({ ok: true, value: { memories: listed } })
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.memories).toEqual([agentNote.memory, userNote.memory])

    // Distinguishable from profile and log: co-exist; kinds remain distinct (SC-003).
    const profile = await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: 'Prefers short notes',
      signal: SIGNAL,
    })
    const log = await ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: 'Logged note write rehearsal',
      signal: SIGNAL,
    })
    const mixed = ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories
    expect(mixed).toEqual([agentNote.memory, userNote.memory, profile.memory, log.memory])
    expect(new Set(mixed.map(row => row.kind))).toEqual(new Set(['note', 'profile', 'log']))
    expect(mixed.filter(row => row.kind === 'note')).toEqual([agentNote.memory, userNote.memory])
    expect(mixed.filter(row => row.kind === 'profile')).toEqual([profile.memory])
    expect(mixed.filter(row => row.kind === 'log')).toEqual([log.memory])

    // Remote success path for note write (FR-015: Host Remote write — bot-tool not required).
    const remoteWrite = await ctx.agentTeams.remoteWriteMemory(lead, {
      kind: 'note',
      layer: 'agent',
      botId: alpha.id,
      content: 'Second note fact',
    }, SIGNAL)
    expect(remoteWrite).toMatchObject({
      ok: true,
      value: {
        memory: {
          kind: 'note',
          layer: 'agent',
          botId: alpha.id,
          content: 'Second note fact',
        },
      },
    })
  })

  it('US4 T024: binds curated MemoryRecord into agent-teams:memory-recall on subsequent turns', async () => {
    const { ctx, lead } = await setup([
      textResponse('memory recall create a'),
      textResponse('memory recall create b'),
      textResponse('memory recall turn a'),
      textResponse('memory recall turn b'),
      textResponse('memory recall live update'),
    ])
    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Recall A',
      modelSelection: { provider: 'mock', model: 'recall-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botA.id)
    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Recall B',
      modelSelection: { provider: 'mock', model: 'recall-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botB.id)

    const agentFact = 'Alpha prefers UTC for recall inject'
    const userFact = 'Account timezone America/New_York'
    const peerFact = 'Beta private agent memory'
    await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: botA.id,
      content: agentFact,
      signal: SIGNAL,
    })
    await ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'user',
      botId: null,
      content: userFact,
      signal: SIGNAL,
    })
    await ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: botB.id,
      content: peerFact,
      signal: SIGNAL,
    })

    const followUp = await ctx.agentTeams.sendMessage(lead, {
      target: botA.name,
      content: content('second turn with memory recall'),
      signal: SIGNAL,
    })
    expect(followUp.status).toBe('accepted')
    const liveA = await waitRunning(ctx, botA.id)
    const promptA = renderPrompt(await ctx.systemPrompt.assemble(assembleContextFor(liveA)))
    expect(promptA).toContain(agentFact)
    expect(promptA).toContain(userFact)
    expect(promptA).not.toContain(peerFact)
    expect((await ctx.systemPrompt.assemble(assembleContextFor(liveA))).sections
      .some(section => section.name === 'agent-teams:memory-recall'
        && section.text.includes(agentFact)))
      .toBe(true)

    // Live Host write refreshes the mutable bind without requiring Agent recreate.
    const liveNote = 'Live note after bind'
    await ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'agent',
      botId: botA.id,
      content: liveNote,
      signal: SIGNAL,
    })
    const livePrompt = renderPrompt(await ctx.systemPrompt.assemble(assembleContextFor(liveA)))
    expect(livePrompt).toContain(liveNote)
    expect(livePrompt).toContain(agentFact)
    await waitNoAgent(ctx, botA.id)

    // Bot B must not gain A's agent-layer rows solely from A's save (ADR / US5).
    const wakeB = await ctx.agentTeams.sendMessage(lead, {
      target: botB.name,
      content: content('wake peer for memory isolation'),
      signal: SIGNAL,
    })
    expect(wakeB.status).toBe('accepted')
    const liveB = await waitRunning(ctx, botB.id)
    const promptB = renderPrompt(await ctx.systemPrompt.assemble(assembleContextFor(liveB)))
    expect(promptB).toContain(peerFact)
    expect(promptB).toContain(userFact)
    expect(promptB).not.toContain(agentFact)
    expect(promptB).not.toContain(liveNote)
    await waitNoAgent(ctx, botB.id)
  })

  it('US5 T027: listMemories isolates agent by botId and shares user across bots', async () => {
    const { ctx, lead } = await setup([
      textResponse('layer alpha'),
      textResponse('layer beta'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Layer Alpha',
      modelSelection: { provider: 'mock', model: 'layer-a' },
      signal: SIGNAL,
    })
    const beta = await ctx.agentTeams.createBot(lead, {
      displayName: 'Layer Beta',
      modelSelection: { provider: 'mock', model: 'layer-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)
    await waitNoAgent(ctx, beta.id)

    // Orthogonality (FR-017 / SC-010): every kind on both layers — no kind→layer lock.
    const alphaAgentProfile = await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: alpha.id,
      content: 'Alpha agent profile UTC',
      signal: SIGNAL,
    })
    const alphaAgentLog = await ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'agent',
      botId: alpha.id,
      content: 'Alpha agent log shipped',
      signal: SIGNAL,
    })
    const alphaAgentNote = await ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'agent',
      botId: alpha.id,
      content: 'Alpha agent note private',
      signal: SIGNAL,
    })
    const betaAgentProfile = await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'agent',
      botId: beta.id,
      content: 'Beta agent profile private',
      signal: SIGNAL,
    })
    const userProfile = await ctx.agentTeams.writeMemory(lead, {
      kind: 'profile',
      layer: 'user',
      botId: null,
      content: 'User profile shared timezone',
      signal: SIGNAL,
    })
    const userLog = await ctx.agentTeams.writeMemory(lead, {
      kind: 'log',
      layer: 'user',
      botId: null,
      content: 'User log shared event',
      signal: SIGNAL,
    })
    const userNote = await ctx.agentTeams.writeMemory(lead, {
      kind: 'note',
      layer: 'user',
      botId: null,
      content: 'User note shared fact',
      signal: SIGNAL,
    })

    const alphaListed = ctx.agentTeams.listMemories(lead, { botId: alpha.id, signal: SIGNAL }).memories
    expect(alphaListed).toEqual([
      alphaAgentProfile.memory,
      alphaAgentLog.memory,
      alphaAgentNote.memory,
      userProfile.memory,
      userLog.memory,
      userNote.memory,
    ])
    // Bot B MUST NOT list A's agent rows as B's agent memory (FR-006 / SC-005).
    expect(alphaListed.some(row => row.memoryId === betaAgentProfile.memory.memoryId)).toBe(false)
    expect(alphaListed.filter(row => row.layer === 'agent').every(row => row.botId === alpha.id)).toBe(true)

    const betaListed = ctx.agentTeams.listMemories(lead, { botId: beta.id, signal: SIGNAL }).memories
    expect(betaListed).toEqual([
      betaAgentProfile.memory,
      userProfile.memory,
      userLog.memory,
      userNote.memory,
    ])
    expect(betaListed.some(row => row.content.includes('Alpha'))).toBe(false)
    expect(betaListed.filter(row => row.layer === 'agent').every(row => row.botId === beta.id)).toBe(true)

    // User layer account-wide across bot contexts (FR-007 / SC-005).
    for (const listed of [alphaListed, betaListed]) {
      expect(listed.filter(row => row.layer === 'user').map(row => row.memoryId)).toEqual([
        userProfile.memory.memoryId,
        userLog.memory.memoryId,
        userNote.memory.memoryId,
      ])
    }

    // Kinds × layers orthogonal — all three kinds on agent and on user (FR-017).
    expect(new Set(alphaListed.filter(row => row.layer === 'agent').map(row => row.kind)))
      .toEqual(new Set(['profile', 'log', 'note']))
    expect(new Set([userProfile.memory.kind, userLog.memory.kind, userNote.memory.kind]))
      .toEqual(new Set(['profile', 'log', 'note']))

    const remoteAlpha = await ctx.agentTeams.remoteListMemories(lead, { botId: alpha.id }, SIGNAL)
    expect(remoteAlpha).toMatchObject({ ok: true, value: { memories: alphaListed } })
    const remoteBeta = await ctx.agentTeams.remoteListMemories(lead, { botId: beta.id }, SIGNAL)
    expect(remoteBeta).toMatchObject({ ok: true, value: { memories: betaListed } })

    // Full catalog via view — still Host journal SoT, not transcript.
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.memories).toHaveLength(7)
    expect(view.memories.every(row => row.memoryId.startsWith('memory-'))).toBe(true)
  })

  it('US1 T015: createRoutine rejects empty intent / bad schedule loudly and persists active', async () => {
    const { ctx, lead } = await setup([
      textResponse('routine validate a'),
      textResponse('routine validate b'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Routine Alpha',
      modelSelection: { provider: 'mock', model: 'routine-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)

    await expect(ctx.agentTeams.createRoutine(lead, {
      botId: alpha.id,
      intent: '   ',
      scheduleExpr: '@every 5m',
      signal: SIGNAL,
    })).rejects.toThrow(/intent must be non-empty/)
    await expect(ctx.agentTeams.createRoutine(lead, {
      botId: alpha.id,
      intent: 'Check inbox',
      scheduleExpr: '@every 1m',
      signal: SIGNAL,
    })).rejects.toThrow(/at least 5 minutes/)
    await expect(ctx.agentTeams.createRoutine(lead, {
      botId: alpha.id,
      intent: 'Check inbox',
      scheduleExpr: '',
      signal: SIGNAL,
    })).rejects.toThrow(/scheduleExpr must be non-empty/)
    await expect(ctx.agentTeams.createRoutine(lead, {
      botId: alpha.id,
      intent: 'Check inbox',
      scheduleExpr: 'not-a-schedule',
      signal: SIGNAL,
    })).rejects.toThrow(/unsupported/)

    // Remote path surfaces the same reasons as typed Client-visible rejections (FR-001).
    await expect(ctx.agentTeams.remoteCreateRoutine(lead, {
      botId: alpha.id,
      intent: '  ',
      scheduleExpr: '@hourly',
    }, SIGNAL)).resolves.toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringMatching(/intent must be non-empty/) },
    })
    await expect(ctx.agentTeams.remoteCreateRoutine(lead, {
      botId: alpha.id,
      intent: 'Check inbox',
      scheduleExpr: '@every 1m',
    }, SIGNAL)).resolves.toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringMatching(/at least 5 minutes/) },
    })
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: alpha.id, signal: SIGNAL }).routines)
      .toEqual([])

    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: alpha.id,
      intent: 'Check inbox',
      scheduleExpr: '@every 5m',
      signal: SIGNAL,
    })
    expect(created.routine).toMatchObject({
      botId: alpha.id,
      intent: 'Check inbox',
      identity: 'Check inbox',
      scheduleExpr: '@every 5m',
      scheduleLabel: 'Every 5m',
      status: 'active',
      lastRunAt: null,
    })
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: alpha.id, signal: SIGNAL }).routines)
      .toEqual([created.routine])
  })

  it('US1 T016: createRoutine is per-botId; no confirm or displayName required', async () => {
    const { ctx, lead } = await setup([
      textResponse('routine isolate a'),
      textResponse('routine isolate b'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Routine Alpha',
      modelSelection: { provider: 'mock', model: 'routine-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)
    const beta = await ctx.agentTeams.createBot(lead, {
      displayName: 'Routine Beta',
      modelSelection: { provider: 'mock', model: 'routine-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, beta.id)

    // CreateRoutineInput is botId + intent + scheduleExpr only (SC-007: no confirm / displayName).
    const createInputKeys = Object.keys({
      botId: alpha.id,
      intent: 'Morning digest',
      scheduleExpr: '@daily',
    } satisfies Parameters<typeof ctx.agentTeams.remoteCreateRoutine>[1]).sort()
    expect(createInputKeys).toEqual(['botId', 'intent', 'scheduleExpr'])

    // Single Remote call creates without a confirm token (SC-007).
    const remoteCreate = await ctx.agentTeams.remoteCreateRoutine(lead, {
      botId: alpha.id,
      intent: 'Morning digest',
      scheduleExpr: '@daily',
    }, SIGNAL)
    expect(remoteCreate).toMatchObject({
      ok: true,
      value: {
        routine: {
          botId: alpha.id,
          intent: 'Morning digest',
          identity: 'Morning digest',
          scheduleExpr: '@daily',
          status: 'active',
        },
      },
    })

    const cronCreate = await ctx.agentTeams.remoteCreateRoutine(lead, {
      botId: alpha.id,
      intent: 'Hourly sweep',
      scheduleExpr: '0 * * * *',
    }, SIGNAL)
    expect(cronCreate).toMatchObject({
      ok: true,
      value: {
        routine: {
          botId: alpha.id,
          intent: 'Hourly sweep',
          scheduleExpr: '0 * * * *',
          status: 'active',
        },
      },
    })

    // Per-bot isolation (SC-006): bot B must not list A's routines solely because A created them.
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: alpha.id, signal: SIGNAL }).routines)
      .toHaveLength(2)
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: beta.id, signal: SIGNAL }).routines)
      .toEqual([])

    const listed = await ctx.agentTeams.remoteListRoutinesByBot(lead, { botId: alpha.id }, SIGNAL)
    expect(listed).toMatchObject({ ok: true })
    if (!listed.ok) throw new Error('listRoutinesByBot failed')
    expect(listed.value.routines).toHaveLength(2)
    expect(listed.value.routines.every(row => row.botId === alpha.id)).toBe(true)
    expect(listed.value.routines.every(row => row.identity === row.intent)).toBe(true)

    const betaListed = await ctx.agentTeams.remoteListRoutinesByBot(lead, { botId: beta.id }, SIGNAL)
    expect(betaListed).toMatchObject({ ok: true, value: { routines: [] } })

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.routines).toHaveLength(2)
    expect(view.routines.every(row => row.botId === alpha.id)).toBe(true)
  })

  it('US2 T019: listRoutinesByBot projects RoutineProjection over Remote from Host catalog', async () => {
    const { ctx, lead } = await setup([
      textResponse('routine list a'),
      textResponse('routine list b'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'List Alpha',
      modelSelection: { provider: 'mock', model: 'list-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)
    const beta = await ctx.agentTeams.createBot(lead, {
      displayName: 'List Beta',
      modelSelection: { provider: 'mock', model: 'list-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, beta.id)

    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: alpha.id, signal: SIGNAL }).routines)
      .toEqual([])

    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: alpha.id,
      intent: 'Inbox sweep',
      scheduleExpr: '@hourly',
      signal: SIGNAL,
    })
    await ctx.agentTeams.createRoutine(lead, {
      botId: beta.id,
      intent: 'Beta only',
      scheduleExpr: '@daily',
      signal: SIGNAL,
    })

    // Remote list projects FR-002 pane fields from Host catalog (intent/identity, schedule, status, lastRunAt).
    const listed = await ctx.agentTeams.remoteListRoutinesByBot(lead, { botId: alpha.id }, SIGNAL)
    expect(listed).toMatchObject({ ok: true })
    if (!listed.ok) throw new Error('listRoutinesByBot failed')
    expect(listed.value.routines).toEqual([{
      routineId: created.routine.routineId,
      botId: alpha.id,
      intent: 'Inbox sweep',
      identity: 'Inbox sweep',
      scheduleExpr: '@hourly',
      scheduleLabel: 'Every hour',
      status: 'active',
      lastRunAt: null,
      createdAt: created.routine.createdAt,
      updatedAt: created.routine.updatedAt,
    }])

    // Leave/return durability: a second list (and Team view) re-projects the same Host rows.
    const relisted = await ctx.agentTeams.remoteListRoutinesByBot(lead, { botId: alpha.id }, SIGNAL)
    expect(relisted).toEqual(listed)
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.routines.filter(row => row.botId === alpha.id)).toEqual(listed.value.routines)
    expect(view.routines.some(row => row.botId === beta.id)).toBe(true)

    // Per-bot isolation (SC-006): beta’s list never includes alpha’s routineId.
    const betaListed = await ctx.agentTeams.remoteListRoutinesByBot(lead, { botId: beta.id }, SIGNAL)
    expect(betaListed).toMatchObject({ ok: true })
    if (!betaListed.ok) throw new Error('listRoutinesByBot beta failed')
    expect(betaListed.value.routines).toHaveLength(1)
    expect(betaListed.value.routines[0]).toMatchObject({
      botId: beta.id,
      intent: 'Beta only',
      identity: 'Beta only',
      scheduleExpr: '@daily',
      scheduleLabel: 'Every day',
      status: 'active',
      lastRunAt: null,
    })
    expect(betaListed.value.routines.some(row => row.routineId === created.routine.routineId))
      .toBe(false)
  })

  it('US3 T022: pauseRoutine / resumeRoutine persist status; paused is not wake-eligible', async () => {
    const { ctx, lead } = await setup([
      textResponse('routine pause a'),
      textResponse('routine pause b'),
    ])
    const alpha = await ctx.agentTeams.createBot(lead, {
      displayName: 'Pause Alpha',
      modelSelection: { provider: 'mock', model: 'pause-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, alpha.id)
    const beta = await ctx.agentTeams.createBot(lead, {
      displayName: 'Pause Beta',
      modelSelection: { provider: 'mock', model: 'pause-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, beta.id)

    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: alpha.id,
      intent: 'Inbox sweep',
      scheduleExpr: '@every 5m',
      signal: SIGNAL,
    })
    expect(created.routine.status).toBe('active')
    expect(isRoutineEligibleForWake(created.routine)).toBe(true)

    await expect(ctx.agentTeams.pauseRoutine(lead, {
      routineId: RoutineId('routine-missing'),
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_ROUTINE_NOT_FOUND' })
    await expect(ctx.agentTeams.remotePauseRoutine(lead, {
      routineId: RoutineId('routine-missing'),
    }, SIGNAL)).resolves.toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringMatching(/not found/) },
    })

    const paused = await ctx.agentTeams.pauseRoutine(lead, {
      routineId: created.routine.routineId,
      signal: SIGNAL,
    })
    expect(paused.routine).toMatchObject({
      routineId: created.routine.routineId,
      botId: alpha.id,
      intent: 'Inbox sweep',
      identity: 'Inbox sweep',
      scheduleExpr: '@every 5m',
      status: 'paused',
      lastRunAt: null,
    })
    expect(paused.routine.updatedAt).toBeGreaterThanOrEqual(created.routine.updatedAt)
    expect(isRoutineEligibleForWake(paused.routine)).toBe(false)
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: alpha.id, signal: SIGNAL }).routines)
      .toEqual([paused.routine])

    // Host wake gate: paused catalog rows MUST NOT be selected for cron fire (FR-003).
    const pausedRecords = ctx.agentTeams.listRoutinesByBot(lead, { botId: alpha.id, signal: SIGNAL })
      .routines
      .map(row => ({
        routineId: row.routineId,
        botId: row.botId,
        intent: row.intent,
        scheduleExpr: row.scheduleExpr,
        status: row.status,
        lastRunAt: row.lastRunAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }))
    expect(routinesEligibleForWake(pausedRecords)).toEqual([])

    // Remote pause is idempotent; list still shows paused.
    const remotePaused = await ctx.agentTeams.remotePauseRoutine(lead, {
      routineId: created.routine.routineId,
    }, SIGNAL)
    expect(remotePaused).toMatchObject({
      ok: true,
      value: { routine: { status: 'paused', routineId: created.routine.routineId } },
    })

    const resumed = await ctx.agentTeams.resumeRoutine(lead, {
      routineId: created.routine.routineId,
      signal: SIGNAL,
    })
    expect(resumed.routine.status).toBe('active')
    expect(isRoutineEligibleForWake(resumed.routine)).toBe(true)
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: alpha.id, signal: SIGNAL }).routines)
      .toEqual([resumed.routine])
    expect(routinesEligibleForWake([{
      routineId: resumed.routine.routineId,
      botId: resumed.routine.botId,
      intent: resumed.routine.intent,
      scheduleExpr: resumed.routine.scheduleExpr,
      status: resumed.routine.status,
      lastRunAt: resumed.routine.lastRunAt,
      createdAt: resumed.routine.createdAt,
      updatedAt: resumed.routine.updatedAt,
    }])).toHaveLength(1)

    const remoteResumed = await ctx.agentTeams.remoteResumeRoutine(lead, {
      routineId: created.routine.routineId,
    }, SIGNAL)
    expect(remoteResumed).toMatchObject({
      ok: true,
      value: { routine: { status: 'active', routineId: created.routine.routineId } },
    })

    // Per-bot isolation: pausing alpha does not invent beta rows.
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: beta.id, signal: SIGNAL }).routines)
      .toEqual([])


    // Durability: pause again, then re-list (leave/return) keeps paused status (FR-003).
    await ctx.agentTeams.pauseRoutine(lead, {
      routineId: created.routine.routineId,
      signal: SIGNAL,
    })
    const relisted = await ctx.agentTeams.remoteListRoutinesByBot(lead, { botId: alpha.id }, SIGNAL)
    expect(relisted).toMatchObject({
      ok: true,
      value: { routines: [{ routineId: created.routine.routineId, status: 'paused' }] },
    })
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.routines.find(row => row.routineId === created.routine.routineId)?.status)
      .toBe('paused')
  })

  it('US4 T025: evaluateDueRoutines wakes active routine and updates lastRunAt; paused does not fire', async () => {
    // Extra mock turns cover cold-resume wake after fire enqueue (LLM wording not scored).
    const { ctx, lead } = await setup([
      textResponse('cron bot create'),
      textResponse('cron fire turn'),
      textResponse('cron paused bot'),
      textResponse('cron fire turn two'),
      textResponse('cron live followup'),
    ], { routineCronTickMs: 60_000 })
    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Cron Bot',
      modelSelection: { provider: 'mock', model: 'cron-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)

    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Sweep the inbox',
      scheduleExpr: '@every 5m',
      signal: SIGNAL,
    })
    expect(created.routine.lastRunAt).toBeNull()
    await expect(ctx.agentTeams.evaluateDueRoutines(Number.NaN))
      .rejects.toMatchObject({ message: expect.stringMatching(/nowMs must be a finite number/) })

    const beforeDue = created.routine.createdAt + MIN_EVERY_INTERVAL_MS - 1
    expect(await ctx.agentTeams.evaluateDueRoutines(beforeDue)).toEqual([])
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines[0]?.lastRunAt)
      .toBeNull()

    const dueAt = created.routine.createdAt + MIN_EVERY_INTERVAL_MS
    const fired = await ctx.agentTeams.evaluateDueRoutines(dueAt)
    expect(fired).toHaveLength(1)
    expect(fired[0]).toMatchObject({
      routineId: created.routine.routineId,
      botId: bot.id,
      intent: 'Sweep the inbox',
      status: 'active',
      lastRunAt: dueAt,
    })
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines[0]?.lastRunAt)
      .toBe(dueAt)

    // Same due sample must not re-fire until the next interval after lastRunAt.
    expect(await ctx.agentTeams.evaluateDueRoutines(dueAt)).toEqual([])

    // Wake commit enqueued the intent on the bot session (cold resume / followup path).
    const events = await storedEvents(ctx, bot.id)
    expect(events.some(event =>
      event.type === 'user/message'
      && Array.isArray(event.data.content)
      && event.data.content.some(
        block => block.type === 'text' && block.text === 'Sweep the inbox',
      ))).toBe(true)

    // Paused routines MUST NOT wake even when schedule would match (FR-003 / T022 invariant).
    const peer = await ctx.agentTeams.createBot(lead, {
      displayName: 'Paused Cron Bot',
      modelSelection: { provider: 'mock', model: 'paused-cron' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, peer.id)
    const pausedCreate = await ctx.agentTeams.createRoutine(lead, {
      botId: peer.id,
      intent: 'Should not fire',
      scheduleExpr: '@every 5m',
      signal: SIGNAL,
    })
    await ctx.agentTeams.pauseRoutine(lead, {
      routineId: pausedCreate.routine.routineId,
      signal: SIGNAL,
    })
    const pausedDue = pausedCreate.routine.createdAt + MIN_EVERY_INTERVAL_MS
    expect(await ctx.agentTeams.evaluateDueRoutines(pausedDue)).toEqual([])
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: peer.id, signal: SIGNAL }).routines[0])
      .toMatchObject({
        routineId: pausedCreate.routine.routineId,
        status: 'paused',
        lastRunAt: null,
      })
  }, 15_000)

  it('US4 T025: live bot followup wake updates lastRunAt', async () => {
    const { ctx, lead } = await setup([
      textResponse('live cron create'),
    ], { routineCronTickMs: 60_000 })
    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Live Cron Bot',
      modelSelection: { provider: 'mock', model: 'live-cron' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)
    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Live wake intent',
      scheduleExpr: '@every 5m',
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
    const dueAt = created.routine.createdAt + MIN_EVERY_INTERVAL_MS
    const fired = await ctx.agentTeams.evaluateDueRoutines(dueAt)
    expect(fired).toHaveLength(1)
    expect(fired[0]?.lastRunAt).toBe(dueAt)
    expect(followup).toHaveBeenCalledTimes(1)

    // Wake enqueue failure must not advance lastRunAt.
    followup.mockImplementation(() => {
      throw new Error('followup rejected')
    })
    const nextDue = dueAt + MIN_EVERY_INTERVAL_MS
    expect(await ctx.agentTeams.evaluateDueRoutines(nextDue)).toEqual([])
    expect(ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines[0]?.lastRunAt)
      .toBe(dueAt)
    getSpy.mockRestore()
  }, 15_000)

  it('US4 T025: deleted bot skips fire without lastRunAt; disposed evaluator is empty', async () => {
    const { ctx, lead } = await setup([
      textResponse('delete cron create'),
      textResponse('delete cron idle'),
    ], { routineCronTickMs: 60_000 })
    const bot = await ctx.agentTeams.createBot(lead, {
      displayName: 'Delete Cron Bot',
      modelSelection: { provider: 'mock', model: 'delete-cron' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, bot.id)
    const created = await ctx.agentTeams.createRoutine(lead, {
      botId: bot.id,
      intent: 'Orphan fire',
      scheduleExpr: '@every 5m',
      signal: SIGNAL,
    })
    await ctx.agentTeams.deleteBot(lead, { botId: bot.id, signal: SIGNAL })
    const dueAt = created.routine.createdAt + MIN_EVERY_INTERVAL_MS
    expect(await ctx.agentTeams.evaluateDueRoutines(dueAt)).toEqual([])
    // Catalog row may still exist; lastRunAt must stay null when the bot is gone.
    const listed = ctx.agentTeams.listRoutinesByBot(lead, { botId: bot.id, signal: SIGNAL }).routines
    if (listed[0] !== undefined) expect(listed[0].lastRunAt).toBeNull()

    await teamInternals(ctx).disposeRuntime()
    expect(await ctx.agentTeams.evaluateDueRoutines(dueAt)).toEqual([])
  }, 15_000)

  it('persists attachSkill, projects skillAttachments on view, and rejects empty author fields', async () => {
    const userSkillsRoot = mkdtempSync(join(tmpdir(), 'dsh-team-user-skills-'))
    roots.push(userSkillsRoot)
    const { ctx, lead } = await setup([
      textResponse('skill create'),
      textResponse('skill follow-up'),
    ], { userSkillsRoot })
    const created = await ctx.agentTeams.createBot(lead, {
      displayName: 'Skill Bot',
      modelSelection: { provider: 'mock', model: 'skill-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, created.id)

    const peer = await ctx.agentTeams.createBot(lead, {
      displayName: 'Peer Bot',
      modelSelection: { provider: 'mock', model: 'peer-model' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, peer.id)

    await expect(ctx.agentTeams.attachSkill(lead, {
      botId: created.id,
      skillId: 'mzm-thin-pack',
      signal: SIGNAL,
    })).rejects.toThrow(/skill catalog is unavailable/)

    const catalog = new Map<string, { name: string; description: string; source: string; content: string }>([
      ['mzm-thin-pack', {
        name: 'mzm-thin-pack',
        description: 'MzM thin pack — single managed skill for Phase 3 Skills UX Pass.',
        source: 'bundled',
        content: 'Follow the MzM thin-pack playbook for Pass.',
      }],
      ['second-skill', {
        name: 'second-skill',
        description: 'Second skill',
        source: 'user-dsh',
        content: 'Second attached instructional body.',
      }],
    ])
    ctx.provide('skills', {
      async list() {
        return [...catalog.values()].map(({ name, description, source }) => ({ name, description, source }))
      },
      async get(name: string) {
        return catalog.get(name)
      },
      register(skill: { name: string; description: string; content: string; source: string }) {
        catalog.set(skill.name, {
          name: skill.name,
          description: skill.description,
          source: skill.source,
          content: skill.content,
        })
        return () => { catalog.delete(skill.name) }
      },
    })

    await expect(ctx.agentTeams.attachSkill(lead, {
      botId: created.id,
      skillId: 'missing-skill',
      signal: SIGNAL,
    })).rejects.toThrow(/not available in the Host catalog/)

    const attached = await ctx.agentTeams.attachSkill(lead, {
      botId: created.id,
      skillId: 'mzm-thin-pack',
      signal: SIGNAL,
    })
    expect(attached.skillAttachments).toEqual([
      expect.objectContaining({ botId: created.id, skillId: 'mzm-thin-pack' }),
    ])
    expect(durable(lead).members.find(row => row.id === created.id)?.skillAttachments)
      .toEqual(attached.skillAttachments)
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === created.id)?.skillAttachments)
      .toEqual(attached.skillAttachments)
    // Per-bot isolation: peer must not gain A's attachment solely because A attached (SC-006).
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === peer.id)?.skillAttachments)
      .toBeUndefined()

    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.members.find(row => row.id === created.id)?.skillAttachments)
      .toEqual(attached.skillAttachments)
    expect(view.members.find(row => row.id === peer.id)?.skillAttachments)
      .toBeUndefined()
    expect(view.skills).toEqual([
      expect.objectContaining({ id: 'mzm-thin-pack', source: 'managed' }),
      expect.objectContaining({ id: 'second-skill', source: 'user' }),
    ])

    const remoteOk = await ctx.agentTeams.remoteAttachSkill(lead, {
      botId: created.id,
      skillId: 'second-skill',
    }, SIGNAL)
    expect(remoteOk).toMatchObject({
      ok: true,
      value: {
        skillAttachments: [
          expect.objectContaining({ skillId: 'mzm-thin-pack' }),
          expect.objectContaining({ skillId: 'second-skill' }),
        ],
      },
    })
    expect(ctx.agentTeams.listMembers(lead).find(row => row.id === peer.id)?.skillAttachments)
      .toBeUndefined()

    await expect(ctx.agentTeams.upsertUserSkill(lead, {
      displayName: '  ',
      instructionalBody: 'body',
      signal: SIGNAL,
    })).rejects.toThrow(/displayName must be non-empty/)
    await expect(ctx.agentTeams.upsertUserSkill(lead, {
      displayName: 'Named',
      instructionalBody: '   ',
      signal: SIGNAL,
    })).rejects.toThrow(/instructionalBody must be non-empty/)

    const authored = await ctx.agentTeams.upsertUserSkill(lead, {
      displayName: 'My Playbook',
      instructionalBody: 'Do the thing.',
      signal: SIGNAL,
    })
    expect(authored.skill).toMatchObject({
      id: 'my-playbook',
      displayName: 'My Playbook',
      source: 'user',
    })
  })

  it('persists user skills Host-durably and keeps rejected empty saves out of discovery (T027/T028)', async () => {
    const userSkillsRoot = mkdtempSync(join(tmpdir(), 'dsh-team-author-'))
    roots.push(userSkillsRoot)
    const { ctx, lead } = await setup([], { userSkillsRoot })

    const catalog = new Map<string, { name: string; description: string; source: string; content: string }>()
    ctx.provide('skills', {
      async list() {
        return [...catalog.values()].map(({ name, description, source }) => ({ name, description, source }))
      },
      async get(name: string) {
        return catalog.get(name)
      },
      register(skill: { name: string; description: string; content: string; source: string }) {
        catalog.set(skill.name, {
          name: skill.name,
          description: skill.description,
          source: skill.source,
          content: skill.content,
        })
        return () => { catalog.delete(skill.name) }
      },
    })

    await expect(ctx.agentTeams.upsertUserSkill(lead, {
      displayName: '',
      instructionalBody: 'body',
      signal: SIGNAL,
    })).rejects.toMatchObject({
      code: 'TEAM_INVALID_ARGUMENT',
      message: expect.stringContaining('displayName must be non-empty'),
    })
    await expect(ctx.agentTeams.upsertUserSkill(lead, {
      displayName: 'Ghost',
      instructionalBody: '  ',
      signal: SIGNAL,
    })).rejects.toMatchObject({
      code: 'TEAM_INVALID_ARGUMENT',
      message: expect.stringContaining('instructionalBody must be non-empty'),
    })
    expect(await readdir(userSkillsRoot)).toEqual([])
    expect(catalog.size).toBe(0)
    expect(await ctx.agentTeams.listSkills(lead, SIGNAL)).toEqual([])
    expect((await ctx.agentTeams.remoteView(lead, SIGNAL)).skills).toEqual([])

    const remoteReject = await ctx.agentTeams.remoteUpsertUserSkill(lead, {
      displayName: '   ',
      instructionalBody: 'still empty name',
    }, SIGNAL)
    expect(remoteReject).toMatchObject({
      ok: false,
      error: { code: 'team-rejected', message: expect.stringContaining('displayName') },
    })
    expect(await readdir(userSkillsRoot)).toEqual([])
    expect(catalog.size).toBe(0)

    const authored = await ctx.agentTeams.upsertUserSkill(lead, {
      displayName: 'Reusable Playbook',
      instructionalBody: 'Follow this authored playbook.',
      signal: SIGNAL,
    })
    expect(authored.skill).toMatchObject({
      id: 'reusable-playbook',
      displayName: 'Reusable Playbook',
      source: 'user',
      description: 'Reusable Playbook',
    })
    const skillPath = join(userSkillsRoot, 'reusable-playbook', 'SKILL.md')
    const onDisk = await readFile(skillPath, 'utf8')
    expect(onDisk).toContain('name: reusable-playbook')
    expect(onDisk).toContain('description: Reusable Playbook')
    expect(onDisk).toContain('Follow this authored playbook.')

    const listed = await ctx.agentTeams.listSkills(lead, SIGNAL)
    expect(listed).toEqual([
      expect.objectContaining({
        id: 'reusable-playbook',
        displayName: 'Reusable Playbook',
        source: 'user',
      }),
    ])
    expect((await ctx.agentTeams.remoteView(lead, SIGNAL)).skills).toEqual(listed)

    const updated = await ctx.agentTeams.upsertUserSkill(lead, {
      skillId: 'reusable-playbook',
      displayName: 'Reusable Playbook v2',
      instructionalBody: 'Updated instructional body.',
      signal: SIGNAL,
    })
    expect(updated.skill.displayName).toBe('Reusable Playbook v2')
    const rewritten = await readFile(skillPath, 'utf8')
    expect(rewritten).toContain('description: Reusable Playbook v2')
    expect(rewritten).toContain('Updated instructional body.')
    expect(rewritten).not.toContain('Follow this authored playbook.')

    const remoteOk = await ctx.agentTeams.remoteUpsertUserSkill(lead, {
      displayName: 'Remote Authored',
      instructionalBody: 'Remote body.',
    }, SIGNAL)
    expect(remoteOk).toMatchObject({
      ok: true,
      value: {
        skill: expect.objectContaining({ id: 'remote-authored', source: 'user' }),
      },
    })
    expect(await readFile(join(userSkillsRoot, 'remote-authored', 'SKILL.md'), 'utf8'))
      .toContain('Remote body.')
  })

  it('rejects upsertUserSkill when userSkillsRoot is not configured', async () => {
    const { ctx, lead } = await setup([])
    await expect(ctx.agentTeams.upsertUserSkill(lead, {
      displayName: 'No Root',
      instructionalBody: 'body',
      signal: SIGNAL,
    })).rejects.toMatchObject({
      code: 'TEAM_INVALID_CONFIG',
      message: expect.stringContaining('user skills root is not configured'),
    })
  })

  it('binds attached skill instructional bodies into Bot instruction assembly (FR-014 / SC-007)', async () => {
    const { ctx, lead } = await setup([
      textResponse('skill bind create a'),
      textResponse('skill bind create b'),
      textResponse('skill bind turn a'),
      textResponse('skill bind turn b'),
    ])
    const botA = await ctx.agentTeams.createBot(lead, {
      displayName: 'Bind A',
      modelSelection: { provider: 'mock', model: 'bind-a' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botA.id)
    const botB = await ctx.agentTeams.createBot(lead, {
      displayName: 'Bind B',
      modelSelection: { provider: 'mock', model: 'bind-b' },
      signal: SIGNAL,
    })
    await waitNoAgent(ctx, botB.id)

    const thinPackBody = 'Follow the MzM thin-pack playbook for Pass.'
    ctx.provide('skills', {
      async list() {
        return [{
          name: 'mzm-thin-pack',
          description: 'MzM thin pack — single managed skill for Phase 3 Skills UX Pass.',
          source: 'bundled',
        }]
      },
      async get(name: string) {
        if (name !== 'mzm-thin-pack') return undefined
        return {
          name: 'mzm-thin-pack',
          description: 'MzM thin pack — single managed skill for Phase 3 Skills UX Pass.',
          source: 'bundled',
          content: thinPackBody,
        }
      },
      register() {
        return () => {}
      },
    })

    await ctx.agentTeams.attachSkill(lead, {
      botId: botA.id,
      skillId: 'mzm-thin-pack',
      signal: SIGNAL,
    })

    const followUp = await ctx.agentTeams.sendMessage(lead, {
      target: botA.name,
      content: content('second turn with skill bind'),
      signal: SIGNAL,
    })
    expect(followUp.status).toBe('accepted')
    const liveA = await waitRunning(ctx, botA.id)
    // Cold resume resolves catalog bodies onto the skill bind asynchronously.
    await vi.waitFor(async () => {
      const promptA = renderPrompt(await ctx.systemPrompt.assemble(assembleContextFor(liveA)))
      expect(promptA).toContain(thinPackBody)
    }, { timeout: 5_000 })

    // Bot B must not gain A's skill body solely from A's attach (SC-006).
    const wakeB = await ctx.agentTeams.sendMessage(lead, {
      target: botB.name,
      content: content('wake peer without attachment'),
      signal: SIGNAL,
    })
    expect(wakeB.status).toBe('accepted')
    const liveB = await waitRunning(ctx, botB.id)
    const promptB = renderPrompt(await ctx.systemPrompt.assemble(assembleContextFor(liveB)))
    expect(promptB).not.toContain(thinPackBody)
    await waitNoAgent(ctx, botA.id)
    await waitNoAgent(ctx, botB.id)
  })

  it('projects Host skill catalog with mzm-thin-pack managed + user skills (T015)', async () => {
    const { ctx, lead } = await setup([])
    await expect(ctx.agentTeams.listSkills(lead, SIGNAL))
      .rejects.toThrow(/skill catalog is unavailable/)
    await expect(ctx.agentTeams.remoteListSkills(lead, SIGNAL)).resolves.toEqual({
      ok: false,
      error: {
        code: 'team-rejected',
        message: 'skill catalog is unavailable: Host skills registry is not mounted',
      },
    })

    // Stub Host `ctx.skills` (Desktop mounts real dsh-skill + thin-pack; agent-team only projects).
    const hostSkills = {
      async list() {
        return [
          {
            name: 'mzm-thin-pack',
            description: 'MzM thin pack — single managed skill for Phase 3 Skills UX Pass.',
            source: 'bundled',
          },
          {
            name: 'my-playbook',
            description: 'User authored playbook',
            source: 'user-dsh',
          },
        ]
      },
    }
    ctx.provide('skills', hostSkills)

    const catalog = await ctx.agentTeams.listSkills(lead, SIGNAL)
    expect(catalog).toEqual([
      expect.objectContaining({
        id: 'mzm-thin-pack',
        displayName: 'MzM thin pack',
        source: 'managed',
      }),
      expect.objectContaining({
        id: 'my-playbook',
        displayName: 'User authored playbook',
        source: 'user',
      }),
    ])
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.skills).toEqual(catalog)
    const remote = await ctx.agentTeams.remoteListSkills(lead, SIGNAL)
    expect(remote).toEqual({ ok: true, value: { skills: catalog } })
  })

  it('excludes office bundled skills from listSkills so Pass managed count is one (T032)', async () => {
    const { ctx, lead } = await setup([])
    ctx.provide('skills', {
      async list() {
        return [
          {
            name: 'mzm-thin-pack',
            description: 'MzM thin pack — single managed skill for Phase 3 Skills UX Pass.',
            source: 'bundled',
          },
          { name: 'office-docx', description: 'Office Word', source: 'bundled' },
          { name: 'office-pptx', description: 'Office PowerPoint', source: 'bundled' },
          { name: 'office-xlsx', description: 'Office Excel', source: 'bundled' },
          {
            name: 'my-playbook',
            description: 'User authored playbook',
            source: 'user-dsh',
          },
        ]
      },
    })

    const catalog = await ctx.agentTeams.listSkills(lead, SIGNAL)
    expect(catalog.filter(skill => skill.source === 'managed')).toEqual([
      expect.objectContaining({ id: 'mzm-thin-pack', source: 'managed' }),
    ])
    expect(catalog.map(skill => skill.id)).toEqual(['mzm-thin-pack', 'my-playbook'])
    const view = await ctx.agentTeams.remoteView(lead, SIGNAL)
    expect(view.skills.filter(skill => skill.source === 'managed')).toHaveLength(1)
  })

  it('preserves Team task rejections and propagates unexpected failures', async () => {
    const { ctx, lead } = await setup([])
    const createRequest = {
      subject: 'Remote task', description: 'Rejected task', blockedBy: [], writeScopes: [],
    }
    const request = { taskId: TeamTaskId('task-1'), expectedRevision: 1, action: 'delete' as const }
    vi.spyOn(ctx.agentTeams, 'createTask')
      .mockRejectedValueOnce(new TeamError('invalid task', 'TEAM_TASK_INVALID'))
      .mockRejectedValueOnce(new Error('unexpected creation failure'))
    vi.spyOn(ctx.agentTeams, 'updateTask')
      .mockRejectedValueOnce(new TeamError('stale', 'TEAM_TASK_STALE_REVISION'))
      .mockRejectedValueOnce(new TeamError('denied', 'TEAM_TASK_FORBIDDEN'))
      .mockRejectedValueOnce(new Error('unexpected mutation failure'))

    await expect(ctx.agentTeams.remoteCreateTask(lead, createRequest)).resolves.toEqual({
      ok: false,
      error: { code: 'team-rejected', message: 'invalid task' },
    })
    await expect(ctx.agentTeams.remoteCreateTask(lead, createRequest))
      .rejects.toThrow('unexpected creation failure')
    await expect(ctx.agentTeams.remoteUpdateTask(lead, request)).resolves.toEqual({
      ok: false,
      error: { code: 'team-task-conflict', message: 'stale' },
    })
    await expect(ctx.agentTeams.remoteUpdateTask(lead, request)).resolves.toEqual({
      ok: false,
      error: { code: 'team-rejected', message: 'denied' },
    })
    await expect(ctx.agentTeams.remoteUpdateTask(lead, request)).rejects.toThrow('unexpected mutation failure')
  })
})

describe('Team mailbox and waiting', () => {
  it('steers a message addressed to the Lead and checkpoints its receipt', async () => {
    const { ctx, lead } = await setup(['hang'])
    const message: TeamMessageSnapshot = {
      id: TeamMessageId('steer-lead-message'),
      senderId: SessionId('team-worker'),
      senderName: 'worker',
      targetId: lead.id,
      content: content('progress report'),
    }
    lead.session.append('team/message/queued', {
      version: 2,
      teamId: TeamId(lead.id),
      message,
    })

    await expect(teamInternals(ctx).mailbox.tryDispatch(lead, message, SIGNAL)).resolves.toBe(true)
    expect(lead.session.snapshotEvents().some(event => event.type === 'agent/inbox/spliced'
      && event.data.inserted.some(input => input.source.kind === 'team-message'
        && input.source.messageId === message.id))).toBe(true)
    expect(durable(lead).pendingMessages).toEqual([])
    lead.cancel({ kind: 'parent' })
    await lead.whenIdle()
  })

  it('acknowledges steered messages persisted by a busy Lead before model claim', async () => {
    const { ctx, lead, teamFiber } = await setup(['hang', 'hang'], { maxPendingMessagesPerMember: 1 })
    const started = await spawn(ctx, lead, 'lead-reporter')
    const reporter = await waitRunning(ctx, started.member.id)
    lead.followup(createUserMessage({ content: content('keep the Lead busy'), source: { kind: 'user' } }))
    await waitRunning(ctx, lead.id)

    const first = await ctx.agentTeams.sendMessage(reporter, {
      target: 'lead', content: content('first progress report'), signal: SIGNAL,
    })
    const second = await ctx.agentTeams.sendMessage(reporter, {
      target: 'lead', content: content('second progress report'), signal: SIGNAL,
    })
    expect([first.status, second.status]).toEqual(['accepted', 'accepted'])
    expect(lead.status).toBe('running')
    expect(durable(lead).pendingMessages).toEqual([])

    const messageIds = new Set([first.messageId, second.messageId])
    const persisted = await storedEvents(ctx, lead.id)
    const receiptOrder = persisted.flatMap((event) => {
      if (event.type === 'agent/inbox/spliced' && event.data.inserted.some(message =>
        message.source.kind === 'team-message' && messageIds.has(message.source.messageId))) {
        return ['agent/inbox/spliced']
      }
      if (event.type === 'team/message/delivered' && messageIds.has(event.data.messageId)) {
        return ['team/message/delivered']
      }
      return []
    })
    expect(receiptOrder).toEqual([
      'agent/inbox/spliced',
      'team/message/delivered',
      'agent/inbox/spliced',
      'team/message/delivered',
    ])

    const receiptCount = lead.session.snapshotEvents().filter(event => event.type === 'agent/inbox/spliced'
      && event.data.inserted.some(message => message.source.kind === 'team-message'
        && messageIds.has(message.source.messageId))).length
    await teamFiber.dispose()
    await ctx.plugin(TeamService, { maxPendingMessagesPerMember: 1 })
    await vi.waitFor(() => { expect(durable(lead).pendingMessages).toEqual([]) })
    expect(lead.session.snapshotEvents().filter(event => event.type === 'agent/inbox/spliced'
      && event.data.inserted.some(message => message.source.kind === 'team-message'
        && messageIds.has(message.source.messageId)))).toHaveLength(receiptCount)

    lead.cancel({ kind: 'parent' })
    await lead.whenIdle()
  })

  it('flushes a live pending receipt before acknowledgement without inserting a duplicate', async () => {
    const { ctx, lead } = await setup(['hang'])
    const started = await spawn(ctx, lead, 'pending-target')
    const target = await waitRunning(ctx, started.member.id)
    const immediate = await ctx.agentTeams.sendMessage(lead, {
      target: 'pending-target',
      content: content('live steer receipt'),
      signal: SIGNAL,
    })
    expect(immediate.status).toBe('accepted')
    expect(durable(lead).pendingMessages).toEqual([])
    expect(target.inbox.nextStep.some(item => item.source.kind === 'team-message'
      && item.source.messageId === immediate.messageId)).toBe(true)

    const message: TeamMessageSnapshot = {
      id: TeamMessageId('live-pending-message'),
      senderId: lead.id,
      senderName: 'lead',
      targetId: target.id,
      content: content('durable pending receipt'),
    }
    lead.session.append('team/message/queued', {
      version: 2,
      teamId: TeamId(lead.id),
      message,
    })
    await ctx.sessions.flush(lead.session)
    target.inject(createUserMessage({
      content: content('durable pending receipt'),
      source: {
        kind: 'team-message',
        teamId: TeamId(lead.id),
        messageId: message.id,
        senderId: lead.id,
        senderName: 'lead',
      },
    }))

    const flush = ctx.sessions.flush.bind(ctx.sessions)
    const flushed: SessionId[] = []
    const flushSpy = vi.spyOn(ctx.sessions, 'flush').mockImplementation(async (session) => {
      flushed.push(session.id)
      return flush(session)
    })
    const delivered = await teamInternals(ctx).mailbox.tryDispatch(lead, message, SIGNAL)

    expect(delivered).toBe(true)
    expect(flushed.slice(0, 2)).toEqual([target.id, lead.id])
    expect(target.inbox.nextStep.filter(item => item.source.kind === 'team-message'
      && item.source.messageId === message.id)).toHaveLength(1)
    expect(durable(lead).pendingMessages).toEqual([])

    const disappearing: TeamMessageSnapshot = {
      ...message,
      id: TeamMessageId('disappearing-pending-message'),
      content: content('canceled before checkpoint'),
    }
    lead.session.append('team/message/queued', {
      version: 2,
      teamId: TeamId(lead.id),
      message: disappearing,
    })
    await flush(lead.session)
    const disappearingInput = createUserMessage({
      content: content('canceled before checkpoint'),
      source: {
        kind: 'team-message',
        teamId: TeamId(lead.id),
        messageId: disappearing.id,
        senderId: lead.id,
        senderName: 'lead',
      },
    })
    target.inject(disappearingInput)
    flushSpy.mockImplementationOnce(async (session) => {
      target.inbox.remove(disappearingInput.id)
      return flush(session)
    })
    await expect(teamInternals(ctx).mailbox.tryDispatch(lead, disappearing, SIGNAL)).resolves.toBe(false)
    expect(durable(lead).pendingMessages.map(pending => pending.id)).toEqual([disappearing.id])

    ctx.agentTeams.interrupt(lead, 'pending-target')
    target.cancel({ kind: 'parent' })
    await waitNoAgent(ctx, target.id)
  })

  it('acknowledges steered messages accepted by a busy target inbox', async () => {
    const { ctx, lead } = await setup(['hang'], { maxPendingMessagesPerMember: 1 })
    const started = await spawn(ctx, lead, 'busy-target')
    const target = await waitRunning(ctx, started.member.id)
    const flush = ctx.sessions.flush.bind(ctx.sessions)
    const flushed: SessionId[] = []
    vi.spyOn(ctx.sessions, 'flush').mockImplementation(async (session) => {
      flushed.push(session.id)
      return flush(session)
    })

    const first = await ctx.agentTeams.sendMessage(lead, {
      target: 'busy-target', content: content('first steered message'), signal: SIGNAL,
    })

    expect(first.status).toBe('accepted')
    expect(flushed).toEqual([lead.id, target.id, lead.id])
    expect(durable(lead).pendingMessages).toEqual([])
    expect(target.inbox.nextStep.some(message => message.source.kind === 'team-message'
      && message.source.messageId === first.messageId)).toBe(true)

    flushed.length = 0
    const second = await ctx.agentTeams.sendMessage(lead, {
      target: 'busy-target', content: content('second steered message'), signal: SIGNAL,
    })

    expect(second.status).toBe('accepted')
    expect(flushed).toEqual([lead.id, target.id, lead.id])
    expect(durable(lead).pendingMessages).toEqual([])
    expect(target.inbox.nextStep.filter(message => message.source.kind === 'team-message'
      && (message.source.messageId === first.messageId || message.source.messageId === second.messageId)))
      .toHaveLength(2)

    ctx.agentTeams.interrupt(lead, 'busy-target')
    target.cancel({ kind: 'parent' })
    await waitNoAgent(ctx, target.id)
  })

  it('serializes concurrent Steer delivery admission for one target', async () => {
    const { ctx, lead } = await setup(['hang'])
    const started = await spawn(ctx, lead, 'ordered-target')
    const target = await waitRunning(ctx, started.member.id)
    const entered = Promise.withResolvers<undefined>()
    const release = Promise.withResolvers<undefined>()
    const admitted: string[] = []
    vi.spyOn(ctx.subagents as unknown as HostPromptDeliverer, deliverSubagentPrompt)
      .mockImplementation(async (_parent, _childId, blocks, source) => {
        const last = blocks.at(-1)
        const text = last?.type === 'text' ? last.text : ''
        admitted.push(text)
        if (text === 'first steer') {
          entered.resolve(undefined)
          await release.promise
        }
        const input = createUserMessage({ content: blocks, source })
        target.inject(input)
        return input.id
      })

    const first = ctx.agentTeams.sendMessage(lead, {
      target: 'ordered-target', content: content('first steer'), signal: SIGNAL,
    })
    await entered.promise
    let secondSettled = false
    const second = ctx.agentTeams.sendMessage(lead, {
      target: 'ordered-target', content: content('second steer'), signal: SIGNAL,
    }).finally(() => { secondSettled = true })
    await vi.waitFor(() => { expect(durable(lead).pendingMessages).toHaveLength(2) })
    expect(admitted).toEqual(['first steer'])
    expect(secondSettled).toBe(false)

    release.resolve(undefined)
    await expect(Promise.all([first, second])).resolves.toMatchObject([
      { status: 'accepted' },
      { status: 'accepted' },
    ])
    expect(admitted).toEqual(['first steer', 'second steer'])

    ctx.agentTeams.interrupt(lead, 'ordered-target')
    target.cancel({ kind: 'parent' })
    await waitNoAgent(ctx, target.id)
  })

  it('delivers persisted mail before the later message that cold-resumes its target', async () => {
    const { ctx, lead } = await setup([textResponse('target initial'), 'hang', 'hang'])
    const started = await spawn(ctx, lead, 'reordered-target')
    await waitNoAgent(ctx, started.member.id)
    const earlier: TeamMessageSnapshot = {
      id: TeamMessageId('earlier-message'),
      senderId: lead.id,
      senderName: 'lead',
      targetId: started.member.id,
      content: content('earlier steer'),
    }
    lead.session.append('team/message/queued', {
      version: 2,
      teamId: TeamId(lead.id),
      message: earlier,
    })
    await ctx.sessions.flush(lead.session)

    const later = await ctx.agentTeams.sendMessage(lead, {
      target: 'reordered-target', content: content('later steer'), signal: SIGNAL,
    })
    expect(later.status).toBe('accepted')
    const target = await waitRunning(ctx, started.member.id)
    await vi.waitFor(() => {
      const accepted = target.session.snapshotEvents().flatMap(event => event.type === 'agent/inbox/spliced'
        ? event.data.inserted.flatMap(message => message.source.kind === 'team-message'
          ? [message.source.messageId]
          : [])
        : [])
      expect(accepted).toEqual([earlier.id, later.messageId])
    })

    ctx.agentTeams.interrupt(lead, 'reordered-target')
    target.cancel({ kind: 'parent' })
    await waitNoAgent(ctx, target.id)
  })

  it('deduplicates live target history and contains inspection and delivery failures', async () => {
    const { ctx, lead } = await setup(['hang', textResponse('inactive target initial')])
    const liveStarted = await spawn(ctx, lead, 'live-target')
    const live = await waitRunning(ctx, liveStarted.member.id)
    const internal = teamInternals(ctx).mailbox
    const message: TeamMessageSnapshot = {
      id: TeamMessageId('live-recorded-message'),
      senderId: lead.id,
      senderName: 'lead',
      targetId: live.id,
      content: content('already in live history'),
    }
    lead.session.append('team/message/queued', {
      version: 2, teamId: TeamId(lead.id), message,
    })
    await ctx.sessions.flush(lead.session)
    live.session.append('user/message', createUserMessage({
      content: content('different Team message first'),
      source: {
        kind: 'team-message',
        teamId: TeamId(lead.id),
        messageId: TeamMessageId('other-message'),
        senderId: lead.id,
        senderName: 'lead',
      },
    }), { surfaceOp: 'append' })
    live.session.append('user/message', createUserMessage({
      content: content('already in live history'),
      source: {
        kind: 'team-message',
        teamId: TeamId(lead.id),
        messageId: message.id,
        senderId: lead.id,
        senderName: 'lead',
      },
    }), { surfaceOp: 'append' })
    await expect(internal.tryDispatch(lead, message, SIGNAL)).resolves.toBe(true)
    await internal.markDelivered(lead, message.id, live.id)
    await expect(internal.tryDispatch(lead, message, SIGNAL)).resolves.toBe(true)

    const wrongTarget: TeamMessageSnapshot = {
      ...message,
      id: TeamMessageId('wrong-target-message'),
    }
    lead.session.append('team/message/queued', {
      version: 2, teamId: TeamId(lead.id), message: wrongTarget,
    })
    await ctx.sessions.flush(lead.session)
    await internal.markDelivered(lead, wrongTarget.id, SessionId('wrong-target'))
    await expect(internal.serializeDispatch(wrongTarget, async () => true)).resolves.toBe(true)
    const serialEntered = Promise.withResolvers<undefined>()
    const releaseSerial = Promise.withResolvers<undefined>()
    const serialFirst = internal.serializeDispatch(wrongTarget, async () => {
      serialEntered.resolve(undefined)
      await releaseSerial.promise
      return true
    })
    await serialEntered.promise
    const serialSecond = internal.serializeDispatch({
      ...wrongTarget, id: TeamMessageId('second-serialized-message'),
    }, async () => true)
    releaseSerial.resolve(undefined)
    await expect(Promise.all([serialFirst, serialSecond])).resolves.toEqual([true, true])

    const warnings: string[] = []
    ctx.logger.warn = ((value: unknown) => { warnings.push(String(value)) }) as typeof ctx.logger.warn
    const failedAck = vi.spyOn(ctx.sessions, 'flush').mockRejectedValueOnce(new Error('acknowledgement flush failed'))
    live.session.append('user/message', createUserMessage({
      content: content('acknowledgement failure'),
      source: {
        kind: 'team-message',
        teamId: TeamId(lead.id),
        messageId: wrongTarget.id,
        senderId: lead.id,
        senderName: 'lead',
      },
    }), { surfaceOp: 'append' })
    await vi.waitFor(() => {
      expect(warnings.some(warning => warning.includes('acknowledgement flush failed'))).toBe(true)
    })
    failedAck.mockRestore()

    const inactiveStarted = await spawn(ctx, lead, 'inactive-target')
    await waitNoAgent(ctx, inactiveStarted.member.id)
    const openRead = vi.spyOn(ctx.sessionPersistence, 'open').mockRejectedValueOnce(new Error('read unavailable'))
    const uncertain = await ctx.agentTeams.sendMessage(lead, {
      target: 'inactive-target', content: content('inspection failure'), signal: SIGNAL,
    })
    expect(uncertain.status).toBe('queued')
    openRead.mockRestore()

    vi.spyOn(ctx.subagents as unknown as HostPromptDeliverer, deliverSubagentPrompt)
      .mockRejectedValueOnce(new Error('delivery unavailable'))
    const failed = await ctx.agentTeams.sendMessage(lead, {
      target: 'inactive-target', content: content('delivery failure'), signal: SIGNAL,
    })
    expect(failed.status).toBe('queued')
    expect(warnings.some(warning => warning.includes('read unavailable'))).toBe(true)
    expect(warnings.some(warning => warning.includes('delivery unavailable'))).toBe(true)

    ctx.agentTeams.interrupt(lead, 'live-target')
    await waitNoAgent(ctx, live.id)
  })

  it('cold-resumes an inactive sibling with sender attribution', async () => {
    const { ctx, lead } = await setup(['hang', 'hang'])
    const alphaStarted = await spawn(ctx, lead, 'alpha')
    const alpha = await waitRunning(ctx, alphaStarted.member.id)
    const betaStarted = await spawn(ctx, lead, 'beta')
    const beta = await waitRunning(ctx, betaStarted.member.id)
    ctx.agentTeams.interrupt(lead, 'beta')
    await waitNoAgent(ctx, beta.id)

    const first = await ctx.agentTeams.sendMessage(alpha, {
      target: 'beta', content: content('first update'), signal: SIGNAL,
    })
    expect(first.status).toBe('accepted')
    await waitNoAgent(ctx, betaStarted.member.id)
    await vi.waitFor(() => { expect(durable(lead).pendingMessages).toEqual([]) })

    const stored = await storedEvents(ctx, betaStarted.member.id)
    const peerMessages = stored.filter(event => event.type === 'user/message'
      && event.data.source.kind === 'team-message')
    expect(peerMessages.map((event) => {
      if (event.type !== 'user/message') return undefined
      const block = event.data.content.at(-1)
      return block?.type === 'text' ? block.text : undefined
    })).toEqual(['first update'])
    expect(peerMessages.map(event => event.type === 'user/message'
      ? event.data.content[0]?.type === 'text' && event.data.content[0].text
      : undefined)).toEqual([
      expect.stringMatching(/^Team message .* from alpha:$/u),
    ])
    expect(peerMessages.map(event => event.type === 'user/message' && event.data.source.kind === 'team-message'
      ? [event.data.source.messageId, event.data.source.senderName]
      : undefined)).toEqual([
      [first.messageId, 'alpha'],
    ])

    ctx.agentTeams.interrupt(lead, 'alpha')
    await waitNoAgent(ctx, alpha.id)
  })

  it('enforces message byte and pending-count limits without encouraging retry after enqueue', async () => {
    const { ctx, lead } = await setup([textResponse('idle')], {
      maxMessageBytes: 256,
      maxPendingMessagesPerMember: 1,
    })
    const target = await spawn(ctx, lead, 'target')
    await waitNoAgent(ctx, target.member.id)
    await expect(ctx.agentTeams.sendMessage(lead, {
      target: 'target', content: content('x'.repeat(300)), signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_MESSAGE_TOO_LARGE' })
    vi.spyOn(ctx.sessionPersistence, 'open').mockRejectedValueOnce(new Error('temporary read failure'))
    const queued = await ctx.agentTeams.sendMessage(lead, {
      target: 'target', content: content('one'), signal: SIGNAL,
    })
    expect(queued.status).toBe('queued')
    await expect(ctx.agentTeams.sendMessage(lead, {
      target: 'target', content: content('two'), signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_MAILBOX_FULL' })
    await expect(ctx.agentTeams.sendMessage(lead, {
      target: 'lead', content: content('self'), signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_SELF_MESSAGE' })
    await expect(ctx.agentTeams.sendMessage(lead, {
      target: 'missing', content: content('unknown target'), signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_MEMBER_NOT_FOUND' })
    const controller = new AbortController()
    controller.abort(new TeamError('cancelled before queue', 'TEST_CANCELLED'))
    await expect(ctx.agentTeams.sendMessage(lead, {
      target: 'target', content: content('cancelled'), signal: controller.signal,
    })).rejects.toMatchObject({ code: 'TEST_CANCELLED' })
  })

  it('interrupts only the current turn and retains an already accepted follow-up', async () => {
    const { ctx, lead } = await setup(['hang', textResponse('after interrupt')])
    const started = await spawn(ctx, lead, 'worker')
    const worker = await waitRunning(ctx, started.member.id)
    const followup = await ctx.agentTeams.sendMessage(lead, {
      target: 'worker', content: content('retained follow-up'), signal: SIGNAL,
    })
    expect(followup.status).toBe('accepted')
    expect(ctx.agentTeams.interrupt(lead, 'worker')).toEqual({ previousStatus: 'running' })
    await vi.waitFor(() => { expect(worker.status).toBe('idle') })
    expect(worker.inbox.nextStep.some(message => message.source.kind === 'team-message'
      && message.source.messageId === followup.messageId)).toBe(true)
    worker.cancel({ kind: 'parent' })
    await waitNoAgent(ctx, worker.id)
  })

  it('waits for one change, supports cancellation, times out, and releases waiters on HMR disposal', async () => {
    const ctx = new Context()
    await mountAgentLoopTestDependencies(ctx)
    const storageRoot = mkdtempSync(join(tmpdir(), 'dsh-team-wait-'))
    roots.push(storageRoot)
    await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
    await ctx.plugin(AgentLoop, { agents: [] })
    await ctx.plugin(SubagentService)
    const fiber = await ctx.plugin(TeamService)
    const service = ctx.agentTeams
    const lead = await ctx.agentLoop.create(SessionId('wait-lead'), {})

    await expect(service.waitForChange(lead, 9_999, SIGNAL))
      .rejects.toMatchObject({ code: 'TEAM_INVALID_TIMEOUT' })
    const alreadyAborted = new AbortController()
    alreadyAborted.abort(new TeamError('cancelled before wait', 'TEST_CANCELLED'))
    await expect(service.waitForChange(lead, 10_000, alreadyAborted.signal))
      .rejects.toMatchObject({ code: 'TEST_CANCELLED' })

    const changed = service.waitForChange(lead, 10_000, SIGNAL)
    const flush = ctx.sessions.flush.bind(ctx.sessions)
    const flushEntered = Promise.withResolvers<undefined>()
    const releaseFlush = Promise.withResolvers<undefined>()
    vi.spyOn(ctx.sessions, 'flush').mockImplementationOnce(async (session) => {
      flushEntered.resolve(undefined)
      await releaseFlush.promise
      return await flush(session)
    })
    let waitSettled = false
    void changed.finally(() => { waitSettled = true })
    const creating = service.createTask(lead, { subject: 'wake', description: 'wake waiter' })
    await flushEntered.promise
    expect(waitSettled).toBe(false)
    releaseFlush.resolve(undefined)
    await creating
    await expect(changed).resolves.toEqual({ timedOut: false })

    const controller = new AbortController()
    const cancelled = service.waitForChange(lead, 10_000, controller.signal)
    controller.abort(new TeamError('cancelled', 'TEST_CANCELLED'))
    await expect(cancelled).rejects.toMatchObject({ code: 'TEST_CANCELLED' })

    const stringAbort = new AbortController()
    const firstWaiter = service.waitForChange(lead, 10_000, stringAbort.signal)
    const secondWaiter = service.waitForChange(lead, 10_000, SIGNAL)
    stringAbort.abort('string cancellation')
    await expect(firstWaiter).rejects.toMatchObject({
      code: 'TEAM_WAIT_ABORTED',
      message: 'wait_agent aborted: string cancellation',
    })
    await service.createTask(lead, { subject: 'second waiter', description: 'second waiter remains registered' })
    await expect(secondWaiter).resolves.toEqual({ timedOut: false })

    const objectAbort = new AbortController()
    const objectCancelled = service.waitForChange(lead, 10_000, objectAbort.signal)
    objectAbort.abort({ kind: 'user' })
    await expect(objectCancelled).rejects.toMatchObject({
      code: 'TEAM_WAIT_ABORTED',
      message: "wait_agent aborted: { kind: 'user' }",
    })

    await service.createTask(lead, { subject: 'already changed', description: 'edge-triggered wait' })
    vi.useFakeTimers()
    const timeout = service.waitForChange(lead, 10_000, SIGNAL)
    await vi.advanceTimersByTimeAsync(10_000)
    await expect(timeout).resolves.toEqual({ timedOut: true })
    vi.useRealTimers()

    const disposed = service.waitForChange(lead, 10_000, SIGNAL)
    await fiber.dispose()
    await expect(disposed).resolves.toEqual({ timedOut: false })
    expect(ctx.get('agentTeams')).toBeUndefined()
  })

  it('disposes live teammate Activations and their waits when the Team service unloads', async () => {
    const { ctx, lead, teamFiber } = await setup(['hang'])
    const started = await spawn(ctx, lead, 'dispose-worker')
    await waitRunning(ctx, started.member.id)
    const waiting = ctx.agentTeams.waitForChange(lead, 10_000, SIGNAL)

    await teamFiber.dispose()

    await expect(waiting).resolves.toEqual({ timedOut: false })
    expect(ctx.agents.get(started.member.id)).toBeUndefined()
    expect(ctx.get('agentTeams')).toBeUndefined()
  })

  it('closes creation admission and drains an in-flight spawn before unload completes', async () => {
    const { ctx, lead, teamFiber } = await setup(['hang'])
    const service = ctx.agentTeams
    const start = ctx.subagents.startContinuable.bind(ctx.subagents)
    const entered = Promise.withResolvers<undefined>()
    const release = Promise.withResolvers<undefined>()
    let childId: SessionId | undefined
    vi.spyOn(ctx.subagents, 'startContinuable').mockImplementation(async (spec) => {
      childId = spec.childId
      entered.resolve(undefined)
      await release.promise
      return start(spec)
    })
    const spawning = spawn(ctx, lead, 'disposing-worker')
    const rejected = expect(spawning).rejects.toMatchObject({ code: 'TEAM_DISPOSED' })
    await entered.promise

    const disposal = teamFiber.dispose()
    await Promise.resolve()
    await expect(service.waitForChange(lead, 3_600_000, SIGNAL)).resolves.toEqual({ timedOut: false })
    await expect(service.spawnTeammate(lead, {
      name: 'late-worker',
      description: 'must not enter after disposal',
      prompt: content('late task'),
      context: 'fresh',
      provider: 'spawn',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_DISPOSED' })
    release.resolve(undefined)

    await rejected
    await disposal
    if (childId !== undefined) expect(ctx.agents.get(childId)).toBeUndefined()
    expect(ctx.get('agentTeams')).toBeUndefined()
  })

  it('retains an in-flight creation cleanup failure during disposal', async () => {
    const { ctx } = await setup([])
    const internal = teamInternals(ctx)
    const cleanupFailure = new Error('creation cleanup failed')
    const rejected = Promise.reject(cleanupFailure)
    void rejected.catch(() => undefined)
    internal.roster.inFlightCreations.add(rejected)

    await expect(internal.disposeRuntime()).rejects.toMatchObject({ errors: [cleanupFailure] })
  })

  it('recognizes wrapped and coded runtime cancellation during disposal settlement', async () => {
    const open = new TeamRuntimeLifecycle(100)
    const ordinaryFailure = new Error('ordinary failure before disposal')
    const openFailures: unknown[] = []
    await open.settle([Promise.reject(ordinaryFailure)], openFailures)
    expect(openFailures).toEqual([ordinaryFailure])

    const lifecycle = new TeamRuntimeLifecycle(100)
    lifecycle.close()
    const failures: unknown[] = []
    await lifecycle.settle([
      Promise.reject(new Error('wrapped cancellation', { cause: lifecycle.reason })),
      Promise.reject(new TeamError('translated cancellation', 'TEAM_DISPOSED')),
    ], failures)
    expect(failures).toEqual([])

    const cyclic = new Error('unrelated cyclic failure')
    cyclic.cause = cyclic
    await lifecycle.settle([Promise.reject(cyclic)], failures)
    expect(failures).toEqual([cyclic])
  })

  it('disposes a live child even after its durable member edge becomes failed', async () => {
    const { ctx, lead } = await setup(['hang'])
    const childId = SessionId('failed-live-child')
    const member = {
      id: childId,
      name: 'failed-live-worker',
      description: 'failed-live-worker responsibility',
      provider: 'spawn',
      context: 'fresh' as const,
      phase: 'provisioning' as const,
    }
    lead.session.append('team/member', {
      version: 2,
      teamId: TeamId(lead.id),
      member,
    })
    await ctx.subagents.startContinuable({
      childId,
      provider: 'spawn',
      label: member.description,
      request: { prompt: content('failed child task'), parent: lead },
      signal: SIGNAL,
    })
    await waitRunning(ctx, childId)
    lead.session.append('team/member', {
      version: 2,
      teamId: TeamId(lead.id),
      member: {
        ...member,
        phase: 'failed',
        error: 'creation cleanup is pending',
      },
    })
    await ctx.sessions.flush(lead.session)
    expect(ctx.agentTeams.listMembers(lead)[1]?.status).toBe('failed')

    const internal = ctx.agentTeams as unknown as { disposeRuntime(): Promise<void> }
    await internal.disposeRuntime()
    expect(ctx.agents.get(childId)).toBeUndefined()
  })

  it('aborts and awaits an admitted cold mailbox dispatch during disposal', async () => {
    const { ctx, lead } = await setup([textResponse('worker done')])
    const started = await spawn(ctx, lead, 'mailbox-worker')
    await waitNoAgent(ctx, started.member.id)
    const entered = Promise.withResolvers<undefined>()
    const aborted = Promise.withResolvers<undefined>()
    const release = Promise.withResolvers<undefined>()
    vi.spyOn(ctx.subagents as unknown as HostPromptDeliverer, deliverSubagentPrompt)
      .mockImplementation(async (_parent, _childId, _content, _source, signal) => {
        entered.resolve(undefined)
        return await new Promise<never>((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            aborted.resolve(undefined)
            void release.promise.then(() => {
              const reason: unknown = signal.reason
              reject(reason instanceof Error ? reason : new Error(String(reason)))
            })
          }, { once: true })
        })
      })

    const sending = ctx.agentTeams.sendMessage(lead, {
      target: 'mailbox-worker',
      content: content('resume during disposal'),
      signal: SIGNAL,
    })
    await entered.promise
    const internal = ctx.agentTeams as unknown as { disposeRuntime(): Promise<void> }
    let disposed = false
    const disposal = internal.disposeRuntime().then(() => { disposed = true })
    await aborted.promise
    await Promise.resolve()
    expect(disposed).toBe(false)
    release.resolve(undefined)

    await expect(sending).resolves.toMatchObject({ status: 'queued' })
    await disposal
    expect(disposed).toBe(true)
    expect(ctx.agents.get(started.member.id)).toBeUndefined()
  })

  it('awaits an admitted asynchronous acknowledgement before disposal completes', async () => {
    const { ctx, lead } = await setup([])
    const message: TeamMessageSnapshot = {
      id: TeamMessageId('dispose-ack-message'),
      senderId: SessionId('sender'),
      senderName: 'sender',
      targetId: lead.id,
      content: content('acknowledge before disposal'),
    }
    lead.session.append('team/message/queued', {
      version: 2,
      teamId: TeamId(lead.id),
      message,
    })
    await ctx.sessions.flush(lead.session)

    const entered = Promise.withResolvers<undefined>()
    const release = Promise.withResolvers<undefined>()
    const flush = ctx.sessions.flush.bind(ctx.sessions)
    let blockReceipt = true
    const flushSpy = vi.spyOn(ctx.sessions, 'flush').mockImplementation(async (session) => {
      if (blockReceipt && session === lead.session) {
        blockReceipt = false
        entered.resolve(undefined)
        await release.promise
      }
      return flush(session)
    })
    lead.session.append('user/message', createUserMessage({
      content: content('acknowledge before disposal'),
      source: {
        kind: 'team-message',
        teamId: TeamId(lead.id),
        messageId: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
      },
    }), { surfaceOp: 'append' })

    const internal = ctx.agentTeams as unknown as { disposeRuntime(): Promise<void> }
    let disposed = false
    const disposal = internal.disposeRuntime().then(() => { disposed = true })
    await entered.promise
    await Promise.resolve()
    const disposedBeforeRelease = disposed
    release.resolve(undefined)
    await disposal

    expect(disposedBeforeRelease).toBe(false)
    expect(disposed).toBe(true)
    expect(durable(lead).pendingMessages).toEqual([])
    flushSpy.mockRestore()
  })

  it('bounds Team runtime disposal when a continuation drain never settles', { timeout: 30_000 }, async () => {
    const { ctx, lead, teamFiber } = await setup(['hang'], { disposalTimeoutMs: 25 })
    const started = await spawn(ctx, lead, 'stuck-worker')
    await waitRunning(ctx, started.member.id)
    const drain = vi.spyOn(ctx.subagents, 'drainContinuableChildren')
      .mockImplementation(() => new Promise(() => {}))

    const outcome = await Promise.race([
      teamFiber.dispose().then(() => 'disposed'),
      new Promise<'hung'>((resolve) => { setTimeout(() => { resolve('hung') }, 1_000) }),
    ])
    expect(outcome).toBe('disposed')
    expect(drain).toHaveBeenCalledWith(lead, [started.member.id])
    expect(ctx.get('agentTeams')).toBeUndefined()
  })

  it('bounds disposal while an admitted creation ignores cancellation', async () => {
    const { ctx, lead } = await setup([], { disposalTimeoutMs: 25 })
    const internal = teamInternals(ctx)
    internal.roster.inFlightCreations.add(new Promise(() => {}))

    await expect(internal.disposeRuntime()).rejects.toBeInstanceOf(AggregateError)
    await expect(ctx.agentTeams.spawnTeammate(lead, {
      name: 'after-timeout',
      description: 'admission remains closed',
      prompt: content('must reject'),
      context: 'fresh',
      provider: 'spawn',
      signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_DISPOSED' })
    await expect(ctx.agentTeams.sendMessage(lead, {
      target: 'nobody', content: content('must reject'), signal: SIGNAL,
    })).rejects.toMatchObject({ code: 'TEAM_DISPOSED' })
    await expect(internal.mailbox.tryDispatch(lead, {
      id: TeamMessageId('post-disposal-message'),
      senderId: lead.id,
      senderName: 'lead',
      targetId: lead.id,
      content: content('must not dispatch'),
    }, SIGNAL)).resolves.toBe(false)
  })

  it('contains recovery callback failures and ignores work scheduled after disposal', async () => {
    const { ctx, lead, teamFiber } = await setup([])
    const warnings: string[] = []
    ctx.logger.warn = ((value: unknown) => { warnings.push(String(value)) }) as typeof ctx.logger.warn
    const internal = teamInternals(ctx)
    internal.recoverFor = async () => { throw new Error('forced recovery failure') }
    internal.scheduleRecovery(lead)
    await Promise.resolve()
    await Promise.resolve()
    expect(warnings.some(warning => warning.includes('forced recovery failure'))).toBe(true)

    lead.session.append('user/message', createUserMessage({
      content: content('orphan Team source'),
      source: {
        kind: 'team-message',
        teamId: TeamId('absent-team'),
        messageId: TeamMessageId('absent-team-message'),
        senderId: SessionId('absent-sender'),
        senderName: 'absent',
      },
    }), { surfaceOp: 'append' })
    await Promise.resolve()

    const entered = Promise.withResolvers<undefined>()
    const release = Promise.withResolvers<undefined>()
    internal.recoverFor = async () => {
      entered.resolve(undefined)
      await release.promise
      throw new Error('failure after disposal')
    }
    internal.scheduleRecovery(lead)
    await entered.promise
    await teamFiber.dispose()
    release.resolve(undefined)
    await Promise.resolve()
    await Promise.resolve()
    internal.scheduleRecovery(lead)
    await Promise.resolve()
  })

  it('reports contained teardown failures without retaining the Team service', async () => {
    const { ctx, lead, teamFiber } = await setup(['hang'])
    const started = await spawn(ctx, lead, 'failing-drain')
    await waitRunning(ctx, started.member.id)
    vi.spyOn(ctx.subagents, 'drainContinuableDescendants').mockRejectedValueOnce(new Error('drain failure'))

    await teamFiber.dispose()
    expect(ctx.get('agentTeams')).toBeUndefined()
  })

  it('reconciles mismatched persisted children and ignores a concurrently settled member', async () => {
    const first = await setup([])
    const liveId = SessionId('live-provisioning-child')
    const live = await first.ctx.agents.create({
      sessionId: liveId,
      meta: { parentSession: first.lead.id },
      agentOptions: { provider: 'mock', model: 'mock' },
    })
    const provisioning = {
      id: liveId,
      name: 'mismatched-child',
      description: 'mismatched persisted child',
      provider: 'spawn',
      context: 'fresh' as const,
      phase: 'provisioning' as const,
    }
    first.lead.session.append('team/member', {
      version: 2, teamId: TeamId(first.lead.id), member: provisioning,
    })
    const reconcileFirst = teamInternals(first.ctx).roster
    await reconcileFirst.reconcileProvisioning(first.lead, SIGNAL)
    expect(durable(first.lead).members[0]?.phase).toBe('provisioning')
    live.agent.session.append('user/message', createUserMessage({
      content: content('persist mismatched child'), source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    await first.ctx.sessions.flush(live.agent.session)
    await live.dispose()
    await reconcileFirst.reconcileProvisioning(first.lead, SIGNAL)
    expect(durable(first.lead).members[0]).toMatchObject({
      phase: 'failed',
      error: 'persisted child Session does not match the provisioned continuation',
    })

    const second = await setup([])
    const childId = SessionId('concurrently-settled-child')
    const member = { ...provisioning, id: childId, name: 'concurrent-child' }
    second.lead.session.append('team/member', {
      version: 2, teamId: TeamId(second.lead.id), member,
    })
    const entered = Promise.withResolvers<undefined>()
    const release = Promise.withResolvers<undefined>()
    vi.spyOn(second.ctx.sessionPersistence, 'open').mockImplementationOnce(async () => {
      entered.resolve(undefined)
      await release.promise
      throw new Error('late inspection failure')
    })
    const reconcileSecond = teamInternals(second.ctx).roster
    const reconciling = reconcileSecond.reconcileProvisioning(second.lead, SIGNAL)
    await entered.promise
    second.lead.session.append('team/member', {
      version: 2,
      teamId: TeamId(second.lead.id),
      member: { ...member, phase: 'failed', error: 'settled elsewhere' },
    })
    release.resolve(undefined)
    await reconciling
    expect(durable(second.lead).members[0]).toMatchObject({
      phase: 'failed', error: 'settled elsewhere',
    })
  })
})
