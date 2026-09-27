/**
 * US2 architecture/regression guard (T026 / FR-004): Electron Main MUST NOT
 * invent a bot↔bot messaging bus. Host Agent Teams Lead-log mailbox is the only
 * send path ([contracts/host-mailbox-1to1.md] · topology handshake negative).
 *
 * Distinct from T007 (Scenario 0 handshake negative in topology-handshake.spec.ts):
 * this file is the story-level static inventory Verifier can rerun for US2.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC } from '../src/ipc.ts'
import { FORBIDDEN_MAILBOX_IPC_PATTERNS } from './topology/surfaces.ts'

/** Shell sources that must never grow a Main mailbox / bot-message IPC surface. */
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

/** Channel / event names that would constitute a parallel Electron messaging bus. */
const FORBIDDEN_DESKTOP_CHANNEL = /dsh-desktop:(?:mailbox|bot-message|bot-msg|agent-chat|peer-message|handoff)/i

/** Product mailbox field names must not appear as Electron IPC payloads or handlers. */
const FORBIDDEN_PRODUCT_MAILBOX_APIS = [
  /\bfromBotId\b/,
  /\btoBotId\b/,
  /\bdeliveryState\b/,
  /\bsendTeamMessage\b/,
  /\bsendMessage\b/,
  /\bTeamService\b/,
] as const

function readShell(relative: string): string {
  return readFileSync(join(process.cwd(), relative), 'utf8')
}

describe('no Electron bot↔bot messaging bus (T026 / FR-004)', () => {
  it('documents Host mailbox only — DESKTOP_IPC and Host Node IPC stay lifecycle/chrome', () => {
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
    expect(ipcSource).toMatch(/no mailbox/i)
    expect(ipcSource).toMatch(/Host Agent Teams owns that data plane/i)
    expect(protocolSource).toMatch(/must not be added/i)
    expect(protocolSource).toMatch(/authenticated Host HTTP\/WS/i)
  })

  it('rejects mailbox / bot-message / peer-message names on Electron and Host IPC channels', () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_MAILBOX_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      expect(channel).not.toMatch(FORBIDDEN_DESKTOP_CHANNEL)
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_MAILBOX_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('mailbox')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('bot-message')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('mailbox')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('bot-message')
  })

  it('keeps Main / preload free of product Host-mailbox APIs and dsh-desktop mailbox channels', () => {
    for (const relative of SHELL_IPC_SOURCES) {
      const source = readShell(relative)
      expect(source, relative).not.toMatch(FORBIDDEN_DESKTOP_CHANNEL)
      for (const pattern of FORBIDDEN_PRODUCT_MAILBOX_APIS) {
        expect(source, `${relative} ↔ ${pattern}`).not.toMatch(pattern)
      }
    }
  })
})
