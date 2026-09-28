// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  HostMailboxMessage, TeamView,
} from '@deepseek-ai/dsh-experimental-agent-team/client'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import {
  HandoffNotices, type HandoffNoticesInjected, type HandoffNoticesProps,
} from '../src/client/HandoffNotices.tsx'
import { zh } from '../src/client/locales.ts'

afterEach(cleanup)

const LEAD = 'lead' as SessionId
const WORKER = 'worker-id' as SessionId

const baseView: TeamView = {
  members: [
    {
      id: LEAD,
      name: 'lead',
      role: 'lead',
      status: 'idle',
      diagnostics: [],
    },
    {
      id: WORKER,
      name: 'worker',
      role: 'teammate',
      status: 'idle',
      diagnostics: [],
    },
  ],
  tasks: [],
  sections: [],
  unassignedBotIds: [WORKER],
  handoffs: [],
  skills: [],
  routines: [],
  memories: [],
}

function props(
  actions: HandoffNoticesInjected,
  sessionId: SessionId = LEAD,
): HandoffNoticesProps {
  return {
    sessionId,
    ...actions,
    t: makeTranslate(zh, commonZh),
  } as unknown as HandoffNoticesProps
}

describe('HandoffNotices', () => {
  it('renders TeamView.handoffs for the viewed Session with Host deliveryState (T024)', async () => {
    const handoff: HostMailboxMessage = {
      id: 'msg-1' as HostMailboxMessage['id'],
      fromBotId: LEAD,
      toBotId: WORKER,
      body: [{ type: 'text', text: 'notice strip handoff' }],
      createdAt: 1,
      deliveryState: 'visible-pending',
      source: { kind: 'host-mailbox' },
    }
    const load = vi.fn(async () => ({
      ok: true as const,
      value: { ...baseView, handoffs: [handoff] },
    }))
    const openTeammate = vi.fn(async () => {})
    render(<HandoffNotices {...props({ load, openTeammate })} />)
    expect(await screen.findByText(zh.noticesTitle)).toBeTruthy()
    const row = await screen.findByText('notice strip handoff')
    const article = row.closest('[data-chat-handoff]')
    expect(article?.getAttribute('data-delivery-state')).toBe('visible-pending')
    expect(article?.getAttribute('data-handoff-source')).toBe('host-mailbox')
    expect(article?.hasAttribute('data-team-handoff')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: zh.open }))
    await waitFor(() => {
      expect(openTeammate).toHaveBeenCalledWith(LEAD, expect.objectContaining({ id: WORKER }))
    })
  })

  it('shows recipient-acted deliveryState from Host TeamView.handoffs (T031)', async () => {
    const handoff: HostMailboxMessage = {
      id: 'msg-acted' as HostMailboxMessage['id'],
      fromBotId: LEAD,
      toBotId: WORKER,
      body: [{ type: 'text', text: 'recipient already followed up' }],
      createdAt: 2,
      deliveryState: 'acted',
      source: { kind: 'host-mailbox' },
    }
    const load = vi.fn(async () => ({
      ok: true as const,
      value: { ...baseView, handoffs: [handoff] },
    }))
    render(<HandoffNotices {...props({ load, openTeammate: vi.fn(async () => {}) })} />)
    const row = await screen.findByText('recipient already followed up')
    const article = row.closest('[data-chat-handoff]')
    expect(article?.getAttribute('data-delivery-state')).toBe('acted')
    expect(article?.getAttribute('data-handoff-source')).toBe('host-mailbox')
    expect(article?.textContent).toContain(zh['deliveryState.acted'])
  })

  it('hides the strip when no handoff involves the viewed Session', async () => {
    const handoff: HostMailboxMessage = {
      id: 'msg-other' as HostMailboxMessage['id'],
      fromBotId: 'other-a' as SessionId,
      toBotId: 'other-b' as SessionId,
      body: [{ type: 'text', text: 'unrelated' }],
      createdAt: 1,
      deliveryState: 'queued',
      source: { kind: 'host-mailbox' },
    }
    const load = vi.fn(async () => ({
      ok: true as const,
      value: { ...baseView, handoffs: [handoff] },
    }))
    const { container } = render(
      <HandoffNotices {...props({ load, openTeammate: vi.fn(async () => {}) })} />,
    )
    await waitFor(() => { expect(load).toHaveBeenCalled() })
    expect(container.querySelector('[data-chat-handoff-notices]')).toBeNull()
  })
})
