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
 * Forbidden substrings for a parallel Electron chat-final bus (T030 / FR-006).
 * Finals come from Host session-log turn completion into Client `ui-chat` only.
 */
export const FORBIDDEN_CHAT_FINAL_IPC_PATTERNS = [
  /chat[-_]?final/i,
  /assistant[-_]?final/i,
  /final[-_]?result/i,
  /turn[-_]?complete/i,
] as const
