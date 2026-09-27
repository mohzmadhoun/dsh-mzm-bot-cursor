/** Host mailbox peer-source projection for Chat handoff rows. */

import { describe, expect, it } from 'vitest'
import {
  handoffBodyPreview, readTeamMessageSource,
} from '../src/client/chat/team-message-source.ts'

describe('readTeamMessageSource', () => {
  it('reads a complete team-message source', () => {
    expect(readTeamMessageSource({
      kind: 'team-message',
      messageId: 'm1',
      senderId: 's1',
      senderName: 'Alice',
      teamId: 't1',
    })).toEqual({
      kind: 'team-message',
      messageId: 'm1',
      senderId: 's1',
      senderName: 'Alice',
      teamId: 't1',
    })
  })

  it('rejects non-team sources and incomplete team-message rows', () => {
    expect(readTeamMessageSource({ kind: 'user' })).toBeNull()
    expect(readTeamMessageSource({
      kind: 'team-message',
      messageId: 'm1',
      senderId: 's1',
      senderName: 'Alice',
    })).toBeNull()
    expect(readTeamMessageSource(null)).toBeNull()
  })
})

describe('handoffBodyPreview', () => {
  it('returns the first non-empty text block', () => {
    expect(handoffBodyPreview([
      { type: 'text', text: '  ' },
      { type: 'text', text: 'hello peer' },
      { type: 'text', text: 'ignored' },
    ])).toBe('hello peer')
  })

  it('returns empty string when no text block is present', () => {
    expect(handoffBodyPreview([{ type: 'image' }])).toBe('')
  })
})
