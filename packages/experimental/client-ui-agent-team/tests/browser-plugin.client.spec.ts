import { Context, Service } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {
  SidebarSectionId,
  TeamMemberView as TeamRosterMember, TeamTaskId,
} from '@deepseek-ai/dsh-experimental-agent-team/client'
import type {} from '@deepseek-ai/dsh-experimental-agent-team/remote'
import { RemoteError } from '@deepseek-ai/dsh-client-test-runtime'
import type { TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { TeamAction, type TeamActionInjected } from '../src/client/TeamAction.tsx'
import { inject, mountAgentTeamUi } from '../src/client/mount.ts'
import { apply as nodeApply } from '../src/index.ts'

const SESSION = 'team-session' as SessionId
const CHILD = 'team-child' as SessionId
const TASK_ID = 'task-1' as TeamTaskId
const REMOTE: TypertRemoteContribution = {
  package: '@deepseek-ai/dsh-experimental-agent-team',
  descriptors: [],
}

async function bench(options: {
  addressed?: boolean
  conflict?: boolean
  registrationFailure?: boolean
  remoteFailure?: 'view' | 'update' | 'createBot' | 'updatePersona' | 'renameBot' | 'setAvatar' | 'deleteBot' | 'createSection' | 'renameSection' | 'assignSection' | 'attachSkill' | 'upsertUserSkill' | 'createRoutine'
  refreshGate?: Promise<void>
} = {}) {
  const ctx = new Context()
  const calls: { method: string; args: unknown[] }[] = []
  const answer = <T>(method: string, value: T) => (...args: unknown[]) => {
    calls.push({ method, args })
    return Promise.resolve({ ok: true as const, value })
  }
  const task = {
    id: 'task-1',
    revision: 1, subject: 'Task', description: 'Description', status: 'pending' as const,
    blockedBy: [], writeScopes: [], ready: true, writeScopeWarnings: [],
  }
  class RemoteService extends Service {
    readonly disposeMount = vi.fn(() => Promise.resolve())
    readonly mount = vi.fn((_contribution: unknown) => Promise.resolve(this.disposeMount))

    constructor(serviceCtx: Context) {
      super(serviceCtx, 'remote')
    }

    $mount(contribution: unknown): Promise<() => Promise<void>> {
      return this.mount(contribution)
    }
  }
  const remote = new RemoteService(ctx)
  const failure = {
    ok: false as const,
    error: new RemoteError('gateway/internal', 'offline', {}),
  }
  const view = {
    members: [{
      id: SESSION, name: 'lead', role: 'lead' as const, status: 'idle' as const, diagnostics: [],
    }], tasks: [task],
    sections: [],
    unassignedBotIds: [SESSION],
    handoffs: [],
    skills: [],
    routines: [],
  }
  ctx.provide('remote.agentTeams', {
    view: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/view', args })
      return Promise.resolve(options.remoteFailure === 'view'
        ? failure
        : { ok: true as const, value: view })
    },
    createBot: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/createBot', args })
      return Promise.resolve(options.remoteFailure === 'createBot'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              id: CHILD,
              displayName: 'Research Bot',
              name: 'research-bot',
              modelSelection: { provider: 'fixture', model: 'model-a' },
              member: {
                id: CHILD,
                name: 'research-bot',
                role: 'teammate' as const,
                status: 'inactive' as const,
                displayName: 'Research Bot',
                diagnostics: [],
              },
            },
          },
        })
    },
    updatePersona: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/updatePersona', args })
      return Promise.resolve(options.remoteFailure === 'updatePersona'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              id: CHILD,
              persona: { job: 'review', voice: 'terse', antiJobs: ['docs'] },
              member: {
                id: CHILD,
                name: 'research-bot',
                role: 'teammate' as const,
                status: 'inactive' as const,
                displayName: 'Research Bot',
                persona: { job: 'review', voice: 'terse', antiJobs: ['docs'] },
                diagnostics: [],
              },
            },
          },
        })
    },
    renameBot: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/renameBot', args })
      return Promise.resolve(options.remoteFailure === 'renameBot'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              id: CHILD,
              displayName: 'Rename Target',
              member: {
                id: CHILD,
                name: 'research-bot',
                role: 'teammate' as const,
                status: 'inactive' as const,
                displayName: 'Rename Target',
                diagnostics: [],
              },
            },
          },
        })
    },
    setAvatar: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/setAvatar', args })
      return Promise.resolve(options.remoteFailure === 'setAvatar'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              id: CHILD,
              avatar: { shape: 'circle', color: 'blue' },
              member: {
                id: CHILD,
                name: 'research-bot',
                role: 'teammate' as const,
                status: 'inactive' as const,
                displayName: 'Research Bot',
                avatar: { shape: 'circle' as const, color: 'blue' as const },
                diagnostics: [],
              },
            },
          },
        })
    },
    deleteBot: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/deleteBot', args })
      return Promise.resolve(options.remoteFailure === 'deleteBot'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: { id: CHILD },
          },
        })
    },
    createSection: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/createSection', args })
      return Promise.resolve(options.remoteFailure === 'createSection'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              id: 'section-1' as SidebarSectionId,
              name: 'Research',
              section: {
                id: 'section-1' as SidebarSectionId,
                name: 'Research',
                botIds: [],
              },
            },
          },
        })
    },
    renameSection: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/renameSection', args })
      return Promise.resolve(options.remoteFailure === 'renameSection'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              id: 'section-1' as SidebarSectionId,
              name: 'Lab',
              section: {
                id: 'section-1' as SidebarSectionId,
                name: 'Lab',
                botIds: [],
              },
            },
          },
        })
    },
    assignSection: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/assignSection', args })
      return Promise.resolve(options.remoteFailure === 'assignSection'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              id: CHILD,
              sectionId: 'section-1' as SidebarSectionId,
              member: {
                id: CHILD,
                name: 'research-bot',
                role: 'teammate' as const,
                status: 'inactive' as const,
                displayName: 'Research Bot',
                sectionId: 'section-1' as SidebarSectionId,
                diagnostics: [],
              },
            },
          },
        })
    },
    attachSkill: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/attachSkill', args })
      return Promise.resolve(options.remoteFailure === 'attachSkill'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              id: CHILD,
              skillAttachments: [{
                botId: CHILD,
                skillId: 'mzm-thin-pack',
              }],
              member: {
                id: CHILD,
                name: 'research-bot',
                role: 'teammate' as const,
                status: 'inactive' as const,
                displayName: 'Research Bot',
                skillAttachments: [{
                  botId: CHILD,
                  skillId: 'mzm-thin-pack',
                }],
                diagnostics: [],
              },
            },
          },
        })
    },
    upsertUserSkill: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/upsertUserSkill', args })
      return Promise.resolve(options.remoteFailure === 'upsertUserSkill'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              skill: {
                id: 'my-playbook',
                displayName: 'My playbook',
                source: 'user' as const,
                description: 'My playbook',
              },
            },
          },
        })
    },
    createRoutine: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/createRoutine', args })
      return Promise.resolve(options.remoteFailure === 'createRoutine'
        ? failure
        : {
          ok: true as const,
          value: {
            ok: true as const,
            value: {
              routine: {
                routineId: 'routine-1',
                botId: CHILD,
                identity: 'Ping',
                intent: 'Ping',
                scheduleExpr: '@every 5m',
                scheduleLabel: 'Every 5m',
                status: 'active' as const,
                lastRunAt: null,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          },
        })
    },
    createTask: answer('agentTeams/createTask', task),
    updateTask: (...args: unknown[]) => {
      calls.push({ method: 'agentTeams/updateTask', args })
      if (options.remoteFailure === 'update') return Promise.resolve(failure)
      return Promise.resolve(options.conflict
        ? {
          ok: true as const,
          value: {
            ok: false as const,
            error: {
              code: 'team-task-conflict' as const,
              message: 'stale',
            },
          },
        }
        : { ok: true as const, value: { ok: true as const, value: { ...task, revision: 2 } } })
    },
  })
  const navigation: unknown[] = []
  let mainSessionId = options.addressed === true ? CHILD : SESSION
  ctx.provide('sessions', {
    binding: (id: SessionId) => options.addressed === true && id === CHILD
      ? { session: { getSnapshot: () => ({
        subagent: {
          address: {
            parentSessionId: SESSION,
            childSessionId: CHILD,
            mode: 'continuable' as const,
          },
        },
      }) } }
      : undefined,
    refreshSubagents: (id: SessionId) => {
      navigation.push(['refresh', id])
      return options.refreshGate ?? Promise.resolve()
    },
    retainInfo: (id: SessionId) => ({
      getSnapshot: () => ({
        referenceCount: id === mainSessionId ? 1 : 0,
        retainedBy: id === mainSessionId ? { mainView: 1 } : {},
      }),
      subscribe: () => () => {},
    }),
  })
  ctx.provide('uiWorkspace', {
    openSession: (target: unknown) => { navigation.push(['open', target]) },
  } as never)
  ctx.provide('conversation', {})
  ctx.provide('locale', new LocaleRuntime(ctx))
  await ctx.plugin(SlotRegistry).await()
  const collapseHeader = ctx.slots.register({
    name: 'root',
    children: { 'conversation.session.header.actions': { kind: 'list', scope: 'session' } },
  } as never, () => null)
  if (options.registrationFailure === true) {
    vi.spyOn(ctx.slots, 'inject').mockImplementationOnce(() => { throw new Error('slot registration failed') })
  }
  const fiber = options.registrationFailure === true
    ? ctx.plugin({ apply() {} })
    : ctx.plugin({ inject: [...inject], apply: clientCtx => mountAgentTeamUi(clientCtx, REMOTE) })
  const activation: Promise<unknown> = options.registrationFailure === true
    ? mountAgentTeamUi(ctx, REMOTE).catch((error: unknown) => error)
    : fiber.await()
  if (options.registrationFailure !== true) {
    await activation
  } else {
    await fiber.await()
  }
  const entry = () => ctx.slots.entries('conversation.session.header.actions')
    .find(candidate => candidate.component === TeamAction)
  return {
    ctx,
    fiber,
    activation,
    calls,
    navigation,
    remote,
    entry,
    collapseHeader,
    select: (sessionId: SessionId) => { mainSessionId = sessionId },
  }
}

describe('ui-team browser plugin', () => {
  it('registers one disposable header action with RPC-backed bot and task operations', async () => {
    const b = await bench()
    expect(inject).toEqual(['sessions', 'uiWorkspace', 'remote', 'slots', 'locale'])
    expect(b.entry()).toMatchObject({
      options: { id: 'agent-team', order: 20 },
      locale: 'agent-team',
    })
    expect(b.remote.mount).toHaveBeenCalledOnce()
    expect(b.remote.mount).toHaveBeenCalledWith(REMOTE)
    const actions = (b.entry()!.inject as unknown as () => TeamActionInjected)()
    expect((await actions.load(SESSION)).ok).toBe(true)
    expect((await actions.createBot(SESSION, {
      displayName: 'Research Bot',
      modelSelection: { provider: 'fixture', model: 'model-a' },
    })).ok).toBe(true)
    expect((await actions.updatePersona(SESSION, {
      botId: CHILD,
      job: 'review',
      voice: 'terse',
      antiJobs: ['docs'],
    })).ok).toBe(true)
    expect((await actions.renameBot(SESSION, {
      botId: CHILD,
      displayName: 'Rename Target',
    })).ok).toBe(true)
    expect((await actions.setAvatar(SESSION, {
      botId: CHILD,
      avatar: { shape: 'circle', color: 'blue' },
    })).ok).toBe(true)
    expect((await actions.deleteBot(SESSION, {
      botId: CHILD,
    })).ok).toBe(true)
    expect((await actions.createSection(SESSION, {
      name: 'Research',
    })).ok).toBe(true)
    expect((await actions.renameSection(SESSION, {
      sectionId: 'section-1' as SidebarSectionId,
      name: 'Lab',
    })).ok).toBe(true)
    expect((await actions.assignSection(SESSION, {
      botId: CHILD,
      sectionId: 'section-1' as SidebarSectionId,
    })).ok).toBe(true)
    expect((await actions.attachSkill(SESSION, {
      botId: CHILD,
      skillId: 'mzm-thin-pack',
    })).ok).toBe(true)
    expect((await actions.upsertUserSkill(SESSION, {
      displayName: 'My playbook',
      instructionalBody: 'Follow this authored playbook.',
    })).ok).toBe(true)
    expect((await actions.createRoutine(SESSION, {
      botId: CHILD,
      intent: 'Ping',
      scheduleExpr: '@every 5m',
    })).ok).toBe(true)
    expect((await actions.createTask(SESSION, {
      subject: 'Task', description: 'Description', blockedBy: [], writeScopes: [],
    })).ok).toBe(true)
    expect((await actions.updateTask(SESSION, {
      taskId: TASK_ID, expectedRevision: 1, action: 'complete',
    })).ok).toBe(true)
    expect((await actions.updateTask(SESSION, {
      taskId: TASK_ID, expectedRevision: 2, action: 'reassign', owner: 'worker',
    })).ok).toBe(true)
    expect(b.calls.map(call => call.method)).toEqual([
      'agentTeams/view',
      'agentTeams/createBot',
      'agentTeams/updatePersona',
      'agentTeams/renameBot',
      'agentTeams/setAvatar',
      'agentTeams/deleteBot',
      'agentTeams/createSection',
      'agentTeams/renameSection',
      'agentTeams/assignSection',
      'agentTeams/attachSkill',
      'agentTeams/upsertUserSkill',
      'agentTeams/createRoutine',
      'agentTeams/createTask',
      'agentTeams/updateTask',
      'agentTeams/updateTask',
    ])
    expect(b.calls[1]?.args[1]).toEqual({
      displayName: 'Research Bot',
      modelSelection: { provider: 'fixture', model: 'model-a' },
    })
    expect(b.calls[2]?.args[1]).toEqual({
      botId: CHILD,
      job: 'review',
      voice: 'terse',
      antiJobs: ['docs'],
    })
    expect(b.calls[3]?.args[1]).toEqual({
      botId: CHILD,
      displayName: 'Rename Target',
    })
    expect(b.calls[4]?.args[1]).toEqual({
      botId: CHILD,
      avatar: { shape: 'circle', color: 'blue' },
    })
    expect(b.calls[5]?.args[1]).toEqual({
      botId: CHILD,
    })
    expect(b.calls[6]?.args[1]).toEqual({ name: 'Research' })
    expect(b.calls[7]?.args[1]).toEqual({
      sectionId: 'section-1',
      name: 'Lab',
    })
    expect(b.calls[8]?.args[1]).toEqual({
      botId: CHILD,
      sectionId: 'section-1',
    })
    expect(b.calls[9]?.args[1]).toEqual({
      botId: CHILD,
      skillId: 'mzm-thin-pack',
    })
    expect(b.calls[10]?.args[1]).toEqual({
      displayName: 'My playbook',
      instructionalBody: 'Follow this authored playbook.',
    })
    expect(b.calls[11]?.args[1]).toEqual({
      botId: CHILD,
      intent: 'Ping',
      scheduleExpr: '@every 5m',
    })
    expect(b.calls.at(-1)?.args[1]).toMatchObject({ owner: 'worker' })

    await actions.openTeammate(SESSION, {
      id: SESSION,
      name: 'lead',
      role: 'lead',
      status: 'idle',
      diagnostics: [],
    })
    expect(b.navigation).toEqual([])

    await b.fiber.dispose()
    expect(b.entry()).toBeUndefined()
    expect(b.remote.disposeMount).toHaveBeenCalledOnce()
  })

  it('unmounts the Remote contribution when later Client registration fails', async () => {
    const b = await bench({ registrationFailure: true })
    await expect(b.activation).resolves.toMatchObject({ message: 'slot registration failed' })
    expect(b.remote.mount).toHaveBeenCalledOnce()
    expect(b.remote.disposeMount).toHaveBeenCalledOnce()
  })

  it('returns the generated task business result without a Client transport wrapper', async () => {
    const b = await bench({ conflict: true })
    const actions = (b.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(actions.updateTask(SESSION, {
      taskId: TASK_ID, expectedRevision: 1, action: 'delete',
    })).resolves.toEqual({
      ok: true,
      value: {
        ok: false,
        error: { code: 'team-task-conflict', message: 'stale' },
      },
    })
  })

  it('returns Remote carrier failures unchanged', async () => {
    const view = await bench({ remoteFailure: 'view' })
    const viewActions = (view.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(viewActions.load(SESSION)).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const createBot = await bench({ remoteFailure: 'createBot' })
    const createActions = (createBot.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(createActions.createBot(SESSION, {
      displayName: 'Bot',
      modelSelection: { provider: 'fixture', model: 'model-a' },
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const updatePersona = await bench({ remoteFailure: 'updatePersona' })
    const personaActions = (updatePersona.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(personaActions.updatePersona(SESSION, {
      botId: CHILD,
      job: 'review',
      voice: '',
      antiJobs: [],
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const renameBot = await bench({ remoteFailure: 'renameBot' })
    const renameActions = (renameBot.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(renameActions.renameBot(SESSION, {
      botId: CHILD,
      displayName: 'Rename Target',
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const setAvatar = await bench({ remoteFailure: 'setAvatar' })
    const avatarActions = (setAvatar.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(avatarActions.setAvatar(SESSION, {
      botId: CHILD,
      avatar: { shape: 'circle', color: 'blue' },
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const deleteBot = await bench({ remoteFailure: 'deleteBot' })
    const deleteActions = (deleteBot.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(deleteActions.deleteBot(SESSION, {
      botId: CHILD,
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const createSection = await bench({ remoteFailure: 'createSection' })
    const createSectionActions = (createSection.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(createSectionActions.createSection(SESSION, {
      name: 'Research',
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const renameSection = await bench({ remoteFailure: 'renameSection' })
    const renameSectionActions = (renameSection.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(renameSectionActions.renameSection(SESSION, {
      sectionId: 'section-1' as SidebarSectionId,
      name: 'Lab',
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const assignSection = await bench({ remoteFailure: 'assignSection' })
    const assignSectionActions = (assignSection.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(assignSectionActions.assignSection(SESSION, {
      botId: CHILD,
      sectionId: null,
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const attachSkill = await bench({ remoteFailure: 'attachSkill' })
    const attachSkillActions = (attachSkill.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(attachSkillActions.attachSkill(SESSION, {
      botId: CHILD,
      skillId: 'mzm-thin-pack',
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const upsertUserSkill = await bench({ remoteFailure: 'upsertUserSkill' })
    const upsertUserSkillActions = (upsertUserSkill.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(upsertUserSkillActions.upsertUserSkill(SESSION, {
      displayName: 'My playbook',
      instructionalBody: 'Follow this authored playbook.',
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })

    const update = await bench({ remoteFailure: 'update' })
    const updateActions = (update.entry()!.inject as unknown as () => TeamActionInjected)()
    await expect(updateActions.updateTask(SESSION, {
      taskId: TASK_ID, expectedRevision: 1, action: 'delete',
    })).resolves.toMatchObject({
      ok: false,
      error: { code: 'gateway/internal', message: 'offline' },
    })
  })

  it('routes createBot from an addressed teammate conversation back through its Lead', async () => {
    const b = await bench({ addressed: true })
    const actions = (b.entry()!.inject as unknown as () => TeamActionInjected)()
    await actions.createBot(CHILD, {
      displayName: 'Research Bot',
      modelSelection: { provider: 'fixture', model: 'model-a' },
    })
    expect(b.calls[0]).toEqual({
      method: 'agentTeams/createBot',
      args: [SESSION, {
        displayName: 'Research Bot',
        modelSelection: { provider: 'fixture', model: 'model-a' },
      }],
    })
  })

  it('refreshes the descriptor catalog before opening a continuable teammate address', async () => {
    const b = await bench()
    const actions = (b.entry()!.inject as unknown as () => TeamActionInjected)()
    const member: TeamRosterMember = {
      id: CHILD,
      name: 'worker',
      role: 'teammate',
      status: 'inactive',
      diagnostics: [],
    }
    await actions.openTeammate(SESSION, member)
    expect(b.navigation).toEqual([
      ['refresh', SESSION],
      ['open', {
        parentSessionId: SESSION,
        childSessionId: CHILD,
        mode: 'continuable',
      }],
    ])
  })

  it('routes Team actions from an addressed teammate conversation back through its Lead', async () => {
    const b = await bench({ addressed: true })
    const actions = (b.entry()!.inject as unknown as () => TeamActionInjected)()
    await actions.load(CHILD)
    await actions.openTeammate(CHILD, {
      id: CHILD,
      name: 'worker',
      role: 'teammate',
      status: 'inactive',
      diagnostics: [],
    })
    expect(b.calls[0]).toEqual({ method: 'agentTeams/view', args: [SESSION] })
    expect(b.navigation).toEqual([
      ['refresh', SESSION],
      ['open', {
        parentSessionId: SESSION,
        childSessionId: CHILD,
        mode: 'continuable',
      }],
    ])
  })

  it('does not open a teammate after navigation switches during catalog refresh', async () => {
    const refresh = Promise.withResolvers<undefined>()
    const b = await bench({ refreshGate: refresh.promise })
    const actions = (b.entry()!.inject as unknown as () => TeamActionInjected)()
    const opening = actions.openTeammate(SESSION, {
      id: CHILD,
      name: 'worker',
      role: 'teammate',
      status: 'inactive',
      diagnostics: [],
    })
    expect(b.navigation).toEqual([['refresh', SESSION]])
    b.select('other-session' as SessionId)
    refresh.resolve(undefined)
    await opening
    expect(b.navigation).toEqual([['refresh', SESSION]])
  })

  it('re-registers after the conversation header slot is collapsed and declared again', async () => {
    const b = await bench()
    expect(b.entry()).toBeDefined()
    b.collapseHeader()
    expect(b.entry()).toBeUndefined()
    b.ctx.slots.register({
      name: 'root',
      children: { 'conversation.session.header.actions': { kind: 'list', scope: 'session' } },
    } as never, () => null)
    await Promise.resolve()
    expect(b.entry()).toBeDefined()
  })

  it('keeps the node half inert', () => {
    expect(() => { nodeApply() }).not.toThrow()
  })
})
