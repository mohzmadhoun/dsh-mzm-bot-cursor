/**
 * Reconstruct product Host mailbox deliveryState from session logs.
 * Lead `team/message/queued` → `team/message/delivered`, then target inbox /
 * history decide `visible-pending` vs `acted` (FR-004 / FR-005).
 */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { messageAccepted } from './session-message.ts'
import type { TeamMailboxDeliveryState, TeamMessageId } from './types.ts'

/**
 * Whether the target Session still holds the team-message only in its pending
 * inbox (not yet claimed into durable `user/message` history).
 * @param events - target Session non-inherited event suffix (or full log).
 * @param messageId - durable mailbox message identity.
 * @returns true when the identity is inbox-pending only.
 */
function pendingInboxOnly(events: readonly SessionEvent[], messageId: TeamMessageId): boolean {
  const inHistory = events.some(event =>
    event.type === 'user/message'
    && event.data.source.kind === 'team-message'
    && event.data.source.messageId === messageId)
  if (inHistory) return false
  return messageAccepted(events, message =>
    message.source.kind === 'team-message' && message.source.messageId === messageId)
}

/**
 * Whether the target Session recorded a model turn after accepting the message.
 * @param events - target Session event log.
 * @param messageId - durable mailbox message identity.
 * @returns true when a `request/header` follows the durable `user/message` receipt.
 */
function recipientActed(events: readonly SessionEvent[], messageId: TeamMessageId): boolean {
  let receiptSeq: number | undefined
  for (const event of events) {
    if (event.type === 'user/message'
      && event.data.source.kind === 'team-message'
      && event.data.source.messageId === messageId) {
      receiptSeq = event.seq
      break
    }
  }
  if (receiptSeq === undefined) return false
  return events.some(event =>
    event.type === 'request/header' && event.seq > receiptSeq)
}

/**
 * Derive product {@link TeamMailboxDeliveryState} from Lead + target Session logs.
 * Unknown / missing queue edges return `undefined` (caller validates membership).
 * @param leadEvents - Lead Session events (owns `team/message/*`).
 * @param targetEvents - recipient Session events (inbox / history / turns).
 * @param messageId - durable mailbox message identity.
 * @returns observed delivery state, or `undefined` when the Lead never queued it.
 */
export function observeMailboxDeliveryState(
  leadEvents: readonly SessionEvent[],
  targetEvents: readonly SessionEvent[],
  messageId: TeamMessageId,
): TeamMailboxDeliveryState | undefined {
  const queued = leadEvents.some(event =>
    event.type === 'team/message/queued' && event.data.message.id === messageId)
  if (!queued) return undefined

  const delivered = leadEvents.some(event =>
    event.type === 'team/message/delivered' && event.data.messageId === messageId)
  if (!delivered) return 'queued'

  if (recipientActed(targetEvents, messageId)) return 'acted'
  if (pendingInboxOnly(targetEvents, messageId)
    || messageAccepted(targetEvents, message =>
      message.source.kind === 'team-message' && message.source.messageId === messageId)) {
    return 'visible-pending'
  }
  // Lead delivered edge exists but target log no longer shows the receipt
  // (race / partial read). Keep the intermediate product state.
  return 'delivered'
}
