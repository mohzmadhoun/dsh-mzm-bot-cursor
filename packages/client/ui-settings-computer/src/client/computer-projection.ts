/**
 * Client projection of the Host `computer` settings namespace (Path A Remotes).
 * Field names match Desktop Host `ComputerSettings`; this package must not
 * import Host packages.
 */

/** Host-projected box/computer backend readiness (data-model BoxBackend.readiness). */
export type BoxReadiness = 'not_ready' | 'starting' | 'ready' | 'failed'

/** Full Host Computer settings section projected to Settings → Computer. */
export interface ComputerSettingsProjection {
  /** Singleton Host box id for Pass (`desktop-local`). */
  readonly boxId: string
  /** Host readiness — Shell row is read-only over this field. */
  readonly readiness: BoxReadiness
  /** Pass path is Host-local sandboxed Shell. */
  readonly local: boolean
  /** ISO-8601 timestamp of the last Host readiness commit. */
  readonly updatedAt: string
  /** Whether computerUse-class tools are enabled for Desktop sessions. */
  readonly computerUseEnabled: boolean
}

/** Snapshot of the Host `computer` settings mirror for the Computer page. */
export interface ComputerSettingsSnapshot {
  /** Mirror readiness; `unavailable` when the Host namespace is not served. */
  readonly status: 'loading' | 'ready' | 'unavailable'
  /** Last accepted Host projection; undefined before the first acceptance. */
  readonly value: ComputerSettingsProjection | undefined
  /** Whether the Host document accepts writes (Computer use enablement). */
  readonly writable: boolean
}

/** Host settings namespace for Settings → Computer (Shell + Computer use). */
export const COMPUTER_SETTINGS_NAMESPACE = 'computer'

/**
 * Narrow one Host `computer` settings section to the Computer page fields.
 * @param section - wire section from settings.describe / settingsScope.
 * @returns projection when fields are well-formed; otherwise undefined.
 */
export function decodeComputerSettingsProjection(
  section: unknown,
): ComputerSettingsProjection | undefined {
  if (typeof section !== 'object' || section === null || Array.isArray(section)) return undefined
  const record = section as Record<string, unknown>
  const { boxId, readiness, local, updatedAt, computerUseEnabled } = record
  if (typeof boxId !== 'string' || boxId.trim() === '') return undefined
  if (
    readiness !== 'not_ready'
    && readiness !== 'starting'
    && readiness !== 'ready'
    && readiness !== 'failed'
  ) {
    return undefined
  }
  if (typeof local !== 'boolean') return undefined
  if (typeof updatedAt !== 'string' || updatedAt.trim() === '') return undefined
  if (typeof computerUseEnabled !== 'boolean') return undefined
  return { boxId, readiness, local, updatedAt, computerUseEnabled }
}
