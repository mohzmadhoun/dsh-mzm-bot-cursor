/** Unit coverage for Host mailbox deliveryState reconstruction (T021). */

import { describe, expect, it } from 'vitest'
import { SessionId, SessionSeq } from '@deepseek-ai/dsh-session'
import type { SessionEvent, SessionEventMap, SessionEventType } from '@deepseek-ai/dsh-session'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { observeMailboxDeliveryState } from '../src/delivery-state.ts'
import { TeamId, TeamMessageId } from '../src/types.ts'
import type { TeamMessageSnapshot } from '../src/types.ts'

const LEAD = SessionId('lead')
const SENDER = SessionId('bot-a')
const TARGET = SessionId('bot-b')
const MESSAGE = TeamMessageId('team-message-1')

function event<T extends SessionEventType>(
  type: T,
  data: SessionEventMap[T],
  seq: SessionSeq,
): SessionEvent<T> {
  return { type, data, seq, time: seq } as unknown as SessionEvent<T>
}

function queuedMessage(): TeamMessageSnapshot {
  return {
    id: MESSAGE,
    senderId: SENDER,
    senderName: 'bot-a',
    targetId: TARGET,
    content: [{ type: 'text', text: 'handoff' }],
  }
}

function leadQueued(): SessionEvent {
  return event('team/message/queued', {
    version: 2,
    teamId: TeamId(LEAD),
    message: queuedMessage(),
  }, SessionSeq(1))
}

function leadDelivered(): SessionEvent {
  return event('team/message/delivered', {
    version: 2,
    teamId: TeamId(LEAD),
    messageId: MESSAGE,
    targetId: TARGET,
  }, SessionSeq(2))
}

describe('observeMailboxDeliveryState', () => {
  it('returns undefined when the Lead never queued the message', () => {
    expect(observeMailboxDeliveryState([], [], MESSAGE)).toBeUndefined()
    expect(observeMailboxDeliveryState([leadDelivered()], [], MESSAGE)).toBeUndefined()
  })

  it('returns queued before the Lead delivered edge', () => {
    expect(observeMailboxDeliveryState([leadQueued()], [], MESSAGE)).toBe('queued')
  })

  it('returns delivered when Lead ack exists but the target log has no receipt yet', () => {
    expect(observeMailboxDeliveryState(
      [leadQueued(), leadDelivered()],
      [],
      MESSAGE,
    )).toBe('delivered')
  })

  it('returns visible-pending for a durable user/message receipt without a later turn', () => {
    const receipt = createUserMessage({
      content: [{ type: 'text', text: 'handoff' }],
      source: {
        kind: 'team-message',
        teamId: TeamId(LEAD),
        messageId: MESSAGE,
        senderId: SENDER,
        senderName: 'bot-a',
      },
    })
    const targetEvents = [
      event('user/message', receipt, SessionSeq(10)),
    ]
    expect(observeMailboxDeliveryState(
      [leadQueued(), leadDelivered()],
      targetEvents,
      MESSAGE,
    )).toBe('visible-pending')
  })

  it('returns visible-pending when the receipt is only in the pending inbox splice', () => {
    const receipt = createUserMessage({
      content: [{ type: 'text', text: 'handoff' }],
      source: {
        kind: 'team-message',
        teamId: TeamId(LEAD),
        messageId: MESSAGE,
        senderId: SENDER,
        senderName: 'bot-a',
      },
    })
    const targetEvents = [
      event('agent/inbox/spliced', {
        target: 'next-step',
        start: 0,
        removedCount: 0,
        inserted: [receipt],
      }, SessionSeq(10)),
    ]
    expect(observeMailboxDeliveryState(
      [leadQueued(), leadDelivered()],
      targetEvents,
      MESSAGE,
    )).toBe('visible-pending')
  })

  it('returns acted when a request/header follows the durable team-message receipt', () => {
    const receipt = createUserMessage({
      content: [{ type: 'text', text: 'handoff' }],
      source: {
        kind: 'team-message',
        teamId: TeamId(LEAD),
        messageId: MESSAGE,
        senderId: SENDER,
        senderName: 'bot-a',
      },
    })
    const targetEvents = [
      event('user/message', receipt, SessionSeq(10)),
      event('request/header', {
        header: { config: { provider: 'mock', model: 'model-b' } },
        reason: 'initial',
      }, SessionSeq(11)),
    ]
    expect(observeMailboxDeliveryState(
      [leadQueued(), leadDelivered()],
      targetEvents,
      MESSAGE,
    )).toBe('acted')
  })
})
