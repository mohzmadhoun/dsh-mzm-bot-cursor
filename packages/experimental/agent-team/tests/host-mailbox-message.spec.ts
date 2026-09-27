/** Unit coverage for product Host mailbox field reconstruction (T022). */

import { describe, expect, it, vi } from 'vitest'
import { SessionId, SessionSeq } from '@deepseek-ai/dsh-session'
import type { SessionEvent, SessionEventMap, SessionEventType } from '@deepseek-ai/dsh-session'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import * as deliveryStateModule from '../src/delivery-state.ts'
import {
  HOST_MAILBOX_MESSAGE_SOURCE,
  readHostMailboxMessage,
} from '../src/host-mailbox-message.ts'
import { TeamId, TeamMessageId } from '../src/types.ts'
import type { TeamMessageSnapshot } from '../src/types.ts'

const LEAD = SessionId('lead')
const SENDER = SessionId('bot-a')
const TARGET = SessionId('bot-b')
const MESSAGE = TeamMessageId('team-message-1')
const QUEUED_TIME = 1_700_000_000_123

function event<T extends SessionEventType>(
  type: T,
  data: SessionEventMap[T],
  seq: SessionSeq,
  time: number = seq,
): SessionEvent<T> {
  return { type, data, seq, time } as unknown as SessionEvent<T>
}

function queuedMessage(): TeamMessageSnapshot {
  return {
    id: MESSAGE,
    senderId: SENDER,
    senderName: 'bot-a',
    targetId: TARGET,
    content: [{ type: 'text', text: 'handoff body' }],
  }
}

function leadQueued(): SessionEvent {
  return event('team/message/queued', {
    version: 2,
    teamId: TeamId(LEAD),
    message: queuedMessage(),
  }, SessionSeq(1), QUEUED_TIME)
}

function leadDelivered(): SessionEvent {
  return event('team/message/delivered', {
    version: 2,
    teamId: TeamId(LEAD),
    messageId: MESSAGE,
    targetId: TARGET,
  }, SessionSeq(2))
}

describe('readHostMailboxMessage', () => {
  it('returns undefined when the Lead never queued the message', () => {
    expect(readHostMailboxMessage([], [], MESSAGE)).toBeUndefined()
    expect(readHostMailboxMessage([leadDelivered()], [], MESSAGE)).toBeUndefined()
  })

  it('reconstructs product fields from Lead queued edge with Host-only source', () => {
    const record = readHostMailboxMessage([leadQueued()], [], MESSAGE)
    expect(record).toEqual({
      id: MESSAGE,
      fromBotId: SENDER,
      toBotId: TARGET,
      body: [{ type: 'text', text: 'handoff body' }],
      createdAt: QUEUED_TIME,
      deliveryState: 'queued',
      source: HOST_MAILBOX_MESSAGE_SOURCE,
    })
    expect(record?.source.kind).toBe('host-mailbox')
    expect(record?.source).not.toEqual(expect.objectContaining({ kind: 'electron-ipc' }))
  })

  it('clones body so callers cannot mutate the durable snapshot content', () => {
    const lead = [leadQueued()]
    const record = readHostMailboxMessage(lead, [], MESSAGE)
    expect(record).toBeDefined()
    const body = record!.body as [{ type: 'text'; text: string }]
    body[0].text = 'mutated'
    const again = readHostMailboxMessage(lead, [], MESSAGE)
    expect(again?.body).toEqual([{ type: 'text', text: 'handoff body' }])
  })

  it('folds deliveryState to visible-pending after Lead delivered + target receipt', () => {
    const receipt = createUserMessage({
      content: [{ type: 'text', text: 'handoff body' }],
      source: {
        kind: 'team-message',
        teamId: TeamId(LEAD),
        messageId: MESSAGE,
        senderId: SENDER,
        senderName: 'bot-a',
      },
    })
    const record = readHostMailboxMessage(
      [leadQueued(), leadDelivered()],
      [event('user/message', receipt, SessionSeq(10))],
      MESSAGE,
    )
    expect(record?.deliveryState).toBe('visible-pending')
    expect(record?.fromBotId).toBe(SENDER)
    expect(record?.toBotId).toBe(TARGET)
    expect(record?.source).toEqual(HOST_MAILBOX_MESSAGE_SOURCE)
  })

  it('folds deliveryState to acted when a request/header follows the receipt', () => {
    const receipt = createUserMessage({
      content: [{ type: 'text', text: 'handoff body' }],
      source: {
        kind: 'team-message',
        teamId: TeamId(LEAD),
        messageId: MESSAGE,
        senderId: SENDER,
        senderName: 'bot-a',
      },
    })
    const record = readHostMailboxMessage(
      [leadQueued(), leadDelivered()],
      [
        event('user/message', receipt, SessionSeq(10)),
        event('request/header', {
          header: { config: { provider: 'mock', model: 'model-b' } },
          reason: 'initial',
        }, SessionSeq(11)),
      ],
      MESSAGE,
    )
    expect(record?.deliveryState).toBe('acted')
    expect(record?.createdAt).toBe(QUEUED_TIME)
  })

  it('throws when queue edge exists but deliveryState observation is missing', () => {
    const spy = vi.spyOn(deliveryStateModule, 'observeMailboxDeliveryState')
      .mockReturnValueOnce(undefined)
    expect(() => readHostMailboxMessage([leadQueued()], [], MESSAGE))
      .toThrow(/missing deliveryState after queue edge/)
    spy.mockRestore()
  })
})
