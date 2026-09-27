/**
 * US4 / T034 / FR-008 — preload + Desktop IPC never expose provider credential secrets.
 * Contract: specs/001-multi-model-bots/contracts/in-app-credentials.md
 * Separate from topology-handshake (T016) and mailbox-bus guards (T026).
 */

import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DESKTOP_IPC } from '../src/ipc.ts'

/** Absolute directory of the desktop application source under test. */
const SRC = join(process.cwd(), 'apps/desktop/src')

/** Lifecycle / chrome channels only — Host owns credential secret resolve. */
const ALLOWED_DESKTOP_IPC_CHANNELS = [
  'dsh-desktop:boot',
  'dsh-desktop:boot-failed',
  'dsh-desktop:directory-pick',
  'dsh-desktop:updates-status',
  'dsh-desktop:updates-open',
  'dsh-desktop:updates-presentation',
  'dsh-desktop:native-theme-set',
  'dsh-desktop:windows-appearance',
  'dsh-desktop:windows-menu',
] as const

/** `contextBridge.exposeInMainWorld` names allowed on desktop preloads. */
const ALLOWED_BRIDGE_GLOBALS = [
  '__DSH_DIRECTORY_PICKER__',
  'dshDesktopBoot',
  'dshDesktop',
  'dshMandatoryUpdate',
  'dshUpdateDialog',
] as const

/**
 * Forbidden provider-secret / credential-store APIs on the Electron shell surface.
 * Matches channel names, bridge methods, and Host credential call sites that must not appear.
 */
const FORBIDDEN_CREDENTIAL_SECRET_PATTERNS = [
  /dsh-desktop:(?:api[_-]?key|credential|secret|password|provider[_-]?key)/i,
  /\b(?:set|get|resolve|store|read)(?:Credential|ApiKey|Secret)\b/,
  /\bcredentials\.(?:set|resolve|get|store)\b/,
  /\bCredentialRef\b/,
  /\bDEEPSEEK_API_KEY\b/,
  /\bsk-[a-zA-Z0-9]{8,}\b/,
  /\bexposeInMainWorld\(\s*['"][^'"]*(?:credential|api[_-]?key|secret|password)/i,
] as const

/** Preload + `ipc.ts` sources that must stay free of credential secret APIs. */
function shellSecretAuditSources(): { readonly path: string; readonly text: string }[] {
  const preloadPaths = readdirSync(SRC)
    .filter(name => /^preload-.*\.ts$/u.test(name))
    .map(name => join(SRC, name))
    .sort()
  const paths = [...preloadPaths, join(SRC, 'ipc.ts')]
  return paths.map(path => ({ path, text: readFileSync(path, 'utf8') }))
}

describe('no raw secrets in preload/renderer IPC (T034 / FR-008)', () => {
  it('keeps DESKTOP_IPC on the lifecycle/chrome allowlist only', () => {
    expect(Object.values(DESKTOP_IPC).sort()).toEqual([...ALLOWED_DESKTOP_IPC_CHANNELS].sort())
  })

  it('audits every preload-*.ts and ipc.ts for absence of credential secret APIs', () => {
    const sources = shellSecretAuditSources()
    expect(sources.map(entry => basename(entry.path)).sort()).toEqual([
      'ipc.ts',
      'preload-app.ts',
      'preload-mandatory.ts',
      'preload-menu.ts',
      'preload-platform.ts',
      'preload-theme.ts',
      'preload-update-dialog.ts',
      'preload-windows.ts',
    ])

    for (const { path, text } of sources) {
      for (const pattern of FORBIDDEN_CREDENTIAL_SECRET_PATTERNS) {
        expect(text, `${basename(path)} must not match ${pattern}`).not.toMatch(pattern)
      }
    }

    // JSDoc may mention "credentials" only to forbid them; no invoke/send of secret payloads.
    const ipc = sources.find(entry => basename(entry.path) === 'ipc.ts')!
    expect(ipc.text).toMatch(/no .+ provider-credential secret channel/i)
    expect(ipc.text).toMatch(/without .+ credentials/i)
  })

  it('exposes only allowlisted contextBridge globals from preload sources', () => {
    const bridges = new Set<string>()
    for (const { text } of shellSecretAuditSources()) {
      for (const match of text.matchAll(/exposeInMainWorld\(\s*['"]([^'"]+)['"]/gu)) {
        bridges.add(match[1]!)
      }
    }
    expect([...bridges].sort()).toEqual([...ALLOWED_BRIDGE_GLOBALS].sort())
  })
})
