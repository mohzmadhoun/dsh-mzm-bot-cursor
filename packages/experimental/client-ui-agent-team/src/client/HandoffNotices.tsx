/** Session-level Host mailbox handoff strip from TeamView.handoffs (FR-005). */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  HostMailboxMessage,
  TeamMailboxDeliveryState,
  TeamMemberView as TeamRosterMember,
  TeamView,
} from '@deepseek-ai/dsh-experimental-agent-team/client'
import type { RemoteResult } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { NS, type TeamKey } from './locales.ts'
import css from './HandoffNotices.module.css'

/** Injected Host view loader and teammate navigation. */
export interface HandoffNoticesInjected {
  load: (sessionId: SessionId) => Promise<RemoteResult<TeamView>>
  openTeammate: (sessionId: SessionId, member: TeamRosterMember) => Promise<void>
}

/** Full props of the conversation.session.notices handoff strip. */
export type HandoffNoticesProps =
  PropsRuntime<'conversation.session.notices'>
  & HandoffNoticesInjected
  & PropsLocale<typeof NS>

function deliveryStateKey(state: TeamMailboxDeliveryState): TeamKey {
  switch (state) {
    case 'queued': return 'deliveryState.queued'
    case 'delivered': return 'deliveryState.delivered'
    case 'visible-pending': return 'deliveryState.visible-pending'
    case 'acted': return 'deliveryState.acted'
  }
}

/** First text block from a Host mailbox body for the notice preview. */
function handoffBodyPreview(body: HostMailboxMessage['body']): string {
  for (const block of body) {
    if (block.type === 'text' && block.text.trim() !== '') return block.text
  }
  return ''
}

/** Resolve a Bot display label from the current Team roster when known. */
function memberLabel(
  members: readonly TeamRosterMember[],
  id: HostMailboxMessage['fromBotId'],
): string {
  const member = members.find(row => row.id === id)
  if (member === undefined) return id
  return member.displayName ?? member.name
}

/**
 * Handoffs that involve the viewed Session as sender or recipient.
 * @param handoffs - Host TeamView.handoffs projection.
 * @param sessionId - currently viewed Session.
 * @returns filtered rows in Host projection order.
 */
function involvingSession(
  handoffs: readonly HostMailboxMessage[],
  sessionId: SessionId,
): HostMailboxMessage[] {
  return handoffs.filter(row => row.fromBotId === sessionId || row.toBotId === sessionId)
}

/**
 * Render Host mailbox handoffs for the current Session from `agentTeams/view`
 * so pending / acted state is visible without opening the Agent Team panel.
 */
export function HandoffNotices({
  sessionId, load, openTeammate, t,
}: HandoffNoticesProps) {
  const [view, setView] = useState<TeamView | null>(null)
  const sessionRef = useRef(sessionId)
  const refreshGeneration = useRef(0)
  sessionRef.current = sessionId

  const refresh = useCallback(async (): Promise<void> => {
    const requestedSession = sessionId
    const generation = ++refreshGeneration.current
    const result = await load(requestedSession)
    if (sessionRef.current !== requestedSession || refreshGeneration.current !== generation) return
    if (result.ok) setView(result.value)
  }, [load, sessionId])

  useEffect(() => {
    refreshGeneration.current += 1
    setView(null)
    void refresh()
  }, [refresh, sessionId])

  if (view === null) return null
  const rows = involvingSession(view.handoffs, sessionId)
  if (rows.length === 0) return null

  return (
    <section
      className={css.root}
      data-chat-handoff-notices
      aria-label={t('noticesTitle')}
    >
      <div className={css.header}>
        <strong>{t('noticesTitle')}</strong>
        <button type="button" className={css.refresh} onClick={() => { void refresh() }}>
          {t('refresh')}
        </button>
      </div>
      <div className={css.list}>
        {rows.map((handoff) => {
          const peerId = handoff.fromBotId === sessionId ? handoff.toBotId : handoff.fromBotId
          const peer = view.members.find(member => member.id === peerId)
          const preview = handoffBodyPreview(handoff.body)
          return (
            <article
              key={handoff.id}
              className={css.row}
              data-chat-handoff
              data-team-handoff
              data-handoff-id={handoff.id}
              data-delivery-state={handoff.deliveryState}
              data-handoff-source={handoff.source.kind}
            >
              <div className={css.title}>
                <strong>{preview || handoff.id}</strong>
                <span data-chat-handoff-state>{t(deliveryStateKey(handoff.deliveryState))}</span>
              </div>
              <div className={css.meta}>
                <span>{t('handoffFrom')}: {memberLabel(view.members, handoff.fromBotId)}</span>
                <span>{t('handoffTo')}: {memberLabel(view.members, handoff.toBotId)}</span>
              </div>
              {peer !== undefined && peer.role === 'teammate' && (
                <button
                  type="button"
                  className={css.open}
                  onClick={() => {
                    void openTeammate(sessionId, peer).catch(() => {
                      // Navigation failure leaves the notice strip unchanged.
                    })
                  }}
                >
                  {t('open')}
                </button>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
