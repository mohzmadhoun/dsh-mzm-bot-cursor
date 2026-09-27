/** Chat presentation for Host mailbox 1:1 handoffs (FR-005). */

import type { ReactNode } from 'react'
import type { ChatViewSlotProps } from '../contract/slots.ts'
import {
  handoffBodyPreview, readTeamMessageSource, type TeamMessageSourceView,
} from './team-message-source.ts'
import css from './MessageItem.module.css'

/** Delivery observation shown on the chat handoff row. */
export type ChatHandoffDeliveryState = 'visible-pending' | 'acted'

/** Props for a durable or pending Host mailbox handoff row. */
export interface MailboxHandoffRowProps {
  /** Durable or pending message content. */
  readonly content: readonly unknown[]
  /** Logged / inbox message source (`team-message` or pre-parsed view). */
  readonly source: unknown | TeamMessageSourceView
  /** Product delivery observation when known from inbox vs follow-up. */
  readonly deliveryState: ChatHandoffDeliveryState
  /** Locale seat from the Chat view. */
  readonly t: ChatViewSlotProps['t']
}

/**
 * Render one Host mailbox handoff so the user can see pending / received /
 * follow-up without leaving chat or copy-pasting between bots.
 * @param props - content, peer source, delivery state, and locale seat.
 * @returns the handoff row, or null when the source is not a team message.
 */
export function MailboxHandoffRow({
  content, source, deliveryState, t,
}: MailboxHandoffRowProps): ReactNode {
  const peer = source !== null
    && typeof source === 'object'
    && 'kind' in source
    && (source as TeamMessageSourceView).kind === 'team-message'
    && typeof (source as TeamMessageSourceView).messageId === 'string'
    ? source as TeamMessageSourceView
    : readTeamMessageSource(source)
  if (peer === null) return null
  const preview = handoffBodyPreview(content)
  const stateLabel = deliveryState === 'acted'
    ? t('message.handoff.acted')
    : t('message.handoff.pending')
  return (
    <article
      className={css.handoffRow}
      role="status"
      data-chat-handoff
      data-handoff-id={peer.messageId}
      data-delivery-state={deliveryState}
      data-handoff-source="host-mailbox"
    >
      <div className={css.handoffTitle}>
        <strong>{t('message.handoff.title')}</strong>
        <span data-chat-handoff-state>{stateLabel}</span>
      </div>
      <div className={css.handoffMeta}>
        <span>{t('message.handoff.from', { name: peer.senderName })}</span>
        <span>{peer.messageId}</span>
      </div>
      {preview !== '' && <p className={css.handoffBody} data-chat-handoff-body>{preview}</p>}
    </article>
  )
}
