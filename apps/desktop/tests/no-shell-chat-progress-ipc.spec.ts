/**
 * US3 architecture/regression guard (T029 / FR-006): Electron Main MUST NOT
 * synthesize a parallel chat-progress protocol. Client `ui-chat` renders
 * progress from Host session/agent stream events only
 * ([contracts/chat-progress-final.md]).
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC } from '../src/ipc.ts'
import { FORBIDDEN_CHAT_PROGRESS_IPC_PATTERNS } from './topology/surfaces.ts'

/** Shell sources that must never grow a Main chat-progress IPC surface. */
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

/** Channel names that would constitute a parallel Electron chat-progress bus. */
const FORBIDDEN_DESKTOP_PROGRESS_CHANNEL =
  /dsh-desktop:(?:chat-progress|assistant-stream|progress-update|stream-delta)/i

function readShell(relative: string): string {
  return readFileSync(join(process.cwd(), relative), 'utf8')
}

describe('no Electron chat-progress IPC bus (T029 / FR-006)', () => {
  it('documents Host session/agent streams only — DESKTOP_IPC stays lifecycle/chrome', () => {
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
    expect(ipcSource).toMatch(/no chat-progress/i)
    expect(ipcSource).toMatch(/Host session\/agent stream/i)
    expect(protocolSource).toMatch(/chat-progress/i)
    expect(protocolSource).toMatch(/authenticated Host HTTP\/WS/i)
  })

  it('rejects chat-progress / assistant-stream names on Electron and Host IPC channels', () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_CHAT_PROGRESS_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      expect(channel).not.toMatch(FORBIDDEN_DESKTOP_PROGRESS_CHANNEL)
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_CHAT_PROGRESS_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('chat-progress')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('assistant-stream')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('chat-progress')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('assistant-stream')
  })

  it('keeps Main / preload free of dsh-desktop chat-progress channels', () => {
    for (const relative of SHELL_IPC_SOURCES) {
      const source = readShell(relative)
      expect(source, relative).not.toMatch(FORBIDDEN_DESKTOP_PROGRESS_CHANNEL)
    }
  })
})
