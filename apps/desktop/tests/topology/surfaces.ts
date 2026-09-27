/**
 * Shell↔Host surface inventory for topology handshake (T002 / SC-007).
 * Maps Architect contract criteria to owning sources; Verifier Scenario 0 consumes the same map.
 */

/** Contract criterion → primary implementation surfaces. */
export const TOPOLOGY_SURFACES = {
  spawn: [
    'apps/desktop/src/host-process.ts',
    'apps/desktop/src/node-environment.ts',
    'apps/desktop/src/backend-controller.ts',
    'apps/desktop-host/src/index.ts',
  ],
  ipcLifecycle: [
    'apps/desktop/src/host-process.ts',
    'apps/desktop/src/host-protocol.ts',
    'apps/desktop-host/src/index.ts',
  ],
  documentOrigin: [
    'apps/desktop/src/ipc.ts',
    'apps/desktop/src/web-document.ts',
    'apps/desktop/src/main.ts',
    'apps/desktop/src/preload-app.ts',
  ],
  authenticatedDataPlane: [
    'apps/desktop/src/web-document.ts',
    'apps/desktop/src/main.ts',
  ],
  shutdown: [
    'apps/desktop/src/host-process.ts',
    'apps/desktop-host/src/index.ts',
  ],
  negativeNoMailboxIpc: [
    'apps/desktop/src/ipc.ts',
    'apps/desktop/src/host-protocol.ts',
    'apps/desktop/src/main.ts',
  ],
} as const

/** Forbidden substrings for Electron shell IPC channel / Host IPC event names. */
export const FORBIDDEN_MAILBOX_IPC_PATTERNS = [
  /mailbox/i,
  /bot[-_]?message/i,
  /bot[-_]?msg/i,
  /agent[-_]?chat/i,
  /peer[-_]?message/i,
] as const

/**
 * Forbidden substrings for inventing bot records, model routes, or provider secrets
 * on Electron Main / preload IPC (T016 — Host `ctx.llm` + credentials own those).
 */
export const FORBIDDEN_MODEL_ROUTER_IPC_PATTERNS = [
  /createBot/i,
  /modelSelection/i,
  /installModelSelection/i,
  /apiKey/i,
  /credentials?\.(?:set|resolve|get)/i,
] as const

/**
 * Forbidden Electron / Host Node IPC channel names for a parallel chat-progress
 * protocol (T029 / FR-006). Progress is Host session/agent stream events rendered
 * by Client `ui-chat` only — not Main-synthesized IPC.
 */
export const FORBIDDEN_CHAT_PROGRESS_IPC_PATTERNS = [
  /^chat[-_]?progress$/i,
  /^assistant[-_]?stream$/i,
  /^progress[-_]?update$/i,
  /^stream[-_]?delta$/i,
  /dsh-desktop:(?:chat-progress|assistant-stream|progress-update|stream-delta)/i,
] as const
