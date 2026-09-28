/** Host BoxBackend readiness probe + Computer settings SoT (P7 T007/T011/T012). */

import { describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import { SettingsProvider, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import { ShellExecutor } from '@deepseek-ai/dsh-shell'
import type { ShellExecRequest, ShellExecSpec, ShellProcess, ShellRunResult } from '@deepseek-ai/dsh-shell'
import type { SandboxMode } from '@deepseek-ai/dsh-sandbox'
import {
  classifyBoxReadiness,
  commitBoxReadiness,
  runBoxReadinessProbe,
} from '../src/box-readiness.ts'
import {
  COMPUTER_SETTINGS_NAMESPACE,
  DESKTOP_LOCAL_BOX_ID,
  defaultComputerSettings,
  registerComputerSettings,
} from '../src/computer-settings.ts'

/** In-memory settings provider for Host SoT unit tests. */
class MemorySettings extends SettingsProvider {
  doc: Record<string, unknown>
  constructor(ctx: Context, options?: { doc?: Record<string, unknown> }) {
    super(ctx)
    this.doc = structuredClone(options?.doc ?? {})
  }
  get writable(): boolean {
    return true
  }
  protected load(): Promise<Record<string, unknown>> {
    return Promise.resolve(structuredClone(this.doc))
  }
  protected persist(ns: SettingsNamespace, section: Record<string, unknown>): Promise<void> {
    this.doc[ns] = structuredClone(section)
    return Promise.resolve()
  }
}

class FakeSandbox extends Service {
  constructor(ctx: Context) {
    super(ctx, 'sandbox')
  }
}

class SandboxedShell extends ShellExecutor {
  override get sandboxMode(): SandboxMode {
    return 'workspace-write'
  }
  resolve(request: ShellExecRequest): ShellExecSpec {
    return request as ShellExecSpec
  }
  run(): Promise<ShellRunResult> {
    return Promise.reject(new Error('unused'))
  }
  start(): Promise<ShellProcess> {
    return Promise.reject(new Error('unused'))
  }
}

class UnconfinedShell extends ShellExecutor {
  resolve(request: ShellExecRequest): ShellExecSpec {
    return request as ShellExecSpec
  }
  run(): Promise<ShellRunResult> {
    return Promise.reject(new Error('unused'))
  }
  start(): Promise<ShellProcess> {
    return Promise.reject(new Error('unused'))
  }
}

describe('classifyBoxReadiness', () => {
  it('returns failed when shell or sandbox is absent', async () => {
    const ctx = new Context()
    expect(classifyBoxReadiness(ctx)).toBe('failed')
    await ctx.plugin(FakeSandbox)
    expect(classifyBoxReadiness(ctx)).toBe('failed')
    await ctx.fiber.dispose()
  })

  it('returns failed for an unconfined shell', async () => {
    const ctx = new Context()
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(UnconfinedShell)
    expect(classifyBoxReadiness(ctx)).toBe('failed')
    await ctx.fiber.dispose()
  })

  it('returns ready for sandboxed shell + sandbox', async () => {
    const ctx = new Context()
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(SandboxedShell)
    expect(classifyBoxReadiness(ctx)).toBe('ready')
    await ctx.fiber.dispose()
  })
})

describe('computer settings SoT', () => {
  it('registers the computer namespace and projects readiness via describe', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings)
    const scope = registerComputerSettings(ctx, defaultComputerSettings(new Date('2026-09-28T00:00:00.000Z')))
    expect(scope).toBeDefined()
    await commitBoxReadiness(scope!, 'starting', new Date('2026-09-28T00:00:01.000Z'))
    expect(scope!.get()).toMatchObject({
      boxId: DESKTOP_LOCAL_BOX_ID,
      readiness: 'starting',
      local: true,
      updatedAt: '2026-09-28T00:00:01.000Z',
      computerUseEnabled: true,
    })
    const described = ctx.settings.describe({ redactSecrets: true })
    const computer = described.find(entry => entry.ns === COMPUTER_SETTINGS_NAMESPACE)
    expect(computer?.value).toMatchObject({
      readiness: 'starting',
      local: true,
      computerUseEnabled: true,
    })
    await scope!.update({ computerUseEnabled: false })
    expect(scope!.get().computerUseEnabled).toBe(false)
    await commitBoxReadiness(scope!, 'ready', new Date('2026-09-28T00:00:02.000Z'))
    expect(scope!.get()).toMatchObject({
      readiness: 'ready',
      computerUseEnabled: false,
      local: true,
    })
    await ctx.fiber.dispose()
  })

  it('probes starting then ready when Path A substrate is present', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings)
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(SandboxedShell)
    const scope = registerComputerSettings(ctx)!
    const projection = await runBoxReadinessProbe(ctx, scope)
    expect(projection.readiness).toBe('ready')
    expect(projection.local).toBe(true)
    expect(projection.boxId).toBe(DESKTOP_LOCAL_BOX_ID)
    expect(scope.get().readiness).toBe('ready')
    await ctx.fiber.dispose()
  })

  it('probes failed when sandboxed shell is missing', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings)
    const scope = registerComputerSettings(ctx)!
    const projection = await runBoxReadinessProbe(ctx, scope)
    expect(projection.readiness).toBe('failed')
    expect(scope.get().readiness).toBe('failed')
    await ctx.fiber.dispose()
  })
})
