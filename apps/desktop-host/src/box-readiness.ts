/**
 * Host BoxBackend readiness probe for Desktop Path A (P7 T007).
 * Observes sandboxed `ctx.shell` + `ctx.sandbox` and commits readiness into
 * the Host `computer` settings SoT — never Electron Main, never Client-only.
 * @module desktop-host/box-readiness
 */

import type { Context } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-shell'
import type {} from '@deepseek-ai/dsh-sandbox'
import type { BoxReadiness, ComputerSettings } from './computer-settings.ts'
import {
  authorizeComputerHostOwned,
  DESKTOP_LOCAL_BOX_ID,
} from './computer-settings.ts'

/**
 * Classify Host local Shell/box readiness from currently mounted services.
 * Sandboxed executors advertise a default `sandboxMode`; unconfined providers
 * leave it undefined and cannot score Path A Pass.
 * @param ctx - Desktop Host context after profile boot.
 * @returns readiness excluding `starting` (caller owns the starting transition).
 */
export function classifyBoxReadiness(ctx: Context): Exclude<BoxReadiness, 'starting'> {
  const shell = ctx.get('shell')
  const sandbox = ctx.get('sandbox')
  if (shell === undefined || sandbox === undefined) return 'failed'
  if (shell.sandboxMode === undefined) return 'failed'
  return 'ready'
}

/**
 * Commit one Host readiness projection into the Computer settings SoT.
 * Merges so Client-owned `computerUseEnabled` survives Host probe writes.
 * Authorizes Host-owned Shell fields before the write so Remotes cannot spoof
 * readiness while Host probes remain valid (T026 / FR-004 Shell read-only).
 * @param scope - registered `computer` settings scope.
 * @param readiness - next Host readiness value.
 * @param now - wall clock for `updatedAt`.
 */
export async function commitBoxReadiness(
  scope: SettingsScope<ComputerSettings>,
  readiness: BoxReadiness,
  now = new Date(),
): Promise<ComputerSettings> {
  const hostOwned = {
    boxId: DESKTOP_LOCAL_BOX_ID,
    readiness,
    local: true as const,
    updatedAt: now.toISOString(),
  }
  authorizeComputerHostOwned(scope, hostOwned)
  await scope.update(hostOwned)
  return scope.get()
}

/**
 * Drive starting → ready|failed and keep an in-memory mirror when settings
 * is absent (unit tests without the file provider).
 * @param ctx - Desktop Host context.
 * @param scope - optional settings scope (preferred SoT).
 * @returns the committed projection (settings or in-memory).
 */
export async function runBoxReadinessProbe(
  ctx: Context,
  scope: SettingsScope<ComputerSettings> | undefined,
): Promise<ComputerSettings> {
  const startedAt = new Date()
  if (scope !== undefined) {
    await commitBoxReadiness(scope, 'starting', startedAt)
  }
  const readiness = classifyBoxReadiness(ctx)
  const finishedAt = new Date()
  if (scope !== undefined) {
    return commitBoxReadiness(scope, readiness, finishedAt)
  }
  return {
    boxId: DESKTOP_LOCAL_BOX_ID,
    readiness,
    local: true,
    updatedAt: finishedAt.toISOString(),
    computerUseEnabled: true,
  }
}
