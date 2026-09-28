// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  HostMailboxMessage,
  SidebarSectionId,
  SkillId,
  TeamMessageId,
  TeamTaskId, TeamTaskView as TeamTask, TeamView,
} from '@deepseek-ai/dsh-experimental-agent-team/client'
import { makeTranslate, RemoteError } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import {
  TeamAction, type TeamActionInjected, type TeamActionProps, type TeamActionResult,
  type TeamAssignSectionActionResult, type TeamAttachSkillActionResult,
  type TeamAuthenticateConnectorActionResult, type TeamCreateBotActionResult,
  type TeamCreateRoutineActionResult, type TeamCreateSectionActionResult,
  type TeamDeleteBotActionResult, type TeamDescribeConnectorCredentialActionResult,
  type TeamGetTrustPolicyActionResult, type TeamInstallConnectorActionResult,
  type TeamInvokeConnectorToolActionResult,
  type TeamListConnectorCatalogActionResult, type TeamListConnectorsActionResult,
  type TeamSetStandingDenyActionResult,
  type TeamListMemoriesActionResult, type TeamRenameBotActionResult,
  type TeamRenameSectionActionResult,
  type TeamSetAvatarActionResult, type TeamTaskActionResult,
  type TeamUpdatePersonaActionResult, type TeamUpsertUserSkillActionResult,
  type TeamWriteMemoryActionResult,
} from '../src/client/TeamAction.tsx'
import { zh } from '../src/client/locales.ts'

afterEach(cleanup)

const SESSION = 'lead' as SessionId
const TASK_1 = 'task-1' as TeamTaskId
const TASK_2 = 'task-2' as TeamTaskId
const task: TeamTask = {
  id: TASK_1,
  revision: 1,
  subject: 'Implement runtime',
  description: 'Build the Team runtime',
  status: 'in_progress',
  ownerName: 'lead',
  blockedBy: [],
  writeScopes: ['src'],
  ready: false,
  writeScopeWarnings: ['write scopes overlap with task-2'],
}
const view: TeamView = {
  members: [
    {
      id: SESSION,
      name: 'lead',
      role: 'lead',
      status: 'idle',
      model: 'model-a',
      modelSelection: { provider: 'fixture', model: 'model-a' },
      diagnostics: [],
    },
    {
      id: 'worker-id' as SessionId,
      name: 'worker',
      role: 'teammate',
      status: 'inactive',
      model: 'model-a',
      modelSelection: { provider: 'fixture', model: 'model-a' },
      diagnostics: [],
    },
  ],
  tasks: [task],
  sections: [],
  unassignedBotIds: [SESSION, 'worker-id' as SessionId],
  handoffs: [],
  skills: [
    {
      id: 'mzm-thin-pack' as SkillId,
      displayName: 'MzM thin pack',
      source: 'managed',
      description: 'Thin managed skill for Skills UX Pass',
    },
  ],
  routines: [],
  memories: [],
  connectors: [],
}

function taskSuccess(value: TeamTask): TeamTaskActionResult {
  return { ok: true, value: { ok: true, value } }
}

function taskConflict(message: string): TeamTaskActionResult {
  return {
    ok: true,
    value: { ok: false, error: { code: 'team-task-conflict', message } },
  }
}

function taskRejected(message: string): TeamTaskActionResult {
  return {
    ok: true,
    value: { ok: false, error: { code: 'team-rejected', message } },
  }
}

function remoteFailure(message: string): TeamActionResult<never> {
  return { ok: false, error: new RemoteError('gateway/internal', message, {}) }
}

function props(actions: TeamActionInjected, sessionId: SessionId = SESSION): TeamActionProps {
  return {
    sessionId,
    ...actions,
    t: makeTranslate(zh, commonZh),
  } as unknown as TeamActionProps
}

function actions(overrides: Partial<TeamActionInjected> = {}): TeamActionInjected {
  return {
    load: () => Promise.resolve({ ok: true, value: view }),
    openModelsSettings: vi.fn(),
    createBot: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'worker-id' as SessionId,
          displayName: 'Research Bot',
          name: 'research-bot',
          modelSelection: { provider: 'fixture', model: 'model-a' },
          member: view.members[1]!,
        },
      },
    }),
    updatePersona: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'worker-id' as SessionId,
          persona: { job: '', voice: '', antiJobs: [] },
          member: view.members[1]!,
        },
      },
    }),
    renameBot: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'worker-id' as SessionId,
          displayName: 'Renamed Bot',
          member: { ...view.members[1]!, displayName: 'Renamed Bot' },
        },
      },
    }),
    setAvatar: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'worker-id' as SessionId,
          avatar: { shape: 'circle', color: 'blue' },
          member: { ...view.members[1]!, avatar: { shape: 'circle' as const, color: 'blue' as const } },
        },
      },
    }),
    deleteBot: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'worker-id' as SessionId,
        },
      },
    }),
    createSection: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'section-1' as SidebarSectionId,
          name: 'Research',
          section: { id: 'section-1' as SidebarSectionId, name: 'Research', botIds: [] },
        },
      },
    }),
    renameSection: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'section-1' as SidebarSectionId,
          name: 'Lab',
          section: { id: 'section-1' as SidebarSectionId, name: 'Lab', botIds: [] },
        },
      },
    }),
    assignSection: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'worker-id' as SessionId,
          sectionId: 'section-1' as SidebarSectionId,
          member: { ...view.members[1]!, sectionId: 'section-1' as SidebarSectionId },
        },
      },
    }),
    attachSkill: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'worker-id' as SessionId,
          skillAttachments: [{
            botId: 'worker-id' as SessionId,
            skillId: 'mzm-thin-pack' as SkillId,
          }],
          member: {
            ...view.members[1]!,
            skillAttachments: [{
              botId: 'worker-id' as SessionId,
              skillId: 'mzm-thin-pack' as SkillId,
            }],
          },
        },
      },
    }),
    upsertUserSkill: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          skill: {
            id: 'my-playbook' as SkillId,
            displayName: 'My playbook',
            source: 'user' as const,
            description: 'My playbook',
          },
        },
      },
    }),
    createRoutine: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          routine: {
            routineId: 'routine-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
            botId: 'worker-id' as SessionId,
            identity: 'Ping status',
            intent: 'Ping status',
            scheduleExpr: '@every 5m',
            scheduleLabel: 'Every 5m',
            triggerKind: 'cron' as const,
            status: 'active' as const,
            lastRunAt: null,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      },
    }),
    pauseRoutine: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          routine: {
            routineId: 'routine-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
            botId: 'worker-id' as SessionId,
            identity: 'Ping status',
            intent: 'Ping status',
            scheduleExpr: '@every 5m',
            scheduleLabel: 'Every 5m',
            triggerKind: 'cron' as const,
            status: 'paused' as const,
            lastRunAt: null,
            createdAt: 1,
            updatedAt: 2,
          },
        },
      },
    }),
    resumeRoutine: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          routine: {
            routineId: 'routine-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
            botId: 'worker-id' as SessionId,
            identity: 'Ping status',
            intent: 'Ping status',
            scheduleExpr: '@every 5m',
            scheduleLabel: 'Every 5m',
            triggerKind: 'cron' as const,
            status: 'active' as const,
            lastRunAt: null,
            createdAt: 1,
            updatedAt: 3,
          },
        },
      },
    }),
    writeMemory: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          memory: {
            memoryId: 'memory-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
            kind: 'profile' as const,
            layer: 'agent' as const,
            botId: 'worker-id' as SessionId,
            content: 'Timezone: UTC',
            createdAt: 1,
            updatedAt: 1,
          },
        },
      },
    }),
    listMemories: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          memories: [],
        },
      },
    }),
    listConnectorCatalog: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          catalog: [{
            catalogId: 'verifier-fixture',
            displayName: 'Verifier Fixture Connector',
            serverName: 'verifier_fixture',
            transport: 'stdio' as const,
            fixture: true,
            authMode: 'in_app' as const,
          }],
        },
      },
    }),
    listConnectors: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          connectors: [],
        },
      },
    }),
    installConnector: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          connector: {
            connectorId: 'connector-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').ConnectorId,
            catalogId: 'verifier-fixture',
            serverName: 'verifier_fixture',
            displayName: 'Verifier Fixture Connector',
            installState: 'installed' as const,
            authState: 'needs_auth' as const,
            transport: 'stdio' as const,
            credentialConfigured: false,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      },
    }),
    authenticateConnector: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          connector: {
            connectorId: 'connector-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').ConnectorId,
            catalogId: 'verifier-fixture',
            serverName: 'verifier_fixture',
            displayName: 'Verifier Fixture Connector',
            installState: 'installed' as const,
            authState: 'ready' as const,
            transport: 'stdio' as const,
            credentialConfigured: true,
            createdAt: 1,
            updatedAt: 2,
          },
        },
      },
    }),
    describeConnectorCredential: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          connectorId: 'connector-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').ConnectorId,
          credentialKey: 'agent-teams-connector/connector-1',
          configured: true,
          writable: true,
          kind: 'api-key' as const,
        },
      },
    }),
    invokeConnectorTool: () => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          toolCall: {
            connectorId: 'connector-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').ConnectorId,
            toolName: 'mcp__verifier_fixture__ping',
            outcome: 'success' as const,
          },
        },
      },
    }),
    getTrustPolicy: () => Promise.resolve({
      ok: true as const,
      value: { ok: true as const, value: { policy: 'ask' as const } },
    }),
    setStandingDeny: () => Promise.resolve({
      ok: true as const,
      value: { ok: true as const, value: { policy: 'never' as const } },
    }),
    listPendingTrustApprovals: () => Promise.resolve([]),
    answerTrustApproval: () => Promise.resolve({
      requestId: 'none',
      outcome: 'rejected' as const,
      source: 'user_deny' as const,
    }),
    subscribePendingTrustApprovals: () => () => {},
    createTask: () => Promise.resolve(taskSuccess({ ...task, id: TASK_2, subject: 'New task' })),
    updateTask: () => Promise.resolve({
      ok: true,
      value: { ok: true, value: { ...task, revision: 2 } },
    }),
    openTeammate: () => Promise.resolve(),
    ...overrides,
  }
}

describe('TeamAction', () => {
  it('ignores a stale Team load after the conversation switches sessions', async () => {
    const nextSession = 'next-lead' as SessionId
    const firstLoad = Promise.withResolvers<{ ok: true; value: TeamView }>()
    const nextView: TeamView = {
      ...view,
      members: [{ id: nextSession, name: 'lead', role: 'lead', status: 'idle', diagnostics: [] }],
      tasks: [{ ...task, id: 'task-next' as TeamTaskId, subject: 'Next session task' }],
      unassignedBotIds: [nextSession],
      sections: [],
    }
    const load = vi.fn((sessionId: SessionId) => sessionId === SESSION
      ? firstLoad.promise
      : Promise.resolve({ ok: true as const, value: nextView }))
    const injected = actions({ load })
    const rendered = render(<TeamAction {...props(injected)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await waitFor(() => { expect(load).toHaveBeenCalledWith(SESSION) })

    rendered.rerender(<TeamAction {...props(injected, nextSession)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('Next session task')).toBeTruthy()
    firstLoad.resolve({ ok: true, value: view })
    await Promise.resolve()

    await waitFor(() => {
      expect(screen.getByText('Next session task')).toBeTruthy()
      expect(screen.queryByText('Implement runtime')).toBeNull()
    })
  })

  it('loads roster/task diagnostics on open and navigates a healthy teammate', async () => {
    const openTeammate = vi.fn(() => Promise.resolve())
    render(<TeamAction {...props(actions({ openTeammate }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    const worker = await screen.findByRole('button', { name: /worker/u })
    expect(screen.getByText('write scopes overlap with task-2')).toBeTruthy()
    fireEvent.click(worker)
    await waitFor(() => { expect(openTeammate).toHaveBeenCalledWith(SESSION, view.members[1]) })
  })

  it('creates a Host-owned bot from displayName plus provider/model assignment', async () => {
    const createdMember = {
      id: 'research-id' as SessionId,
      name: 'research-bot',
      role: 'teammate' as const,
      status: 'inactive' as const,
      displayName: 'Research Bot',
      model: 'model-b',
      modelSelection: { provider: 'fixture', model: 'model-b' },
      diagnostics: [] as string[],
    }
    const createBot = vi.fn(() => Promise.resolve({
      ok: true as const,
      value: {
        ok: true as const,
        value: {
          id: createdMember.id,
          displayName: 'Research Bot',
          name: 'research-bot',
          modelSelection: { provider: 'fixture', model: 'model-b' },
          member: createdMember,
        },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockResolvedValueOnce({
        ok: true,
        value: {
          ...view,
          members: [...view.members, createdMember],
          unassignedBotIds: [...view.unassignedBotIds, createdMember.id],
        },
      })
    render(<TeamAction {...props(actions({ load, createBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    expect(screen.getByText(zh.multiModelPending)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    expect(screen.getByText(zh.distinctModelsHint)).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), {
      target: { value: ' Research Bot ' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), {
      target: { value: ' fixture ' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), {
      target: { value: ' model-b ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(createBot).toHaveBeenCalledWith(SESSION, {
        displayName: 'Research Bot',
        modelSelection: { provider: 'fixture', model: 'model-b' },
      })
    })
    expect(await screen.findByText('Research Bot')).toBeTruthy()
    expect(screen.getByText(/research-bot ·/u)).toBeTruthy()
    expect(await screen.findByText(zh.multiModelReady)).toBeTruthy()
    expect(screen.queryByPlaceholderText(zh.displayNamePlaceholder)).toBeNull()
  })

  it('still calls createBot when the draft repeats a roster distinct-models assignment', async () => {
    const createBot = vi.fn(actions().createBot)
    render(<TeamAction {...props(actions({ createBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), {
      target: { value: ' Same Bot ' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), {
      target: { value: ' fixture ' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), {
      target: { value: ' model-a ' },
    })
    expect(screen.getByText(zh.duplicateAssignment)).toBeTruthy()
    expect(screen.queryByText(zh.draftDistinctAssignment)).toBeNull()
    expect((screen.getByRole('button', { name: '保存' }) as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(createBot).toHaveBeenCalledWith(SESSION, {
        displayName: 'Same Bot',
        modelSelection: { provider: 'fixture', model: 'model-a' },
      })
    })
  })

  it('shows a distinct draft message when the draft differs from roster bots', async () => {
    render(<TeamAction {...props(actions())} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), {
      target: { value: 'prov-b' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), {
      target: { value: 'model-b' },
    })
    expect(await screen.findByText(zh.draftDistinctAssignment)).toBeTruthy()
    expect(screen.queryByText(zh.duplicateAssignment)).toBeNull()
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), {
      target: { value: '   ' },
    })
    await waitFor(() => {
      expect(screen.queryByText(zh.draftDistinctAssignment)).toBeNull()
      expect(screen.queryByText(zh.duplicateAssignment)).toBeNull()
    })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), {
      target: { value: 'p'.repeat(201) },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), {
      target: { value: 'model-b' },
    })
    expect(screen.queryByText(zh.draftDistinctAssignment)).toBeNull()
    expect(screen.queryByText(zh.duplicateAssignment)).toBeNull()
  })

  it('shows the distinct-models check cannot pass yet for one teammate pair', async () => {
    const onePair: TeamView = {
      ...view,
      members: [
        {
          id: SESSION,
          name: 'lead',
          role: 'lead',
          status: 'idle',
          provider: 'spawn',
          model: 'lead-model',
          modelSelection: { provider: 'lead-prov', model: 'lead-model' },
          diagnostics: [],
        },
        {
          id: 'backend-only' as SessionId,
          name: 'backend-only',
          role: 'teammate',
          status: 'inactive',
          provider: 'spawn',
          model: 'orphan-model',
          diagnostics: [],
        },
        {
          id: 'worker-id' as SessionId,
          name: 'worker',
          role: 'teammate',
          status: 'inactive',
          model: 'model-a',
          modelSelection: { provider: 'prov-a', model: 'model-a' },
          diagnostics: [],
        },
      ],
    }
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({ ok: true, value: onePair }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText(zh.multiModelPending)).toBeTruthy()
    expect(screen.queryByText(zh.multiModelReady)).toBeNull()
  })

  it('shows the roster meets the distinct-models rule for two teammate pairs', async () => {
    const twoPairs: TeamView = {
      ...view,
      members: [
        {
          id: SESSION,
          name: 'lead',
          role: 'lead',
          status: 'idle',
          diagnostics: [],
        },
        {
          id: 'worker-id' as SessionId,
          name: 'worker',
          role: 'teammate',
          status: 'inactive',
          provider: 'spawn',
          modelSelection: { provider: 'prov-a', model: 'model-a' },
          diagnostics: [],
        },
        {
          id: 'second-id' as SessionId,
          name: 'second',
          role: 'teammate',
          status: 'inactive',
          modelSelection: { provider: 'prov-a', model: 'model-b' },
          diagnostics: [],
        },
      ],
    }
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({ ok: true, value: twoPairs }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText(zh.multiModelReady)).toBeTruthy()
    expect(screen.queryByText(zh.multiModelPending)).toBeNull()
  })

  it('warns when the draft (provider, model) duplicates an existing roster assignment', async () => {
    render(<TeamAction {...props(actions())} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), {
      target: { value: 'fixture' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), {
      target: { value: 'model-a' },
    })
    expect(await screen.findByText(zh.duplicateAssignment)).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), {
      target: { value: 'model-b' },
    })
    await waitFor(() => {
      expect(screen.queryByText(zh.duplicateAssignment)).toBeNull()
    })
  })

  it('hands MISSING_CREDENTIAL create failure to in-app Models settings (not 1Password)', async () => {
    const openModelsSettings = vi.fn()
    const missingCredentialFailure = {
      ok: false as const,
      // Host LLM code on the Remote failure carrier (not a gateway/* code).
      error: {
        code: 'MISSING_CREDENTIAL',
        message: 'no API key for provider route; store through Models page',
      },
    } as unknown as TeamCreateBotActionResult
    const missing = actions({
      openModelsSettings,
      createBot: () => Promise.resolve(missingCredentialFailure),
    })
    render(<TeamAction {...props(missing)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), { target: { value: 'Bot' } })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), { target: { value: 'fixture' } })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), { target: { value: 'model-a' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    const alert = await screen.findByRole('alert')
    expect(alert.getAttribute('data-team-error')).toBe('MISSING_CREDENTIAL')
    expect(alert.textContent).toContain(zh.missingCredential)
    expect(alert.textContent).toMatch(/应用内|模型/u)
    const handoff = screen.getByRole('button', { name: zh.openModelsSettings })
    expect(handoff.hasAttribute('data-missing-credential-handoff')).toBe(true)
    fireEvent.click(handoff)
    expect(openModelsSettings).toHaveBeenCalledTimes(1)
  })

  it('offers Models re-entry for AUTH invalid/revoked create failure (T035)', async () => {
    const openModelsSettings = vi.fn()
    const authFailure = {
      ok: false as const,
      error: {
        code: 'AUTH',
        message: 'provider rejected key',
      },
    } as unknown as TeamCreateBotActionResult
    const revoked = actions({
      openModelsSettings,
      createBot: () => Promise.resolve(authFailure),
    })
    render(<TeamAction {...props(revoked)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), { target: { value: 'Bot' } })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), { target: { value: 'fixture' } })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), { target: { value: 'model-a' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    const alert = await screen.findByRole('alert')
    expect(alert.getAttribute('data-team-error')).toBe('AUTH')
    expect(alert.textContent).toContain(zh.invalidCredential)
    expect(alert.textContent).toMatch(/应用内|模型/u)
    const handoff = screen.getByRole('button', { name: zh.openModelsSettings })
    expect(handoff.hasAttribute('data-invalid-credential-handoff')).toBe(true)
    fireEvent.click(handoff)
    expect(openModelsSettings).toHaveBeenCalledTimes(1)
  })

  it('shows createBot Remote and Team rejections and ignores a late success after session switch', async () => {
    const rejected = actions({
      createBot: () => Promise.resolve({
        ok: true as const,
        value: {
          ok: false as const,
          error: { code: 'team-rejected' as const, message: 'displayName must be non-empty' },
        },
      }),
    })
    const first = render(<TeamAction {...props(rejected)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), { target: { value: 'Bot' } })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), { target: { value: 'fixture' } })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), { target: { value: 'model-a' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('displayName must be non-empty (team-rejected)')).toBeTruthy()
    first.unmount()

    const transport = actions({
      createBot: () => Promise.resolve(remoteFailure('createBot offline')),
    })
    const second = render(<TeamAction {...props(transport)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), { target: { value: 'Bot' } })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), { target: { value: 'fixture' } })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), { target: { value: 'model-a' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('createBot offline (gateway/internal)')).toBeTruthy()
    second.unmount()

    const pending = Promise.withResolvers<Awaited<ReturnType<TeamActionInjected['createBot']>>>()
    const third = render(<TeamAction {...props(actions({ createBot: () => pending.promise }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), { target: { value: 'Late Bot' } })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), { target: { value: 'fixture' } })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), { target: { value: 'model-a' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    third.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    pending.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: 'late-id' as SessionId,
          displayName: 'Late Bot',
          name: 'late-bot',
          modelSelection: { provider: 'fixture', model: 'model-a' },
          member: {
            id: 'late-id' as SessionId,
            name: 'late-bot',
            role: 'teammate',
            status: 'inactive',
            displayName: 'Late Bot',
            diagnostics: [],
          },
        },
      },
    })
    await Promise.resolve()
    expect(screen.queryByText('Late Bot')).toBeNull()
  })

  it('does not settle a successful createBot after its reload switches sessions', async () => {
    const createdMember = {
      id: 'research-id' as SessionId,
      name: 'research-bot',
      role: 'teammate' as const,
      status: 'inactive' as const,
      displayName: 'Reload Bot',
      model: 'model-b',
      diagnostics: [] as string[],
    }
    const reload = Promise.withResolvers<TeamActionResult<TeamView>>()
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockImplementationOnce(() => reload.promise)
    const rendered = render(<TeamAction {...props(actions({
      load,
      createBot: () => Promise.resolve({
        ok: true as const,
        value: {
          ok: true as const,
          value: {
            id: createdMember.id,
            displayName: 'Reload Bot',
            name: 'research-bot',
            modelSelection: { provider: 'fixture', model: 'model-b' },
            member: createdMember,
          },
        },
      }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), { target: { value: 'Reload Bot' } })
    fireEvent.change(screen.getByPlaceholderText(zh.providerPlaceholder), { target: { value: 'fixture' } })
    fireEvent.change(screen.getByPlaceholderText(zh.modelIdPlaceholder), { target: { value: 'model-b' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => { expect(load).toHaveBeenCalledTimes(2) })

    rendered.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    reload.resolve({
      ok: true,
      value: { ...view, members: [...view.members, createdMember] },
    })
    await Promise.resolve()
    await Promise.resolve()
    expect(screen.queryByText('Reload Bot')).toBeNull()
  })

  it('cancels bot create without calling Host createBot', async () => {
    const createBot = vi.fn(actions().createBot)
    render(<TeamAction {...props(actions({ createBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建 Bot/u }))
    fireEvent.change(screen.getByPlaceholderText(zh.displayNamePlaceholder), { target: { value: 'Temp' } })
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByPlaceholderText(zh.displayNamePlaceholder)).toBeNull()
    expect(createBot).not.toHaveBeenCalled()
  })

  it('keeps only the newest overlapping refresh for one session', async () => {
    const older = Promise.withResolvers<TeamActionResult<TeamView>>()
    const newer = Promise.withResolvers<TeamActionResult<TeamView>>()
    const newestView = {
      ...view,
      tasks: [{ ...task, id: 'newest-task' as TeamTaskId, subject: 'Newest task' }],
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockImplementationOnce(() => older.promise)
      .mockImplementationOnce(() => newer.promise)
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')

    const refresh = screen.getByRole('button', { name: zh.refresh })
    fireEvent.click(refresh)
    fireEvent.click(refresh)
    newer.resolve({ ok: true, value: newestView })
    expect(await screen.findByText('Newest task')).toBeTruthy()
    older.resolve({ ok: true, value: view })
    await Promise.resolve()

    expect(screen.getByText('Newest task')).toBeTruthy()
    expect(screen.queryByText('Implement runtime')).toBeNull()
  })

  it('keeps a successful task mutation newer than an in-flight refresh', async () => {
    const stale = Promise.withResolvers<TeamActionResult<TeamView>>()
    const completedView = { ...view, tasks: [{ ...task, revision: 2, status: 'completed' as const }] }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockImplementationOnce(() => stale.promise)
      .mockResolvedValueOnce({ ok: true, value: completedView })
    const updateTask = vi.fn(() => Promise.resolve(
      taskSuccess({ ...task, revision: 2, status: 'completed' }),
    ))
    render(<TeamAction {...props(actions({ load, updateTask }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')

    fireEvent.click(screen.getByRole('button', { name: zh.refresh }))
    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    expect(await screen.findByRole('button', { name: /重开/u })).toBeTruthy()

    stale.resolve({ ok: true, value: view })
    await Promise.resolve()
    expect(screen.getByRole('button', { name: /重开/u })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /完成/u })).toBeNull()
  })

  it('keeps a created task newer than an in-flight refresh', async () => {
    const stale = Promise.withResolvers<TeamActionResult<TeamView>>()
    const createdTask = { ...task, id: TASK_2, subject: 'New task' }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockImplementationOnce(() => stale.promise)
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [...view.tasks, createdTask] } })
    render(<TeamAction {...props(actions({
      load,
      createTask: () => Promise.resolve(taskSuccess(createdTask)),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')

    fireEvent.click(screen.getByRole('button', { name: zh.refresh }))
    fireEvent.click(screen.getByRole('button', { name: /新建任务/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'New task' } })
    fireEvent.change(screen.getByPlaceholderText('任务描述'), { target: { value: 'Details' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('New task')).toBeTruthy()

    stale.resolve({ ok: true, value: view })
    await Promise.resolve()
    expect(screen.getByText('New task')).toBeTruthy()
  })

  it('keeps task and create failures newer than an in-flight refresh', async () => {
    const staleTask = Promise.withResolvers<TeamActionResult<TeamView>>()
    const taskLoad = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockImplementationOnce(() => staleTask.promise)
    const first = render(<TeamAction {...props(actions({
      load: taskLoad,
      updateTask: () => Promise.resolve(taskRejected('task rejected')),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: zh.refresh }))
    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    expect(await screen.findByText('task rejected (team-rejected)')).toBeTruthy()
    staleTask.resolve({ ok: true, value: view })
    await Promise.resolve()
    expect(screen.getByText('task rejected (team-rejected)')).toBeTruthy()
    first.unmount()

    const staleCreate = Promise.withResolvers<TeamActionResult<TeamView>>()
    const createLoad = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockImplementationOnce(() => staleCreate.promise)
    render(<TeamAction {...props(actions({
      load: createLoad,
      createTask: () => Promise.resolve(taskRejected('create rejected')),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: zh.refresh }))
    fireEvent.click(screen.getByRole('button', { name: /新建任务/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Rejected task' } })
    fireEvent.change(screen.getByPlaceholderText('任务描述'), { target: { value: 'Rejected details' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('create rejected (team-rejected)')).toBeTruthy()
    staleCreate.resolve({ ok: true, value: view })
    await Promise.resolve()
    expect(screen.getByText('create rejected (team-rejected)')).toBeTruthy()
  })

  it('tracks simultaneous create and task mutations independently', async () => {
    const create = Promise.withResolvers<TeamTaskActionResult>()
    const createdTask = { ...task, id: TASK_2, subject: 'Concurrent task' }
    const completedTask = { ...task, revision: 2, status: 'completed' as const }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [completedTask] } })
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [completedTask, createdTask] } })
    const createTask = vi.fn(() => create.promise)
    render(<TeamAction {...props(actions({ load, createTask }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建任务/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Concurrent task' } })
    fireEvent.change(screen.getByPlaceholderText('任务描述'), { target: { value: 'Concurrent details' } })
    const save = screen.getByRole<HTMLButtonElement>('button', { name: '保存' })
    fireEvent.click(save)
    await waitFor(() => { expect(save.disabled).toBe(true) })

    const complete = screen.getByRole<HTMLButtonElement>('button', { name: /完成/u })
    expect(complete.disabled).toBe(false)
    fireEvent.click(complete)
    expect(await screen.findByRole('button', { name: /重开/u })).toBeTruthy()
    expect(save.disabled).toBe(true)
    fireEvent.click(save)
    expect(createTask).toHaveBeenCalledTimes(1)

    create.resolve(taskSuccess(createdTask))
    expect(await screen.findByText('Concurrent task')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '保存' })).toBeNull()
  })

  it('reloads derived fields for every task after a mutation', async () => {
    const related = {
      ...task,
      id: TASK_2,
      subject: 'Related task',
      writeScopeWarnings: ['old warning'],
    }
    const completed = { ...task, revision: 2, status: 'completed' as const }
    const refreshed = {
      ...view,
      tasks: [completed, { ...related, writeScopeWarnings: ['derived warning refreshed'] }],
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [task, related] } })
      .mockResolvedValueOnce({ ok: true, value: refreshed })
    render(<TeamAction {...props(actions({
      load,
      updateTask: () => Promise.resolve(taskSuccess(completed)),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('old warning')
    fireEvent.click(screen.getAllByRole('button', { name: /完成/u })[0]!)

    expect(await screen.findByText('derived warning refreshed')).toBeTruthy()
    expect(screen.queryByText('old warning')).toBeNull()
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('creates a task from normalized blocker and write-scope lists', async () => {
    const createTask = vi.fn(actions().createTask)
    render(<TeamAction {...props(actions({ createTask }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建任务/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: ' New task ' } })
    fireEvent.change(screen.getByPlaceholderText('任务描述'), { target: { value: ' Details ' } })
    fireEvent.change(screen.getByPlaceholderText(/依赖任务/u), { target: { value: 'task-1, task-1' } })
    fireEvent.change(screen.getByPlaceholderText(/写入范围/u), { target: { value: 'src/a, src/b' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith(SESSION, {
        subject: 'New task',
        description: 'Details',
        blockedBy: ['task-1'],
        writeScopes: ['src/a', 'src/b'],
      })
    })
  })

  it('assigns, edits, completes, reopens, and deletes with contiguous CAS revisions', async () => {
    let current = { ...task }
    const updateTask: TeamActionInjected['updateTask'] = vi.fn((
      _sessionId: SessionId,
      input: Parameters<TeamActionInjected['updateTask']>[1],
    ) => {
      const revision = current.revision + 1
      switch (input.action) {
        case 'reassign':
          current = {
            ...current,
            revision,
            status: 'in_progress',
            ownerName: input.owner ?? 'lead',
          }
          break
        case 'edit':
          current = {
            ...current,
            revision,
            subject: input.subject ?? current.subject,
            description: input.description ?? current.description,
            writeScopes: input.writeScopes ?? current.writeScopes,
          }
          break
        case 'set_dependencies':
          current = { ...current, revision, blockedBy: input.blockedBy ?? [] }
          break
        case 'complete':
          current = { ...current, revision, status: 'completed' }
          break
        case 'reopen': {
          const { ownerName: _ownerName, ...unowned } = current
          current = { ...unowned, revision, status: 'pending', ready: true }
          break
        }
        case 'delete':
          current = { ...current, revision, status: 'deleted' }
          break
        default:
          throw new Error(`unexpected action ${input.action}`)
      }
      return Promise.resolve(taskSuccess(current))
    })
    const load = vi.fn(() => Promise.resolve({
      ok: true as const,
      value: { ...view, tasks: current.status === 'deleted' ? [] : [current] },
    }))
    render(<TeamAction {...props(actions({ load, updateTask }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')

    fireEvent.change(screen.getByRole('combobox', { name: zh.owner }), { target: { value: 'worker' } })
    await waitFor(() => {
      expect(screen.getByRole<HTMLSelectElement>('combobox', { name: zh.owner }).value).toBe('worker')
      expect(current).toMatchObject({ revision: 2, ownerName: 'worker' })
    })

    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Updated runtime' } })
    fireEvent.change(screen.getByPlaceholderText('任务描述'), { target: { value: 'Updated details' } })
    fireEvent.change(screen.getByPlaceholderText(/依赖任务/u), { target: { value: 'task-0' } })
    fireEvent.change(screen.getByPlaceholderText(/写入范围/u), { target: { value: 'src/runtime' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('Updated runtime')).toBeTruthy()
    expect(current).toMatchObject({
      revision: 4,
      description: 'Updated details',
      blockedBy: ['task-0'],
      writeScopes: ['src/runtime'],
    })

    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    fireEvent.click(await screen.findByRole('button', { name: /重开/u }))
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /重开/u })).toBeNull()
      expect(current).toMatchObject({ revision: 6, status: 'pending' })
    })
    fireEvent.click(screen.getByRole('button', { name: /^删除$/u }))
    await waitFor(() => { expect(screen.queryByText('Updated runtime')).toBeNull() })

    expect(vi.mocked(updateTask).mock.calls.map(([, input]) => [input.action, input.expectedRevision]))
      .toEqual([
        ['reassign', 1],
        ['edit', 2],
        ['set_dependencies', 3],
        ['complete', 4],
        ['reopen', 5],
        ['delete', 6],
      ])
  })

  it('reloads and warns instead of retrying a stale task mutation', async () => {
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [{ ...task, revision: 2 }] } })
    const updateTask = vi.fn(() => Promise.resolve(taskConflict('stale')))
    render(<TeamAction {...props(actions({ load, updateTask }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    expect(await screen.findByText(zh.conflict)).toBeTruthy()
    expect(load).toHaveBeenCalledTimes(2)
    expect(updateTask).toHaveBeenCalledTimes(1)
  })

  it('keeps reload failures visible after task and dependency conflicts', async () => {
    const taskLoad = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockResolvedValueOnce(remoteFailure('task reload failed'))
    const first = render(<TeamAction {...props(actions({
      load: taskLoad,
      updateTask: () => Promise.resolve(taskConflict('stale task')),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    expect(await screen.findByText('task reload failed (gateway/internal)')).toBeTruthy()
    expect(screen.queryByText(zh.conflict)).toBeNull()
    first.unmount()

    const dependencyLoad = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [{ ...task, revision: 2, subject: 'Edited' }] } })
      .mockResolvedValueOnce(remoteFailure('dependency reload failed'))
    const dependencyUpdate = vi.fn()
      .mockResolvedValueOnce(taskSuccess({ ...task, revision: 2, subject: 'Edited' }))
      .mockResolvedValueOnce(taskConflict('stale dependency'))
    render(<TeamAction {...props(actions({ load: dependencyLoad, updateTask: dependencyUpdate }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Edited' } })
    fireEvent.change(screen.getByPlaceholderText(zh.blockers), { target: { value: 'task-2' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('dependency reload failed (gateway/internal)')).toBeTruthy()
    expect(screen.queryByText(zh.conflict)).toBeNull()
  })

  it('renders roster/task state variants and contains navigation, refresh, and close actions', async () => {
    const { ownerName: _ownerName, ...unownedTask } = task
    const richView: TeamView = {
      ...view,
      members: [
        view.members[0]!,
        { ...view.members[1]!, status: 'running' },
        {
          id: 'failed-id' as SessionId,
          name: 'failed-worker',
          role: 'teammate',
          status: 'failed',
          diagnostics: ['provider failed'],
        },
        {
          id: 'provisioning-id' as SessionId,
          name: 'provisioning-worker',
          role: 'teammate',
          status: 'provisioning',
          diagnostics: [],
        },
      ],
      unassignedBotIds: [
        SESSION,
        'worker-id' as SessionId,
        'failed-id' as SessionId,
        'provisioning-id' as SessionId,
      ],
      tasks: [
        { ...unownedTask, id: 'ready-task' as TeamTaskId, status: 'pending', ready: true },
        { ...unownedTask, id: 'blocked-task' as TeamTaskId, status: 'pending', ready: false },
        { ...task, id: 'completed-task' as TeamTaskId, status: 'completed' },
      ],
    }
    const load = vi.fn(() => Promise.resolve({ ok: true as const, value: richView }))
    const openTeammate = vi.fn(() => Promise.reject(new Error('navigation failed')))
    render(<TeamAction {...props(actions({ load, openTeammate }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('provider failed')).toBeTruthy()
    expect(screen.getByText(zh.ready)).toBeTruthy()
    expect(screen.getByText(zh.blocked)).toBeTruthy()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /failed-worker/u }).disabled).toBe(true)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /provisioning-worker/u }).disabled).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: /^worker运行中/u }))
    expect(await screen.findByText('Error: navigation failed')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.refresh }))
    await waitFor(() => { expect(load).toHaveBeenCalledTimes(2) })
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByRole('dialog')
    fireEvent.click(screen.getByRole('button', { name: zh.close }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows load and create failures and ignores a create result after a session switch', async () => {
    const failedLoad = actions({
      load: () => Promise.resolve(remoteFailure('load failed')),
    })
    const first = render(<TeamAction {...props(failedLoad)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('load failed (gateway/internal)')).toBeTruthy()
    first.unmount()

    const createTask = vi.fn(() => Promise.resolve(remoteFailure('create failed')))
    const second = render(<TeamAction {...props(actions({ createTask }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建任务/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Task' } })
    fireEvent.change(screen.getByPlaceholderText('任务描述'), { target: { value: 'Description' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('create failed (gateway/internal)')).toBeTruthy()
    second.unmount()

    const pending = Promise.withResolvers<TeamTaskActionResult>()
    const third = render(<TeamAction {...props(actions({ createTask: () => pending.promise }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /新建任务/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Late task' } })
    fireEvent.change(screen.getByPlaceholderText('任务描述'), { target: { value: 'Late description' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    third.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    pending.resolve(taskSuccess({ ...task, id: 'late-task' as TeamTaskId }))
    await Promise.resolve()
    expect(screen.queryByText('Late task')).toBeNull()
  })

  it('contains stale-session and ordinary task failures without retrying', async () => {
    const pending = Promise.withResolvers<TeamTaskActionResult>()
    const rendered = render(<TeamAction {...props(actions({ updateTask: () => pending.promise }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    rendered.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    pending.resolve(taskSuccess({ ...task, revision: 2, status: 'completed' }))
    await Promise.resolve()
    expect(screen.queryByText('Implement runtime')).toBeNull()
    rendered.unmount()

    render(<TeamAction {...props(actions({
      updateTask: () => Promise.resolve(taskRejected('update failed')),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    expect(await screen.findByText('update failed (team-rejected)')).toBeTruthy()
  })

  it('does not publish a task conflict after its reload switches sessions', async () => {
    const reload = Promise.withResolvers<TeamActionResult<TeamView>>()
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockImplementationOnce(() => reload.promise)
    const rendered = render(<TeamAction {...props(actions({
      load,
      updateTask: () => Promise.resolve(taskConflict('stale task')),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    await waitFor(() => { expect(load).toHaveBeenCalledTimes(2) })

    rendered.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    reload.resolve({ ok: true, value: view })
    await Promise.resolve()
    await Promise.resolve()
    expect(screen.queryByText(zh.conflict)).toBeNull()
  })

  it('does not settle a successful task after its reload switches sessions', async () => {
    const reload = Promise.withResolvers<TeamActionResult<TeamView>>()
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockImplementationOnce(() => reload.promise)
    const rendered = render(<TeamAction {...props(actions({
      load,
      updateTask: () => Promise.resolve(taskSuccess({ ...task, revision: 2, status: 'completed' })),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /完成/u }))
    await waitFor(() => { expect(load).toHaveBeenCalledTimes(2) })

    rendered.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    reload.resolve({ ok: true, value: { ...view, tasks: [{ ...task, revision: 2, status: 'completed' }] } })
    await Promise.resolve()
    await Promise.resolve()
    expect(screen.queryByText('Implement runtime')).toBeNull()
  })

  it('contains edit and dependency failures and supports form cancellation and unassignment', async () => {
    const { ownerName: _ownerName, ...unownedTask } = task
    const updateTask = vi.fn()
      .mockResolvedValueOnce(remoteFailure('edit failed'))
      .mockResolvedValueOnce(taskSuccess({ ...task, revision: 2, subject: 'Saved edit' }))
      .mockResolvedValueOnce(taskRejected('dependency failed'))
      .mockResolvedValueOnce(taskSuccess({ ...unownedTask, revision: 2 }))
    render(<TeamAction {...props(actions({ updateTask }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')

    fireEvent.click(screen.getByRole('button', { name: /新建任务/u }))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByPlaceholderText('任务标题')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByRole('button', { name: '保存' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('edit failed (gateway/internal)')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Saved edit' } })
    fireEvent.change(screen.getByPlaceholderText(zh.blockers), { target: { value: 'task-2' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('dependency failed (team-rejected)')).toBeTruthy()
    expect(updateTask.mock.calls[2]?.[1]).toMatchObject({
      action: 'set_dependencies',
      expectedRevision: 2,
      blockedBy: ['task-2'],
    })

    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    fireEvent.change(screen.getByRole('combobox', { name: zh.owner }), { target: { value: '' } })
    await waitFor(() => {
      expect(updateTask).toHaveBeenLastCalledWith(SESSION, expect.objectContaining({
        action: 'reassign',
      }))
      expect(updateTask.mock.calls.at(-1)?.[1]).not.toHaveProperty('owner')
    })
  })

  it('shows a Remote carrier failure from the dependency mutation', async () => {
    const updateTask = vi.fn()
      .mockResolvedValueOnce(taskSuccess({ ...task, revision: 2, subject: 'Edited' }))
      .mockResolvedValueOnce(remoteFailure('dependency transport failed'))
    render(<TeamAction {...props(actions({ updateTask }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Edited' } })
    fireEvent.change(screen.getByPlaceholderText(zh.blockers), { target: { value: 'task-2' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    expect(await screen.findByText('dependency transport failed (gateway/internal)')).toBeTruthy()
  })

  it('skips the dependency mutation when an edit keeps the same blockers', async () => {
    const blockedTask: TeamTask = { ...task, blockedBy: ['task-0' as TeamTaskId] }
    const updateTask = vi.fn().mockResolvedValue(
      taskSuccess({ ...blockedTask, revision: 2, subject: 'Same dependencies' }),
    )
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({ ok: true, value: { ...view, tasks: [blockedTask] } }),
      updateTask,
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Same dependencies' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => { expect(screen.queryByRole('button', { name: '保存' })).toBeNull() })
    expect(updateTask).toHaveBeenCalledTimes(1)
    expect(updateTask).toHaveBeenCalledWith(SESSION, expect.objectContaining({ action: 'edit' }))
  })

  it('reloads a dependency conflict and ignores dependency settlement after a session switch', async () => {
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [{ ...task, revision: 2, subject: 'Conflict edit' }] } })
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [{ ...task, revision: 3 }] } })
    const conflictUpdate = vi.fn()
      .mockResolvedValueOnce(taskSuccess({ ...task, revision: 2, subject: 'Conflict edit' }))
      .mockResolvedValueOnce(taskConflict('stale dependency'))
    const first = render(<TeamAction {...props(actions({ load, updateTask: conflictUpdate }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Conflict edit' } })
    fireEvent.change(screen.getByPlaceholderText(zh.blockers), { target: { value: 'task-2' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText(zh.conflict)).toBeTruthy()
    expect(load).toHaveBeenCalledTimes(3)
    first.unmount()

    const dependencyReload = Promise.withResolvers<TeamActionResult<TeamView>>()
    const dependencyLoad = vi.fn()
      .mockResolvedValueOnce({ ok: true, value: view })
      .mockResolvedValueOnce({ ok: true, value: { ...view, tasks: [{ ...task, revision: 2, subject: 'Late edit' }] } })
      .mockImplementationOnce(() => dependencyReload.promise)
    const staleUpdate = vi.fn()
      .mockResolvedValueOnce(taskSuccess({ ...task, revision: 2, subject: 'Late edit' }))
      .mockResolvedValueOnce(taskConflict('stale dependency'))
    const second = render(<TeamAction {...props(actions({ load: dependencyLoad, updateTask: staleUpdate }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Late edit' } })
    fireEvent.change(screen.getByPlaceholderText(zh.blockers), { target: { value: 'task-2' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => { expect(dependencyLoad).toHaveBeenCalledTimes(3) })
    second.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    dependencyReload.resolve({ ok: true, value: { ...view, tasks: [{ ...task, revision: 3 }] } })
    await Promise.resolve()
    await Promise.resolve()
    expect(screen.queryByText(zh.conflict)).toBeNull()
    second.unmount()

    const dependency = Promise.withResolvers<TeamTaskActionResult>()
    const lateUpdate = vi.fn()
      .mockResolvedValueOnce(taskSuccess({ ...task, revision: 2, subject: 'Late edit' }))
      .mockImplementationOnce(() => dependency.promise)
    const third = render(<TeamAction {...props(actions({ updateTask: lateUpdate }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: /^编辑$/u }))
    fireEvent.change(screen.getByPlaceholderText('任务标题'), { target: { value: 'Late edit' } })
    fireEvent.change(screen.getByPlaceholderText(zh.blockers), { target: { value: 'task-2' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => { expect(lateUpdate).toHaveBeenCalledTimes(2) })
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '保存' }).disabled).toBe(true)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '取消' }).disabled).toBe(true)
    third.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    dependency.resolve(taskSuccess({ ...task, revision: 3, subject: 'Late dependency' }))
    await Promise.resolve()
    expect(screen.queryByText('Late dependency')).toBeNull()
  })

  it('renders Host mailbox handoffs from agentTeams/view with deliveryState (T023)', async () => {
    const handoff: HostMailboxMessage = {
      id: 'team-message-visible' as TeamMessageId,
      fromBotId: SESSION,
      toBotId: 'worker-id' as SessionId,
      body: [{ type: 'text', text: 'handoff body for Client' }],
      createdAt: 1_700_000_000_000,
      deliveryState: 'visible-pending',
      source: { kind: 'host-mailbox' },
    }
    const withHandoff: TeamView = { ...view, handoffs: [handoff] }
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({ ok: true, value: withHandoff }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText(zh.handoffs)).toBeTruthy()
    const row = await screen.findByText('handoff body for Client')
    const article = row.closest('[data-team-handoff]')
    expect(article).not.toBeNull()
    expect(article?.getAttribute('data-delivery-state')).toBe('visible-pending')
    expect(article?.getAttribute('data-handoff-source')).toBe('host-mailbox')
    expect(screen.getByText(zh['deliveryState.visible-pending'])).toBeTruthy()
    expect(screen.getByText(new RegExp(`${zh.handoffFrom}:\\s*lead`, 'u'))).toBeTruthy()
    expect(screen.getByText(new RegExp(`${zh.handoffTo}:\\s*worker`, 'u'))).toBeTruthy()
  })

  it('shows the empty handoffs notice when the Host projection has none', async () => {
    render(<TeamAction {...props(actions())} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText(zh.handoffsEmpty)).toBeTruthy()
  })

  it('saves persona through Host updatePersona and shows anti-jobs on the overview (T016/T017)', async () => {
    const workerId = 'worker-id' as SessionId
    const priorMember = {
      ...view.members[1]!,
      persona: { job: 'review', voice: 'terse', antiJobs: ['merge without tests'] },
    }
    const savedPersona = {
      job: 'ship',
      voice: 'direct',
      antiJobs: ['docs', 'ops'],
    }
    const savedMember = { ...priorMember, persona: savedPersona }
    const updatePersona = vi.fn((): Promise<TeamUpdatePersonaActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: workerId,
          persona: savedPersona,
          member: savedMember,
        },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, members: [view.members[0]!, priorMember] },
      })
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, members: [view.members[0]!, savedMember] },
      })
    render(<TeamAction {...props(actions({ load, updatePersona }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText(zh.antiJobs)).toBeTruthy()
    const overview = screen.getByText('merge without tests').closest('[data-team-anti-jobs]')
    expect(overview).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: zh.editPersona }))
    expect(screen.getByText(zh.personaHint)).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText(zh.personaJobPlaceholder), {
      target: { value: ' ship ' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.personaVoicePlaceholder), {
      target: { value: ' direct ' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.personaAntiJobsPlaceholder), {
      target: { value: 'docs\nops' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(updatePersona).toHaveBeenCalledWith(SESSION, {
        botId: workerId,
        job: ' ship ',
        voice: ' direct ',
        antiJobs: ['docs', 'ops'],
      })
    })
    expect(await screen.findByText('docs')).toBeTruthy()
    expect(screen.getByText('ops')).toBeTruthy()
    expect(screen.queryByText('merge without tests')).toBeNull()
    expect(screen.queryByPlaceholderText(zh.personaJobPlaceholder)).toBeNull()
  })

  it('keeps prior overview anti-jobs and shows failure when updatePersona is unavailable (T018)', async () => {
    const workerId = 'worker-id' as SessionId
    const priorMember = {
      ...view.members[1]!,
      persona: { job: 'review', voice: 'terse', antiJobs: ['merge without tests'] },
    }
    const priorView: TeamView = { ...view, members: [view.members[0]!, priorMember] }
    const updatePersona = vi.fn((): Promise<TeamUpdatePersonaActionResult> => Promise.resolve(
      remoteFailure('persona Host offline') as TeamUpdatePersonaActionResult,
    ))
    const load = vi.fn(() => Promise.resolve({ ok: true as const, value: priorView }))
    render(<TeamAction {...props(actions({ load, updatePersona }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('merge without tests')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.editPersona }))
    fireEvent.change(screen.getByPlaceholderText(zh.personaAntiJobsPlaceholder), {
      target: { value: 'should-not-stick' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('persona Host offline (gateway/internal)')).toBeTruthy()
    expect(updatePersona).toHaveBeenCalledWith(SESSION, {
      botId: workerId,
      job: 'review',
      voice: 'terse',
      antiJobs: ['should-not-stick'],
    })
    const overview = screen.getByText('merge without tests').closest('[data-team-anti-jobs]')
    expect(overview).not.toBeNull()
    expect(overview?.textContent).toContain('merge without tests')
    expect(overview?.textContent).not.toContain('should-not-stick')
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('shows Team rejection for updatePersona without mutating overview persona (T018)', async () => {
    const priorMember = {
      ...view.members[1]!,
      persona: { job: 'review', voice: '', antiJobs: ['docs'] },
    }
    const priorView: TeamView = { ...view, members: [view.members[0]!, priorMember] }
    const updatePersona = vi.fn((): Promise<TeamUpdatePersonaActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: false,
        error: { code: 'team-rejected', message: 'only the Team Lead can update teammate persona' },
      },
    }))
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({ ok: true, value: priorView }),
      updatePersona,
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('docs')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.editPersona }))
    fireEvent.change(screen.getByPlaceholderText(zh.personaJobPlaceholder), {
      target: { value: 'hijack' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText(
      'only the Team Lead can update teammate persona (team-rejected)',
    )).toBeTruthy()
    const overview = document.querySelector('[data-team-anti-jobs]')
    expect(overview?.textContent).toContain('docs')
    expect(screen.getByPlaceholderText(zh.personaJobPlaceholder)).toBeTruthy()
  })

  it('opens an empty persona editor when the teammate has no Host persona yet', async () => {
    render(<TeamAction {...props(actions())} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    expect(document.querySelector('[data-team-anti-jobs]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: zh.editPersona }))
    expect((screen.getByPlaceholderText(zh.personaJobPlaceholder) as HTMLInputElement).value).toBe('')
    expect((screen.getByPlaceholderText(zh.personaVoicePlaceholder) as HTMLInputElement).value).toBe('')
    expect((screen.getByPlaceholderText(zh.personaAntiJobsPlaceholder) as HTMLTextAreaElement).value).toBe('')
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByPlaceholderText(zh.personaJobPlaceholder)).toBeNull()
  })

  it('ignores a late updatePersona success after the conversation switches sessions', async () => {
    const workerId = 'worker-id' as SessionId
    const pending = Promise.withResolvers<TeamUpdatePersonaActionResult>()
    const updatePersona = vi.fn(() => pending.promise)
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: view })
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ...view,
          members: [{
            id: 'next-lead' as SessionId,
            name: 'lead',
            role: 'lead' as const,
            status: 'idle' as const,
            diagnostics: [] as string[],
          }],
          tasks: [],
        },
      })
    const rendered = render(<TeamAction {...props(actions({ load, updatePersona }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: zh.editPersona }))
    fireEvent.change(screen.getByPlaceholderText(zh.personaJobPlaceholder), {
      target: { value: 'late' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    rendered.rerender(<TeamAction {...props(actions({ load, updatePersona }), 'next-lead' as SessionId)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText(zh.empty)
    pending.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: workerId,
          persona: { job: 'late', voice: '', antiJobs: [] },
          member: {
            id: workerId,
            name: 'worker',
            role: 'teammate',
            status: 'inactive',
            persona: { job: 'late', voice: '', antiJobs: [] },
            diagnostics: [],
          },
        },
      },
    })
    await Promise.resolve()
    expect(screen.queryByText('late')).toBeNull()
  })

  it('does not settle a successful updatePersona after its reload switches sessions', async () => {
    const workerId = 'worker-id' as SessionId
    const savedPersona = { job: 'reload-job', voice: '', antiJobs: ['reload-anti'] }
    const savedMember = {
      ...view.members[1]!,
      persona: savedPersona,
    }
    const reload = Promise.withResolvers<TeamActionResult<TeamView>>()
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: view })
      .mockImplementationOnce(() => reload.promise)
    const updatePersona = vi.fn((): Promise<TeamUpdatePersonaActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: workerId,
          persona: savedPersona,
          member: savedMember,
        },
      },
    }))
    const rendered = render(<TeamAction {...props(actions({ load, updatePersona }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Implement runtime')
    fireEvent.click(screen.getByRole('button', { name: zh.editPersona }))
    fireEvent.change(screen.getByPlaceholderText(zh.personaJobPlaceholder), {
      target: { value: 'reload-job' },
    })
    fireEvent.change(screen.getByPlaceholderText(zh.personaAntiJobsPlaceholder), {
      target: { value: 'reload-anti' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => { expect(load).toHaveBeenCalledTimes(2) })
    rendered.rerender(<TeamAction {...props(actions(), 'next-session' as SessionId)} />)
    reload.resolve({
      ok: true,
      value: { ...view, members: [view.members[0]!, savedMember] },
    })
    await Promise.resolve()
    await Promise.resolve()
    expect(screen.queryByText('reload-anti')).toBeNull()
  })

  it('renames a bot through Host renameBot and shows the new displayName on the overview (T023)', async () => {
    const workerId = 'worker-id' as SessionId
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Rename Source',
    }
    const savedMember = { ...priorMember, displayName: 'Rename Target' }
    const renameBot = vi.fn((): Promise<TeamRenameBotActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: workerId,
          displayName: 'Rename Target',
          member: savedMember,
        },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, members: [view.members[0]!, priorMember] },
      })
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, members: [view.members[0]!, savedMember] },
      })
    render(<TeamAction {...props(actions({ load, renameBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('Rename Source')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.rename }))
    expect(screen.getByText(zh.renameHint)).toBeTruthy()
    const renameInput = screen.getByPlaceholderText(zh.renamePlaceholder) as HTMLInputElement
    expect(renameInput.value).toBe('Rename Source')
    fireEvent.change(renameInput, { target: { value: '   ' } })
    expect((screen.getByRole('button', { name: '保存' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(renameInput, { target: { value: 'Rename Target' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(renameBot).toHaveBeenCalledWith(SESSION, {
        botId: workerId,
        displayName: 'Rename Target',
      })
    })
    expect(await screen.findByText('Rename Target')).toBeTruthy()
    expect(screen.queryByText('Rename Source')).toBeNull()
    expect(screen.queryByPlaceholderText(zh.renamePlaceholder)).toBeNull()
  })

  it('keeps prior displayName and shows failure when renameBot is unavailable (T023)', async () => {
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Rename Source',
    }
    const renameBot = vi.fn((): Promise<TeamRenameBotActionResult> => Promise.resolve(
      remoteFailure('rename Host offline') as TeamRenameBotActionResult,
    ))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, members: [view.members[0]!, priorMember] },
    })
    render(<TeamAction {...props(actions({ load, renameBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('Rename Source')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.rename }))
    fireEvent.change(screen.getByPlaceholderText(zh.renamePlaceholder), {
      target: { value: 'Rename Target' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('rename Host offline (gateway/internal)')).toBeTruthy()
    expect(screen.getByText('Rename Source')).toBeTruthy()
    expect(screen.getByPlaceholderText(zh.renamePlaceholder)).toBeTruthy()
  })

  it('shows Team rejection for renameBot without mutating overview displayName (T023)', async () => {
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Rename Source',
    }
    const renameBot = vi.fn((): Promise<TeamRenameBotActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: false,
        error: { code: 'team-rejected', message: 'displayName must be non-empty' },
      },
    }))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, members: [view.members[0]!, priorMember] },
    })
    render(<TeamAction {...props(actions({ load, renameBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Rename Source')
    fireEvent.click(screen.getByRole('button', { name: zh.rename }))
    fireEvent.change(screen.getByPlaceholderText(zh.renamePlaceholder), {
      target: { value: 'Rename Target' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('displayName must be non-empty (team-rejected)')).toBeTruthy()
    expect(screen.getByText('Rename Source')).toBeTruthy()
    expect(screen.getByPlaceholderText(zh.renamePlaceholder)).toBeTruthy()
  })

  it('sets a preset avatar through Host setAvatar and shows the marker on the overview (T023)', async () => {
    const workerId = 'worker-id' as SessionId
    const priorMember = { ...view.members[1]! }
    const savedAvatar = { shape: 'circle' as const, color: 'blue' as const }
    const savedMember = { ...priorMember, avatar: savedAvatar }
    const setAvatar = vi.fn((): Promise<TeamSetAvatarActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: workerId,
          avatar: savedAvatar,
          member: savedMember,
        },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, members: [view.members[0]!, priorMember] },
      })
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, members: [view.members[0]!, savedMember] },
      })
    render(<TeamAction {...props(actions({ load, setAvatar }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByRole('button', { name: zh.editAvatar })
    fireEvent.click(screen.getByRole('button', { name: zh.editAvatar }))
    expect(screen.getByText(zh.avatarHint)).toBeTruthy()
    expect(document.querySelector('[data-team-avatar-editor] input[type="file"]')).toBeNull()
    expect((screen.getByRole('button', { name: '保存' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: zh['avatarShape.circle'] }))
    fireEvent.click(screen.getByRole('button', { name: zh['avatarColor.blue'] }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(setAvatar).toHaveBeenCalledWith(SESSION, {
        botId: workerId,
        avatar: { shape: 'circle', color: 'blue' },
      })
    })
    const marker = await screen.findByLabelText(`${zh['avatarShape.circle']} · ${zh['avatarColor.blue']}`)
    expect(marker.getAttribute('data-team-avatar')).toBe('')
    expect(marker.getAttribute('data-avatar-shape')).toBe('circle')
    expect(marker.getAttribute('data-avatar-color')).toBe('blue')
    expect(screen.queryByText(zh.avatarHint)).toBeNull()
  })

  it('keeps prior avatar and shows failure when setAvatar is unavailable (T023)', async () => {
    const priorMember = {
      ...view.members[1]!,
      avatar: { shape: 'square' as const, color: 'green' as const },
    }
    const setAvatar = vi.fn((): Promise<TeamSetAvatarActionResult> => Promise.resolve(
      remoteFailure('avatar Host offline') as TeamSetAvatarActionResult,
    ))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, members: [view.members[0]!, priorMember] },
    })
    render(<TeamAction {...props(actions({ load, setAvatar }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByLabelText(`${zh['avatarShape.square']} · ${zh['avatarColor.green']}`)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.editAvatar }))
    fireEvent.click(screen.getByRole('button', { name: zh['avatarShape.circle'] }))
    fireEvent.click(screen.getByRole('button', { name: zh['avatarColor.blue'] }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('avatar Host offline (gateway/internal)')).toBeTruthy()
    expect(screen.getByLabelText(`${zh['avatarShape.square']} · ${zh['avatarColor.green']}`)).toBeTruthy()
    expect(screen.getByText(zh.avatarHint)).toBeTruthy()
  })

  it('omits custom image upload controls so preset avatar Pass is not blocked (T024)', async () => {
    render(<TeamAction {...props(actions())} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByRole('button', { name: zh.editAvatar })
    fireEvent.click(screen.getByRole('button', { name: zh.editAvatar }))
    const editor = screen.getByText(zh.avatarHint).closest('[data-team-avatar-editor]')
    expect(editor).not.toBeNull()
    expect(editor!.querySelector('input[type="file"]')).toBeNull()
    expect(editor!.querySelector('[data-avatar-upload]')).toBeNull()
    expect(screen.getByRole('button', { name: zh['avatarShape.circle'] })).toBeTruthy()
    expect(screen.getByRole('button', { name: zh['avatarColor.blue'] })).toBeTruthy()
  })

  it('requires explicit confirm before Host deleteBot and removes the bot from overview (T027)', async () => {
    const workerId = 'worker-id' as SessionId
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Delete Target',
    }
    const deleteBot = vi.fn((): Promise<TeamDeleteBotActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: { id: workerId },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, members: [view.members[0]!, priorMember] },
      })
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, members: [view.members[0]!] },
      })
    render(<TeamAction {...props(actions({ load, deleteBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('Delete Target')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.deleteBot }))
    expect(screen.getByText(zh.deleteConfirmHint)).toBeTruthy()
    expect(deleteBot).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: zh.confirmDelete }))
    await waitFor(() => {
      expect(deleteBot).toHaveBeenCalledWith(SESSION, { botId: workerId })
    })
    await waitFor(() => {
      expect(screen.queryByText('Delete Target')).toBeNull()
      expect(screen.queryByText(zh.deleteConfirmHint)).toBeNull()
    })
  })

  it('cancels pending confirm without calling Host deleteBot (T027)', async () => {
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Keep Me',
    }
    const deleteBot = vi.fn((): Promise<TeamDeleteBotActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { id: 'worker-id' as SessionId } },
    }))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, members: [view.members[0]!, priorMember] },
    })
    render(<TeamAction {...props(actions({ load, deleteBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('Keep Me')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.deleteBot }))
    expect(screen.getByText(zh.deleteConfirmHint)).toBeTruthy()
    fireEvent.click(document.querySelector('[data-team-cancel-delete]')!)
    expect(deleteBot).not.toHaveBeenCalled()
    expect(screen.getByText('Keep Me')).toBeTruthy()
    expect(screen.queryByText(zh.deleteConfirmHint)).toBeNull()
    expect(screen.getByRole('button', { name: zh.deleteBot })).toBeTruthy()
  })

  it('keeps the bot listed and shows failure when deleteBot is unavailable (T027)', async () => {
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Stay Listed',
    }
    const deleteBot = vi.fn((): Promise<TeamDeleteBotActionResult> => Promise.resolve(
      remoteFailure('delete Host offline') as TeamDeleteBotActionResult,
    ))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, members: [view.members[0]!, priorMember] },
    })
    render(<TeamAction {...props(actions({ load, deleteBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('Stay Listed')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.deleteBot }))
    fireEvent.click(screen.getByRole('button', { name: zh.confirmDelete }))
    expect(await screen.findByText('delete Host offline (gateway/internal)')).toBeTruthy()
    expect(screen.getByText('Stay Listed')).toBeTruthy()
    expect(screen.getByText(zh.deleteConfirmHint)).toBeTruthy()
  })

  it('shows Team rejection for deleteBot without removing the overview row (T027)', async () => {
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Rejected Delete',
    }
    const deleteBot = vi.fn((): Promise<TeamDeleteBotActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: false,
        error: { code: 'team-rejected', message: 'bot already deleted' },
      },
    }))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, members: [view.members[0]!, priorMember] },
    })
    render(<TeamAction {...props(actions({ load, deleteBot }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Rejected Delete')
    fireEvent.click(screen.getByRole('button', { name: zh.deleteBot }))
    fireEvent.click(screen.getByRole('button', { name: zh.confirmDelete }))
    expect(await screen.findByText('bot already deleted (team-rejected)')).toBeTruthy()
    expect(screen.getByText('Rejected Delete')).toBeTruthy()
    expect(screen.getByText(zh.deleteConfirmHint)).toBeTruthy()
  })

  it('creates a named section through Host createSection and lists it beside Unassigned (T034)', async () => {
    const sectionId = 'section-research' as SidebarSectionId
    const createSection = vi.fn((): Promise<TeamCreateSectionActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: sectionId,
          name: 'Research',
          section: { id: sectionId, name: 'Research', botIds: [] },
        },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: view })
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ...view,
          sections: [{ id: sectionId, name: 'Research', botIds: [] }],
        },
      })
    render(<TeamAction {...props(actions({ load, createSection }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText(zh.unassigned)).toBeTruthy()
    expect(document.querySelector('[data-team-member="worker-id"]')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: zh.createSection }))
    fireEvent.change(screen.getByLabelText(zh.sectionName), { target: { value: 'Research' } })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(createSection).toHaveBeenCalledWith(SESSION, { name: 'Research' })
    })
    await waitFor(() => {
      expect(document.querySelector('[data-section-name="Research"]')).not.toBeNull()
      expect(document.querySelector('[data-team-section-unassigned]')).not.toBeNull()
      expect(document.querySelector('[data-section-name="Unassigned"]')).toBeNull()
    })
  })

  it('assigns a bot into a named section and moves it back to Unassigned (T034)', async () => {
    const sectionId = 'section-lab' as SidebarSectionId
    const workerId = 'worker-id' as SessionId
    const worker = view.members[1]!
    const namedView: TeamView = {
      ...view,
      members: [
        view.members[0]!,
        { ...worker, sectionId },
      ],
      sections: [{ id: sectionId, name: 'Lab', botIds: [workerId] }],
      unassignedBotIds: [SESSION],
    }
    const unassignedView: TeamView = {
      ...view,
      sections: [{ id: sectionId, name: 'Lab', botIds: [] }],
      unassignedBotIds: [SESSION, workerId],
    }
    const assignSection = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ok: true as const,
          value: {
            id: workerId,
            sectionId,
            member: { ...worker, sectionId },
          },
        },
      } satisfies TeamAssignSectionActionResult)
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ok: true as const,
          value: {
            id: workerId,
            sectionId: null,
            member: { ...worker, sectionId: null },
          },
        },
      } satisfies TeamAssignSectionActionResult)
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ...view,
          sections: [{ id: sectionId, name: 'Lab', botIds: [] }],
        },
      })
      .mockResolvedValueOnce({ ok: true as const, value: namedView })
      .mockResolvedValueOnce({ ok: true as const, value: unassignedView })
    render(<TeamAction {...props(actions({ load, assignSection }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Lab')
    fireEvent.click(document.querySelector(`[data-team-assign-section="${workerId}"]`)!)
    fireEvent.change(document.querySelector('[data-team-assign-section-select]')!, {
      target: { value: sectionId },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(assignSection).toHaveBeenCalledWith(SESSION, { botId: workerId, sectionId })
    })
    await waitFor(() => {
      const section = document.querySelector(`[data-team-section="${sectionId}"]`)
      expect(section?.querySelector(`[data-team-member="${workerId}"]`)).not.toBeNull()
    })
    fireEvent.click(document.querySelector(`[data-team-assign-section="${workerId}"]`)!)
    fireEvent.change(document.querySelector('[data-team-assign-section-select]')!, {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(assignSection).toHaveBeenCalledWith(SESSION, { botId: workerId, sectionId: null })
    })
    await waitFor(() => {
      const unassigned = document.querySelector('[data-team-section-unassigned]')
      expect(unassigned?.querySelector(`[data-team-member="${workerId}"]`)).not.toBeNull()
    })
  })

  it('renames a named section through Host renameSection (T034)', async () => {
    const sectionId = 'section-lab' as SidebarSectionId
    const renameSection = vi.fn((): Promise<TeamRenameSectionActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: sectionId,
          name: 'Studio',
          section: { id: sectionId, name: 'Studio', botIds: [] },
        },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ...view,
          sections: [{ id: sectionId, name: 'Lab', botIds: [] }],
        },
      })
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ...view,
          sections: [{ id: sectionId, name: 'Studio', botIds: [] }],
        },
      })
    render(<TeamAction {...props(actions({ load, renameSection }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    expect(await screen.findByText('Lab')).toBeTruthy()
    fireEvent.click(document.querySelector(`[data-team-rename-section="${sectionId}"]`)!)
    fireEvent.change(screen.getByLabelText(zh.sectionName), { target: { value: 'Studio' } })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(renameSection).toHaveBeenCalledWith(SESSION, { sectionId, name: 'Studio' })
    })
    await waitFor(() => {
      expect(screen.getByText('Studio')).toBeTruthy()
      expect(screen.queryByText('Lab')).toBeNull()
    })
  })

  it('keeps prior section membership and shows failure when assignSection is unavailable (T034)', async () => {
    const sectionId = 'section-lab' as SidebarSectionId
    const workerId = 'worker-id' as SessionId
    const assignSection = vi.fn((): Promise<TeamAssignSectionActionResult> => Promise.resolve(
      { ok: false, error: new RemoteError('gateway/internal', 'Host offline', {}) },
    ))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: {
        ...view,
        sections: [{ id: sectionId, name: 'Lab', botIds: [] }],
      },
    })
    render(<TeamAction {...props(actions({ load, assignSection }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Lab')
    fireEvent.click(document.querySelector(`[data-team-assign-section="${workerId}"]`)!)
    fireEvent.change(document.querySelector('[data-team-assign-section-select]')!, {
      target: { value: sectionId },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    expect(await screen.findByText('Host offline (gateway/internal)')).toBeTruthy()
    const unassigned = document.querySelector('[data-team-section-unassigned]')
    expect(unassigned?.querySelector(`[data-team-member="${workerId}"]`)).not.toBeNull()
  })

  it('lists Host managed and user skills in the discovery library (T016)', async () => {
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: {
        ...view,
        skills: [
          {
            id: 'mzm-thin-pack' as SkillId,
            displayName: 'MzM thin pack',
            source: 'managed' as const,
          },
          {
            id: 'my-playbook' as SkillId,
            displayName: 'My playbook',
            source: 'user' as const,
            description: 'User-authored instructional body',
          },
        ],
      },
    })
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText(zh.skills)
    const thin = document.querySelector('[data-team-skill="mzm-thin-pack"]')
    const user = document.querySelector('[data-team-skill="my-playbook"]')
    expect(thin).not.toBeNull()
    expect(user).not.toBeNull()
    expect(thin?.getAttribute('data-skill-source')).toBe('managed')
    expect(user?.getAttribute('data-skill-source')).toBe('user')
    expect(thin?.querySelector('[data-team-skill-display-name]')?.textContent).toBe('MzM thin pack')
    expect(user?.querySelector('[data-team-skill-display-name]')?.textContent).toBe('My playbook')
    expect(document.querySelector('[data-team-skills-catalog-unavailable]')).toBeNull()
  })

  it('selects a discovered skill as available-to-attach without a load wizard (T017)', async () => {
    render(<TeamAction {...props(actions())} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('MzM thin pack')
    const skill = document.querySelector('[data-team-skill="mzm-thin-pack"]')
    expect(skill?.getAttribute('data-skill-available')).toBe('false')
    fireEvent.click(document.querySelector('[data-team-skill-load="mzm-thin-pack"]')!)
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill="mzm-thin-pack"]')
        ?.getAttribute('data-skill-available')).toBe('true')
    })
    expect(document.querySelector('[data-team-skill-available="mzm-thin-pack"]')).not.toBeNull()
    expect(screen.getByText(zh.skillAvailable)).toBeTruthy()
    expect(document.querySelector('[data-team-skill-load="mzm-thin-pack"]')).toBeNull()
  })

  it('shows a clear failure when the Host skill catalog is empty (T018)', async () => {
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, skills: [] },
    })
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText(zh.skills)
    const alert = document.querySelector('[data-team-skills-catalog-unavailable]')
    expect(alert).not.toBeNull()
    expect(alert?.textContent).toBe(zh.skillsCatalogUnavailable)
    expect(document.querySelector('[data-team-skills-list]')).toBeNull()
    expect(screen.queryByText(zh.skillMakeAvailable)).toBeNull()
  })

  it('keeps available-to-attach across refresh when the skill remains in the catalog (T017)', async () => {
    const load = vi.fn().mockResolvedValue({ ok: true as const, value: view })
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('MzM thin pack')
    fireEvent.click(document.querySelector('[data-team-skill-load="mzm-thin-pack"]')!)
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill-available="mzm-thin-pack"]')).not.toBeNull()
    })
    fireEvent.click(screen.getByRole('button', { name: zh.refresh }))
    await waitFor(() => {
      expect(load.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill="mzm-thin-pack"]')
        ?.getAttribute('data-skill-available')).toBe('true')
    })
  })

  it('attaches an available skill to a bot and shows it on that bot’s skills surface (T023)', async () => {
    const workerId = 'worker-id' as SessionId
    const peerId = 'peer-id' as SessionId
    const priorWorker = { ...view.members[1]!, displayName: 'Attach Target' }
    const peer = {
      id: peerId,
      name: 'peer',
      role: 'teammate' as const,
      status: 'inactive' as const,
      model: 'model-b',
      modelSelection: { provider: 'fixture', model: 'model-b' },
      displayName: 'Peer Bot',
      diagnostics: [] as string[],
    }
    const attachment = { botId: workerId, skillId: 'mzm-thin-pack' as SkillId }
    const savedWorker = { ...priorWorker, skillAttachments: [attachment] }
    const attachSkill = vi.fn((): Promise<TeamAttachSkillActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: workerId,
          skillAttachments: [attachment],
          member: savedWorker,
        },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ...view,
          members: [view.members[0]!, priorWorker, peer],
          unassignedBotIds: [SESSION, workerId, peerId],
        },
      })
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ...view,
          members: [view.members[0]!, savedWorker, peer],
          unassignedBotIds: [SESSION, workerId, peerId],
        },
      })
    render(<TeamAction {...props(actions({ load, attachSkill }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Attach Target')
    expect(document.querySelector(`[data-team-bot-skills="${workerId}"]`)).not.toBeNull()
    expect(document.querySelector(`[data-team-bot-skills-empty="${workerId}"]`)?.textContent)
      .toBe(zh.botSkillsEmpty)
    expect(document.querySelector(`[data-team-bot-skills="${peerId}"] [data-team-bot-skills-empty]`))
      .not.toBeNull()
    fireEvent.click(document.querySelector('[data-team-skill-load="mzm-thin-pack"]')!)
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill-available="mzm-thin-pack"]')).not.toBeNull()
    })
    fireEvent.click(document.querySelector(`[data-team-attach-skill="${workerId}"]`)!)
    expect(screen.getByText(zh.attachSkillHint)).toBeTruthy()
    const select = document.querySelector('[data-team-attach-skill-select]') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'mzm-thin-pack' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    await waitFor(() => {
      expect(attachSkill).toHaveBeenCalledWith(SESSION, {
        botId: workerId,
        skillId: 'mzm-thin-pack',
      })
    })
    const workerRow = await waitFor(() => {
      const row = document.querySelector(
        `[data-team-bot-skills="${workerId}"] [data-team-bot-skill="mzm-thin-pack"]`,
      )
      expect(row).not.toBeNull()
      return row!
    })
    expect(workerRow.querySelector('[data-team-bot-skill-label]')?.textContent).toBe('MzM thin pack')
    expect(document.querySelector(
      `[data-team-bot-skills="${peerId}"] [data-team-bot-skill="mzm-thin-pack"]`,
    )).toBeNull()
  })

  it('marks an attached skill session-active via dedicated Run control (T024)', async () => {
    const workerId = 'worker-id' as SessionId
    const attachment = { botId: workerId, skillId: 'mzm-thin-pack' as SkillId }
    const member = {
      ...view.members[1]!,
      displayName: 'Active Target',
      skillAttachments: [attachment],
    }
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, members: [view.members[0]!, member] },
    })
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Active Target')
    const row = document.querySelector(
      `[data-team-bot-skills="${workerId}"] [data-team-bot-skill="mzm-thin-pack"]`,
    )
    expect(row?.getAttribute('data-skill-active')).toBe('false')
    fireEvent.click(document.querySelector('[data-team-skill-run="mzm-thin-pack"]')!)
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill-active="mzm-thin-pack"]')).not.toBeNull()
    })
    expect(screen.getByText(zh.skillActive)).toBeTruthy()
    expect(document.querySelector(
      '[data-team-bot-skill="mzm-thin-pack"]',
    )?.getAttribute('data-skill-active')).toBe('true')
    expect(document.querySelector('[data-team-skill-run="mzm-thin-pack"]')).toBeNull()
  })

  it('keeps prior attachments and shows failure when attachSkill is unavailable (T025)', async () => {
    const workerId = 'worker-id' as SessionId
    const priorAttachment = { botId: workerId, skillId: 'mzm-thin-pack' as SkillId }
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Retain Target',
      skillAttachments: [priorAttachment],
    }
    const attachSkill = vi.fn((): Promise<TeamAttachSkillActionResult> => Promise.resolve(
      remoteFailure('attach Host offline') as TeamAttachSkillActionResult,
    ))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: {
        ...view,
        members: [view.members[0]!, priorMember],
        skills: [
          ...view.skills,
          {
            id: 'my-playbook' as SkillId,
            displayName: 'My playbook',
            source: 'user' as const,
          },
        ],
      },
    })
    render(<TeamAction {...props(actions({ load, attachSkill }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Retain Target')
    expect(document.querySelector(
      `[data-team-bot-skills="${workerId}"] [data-team-bot-skill="mzm-thin-pack"]`,
    )).not.toBeNull()
    fireEvent.click(document.querySelector('[data-team-skill-load="my-playbook"]')!)
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill-available="my-playbook"]')).not.toBeNull()
    })
    fireEvent.click(document.querySelector(`[data-team-attach-skill="${workerId}"]`)!)
    fireEvent.change(document.querySelector('[data-team-attach-skill-select]')!, {
      target: { value: 'my-playbook' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('attach Host offline (gateway/internal)')).toBeTruthy()
    expect(document.querySelector(
      `[data-team-bot-skills="${workerId}"] [data-team-bot-skill="mzm-thin-pack"]`,
    )).not.toBeNull()
    expect(document.querySelector(
      `[data-team-bot-skills="${workerId}"] [data-team-bot-skill="my-playbook"]`,
    )).toBeNull()
    expect(screen.getByText(zh.attachSkillHint)).toBeTruthy()
  })

  it('shows Team rejection for attachSkill without mutating prior attachments (T025)', async () => {
    const workerId = 'worker-id' as SessionId
    const priorAttachment = { botId: workerId, skillId: 'mzm-thin-pack' as SkillId }
    const priorMember = {
      ...view.members[1]!,
      displayName: 'Reject Target',
      skillAttachments: [priorAttachment],
    }
    const attachSkill = vi.fn((): Promise<TeamAttachSkillActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: false,
        error: { code: 'team-rejected', message: 'skill is not in the Host catalog' },
      },
    }))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, members: [view.members[0]!, priorMember] },
    })
    render(<TeamAction {...props(actions({ load, attachSkill }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('Reject Target')
    fireEvent.click(document.querySelector('[data-team-skill-load="mzm-thin-pack"]')!)
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill-available="mzm-thin-pack"]')).not.toBeNull()
    })
    fireEvent.click(document.querySelector(`[data-team-attach-skill="${workerId}"]`)!)
    fireEvent.change(document.querySelector('[data-team-attach-skill-select]')!, {
      target: { value: 'mzm-thin-pack' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(await screen.findByText('skill is not in the Host catalog (team-rejected)')).toBeTruthy()
    expect(document.querySelector(
      `[data-team-bot-skills="${workerId}"] [data-team-bot-skill="mzm-thin-pack"]`,
    )).not.toBeNull()
    expect(screen.getByText(zh.attachSkillHint)).toBeTruthy()
  })

  it('rejects empty skill author drafts with clear Client messaging (T029)', async () => {
    render(<TeamAction {...props(actions())} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText(zh.skills)
    fireEvent.click(screen.getByRole('button', { name: zh.createSkill }))
    const editor = document.querySelector('[data-team-skill-author-editor="create"]')
    expect(editor).not.toBeNull()
    expect(document.querySelector('[data-team-skill-author-reject]')?.textContent)
      .toBe(zh.skillAuthorEmptyReject)
    expect(screen.getByText(zh.skillAuthorHint)).toBeTruthy()
    const save = screen.getAllByRole('button', { name: zh.save }).find(
      button => editor!.contains(button),
    )
    expect(save).toBeTruthy()
    expect((save as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(document.querySelector('[data-team-skill-author-name]')!, {
      target: { value: '   ' },
    })
    fireEvent.change(document.querySelector('[data-team-skill-author-body]')!, {
      target: { value: 'body only' },
    })
    expect(document.querySelector('[data-team-skill-author-reject]')?.textContent)
      .toBe(zh.skillAuthorEmptyReject)
    expect((save as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(document.querySelector('[data-team-skill-author-name]')!, {
      target: { value: 'Named' },
    })
    fireEvent.change(document.querySelector('[data-team-skill-author-body]')!, {
      target: { value: '  ' },
    })
    expect(document.querySelector('[data-team-skill-author-reject]')).not.toBeNull()
    expect((save as HTMLButtonElement).disabled).toBe(true)
  })

  it('creates a user skill via Host upsertUserSkill and lists it in discovery (T029/T030)', async () => {
    const authored = {
      id: 'my-playbook' as SkillId,
      displayName: 'My playbook',
      source: 'user' as const,
      description: 'My playbook',
    }
    let catalog = [...view.skills]
    const upsertUserSkill = vi.fn((): Promise<TeamUpsertUserSkillActionResult> => {
      catalog = [...catalog, authored]
      return Promise.resolve({
        ok: true,
        value: { ok: true, value: { skill: authored } },
      })
    })
    const load = vi.fn().mockImplementation(() => Promise.resolve({
      ok: true as const,
      value: { ...view, skills: catalog },
    }))
    render(<TeamAction {...props(actions({ load, upsertUserSkill }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('MzM thin pack')
    fireEvent.click(screen.getByRole('button', { name: zh.createSkill }))
    fireEvent.change(document.querySelector('[data-team-skill-author-name]')!, {
      target: { value: 'My playbook' },
    })
    fireEvent.change(document.querySelector('[data-team-skill-author-body]')!, {
      target: { value: 'Follow this authored playbook.' },
    })
    expect(document.querySelector('[data-team-skill-author-reject]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(upsertUserSkill).toHaveBeenCalledWith(SESSION, {
        displayName: 'My playbook',
        instructionalBody: 'Follow this authored playbook.',
      })
    })
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill="my-playbook"]')).not.toBeNull()
    })
    const userSkill = document.querySelector('[data-team-skill="my-playbook"]')
    expect(userSkill?.getAttribute('data-skill-source')).toBe('user')
    expect(userSkill?.querySelector('[data-team-skill-display-name]')?.textContent)
      .toBe('My playbook')
    expect(userSkill?.getAttribute('data-skill-available')).toBe('true')
    expect(document.querySelector('[data-team-skill-available="my-playbook"]')).not.toBeNull()
    expect(document.querySelector('[data-team-skill-author-editor]')).toBeNull()
  })

  it('edits a user skill through Host upsertUserSkill with skillId (T029)', async () => {
    const prior = {
      id: 'my-playbook' as SkillId,
      displayName: 'My playbook',
      source: 'user' as const,
      description: 'My playbook',
    }
    const updated = {
      ...prior,
      displayName: 'Updated playbook',
      description: 'Updated playbook',
    }
    let catalog = [...view.skills, prior]
    const upsertUserSkill = vi.fn((): Promise<TeamUpsertUserSkillActionResult> => {
      catalog = catalog.map(skill => skill.id === updated.id ? updated : skill)
      return Promise.resolve({
        ok: true,
        value: { ok: true, value: { skill: updated } },
      })
    })
    const load = vi.fn().mockImplementation(() => Promise.resolve({
      ok: true as const,
      value: { ...view, skills: catalog },
    }))
    render(<TeamAction {...props(actions({ load, upsertUserSkill }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await waitFor(() => {
      expect(document.querySelector('[data-team-skill="my-playbook"]')).not.toBeNull()
    })
    fireEvent.click(document.querySelector('[data-team-skill-edit="my-playbook"]')!)
    expect(document.querySelector('[data-team-skill-author-editor="edit"]')).not.toBeNull()
    fireEvent.change(document.querySelector('[data-team-skill-author-name]')!, {
      target: { value: 'Updated playbook' },
    })
    fireEvent.change(document.querySelector('[data-team-skill-author-body]')!, {
      target: { value: 'Updated instructional body.' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(upsertUserSkill).toHaveBeenCalledWith(SESSION, {
        skillId: 'my-playbook',
        displayName: 'Updated playbook',
        instructionalBody: 'Updated instructional body.',
      })
    })
    await waitFor(() => {
      expect(document.querySelector(
        '[data-team-skill="my-playbook"] [data-team-skill-display-name]',
      )?.textContent).toBe('Updated playbook')
    })
  })

  it('shows Host upsertUserSkill rejection without inventing a catalog row (T029)', async () => {
    const upsertUserSkill = vi.fn((): Promise<TeamUpsertUserSkillActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: false,
        error: {
          code: 'team-rejected',
          message: 'displayName must be non-empty',
        },
      },
    }))
    const load = vi.fn().mockResolvedValue({ ok: true as const, value: view })
    render(<TeamAction {...props(actions({ load, upsertUserSkill }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('MzM thin pack')
    fireEvent.click(screen.getByRole('button', { name: zh.createSkill }))
    fireEvent.change(document.querySelector('[data-team-skill-author-name]')!, {
      target: { value: 'Ghost' },
    })
    fireEvent.change(document.querySelector('[data-team-skill-author-body]')!, {
      target: { value: 'body' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    expect(await screen.findByText('displayName must be non-empty (team-rejected)')).toBeTruthy()
    expect(document.querySelector('[data-team-skill="ghost"]')).toBeNull()
    expect(document.querySelector('[data-team-skills-list] [data-skill-source="user"]')).toBeNull()
  })

  it('attaches and runs an authored user skill like managed (T030)', async () => {
    const workerId = 'worker-id' as SessionId
    const userSkillId = 'my-playbook' as SkillId
    const priorWorker = { ...view.members[1]!, displayName: 'Attach Target' }
    const catalog = [
      ...view.skills,
      {
        id: userSkillId,
        displayName: 'My playbook',
        source: 'user' as const,
        description: 'User-authored instructional body',
      },
    ]
    const attachment = { botId: workerId, skillId: userSkillId }
    const savedWorker = { ...priorWorker, skillAttachments: [attachment] }
    const attachSkill = vi.fn((): Promise<TeamAttachSkillActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          id: workerId,
          skillAttachments: [attachment],
          member: savedWorker,
        },
      },
    }))
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: {
          ...view,
          skills: catalog,
          members: [view.members[0]!, priorWorker],
          unassignedBotIds: [SESSION, workerId],
        },
      })
      .mockResolvedValue({
        ok: true as const,
        value: {
          ...view,
          skills: catalog,
          members: [view.members[0]!, savedWorker],
          unassignedBotIds: [SESSION, workerId],
        },
      })
    render(<TeamAction {...props(actions({ load, attachSkill }))} />)
    fireEvent.click(screen.getByRole('button', { name: /Agent Team/u }))
    await screen.findByText('My playbook')
    fireEvent.click(document.querySelector(`[data-team-skill-load="${userSkillId}"]`)!)
    await waitFor(() => {
      expect(document.querySelector(`[data-team-skill="${userSkillId}"]`)
        ?.getAttribute('data-skill-available')).toBe('true')
    })
    fireEvent.click(document.querySelector(`[data-team-attach-skill="${workerId}"]`)!)
    fireEvent.change(document.querySelector('[data-team-attach-skill-select]')!, {
      target: { value: userSkillId },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(attachSkill).toHaveBeenCalledWith(SESSION, {
        botId: workerId,
        skillId: userSkillId,
      })
    })
    await waitFor(() => {
      expect(document.querySelector(
        `[data-team-bot-skills="${workerId}"] [data-team-bot-skill="${userSkillId}"]`,
      )).not.toBeNull()
    })
    fireEvent.click(document.querySelector(`[data-team-skill-run="${userSkillId}"]`)!)
    await waitFor(() => {
      expect(document.querySelector(`[data-team-skill-active="${userSkillId}"]`)).not.toBeNull()
    })
    expect(document.querySelector(
      `[data-team-bot-skill="${userSkillId}"]`,
    )?.getAttribute('data-skill-active')).toBe('true')
  })


  it('creates a Host routine in bot context without confirm (T017 / SC-007)', async () => {
    const workerId = 'worker-id' as SessionId
    const createdRoutine = {
      routineId: 'routine-created' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'Summarize inbox',
      intent: 'Summarize inbox',
      scheduleExpr: '@every 5m',
      scheduleLabel: 'Every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 10,
      updatedAt: 10,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, routines: [] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, routines: [createdRoutine] },
      })
    const createRoutine = vi.fn((): Promise<TeamCreateRoutineActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { routine: createdRoutine } },
    }))
    render(<TeamAction {...props(actions({ load, createRoutine }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.botRoutinesEmpty)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.createRoutine }))
    expect(screen.getByText(zh.createRoutineHint)).toBeTruthy()
    expect(screen.getByText(zh.routineCreateReject)).toBeTruthy()
    fireEvent.change(screen.getByLabelText(zh.routineIntent), {
      target: { value: 'Summarize inbox' },
    })
    fireEvent.change(screen.getByLabelText(zh.routineSchedule), {
      target: { value: '@every 5m' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(createRoutine).toHaveBeenCalledWith(SESSION, {
        botId: workerId,
        intent: 'Summarize inbox',
        scheduleExpr: '@every 5m',
        triggerKind: 'cron',
      })
    })
    expect(await screen.findByText('Summarize inbox')).toBeTruthy()
    expect(document.querySelector('[data-team-routine-status="active"]')).toBeTruthy()
    expect(screen.queryByText(zh.botRoutinesEmpty)).toBeNull()
  })

  it('shows Host createRoutine rejection without inventing a listed routine (T017)', async () => {
    const createRoutine = vi.fn((): Promise<TeamCreateRoutineActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: false,
        error: { code: 'team-rejected', message: 'scheduleExpr must be non-empty' },
      },
    }))
    render(<TeamAction {...props(actions({ createRoutine }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    await screen.findByText(zh.botRoutinesEmpty)
    fireEvent.click(screen.getByRole('button', { name: zh.createRoutine }))
    fireEvent.change(screen.getByLabelText(zh.routineIntent), {
      target: { value: 'Bad schedule try' },
    })
    fireEvent.change(screen.getByLabelText(zh.routineSchedule), {
      target: { value: '@every 5m' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    expect(await screen.findByText('scheduleExpr must be non-empty (team-rejected)')).toBeTruthy()
    expect(screen.getByText(zh.botRoutinesEmpty)).toBeTruthy()
  })

  it('keeps prior routines and shows failure when createRoutine transport is unavailable (T017)', async () => {
    const workerId = 'worker-id' as SessionId
    const existing = {
      routineId: 'routine-existing' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'Keep me',
      intent: 'Keep me',
      scheduleExpr: '@hourly',
      scheduleLabel: 'Every hour',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, routines: [existing] },
    })
    const createRoutine = vi.fn((): Promise<TeamCreateRoutineActionResult> => Promise.resolve(
      remoteFailure('createRoutine offline'),
    ))
    render(<TeamAction {...props(actions({ load, createRoutine }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Keep me')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.createRoutine }))
    fireEvent.change(screen.getByLabelText(zh.routineIntent), {
      target: { value: 'Another' },
    })
    fireEvent.change(screen.getByLabelText(zh.routineSchedule), {
      target: { value: '@daily' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    expect(await screen.findByText('createRoutine offline (gateway/internal)')).toBeTruthy()
    expect(screen.getByText('Keep me')).toBeTruthy()
  })

  it('lists only the selected bot’s Host routines after create (T017 / SC-006)', async () => {
    const workerId = 'worker-id' as SessionId
    const otherId = 'other-id' as SessionId
    const onWorker = {
      routineId: 'routine-a' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'Worker only',
      intent: 'Worker only',
      scheduleExpr: '@every 5m',
      scheduleLabel: 'Every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const onOther = {
      ...onWorker,
      routineId: 'routine-b' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: otherId,
      identity: 'Other bot routine',
      intent: 'Other bot routine',
    }
    const loaded: TeamView = {
      ...view,
      members: [
        ...view.members,
        {
          id: otherId,
          name: 'other',
          role: 'teammate',
          status: 'inactive',
          model: 'model-b',
          modelSelection: { provider: 'fixture', model: 'model-b' },
          diagnostics: [],
        },
      ],
      unassignedBotIds: [...view.unassignedBotIds, otherId],
      routines: [onWorker, onOther],
    }
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({ ok: true, value: loaded }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Worker only')).toBeTruthy()
    expect(screen.getByText('Other bot routine')).toBeTruthy()
    const workerList = document.querySelector(`[data-team-bot-routines-list="${workerId}"]`)
    const otherList = document.querySelector(`[data-team-bot-routines-list="${otherId}"]`)
    expect(workerList?.textContent).toContain('Worker only')
    expect(workerList?.textContent).not.toContain('Other bot routine')
    expect(otherList?.textContent).toContain('Other bot routine')
    expect(otherList?.textContent).not.toContain('Worker only')
  })

  it('projects Host routines pane with identity, schedule, status, and lastRunAt (T020 / US2)', async () => {
    const workerId = 'worker-id' as SessionId
    const firedAt = Date.UTC(2026, 8, 27, 12, 0, 0)
    const active = {
      routineId: 'routine-active' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'Summarize inbox',
      intent: 'Summarize inbox',
      scheduleExpr: '@every 5m',
      scheduleLabel: 'Every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: firedAt,
      createdAt: 1,
      updatedAt: firedAt,
    }
    const paused = {
      routineId: 'routine-paused' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'Weekly digest',
      intent: 'Weekly digest',
      scheduleExpr: '@daily',
      scheduleLabel: 'Every day',
      triggerKind: 'cron' as const,
      status: 'paused' as const,
      lastRunAt: null,
      createdAt: 2,
      updatedAt: 2,
    }
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({
        ok: true as const,
        value: { ...view, routines: [active, paused] },
      }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Summarize inbox')).toBeTruthy()
    expect(screen.getByText('Weekly digest')).toBeTruthy()
    expect(document.querySelector(`[data-team-routines-pane="${workerId}"]`)).not.toBeNull()
    expect(document.querySelector('[data-team-bot-routines-hint]')).not.toBeNull()
    const activeRow = document.querySelector('[data-team-routine="routine-active"]')
    const pausedRow = document.querySelector('[data-team-routine="routine-paused"]')
    expect(activeRow?.getAttribute('data-team-routine-status')).toBe('active')
    expect(activeRow?.getAttribute('data-team-routine-schedule-expr')).toBe('@every 5m')
    expect(activeRow?.querySelector('[data-team-routine-status-label]')?.textContent)
      .toBe(zh['routineStatus.active'])
    expect(activeRow?.querySelector('[data-team-routine-last-run]')?.getAttribute('data-team-routine-last-run'))
      .toBe(String(firedAt))
    expect(activeRow?.textContent).toContain(new Date(firedAt).toISOString())
    expect(pausedRow?.getAttribute('data-team-routine-status')).toBe('paused')
    expect(pausedRow?.querySelector('[data-team-routine-status-label]')?.textContent)
      .toBe(zh['routineStatus.paused'])
    expect(pausedRow?.querySelector('[data-team-routine-last-run]')?.getAttribute('data-team-routine-last-run'))
      .toBe('never')
    expect(pausedRow?.textContent).toContain(zh.routineLastRunNever)
  })

  it('shows Host lastRunAt fire indicator as never before first fire (T027 / US4)', async () => {
    const workerId = 'worker-id' as SessionId
    const routineId = 'routine-never-fired' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId
    const neverFired = {
      routineId,
      botId: workerId,
      identity: 'Await first fire',
      intent: 'Await first fire',
      scheduleExpr: '@every 5m',
      scheduleLabel: 'Every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({
        ok: true as const,
        value: { ...view, routines: [neverFired] },
      }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Await first fire')).toBeTruthy()
    expect(document.querySelector('[data-team-bot-routines-fire-hint]')).not.toBeNull()
    const row = document.querySelector(`[data-team-routine="${routineId}"]`)
    expect(row?.getAttribute('data-team-routine-fire-indicator')).toBe('never')
    const indicator = row?.querySelector('[data-team-routine-fire-indicator="never"]')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('data-team-routine-last-run')).toBe('never')
    expect(indicator?.textContent).toContain(zh.routineLastRunNever)
  })

  it('shows Host lastRunAt fire indicator as fired after cron commit (T027 / US4)', async () => {
    const workerId = 'worker-id' as SessionId
    const routineId = 'routine-fired' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId
    const firedAt = Date.UTC(2026, 8, 27, 18, 30, 0)
    const fired = {
      routineId,
      botId: workerId,
      identity: 'Post-fire ping',
      intent: 'Post-fire ping',
      scheduleExpr: '@every 5m',
      scheduleLabel: 'Every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: firedAt,
      createdAt: 1,
      updatedAt: firedAt,
    }
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({
        ok: true as const,
        value: { ...view, routines: [fired] },
      }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Post-fire ping')).toBeTruthy()
    const row = document.querySelector(`[data-team-routine="${routineId}"]`)
    expect(row?.getAttribute('data-team-routine-fire-indicator')).toBe('fired')
    const indicator = row?.querySelector('[data-team-routine-fire-indicator="fired"]')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('data-team-routine-last-run')).toBe(String(firedAt))
    expect(indicator?.textContent).toContain(new Date(firedAt).toISOString())
  })

  it('updates fire indicator never → fired when Host projects new lastRunAt (T027 / US4)', async () => {
    const workerId = 'worker-id' as SessionId
    const routineId = 'routine-refresh-fire' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId
    const firedAt = Date.UTC(2026, 8, 27, 19, 0, 0)
    const before = {
      routineId,
      botId: workerId,
      identity: 'Refresh fire',
      intent: 'Refresh fire',
      scheduleExpr: '@every 5m',
      scheduleLabel: 'Every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null as number | null,
      createdAt: 1,
      updatedAt: 1,
    }
    const after = { ...before, lastRunAt: firedAt, updatedAt: firedAt }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, routines: [before] } })
      .mockResolvedValue({ ok: true as const, value: { ...view, routines: [after] } })
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Refresh fire')).toBeTruthy()
    expect(document.querySelector(`[data-team-routine="${routineId}"]`)
      ?.getAttribute('data-team-routine-fire-indicator')).toBe('never')
    fireEvent.click(screen.getByRole('button', { name: zh.refresh }))
    await waitFor(() => {
      expect(document.querySelector(`[data-team-routine="${routineId}"]`)
        ?.getAttribute('data-team-routine-fire-indicator')).toBe('fired')
    })
    const indicator = document.querySelector(
      `[data-team-routine="${routineId}"] [data-team-routine-fire-indicator="fired"]`,
    )
    expect(indicator?.getAttribute('data-team-routine-last-run')).toBe(String(firedAt))
    expect(indicator?.textContent).toContain(new Date(firedAt).toISOString())
    expect(load.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('keeps Host routines listed after leave and return (T020 / US2 durability)', async () => {
    const workerId = 'worker-id' as SessionId
    const listed = {
      routineId: 'routine-durable' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'Durable ping',
      intent: 'Durable ping',
      scheduleExpr: '@hourly',
      scheduleLabel: 'Every hour',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, routines: [listed] },
    })
    render(<TeamAction {...props(actions({ load }))} />)
    const openTrigger = () => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${zh.trigger}`) }))
    }
    openTrigger()
    expect(await screen.findByText('Durable ping')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.close }))
    expect(screen.queryByText('Durable ping')).toBeNull()
    openTrigger()
    expect(await screen.findByText('Durable ping')).toBeTruthy()
    expect(load.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(document.querySelector(
      `[data-team-bot-routines-list="${workerId}"] [data-team-routine="routine-durable"]`,
    )).not.toBeNull()
  })


  it('pauses an active Host routine via pauseRoutine and shows Paused (T023 / US3)', async () => {
    const workerId = 'worker-id' as SessionId
    const routineId = 'routine-pause' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId
    const active = {
      routineId,
      botId: workerId,
      identity: 'Morning brief',
      intent: 'Morning brief',
      scheduleExpr: '@hourly',
      scheduleLabel: 'Every hour',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const paused = { ...active, status: 'paused' as const, updatedAt: 2 }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, routines: [active] } })
      .mockResolvedValue({ ok: true as const, value: { ...view, routines: [paused] } })
    const pauseRoutine = vi.fn((): Promise<
      import('../src/client/TeamAction.tsx').TeamPauseRoutineActionResult
    > => Promise.resolve({ ok: true, value: { ok: true, value: { routine: paused } } }))
    render(<TeamAction {...props(actions({ load, pauseRoutine }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Morning brief')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.pauseRoutine }))
    await waitFor(() => { expect(pauseRoutine).toHaveBeenCalledWith(SESSION, { routineId }) })
    await waitFor(() => {
      expect(document.querySelector(`[data-team-routine="${routineId}"]`)
        ?.getAttribute('data-team-routine-status')).toBe('paused')
    })
    expect(screen.getByRole('button', { name: zh.resumeRoutine })).toBeTruthy()
  })

  it('resumes a paused Host routine via resumeRoutine and shows Active (T023 / US3)', async () => {
    const workerId = 'worker-id' as SessionId
    const routineId = 'routine-resume' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId
    const paused = {
      routineId,
      botId: workerId,
      identity: 'Evening sweep',
      intent: 'Evening sweep',
      scheduleExpr: '@daily',
      scheduleLabel: 'Every day',
      triggerKind: 'cron' as const,
      status: 'paused' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const active = { ...paused, status: 'active' as const, updatedAt: 2 }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, routines: [paused] } })
      .mockResolvedValue({ ok: true as const, value: { ...view, routines: [active] } })
    const resumeRoutine = vi.fn((): Promise<
      import('../src/client/TeamAction.tsx').TeamResumeRoutineActionResult
    > => Promise.resolve({ ok: true, value: { ok: true, value: { routine: active } } }))
    render(<TeamAction {...props(actions({ load, resumeRoutine }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Evening sweep')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.resumeRoutine }))
    await waitFor(() => { expect(resumeRoutine).toHaveBeenCalledWith(SESSION, { routineId }) })
    await waitFor(() => {
      expect(document.querySelector(`[data-team-routine="${routineId}"]`)
        ?.getAttribute('data-team-routine-status')).toBe('active')
    })
    expect(screen.getByRole('button', { name: zh.pauseRoutine })).toBeTruthy()
  })

  it('keeps prior status and shows failure when pauseRoutine transport is unavailable (T023)', async () => {
    const workerId = 'worker-id' as SessionId
    const routineId = 'routine-keep' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId
    const active = {
      routineId,
      botId: workerId,
      identity: 'Keep active',
      intent: 'Keep active',
      scheduleExpr: '@every 5m',
      scheduleLabel: 'Every 5m',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const pauseRoutine = vi.fn((): Promise<
      import('../src/client/TeamAction.tsx').TeamPauseRoutineActionResult
    > => Promise.resolve(remoteFailure('pauseRoutine offline')))
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({ ok: true as const, value: { ...view, routines: [active] } }),
      pauseRoutine,
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Keep active')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.pauseRoutine }))
    expect(await screen.findByText('pauseRoutine offline (gateway/internal)')).toBeTruthy()
    expect(document.querySelector(`[data-team-routine="${routineId}"]`)
      ?.getAttribute('data-team-routine-status')).toBe('active')
  })


  it('creates a Host event routine via createRoutine with webhook_harness (T024 / US2)', async () => {
    const workerId = 'worker-id' as SessionId
    const createdRoutine = {
      routineId: 'routine-event' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'On harness ping',
      intent: 'On harness ping',
      scheduleExpr: '',
      scheduleLabel: 'Webhook harness',
      triggerKind: 'event' as const,
      eventTrigger: 'webhook_harness' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 10,
      updatedAt: 10,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, routines: [] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, routines: [createdRoutine] },
      })
    const createRoutine = vi.fn((): Promise<TeamCreateRoutineActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { routine: createdRoutine } },
    }))
    render(<TeamAction {...props(actions({ load, createRoutine }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.botRoutinesEmpty)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.createRoutine }))
    fireEvent.change(screen.getByLabelText(zh.routineTriggerKind), {
      target: { value: 'event' },
    })
    expect(document.querySelector('[data-team-create-routine-trigger-kind="event"]')).not.toBeNull()
    expect(screen.getByLabelText(zh.routineEventTrigger)).toBeTruthy()
    expect(screen.queryByLabelText(zh.routineSchedule)).toBeNull()
    expect(screen.getByText(zh.routineCreateReject)).toBeTruthy()
    fireEvent.change(screen.getByLabelText(zh.routineIntent), {
      target: { value: 'On harness ping' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(createRoutine).toHaveBeenCalledWith(SESSION, {
        botId: workerId,
        intent: 'On harness ping',
        triggerKind: 'event',
        eventTrigger: 'webhook_harness',
      })
    })
    expect(await screen.findByText('On harness ping')).toBeTruthy()
    const row = document.querySelector('[data-team-routine="routine-event"]')
    expect(row?.getAttribute('data-team-routine-trigger-kind')).toBe('event')
    expect(row?.getAttribute('data-team-routine-event-trigger')).toBe('webhook_harness')
    expect(row?.querySelector('[data-team-routine-trigger-kind-label="event"]')?.textContent)
      .toBe(zh['routineTrigger.event'])
    expect(row?.querySelector('[data-team-routine-schedule]')?.textContent).toBe('Webhook harness')
    expect(row?.getAttribute('data-team-routine-fire-indicator')).toBe('never')
  })

  it('labels event vs cron routines distinctly on the pane (T024 / US2)', async () => {
    const workerId = 'worker-id' as SessionId
    const cron = {
      routineId: 'routine-cron' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'Cron digest',
      intent: 'Cron digest',
      scheduleExpr: '@hourly',
      scheduleLabel: 'Every hour',
      triggerKind: 'cron' as const,
      status: 'active' as const,
      lastRunAt: null,
      createdAt: 1,
      updatedAt: 1,
    }
    const event = {
      routineId: 'routine-event-label' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId,
      botId: workerId,
      identity: 'Event wake',
      intent: 'Event wake',
      scheduleExpr: '',
      scheduleLabel: 'Webhook harness',
      triggerKind: 'event' as const,
      eventTrigger: 'webhook_harness' as const,
      status: 'paused' as const,
      lastRunAt: Date.UTC(2026, 8, 28, 11, 0, 0),
      createdAt: 2,
      updatedAt: 3,
    }
    render(<TeamAction {...props(actions({
      load: () => Promise.resolve({
        ok: true as const,
        value: { ...view, routines: [cron, event] },
      }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Cron digest')).toBeTruthy()
    const cronRow = document.querySelector('[data-team-routine="routine-cron"]')
    const eventRow = document.querySelector('[data-team-routine="routine-event-label"]')
    expect(cronRow?.getAttribute('data-team-routine-trigger-kind')).toBe('cron')
    expect(cronRow?.querySelector('[data-team-routine-trigger-kind-label="cron"]')?.textContent)
      .toBe(zh['routineTrigger.cron'])
    expect(cronRow?.getAttribute('data-team-routine-event-trigger')).toBeNull()
    expect(eventRow?.getAttribute('data-team-routine-trigger-kind')).toBe('event')
    expect(eventRow?.querySelector('[data-team-routine-trigger-kind-label="event"]')?.textContent)
      .toBe(zh['routineTrigger.event'])
    expect(eventRow?.getAttribute('data-team-routine-event-trigger')).toBe('webhook_harness')
    expect(eventRow?.getAttribute('data-team-routine-status')).toBe('paused')
    expect(eventRow?.getAttribute('data-team-routine-fire-indicator')).toBe('fired')
    expect(screen.getByRole('button', { name: zh.pauseRoutine })).toBeTruthy()
    expect(screen.getByRole('button', { name: zh.resumeRoutine })).toBeTruthy()
  })

  it('pauses and resumes an event routine via Host RPC (T024 / US2)', async () => {
    const workerId = 'worker-id' as SessionId
    const routineId = 'routine-event-pause' as import('@deepseek-ai/dsh-experimental-agent-team/client').RoutineId
    const active = {
      routineId,
      botId: workerId,
      identity: 'Harness wake',
      intent: 'Harness wake',
      scheduleExpr: '',
      scheduleLabel: 'Webhook harness',
      triggerKind: 'event' as const,
      eventTrigger: 'webhook_harness' as const,
      status: 'active' as const,
      lastRunAt: null as number | null,
      createdAt: 1,
      updatedAt: 1,
    }
    const paused = { ...active, status: 'paused' as const, updatedAt: 2 }
    const resumed = { ...active, status: 'active' as const, updatedAt: 3 }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, routines: [active] } })
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, routines: [paused] } })
      .mockResolvedValue({ ok: true as const, value: { ...view, routines: [resumed] } })
    const pauseRoutine = vi.fn((): Promise<
      import('../src/client/TeamAction.tsx').TeamPauseRoutineActionResult
    > => Promise.resolve({ ok: true, value: { ok: true, value: { routine: paused } } }))
    const resumeRoutine = vi.fn((): Promise<
      import('../src/client/TeamAction.tsx').TeamResumeRoutineActionResult
    > => Promise.resolve({ ok: true, value: { ok: true, value: { routine: resumed } } }))
    render(<TeamAction {...props(actions({ load, pauseRoutine, resumeRoutine }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Harness wake')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.pauseRoutine }))
    await waitFor(() => { expect(pauseRoutine).toHaveBeenCalledWith(SESSION, { routineId }) })
    await waitFor(() => {
      expect(document.querySelector(`[data-team-routine="${routineId}"]`)
        ?.getAttribute('data-team-routine-status')).toBe('paused')
    })
    fireEvent.click(screen.getByRole('button', { name: zh.resumeRoutine }))
    await waitFor(() => { expect(resumeRoutine).toHaveBeenCalledWith(SESSION, { routineId }) })
    await waitFor(() => {
      expect(document.querySelector(`[data-team-routine="${routineId}"]`)
        ?.getAttribute('data-team-routine-status')).toBe('active')
    })
  })


  it('writes a non-empty profile memory via Host writeMemory and lists it (T015 / US1)', async () => {
    const workerId = 'worker-id' as SessionId
    const createdMemory = {
      memoryId: 'memory-profile-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'profile' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Timezone: America/New_York',
      createdAt: 10,
      updatedAt: 10,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, memories: [] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, memories: [createdMemory] },
      })
    const writeMemory = vi.fn((): Promise<TeamWriteMemoryActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memory: createdMemory } },
    }))
    const listMemories = vi.fn((): Promise<TeamListMemoriesActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memories: [createdMemory] } },
    }))
    render(<TeamAction {...props(actions({ load, writeMemory, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.botMemoriesEmpty)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    expect(screen.getByText(zh.writeMemoryHint)).toBeTruthy()
    expect(screen.getByText(zh.memoryWriteReject)).toBeTruthy()
    fireEvent.change(screen.getByLabelText(zh.memoryKind), {
      target: { value: 'profile' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryContent), {
      target: { value: 'Timezone: America/New_York' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryLayer), {
      target: { value: 'agent' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(writeMemory).toHaveBeenCalledWith(SESSION, {
        kind: 'profile',
        layer: 'agent',
        content: 'Timezone: America/New_York',
        botId: workerId,
      })
    })
    await waitFor(() => {
      expect(listMemories).toHaveBeenCalledWith(SESSION, { botId: workerId })
    })
    expect(await screen.findByText('Timezone: America/New_York')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="profile"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-layer="agent"]')).toBeTruthy()
    expect(screen.queryByText(zh.botMemoriesEmpty)).toBeNull()
  })

  it('writes a user-layer profile memory without botId (T015 / FR-017)', async () => {
    const createdMemory = {
      memoryId: 'memory-user-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'profile' as const,
      layer: 'user' as const,
      botId: null,
      content: 'Prefers concise answers',
      createdAt: 11,
      updatedAt: 11,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, memories: [] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, memories: [createdMemory] },
      })
    const writeMemory = vi.fn((): Promise<TeamWriteMemoryActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memory: createdMemory } },
    }))
    const listMemories = vi.fn((): Promise<TeamListMemoriesActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memories: [createdMemory] } },
    }))
    render(<TeamAction {...props(actions({ load, writeMemory, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    await screen.findByText(zh.botMemoriesEmpty)
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    fireEvent.change(screen.getByLabelText(zh.memoryKind), {
      target: { value: 'profile' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryContent), {
      target: { value: 'Prefers concise answers' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryLayer), {
      target: { value: 'user' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(writeMemory).toHaveBeenCalledWith(SESSION, {
        kind: 'profile',
        layer: 'user',
        content: 'Prefers concise answers',
        botId: null,
      })
    })
    expect(await screen.findByText('Prefers concise answers')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-layer="user"]')).toBeTruthy()
  })

  it('writes a non-empty log memory via Host writeMemory and lists it (T018 / US2)', async () => {
    const workerId = 'worker-id' as SessionId
    const createdMemory = {
      memoryId: 'memory-log-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'log' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Shipped Phase 5 US2 log write on Desktop',
      createdAt: 20,
      updatedAt: 20,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, memories: [] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, memories: [createdMemory] },
      })
    const writeMemory = vi.fn((): Promise<TeamWriteMemoryActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memory: createdMemory } },
    }))
    const listMemories = vi.fn((): Promise<TeamListMemoriesActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memories: [createdMemory] } },
    }))
    render(<TeamAction {...props(actions({ load, writeMemory, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.botMemoriesEmpty)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    fireEvent.change(screen.getByLabelText(zh.memoryKind), {
      target: { value: 'log' },
    })
    expect(document.querySelector('[data-team-write-memory-kind="log"]')).toBeTruthy()
    fireEvent.change(screen.getByLabelText(zh.memoryContent), {
      target: { value: 'Shipped Phase 5 US2 log write on Desktop' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryLayer), {
      target: { value: 'agent' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(writeMemory).toHaveBeenCalledWith(SESSION, {
        kind: 'log',
        layer: 'agent',
        content: 'Shipped Phase 5 US2 log write on Desktop',
        botId: workerId,
      })
    })
    await waitFor(() => {
      expect(listMemories).toHaveBeenCalledWith(SESSION, { botId: workerId })
    })
    expect(await screen.findByText('Shipped Phase 5 US2 log write on Desktop')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="log"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-layer="agent"]')).toBeTruthy()
    expect(screen.queryByText(zh.botMemoriesEmpty)).toBeNull()
  })

  it('keeps profile and log distinguishable after both writes (T018 / SC-002)', async () => {
    const workerId = 'worker-id' as SessionId
    const profileMemory = {
      memoryId: 'memory-profile-2' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'profile' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Role: release engineer',
      createdAt: 1,
      updatedAt: 1,
    }
    const logMemory = {
      memoryId: 'memory-log-2' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'log' as const,
      layer: 'user' as const,
      botId: null,
      content: 'Cut Phase 5 memory write surface',
      createdAt: 2,
      updatedAt: 2,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, memories: [profileMemory] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, memories: [profileMemory, logMemory] },
      })
    const writeMemory = vi.fn((): Promise<TeamWriteMemoryActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memory: logMemory } },
    }))
    const listMemories = vi.fn((): Promise<TeamListMemoriesActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memories: [profileMemory, logMemory] } },
    }))
    render(<TeamAction {...props(actions({ load, writeMemory, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Role: release engineer')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    fireEvent.change(screen.getByLabelText(zh.memoryKind), {
      target: { value: 'log' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryContent), {
      target: { value: 'Cut Phase 5 memory write surface' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryLayer), {
      target: { value: 'user' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(writeMemory).toHaveBeenCalledWith(SESSION, {
        kind: 'log',
        layer: 'user',
        content: 'Cut Phase 5 memory write surface',
        botId: null,
      })
    })
    expect(await screen.findByText('Cut Phase 5 memory write surface')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="profile"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="log"]')).toBeTruthy()
    expect(screen.getAllByText(zh['memoryKind.profile']).length).toBeGreaterThan(0)
    expect(screen.getAllByText(zh['memoryKind.log']).length).toBeGreaterThan(0)
  })

  it('writes a non-empty note memory via Host writeMemory and lists it (T021 / US3)', async () => {
    const workerId = 'worker-id' as SessionId
    const createdMemory = {
      memoryId: 'memory-note-1' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'note' as const,
      layer: 'user' as const,
      botId: null,
      content: 'Remember to stamp SC-003 after note write',
      createdAt: 30,
      updatedAt: 30,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, memories: [] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, memories: [createdMemory] },
      })
    const writeMemory = vi.fn((): Promise<TeamWriteMemoryActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memory: createdMemory } },
    }))
    const listMemories = vi.fn((): Promise<TeamListMemoriesActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memories: [createdMemory] } },
    }))
    render(<TeamAction {...props(actions({ load, writeMemory, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.botMemoriesEmpty)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    fireEvent.change(screen.getByLabelText(zh.memoryKind), {
      target: { value: 'note' },
    })
    expect(document.querySelector('[data-team-write-memory-kind="note"]')).toBeTruthy()
    fireEvent.change(screen.getByLabelText(zh.memoryContent), {
      target: { value: 'Remember to stamp SC-003 after note write' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryLayer), {
      target: { value: 'user' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(writeMemory).toHaveBeenCalledWith(SESSION, {
        kind: 'note',
        layer: 'user',
        content: 'Remember to stamp SC-003 after note write',
        botId: null,
      })
    })
    await waitFor(() => {
      expect(listMemories).toHaveBeenCalledWith(SESSION, { botId: workerId })
    })
    expect(await screen.findByText('Remember to stamp SC-003 after note write')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="note"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-layer="user"]')).toBeTruthy()
    expect(screen.queryByText(zh.botMemoriesEmpty)).toBeNull()
  })

  it('keeps profile, log, and note distinguishable after three writes (T021 / SC-003)', async () => {
    const workerId = 'worker-id' as SessionId
    const profileMemory = {
      memoryId: 'memory-profile-3' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'profile' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Role: release engineer',
      createdAt: 1,
      updatedAt: 1,
    }
    const logMemory = {
      memoryId: 'memory-log-3' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'log' as const,
      layer: 'user' as const,
      botId: null,
      content: 'Cut Phase 5 memory write surface',
      createdAt: 2,
      updatedAt: 2,
    }
    const noteMemory = {
      memoryId: 'memory-note-3' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'note' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Follow-up: complete Scenario 1 three kinds',
      createdAt: 3,
      updatedAt: 3,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({
        ok: true as const,
        value: { ...view, memories: [profileMemory, logMemory] },
      })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, memories: [profileMemory, logMemory, noteMemory] },
      })
    const writeMemory = vi.fn((): Promise<TeamWriteMemoryActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memory: noteMemory } },
    }))
    const listMemories = vi.fn((): Promise<TeamListMemoriesActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memories: [profileMemory, logMemory, noteMemory] } },
    }))
    render(<TeamAction {...props(actions({ load, writeMemory, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Role: release engineer')).toBeTruthy()
    expect(screen.getByText('Cut Phase 5 memory write surface')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    fireEvent.change(screen.getByLabelText(zh.memoryKind), {
      target: { value: 'note' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryContent), {
      target: { value: 'Follow-up: complete Scenario 1 three kinds' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryLayer), {
      target: { value: 'agent' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    await waitFor(() => {
      expect(writeMemory).toHaveBeenCalledWith(SESSION, {
        kind: 'note',
        layer: 'agent',
        content: 'Follow-up: complete Scenario 1 three kinds',
        botId: workerId,
      })
    })
    expect(await screen.findByText('Follow-up: complete Scenario 1 three kinds')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="profile"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="log"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="note"]')).toBeTruthy()
    expect(screen.getAllByText(zh['memoryKind.profile']).length).toBeGreaterThan(0)
    expect(screen.getAllByText(zh['memoryKind.log']).length).toBeGreaterThan(0)
    expect(screen.getAllByText(zh['memoryKind.note']).length).toBeGreaterThan(0)
  })

  it('shows Host writeMemory rejection without inventing a listed memory (T015)', async () => {
    const writeMemory = vi.fn((): Promise<TeamWriteMemoryActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: false,
        error: { code: 'team-rejected', message: 'content must be non-empty' },
      },
    }))
    const listMemories = vi.fn()
    render(<TeamAction {...props(actions({ writeMemory, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    await screen.findByText(zh.botMemoriesEmpty)
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    fireEvent.change(screen.getByLabelText(zh.memoryKind), {
      target: { value: 'log' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryContent), {
      target: { value: 'Will fail on Host' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryLayer), {
      target: { value: 'agent' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    expect(await screen.findByText('content must be non-empty (team-rejected)')).toBeTruthy()
    expect(listMemories).not.toHaveBeenCalled()
    expect(screen.getByText(zh.botMemoriesEmpty)).toBeTruthy()
  })

  it('keeps prior memories and shows failure when writeMemory transport is unavailable (T015)', async () => {
    const workerId = 'worker-id' as SessionId
    const existing = {
      memoryId: 'memory-existing' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'profile' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Keep me',
      createdAt: 1,
      updatedAt: 1,
    }
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, memories: [existing] },
    })
    const writeMemory = vi.fn((): Promise<TeamWriteMemoryActionResult> => Promise.resolve(
      remoteFailure('writeMemory offline'),
    ))
    render(<TeamAction {...props(actions({ load, writeMemory }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Keep me')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    fireEvent.change(screen.getByLabelText(zh.memoryKind), {
      target: { value: 'profile' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryContent), {
      target: { value: 'Another' },
    })
    fireEvent.change(screen.getByLabelText(zh.memoryLayer), {
      target: { value: 'user' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.save }))
    expect(await screen.findByText('writeMemory offline (gateway/internal)')).toBeTruthy()
    expect(screen.getByText('Keep me')).toBeTruthy()
  })

  it('browses / recalls Host listMemories on the memory surface (T025 / US4)', async () => {
    const workerId = 'worker-id' as SessionId
    const profile = {
      memoryId: 'memory-profile-r1' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'profile' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Timezone: UTC',
      createdAt: 1,
      updatedAt: 1,
    }
    const log = {
      memoryId: 'memory-log-r1' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'log' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Shipped US4 recall',
      createdAt: 2,
      updatedAt: 2,
    }
    const note = {
      memoryId: 'memory-note-r1' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'note' as const,
      layer: 'user' as const,
      botId: null,
      content: 'Remember the inject path',
      createdAt: 3,
      updatedAt: 3,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, memories: [] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, memories: [profile, log, note] },
      })
    const listMemories = vi.fn((): Promise<TeamListMemoriesActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { memories: [profile, log, note] } },
    }))
    render(<TeamAction {...props(actions({ load, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.botMemoriesEmpty)).toBeTruthy()
    expect(document.querySelector(`[data-team-memory-recall-surface="${workerId}"]`)).toBeTruthy()
    expect(screen.getByText(zh.browseMemoriesHint)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.browseMemories }))
    await waitFor(() => {
      expect(listMemories).toHaveBeenCalledWith(SESSION, { botId: workerId })
    })
    expect(await screen.findByText('Timezone: UTC')).toBeTruthy()
    expect(screen.getByText('Shipped US4 recall')).toBeTruthy()
    expect(screen.getByText('Remember the inject path')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="profile"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="log"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-kind="note"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-inject-indicator]')).toBeNull()
  })

  it('shows optional Host inject indicator when memoryRecallInjects present (T025)', async () => {
    const workerId = 'worker-id' as SessionId
    const memoryId = 'memory-profile-inj' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId
    const profile = {
      memoryId,
      kind: 'profile' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Injected profile fact',
      createdAt: 10,
      updatedAt: 10,
    }
    const assembledAt = 1_700_000_000_000
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: {
        ...view,
        memories: [profile],
        memoryRecallInjects: [{
          memoryIds: [memoryId],
          botId: workerId,
          assembledAt,
        }],
      },
    })
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Injected profile fact')).toBeTruthy()
    const indicator = document.querySelector(
      `[data-team-memory-inject-indicator="applied"][data-team-memory-inject-bot="${workerId}"]`,
    )
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('data-team-memory-inject-at')).toBe(String(assembledAt))
    expect(indicator?.getAttribute('data-team-memory-inject-ids')).toBe(memoryId)
    expect(screen.getByText(zh.memoryInjectApplied.replace('{time}', new Date(assembledAt).toISOString()))).toBeTruthy()
  })

  it('keeps prior memories and shows failure when browse listMemories is unavailable (T025)', async () => {
    const existing = {
      memoryId: 'memory-keep' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'note' as const,
      layer: 'user' as const,
      botId: null,
      content: 'Keep after browse fail',
      createdAt: 1,
      updatedAt: 1,
    }
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, memories: [existing] },
    })
    const listMemories = vi.fn((): Promise<TeamListMemoriesActionResult> => Promise.resolve(
      remoteFailure('listMemories offline'),
    ))
    render(<TeamAction {...props(actions({ load, listMemories }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Keep after browse fail')).toBeTruthy()
    expect(document.querySelector('[data-team-browse-memories="worker-id"]')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.browseMemories }))
    expect(await screen.findByText('listMemories offline (gateway/internal)')).toBeTruthy()
    expect(screen.getByText('Keep after browse fail')).toBeTruthy()
  })

  it('filters browse list by Agent vs User layer and keeps write layer choice (T028 / US5)', async () => {
    const workerId = 'worker-id' as SessionId
    const agentProfile = {
      memoryId: 'memory-agent-a' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'profile' as const,
      layer: 'agent' as const,
      botId: workerId,
      content: 'Agent fact for bot A',
      createdAt: 1,
      updatedAt: 1,
    }
    const userNote = {
      memoryId: 'memory-user-shared' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'note' as const,
      layer: 'user' as const,
      botId: null,
      content: 'User fact shared across bots',
      createdAt: 2,
      updatedAt: 2,
    }
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, memories: [agentProfile, userNote] },
    })
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Agent fact for bot A')).toBeTruthy()
    expect(screen.getByText('User fact shared across bots')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-layer-filter="all"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-layer-label="agent"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-layer-label="user"]')).toBeTruthy()
    expect(screen.getByText(zh.memoryBrowseLayerFilterHint)).toBeTruthy()

    fireEvent.change(screen.getByLabelText(zh.memoryBrowseLayerFilter), {
      target: { value: 'agent' },
    })
    expect(document.querySelector('[data-team-memory-layer-filter="agent"]')).toBeTruthy()
    expect(screen.getByText('Agent fact for bot A')).toBeTruthy()
    expect(screen.queryByText('User fact shared across bots')).toBeNull()
    expect(document.querySelector('[data-team-memory-layer="agent"]')).toBeTruthy()
    expect(document.querySelector('[data-team-memory-layer="user"]')).toBeNull()

    fireEvent.change(screen.getByLabelText(zh.memoryBrowseLayerFilter), {
      target: { value: 'user' },
    })
    expect(document.querySelector('[data-team-memory-layer-filter="user"]')).toBeTruthy()
    expect(screen.getByText('User fact shared across bots')).toBeTruthy()
    expect(screen.queryByText('Agent fact for bot A')).toBeNull()
    expect(document.querySelector('[data-team-memory-layer-label="user"]')).toBeTruthy()

    fireEvent.change(screen.getByLabelText(zh.memoryBrowseLayerFilter), {
      target: { value: 'all' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.writeMemory }))
    const layerSelect = document.querySelector('[data-team-memory-layer-select]')
    expect(layerSelect).toBeTruthy()
    expect(layerSelect?.querySelector('option[value="agent"]')?.textContent).toBe(zh['memoryLayer.agent'])
    expect(layerSelect?.querySelector('option[value="user"]')?.textContent).toBe(zh['memoryLayer.user'])
  })

  it('hides bot A agent rows on bot B while sharing user-layer rows (T028 / FR-007)', async () => {
    const botA = 'worker-id' as SessionId
    const botB = 'worker-b-id' as SessionId
    const agentA = {
      memoryId: 'memory-agent-a-only' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'log' as const,
      layer: 'agent' as const,
      botId: botA,
      content: 'Secret agent log for A',
      createdAt: 1,
      updatedAt: 1,
    }
    const agentB = {
      memoryId: 'memory-agent-b-only' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'log' as const,
      layer: 'agent' as const,
      botId: botB,
      content: 'Secret agent log for B',
      createdAt: 2,
      updatedAt: 2,
    }
    const userShared = {
      memoryId: 'memory-user-cross' as import('@deepseek-ai/dsh-experimental-agent-team/client').MemoryId,
      kind: 'profile' as const,
      layer: 'user' as const,
      botId: null,
      content: 'Shared user profile',
      createdAt: 3,
      updatedAt: 3,
    }
    const twoBotView: TeamView = {
      ...view,
      members: [
        view.members[0]!,
        {
          id: botA,
          name: 'worker-a',
          role: 'teammate',
          status: 'inactive',
          model: 'model-a',
          modelSelection: { provider: 'fixture', model: 'model-a' },
          diagnostics: [],
        },
        {
          id: botB,
          name: 'worker-b',
          role: 'teammate',
          status: 'inactive',
          model: 'model-b',
          modelSelection: { provider: 'fixture', model: 'model-b' },
          diagnostics: [],
        },
      ],
      unassignedBotIds: [SESSION, botA, botB],
      memories: [agentA, agentB, userShared],
    }
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: twoBotView,
    })
    render(<TeamAction {...props(actions({ load }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText('Secret agent log for A')).toBeTruthy()
    expect(screen.getByText('Secret agent log for B')).toBeTruthy()
    expect(screen.getAllByText('Shared user profile')).toHaveLength(2)

    const paneA = document.querySelector(`[data-team-bot-memories="${botA}"]`)
    const paneB = document.querySelector(`[data-team-bot-memories="${botB}"]`)
    expect(paneA?.textContent).toContain('Secret agent log for A')
    expect(paneA?.textContent).not.toContain('Secret agent log for B')
    expect(paneB?.textContent).toContain('Secret agent log for B')
    expect(paneB?.textContent).not.toContain('Secret agent log for A')
    expect(paneA?.querySelector('[data-team-memory-layer="agent"]')).toBeTruthy()
    expect(paneB?.querySelector('[data-team-memory-layer="agent"]')).toBeTruthy()
    expect(paneA?.querySelector('[data-team-memory-layer="user"]')).toBeTruthy()
    expect(paneB?.querySelector('[data-team-memory-layer="user"]')).toBeTruthy()

    const filter = screen.getAllByLabelText(zh.memoryBrowseLayerFilter)[0]!
    fireEvent.change(filter, { target: { value: 'agent' } })
    expect(screen.getByText('Secret agent log for A')).toBeTruthy()
    expect(screen.getByText('Secret agent log for B')).toBeTruthy()
    expect(screen.queryByText('Shared user profile')).toBeNull()
  })

  it('lists Host connector catalog and installs one entry (T019 / US1)', async () => {
    const ConnectorId = (id: string) => id as import('@deepseek-ai/dsh-experimental-agent-team/client').ConnectorId
    const installed = {
      connectorId: ConnectorId('connector-1'),
      catalogId: 'verifier-fixture',
      serverName: 'verifier_fixture',
      displayName: 'Verifier Fixture Connector',
      installState: 'installed' as const,
      authState: 'needs_auth' as const,
      transport: 'stdio' as const,
      credentialConfigured: false,
      createdAt: 1,
      updatedAt: 1,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, connectors: [] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, connectors: [installed] },
      })
    const listConnectorCatalog = vi.fn((): Promise<TeamListConnectorCatalogActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          catalog: [{
            catalogId: 'verifier-fixture',
            displayName: 'Verifier Fixture Connector',
            serverName: 'verifier_fixture',
            transport: 'stdio' as const,
            fixture: true,
            authMode: 'in_app' as const,
          }],
        },
      },
    }))
    const installConnector = vi.fn((): Promise<TeamInstallConnectorActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { connector: installed } },
    }))
    render(<TeamAction {...props(actions({ load, listConnectorCatalog, installConnector }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.connectors)).toBeTruthy()
    expect(screen.getByText(zh.connectorsHint)).toBeTruthy()
    expect(await screen.findByText('Verifier Fixture Connector')).toBeTruthy()
    expect(document.querySelector('[data-team-connector-catalog="verifier-fixture"]')).toBeTruthy()
    expect(await screen.findByText(zh.connectorsEmptyInstalled).then(() => true).catch(() => false)).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: zh.connectorInstall }))
    await waitFor(() => {
      expect(installConnector).toHaveBeenCalledWith(SESSION, { catalogId: 'verifier-fixture' })
    })
    await waitFor(() => {
      expect(document.querySelector('[data-team-connector-installed-badge="verifier-fixture"]')).toBeTruthy()
    })
    expect(document.querySelector('[data-team-connector="connector-1"]')).toBeTruthy()
    expect(document.querySelector('[data-team-connector-auth-state="needs_auth"]')).toBeTruthy()
    expect(screen.queryByText(zh.connectorsEmptyInstalled)).toBeNull()
  })

  it('shows catalog unavailable when Host listConnectorCatalog is empty (T019)', async () => {
    const listConnectorCatalog = vi.fn((): Promise<TeamListConnectorCatalogActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { catalog: [] } },
    }))
    render(<TeamAction {...props(actions({ listConnectorCatalog }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.connectorsCatalogUnavailable)).toBeTruthy()
    expect(document.querySelector('[data-team-connectors-catalog-unavailable]')).toBeTruthy()
  })

  it('authenticates via in-app credential UX and shows tool success (T020 / US1)', async () => {
    const ConnectorId = (id: string) => id as import('@deepseek-ai/dsh-experimental-agent-team/client').ConnectorId
    const needsAuth = {
      connectorId: ConnectorId('connector-1'),
      catalogId: 'verifier-fixture',
      serverName: 'verifier_fixture',
      displayName: 'Verifier Fixture Connector',
      installState: 'installed' as const,
      authState: 'needs_auth' as const,
      transport: 'stdio' as const,
      credentialConfigured: false,
      createdAt: 1,
      updatedAt: 1,
    }
    const ready = {
      ...needsAuth,
      authState: 'ready' as const,
      credentialConfigured: true,
      updatedAt: 2,
    }
    const load = vi.fn()
      .mockResolvedValueOnce({ ok: true as const, value: { ...view, connectors: [needsAuth] } })
      .mockResolvedValue({
        ok: true as const,
        value: { ...view, connectors: [ready] },
      })
    const authenticateConnector = vi.fn((): Promise<TeamAuthenticateConnectorActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { connector: ready } },
    }))
    const describeConnectorCredential = vi.fn(
      (): Promise<TeamDescribeConnectorCredentialActionResult> => Promise.resolve({
        ok: true,
        value: {
          ok: true,
          value: {
            connectorId: ConnectorId('connector-1'),
            credentialKey: 'agent-teams-connector/connector-1',
            configured: true,
            writable: true,
            kind: 'api-key' as const,
          },
        },
      }),
    )
    const invokeConnectorTool = vi.fn((): Promise<TeamInvokeConnectorToolActionResult> => Promise.resolve({
      ok: true,
      value: {
        ok: true,
        value: {
          toolCall: {
            connectorId: ConnectorId('connector-1'),
            toolName: 'mcp__verifier_fixture__ping',
            outcome: 'success' as const,
          },
        },
      },
    }))
    const listConnectors = vi.fn((): Promise<TeamListConnectorsActionResult> => Promise.resolve({
      ok: true,
      value: { ok: true, value: { connectors: [ready] } },
    }))
    render(<TeamAction {...props(actions({
      load,
      authenticateConnector,
      describeConnectorCredential,
      invokeConnectorTool,
      listConnectors,
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh['connectorAuthState.needs_auth'])).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.connectorAuth }))
    expect(screen.getByText(zh.connectorAuthHint)).toBeTruthy()
    expect(screen.getByText(zh.connectorAuthReject)).toBeTruthy()
    const secret = screen.getByLabelText(zh.connectorAuthSecret)
    fireEvent.change(secret, { target: { value: 'fixture-token' } })
    fireEvent.click(screen.getByRole('button', { name: zh.connectorAuthSave }))
    await waitFor(() => {
      expect(authenticateConnector).toHaveBeenCalledWith(SESSION, {
        connectorId: 'connector-1',
        secret: 'fixture-token',
      })
    })
    await waitFor(() => {
      expect(describeConnectorCredential).toHaveBeenCalledWith(SESSION, {
        connectorId: 'connector-1',
      })
    })
    expect(await screen.findByText(zh.connectorToolsReady)).toBeTruthy()
    expect(document.querySelector('[data-team-connector-tools-ready="true"]')).toBeTruthy()
    expect(screen.getByText(zh.connectorCredentialConfigured)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.connectorInvokeTool }))
    await waitFor(() => {
      expect(invokeConnectorTool).toHaveBeenCalledWith(SESSION, { connectorId: 'connector-1' })
    })
    expect(await screen.findByText(zh.connectorToolSuccess)).toBeTruthy()
    expect(document.querySelector('[data-team-connector-tool-outcome="success"]')).toBeTruthy()
    expect(document.querySelector('[data-team-connector-tool-name="mcp__verifier_fixture__ping"]')).toBeTruthy()
    expect(JSON.stringify(authenticateConnector.mock.calls)).not.toContain('1Password')
  })

  it('keeps prior connector rows when authenticateConnector transport fails (T020)', async () => {
    const ConnectorId = (id: string) => id as import('@deepseek-ai/dsh-experimental-agent-team/client').ConnectorId
    const needsAuth = {
      connectorId: ConnectorId('connector-1'),
      catalogId: 'verifier-fixture',
      serverName: 'verifier_fixture',
      displayName: 'Verifier Fixture Connector',
      installState: 'installed' as const,
      authState: 'needs_auth' as const,
      transport: 'stdio' as const,
      credentialConfigured: false,
      createdAt: 1,
      updatedAt: 1,
    }
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, connectors: [needsAuth] },
    })
    const authenticateConnector = vi.fn((): Promise<TeamAuthenticateConnectorActionResult> => Promise.resolve(
      remoteFailure('authenticateConnector offline'),
    ))
    render(<TeamAction {...props(actions({ load, authenticateConnector }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh['connectorAuthState.needs_auth'])).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.connectorAuth }))
    fireEvent.change(screen.getByLabelText(zh.connectorAuthSecret), {
      target: { value: 'token' },
    })
    fireEvent.click(screen.getByRole('button', { name: zh.connectorAuthSave }))
    expect(await screen.findByText('authenticateConnector offline (gateway/internal)')).toBeTruthy()
    expect(document.querySelector('[data-team-connector-auth-state="needs_auth"]')).toBeTruthy()
    expect(document.querySelector('[data-team-connector-tool-outcome]')).toBeNull()
  })

  it('enables standing deny via Host setStandingDeny and shows blocked tool outcome (T027)', async () => {
    const ConnectorId = (id: string) => id as import('@deepseek-ai/dsh-experimental-agent-team/client').ConnectorId
    const ready = {
      connectorId: ConnectorId('connector-1'),
      catalogId: 'verifier-fixture',
      serverName: 'verifier_fixture',
      displayName: 'Verifier Fixture Connector',
      installState: 'installed' as const,
      authState: 'ready' as const,
      transport: 'stdio' as const,
      credentialConfigured: true,
      createdAt: 1,
      updatedAt: 2,
    }
    let policy: 'ask' | 'never' = 'ask'
    const getTrustPolicy = vi.fn((): Promise<TeamGetTrustPolicyActionResult> => Promise.resolve({
      ok: true as const,
      value: { ok: true as const, value: { policy } },
    }))
    const setStandingDeny = vi.fn((
      _session: typeof SESSION,
      input: { enabled: boolean },
    ): Promise<TeamSetStandingDenyActionResult> => {
      policy = input.enabled ? 'never' : 'ask'
      return Promise.resolve({
        ok: true as const,
        value: { ok: true as const, value: { policy } },
      })
    })
    const invokeConnectorTool = vi.fn((): Promise<TeamInvokeConnectorToolActionResult> => Promise.resolve({
      ok: true as const,
      value: {
        ok: true as const,
        value: {
          toolCall: {
            connectorId: ConnectorId('connector-1'),
            toolName: 'mcp__verifier_fixture__ping',
            outcome: 'denied' as const,
            detail: 'standing never',
          },
        },
      },
    }))
    const load = vi.fn().mockResolvedValue({
      ok: true as const,
      value: { ...view, connectors: [ready] },
    })
    render(<TeamAction {...props(actions({
      load,
      getTrustPolicy,
      setStandingDeny,
      invokeConnectorTool,
      listConnectors: () => Promise.resolve({
        ok: true as const,
        value: { ok: true as const, value: { connectors: [ready] } },
      }),
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.trustDeny)).toBeTruthy()
    expect(document.querySelector('[data-team-trust-deny]')).toBeTruthy()
    expect(await screen.findByText(zh.standingDenyInactive)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.standingDenyEnable }))
    await waitFor(() => {
      expect(setStandingDeny).toHaveBeenCalledWith(SESSION, { enabled: true })
    })
    expect(await screen.findByText(zh.standingDenyActive)).toBeTruthy()
    expect(document.querySelector('[data-team-standing-deny="on"]')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.connectorInvokeTool }))
    expect(await screen.findByText(zh.connectorToolBlocked)).toBeTruthy()
    expect(document.querySelector('[data-team-connector-tool-outcome="denied"]')).toBeTruthy()
    expect(document.querySelector('[data-team-connector-blocked]')).toBeTruthy()
    expect(screen.queryByText(zh.connectorToolSuccess)).toBeNull()
  })

  it('answers Host HTTP approval deny card without Main bus (T027)', async () => {
    let pending = [{
      requestId: 'req-1',
      toolName: 'mcp__verifier_fixture__ping',
      reason: 'connector tool invoke requires approval',
    }]
    const listeners = new Set<(rows: typeof pending) => void>()
    const listPendingTrustApprovals = vi.fn(async () => pending)
    const answerTrustApproval = vi.fn(async (
      _session: typeof SESSION,
      input: { requestId: string; decision: 'deny' | 'allow' },
    ) => {
      pending = pending.filter(row => row.requestId !== input.requestId)
      for (const listener of listeners) listener(pending)
      return {
        requestId: input.requestId,
        outcome: 'rejected' as const,
        source: 'user_deny' as const,
      }
    })
    const subscribePendingTrustApprovals = vi.fn((listener: (rows: typeof pending) => void) => {
      listeners.add(listener)
      listener(pending)
      return () => { listeners.delete(listener) }
    })
    render(<TeamAction {...props(actions({
      listPendingTrustApprovals,
      answerTrustApproval,
      subscribePendingTrustApprovals,
    }))} />)
    fireEvent.click(screen.getByRole('button', { name: zh.trigger }))
    expect(await screen.findByText(zh.approvalDenyCard)).toBeTruthy()
    expect(document.querySelector('[data-team-approval-deny-card="req-1"]')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: zh.approvalDenyReject }))
    await waitFor(() => {
      expect(answerTrustApproval).toHaveBeenCalledWith(SESSION, {
        requestId: 'req-1',
        decision: 'deny',
      })
    })
    expect(await screen.findByText(zh.approvalDenyEmpty)).toBeTruthy()
  })

})
