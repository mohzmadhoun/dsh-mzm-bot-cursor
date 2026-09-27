/**
 * T027 thin-shell inventory: Main stays lifecycle + `dsh-app://` HTTP forward only.
 * Does not own T026 mailbox-bus or T034 secret-IPC regression files.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DESKTOP_IPC, SCHEME } from '../src/ipc.ts'
import {
  FORBIDDEN_MAILBOX_IPC_PATTERNS,
  FORBIDDEN_MODEL_ROUTER_IPC_PATTERNS,
} from './topology/surfaces.ts'

const ROOT = process.cwd()

const THIN_SHELL_SOURCES = [
  'apps/desktop/src/main.ts',
  'apps/desktop/src/web-document.ts',
  'apps/desktop/src/backend-controller.ts',
] as const

/**
 * Product-domain routers that must stay on Host HTTP/WS, not Electron Main.
 * Intentionally excludes bare `/mailbox/i` so thin-shell contract JSDoc may name the absence.
 */
const FORBIDDEN_MAIN_ROUTER_PATTERNS = [
  /\bSendTeamMessage\b/,
  /\bagentTeams\b/,
  /\bctx\.llm\b/,
  /\bctx\.credentials\b/,
  /\bcreateBot\b/,
  /\binstallModelSelection\b/,
  /\bModelSelection\b/,
  /\bcredentials\.(?:set|resolve|get)\b/,
  /dsh-desktop:(?:mailbox|bot-message|bot-msg|agent-chat|create-bot|model-selection|api-key|credential)/i,
] as const

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8')
}

describe('Desktop thin shell Main (T027)', () => {
  it('keeps main.ts / web-document.ts / backend-controller.ts free of mailbox, credential, and model routers', () => {
    const sources = THIN_SHELL_SOURCES.map(path => ({ path, source: readSource(path) }))
    for (const { path, source } of sources) {
      for (const pattern of FORBIDDEN_MAIN_ROUTER_PATTERNS) {
        expect(source, `${path} must not match ${String(pattern)}`).not.toMatch(pattern)
      }
    }
  })

  it('loads the Web client over dsh-app:// and forwards application traffic to the Host HTTP plane', () => {
    const main = readSource('apps/desktop/src/main.ts')
    const webDocument = readSource('apps/desktop/src/web-document.ts')
    const backend = readSource('apps/desktop/src/backend-controller.ts')

    expect(SCHEME).toBe('dsh-app')
    expect(main).toContain('applicationUrl = `${SCHEME}://app/`')
    expect(main).toMatch(/protocol\.handle\(\s*SCHEME/)
    expect(main).toMatch(/\bserveWebDocument\b/)
    expect(main).toMatch(/\bforwardWebRequest\b/)
    expect(main).toMatch(/\bauthenticateWebHost\b/)
    expect(main).toMatch(/\bDesktopBackendController\b/)

    expect(webDocument).toMatch(/export async function serveWebDocument\b/)
    expect(webDocument).toMatch(/export async function authenticateWebHost\b/)
    expect(webDocument).toMatch(/export async function forwardWebRequest\b/)

    expect(backend).toMatch(/export class DesktopBackendController\b/)
    expect(backend).toMatch(/\bstart\(/)
    expect(backend).toMatch(/\bstop\(/)
    expect(backend).toMatch(/\bclose\(/)
    expect(backend).not.toMatch(/\bipcMain\b/)
    expect(backend).not.toMatch(/\bprotocol\.handle\b/)
  })

  it('registers only boot, chrome, and update IPC channels in Main — no product data-plane handlers', () => {
    const main = readSource('apps/desktop/src/main.ts')
    const allowed = new Set(Object.values(DESKTOP_IPC))
    const handles = [...main.matchAll(/ipcMain\.(?:handle|on)\(\s*DESKTOP_IPC\.(\w+)/g)]
      .map(match => match[1])
    expect(handles.length).toBeGreaterThan(0)
    for (const key of handles) {
      expect(allowed.has(DESKTOP_IPC[key as keyof typeof DESKTOP_IPC])).toBe(true)
      expect(key).not.toMatch(/mailbox|bot|credential|model|llm|chat/i)
    }
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_MAILBOX_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
      for (const pattern of FORBIDDEN_MODEL_ROUTER_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
    }
  })
})
