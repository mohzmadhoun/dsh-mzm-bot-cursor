/**
 * P3 architecture/regression guard (T013 / research R2/R4): Electron Main MUST NOT
 * invent a parallel skill-catalog / attachment / authoring store or bus.
 * Host mounts `ctx.skills` and owns durable skillAttachments on bot identity;
 * Client edits via Host RPC (`specs/003-skills-ux/contracts/` · FR-001…005/006).
 *
 * Distinct from T010 (identity bus) and T026 (mailbox bus): this file is the
 * story-level static inventory Verifier can rerun for skills foundations.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC } from '../src/ipc.ts'

/** Shell sources that must never grow a Main skills catalog / attachment IPC surface. */
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
 * Channel / event names that would constitute a parallel Electron skills bus.
 * Intentionally requires the `dsh-desktop:` prefix so absence JSDoc may name the domains
 * and so Host `office-skills` runtime paths are not false positives.
 */
const FORBIDDEN_DESKTOP_SKILLS_CHANNEL =
  /dsh-desktop:(?:skill|skills|skill-catalog|skill-attachment|skill-author|attach-skill|detach-skill|managed-skill|user-skill|thin-pack)/i

/** Host product skills mutation / store APIs must not appear as Electron IPC handlers. */
const FORBIDDEN_PRODUCT_SKILLS_APIS = [
  /\bskillAttachments\b/,
  /\battachSkill\b/,
  /\bdetachSkill\b/,
  /\bcreateUserSkill\b/,
  /\bupdateUserSkill\b/,
  /\binstructionalBody\b/,
  /\bskillCatalog\b/,
  /\bmanagedSkills\b/,
  /\bmzm-thin-pack\b/,
] as const

/** Forbidden substrings for Electron / Host Node IPC type strings. */
const FORBIDDEN_SKILLS_IPC_PATTERNS = [
  /skill/i,
  /thin[-_]?pack/i,
  /managed[-_]?skill/i,
  /attach[-_]?skill/i,
  /detach[-_]?skill/i,
] as const

function readShell(relative: string): string {
  return readFileSync(join(process.cwd(), relative), 'utf8')
}

describe('no Electron skills catalog/attachment bus (T013 / research R2/R4)', () => {
  it('documents Host skills only — DESKTOP_IPC and Host Node IPC stay lifecycle/chrome', () => {
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
    expect(ipcSource).toMatch(/no skill-catalog/i)
    expect(ipcSource).toMatch(/Host owns durable skill catalog and attachments/i)
    expect(protocolSource).toMatch(/must not be added/i)
    expect(protocolSource).toMatch(/Host owns durable skill catalog and attachments/i)
  })

  it('rejects skill-catalog / attachment / authoring names on Electron and Host IPC channels', () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_SKILLS_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      expect(channel).not.toMatch(FORBIDDEN_DESKTOP_SKILLS_CHANNEL)
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_SKILLS_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('skill')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('skill-attachment')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('skill-catalog')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('skill')
    expect(DESKTOP_HOST_CHILD_EVENT_TYPES).not.toContain('skill-attachment')
  })

  it('keeps Main / preload free of product Host-skills APIs and dsh-desktop skills channels', () => {
    for (const relative of SHELL_IPC_SOURCES) {
      const source = readShell(relative)
      expect(source, relative).not.toMatch(FORBIDDEN_DESKTOP_SKILLS_CHANNEL)
      for (const pattern of FORBIDDEN_PRODUCT_SKILLS_APIS) {
        expect(source, `${relative} ↔ ${pattern}`).not.toMatch(pattern)
      }
    }
  })
})
