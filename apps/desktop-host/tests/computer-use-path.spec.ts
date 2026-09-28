/** Host computerUse-class path — Pass observation (T020) + spawn handoff (T021). */

import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AttachmentStore, {
  AttachmentId,
  type ImageAttachmentRef,
  type SaveImageAttachment,
  type StoredImageAttachment,
} from '@deepseek-ai/dsh-attachment'
import ComputerUseRegistry from '@deepseek-ai/dsh-computer-use'
import LlmRuntime, {
  LlmAdapter,
  ToolCallId,
  type GenerateOptions,
  type LlmResolvedModelInfo,
  type StreamChunk,
} from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import { SettingsProvider, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import { ShellExecutor } from '@deepseek-ai/dsh-shell'
import type { ShellExecRequest, ShellExecSpec, ShellProcess, ShellRunResult } from '@deepseek-ai/dsh-shell'
import type { SandboxMode } from '@deepseek-ai/dsh-sandbox'
import SubagentRuntime from '@deepseek-ai/dsh-subagent'
import type {
  SubagentCapabilities,
  SubagentProvider,
  SubagentRun,
  SubagentStartRequest,
} from '@deepseek-ai/dsh-subagent'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { defineTool } from '@deepseek-ai/dsh-tools'
import * as desktopComputer from '../src/computer.ts'
import {
  COMPUTER_SETTINGS_NAMESPACE,
  defaultComputerSettings,
  registerComputerSettings,
} from '../src/computer-settings.ts'
import {
  PASS_PROVIDER_NAME,
  PASS_SCREENSHOT_PNG_BASE64,
  PASS_SCREENSHOT_TOOL,
} from '../src/computer-use-pass-fixture.ts'
import * as PassFixture from '../src/computer-use-pass-fixture.ts'
import {
  COMPUTER_USE_CAPABILITY,
  COMPUTER_USE_HANDOFF_VISIBILITY,
  COMPUTER_USE_OBSERVATION_VISIBILITY,
  installComputerUsePath,
  scoresAsSc002Pass,
} from '../src/computer-use-path.ts'

const signal = new AbortController().signal

const IMAGE_LIMITS = {
  maxImageBytes: 1_000_000,
  maxImagesPerMessage: 8,
  maxMessageImageBytes: 8_000_000,
  maxImagePixels: 1_000_000,
  maxImageDimension: 8_192,
  mediaTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const,
}

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

/** Records admitted Pass PNGs for durable observation assertions. */
class RecordingAttachmentStore extends AttachmentStore {
  readonly imageLimits = IMAGE_LIMITS
  readonly saved: SaveImageAttachment[] = []

  validateImage(_input: SaveImageAttachment): Promise<void> {
    return Promise.resolve()
  }

  saveImage(input: SaveImageAttachment): Promise<ImageAttachmentRef> {
    this.saved.push(input)
    const ref: ImageAttachmentRef = {
      attachmentId: AttachmentId(`sha256:${'a'.repeat(64)}`),
      mediaType: input.mediaType,
      bytes: input.data.byteLength,
      width: 1,
      height: 1,
    }
    return Promise.resolve(ref)
  }

  readImage(_ref: ImageAttachmentRef): Promise<StoredImageAttachment> {
    throw new Error('not used')
  }
}

/** Exact-route fake declaring image input for Pass screenshot admission. */
class ImageCatalogAdapter extends LlmAdapter {
  override resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return Promise.resolve({
      provider,
      id: model,
      name: model,
      inputModalities: ['text', 'image'],
    })
  }

  stream(_options: GenerateOptions): AsyncIterable<StreamChunk> {
    throw new Error('computer-use-path tests never stream')
  }
}

/** Minimal parent Agent for Path A spawn start (session id = parentBotId). */
function fakeParent(id = 'parent-bot'): Agent {
  const sessionId = SessionId(id)
  return {
    id: sessionId,
    inject: () => {},
    options: { provider: 'visual', model: 'vision' },
    session: Session.create(sessionId),
  } as unknown as Agent
}

/** Vision-capable agent stand-in for MCP image admission on the Pass tool. */
function visionAgent(id = 'observer'): object {
  return {
    options: { provider: 'visual', model: 'vision' },
    session: {
      id: SessionId(id),
      requestHeader: () => undefined,
    },
  }
}

const SPAWN_CAPS: SubagentCapabilities = {
  agentOptions: true,
  outputSchema: true,
  depthLimit: true,
  toolFilter: true,
  persona: true,
}

/**
 * Path A spawn provider that runs the Pass screenshot tool then returns a
 * parent-visible observation summary (no interactive browser).
 */
function passSpawnProvider(ctx: Context, childId = 'computer-use-child'): SubagentProvider {
  return {
    name: 'spawn',
    capabilities: SPAWN_CAPS,
    inheritsParentContext: false,
    async start(request: SubagentStartRequest): Promise<SubagentRun> {
      const childSession = SessionId(childId)
      const shot = await ctx.tools.execute({
        name: PASS_SCREENSHOT_TOOL,
        callId: ToolCallId(`shot-${childId}`),
        arguments: {},
        signal: request.signal,
        agent: {
          options: request.parent.options,
          session: {
            id: childSession,
            requestHeader: () => undefined,
          },
        } as never,
      })
      const summary = shot.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n')
      return {
        id: childSession,
        localAgent: undefined,
        result: Promise.resolve({
          output: [{
            type: 'text',
            text: summary.length > 0
              ? `computer-use handoff: ${summary}`
              : 'computer-use handoff: observation complete',
          }],
          stopReason: 'completed',
        }),
        dispose: async () => {},
      }
    },
  }
}

describe('computer-use-path T020 Pass observation', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx?.fiber.dispose()
  })

  it('projects ≥1 GUI observation from Pass screenshot without attachment store (equiv OK)', async () => {
    ctx = new Context()
    await ctx.plugin(ComputerUseRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(PassFixture)

    const path = installComputerUsePath(ctx, {
      isComputerUseEnabled: () => true,
      getProviderName: () => ctx.computerUse.providerName,
    })

    const result = await ctx.tools.execute({
      name: PASS_SCREENSHOT_TOOL,
      callId: ToolCallId('t020-equiv'),
      arguments: {},
      signal,
    })
    expect(result.isError).toBe(false)

    const run = path.lastRun()
    expect(run).toMatchObject({
      capabilityClass: COMPUTER_USE_CAPABILITY,
      interactiveBrowser: false,
      observation: {
        callId: 't020-equiv',
        toolName: PASS_SCREENSHOT_TOOL,
        artifactRef: 'equiv:pass-fixture-png',
        durable: false,
        visibility: COMPUTER_USE_OBSERVATION_VISIBILITY,
      },
    })
    expect(run!.observation!.modelVisibleText.length).toBeGreaterThan(0)
    // Observation alone is not SC-002 Pass — handoff required (T021).
    expect(scoresAsSc002Pass(run!)).toBe(false)
  })

  it('projects a durable PNG attachment when image admission is available', async () => {
    ctx = new Context()
    await ctx.plugin(ComputerUseRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(RecordingAttachmentStore)
    await ctx.plugin(LlmRuntime)
    ctx.llm.registerAdapter(['visual'], new ImageCatalogAdapter())
    await ctx.plugin(PassFixture)

    const path = installComputerUsePath(ctx, {
      isComputerUseEnabled: () => true,
      getProviderName: () => ctx.computerUse.providerName,
    })

    const result = await ctx.tools.execute({
      name: PASS_SCREENSHOT_TOOL,
      callId: ToolCallId('t020-durable'),
      arguments: {},
      signal,
      agent: visionAgent('child-obs') as never,
    })
    expect(result.isError).toBe(false)
    expect(result.content.some(block => block.type === 'image')).toBe(true)
    expect((ctx.attachments as RecordingAttachmentStore).saved.length).toBe(1)
    expect((ctx.attachments as RecordingAttachmentStore).saved[0]!.mediaType).toBe('image/png')
    expect(Buffer.from(PASS_SCREENSHOT_PNG_BASE64, 'base64').byteLength)
      .toBe((ctx.attachments as RecordingAttachmentStore).saved[0]!.data.byteLength)

    const run = path.lastRun()
    expect(run?.observation).toMatchObject({
      callId: 't020-durable',
      durable: true,
      visibility: COMPUTER_USE_OBSERVATION_VISIBILITY,
    })
    expect(run!.observation!.artifactRef.startsWith('sha256:')).toBe(true)
  })
})

describe('computer-use-path T021 spawn handoff', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx?.fiber.dispose()
  })

  it('parent spawn path yields ComputerUseRun with observation + handoff (SC-002 Host)', async () => {
    ctx = new Context()
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(ComputerUseRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(RecordingAttachmentStore)
    await ctx.plugin(LlmRuntime)
    ctx.llm.registerAdapter(['visual'], new ImageCatalogAdapter())
    await ctx.plugin(SubagentRuntime)
    await ctx.plugin(PassFixture)
    ctx.subagents.registerProvider(passSpawnProvider(ctx))

    const path = installComputerUsePath(ctx, {
      isComputerUseEnabled: () => true,
      getProviderName: () => ctx.computerUse.providerName,
    })

    const parent = fakeParent('parent-bot')
    const started = await ctx.subagents.start('spawn', {
      parent,
      label: 'computerUse-pass',
      prompt: [{ type: 'text', text: 'Capture a Pass desktop observation screenshot.' }],
      signal,
    })
    const result = await started.result
    expect(result.stopReason).toBe('completed')
    expect(result.output.some(block => block.type === 'text')).toBe(true)

    const run = path.lastPassRun()
    expect(run).toBeDefined()
    expect(scoresAsSc002Pass(run!)).toBe(true)
    expect(run).toMatchObject({
      parentBotId: 'parent-bot',
      childId: 'computer-use-child',
      capabilityClass: COMPUTER_USE_CAPABILITY,
      interactiveBrowser: false,
      observation: {
        toolName: PASS_SCREENSHOT_TOOL,
        durable: true,
        visibility: COMPUTER_USE_OBSERVATION_VISIBILITY,
      },
      handoff: {
        visibility: COMPUTER_USE_HANDOFF_VISIBILITY,
        parentBotId: 'parent-bot',
        childId: 'computer-use-child',
      },
    })
    expect(run!.handoff!.modelVisibleText).toContain('computer-use handoff')
    expect(run!.observation!.artifactRef.startsWith('sha256:')).toBe(true)
    expect(run!.interactiveBrowser).toBe(false)
  })

  it('parent subagent tool result also records handoff visibility', async () => {
    ctx = new Context()
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(ComputerUseRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(SubagentRuntime)
    await ctx.plugin(PassFixture)
    ctx.subagents.registerProvider(passSpawnProvider(ctx, 'tool-child'))

    const path = installComputerUsePath(ctx, {
      isComputerUseEnabled: () => true,
      getProviderName: () => ctx.computerUse.providerName,
    })

    ctx.tools.register(defineTool({
      name: 'subagent',
      description: 'Delegate a computerUse-class observation to a spawn child.',
      parameters: {
        description: { type: 'string', required: true },
        prompt: { type: 'string', required: true },
      },
      output: {
        schema: { type: 'string' },
        render: (_args, value) => [{ type: 'text', text: value }],
      },
      async execute(args: { description: string; prompt: string }, exec) {
        const parent = exec.agent ?? fakeParent('tool-parent')
        const started = await ctx.subagents.start('spawn', {
          parent: parent as Agent,
          label: args.description,
          prompt: [{ type: 'text', text: args.prompt }],
          signal: exec.signal,
        })
        const child = await started.result
        const text = child.output
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n')
        return text.length > 0 ? text : 'computer-use handoff: ok'
      },
    }))

    const parent = fakeParent('tool-parent')
    const result = await ctx.tools.execute({
      name: 'subagent',
      callId: ToolCallId('t021-tool'),
      arguments: {
        description: 'computerUse observation',
        prompt: 'Take a Pass screenshot.',
      },
      signal,
      agent: parent,
    })
    expect(result.isError).toBe(false)
    expect(result.content[0]).toMatchObject({ type: 'text', text: expect.stringContaining('computer-use handoff') })

    const run = path.lastPassRun()
    expect(run).toBeDefined()
    expect(scoresAsSc002Pass(run!)).toBe(true)
    expect(run!.handoff?.visibility).toBe(COMPUTER_USE_HANDOFF_VISIBILITY)
    expect(run!.observation?.toolName).toBe(PASS_SCREENSHOT_TOOL)
  })
})

describe('desktop-computer mounts computerUse path', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx?.fiber.dispose()
  })

  it('composition registers Pass provider and keeps Pass screenshot tool', async () => {
    ctx = new Context()
    await ctx.plugin(MemorySettings)
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(SandboxedShell)
    await ctx.plugin(FakeSubagents)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(desktopComputer)

    expect(ctx.computerUse.providerName).toBe(PASS_PROVIDER_NAME)
    expect(ctx.settings.get(COMPUTER_SETTINGS_NAMESPACE)).toMatchObject({
      computerUseEnabled: true,
      readiness: 'ready',
    })

    const result = await ctx.tools.execute({
      name: PASS_SCREENSHOT_TOOL,
      callId: ToolCallId('composed-obs'),
      arguments: {},
      signal,
    })
    expect(result.isError).toBe(false)
    expect(ctx.tools.schemas().map(tool => tool.name)).toContain(PASS_SCREENSHOT_TOOL)
  })

  it('skips ComputerUseRun projection when computerUseEnabled is false', async () => {
    ctx = new Context()
    await ctx.plugin(MemorySettings)
    await ctx.plugin(FakeSandbox)
    await ctx.plugin(SandboxedShell)
    await ctx.plugin(FakeSubagents)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    const scope = registerComputerSettings(ctx, defaultComputerSettings())!
    await scope.update({ computerUseEnabled: false, readiness: 'ready' })

    await ctx.plugin(ComputerUseRegistry)
    await ctx.plugin(PassFixture)
    const path = installComputerUsePath(ctx, {
      isComputerUseEnabled: () => scope.get().computerUseEnabled,
      getProviderName: () => ctx.computerUse.providerName,
    })

    await ctx.tools.execute({
      name: PASS_SCREENSHOT_TOOL,
      callId: ToolCallId('disabled'),
      arguments: {},
      signal,
    })
    expect(path.listRuns()).toHaveLength(0)
  })
})
