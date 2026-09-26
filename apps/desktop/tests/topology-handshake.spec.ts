/**
 * Topology handshake automation (SC-007 / FR-013) — Electron-owned slice.
 * Covers Architect criteria in contracts/topology-handshake.md without US1–US4 product UI.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  DESKTOP_HOST_CHILD_EVENT_TYPES,
  DESKTOP_HOST_CONTROL_TYPES,
} from '../src/host-protocol.ts'
import { DESKTOP_IPC, SCHEME, assertDesktopSender } from '../src/ipc.ts'
import { DesktopHostProcess } from '../src/host-process.ts'
import { authenticateWebHost, forwardWebRequest, serveWebDocument } from '../src/web-document.ts'
import { FIXTURE_SESSION, FIXTURE_TOKEN, installFixtureHost, TOPOLOGY_FIXTURE_HOST } from './topology/fixture-host.ts'
import { FORBIDDEN_MAILBOX_IPC_PATTERNS, TOPOLOGY_SURFACES } from './topology/surfaces.ts'

const roots: string[] = []
const hosts: DesktopHostProcess[] = []

function runtimeWithFixture(source = TOPOLOGY_FIXTURE_HOST): string {
  const runtime = mkdtempSync(join(tmpdir(), 'dsh-topology-handshake-'))
  roots.push(runtime)
  installFixtureHost(runtime, source)
  return runtime
}

function hostProcess(runtime: string): DesktopHostProcess {
  const host = new DesktopHostProcess(process.execPath, runtime, runtime)
  hosts.push(host)
  return host
}

afterEach(async () => {
  await Promise.all(hosts.splice(0).map(host => host.stop().catch(() => undefined)))
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('topology handshake (SC-007)', () => {
  it('inventories Shell↔Host surfaces against the contract map (T002)', () => {
    for (const [criterion, paths] of Object.entries(TOPOLOGY_SURFACES)) {
      expect(paths.length, criterion).toBeGreaterThan(0)
      for (const relative of paths) {
        expect(existsSync(join(process.cwd(), relative)), relative).toBe(true)
      }
    }
  })

  it('spawns one Desktop Host child with ELECTRON_RUN_AS_NODE, ready IPC, auth HTTP+WS, and ordered shutdown', async () => {
    const handshakeLog: string[] = []
    const log = (step: string, detail?: string): void => {
      handshakeLog.push(detail === undefined ? step : `${step}: ${detail}`)
    }

    const runtime = runtimeWithFixture()
    const host = hostProcess(runtime)

    const ready = await host.start()
    log('spawn', 'ELECTRON_RUN_AS_NODE child ready')
    expect(ready.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/\?token=/)
    expect(new URL(ready.url).searchParams.get('token')).toBe(FIXTURE_TOKEN)
    expect(ready.injections).toEqual([])
    log('ready', ready.url)

    // start() is idempotent — Main owns exactly one child per DesktopHostProcess.
    expect(await host.start()).toEqual(ready)

    const cookie = await authenticateWebHost(ready.url)
    expect(cookie).toBe(FIXTURE_SESSION)
    log('authenticate', cookie)

    const health = await forwardWebRequest(
      new Request('dsh-app://app/api/health', { headers: { origin: 'dsh-app://app' } }),
      ready.url,
      cookie,
    )
    expect(health.status).toBe(200)
    const body = await health.json() as { ok: boolean; runAsNode: string; streamOpened: boolean; pid: number }
    expect(body).toMatchObject({ ok: true, runAsNode: '1', streamOpened: false })
    log('http', `runAsNode=${body.runAsNode} pid=${String(body.pid)}`)

    const streamUrl = new URL('/api/remote.mux', ready.url)
    streamUrl.protocol = 'ws:'
    streamUrl.search = ''
    const streamMessage = await new Promise<string>((resolve, reject) => {
      const socket = new WebSocket(streamUrl.href, { headers: { cookie } } as WebSocketInit)
      const timer = setTimeout(() => {
        socket.close()
        reject(new Error('topology handshake: WebSocket deadline exceeded'))
      }, 5_000)
      socket.addEventListener('message', (event) => {
        clearTimeout(timer)
        resolve(String(event.data))
        socket.close()
      })
      socket.addEventListener('error', () => {
        clearTimeout(timer)
        reject(new Error('topology handshake: WebSocket failed'))
      })
    })
    expect(streamMessage).toBe('ok')
    log('websocket', streamUrl.href)

    const afterStream = await forwardWebRequest(
      new Request('dsh-app://app/api/health', { headers: { origin: 'dsh-app://app' } }),
      ready.url,
      cookie,
    )
    expect(await afterStream.json()).toMatchObject({ streamOpened: true })

    // Shell forwards with Host cookie only — no provider API key material in the data plane.
    expect(cookie).not.toMatch(/sk-|api[_-]?key|secret/i)
    expect(JSON.stringify(ready)).not.toMatch(/sk-|DEEPSEEK_API_KEY/i)

    await host.stop(true)
    expect(existsSync(join(runtime, 'stopped'))).toBe(true)
    log('shutdown', 'shutdown-complete')

    expect(handshakeLog).toEqual([
      expect.stringMatching(/^spawn:/),
      expect.stringMatching(/^ready:/),
      expect.stringMatching(/^authenticate:/),
      expect.stringMatching(/^http:/),
      expect.stringMatching(/^websocket:/),
      'shutdown: shutdown-complete',
    ])
  })

  it('loads the primary application document under dsh-app:// and rejects foreign origins', async () => {
    expect(SCHEME).toBe('dsh-app')
    const root = mkdtempSync(join(tmpdir(), 'dsh-topology-doc-'))
    roots.push(root)
    mkdirSync(join(root, 'assets'), { recursive: true })
    writeFileSync(join(root, 'index.html'), '<html><head></head><body>app</body></html>')
    const document = await serveWebDocument(new Request('dsh-app://app/'), root)
    expect(document.status).toBe(200)
    expect(await document.text()).toContain('__DSH_BOOT_READY__')

    const owned = { senderFrame: { url: 'dsh-app://app/' } } as Parameters<typeof assertDesktopSender>[0]
    expect(() => assertDesktopSender(owned, ['app'])).not.toThrow()
    const foreign = { senderFrame: { url: 'https://example.com/' } } as Parameters<typeof assertDesktopSender>[0]
    expect(() => assertDesktopSender(foreign, ['app'])).toThrow('unowned renderer')
  })

  it('rejects fake mailbox / bot-message over Host Node IPC and exposes no Electron mailbox channels (T007)', async () => {
    for (const channel of Object.values(DESKTOP_IPC)) {
      for (const pattern of FORBIDDEN_MAILBOX_IPC_PATTERNS) {
        expect(channel).not.toMatch(pattern)
      }
    }
    for (const type of [...DESKTOP_HOST_CHILD_EVENT_TYPES, ...DESKTOP_HOST_CONTROL_TYPES]) {
      for (const pattern of FORBIDDEN_MAILBOX_IPC_PATTERNS) {
        expect(type).not.toMatch(pattern)
      }
    }
    expect([...DESKTOP_HOST_CHILD_EVENT_TYPES]).toEqual([
      'ready', 'fatal', 'shutdown-complete', 'update-tasks',
    ])
    expect([...DESKTOP_HOST_CONTROL_TYPES]).toEqual(['shutdown', 'update-tasks'])

    const ipcSource = readFileSync(join(process.cwd(), 'apps/desktop/src/ipc.ts'), 'utf8')
    const protocolSource = readFileSync(join(process.cwd(), 'apps/desktop/src/host-protocol.ts'), 'utf8')
    const mainSource = readFileSync(join(process.cwd(), 'apps/desktop/src/main.ts'), 'utf8')
    for (const source of [ipcSource, protocolSource, mainSource]) {
      expect(source).not.toMatch(/dsh-desktop:(?:mailbox|bot-message|bot-msg|agent-chat)/i)
    }
    expect(ipcSource).toMatch(/no mailbox/i)
    expect(protocolSource).toMatch(/mailbox/i)

    // Fake child→Main mailbox event is an invalid Host IPC event.
    const badChild = runtimeWithFixture(`
      process.send({ type: 'mailbox', from: 'bot-a', to: 'bot-b', body: 'hello' })
    `)
    await expect(hostProcess(badChild).start()).rejects.toThrow('invalid IPC event')

    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('mailbox')
    expect(DESKTOP_HOST_CONTROL_TYPES).not.toContain('bot-message')
  })
})
