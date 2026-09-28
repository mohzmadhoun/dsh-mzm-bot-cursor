/**
 * Desktop Host composition for Phase 7 Foundational computer / box substrate.
 * Owns BoxBackend readiness SoT, Computer settings fields, computerUse registry
 * + Pass fixture, and loud checks that Path A Shell/subagent stacks from the
 * Desktop profile remain mounted. Product UI (US1–US3) stays out of scope.
 * @module desktop-host/computer
 */

import type { Context } from '@deepseek-ai/cordis'
import ComputerUseRegistry from '@deepseek-ai/dsh-computer-use'
import type {} from '@deepseek-ai/dsh-shell'
import type {} from '@deepseek-ai/dsh-sandbox'
import type {} from '@deepseek-ai/dsh-subagent'
import type {} from '@deepseek-ai/dsh-settings'
import { runBoxReadinessProbe } from './box-readiness.ts'
import {
  defaultComputerSettings,
  registerComputerSettings,
} from './computer-settings.ts'
import * as computerUsePassFixture from './computer-use-pass-fixture.ts'

/** Loader identity for the Desktop Host computer/box composition. */
export const name = 'desktop-computer'

/**
 * No hard inject list: profile bundles own Shell/sandbox/subagent/settings;
 * this plugin fails loud when Path A services are missing after mount.
 */
export const inject = [] as const

/**
 * Assert Path A Shell substrate is present for Verifier-reachable local tools.
 * Tools themselves remount via session presets (web-app disables host-plane
 * tool-bash/pwsh); executors + sandbox must already be on the Host plane.
 * @param ctx - Desktop Host context after profile boot.
 */
export function assertPassShellStack(ctx: Context): void {
  if (ctx.get('sandbox') === undefined) {
    throw new Error('desktop-computer: Path A requires ctx.sandbox (dsh-sandbox-local) on Desktop Host')
  }
  const shell = ctx.get('shell')
  if (shell === undefined) {
    throw new Error('desktop-computer: Path A requires ctx.shell (dsh-bash-sandbox / dsh-pwsh-sandbox) on Desktop Host')
  }
  if (shell.sandboxMode === undefined) {
    throw new Error('desktop-computer: Path A requires a sandboxed ctx.shell provider (unconfined shell is not Pass)')
  }
}

/**
 * Assert subagent registry + spawn provider remain available for computerUse delegation.
 * Model-facing `tool-subagent` is remounted by standard/cordis presets; the Host
 * plane keeps the registry and spawn-in-process provider (research R3).
 * @param ctx - Desktop Host context after profile boot.
 */
export function assertPassSubagentStack(ctx: Context): void {
  const subagents = ctx.get('subagents')
  if (subagents === undefined) {
    throw new Error('desktop-computer: Path A requires ctx.subagents (dsh-subagent) on Desktop Host')
  }
  if (!subagents.list().includes('spawn')) {
    throw new Error('desktop-computer: Path A requires spawn provider (dsh-subagent-spawn-in-process) on Desktop Host')
  }
}

/**
 * Mount Computer settings SoT, readiness probe, computerUse registry + Pass
 * fixture, and verify Shell/subagent Path A substrate from the Desktop profile.
 * @param ctx - Profile scope after `runProfile({ profile: 'desktop' })`.
 */
export async function apply(ctx: Context): Promise<void> {
  assertPassShellStack(ctx)
  assertPassSubagentStack(ctx)

  const scope = registerComputerSettings(ctx, defaultComputerSettings())
  await runBoxReadinessProbe(ctx, scope)

  await ctx.plugin(ComputerUseRegistry)
  await ctx.plugin(computerUsePassFixture)
}
