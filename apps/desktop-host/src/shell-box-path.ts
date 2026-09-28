/**
 * Host Shell/box tool path for P7 US1 (T016/T017).
 * Gates `bash`/`pwsh` on BoxBackend readiness SoT and projects
 * `ShellBoxToolCall` outcomes for Verifier Host half + session-log reconstructability.
 * Electron Main must not own this path; Client UI projection is T018.
 * @module desktop-host/shell-box-path
 */

import type { Context } from '@deepseek-ai/cordis'
import type {
  PreToolDecision,
  ToolExecution,
  ToolExecutionResult,
} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-tools'
import type { BoxReadiness, ComputerSettings } from './computer-settings.ts'
import { DESKTOP_LOCAL_BOX_ID } from './computer-settings.ts'

/** Path A Shell/box model-facing tool names (data-model ShellBoxToolCall.toolName). */
export const SHELL_BOX_TOOL_NAMES = ['bash', 'pwsh'] as const

/** Model-facing Shell/box tool name. */
export type ShellBoxToolName = (typeof SHELL_BOX_TOOL_NAMES)[number]

/** ShellBoxToolCall.outcome (data-model). */
export type ShellBoxOutcome = 'success' | 'error' | 'not_ready'

/** Structured denial identity when BoxBackend is not ready (T017). */
export const BOX_NOT_READY_ERROR_NAME = 'BoxNotReadyError'

/** ToolErrorInfo.code for readiness-gated Shell/box denials. */
export const BOX_NOT_READY_CODE = 'BOX_NOT_READY'

/**
 * One Host-observed Shell/box tool invocation (data-model ShellBoxToolCall).
 * `visibility` is the Host-side user-visible indicator string for Verifier /
 * Client projection — exact marketing copy is not scored (FR-002 / FR-015).
 */
export interface ShellBoxToolCall {
  /** Opaque tool-call id from `dsh-tools`. */
  callId: string
  /** Host box id (`desktop-local` singleton for Pass). */
  boxId: string
  /** Calling bot / agent session id when present; empty when unscoped. */
  botId: string
  /** `bash` or `pwsh`. */
  toolName: ShellBoxToolName
  /** Invocation outcome — Pass needs `success`. */
  outcome: ShellBoxOutcome
  /** User-visible success / not-ready / error indicator (string not scored). */
  visibility: string
  /** BoxBackend.readiness snapshotted at invoke (SoT for SC-001 gating). */
  readinessAtInvoke: BoxReadiness
  /** Whether the Pass path is Host-local (FR-011). */
  local: boolean
  /** Model-visible text blocks reconstructable into a session `tool/result`. */
  modelVisibleText: string
}

/** Live handle for Host Shell/box call projection (Verifier Host half). */
export interface ShellBoxPathHandle {
  /** Chronological Shell/box calls observed since install. */
  listCalls(): readonly ShellBoxToolCall[]
  /** Most recent Shell/box call, if any. */
  lastCall(): ShellBoxToolCall | undefined
}

/** Options for installing the Host Shell/box gate + projection. */
export interface ShellBoxPathOptions {
  /** Read the live Computer settings SoT (readiness + local + boxId). */
  getComputer: () => Pick<ComputerSettings, 'boxId' | 'readiness' | 'local'>
}

/**
 * Whether a Shell/box tool name is on the Path A Pass path.
 * @param name - tool execution name.
 * @returns true for `bash` / `pwsh`.
 */
export function isShellBoxToolName(name: string): name is ShellBoxToolName {
  return (SHELL_BOX_TOOL_NAMES as readonly string[]).includes(name)
}

/**
 * Host-side SC-001 scoring — true only for local + ready + outcome=success.
 * Not-ready / starting / failed / error MUST NOT score as Pass (FR-002).
 * @param call - projected Shell/box tool call.
 * @returns whether Verifier may treat this call as SC-001 Pass evidence.
 */
export function scoresAsSc001Pass(call: ShellBoxToolCall): boolean {
  return call.local === true
    && call.readinessAtInvoke === 'ready'
    && call.outcome === 'success'
}

/**
 * Build the model-facing denial reason for a non-ready backend.
 * @param readiness - current BoxBackend readiness (≠ ready).
 * @returns reason text embedded in the tool error content (session-loggable).
 */
export function boxNotReadyReason(readiness: Exclude<BoxReadiness, 'ready'>): string {
  return `box backend is ${readiness}; Shell/box tools require readiness=ready`
}

/**
 * Visibility string for a ShellBoxToolCall outcome (marketing string not scored).
 * @param outcome - projected outcome.
 * @param readiness - readiness at invoke when outcome is not_ready.
 * @returns short Host indicator for Client / Verifier projection.
 */
export function shellBoxVisibility(
  outcome: ShellBoxOutcome,
  readiness: BoxReadiness,
): string {
  switch (outcome) {
    case 'success':
      return 'shell-box:success'
    case 'not_ready':
      return `shell-box:not_ready:${readiness}`
    case 'error':
      return 'shell-box:error'
  }
}

/**
 * Extract model-visible text from a tool result for session-log reconstructability.
 * @param result - frozen tool execution result.
 * @returns concatenated text blocks (empty when none).
 */
export function modelVisibleTextFromResult(result: ToolExecutionResult): string {
  return result.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
}

/**
 * Project one tools/result into a ShellBoxToolCall.
 * @param exec - tool execution identity.
 * @param result - final tool result (success or error).
 * @param computer - Computer settings snapshot at invoke.
 * @returns ShellBoxToolCall for Host observation.
 */
export function projectShellBoxToolCall(
  exec: Pick<ToolExecution, 'callId' | 'name' | 'agent'>,
  result: ToolExecutionResult,
  computer: Pick<ComputerSettings, 'boxId' | 'readiness' | 'local'>,
): ShellBoxToolCall {
  if (!isShellBoxToolName(exec.name)) {
    throw new Error(`shell-box-path: unexpected tool "${exec.name}"`)
  }
  const readiness = computer.readiness
  const notReadyDenial = result.isError
    && result.error.info?.code === BOX_NOT_READY_CODE
  const outcome: ShellBoxOutcome = notReadyDenial
    ? 'not_ready'
    : result.isError
      ? 'error'
      : 'success'
  const botId = exec.agent?.session.id ?? ''
  return {
    callId: exec.callId,
    boxId: computer.boxId.length > 0 ? computer.boxId : DESKTOP_LOCAL_BOX_ID,
    botId,
    toolName: exec.name,
    outcome,
    visibility: shellBoxVisibility(outcome, readiness),
    readinessAtInvoke: readiness,
    local: computer.local,
    modelVisibleText: modelVisibleTextFromResult(result),
  }
}

/**
 * Install readiness gate + ShellBoxToolCall projection on `bash`/`pwsh`.
 * When readiness ≠ ready, pre-execute denies with BOX_NOT_READY (T017).
 * When ready, tools run normally; success projects outcome=success (T016).
 * @param ctx - Desktop Host context with `tools`.
 * @param options - Computer SoT reader.
 * @returns handle for listing projected calls.
 */
export function installShellBoxPath(ctx: Context, options: ShellBoxPathOptions): ShellBoxPathHandle {
  const tools = ctx.get('tools')
  if (tools === undefined) {
    throw new Error('shell-box-path: ctx.tools is required to gate Path A Shell/box tools')
  }

  const calls: ShellBoxToolCall[] = []
  /** Readiness snapshotted at pre-execute for the matching tools/result. */
  const readinessAtGate = new WeakMap<object, Pick<ComputerSettings, 'boxId' | 'readiness' | 'local'>>()

  ctx.effect(() => {
    const stopPre = ctx.on('tools/pre-execute', async (exec, next): Promise<PreToolDecision> => {
      if (!isShellBoxToolName(exec.name)) return next()
      const computer = options.getComputer()
      readinessAtGate.set(exec, {
        boxId: computer.boxId,
        readiness: computer.readiness,
        local: computer.local,
      })
      if (computer.readiness === 'ready') return next()
      const readiness = computer.readiness
      return {
        kind: 'deny',
        reason: boxNotReadyReason(readiness),
        info: {
          name: BOX_NOT_READY_ERROR_NAME,
          code: BOX_NOT_READY_CODE,
          reason: readiness,
        },
      }
    }, { prepend: true })

    const stopResult = ctx.on('tools/result', (exec, result) => {
      if (!isShellBoxToolName(exec.name)) return
      const computer = readinessAtGate.get(exec) ?? options.getComputer()
      calls.push(projectShellBoxToolCall(exec, result, computer))
    })

    return () => {
      stopPre()
      stopResult()
    }
  }, 'desktop-shell-box-path')

  return {
    listCalls: () => calls,
    lastCall: () => calls.at(-1),
  }
}
