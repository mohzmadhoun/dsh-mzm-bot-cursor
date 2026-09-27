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

/** Delivery observation shown on a durable Chat handoff row (FR-005 / FR-007). */
export type ChatHandoffDeliveryState = 'visible-pending' | 'acted'

/**
 * Chat Node kinds that mean the recipient started a follow-up turn after the
 * durable team-message receipt (mirrors Host `request/header` after receipt).
 */
const RECIPIENT_ACTED_KINDS: ReadonlySet<string> = new Set([
  'assistant-step',
  'turn-process',
  'turn-tail',
  'turn-error',
  'turn-max-tokens',
  'model-retry',
])

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

/**
 * Derive Chat handoff delivery from later transcript Nodes after a durable
 * team-message row. Pending inbox rows stay `visible-pending` at the call site.
 * @param order - Chat snapshot Node key order.
 * @param nodes - Chat Node store (key → kind).
 * @param handoffKey - stable key of the team-message context Node.
 * @returns `acted` when a later turn Node exists; otherwise `visible-pending`.
 */
export function chatHandoffDeliveryState(
  order: readonly string[],
  nodes: { get(key: string): { readonly kind: string } | undefined },
  handoffKey: string,
): ChatHandoffDeliveryState {
  const index = order.indexOf(handoffKey)
  if (index < 0) return 'visible-pending'
  for (let i = index + 1; i < order.length; i++) {
    const key = order[i]
    if (key === undefined) continue
    const later = nodes.get(key)
    if (later !== undefined && RECIPIENT_ACTED_KINDS.has(later.kind)) return 'acted'
  }
  return 'visible-pending'
}
