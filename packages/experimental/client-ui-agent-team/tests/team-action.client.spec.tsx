// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  HostMailboxMessage,
  TeamMessageId,
  TeamTaskId, TeamTaskView as TeamTask, TeamView,
} from '@deepseek-ai/dsh-experimental-agent-team/client'
import { makeTranslate, RemoteError } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import {
  TeamAction, type TeamActionInjected, type TeamActionProps, type TeamActionResult,
  type TeamCreateBotActionResult, type TeamDeleteBotActionResult, type TeamRenameBotActionResult,
  type TeamSetAvatarActionResult, type TeamTaskActionResult, type TeamUpdatePersonaActionResult,
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
  unassignedBotIds: ['worker-id' as SessionId],
  handoffs: [],
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
        value: { ...view, members: [...view.members, createdMember] },
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

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'worker' } })
    await waitFor(() => {
      expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('worker')
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
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
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
})
