/** Fixture Desktop Host entry used by topology handshake automation. */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** Auth token embedded in the Host `ready` URL query. */
export const FIXTURE_TOKEN = 'fixture'

/** Cookie value issued by the fixture authentication exchange. */
export const FIXTURE_SESSION = 'session=topology-fixture'

/**
 * Fixture Host source: Node IPC lifecycle-only, authenticated HTTP, and one WS stream.
 * Mirrors shipped desktop-host ready/shutdown without loading the full profile.
 */
export const TOPOLOGY_FIXTURE_HOST = `
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
const TOKEN = ${JSON.stringify(FIXTURE_TOKEN)}
const SESSION = ${JSON.stringify(FIXTURE_SESSION)}
let streamOpened = false
/** Upgraded sockets are not always released by server.closeAllConnections(). */
const upgradeSockets = new Set()
const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  if (url.searchParams.get('token') === TOKEN) {
    response.writeHead(303, {
      'set-cookie': SESSION + '; HttpOnly; SameSite=Strict',
      location: '/',
    })
    response.end()
    return
  }
  if (url.pathname === '/api/health') {
    const cookie = request.headers.cookie ?? ''
    if (!cookie.includes(SESSION)) {
      response.writeHead(401)
      response.end('unauthorized')
      return
    }
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify({
      ok: true,
      runAsNode: process.env.ELECTRON_RUN_AS_NODE,
      streamOpened,
      pid: process.pid,
    }))
    return
  }
  response.writeHead(404)
  response.end()
})
server.on('upgrade', (request, socket) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  const cookie = request.headers.cookie ?? ''
  if (url.pathname !== '/api/remote.mux' || !cookie.includes(SESSION)) {
    socket.write('HTTP/1.1 401 Unauthorized\\r\\nConnection: close\\r\\n\\r\\n')
    socket.destroy()
    return
  }
  const key = request.headers['sec-websocket-key']
  if (typeof key !== 'string') {
    socket.destroy()
    return
  }
  const accept = createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64')
  socket.write(
    'HTTP/1.1 101 Switching Protocols\\r\\nUpgrade: websocket\\r\\nConnection: Upgrade\\r\\nSec-WebSocket-Accept: '
      + accept + '\\r\\n\\r\\n',
  )
  upgradeSockets.add(socket)
  socket.on('close', () => { upgradeSockets.delete(socket) })
  streamOpened = true
  socket.write(Buffer.from([0x81, 0x02, 0x6f, 0x6b]))
})
server.listen(0, '127.0.0.1', () => {
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('fixture host listen failed')
  process.send({
    type: 'ready',
    url: 'http://127.0.0.1:' + address.port + '/?token=' + TOKEN,
    injections: [],
  })
})
process.on('message', message => {
  if (message === null || typeof message !== 'object' || !('type' in message)) return
  if (message.type === 'update-tasks') {
    process.send({ type: 'update-tasks', requestId: message.requestId, active: false })
    return
  }
  if (message.type !== 'shutdown') return
  for (const socket of upgradeSockets) socket.destroy()
  upgradeSockets.clear()
  server.close(() => {
    writeFileSync(join(process.argv[3], 'stopped'), '')
    process.send({ type: 'shutdown-complete' }, () => process.disconnect())
  })
  server.closeAllConnections()
})
`

/**
 * Install a fixture `@deepseek-ai/dsh-desktop-host` package under a temp runtime root.
 * @param runtime - Directory used as both runtime and profile for `DesktopHostProcess`.
 * @param source - Host entry source; defaults to the topology fixture.
 * @returns Absolute path to the written entry module.
 */
export function installFixtureHost(runtime: string, source = TOPOLOGY_FIXTURE_HOST): string {
  const packageRoot = join(runtime, 'node_modules', '@deepseek-ai', 'dsh-desktop-host')
  const entry = join(packageRoot, 'lib', 'index.js')
  mkdirSync(join(packageRoot, 'lib'), { recursive: true })
  writeFileSync(join(packageRoot, 'package.json'), '{"name":"@deepseek-ai/dsh-desktop-host","type":"module"}\n')
  writeFileSync(entry, source)
  return entry
}
