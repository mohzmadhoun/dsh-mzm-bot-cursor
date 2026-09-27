/**
 * P2 architecture/regression guard (T010 / research R1): Electron Main MUST NOT
 * invent a parallel identity / persona / section / avatar / delete store or bus.
 * Host Agent Teams owns durable bot identity mutations; Client edits via Host RPC
 * (`specs/002-identity-personas/contracts/` · FR-002/004/005/006/008).
 *
 * Distinct from T026 (mailbox bus) and T027 (thin-shell inventory): this file is the
 * story-level static inventory Verifier can rerun for identity foundations.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC } from '../src/ipc.ts'

/** Shell sources that must never grow a Main identity / persona IPC surface. */
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
 * Channel / event names that would constitute a parallel Electron identity bus.
 * Intentionally requires the `dsh-desktop:` prefix so absence JSDoc may name the domains.
 */
const FORBIDDEN_DESKTOP_IDENTITY_CHANNEL =
  /dsh-desktop:(?:identity|persona|section|avatar|rename|bot-delete|delete-bot|anti-jobs|antiJobs)/i

/** Host product identity mutation / store APIs must not appear as Electron IPC handlers. */
const FORBIDDEN_PRODUCT_IDENTITY_APIS = [
  /\bupdatePersona\b/,
  /\bsetAvatar\b/,
  /\bassignSection\b/,
  /\bunassignSection\b/,
  /\bdeleteBot\b/,
  /\brenameBot\b/,
  /\bantiJobs\b/,
  /\bsectionId\b/,
  /\bpersonaProfile\b/,
] as const

/** Forbidden substrings for Electron / Host Node IPC type strings. */
const FORBIDDEN_IDENTITY_IPC_PATTERNS = [
  /identity/i,
  /persona/i,
  /section/i,
  /avatar/i,
  /rename/i,
  /bot[-_]?delete/i,
  /delete[-_]?bot/i,
  /anti[-_]?jobs/i,
] as const

function readShell(relative: string): string {
  return readFileSync(join(process.cwd(), relative), 'utf8')
}

describe('no Electron identity/persona bus (T010 / research R1)', () => {
  it('documents Host identity only — DESKTOP_IPC and Host Node IPC stay lifecycle/chrome', () => {
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
    expect(ipcSource).toMatch(/no identity/i)
    expect(ipcSource).toMatch(/Host Agent Teams owns durable bot identity/i)
    expect(protocolSource).toMatch(/must not be added/i)
    expect(protocolSource).toMatch(/Host Agent Teams owns that durable store/i)
  })

  it('rejects identity / persona / section / delete names on Electron and Host IPC channels', () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_IDENTITY_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      expect(channel).not.toMatch(FORBIDDEN_DESKTOP_IDENTITY_CHANNEL)
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_IDENTITY_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('identity')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('persona')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('section')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('delete-bot')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('identity')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('persona')
  })

  it('keeps Main / preload free of product Host-identity APIs and dsh-desktop identity channels', () => {
    for (const relative of SHELL_IPC_SOURCES) {
      const source = readShell(relative)
      expect(source, relative).not.toMatch(FORBIDDEN_DESKTOP_IDENTITY_CHANNEL)
      for (const pattern of FORBIDDEN_PRODUCT_IDENTITY_APIS) {
        expect(source, `${relative} ↔ ${pattern}`).not.toMatch(pattern)
      }
    }
  })
})
