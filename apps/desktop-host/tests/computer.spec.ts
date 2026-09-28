/** Desktop Host computer composition (P7 T007–T012). */

import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import ComputerUseRegistry from '@deepseek-ai/dsh-computer-use'
import { SettingsProvider, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import { ShellExecutor } from '@deepseek-ai/dsh-shell'
import type { ShellExecRequest, ShellExecSpec, ShellProcess, ShellRunResult } from '@deepseek-ai/dsh-shell'
import type { SandboxMode } from '@deepseek-ai/dsh-sandbox'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import * as desktopComputer from '../src/computer.ts'
import {
  assertPassShellStack,
  assertPassSubagentStack,
} from '../src/computer.ts'
import { COMPUTER_SETTINGS_NAMESPACE } from '../src/computer-settings.ts'
import { PASS_PROVIDER_NAME, PASS_SCREENSHOT_TOOL } from '../src/computer-use-pass-fixture.ts'

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

/** Minimal `ctx.subagents` stand-in exposing the spawn provider name. */
class FakeSubagents extends Service {
  constructor(ctx: Context) {
    super(ctx, 'subagents')
  }
  list(): string[] {
    return ['spawn']
  }
}

describe('desktop-computer composition', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx?.fiber.dispose()
  })

  it('fails loud without Path A Shell substrate', () => {
    ctx = new Context()
    expect(() => assertPassShellStack(ctx)).toThrow(/ctx\.sandbox/)
  })

  it('fails loud without spawn subagent provider', async () => {
    ctx = new Context()
    class EmptySubagents extends Service {
      constructor(owner: Context) {
        super(owner, 'subagents')
      }
      list(): string[] {
        return []
      }
    }
    await ctx.plugin(EmptySubagents)
    expect(() => assertPassSubagentStack(ctx)).toThrow(/spawn provider/)
  })

  it('mounts settings SoT, readiness ready, computerUse Pass fixture', async () => {
    ctx = new Context()
    await ctx.plugin(MemorySettings)
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(SandboxedShell)
    await ctx.plugin(FakeSubagents)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    expect('default' in desktopComputer).toBe(false)
    const fiber = ctx.plugin(desktopComputer)
    await fiber
    const computer = ctx.settings.describe({ redactSecrets: true })
      .find(entry => entry.ns === COMPUTER_SETTINGS_NAMESPACE)
    expect(computer?.value).toMatchObject({
      readiness: 'ready',
      local: true,
      boxId: 'desktop-local',
      computerUseEnabled: true,
    })
    expect(ctx.computerUse.providerName).toBe(PASS_PROVIDER_NAME)
    expect(ctx.tools.schemas().map(tool => tool.name)).toContain(PASS_SCREENSHOT_TOOL)
    // Registry was mounted by the composition (not pre-installed).
    expect(ctx.get('computerUse')).toBeInstanceOf(ComputerUseRegistry)
    await ctx.settings.update(COMPUTER_SETTINGS_NAMESPACE, { computerUseEnabled: false })
    expect(ctx.settings.get(COMPUTER_SETTINGS_NAMESPACE)).toMatchObject({
      computerUseEnabled: false,
      readiness: 'ready',
    })
  })
})
