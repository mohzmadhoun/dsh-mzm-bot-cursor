/**
 * Pure computerUse-class parent handoff projection for subagent conversation
 * cards (P7 T022). Derives parent-visible progress/result from Host-session
 * `subagent` Tool blocks over HTTP/WS — never Electron Main SoT. Host may stamp
 * `capabilityClass` / handoff meta (US2 T021); Client also treats args that
 * name the computerUse observation path as a running-path signal (SC-002).
 * @module
 */
import type { ToolCallBlock } from '@deepseek-ai/dsh-client-ui-chat/client'
import { parsedToolCall } from './raw-tool-call.ts'

/** User-visible ComputerUseRun.handoff status for Verifier / SC-002. */
export type ComputerUseHandoffStatus = 'running' | 'handoff' | 'error'

/**
 * Projected parent handoff for a computerUse-class subagent Tool card.
 * `childId` is the durable child handle when Host returned one (continuable /
 * background); optional for one-shot foreground handoffs.
 */
export interface ComputerUseHandoff {
  status: ComputerUseHandoffStatus
  /** Opaque child / job id when present in Host result text or meta. */
  childId: string | null
}

/** Default Path A model-facing subagent tool name. */
const SUBAGENT_TOOL = 'subagent'

/**
 * True when Host meta marks this subagent path as computerUse-class.
 * @param meta - opaque result metadata (settled) or undefined while running.
 * @returns whether Host stamped computerUse capability / handoff identity.
 */
function metaMarksComputerUse(meta: unknown): boolean {
  if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) return false
  const record = meta as Record<string, unknown>
  if (record.capabilityClass === 'computerUse') return true
  if (record.computerUseHandoff === true || record.handoff === true) return true
  if (typeof record.computerUseHandoff === 'string' && record.computerUseHandoff !== '') {
    return true
  }
  if (typeof record.handoff === 'string' && record.handoff !== '') return true
  if (typeof record.handoff === 'object' && record.handoff !== null) return true
  const run = record.computerUseRun
  if (typeof run === 'object' && run !== null && !Array.isArray(run)) {
    const fields = run as Record<string, unknown>
    if (fields.capabilityClass === 'computerUse') return true
    if (fields.handoff !== undefined && fields.handoff !== null) return true
  }
  return false
}

/**
 * True when call args describe a computerUse-class delegation (Host / model prompt).
 * Secondary signal while running (no settled meta yet) and for Hosts that stamp
 * the class only in the delegation description.
 * @param block - running or settled Tool block.
 * @returns whether args mention computerUse observation path.
 */
function argsMarkComputerUse(block: ToolCallBlock): boolean {
  const parsed = parsedToolCall(block)
  if (parsed === null) return false
  for (const key of ['description', 'prompt'] as const) {
    const value = parsed.args[key]
    if (typeof value !== 'string') continue
    const lower = value.toLowerCase()
    if (
      lower.includes('computeruse')
      || lower.includes('computer use')
      || lower.includes('computer_use')
      || lower.includes('pass_screenshot')
      || lower.includes('screenshot observation')
    ) {
      return true
    }
  }
  return false
}

/**
 * True when the wire tool name is the Path A subagent delegation tool.
 * @param toolName - dispatch-supplied tool name.
 * @returns whether subagent handoff projection may apply.
 */
export function isSubagentTool(toolName: string): boolean {
  return toolName === SUBAGENT_TOOL
}

/**
 * Read an opaque child / job id from Host meta or settled result text.
 * @param block - settled Tool result.
 * @returns child id when found, else null.
 */
function childIdFrom(block: Extract<ToolCallBlock, { kind: string }>): string | null {
  const meta = block.meta
  if (typeof meta === 'object' && meta !== null && !Array.isArray(meta)) {
    const record = meta as Record<string, unknown>
    for (const key of ['childId', 'subagentId', 'runId', 'jobId'] as const) {
      const value = record[key]
      if (typeof value === 'string' && value !== '') return value
    }
    const run = record.computerUseRun
    if (typeof run === 'object' && run !== null && !Array.isArray(run)) {
      const fields = run as Record<string, unknown>
      for (const key of ['childId', 'runId'] as const) {
        const value = fields[key]
        if (typeof value === 'string' && value !== '') return value
      }
    }
  }
  for (const part of block.content) {
    if (part.type !== 'text' || typeof part.text !== 'string') continue
    const started = /started (?:subagent|background subagent job) (\S+)/u.exec(part.text)
    if (started?.[1]) return started[1]
  }
  return null
}

/**
 * Derive computerUse-class parent handoff for a subagent Tool block.
 * Returns null for non-subagent tools and for ordinary subagent paths that Host
 * did not mark as computerUse-class.
 * @param toolName - wire tool name.
 * @param block - running or settled Tool block from the Host session log.
 * @returns projected handoff, or null when computerUse handoff does not apply.
 */
export function computerUseHandoff(
  toolName: string,
  block: ToolCallBlock,
): ComputerUseHandoff | null {
  if (!isSubagentTool(toolName)) return null
  const settled = 'kind' in block
  const marked = argsMarkComputerUse(block)
    || (settled && metaMarksComputerUse(block.meta))
  if (!marked) return null
  if (!settled) {
    return { status: 'running', childId: null }
  }
  if (block.isError) {
    return { status: 'error', childId: childIdFrom(block) }
  }
  return { status: 'handoff', childId: childIdFrom(block) }
}
