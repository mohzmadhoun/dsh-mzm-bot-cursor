/** Node IPC lifecycle protocol between Electron Main and the Desktop Host child. */

/** Lifecycle protocol generation recorded in Desktop release metadata. */
export const DESKTOP_HOST_PROTOCOL_VERSION = 4 as const

/**
 * Child→Main event `type` values accepted on the Host Node IPC channel.
 * Application chat, mailbox, bot-message, chat-progress / assistant-stream, and chat-final
 * payloads are not members and must not be added; that traffic stays on the authenticated Host HTTP/WS
 * data plane (Agent Teams + session/agent streams and session-log finals for Client `ui-chat`;
 * `contracts/chat-progress-final.md`).
 * Identity / persona / section / avatar / rename / bot-delete payloads are also not members and
 * must not be added — Host Agent Teams owns that durable store (research R1 / T010).
 * Skill-catalog / skill-attachment / skill-authoring payloads are also not members and
 * must not be added — Host owns durable skill catalog and attachments (research R2/R4 / T013).
 * Routine-catalog / routine-create / pause / resume / cron-fire / last-run payloads are also not
 * members and must not be added — Host owns the durable Routine catalog and cron wake path
 * (research R7 / T010; `specs/004-routines-cron/contracts/`).
 * Memory-catalog / memory-write / memory-list / memory-browse / memory-recall / memory-injection
 * payloads are also not members and must not be added — Host owns the durable Memory catalog
 * (research R7 / T010; `specs/005-memory-productization/contracts/`).
 * Connector-catalog / connector-install / connector-auth / mcp-tool-call,
 * event-routine-create / event-routine-fire / webhook-delivery,
 * permission-deny / trust-rule, and credential-value / credential-set / secret-payload
 * payloads are also not members and must not be added — Host owns the durable Connector catalog,
 * event-routine wake, trust deny path, and credential store (research R6 / R9 / T013;
 * `specs/006-connectors-mcp-events-trust/contracts/`).
 * shell-exec / box-ready / computer-use-control / computer-screenshot /
 * computer-settings-mutate payloads are also not members and must not be added — Host owns the sandboxed Shell
 * execution world, box readiness, computerUse registry/provider runs, and Computer settings SoT
 * (research R6 / T013; `specs/007-box-subagent-settings/contracts/`).
 */
export const DESKTOP_HOST_CHILD_EVENT_TYPES = [
  'ready',
  'fatal',
  'shutdown-complete',
  'update-tasks',
] as const

/**
 * Main→Child control `type` values sent on the Host Node IPC channel.
 * There is no mailbox, bot-message, identity, persona, section, bot-delete,
 * skill-catalog, skill-attachment, skill-authoring, routine-catalog, routine-create,
 * pause-routine, resume-routine, cron-fire, last-run, memory-catalog, memory-write,
 * memory-list, memory-browse, memory-recall, memory-injection, connector-catalog,
 * connector-install, connector-auth, mcp-tool-call, event-routine-create,
 * event-routine-fire, webhook-delivery, permission-deny, trust-rule, credential-value,
 * credential-set, secret-payload, shell-exec, box-ready, computer-use-control,
 * computer-screenshot, or computer-settings-mutate control type on this channel.
 */
export const DESKTOP_HOST_CONTROL_TYPES = ['shutdown', 'update-tasks'] as const

/** Union of child→Main lifecycle event type strings. */
export type DesktopHostChildEventType = (typeof DESKTOP_HOST_CHILD_EVENT_TYPES)[number]

/** Union of Main→Child control type strings. */
export type DesktopHostControlType = (typeof DESKTOP_HOST_CONTROL_TYPES)[number]
