/**
 * Host computerUse-class path for P7 US2 (T020/T021).
 * Projects `ComputerUseRun` from Pass-fixture screenshot observation +
 * spawn-class subagent parent handoff. Screenshot-only Pass; interactive
 * browser is never required. Electron Main must not own this path; Client
 * projection of artifacts is T022.
 * @module desktop-host/computer-use-path
 */

import type { Context } from '@deepseek-ai/cordis'
import { carrierKeyOf } from '@deepseek-ai/dsh-scope'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type {
  ToolExecution,
  ToolExecutionResult,
} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-subagent'
import {
  PASS_PROVIDER_NAME,
  PASS_SCREENSHOT_TOOL,
} from './computer-use-pass-fixture.ts'

/** Product capability class for box GUI observation (data-model ComputerUseRun). */
export const COMPUTER_USE_CAPABILITY = 'computerUse' as const

/** Parent-visible handoff indicator (marketing string not scored — FR-015). */
export const COMPUTER_USE_HANDOFF_VISIBILITY = 'computer-use:handoff'

/** Observation indicator when a Pass screenshot (or equiv.) was recorded. */
export const COMPUTER_USE_OBSERVATION_VISIBILITY = 'computer-use:observation'

/** Parent model-facing tools that surface spawn-class handoff to the parent. */
export const COMPUTER_USE_PARENT_HANDOFF_TOOLS = ['subagent'] as const

/**
 * One GUI observation artifact from the computerUse Pass path (FR-003).
 * Prefer durable image attachment refs; otherwise an `equiv:` token still
 * counts as a Host-visible GUI artifact (screenshot-only Pass).
 */
export interface ComputerUseObservation {
  /** Opaque tool-call id from `dsh-tools`. */
  callId: string
  /** Model-facing observation tool name. */
  toolName: string
  /**
   * Durable `attachmentId` when image admission succeeded; otherwise
   * `equiv:<kind>` for a non-attachment GUI artifact still usable for Pass.
   */
  artifactRef: string
  /** True when content carried a durable image attachment. */
  durable: boolean
  /** Host indicator string (not scored). */
  visibility: string
  /** Model-visible text reconstructable into a session `tool/result`. */
  modelVisibleText: string
}

/** Parent-visible progress/result indicator for one ComputerUseRun (FR-003/015). */
export interface ComputerUseHandoff {
  /** Host indicator string (not scored). */
  visibility: string
  /** Parent bot / agent session id. */
  parentBotId: string
  /** Child subagent session id. */
  childId: string
  /** Opaque subagent run id. */
  runId: string
  /** Model-visible handoff text from child output / parent tool result. */
  modelVisibleText: string
}

/**
 * One Host-observed computerUse-class subagent execution (data-model ComputerUseRun).
 * Pass needs observation + handoff; `interactiveBrowser` must not be required true.
 */
export interface ComputerUseRun {
  /** Opaque run id (subagent lifecycle id when spawn-backed). */
  runId: string
  /** Parent bot / agent session id. */
  parentBotId: string
  /** Child subagent session id (empty for observation-only staging). */
  childId: string
  /** Capability class — box GUI observation. */
  capabilityClass: typeof COMPUTER_USE_CAPABILITY
  /** ≥1 screenshot / equiv. GUI artifact when present. */
  observation?: ComputerUseObservation
  /** Parent-visible handoff when present. */
  handoff?: ComputerUseHandoff
  /** Always false for screenshot-only Pass (FR-003 / R0). */
  interactiveBrowser: false
}

/** Live handle for Host computerUse-class run projection (Verifier Host half). */
export interface ComputerUsePathHandle {
  /** Chronological ComputerUseRun projections since install. */
  listRuns(): readonly ComputerUseRun[]
  /** Most recent run, if any. */
  lastRun(): ComputerUseRun | undefined
  /**
   * Most recent run that satisfies SC-002 Host scoring, if any.
   * @returns Pass-scoring run or `undefined`.
   */
  lastPassRun(): ComputerUseRun | undefined
}

/** Options for installing the Host computerUse-class projection. */
export interface ComputerUsePathOptions {
  /** Whether Computer use is enabled on the Host settings SoT. */
  isComputerUseEnabled: () => boolean
  /**
   * Current exclusive `ctx.computerUse` provider name, when registered.
   * Observation projection requires the Pass fixture (or a future Cua swap).
   */
  getProviderName: () => string | undefined
}

/**
 * Host-side SC-002 scoring — observation + parent handoff; interactive browser
 * must not be required true. Parent text without GUI artifact fails.
 * @param run - projected ComputerUseRun.
 * @returns whether Verifier may treat this run as SC-002 Pass evidence (Host half).
 */
export function scoresAsSc002Pass(run: ComputerUseRun): boolean {
  return run.capabilityClass === COMPUTER_USE_CAPABILITY
    && run.observation !== undefined
    && run.handoff !== undefined
    && run.interactiveBrowser === false
}

/**
 * Whether a tool name is a parent-facing spawn handoff surface.
 * @param name - tool execution name.
 * @returns true for Path A `subagent` (tool-subagent default).
 */
export function isComputerUseParentHandoffTool(name: string): boolean {
  return (COMPUTER_USE_PARENT_HANDOFF_TOOLS as readonly string[]).includes(name)
}

/**
 * Extract model-visible text from content blocks for session-log reconstructability.
 * @param content - tool or assistant content blocks.
 * @returns concatenated text blocks (empty when none).
 */
export function modelVisibleTextFromContent(content: readonly ContentBlock[]): string {
  return content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
}

/**
 * Project a Pass screenshot (or equiv.) tool result into a ComputerUseObservation.
 * @param exec - tool execution identity.
 * @param result - final tool result after image finalize.
 * @returns observation when the tool is the Pass screenshot tool; otherwise undefined.
 */
export function projectComputerUseObservation(
  exec: Pick<ToolExecution, 'callId' | 'name'>,
  result: ToolExecutionResult,
): ComputerUseObservation | undefined {
  if (exec.name !== PASS_SCREENSHOT_TOOL) return undefined
  if (result.isError) return undefined

  const durableImage = result.content.find(
    (block): block is Extract<ContentBlock, { type: 'image' }> => block.type === 'image',
  )
  if (durableImage !== undefined) {
    return {
      callId: exec.callId,
      toolName: PASS_SCREENSHOT_TOOL,
      artifactRef: durableImage.attachment.attachmentId,
      durable: true,
      visibility: COMPUTER_USE_OBSERVATION_VISIBILITY,
      modelVisibleText: modelVisibleTextFromContent(result.content),
    }
  }

  // Screenshot-only Pass still admits an equivalent GUI artifact when image
  // admission is unavailable: raw MCP image remains in `value`, and the tool
  // returns model-visible text (diagnostic or Pass fixture copy).
  const raw = result.value
  const hasRawImage = isRecord(raw)
    && Array.isArray(raw.content)
    && raw.content.some(block => isRecord(block) && block.type === 'image')
  const text = modelVisibleTextFromContent(result.content)
  if (!hasRawImage && text.length === 0) return undefined

  return {
    callId: exec.callId,
    toolName: PASS_SCREENSHOT_TOOL,
    artifactRef: hasRawImage ? 'equiv:pass-fixture-png' : 'equiv:pass-fixture-text',
    durable: false,
    visibility: COMPUTER_USE_OBSERVATION_VISIBILITY,
    modelVisibleText: text,
  }
}

/**
 * Host-side SC-002 readiness for the active Pass provider slot.
 * @param providerName - current `ctx.computerUse.providerName`.
 * @returns true when the Host Pass fixture owns the exclusive slot.
 */
export function isPassComputerUseProvider(providerName: string | undefined): boolean {
  return providerName === PASS_PROVIDER_NAME
}

/**
 * Install ComputerUseRun projection for Pass screenshot + spawn-class handoff.
 * Opens a run on `subagent/start` (provider `spawn`) when Computer use is enabled;
 * attaches observation from `computer_use_pass_screenshot`; attaches handoff from
 * `subagent/end` and/or parent `subagent` tool results.
 * @param ctx - Desktop Host context with `tools` (+ `subagents` when spawn runs).
 * @param options - Computer use enablement + provider reader.
 * @returns handle for listing projected runs.
 */
export function installComputerUsePath(ctx: Context, options: ComputerUsePathOptions): ComputerUsePathHandle {
  const tools = ctx.get('tools')
  if (tools === undefined) {
    throw new Error('computer-use-path: ctx.tools is required to project Pass observations')
  }

  const runs: ComputerUseRun[] = []
  /** child session id → run index in `runs`. */
  const byChild = new Map<string, number>()
  /** runId → run index in `runs`. */
  const byRunId = new Map<string, number>()

  const runAt = (index: number): ComputerUseRun | undefined => runs.at(index)

  const upsert = (run: ComputerUseRun, index: number | undefined): number => {
    if (index === undefined) {
      const next = runs.length
      runs.push(run)
      byRunId.set(run.runId, next)
      if (run.childId.length > 0) byChild.set(run.childId, next)
      return next
    }
    runs[index] = run
    byRunId.set(run.runId, index)
    if (run.childId.length > 0) byChild.set(run.childId, index)
    return index
  }

  ctx.effect(() => {
    const stopStart = ctx.on('subagent/start', function (info) {
      if (info.provider !== 'spawn') return
      if (!options.isComputerUseEnabled()) return
      if (!isPassComputerUseProvider(options.getProviderName())) return
      const parent = carrierKeyOf(this) as { session?: { id?: string } } | undefined
      const parentBotId = typeof parent?.session?.id === 'string' ? parent.session.id : ''
      upsert({
        runId: info.runId,
        parentBotId,
        childId: info.id,
        capabilityClass: COMPUTER_USE_CAPABILITY,
        interactiveBrowser: false,
      }, undefined)
    })

    const stopEnd = ctx.on('subagent/end', function (info) {
      const index = byRunId.get(info.runId)
      if (index === undefined) return
      const current = runAt(index)
      if (current === undefined) return
      const parent = carrierKeyOf(this) as { session?: { id?: string } } | undefined
      const parentBotId = typeof parent?.session?.id === 'string'
        ? parent.session.id
        : current.parentBotId
      const modelVisibleText = info.lastAssistantMessage === undefined
        ? ''
        : modelVisibleTextFromContent(info.lastAssistantMessage)
      upsert({
        ...current,
        parentBotId: parentBotId.length > 0 ? parentBotId : current.parentBotId,
        handoff: {
          visibility: COMPUTER_USE_HANDOFF_VISIBILITY,
          parentBotId: parentBotId.length > 0 ? parentBotId : current.parentBotId,
          childId: info.id,
          runId: info.runId,
          modelVisibleText,
        },
      }, index)
    })

    const stopResult = ctx.on('tools/result', (exec, result) => {
      if (!options.isComputerUseEnabled()) return
      if (!isPassComputerUseProvider(options.getProviderName())) return

      const observation = projectComputerUseObservation(exec, result)
      if (observation !== undefined) {
        const childId = exec.agent?.session.id ?? ''
        const index = childId.length > 0 ? byChild.get(childId) : undefined
        if (index !== undefined) {
          const current = runAt(index)
          if (current === undefined) return
          upsert({ ...current, observation }, index)
        } else {
          // Observation before / outside an open spawn run — stage a run so
          // T020 Host half can still prove ≥1 GUI artifact independently.
          const runId = `observation:${exec.callId}`
          upsert({
            runId,
            parentBotId: '',
            childId,
            capabilityClass: COMPUTER_USE_CAPABILITY,
            observation,
            interactiveBrowser: false,
          }, undefined)
        }
        return
      }

      if (!isComputerUseParentHandoffTool(exec.name) || result.isError) return
      const parentBotId = exec.agent?.session.id ?? ''
      // Prefer the latest open spawn run for this parent that still lacks handoff.
      let index: number | undefined
      for (let i = runs.length - 1; i >= 0; i -= 1) {
        const candidate = runAt(i)
        if (candidate === undefined) continue
        if (candidate.handoff !== undefined) continue
        if (parentBotId.length > 0 && candidate.parentBotId.length > 0 && candidate.parentBotId !== parentBotId) {
          continue
        }
        index = i
        break
      }
      if (index === undefined) return
      const current = runAt(index)
      if (current === undefined) return
      const modelVisibleText = modelVisibleTextFromContent(result.content)
      upsert({
        ...current,
        parentBotId: parentBotId.length > 0 ? parentBotId : current.parentBotId,
        handoff: {
          visibility: COMPUTER_USE_HANDOFF_VISIBILITY,
          parentBotId: parentBotId.length > 0 ? parentBotId : current.parentBotId,
          childId: current.childId,
          runId: current.runId,
          modelVisibleText,
        },
      }, index)
    })

    return () => {
      stopStart()
      stopEnd()
      stopResult()
    }
  }, 'desktop-computer-use-path')

  return {
    listRuns: () => runs,
    lastRun: () => runs.at(-1),
    lastPassRun: () => {
      for (let i = runs.length - 1; i >= 0; i -= 1) {
        const run = runAt(i)
        if (run !== undefined && scoresAsSc002Pass(run)) return run
      }
      return undefined
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
