/** Read Host mailbox peer-message provenance from durable / inbox sources. */

/**
 * Durable `user/message` / inbox source when a peer message arrived through the
 * Host Agent Teams mailbox (`kind: 'team-message'`). Product HostMailboxMessage
 * provenance remains `host-mailbox` — never Electron IPC.
 */
export interface TeamMessageSourceView {
  readonly kind: 'team-message'
  readonly messageId: string
  readonly senderId: string
  readonly senderName: string
  readonly teamId: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Project a logged or inbox message source to Host mailbox peer fields.
 * @param source - Message source from Session log or inbox projection.
 * @returns Host mailbox peer fields, or null when the source is not a team message.
 */
export function readTeamMessageSource(source: unknown): TeamMessageSourceView | null {
  const record = asRecord(source)
  if (record === null || readString(record, 'kind') !== 'team-message') return null
  const messageId = readString(record, 'messageId')
  const senderId = readString(record, 'senderId')
  const senderName = readString(record, 'senderName')
  const teamId = readString(record, 'teamId')
  if (messageId === null || senderId === null || senderName === null || teamId === null) {
    return null
  }
  return { kind: 'team-message', messageId, senderId, senderName, teamId }
}

/**
 * First non-empty text block from a mailbox body for the chat handoff preview.
 * @param content - content blocks from the durable or pending message.
 * @returns preview text, or empty string when no text block is present.
 */
export function handoffBodyPreview(content: readonly unknown[]): string {
  for (const block of content) {
    const record = asRecord(block)
    if (record === null) continue
    if (readString(record, 'type') === 'text') {
      const text = record.text
      if (typeof text === 'string' && text.trim() !== '') return text
    }
  }
  return ''
}
