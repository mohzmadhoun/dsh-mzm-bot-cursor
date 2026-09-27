/** Development Host primary-runtime path shared by the Electron shell and `dev:desktop`. */

import { join } from 'node:path'

/**
 * Resolve the development primary-runtime directory for the current (or supplied) host.
 * Packaging targets (macOS / Windows) reuse `.desktop-build/targets/<target>/runtime/primary-runtime`
 * so `preparePrimaryRuntime` and Host spawn agree. Linux is not a packaging target; development
 * stages under `.desktop-build/development/runtime/primary-runtime` so Host can still boot.
 * @param appRoot - Desktop application root (`apps/desktop`).
 * @param platform - Host platform; defaults to `process.platform`.
 * @param arch - Host architecture; defaults to `process.arch`.
 * @returns Absolute path to the development primary-runtime directory (may be absent until prepared).
 */
export function developmentPrimaryRuntimePath(
  appRoot: string,
  platform: NodeJS.Platform = process.platform,
  arch: string = process.arch,
): string {
  if (platform === 'darwin') {
    return join(appRoot, '.desktop-build', 'targets', `mac-${arch}`, 'runtime', 'primary-runtime')
  }
  if (platform === 'win32') {
    return join(appRoot, '.desktop-build', 'targets', `win-${arch}`, 'runtime', 'primary-runtime')
  }
  return join(appRoot, '.desktop-build', 'development', 'runtime', 'primary-runtime')
}
