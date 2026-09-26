/** Node IPC lifecycle protocol between Electron Main and the Desktop Host child. */

/** Lifecycle protocol generation recorded in Desktop release metadata. */
export const DESKTOP_HOST_PROTOCOL_VERSION = 4 as const

/**
 * Child→Main event `type` values accepted on the Host Node IPC channel.
 * Application chat, mailbox, and bot-message payloads are not members and must not be added;
 * that traffic stays on the authenticated Host HTTP/WS data plane (Agent Teams).
 */
export const DESKTOP_HOST_CHILD_EVENT_TYPES = [
  'ready',
  'fatal',
  'shutdown-complete',
  'update-tasks',
] as const

/**
 * Main→Child control `type` values sent on the Host Node IPC channel.
 * There is no mailbox or bot-message control type on this channel.
 */
export const DESKTOP_HOST_CONTROL_TYPES = ['shutdown', 'update-tasks'] as const

/** Union of child→Main lifecycle event type strings. */
export type DesktopHostChildEventType = (typeof DESKTOP_HOST_CHILD_EVENT_TYPES)[number]

/** Union of Main→Child control type strings. */
export type DesktopHostControlType = (typeof DESKTOP_HOST_CONTROL_TYPES)[number]
