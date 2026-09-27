/**
 * P4 architecture/regression guard (T011 / research R7): Electron Main MUST NOT
 * invent a parallel routines store, bus, or timers as SoT.
 * Host owns the durable Routine catalog and cron wake; Client edits via Host RPC
 * (`specs/004-routines-cron/contracts/` · FR-007).
 *
 * Distinct from T010 (identity bus) and T013 (skills bus): this file is the
 * story-level static inventory Verifier can rerun for routines foundations.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC } from '../src/ipc.ts'

/** Shell sources that must never grow a Main routines catalog / fire IPC surface. */
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
 * Channel / event names that would constitute a parallel Electron routines bus.
 * Intentionally requires the `dsh-desktop:` prefix so absence JSDoc may name the domains.
 */
const FORBIDDEN_DESKTOP_ROUTINES_CHANNEL =
  /dsh-desktop:(?:routine|routines|routine-catalog|create-routine|pause-routine|resume-routine|cron-fire|cron-wake|last-run|scheduleExpr)/i

/** Host product routines mutation / store APIs must not appear as Electron IPC handlers. */
const FORBIDDEN_PRODUCT_ROUTINES_APIS = [
  /\bcreateRoutine\b/,
  /\bpauseRoutine\b/,
  /\bresumeRoutine\b/,
  /\blistRoutinesByBot\b/,
  /\bRoutineRecord\b/,
  /\bRoutineProjection\b/,
  /\bRoutineFire\b/,
  /\blastRunAt\b/,
  /\bscheduleExpr\b/,
] as const

/** Forbidden substrings for Electron / Host Node IPC type strings. */
const FORBIDDEN_ROUTINES_IPC_PATTERNS = [
  /routine/i,
  /cron[-_]?fire/i,
  /cron[-_]?wake/i,
  /last[-_]?run/i,
  /pause[-_]?routine/i,
  /resume[-_]?routine/i,
] as const

function readShell(relative: string): string {
  return readFileSync(join(process.cwd(), relative), 'utf8')
}

describe('no Electron routines catalog/fire bus (T011 / research R7)', () => {
  it('documents Host routines only — DESKTOP_IPC and Host Node IPC stay lifecycle/chrome', () => {
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
    expect(ipcSource).toMatch(/no routine-catalog/i)
    expect(ipcSource).toMatch(/Host owns the durable Routine catalog/i)
    expect(protocolSource).toMatch(/must not be added/i)
    expect(protocolSource).toMatch(/Host owns the durable Routine catalog and cron wake path/i)
  })

  it('rejects routine-catalog / create / pause / resume / cron-fire names on Electron and Host IPC channels', () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_ROUTINES_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      expect(channel).not.toMatch(FORBIDDEN_DESKTOP_ROUTINES_CHANNEL)
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_ROUTINES_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('routine')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('routine-catalog')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('cron-fire')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('pause-routine')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('routine')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('cron-fire')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('last-run')
  })

  it('keeps Main / preload free of product Host-routines APIs and dsh-desktop routines channels', () => {
    for (const relative of SHELL_IPC_SOURCES) {
      const source = readShell(relative)
      expect(source, relative).not.toMatch(FORBIDDEN_DESKTOP_ROUTINES_CHANNEL)
      for (const pattern of FORBIDDEN_PRODUCT_ROUTINES_APIS) {
        expect(source, `${relative} ↔ ${pattern}`).not.toMatch(pattern)
      }
    }
  })
})
