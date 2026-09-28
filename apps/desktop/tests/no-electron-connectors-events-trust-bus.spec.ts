/**
 * P6 architecture/regression guard (T014 / research R6 / R9): Electron Main MUST NOT
 * invent a parallel connector / event-routine / trust / credential-value store or bus
 * as SoT. Host owns the durable Connector catalog, event-routine wake, trust deny path,
 * and credential store; Client mutates via Host RPC
 * (`specs/006-connectors-mcp-events-trust/contracts/` · FR / non-goals).
 *
 * Distinct from identity / skills / routines / memory bus guards: this file is the
 * story-level static inventory Verifier can rerun for connector/event/trust foundations.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC } from '../src/ipc.ts'

/** Shell sources that must never grow a Main connector/event/trust/credential IPC surface. */
const SHELL_IPC_SOURCES = [
  'apps/desktop/src/ipc.ts',
  'apps/desktop/src/host-protocol.ts',
  'apps/desktop/src/main.ts',
  'apps/desktop/src/host-process.ts',
  'apps/desktop/src/preload-app.ts',
  'apps/desktop/src/preload-platform.ts',
  'apps/desktop/src/preload-menu.ts',
  'apps/desktop/src/preload-theme.ts',
  'apps/desktop/src/preload-windows.ts',
  'apps/desktop/src/preload-mandatory.ts',
  'apps/desktop/src/preload-update-dialog.ts',
] as const

/**
 * Channel / event names that would constitute a parallel Electron connector/event/trust bus.
 * Intentionally requires the `dsh-desktop:` prefix so absence JSDoc may name the domains.
 */
const FORBIDDEN_DESKTOP_CONNECTOR_EVENT_TRUST_CHANNEL = new RegExp(
  String.raw`dsh-desktop:(?:connector|connector-catalog|connector-install|connector-auth|` +
    String.raw`mcp-tool-call|event-routine|event-routine-create|event-routine-fire|` +
    String.raw`webhook-delivery|permission-deny|trust-rule|credential-value|credential-set|` +
    String.raw`secret-payload)`,
  'i',
)

/** Host product connector/event/trust/credential APIs must not appear as Electron IPC handlers. */
const FORBIDDEN_PRODUCT_CONNECTOR_EVENT_TRUST_APIS = [
  /\bConnectorRecord\b/,
  /\bConnectorCatalogEntry\b/,
  /\binstallConnector\b/,
  /\bconnectorAuth\b/,
  /\bmcpToolCall\b/,
  /\beventRoutineCreate\b/,
  /\beventRoutineFire\b/,
  /\bwebhookDelivery\b/,
  /\bpermissionDeny\b/,
  /\btrustRule\b/,
  /\bcredentialValue\b/,
  /\bcredentialSet\b/,
  /\bsecretPayload\b/,
  /\bConnectorCatalog\b/,
] as const

/** Forbidden substrings for Electron / Host Node IPC type strings. */
const FORBIDDEN_CONNECTOR_EVENT_TRUST_IPC_PATTERNS = [
  /connector/i,
  /mcp[-_]?tool/i,
  /event[-_]?routine/i,
  /webhook[-_]?delivery/i,
  /permission[-_]?deny/i,
  /trust[-_]?rule/i,
  /credential[-_]?(?:value|set)/i,
  /secret[-_]?payload/i,
] as const

function readShell(relative: string): string {
  return readFileSync(join(process.cwd(), relative), 'utf8')
}

describe('no Electron connector/event/trust/credential-value bus (T014 / research R6)', () => {
  it('documents Host connector/event/trust only — DESKTOP_IPC and Host Node IPC stay lifecycle/chrome', () => {
    expect(Object.values(DESKTOP_IPC)).toEqual([
      'dsh-desktop:boot',
      'dsh-desktop:boot-failed',
      'dsh-desktop:directory-pick',
      'dsh-desktop:updates-status',
      'dsh-desktop:updates-open',
      'dsh-desktop:updates-presentation',
      'dsh-desktop:native-theme-set',
      'dsh-desktop:windows-appearance',
      'dsh-desktop:windows-menu',
    ])
    expect([...DESKTOP_HOST_CHILD_EVENT_TYPES]).toEqual([
      'ready', 'fatal', 'shutdown-complete', 'update-tasks',
    ])
    expect([...DESKTOP_HOST_CONTROL_TYPES]).toEqual(['shutdown', 'update-tasks'])

    const ipcSource = readShell('apps/desktop/src/ipc.ts')
    const protocolSource = readShell('apps/desktop/src/host-protocol.ts')
    expect(ipcSource).toMatch(/no connector-catalog/i)
    expect(ipcSource).toMatch(/Host owns the durable Connector catalog/i)
    expect(protocolSource).toMatch(/must not be added/i)
    expect(protocolSource).toMatch(/Host owns the durable Connector catalog/i)
  })

  it('rejects connector / event-routine / trust / credential-value names on Electron and Host IPC channels', () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_CONNECTOR_EVENT_TRUST_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      expect(channel).not.toMatch(FORBIDDEN_DESKTOP_CONNECTOR_EVENT_TRUST_CHANNEL)
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_CONNECTOR_EVENT_TRUST_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('connector')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('connector-catalog')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('connector-install')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('connector-auth')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('mcp-tool-call')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('event-routine-create')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('event-routine-fire')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('webhook-delivery')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('permission-deny')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('trust-rule')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('credential-value')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('credential-set')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('secret-payload')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('connector')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('connector-catalog')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('mcp-tool-call')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('event-routine-fire')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('webhook-delivery')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('permission-deny')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('trust-rule')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('credential-value')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('secret-payload')
  })

  it('keeps Main / preload free of product Host connector/event/trust APIs and dsh-desktop channels', () => {
    for (const relative of SHELL_IPC_SOURCES) {
      const source = readShell(relative)
      expect(source, relative).not.toMatch(FORBIDDEN_DESKTOP_CONNECTOR_EVENT_TRUST_CHANNEL)
      for (const pattern of FORBIDDEN_PRODUCT_CONNECTOR_EVENT_TRUST_APIS) {
        expect(source, `${relative} ↔ ${pattern}`).not.toMatch(pattern)
      }
    }
  })
})
