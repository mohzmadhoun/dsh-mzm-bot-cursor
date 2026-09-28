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

/** Cross-module Host authority slot on the settings provider (survives Vite dupes). */
const HOST_OWNED_AUTH = Symbol.for('dsh.desktop-host.computer-host-owned')

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

/**
 * Host-owned Shell row fields (FR-004 / PO read-only readiness).
 * Client Remotes may read these via `settings.describe`; writes are rejected.
 */
export type ComputerHostOwnedFields = Pick<ComputerSettings, 'boxId' | 'readiness' | 'local' | 'updatedAt'>

/** Client-mutable Computer use row field (FR-004 enablement). */
export type ComputerUseMutableFields = Pick<ComputerSettings, 'computerUseEnabled'>

/**
 * Client Settings → Computer row projection over the Host `computer` namespace.
 * Maps data-model `ComputerSettingsProjection` observables onto Host SoT fields.
 */
export interface ComputerSettingsRowsProjection {
  /** Shell row — Host readiness SoT; display read-only (PO). */
  shell: ComputerHostOwnedFields
  /** Computer use row — Client may mutate `computerUseEnabled` via Remotes. */
  computerUse: ComputerUseMutableFields
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
 * Project Host `computer` settings onto Client Shell + Computer use row fields.
 * @param value - resolved Host Computer settings document.
 * @returns row-shaped projection for Settings → Computer (FR-004 / FR-016 Host half).
 */
export function projectComputerSettingsRows(value: ComputerSettings): ComputerSettingsRowsProjection {
  return {
    shell: {
      boxId: value.boxId,
      readiness: value.readiness,
      local: value.local,
      updatedAt: value.updatedAt,
    },
    computerUse: {
      computerUseEnabled: value.computerUseEnabled,
    },
  }
}

/**
 * Snapshot Host-owned Shell fields from a Computer settings value.
 * @param value - full or partial Computer settings.
 * @returns Host-owned Shell fields only.
 */
export function pickComputerHostOwned(value: ComputerHostOwnedFields): ComputerHostOwnedFields {
  return {
    boxId: value.boxId,
    readiness: value.readiness,
    local: value.local,
    updatedAt: value.updatedAt,
  }
}

type HostOwnedCarrier = { [HOST_OWNED_AUTH]?: ComputerHostOwnedFields }

/**
 * Read Host-owned Shell authority from the settings provider.
 * @param settings - mounted settings provider.
 * @returns authority slot when registered.
 */
function hostOwnedSlot(settings: object): ComputerHostOwnedFields | undefined {
  return (settings as HostOwnedCarrier)[HOST_OWNED_AUTH]
}

/**
 * Authorize the next Host write of Shell SoT fields (probe / recovery).
 * Must run immediately before a settings write that changes Host-owned keys.
 * @param settings - mounted settings provider carrying Host authority.
 * @param fields - Host-owned Shell fields being committed.
 */
export function authorizeComputerHostOwned(
  settings: object,
  fields: ComputerHostOwnedFields,
): void {
  const slot = hostOwnedSlot(settings)
  if (slot === undefined) {
    ;(settings as HostOwnedCarrier)[HOST_OWNED_AUTH] = pickComputerHostOwned(fields)
    return
  }
  slot.boxId = fields.boxId
  slot.readiness = fields.readiness
  slot.local = fields.local
  slot.updatedAt = fields.updatedAt
}

/**
 * Refuse resolved values whose Host-owned Shell fields diverge from Host authority.
 * @param value - schema-valid resolved Computer settings.
 * @param authority - last Host-authorized Shell fields.
 */
function assertComputerHostOwnedMatch(
  value: ComputerSettings,
  authority: ComputerHostOwnedFields,
): void {
  if (
    value.boxId !== authority.boxId
    || value.readiness !== authority.readiness
    || value.local !== authority.local
    || value.updatedAt !== authority.updatedAt
  ) {
    throw new TypeError(
      'computer settings: Host-owned Shell fields (boxId/readiness/local/updatedAt) are read-only over Remotes; mutate computerUseEnabled only',
    )
  }
}

/**
 * Register the Computer settings namespace when a settings provider is present.
 * Without settings, Desktop Host keeps an in-memory fallback for the probe only —
 * Client projection requires the file provider on the Desktop profile (T012/T026).
 * Host-owned Shell fields are locked after registration; Client Remotes may only
 * mutate `computerUseEnabled`.
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
  const authority = pickComputerHostOwned(entry)
  ;(settings as HostOwnedCarrier)[HOST_OWNED_AUTH] = authority
  // Defer Host-owned enforcement until after the first resolve locks authority to
  // the stored document — registration resolve compares base+user against entry
  // timestamps and must not reject a reboot that preserves Host SoT.
  let locked = false
  const scope = settings.register(COMPUTER_SETTINGS_NAMESPACE, COMPUTER_SETTINGS_SCHEMA, {
    base: entry,
    applies: 'live',
    validate: (value) => {
      if (!locked) return
      const live = hostOwnedSlot(settings)
      if (live === undefined) return
      assertComputerHostOwnedMatch(value as ComputerSettings, live)
    },
  })
  // Lock to the resolved document (base + stored user) so reboot preserves Host SoT.
  const resolvedOwned = pickComputerHostOwned(scope.get())
  authority.boxId = resolvedOwned.boxId
  authority.readiness = resolvedOwned.readiness
  authority.local = resolvedOwned.local
  authority.updatedAt = resolvedOwned.updatedAt
  locked = true
  return scope
}
