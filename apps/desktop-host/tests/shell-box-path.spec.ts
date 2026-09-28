/** Host Shell/box path — ready→success (T016) and not-ready ≠ SC-001 Pass (T017). */

import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SettingsProvider, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import { ShellExecutor } from '@deepseek-ai/dsh-shell'
import type { ShellExecRequest, ShellExecSpec, ShellProcess, ShellRunResult } from '@deepseek-ai/dsh-shell'
import type { SandboxMode } from '@deepseek-ai/dsh-sandbox'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { defineTool } from '@deepseek-ai/dsh-tools'
import { commitBoxReadiness } from '../src/box-readiness.ts'
import {
  COMPUTER_SETTINGS_NAMESPACE,
  DESKTOP_LOCAL_BOX_ID,
  defaultComputerSettings,
  registerComputerSettings,
  type BoxReadiness,
} from '../src/computer-settings.ts'
import * as desktopComputer from '../src/computer.ts'
import {
  BOX_NOT_READY_CODE,
  BOX_NOT_READY_ERROR_NAME,
  installShellBoxPath,
  scoresAsSc001Pass,
} from '../src/shell-box-path.ts'

const signal = new AbortController().signal

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

/** Path A sandboxed executor — records runs and returns exit 0. */
class SandboxedShell extends ShellExecutor {
  runs = 0
  override get sandboxMode(): SandboxMode {
    return 'workspace-write'
  }
  resolve(request: ShellExecRequest): ShellExecSpec {
    return request as ShellExecSpec
  }
  run(_spec: ShellExecSpec): Promise<ShellRunResult> {
    this.runs += 1
    return Promise.resolve({
      exitCode: 0,
      signal: null,
      timedOut: false,
      aborted: false,
      timeoutMs: 1_000,
      stdout: { text: 'ok\n', truncated: false },
      stderr: { text: '', truncated: false },
      sandbox: { mode: 'workspace-write', denied: false },
    })
  }
  start(_spec: ShellExecSpec): Promise<ShellProcess> {
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

/** Minimal Path A `bash` Consumer that runs through sandboxed `ctx.shell`. */
function registerPathABash(ctx: Context, shell: SandboxedShell): () => void {
  return ctx.tools.register(defineTool({
    name: 'bash',
    description: 'Path A local sandboxed bash for Host Shell/box tests.',
    parameters: {
      command: { type: 'string', required: true },
      description: { type: 'string', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args: { command: string }) {
      const result = await shell.run(shell.resolve({ command: args.command, signal }))
      return `exit=${String(result.exitCode)} stdout=${result.stdout.text.trim()}`
    },
  }))
}

describe('shell-box-path T016 ready → success', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx?.fiber.dispose()
  })

  it('projects ShellBoxToolCall.outcome=success when readiness=ready and shell runs', async () => {
    ctx = new Context()
    await ctx.plugin(MemorySettings)
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(SandboxedShell)
    const shell = ctx.shell as SandboxedShell
    await ctx.plugin(FakeSubagents)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)

    const scope = registerComputerSettings(ctx, defaultComputerSettings())!
    await commitBoxReadiness(ctx, 'ready')
    const path = installShellBoxPath(ctx, {
      getComputer: () => {
        const live = scope.get()
        return { boxId: live.boxId, readiness: live.readiness, local: live.local }
      },
    })
    registerPathABash(ctx, shell)

    const result = await ctx.tools.execute({
      name: 'bash',
      callId: ToolCallId('t016-ready'),
      arguments: { command: 'echo ok', description: 'Echo ok' },
      signal,
    })

    expect(result.isError).toBe(false)
    expect(result.content[0]).toMatchObject({ type: 'text', text: expect.stringContaining('exit=0') })
    expect(shell.runs).toBe(1)

    const call = path.lastCall()
    expect(call).toMatchObject({
      callId: 't016-ready',
      boxId: DESKTOP_LOCAL_BOX_ID,
      toolName: 'bash',
      outcome: 'success',
      visibility: 'shell-box:success',
      readinessAtInvoke: 'ready',
      local: true,
    })
    expect(call!.modelVisibleText).toContain('exit=0')
    expect(scoresAsSc001Pass(call!)).toBe(true)
  })
})

describe('shell-box-path T017 not-ready ≠ SC-001 Pass', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx?.fiber.dispose()
  })

  it.each([
    'not_ready',
    'starting',
    'failed',
  ] as const satisfies readonly Exclude<BoxReadiness, 'ready'>[])(
    'denies bash when readiness=%s with distinguishable not_ready outcome',
    async (readiness) => {
      ctx = new Context()
      await ctx.plugin(MemorySettings)
      await ctx.plugin(FakeSandbox)
      await ctx.plugin(SandboxedShell)
      const shell = ctx.shell as SandboxedShell
      await ctx.plugin(SystemPrompt)
      await ctx.plugin(ToolRuntime)

      const scope = registerComputerSettings(ctx, defaultComputerSettings())!
      await commitBoxReadiness(ctx, readiness)
      const path = installShellBoxPath(ctx, {
        getComputer: () => {
          const live = scope.get()
          return { boxId: live.boxId, readiness: live.readiness, local: live.local }
        },
      })
      registerPathABash(ctx, shell)

      const result = await ctx.tools.execute({
        name: 'bash',
        callId: ToolCallId(`t017-${readiness}`),
        arguments: { command: 'echo should-not-run', description: 'Blocked' },
        signal,
      })

      expect(shell.runs).toBe(0)
      expect(result.isError).toBe(true)
      expect(result.error).toMatchObject({
        message: expect.stringContaining(readiness),
        info: {
          name: BOX_NOT_READY_ERROR_NAME,
          code: BOX_NOT_READY_CODE,
          reason: readiness,
        },
      })
      expect(result.content[0]?.type === 'text' ? result.content[0].text : '').toContain(readiness)

      const call = path.lastCall()
      expect(call).toMatchObject({
        callId: `t017-${readiness}`,
        toolName: 'bash',
        outcome: 'not_ready',
        visibility: `shell-box:not_ready:${readiness}`,
        readinessAtInvoke: readiness,
        local: true,
      })
      expect(call!.modelVisibleText).toContain(readiness)
      expect(scoresAsSc001Pass(call!)).toBe(false)
    },
  )
})

describe('desktop-computer mounts shell-box gate', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx?.fiber.dispose()
  })

  it('gates bash after composition when readiness is flipped off ready', async () => {
    ctx = new Context()
    await ctx.plugin(MemorySettings)
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(SandboxedShell)
    const shell = ctx.shell as SandboxedShell
    await ctx.plugin(FakeSubagents)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(desktopComputer)
    registerPathABash(ctx, shell)

    expect(ctx.settings.get(COMPUTER_SETTINGS_NAMESPACE)).toMatchObject({ readiness: 'ready' })

    const ready = await ctx.tools.execute({
      name: 'bash',
      callId: ToolCallId('composed-ready'),
      arguments: { command: 'true', description: 'Ready path' },
      signal,
    })
    expect(ready.isError).toBe(false)
    expect(shell.runs).toBe(1)

    await commitBoxReadiness(ctx, 'starting')
    const blocked = await ctx.tools.execute({
      name: 'bash',
      callId: ToolCallId('composed-starting'),
      arguments: { command: 'true', description: 'Blocked path' },
      signal,
    })
    expect(shell.runs).toBe(1)
    expect(blocked.isError).toBe(true)
    expect(blocked.error?.info).toMatchObject({ code: BOX_NOT_READY_CODE, reason: 'starting' })
  })
})
