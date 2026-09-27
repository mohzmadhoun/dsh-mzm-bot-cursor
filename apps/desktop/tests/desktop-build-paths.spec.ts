import { join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { developmentPrimaryRuntimePath } from '../src/development-runtime.ts'
import {
  desktopBuildTargetName,
  resolveDesktopBuildTarget,
  tryResolveDesktopBuildTarget,
  desktopTargetBuildPaths,
} from '../scripts/desktop-build-paths.mjs'

describe('desktop build paths', () => {
  it('isolates every mutable build directory by complete target', () => {
    const arm64 = desktopTargetBuildPaths('mac-arm64')
    const x64 = desktopTargetBuildPaths('mac-x64')
    const windows = desktopTargetBuildPaths('win-x64')
    const mutableKeys = [
      'root',
      'artifacts',
      'runtime',
      'packageSet',
      'dsh',
      'dshPnpm',
      'electron',
      'packedDsh',
      'packedVendor',
      'packedLandlock',
    ] as const

    for (const key of mutableKeys) {
      expect(new Set([arm64[key], x64[key], windows[key]]).size).toBe(3)
    }
    expect(arm64.artifacts).toContain(join('targets', 'mac-arm64', 'artifacts'))
    expect(x64.dsh).toContain(join('targets', 'mac-x64', 'dsh'))
    expect(windows.runtime).toContain(join('targets', 'win-x64', 'runtime'))
  })

  it('shares only the immutable upstream download cache', () => {
    const arm64 = desktopTargetBuildPaths('mac-arm64')
    const x64 = desktopTargetBuildPaths('mac-x64')
    expect(arm64.downloads).toBe(x64.downloads)
    expect(arm64.downloads).not.toContain(`${sep}targets${sep}`)
  })

  it('resolves environment overrides and rejects unsupported targets', () => {
    expect(resolveDesktopBuildTarget({
      DSH_DESKTOP_TARGET_PLATFORM: 'darwin',
      DSH_DESKTOP_TARGET_ARCH: 'x64',
    }, 'darwin', 'arm64')).toBe('mac-x64')
    expect(resolveDesktopBuildTarget({}, 'win32', 'x64')).toBe('win-x64')
    expect(() => resolveDesktopBuildTarget({}, 'linux', 'x64')).toThrow(/unsupported target/u)
    expect(() => desktopTargetBuildPaths('linux-x64' as 'mac-x64')).toThrow(/unsupported target/u)
  })

  it('reports packaging support without throwing on Linux', () => {
    expect(desktopBuildTargetName({}, 'linux', 'x64')).toBe('linux-x64')
    expect(tryResolveDesktopBuildTarget({}, 'linux', 'x64')).toBeNull()
    expect(tryResolveDesktopBuildTarget({}, 'darwin', 'arm64')).toBe('mac-arm64')
    expect(tryResolveDesktopBuildTarget({}, 'win32', 'x64')).toBe('win-x64')
  })
})

describe('development primary-runtime path', () => {
  const appRoot = '/repo/apps/desktop'

  it('reuses packaging target directories on macOS and Windows', () => {
    expect(developmentPrimaryRuntimePath(appRoot, 'darwin', 'arm64'))
      .toBe(join(appRoot, '.desktop-build', 'targets', 'mac-arm64', 'runtime', 'primary-runtime'))
    expect(developmentPrimaryRuntimePath(appRoot, 'win32', 'x64'))
      .toBe(join(appRoot, '.desktop-build', 'targets', 'win-x64', 'runtime', 'primary-runtime'))
  })

  it('stages under development/runtime on Linux (not a packaging target)', () => {
    expect(developmentPrimaryRuntimePath(appRoot, 'linux', 'x64'))
      .toBe(join(appRoot, '.desktop-build', 'development', 'runtime', 'primary-runtime'))
  })
})
