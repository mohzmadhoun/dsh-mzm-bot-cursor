/**
 * Host settings document fields for Settings → Computer projection (P7).
 * Shell readiness is Host-owned SoT; Computer use enablement is Client-mutable
 * via authenticated settings Remotes. Electron Main must not store these fields.
 * @module desktop-host/computer-settings
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { SettingsScope } from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-settings'

/** Settings namespace projected to Client Settings → Computer (Shell + Computer use). */
export const COMPUTER_SETTINGS_NAMESPACE = 'computer'

/** Singleton Host box id for Pass local sandboxed Shell world. */
export const DESKTOP_LOCAL_BOX_ID = 'desktop-local'

/** Host-projected box/computer backend readiness (data-model BoxBackend.readiness). */
export type BoxReadiness = 'not_ready' | 'starting' | 'ready' | 'failed'

/** Host Computer settings SoT for Shell readiness + Computer use enablement. */
export interface ComputerSettings {
  /** Singleton Host box id for Pass (`desktop-local`). */
  boxId: string
  /** Host-projected readiness — Shell Settings row may read this read-only. */
  readiness: BoxReadiness
  /** Pass path is Host-local sandboxed Shell (`true`). */
  local: boolean
  /** ISO-8601 timestamp of the last Host readiness commit. */
  updatedAt: string
  /** Whether computerUse-class tools are enabled for Desktop sessions. */
  computerUseEnabled: boolean
}

/** Schema for the `computer` settings namespace (Host SoT; Remotes project it). */
export const COMPUTER_SETTINGS_SCHEMA: z<ComputerSettings> = z.object({
  boxId: z.string().default(DESKTOP_LOCAL_BOX_ID),
  readiness: z.union(['not_ready', 'starting', 'ready', 'failed'] as const).default('not_ready'),
  local: z.boolean().default(true),
  updatedAt: z.string().default('1970-01-01T00:00:00.000Z'),
  computerUseEnabled: z.boolean().default(true),
})

/** Composition / first-boot defaults before the Host probe commits. */
export function defaultComputerSettings(now = new Date()): ComputerSettings {
  return {
    boxId: DESKTOP_LOCAL_BOX_ID,
    readiness: 'not_ready',
    local: true,
    updatedAt: now.toISOString(),
    computerUseEnabled: true,
  }
}

/**
 * Register the Computer settings namespace when a settings provider is present.
 * Without settings, Desktop Host keeps an in-memory fallback for the probe only —
 * Client projection requires the file provider on the Desktop profile (T012).
 * @param ctx - Desktop Host context.
 * @param entry - composition base for the namespace.
 * @returns the live scope when settings is mounted; otherwise `undefined`.
 */
export function registerComputerSettings(
  ctx: Context,
  entry: ComputerSettings = defaultComputerSettings(),
): SettingsScope<ComputerSettings> | undefined {
  const settings = ctx.get('settings')
  if (settings === undefined) return undefined
  return settings.register(COMPUTER_SETTINGS_NAMESPACE, COMPUTER_SETTINGS_SCHEMA, {
    base: entry,
    applies: 'live',
  })
}
