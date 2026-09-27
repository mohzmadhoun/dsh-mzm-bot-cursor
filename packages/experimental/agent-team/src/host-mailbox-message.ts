/**
 * Reconstruct product Host mailbox message fields from durable session logs.
 * Lead `team/message/queued` owns id / fromBotId / toBotId / body / createdAt;
 * deliveryState folds Lead + target logs; source is always Host-only.
 */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import * as deliveryStateModule from './delivery-state.ts'
import type {
  HostMailboxMessage,
  HostMailboxMessageSource,
  TeamMailboxDeliveryState,
  TeamMessageId,
} from './types.ts'

/** Fixed Host-only source value written into every reconstructed product mailbox record. */
export const HOST_MAILBOX_MESSAGE_SOURCE: HostMailboxMessageSource = { kind: 'host-mailbox' }

/**
 * Resolve deliveryState after a Lead queue edge is already known to exist.
 * @param leadEvents - Lead Session events (owns `team/message/*`).
 * @param targetEvents - recipient Session events (inbox / history / turns).
 * @param messageId - durable mailbox message identity.
 * @returns product delivery observation.
 */
function deliveryStateAfterQueued(
  leadEvents: readonly SessionEvent[],
  targetEvents: readonly SessionEvent[],
  messageId: TeamMessageId,
): TeamMailboxDeliveryState {
  const state = deliveryStateModule.observeMailboxDeliveryState(leadEvents, targetEvents, messageId)
  if (state === undefined) {
    throw new Error(`Host mailbox message "${messageId}" missing deliveryState after queue edge`)
  }
  return state
}

/**
 * Read one product {@link HostMailboxMessage} from Lead + target Session logs.
 * Missing Lead queue edge returns `undefined`. Source is always Host mailbox —
 * never Electron IPC (FR-004).
 * @param leadEvents - Lead Session events (owns `team/message/*`).
 * @param targetEvents - recipient Session events (inbox / history / turns).
 * @param messageId - durable mailbox message identity.
 * @returns product mailbox fields, or `undefined` when the Lead never queued it.
 */
export function readHostMailboxMessage(
  leadEvents: readonly SessionEvent[],
  targetEvents: readonly SessionEvent[],
  messageId: TeamMessageId,
): HostMailboxMessage | undefined {
  const queued = leadEvents.find(event =>
    event.type === 'team/message/queued' && event.data.message.id === messageId)
  if (queued === undefined || queued.type !== 'team/message/queued') return undefined

  const message = queued.data.message
  return {
    id: message.id,
    fromBotId: message.senderId,
    toBotId: message.targetId,
    body: structuredClone(message.content),
    createdAt: queued.time,
    deliveryState: deliveryStateAfterQueued(leadEvents, targetEvents, messageId),
    source: HOST_MAILBOX_MESSAGE_SOURCE,
  }
}
