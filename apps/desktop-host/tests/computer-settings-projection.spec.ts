/** Host Computer settings projection for Client Settings → Computer (P7 T026). */

import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import SettingsController from '@deepseek-ai/dsh-api-settings-controller'
import { SettingsProvider, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import { ShellExecutor } from '@deepseek-ai/dsh-shell'
import type { ShellExecRequest, ShellExecSpec, ShellProcess, ShellRunResult } from '@deepseek-ai/dsh-shell'
import type { SandboxMode } from '@deepseek-ai/dsh-sandbox'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { commitBoxReadiness } from '../src/box-readiness.ts'
import * as desktopComputer from '../src/computer.ts'
import {
  COMPUTER_SETTINGS_NAMESPACE,
  defaultComputerSettings,
  getComputerSettingsScope,
  projectComputerSettingsRows,
  registerComputerSettings,
} from '../src/computer-settings.ts'

class MemorySettings extends SettingsProvider {
  doc: Record<string, unknown> = {}
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

class FakeSubagents extends Service {
  constructor(ctx: Context) {
    super(ctx, 'subagents')
  }
  list(): string[] {
    return ['spawn']
  }
}

describe('computer settings Client row projection (T026)', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx?.fiber.dispose()
  })

  it('maps Host computer SoT onto Shell + Computer use row fields', async () => {
    ctx = new Context()
    await ctx.plugin(MemorySettings)
    const scope = registerComputerSettings(
      ctx,
      defaultComputerSettings(new Date('2026-09-28T12:00:00.000Z')),
    )!
    await commitBoxReadiness(scope, 'ready', new Date('2026-09-28T12:00:01.000Z'))
    expect(projectComputerSettingsRows(scope.get())).toEqual({
      shell: {
        boxId: 'desktop-local',
        readiness: 'ready',
        local: true,
        updatedAt: '2026-09-28T12:00:01.000Z',
      },
      computerUse: { computerUseEnabled: true },
    })
  })

  it('allows computerUseEnabled mutate and rejects Host Shell field spoofing', async () => {
    ctx = new Context()
    await ctx.plugin(MemorySettings)
    const scope = registerComputerSettings(ctx)!
    await commitBoxReadiness(scope, 'ready')
    await scope.update({ computerUseEnabled: false })
    expect(scope.get()).toMatchObject({ readiness: 'ready', computerUseEnabled: false })
    await expect(scope.update({ readiness: 'failed' })).rejects.toThrow(/read-only over Remotes/)
    expect(scope.get().readiness).toBe('ready')
  })

  it('projects computer namespace through authenticated settings Remotes', async () => {
    ctx = new Context()
    await ctx.plugin(MemorySettings)
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(SandboxedShell)
    await ctx.plugin(FakeSubagents)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(desktopComputer)
    await ctx.plugin(SettingsController)

    const described = ctx.settingsController.describe()
    const computer = described.namespaces.find(entry => entry.ns === COMPUTER_SETTINGS_NAMESPACE)
    expect(computer?.value).toMatchObject({
      readiness: 'ready',
      local: true,
      boxId: 'desktop-local',
      computerUseEnabled: true,
    })
    expect(projectComputerSettingsRows(computer!.value as never).shell.readiness).toBe('ready')

    const afterEnable = await ctx.settingsController.update(
      COMPUTER_SETTINGS_NAMESPACE,
      { computerUseEnabled: false },
      computer!.revision,
    )
    expect(afterEnable.value).toMatchObject({
      readiness: 'ready',
      computerUseEnabled: false,
    })

    await expect(
      ctx.settingsController.update(
        COMPUTER_SETTINGS_NAMESPACE,
        { readiness: 'failed' },
        afterEnable.revision,
      ),
    ).rejects.toMatchObject({ code: 'settings/rejected' })

    expect(getComputerSettingsScope(ctx)!.get()).toMatchObject({
      readiness: 'ready',
      computerUseEnabled: false,
    })
  })
})
