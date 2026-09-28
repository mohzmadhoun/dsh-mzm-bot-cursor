/**
 * P5 architecture/regression guard (T011 / research R7): Electron Main MUST NOT
 * invent a parallel memory store, bus, write, recall, or inject path as SoT.
 * Host owns the durable Memory catalog; Client edits via Host RPC
 * (`specs/005-memory-productization/contracts/` · FR-006 / non-goals).
 *
 * Distinct from identity / skills / routines bus guards: this file is the
 * story-level static inventory Verifier can rerun for memory foundations.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC } from '../src/ipc.ts'

/** Shell sources that must never grow a Main memory catalog / inject IPC surface. */
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
 * Channel / event names that would constitute a parallel Electron memory bus.
 * Intentionally requires the `dsh-desktop:` prefix so absence JSDoc may name the domains.
 */
const FORBIDDEN_DESKTOP_MEMORY_CHANNEL = new RegExp(
  String.raw`dsh-desktop:(?:memory|memories|memory-catalog|memory-write|memory-list|` +
    String.raw`memory-browse|memory-recall|memory-injection|create-memory|write-memory|` +
    String.raw`list-memory|browse-memory|recall-memory|inject-memory)`,
  'i',
)

/** Host product memory mutation / store APIs must not appear as Electron IPC handlers. */
const FORBIDDEN_PRODUCT_MEMORY_APIS = [
  /\bcreateMemory\b/,
  /\bwriteMemory\b/,
  /\blistMemories\b/,
  /\bbrowseMemories\b/,
  /\bMemoryRecord\b/,
  /\bMemoryProjection\b/,
  /\bMemoryRecallInject\b/,
  /\bmemoryCatalog\b/,
  /\binjectMemory\b/,
] as const

/** Forbidden substrings for Electron / Host Node IPC type strings. */
const FORBIDDEN_MEMORY_IPC_PATTERNS = [
  /memory/i,
  /memory[-_]?catalog/i,
  /memory[-_]?write/i,
  /memory[-_]?list/i,
  /memory[-_]?browse/i,
  /memory[-_]?recall/i,
  /memory[-_]?injection/i,
] as const

function readShell(relative: string): string {
  return readFileSync(join(process.cwd(), relative), 'utf8')
}

describe('no Electron memory catalog/write/recall bus (T011 / research R7)', () => {
  it('documents Host memory only — DESKTOP_IPC and Host Node IPC stay lifecycle/chrome', () => {
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
    expect(ipcSource).toMatch(/no memory-catalog/i)
    expect(ipcSource).toMatch(/Host owns the durable Memory catalog/i)
    expect(protocolSource).toMatch(/must not be added/i)
    expect(protocolSource).toMatch(/Host owns the durable Memory catalog/i)
  })

  it('rejects memory-catalog / write / list / browse / recall / inject names on Electron and Host IPC channels', () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_MEMORY_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      expect(channel).not.toMatch(FORBIDDEN_DESKTOP_MEMORY_CHANNEL)
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_MEMORY_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('memory')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('memory-catalog')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('memory-write')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('memory-recall')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('memory-injection')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('memory')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('memory-catalog')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('memory-list')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('memory-browse')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('memory-recall')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('memory-injection')
  })

  it('keeps Main / preload free of product Host-memory APIs and dsh-desktop memory channels', () => {
    for (const relative of SHELL_IPC_SOURCES) {
      const source = readShell(relative)
      expect(source, relative).not.toMatch(FORBIDDEN_DESKTOP_MEMORY_CHANNEL)
      for (const pattern of FORBIDDEN_PRODUCT_MEMORY_APIS) {
        expect(source, `${relative} ↔ ${pattern}`).not.toMatch(pattern)
      }
    }
  })
})
