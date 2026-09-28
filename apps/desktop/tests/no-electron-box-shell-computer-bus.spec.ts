/**
 * P7 architecture/regression guard (T014 / research R6): Electron Main MUST NOT
 * invent a parallel box / Shell / computerUse / Computer-settings store or bus
 * as SoT. Host owns the sandboxed Shell execution world, box readiness,
 * computerUse registry/provider runs, and Computer settings SoT; Client mutates
 * via Host RPC (`specs/007-box-subagent-settings/contracts/` · non-goals).
 *
 * Distinct from identity / skills / routines / memory / connector bus guards:
 * this file is the story-level static inventory Verifier can rerun for P7
 * box/Shell/computer foundations.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC } from '../src/ipc.ts'

/** Shell sources that must never grow a Main box/Shell/computerUse IPC surface. */
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
 * Channel / event names that would constitute a parallel Electron box/Shell/computer bus.
 * Intentionally requires the `dsh-desktop:` prefix so absence JSDoc may name the domains.
 */
const FORBIDDEN_DESKTOP_BOX_SHELL_COMPUTER_CHANNEL = new RegExp(
  String.raw`dsh-desktop:(?:shell-exec|box-ready|computer-use-control|computer-screenshot|` +
    String.raw`computer-settings-mutate|shell-exec-result|box-status|computer-use|` +
    String.raw`computer-settings)`,
  'i',
)

/** Host product box/Shell/computerUse/Computer-settings APIs must not appear as Electron IPC handlers. */
const FORBIDDEN_PRODUCT_BOX_SHELL_COMPUTER_APIS = [
  /\bshellExec\b/,
  /\bboxReady\b/,
  /\bcomputerUseControl\b/,
  /\bcomputerScreenshot\b/,
  /\bcomputerSettingsMutate\b/,
  /\bBoxBackend\b/,
  /\bShellExecutionWorld\b/,
  /\bComputerUseRun\b/,
  /\bComputerSettingsDocument\b/,
  /\bregisterComputerUse\b/,
] as const

/** Forbidden substrings for Electron / Host Node IPC type strings. */
const FORBIDDEN_BOX_SHELL_COMPUTER_IPC_PATTERNS = [
  /shell[-_]?exec/i,
  /box[-_]?ready/i,
  /computer[-_]?use[-_]?control/i,
  /computer[-_]?screenshot/i,
  /computer[-_]?settings[-_]?mutate/i,
] as const

function readShell(relative: string): string {
  return readFileSync(join(process.cwd(), relative), 'utf8')
}

describe('no Electron box/Shell/computerUse/Computer-settings bus (T014 / research R6)', () => {
  it('documents Host box/Shell/computer only — DESKTOP_IPC and Host Node IPC stay lifecycle/chrome', () => {
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
    expect(ipcSource).toMatch(/no shell-exec/i)
    expect(ipcSource).toMatch(/Host owns the sandboxed Shell execution world/i)
    expect(protocolSource).toMatch(/must not be added/i)
    expect(protocolSource).toMatch(/Host owns\s+the sandboxed Shell execution world/i)
    expect(protocolSource).toMatch(/shell-exec/)
    expect(protocolSource).toMatch(/box-ready/)
    expect(protocolSource).toMatch(/computer-use-control/)
    expect(protocolSource).toMatch(/computer-screenshot/)
    expect(protocolSource).toMatch(/computer-settings-mutate/)
  })

  it('rejects shell-exec / box-ready / computer-* names on Electron and Host IPC channels', () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_BOX_SHELL_COMPUTER_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      expect(channel).not.toMatch(FORBIDDEN_DESKTOP_BOX_SHELL_COMPUTER_CHANNEL)
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_BOX_SHELL_COMPUTER_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('shell-exec')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('box-ready')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('computer-use-control')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('computer-screenshot')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('computer-settings-mutate')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('shell-exec')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('box-ready')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('computer-use-control')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('computer-screenshot')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('computer-settings-mutate')
  })

  it('keeps Main / preload free of product Host box/Shell/computer APIs and dsh-desktop channels', () => {
    for (const relative of SHELL_IPC_SOURCES) {
      const source = readShell(relative)
      expect(source, relative).not.toMatch(FORBIDDEN_DESKTOP_BOX_SHELL_COMPUTER_CHANNEL)
      for (const pattern of FORBIDDEN_PRODUCT_BOX_SHELL_COMPUTER_APIS) {
        expect(source, `${relative} ↔ ${pattern}`).not.toMatch(pattern)
      }
    }
  })
})
