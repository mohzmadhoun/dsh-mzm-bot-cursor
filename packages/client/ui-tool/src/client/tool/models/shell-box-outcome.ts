/**
 * Pure Shell/box tool outcome projection for bash/pwsh conversation cards (P7 T018).
 * Derives user-visible success / not_ready / error from Host-session Tool blocks —
 * never Electron Main SoT. Host may stamp `meta.outcome` / `meta.shellBoxOutcome`
 * (US1 T017); Client also recognizes documented not-ready error codes.
 * @module
 */
import type { ToolCallBlock, ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import { parsedToolCall } from './raw-tool-call.ts'
import { terminalCardModel, terminalFailed } from './terminal-card-model.ts'

/** Shell/box tool names that project Path A local backend outcomes. */
const SHELL_BOX_TOOLS = new Set(['bash', 'pwsh'])

/** User-visible ShellBoxToolCall.outcome values (data-model). */
export type ShellBoxOutcome = 'success' | 'error' | 'not_ready'

/** Host error codes that mean the box/backend was not ready (FR-002). */
const NOT_READY_ERROR_CODES = new Set([
  'BOX_NOT_READY',
  'SANDBOX_UNAVAILABLE',
  'SHELL_BOX_NOT_READY',
])

/**
 * True when the wire tool name is a Shell/box Pass tool (`bash` / `pwsh`).
 * @param toolName - dispatch-supplied tool name.
 * @returns whether Shell/box outcome projection applies.
 */
export function isShellBoxTool(toolName: string): boolean {
  return SHELL_BOX_TOOLS.has(toolName)
}

/**
 * Narrow Host-persisted meta for an explicit Shell/box outcome stamp.
 * @param meta - opaque result metadata.
 * @returns outcome when Host stamped one, else null.
 */
function metaOutcome(meta: unknown): ShellBoxOutcome | null {
  if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) return null
  const record = meta as Record<string, unknown>
  const stamped = record.shellBoxOutcome ?? record.outcome
  if (stamped === 'success' || stamped === 'error' || stamped === 'not_ready') return stamped
  const readiness = record.boxReadiness ?? record.readiness
  if (
    readiness === 'not_ready'
    || readiness === 'starting'
    || readiness === 'failed'
  ) {
    return 'not_ready'
  }
  return null
}

/**
 * True when a settled error result names a not-ready / sandbox-unavailable code.
 * @param block - settled Tool result.
 * @returns whether the error is a readiness Fail, not a command failure.
 */
function isNotReadyError(block: ToolResultNode): boolean {
  const code = block.error?.code
  if (typeof code === 'string' && NOT_READY_ERROR_CODES.has(code)) return true
  const name = block.error?.name
  if (typeof name === 'string' && (name === 'BoxNotReadyError' || NOT_READY_ERROR_CODES.has(name))) {
    return true
  }
  for (const part of block.content) {
    if (part.type !== 'text') continue
    for (const marker of NOT_READY_ERROR_CODES) {
      if (part.text.includes(marker)) return true
    }
  }
  return false
}

/**
 * Derive Shell/box outcome for a bash/pwsh Tool block (null while running or for other tools).
 * @param toolName - wire tool name.
 * @param block - running or settled Tool block from the Host session log.
 * @returns projected outcome, or null when no settled Shell/box indicator applies.
 */
export function shellBoxOutcome(toolName: string, block: ToolCallBlock): ShellBoxOutcome | null {
  if (!isShellBoxTool(toolName)) return null
  if (!('kind' in block)) return null
  const stamped = metaOutcome(block.meta)
  if (stamped !== null) return stamped
  if (block.isError) return isNotReadyError(block) ? 'not_ready' : 'error'
  // Interrupted / cancelled settles without isError in some paths — treat as error, not success.
  if (block.error?.code === 'interrupted') return 'error'
  // Background acknowledgements and malformed calls are not SC-001 success.
  const parsed = parsedToolCall(block)
  if (parsed !== null && parsed.args.run_in_background === true) return null
  const terminal = terminalCardModel(block)
  if (terminal !== null && terminalFailed(terminal)) return 'error'
  return 'success'
}
