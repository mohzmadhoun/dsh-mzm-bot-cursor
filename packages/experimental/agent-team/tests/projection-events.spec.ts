import { describe, expect, it } from 'vitest'
import { SESSION_FORMAT_VERSION, SessionId, SessionSeq } from '@deepseek-ai/dsh-session'
import type { SessionEvent, SessionEventMap, SessionEventType } from '@deepseek-ai/dsh-session'
import {
  teamProjectionDefinition,
  projectMemory,
  projectMemories,
  projectRoutine,
  projectRoutines,
  projectSidebarSections,
  projectSkillCatalog,
} from '../src/projection.ts'
import type { TeamProjectionState, TeamState } from '../src/projection.ts'
import { SidebarSectionId, TeamId, TeamMessageId, TeamTaskId, MemoryId, RoutineId } from '../src/types.ts'
import type { TeamMemberSnapshot, TeamMessageSnapshot, TeamTaskSnapshot } from '../src/types.ts'
import { memoryEligibleForBot } from '../src/validation.ts'

const ROOT = SessionId('team-root')
const TEAM = TeamId(ROOT)
const CHILD = SessionId('child-a')

function event<T extends Extract<SessionEventType, `team/${string}`>>(type: T, data: SessionEventMap[T], seq: SessionSeq): SessionEvent<T> {
  return { type, data, seq, time: seq } as unknown as SessionEvent<T>
}

function project(rootId: SessionId, events: readonly SessionEvent[]): TeamProjectionState {
  let state = teamProjectionDefinition.init({
    version: SESSION_FORMAT_VERSION,
    id: rootId,
    createdAt: 0,
    isSeeded: false,
  })
  for (const event of events) state = teamProjectionDefinition.apply(state, event)
  return state
}

function teamState(projected: TeamProjectionState): TeamState {
  if (projected.failure !== undefined) throw new Error(projected.failure)
  return projected
}

function projectTeam(rootId: SessionId, events: readonly SessionEvent[]): TeamState {
  return teamState(project(rootId, events))
}

/** Queued-minus-delivered mail retained by the projection. */
function pending(state: TeamState): TeamMessageSnapshot[] {
  return state.messages.filter(message => !state.delivered.includes(message.id))
}

/** Whether one Team state contains no projected records. */
function isEmptyState(state: TeamState): boolean {
  return state.members.length === 0 && state.sections.length === 0 && state.routines.length === 0
    && state.memories.length === 0
    && state.connectors.length === 0
    && state.tasks.length === 0
    && state.messages.length === 0 && state.delivered.length === 0
}

function member(overrides: Partial<TeamMemberSnapshot> = {}): TeamMemberSnapshot {
  return {
    id: CHILD,
    name: 'worker-a',
    description: 'worker',
    provider: 'spawn',
    context: 'fresh',
    phase: 'provisioning',
    ...overrides,
  }
}

function task(overrides: Partial<TeamTaskSnapshot> = {}): TeamTaskSnapshot {
  return {
    id: TeamTaskId('task-1'),
    revision: 1,
    subject: 'subject',
    description: 'description',
    status: 'pending',
    blockedBy: [],
    writeScopes: [],
    ...overrides,
  }
}

function message(overrides: Partial<TeamMessageSnapshot> = {}): TeamMessageSnapshot {
  return {
    id: TeamMessageId('message-1'),
    senderId: ROOT,
    senderName: 'lead',
    targetId: CHILD,
    content: [{ type: 'text', text: 'hello' }],
    ...overrides,
  }
}

describe('Agent Teams projection events', () => {
  it('projects current-team records independently from inherited records', () => {
    const records: SessionEvent[] = [
      event('team/member', { version: 2, teamId: TeamId('ancestor'), member: member() }, SessionSeq(0)),
      event('team/member', { version: 2, teamId: TEAM, member: member() }, SessionSeq(1)),
      event('team/member', {
        version: 2,
        teamId: TEAM,
        member: member({ phase: 'active' }),
      }, SessionSeq(2)),
      event('team/task', { version: 2, teamId: TEAM, task: task({ id: TeamTaskId('task-7') }) }, SessionSeq(3)),
      event('team/message/queued', { version: 2, teamId: TEAM, message: message() }, SessionSeq(4)),
    ]
    const projected = project(ROOT, records)
    const state = teamState(projected)

    expect(state).toMatchObject({ id: TEAM })
    expect(state.members).toHaveLength(1)
    expect(state.tasks).toHaveLength(1)
    expect(pending(state)).toHaveLength(1)
    expect(state.nextTaskNumber).toBe(8)
    expect(state.members.find(member => member.id === CHILD)?.name).toBe('worker-a')
    expect(teamProjectionDefinition.stateSchema.parse(JSON.parse(JSON.stringify(projected))))
      .toEqual(projected)
  })

  it('persists named sidebar section catalog and rejects empty names', () => {
    const created = event('team/section', {
      version: 2,
      teamId: TEAM,
      section: { id: SidebarSectionId('sec-reviews'), name: 'Reviews' },
    }, SessionSeq(0))
    const renamed = event('team/section', {
      version: 2,
      teamId: TEAM,
      section: { id: SidebarSectionId('sec-reviews'), name: 'Code Reviews' },
    }, SessionSeq(1))
    const state = teamState(project(ROOT, [created, renamed]))
    expect(state.sections).toEqual([
      { id: SidebarSectionId('sec-reviews'), name: 'Code Reviews' },
    ])
    expect(teamProjectionDefinition.stateSchema.parse(JSON.parse(JSON.stringify(project(ROOT, [created, renamed])))))
      .toMatchObject({ sections: [{ id: 'sec-reviews', name: 'Code Reviews' }] })

    expect(() => projectTeam(ROOT, [event('team/section', {
      version: 2,
      teamId: TEAM,
      section: { id: SidebarSectionId('sec-empty'), name: '   ' },
    }, SessionSeq(0))])).toThrow(/name must be non-empty/)
  })

  it('persists Host Routine catalog rows and rejects empty intent', () => {
    const created = event('team/routine', {
      version: 2,
      teamId: TEAM,
      routine: {
        routineId: RoutineId('routine-1'),
        botId: CHILD,
        intent: 'Ping status',
        scheduleExpr: '@every 5m',
        status: 'active',
        lastRunAt: null,
        createdAt: 10,
        updatedAt: 10,
      },
    }, SessionSeq(0))
    const paused = event('team/routine', {
      version: 2,
      teamId: TEAM,
      routine: {
        routineId: RoutineId('routine-1'),
        botId: CHILD,
        intent: 'Ping status',
        scheduleExpr: '@every 5m',
        status: 'paused',
        lastRunAt: null,
        createdAt: 10,
        updatedAt: 20,
      },
    }, SessionSeq(1))
    const state = teamState(project(ROOT, [created, paused]))
    expect(state.routines).toEqual([{
      routineId: RoutineId('routine-1'),
      botId: CHILD,
      intent: 'Ping status',
      scheduleExpr: '@every 5m',
      triggerKind: 'cron',
      status: 'paused',
      lastRunAt: null,
      createdAt: 10,
      updatedAt: 20,
    }])
    expect(() => projectTeam(ROOT, [event('team/routine', {
      version: 2,
      teamId: TEAM,
      routine: {
        routineId: RoutineId('routine-empty'),
        botId: CHILD,
        intent: '   ',
        scheduleExpr: '@every 5m',
        status: 'active',
        lastRunAt: null,
        createdAt: 1,
        updatedAt: 1,
      },
    }, SessionSeq(0))])).toThrow(/intent must be non-empty/)
  })

  it('persists Host Memory catalog rows and enforces layer/botId + non-empty content', () => {
    const agentRow = event('team/memory', {
      version: 2,
      teamId: TEAM,
      memory: {
        memoryId: MemoryId('memory-1'),
        kind: 'profile',
        layer: 'agent',
        botId: CHILD,
        content: 'Prefers UTC',
        createdAt: 10,
        updatedAt: 10,
      },
    }, SessionSeq(0))
    const userRow = event('team/memory', {
      version: 2,
      teamId: TEAM,
      memory: {
        memoryId: MemoryId('memory-2'),
        kind: 'note',
        layer: 'user',
        botId: null,
        content: 'Account fact',
        createdAt: 20,
        updatedAt: 20,
      },
    }, SessionSeq(1))
    const state = teamState(project(ROOT, [agentRow, userRow]))
    expect(state.memories).toEqual([
      {
        memoryId: MemoryId('memory-1'),
        kind: 'profile',
        layer: 'agent',
        botId: CHILD,
        content: 'Prefers UTC',
        createdAt: 10,
        updatedAt: 10,
      },
      {
        memoryId: MemoryId('memory-2'),
        kind: 'note',
        layer: 'user',
        botId: null,
        content: 'Account fact',
        createdAt: 20,
        updatedAt: 20,
      },
    ])
    expect(() => projectTeam(ROOT, [event('team/memory', {
      version: 2,
      teamId: TEAM,
      memory: {
        memoryId: MemoryId('memory-empty'),
        kind: 'log',
        layer: 'user',
        botId: null,
        content: '   ',
        createdAt: 1,
        updatedAt: 1,
      },
    }, SessionSeq(0))])).toThrow(/content must be non-empty/)
    expect(() => projectTeam(ROOT, [event('team/memory', {
      version: 2,
      teamId: TEAM,
      memory: {
        memoryId: MemoryId('memory-agent-nobot'),
        kind: 'log',
        layer: 'agent',
        botId: null,
        content: 'missing bot',
        createdAt: 1,
        updatedAt: 1,
      },
    }, SessionSeq(0))])).toThrow(/agent layer requires botId/)
    expect(() => projectTeam(ROOT, [event('team/memory', {
      version: 2,
      teamId: TEAM,
      memory: {
        memoryId: MemoryId('memory-user-bot'),
        kind: 'log',
        layer: 'user',
        botId: CHILD,
        content: 'user with bot',
        createdAt: 1,
        updatedAt: 1,
      },
    }, SessionSeq(0))])).toThrow(/user layer must not set botId/)
  })

  it('derives named membership and Unassigned without a stored Unassigned row', () => {
    const section = event('team/section', {
      version: 2,
      teamId: TEAM,
      section: { id: SidebarSectionId('sec-reviews'), name: 'Reviews' },
    }, SessionSeq(0))
    const assignedProv = member({
      id: SessionId('child-a'),
      name: 'worker-a',
      sectionId: SidebarSectionId('sec-reviews'),
    })
    const unassignedProv = member({
      id: SessionId('child-b'),
      name: 'worker-b',
      sectionId: null,
    })
    const absentProv = member({
      id: SessionId('child-c'),
      name: 'worker-c',
    })
    const state = teamState(project(ROOT, [
      section,
      event('team/member', { version: 2, teamId: TEAM, member: assignedProv }, SessionSeq(1)),
      event('team/member', {
        version: 2,
        teamId: TEAM,
        member: { ...assignedProv, phase: 'active' },
      }, SessionSeq(2)),
      event('team/member', { version: 2, teamId: TEAM, member: unassignedProv }, SessionSeq(3)),
      event('team/member', {
        version: 2,
        teamId: TEAM,
        member: { ...unassignedProv, phase: 'active' },
      }, SessionSeq(4)),
      event('team/member', { version: 2, teamId: TEAM, member: absentProv }, SessionSeq(5)),
      event('team/member', {
        version: 2,
        teamId: TEAM,
        member: { ...absentProv, phase: 'active' },
      }, SessionSeq(6)),
    ]))
    expect(state.sections).toHaveLength(1)
    expect(state.sections.some(row => row.name === 'Unassigned')).toBe(false)
    expect(projectSidebarSections(state)).toEqual({
      sections: [{
        id: SidebarSectionId('sec-reviews'),
        name: 'Reviews',
        botIds: [SessionId('child-a')],
      }],
      unassignedBotIds: [SessionId('child-b'), SessionId('child-c')],
    })
  })

  it('enforces teammate identity and lifecycle', () => {
    const base = event('team/member', { version: 2, teamId: TEAM, member: member() }, SessionSeq(0))
    expect(() => projectTeam(ROOT, [event('team/member', {
      version: 2,
      teamId: TEAM,
      member: member({ phase: 'active' }),
    }, SessionSeq(0))])).toThrow(/must begin provisioning/)
    expect(() => projectTeam(ROOT, [base, event('team/member', {
      version: 2,
      teamId: TEAM,
      member: member({ name: 'renamed', phase: 'active' }),
    }, SessionSeq(1))])).toThrow(/immutable identity/)
    expect(() => projectTeam(ROOT, [base, event('team/member', {
      version: 2,
      teamId: TEAM,
      member: member({
        phase: 'active',
        modelSelection: { provider: 'mock', model: 'other-model' },
      }),
    }, SessionSeq(1))])).toThrow(/immutable identity/)
    expect(() => projectTeam(ROOT, [base, event('team/member', {
      version: 2,
      teamId: TEAM,
      member: member({ phase: 'active' }),
    }, SessionSeq(1)), event('team/member', {
      version: 2,
      teamId: TEAM,
      member: member({ phase: 'failed' }),
    }, SessionSeq(2))])).toThrow(/invalid active -> failed/)

    const duplicateName = member({ id: SessionId('child-b') })
    expect(() => projectTeam(ROOT, [base, event('team/member', {
      version: 2,
      teamId: TEAM,
      member: duplicateName,
    }, SessionSeq(1))])).toThrow(/name .* reused/)
  })

  it('persists and allows post-active Host identity field updates', () => {
    const withIdentity = member({
      displayName: 'Worker A',
      persona: { job: 'review', voice: 'terse', antiJobs: ['merge'] },
      avatar: { shape: 'circle', color: 'blue' },
      sectionId: SidebarSectionId('sec-reviews'),
    })
    const base = event('team/member', { version: 2, teamId: TEAM, member: withIdentity }, SessionSeq(0))
    const active = event('team/member', {
      version: 2,
      teamId: TEAM,
      member: { ...withIdentity, phase: 'active' },
    }, SessionSeq(1))
    const renamed = event('team/member', {
      version: 2,
      teamId: TEAM,
      member: {
        ...withIdentity,
        phase: 'active',
        displayName: 'Worker Renamed',
        persona: { job: 'ship', voice: 'warm', antiJobs: ['docs', 'ops'] },
        avatar: { shape: 'square' },
        sectionId: null,
      },
    }, SessionSeq(2))

    const projected = project(ROOT, [base, active, renamed])
    const state = teamState(projected)
    expect(state.members).toHaveLength(1)
    expect(state.members[0]).toMatchObject({
      displayName: 'Worker Renamed',
      persona: { job: 'ship', voice: 'warm', antiJobs: ['docs', 'ops'] },
      avatar: { shape: 'square' },
      sectionId: null,
      phase: 'active',
    })
    expect(teamProjectionDefinition.stateSchema.parse(JSON.parse(JSON.stringify(projected))))
      .toMatchObject({ members: [{ displayName: 'Worker Renamed', sectionId: null }] })

    expect(() => projectTeam(ROOT, [base, event('team/member', {
      version: 2,
      teamId: TEAM,
      member: {
        ...withIdentity,
        phase: 'active',
        displayName: 'Changed During Provisioning',
      },
    }, SessionSeq(1))])).toThrow(/during provisioning settlement/)
  })

  it('allows active → deleted Host identity tombstone and rejects further transitions', () => {
    const withIdentity = member({
      displayName: 'Worker A',
      persona: { job: 'review', voice: 'terse', antiJobs: ['merge'] },
      avatar: { shape: 'circle', color: 'blue' },
      sectionId: SidebarSectionId('sec-reviews'),
    })
    const base = event('team/member', { version: 2, teamId: TEAM, member: withIdentity }, SessionSeq(0))
    const active = event('team/member', {
      version: 2,
      teamId: TEAM,
      member: { ...withIdentity, phase: 'active' },
    }, SessionSeq(1))
    const deleted = event('team/member', {
      version: 2,
      teamId: TEAM,
      member: {
        ...withIdentity,
        phase: 'deleted',
        sectionId: null,
      },
    }, SessionSeq(2))

    const state = teamState(project(ROOT, [base, active, deleted]))
    expect(state.members).toHaveLength(1)
    expect(state.members[0]).toMatchObject({
      phase: 'deleted',
      sectionId: null,
      displayName: 'Worker A',
      persona: { job: 'review', voice: 'terse', antiJobs: ['merge'] },
    })

    expect(() => projectTeam(ROOT, [base, active, deleted, event('team/member', {
      version: 2,
      teamId: TEAM,
      member: { ...withIdentity, phase: 'active', sectionId: null },
    }, SessionSeq(3))])).toThrow(/invalid deleted -> active/)
  })

  it('enforces task revision continuity', () => {
    const first = event('team/task', { version: 2, teamId: TEAM, task: task() }, SessionSeq(0))
    expect(() => projectTeam(ROOT, [event('team/task', {
      version: 2,
      teamId: TEAM,
      task: task({ revision: 2 }),
    }, SessionSeq(0))])).toThrow(/begin at revision 1/)
    expect(() => projectTeam(ROOT, [first, event('team/task', {
      version: 2,
      teamId: TEAM,
      task: task({ revision: 3 }),
    }, SessionSeq(1))])).toThrow(/revision is not contiguous/)
  })

  it('rejects every invalid persisted task dependency relation', () => {
    const first = event('team/task', { version: 2, teamId: TEAM, task: task() }, SessionSeq(0))
    const second = event('team/task', {
      version: 2,
      teamId: TEAM,
      task: task({
        id: TeamTaskId('task-2'),
        blockedBy: [TeamTaskId('task-1')],
      }),
    }, SessionSeq(1))
    const invalid: Array<{ records: SessionEvent[]; message: RegExp }> = [
      {
        records: [event('team/task', {
          version: 2,
          teamId: TEAM,
          task: task({ blockedBy: [TeamTaskId('missing')] }),
        }, SessionSeq(0))],
        message: /blocker task "missing" .* is missing or deleted/,
      },
      {
        records: [event('team/task', {
          version: 2,
          teamId: TEAM,
          task: task({ blockedBy: [TeamTaskId('task-1')] }),
        }, SessionSeq(0))],
        message: /cannot block itself/,
      },
      {
        records: [first, event('team/task', {
          ...second.data,
          task: { ...second.data.task, blockedBy: [TeamTaskId('task-1'), TeamTaskId('task-1')] },
        }, SessionSeq(1))],
        message: /repeats blocker/,
      },
      {
        records: [first, second, event('team/task', {
          version: 2,
          teamId: TEAM,
          task: task({ revision: 2, blockedBy: [TeamTaskId('task-2')] }),
        }, SessionSeq(2))],
        message: /dependency cycle/,
      },
      {
        records: [first, second, event('team/task', {
          version: 2,
          teamId: TEAM,
          task: task({ revision: 2, status: 'deleted' }),
        }, SessionSeq(2))],
        message: /blocker task "task-1" .* is missing or deleted/,
      },
    ]

    for (const { records, message: expected } of invalid) {
      expect(() => projectTeam(ROOT, records)).toThrow(expected)
    }
  })

  it('leaves numeric allocation unchanged for a branded nonstandard task id', () => {
    const state = projectTeam(ROOT, [event('team/task', {
      version: 2,
      teamId: TEAM,
      task: task({ id: TeamTaskId('external-task') }),
    }, SessionSeq(0))])
    expect(state.nextTaskNumber).toBe(1)
  })

  it('rejects a persisted numeric task id outside the safe integer range', () => {
    expect(() => projectTeam(ROOT, [event('team/task', {
      version: 2,
      teamId: TEAM,
      task: task({ id: TeamTaskId('task-9007199254740992') }),
    }, SessionSeq(0))])).toThrow(/persisted Agent Teams team\/task payload is invalid/)
  })

  it('enforces mailbox queue and acknowledgement relations', () => {
    const queued = event('team/message/queued', { version: 2, teamId: TEAM, message: message() }, SessionSeq(0))
    const delivered = event('team/message/delivered', {
      version: 2,
      teamId: TEAM,
      messageId: TeamMessageId('message-1'),
      targetId: CHILD,
    }, SessionSeq(1))
    expect(pending(projectTeam(ROOT, [queued, delivered]))).toEqual([])
    expect(() => projectTeam(ROOT, [queued, queued])).toThrow(/queued twice/)
    expect(() => projectTeam(ROOT, [delivered])).toThrow(/delivered before queueing/)
    expect(() => projectTeam(ROOT, [queued, event('team/message/delivered', {
      ...delivered.data,
      targetId: SessionId('other'),
    }, SessionSeq(1))])).toThrow(/target changed/)
    expect(() => projectTeam(ROOT, [queued, delivered, { ...delivered, seq: SessionSeq(2) }])).toThrow(/delivered twice/)
  })

  it('validates every current-version persisted payload before projecting it', () => {
    const malformed = [
      {
        ...event('team/member', { version: 2, teamId: TEAM, member: member() }, SessionSeq(0)),
        data: { version: 2, teamId: TEAM, member: { ...member(), name: 42 } },
      },
      {
        ...event('team/task', { version: 2, teamId: TEAM, task: task() }, SessionSeq(0)),
        data: { version: 2, teamId: TEAM, task: { ...task(), blockedBy: [42] } },
      },
      {
        ...event('team/message/queued', { version: 2, teamId: TEAM, message: message() }, SessionSeq(0)),
        data: {
          version: 2,
          teamId: TEAM,
          message: { ...message(), content: [{ type: 'text', text: 42 }] },
        },
      },
      {
        ...event('team/message/delivered', {
          version: 2,
          teamId: TEAM,
          messageId: TeamMessageId('message-1'),
          targetId: CHILD,
        }, SessionSeq(0)),
        data: {
          version: 2,
          teamId: TEAM,
          messageId: TeamMessageId('message-1'),
          targetId: 42,
        },
      },
      {
        ...event('team/member', { version: 2, teamId: TEAM, member: member() }, SessionSeq(0)),
        data: { version: 2, teamId: TEAM, member: member(), unexpected: true },
      },
      {
        ...event('team/task', { version: 2, teamId: TEAM, task: task() }, SessionSeq(0)),
        data: { version: 2, teamId: 42, task: task() },
      },
    ] as unknown as SessionEvent[]

    for (const candidate of malformed) {
      expect(() => projectTeam(ROOT, [candidate]))
        .toThrow(/persisted Agent Teams .* payload is invalid/)
    }
  })

  it('retains merge-extensible content blocks while rejecting malformed core variants', () => {
    const extension = { type: 'plugin/custom', payload: { value: 1 } } as never
    const state = projectTeam(ROOT, [event('team/message/queued', {
      version: 2,
      teamId: TEAM,
      message: message({ content: [extension] }),
    }, SessionSeq(0))])
    expect(pending(state)[0]?.content).toEqual([extension])
  })

  it('records unsupported event versions without applying them', () => {
    const invalid = event('team/task', {
      version: 1 as 2,
      teamId: TEAM,
      task: task(),
    }, SessionSeq(0))
    const later = event('team/task', {
      version: 2,
      teamId: TEAM,
      task: task(),
    }, SessionSeq(1))
    const state = project(ROOT, [invalid, later])
    expect(state.failure).toMatch(/unsupported Agent Teams event version 1/)
    expect(isEmptyState(state)).toBe(true)
  })

  it('isolates unsupported inherited Team records from the current Team', () => {
    const inherited = event('team/task', {
      version: 1 as 2,
      teamId: TeamId('ancestor'),
      task: task(),
    }, SessionSeq(0))
    const projected = project(ROOT, [inherited])
    expect(projected.failure).toBeUndefined()
    expect(isEmptyState(teamState(projected))).toBe(true)
  })

  it('ignores malformed current-version records inherited from another Team', () => {
    const inherited = {
      ...event('team/task', {
        version: 2,
        teamId: TeamId('ancestor'),
        task: task(),
      }, SessionSeq(0)),
      data: {
        version: 2,
        teamId: TeamId('ancestor'),
        task: { ...task(), subject: 42 },
      },
    } as unknown as SessionEvent
    expect(isEmptyState(projectTeam(ROOT, [inherited]))).toBe(true)
  })
})

describe('projectRoutine / projectRoutines (US2 T019 / FR-002)', () => {
  it('projects intent/identity, scheduleLabel, status, and lastRunAt from Host rows', () => {
    const active = {
      routineId: RoutineId('routine-active'),
      botId: CHILD,
      intent: 'Ping status',
      scheduleExpr: '@every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 10,
      updatedAt: 10,
    }
    const paused = {
      routineId: RoutineId('routine-paused'),
      botId: SessionId('child-b'),
      intent: 'Nightly digest',
      scheduleExpr: '@daily',
      triggerKind: 'cron' as const,
      status: 'paused' as const,
      lastRunAt: 99,
      createdAt: 20,
      updatedAt: 30,
    }
    expect(projectRoutine(active)).toEqual({
      ...active,
      identity: 'Ping status',
      scheduleLabel: 'Every 5m',
    })
    expect(projectRoutine(paused)).toEqual({
      ...paused,
      identity: 'Nightly digest',
      scheduleLabel: 'Every day',
    })
    const state = {
      id: TEAM,
      members: [],
      sections: [],
      routines: [active, paused],
      memories: [],
      connectors: [],
      tasks: [],
      nextTaskNumber: 1,
      messages: [],
      delivered: [],
    }
    expect(projectRoutines(state, CHILD)).toEqual([projectRoutine(active)])
    expect(projectRoutines(state, SessionId('child-b'))).toEqual([projectRoutine(paused)])
    expect(projectRoutines(state)).toEqual([projectRoutine(active), projectRoutine(paused)])
    expect(projectRoutines(state, SessionId('missing'))).toEqual([])
  })
})

describe('projectMemory / projectMemories (P5 T007–T008 / US5 T027)', () => {
  it('projects agent isolation and user sharing from Host rows', () => {
    const agentA = {
      memoryId: MemoryId('memory-agent-a'),
      kind: 'profile' as const,
      layer: 'agent' as const,
      botId: CHILD,
      content: 'Alpha UTC',
      createdAt: 10,
      updatedAt: 10,
    }
    const agentB = {
      memoryId: MemoryId('memory-agent-b'),
      kind: 'log' as const,
      layer: 'agent' as const,
      botId: SessionId('child-b'),
      content: 'Beta event',
      createdAt: 20,
      updatedAt: 20,
    }
    const user = {
      memoryId: MemoryId('memory-user'),
      kind: 'note' as const,
      layer: 'user' as const,
      botId: null,
      content: 'Shared account fact',
      createdAt: 30,
      updatedAt: 30,
    }
    expect(projectMemory(agentA)).toEqual(agentA)
    const state = {
      id: TEAM,
      members: [],
      sections: [],
      routines: [],
      memories: [agentA, agentB, user],
      connectors: [],
      tasks: [],
      nextTaskNumber: 1,
      messages: [],
      delivered: [],
    }
    expect(projectMemories(state, CHILD)).toEqual([projectMemory(agentA), projectMemory(user)])
    expect(projectMemories(state, SessionId('child-b'))).toEqual([
      projectMemory(agentB),
      projectMemory(user),
    ])
    expect(projectMemories(state)).toEqual([
      projectMemory(agentA),
      projectMemory(agentB),
      projectMemory(user),
    ])
    expect(projectMemories(state, SessionId('missing'))).toEqual([projectMemory(user)])
  })

  it('US5 T027: memoryEligibleForBot keys agent by botId and shares user account-wide', () => {
    expect(memoryEligibleForBot({ layer: 'agent', botId: CHILD }, CHILD)).toBe(true)
    expect(memoryEligibleForBot({ layer: 'agent', botId: CHILD }, SessionId('child-b'))).toBe(false)
    expect(memoryEligibleForBot({ layer: 'user', botId: null }, CHILD)).toBe(true)
    expect(memoryEligibleForBot({ layer: 'user', botId: null }, SessionId('child-b'))).toBe(true)
  })
})

describe('projectSkillCatalog (T015 / T032)', () => {
  it('maps thin-pack to managed and other sources to user', () => {
    expect(projectSkillCatalog([
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
      {
        name: 'empty-desc',
        description: '  ',
        source: 'custom',
      },
    ])).toEqual([
      {
        id: 'mzm-thin-pack',
        displayName: 'MzM thin pack',
        source: 'managed',
        description: 'MzM thin pack — single managed skill for Phase 3 Skills UX Pass.',
      },
      {
        id: 'my-playbook',
        displayName: 'User authored playbook',
        source: 'user',
        description: 'User authored playbook',
      },
      {
        id: 'empty-desc',
        displayName: 'empty-desc',
        source: 'user',
      },
    ])
  })

  it('forces thin-pack id to managed even when provider source is not bundled', () => {
    expect(projectSkillCatalog([
      { name: 'mzm-thin-pack', description: 'alt', source: 'custom' },
    ])).toEqual([
      {
        id: 'mzm-thin-pack',
        displayName: 'MzM thin pack',
        source: 'managed',
        description: 'alt',
      },
    ])
  })

  it('omits office bundled skills from Pass discovery so managed count is exactly one (T032)', () => {
    const catalog = projectSkillCatalog([
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
    ])
    expect(catalog.filter(skill => skill.source === 'managed')).toEqual([
      {
        id: 'mzm-thin-pack',
        displayName: 'MzM thin pack',
        source: 'managed',
        description: 'MzM thin pack — single managed skill for Phase 3 Skills UX Pass.',
      },
    ])
    expect(catalog.map(skill => skill.id)).toEqual(['mzm-thin-pack', 'my-playbook'])
  })
})
