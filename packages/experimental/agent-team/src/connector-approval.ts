/**
 * Host connector-tool approval gate (P6 US3 T026 / FR-006).
 *
 * When `ctx.approval` is mounted, every `invokeConnectorTool` asks
 * `dsh-user-approval` before MCP execute. Standing policy `never` and
 * answerer `rejected` both map to Host-observable `outcome=denied`
 * (Architect Path A either-OK). Missing approval composition keeps the
 * pre-T026 allow path so unit fixtures without the service still pass US1.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ToolCallId } from '@deepseek-ai/dsh-llm'
import type { Session } from '@deepseek-ai/dsh-session'
import { SessionSeq } from '@deepseek-ai/dsh-session'
import type { ApprovalOutcome } from '@deepseek-ai/dsh-user-approval'
import type {} from '@deepseek-ai/dsh-user-approval'

/** Allow the connector tool execute after an approval grant. */
export type ConnectorToolApprovalAllow = { readonly kind: 'allow' }

/** Host-observable deny — tool MUST NOT execute as success (FR-006). */
export type ConnectorToolApprovalDenied = {
  readonly kind: 'denied'
  readonly detail: string
}

/** Closed gate result for {@link gateConnectorToolApproval}. */
export type ConnectorToolApprovalDecision =
  | ConnectorToolApprovalAllow
  | ConnectorToolApprovalDenied

/**
 * Whether the session log currently sits inside an open turn
 * (`turn/start` without a later `turn/end`) — the approval.request precondition.
 * @param session - session whose log is scanned newest-first.
 * @returns true when an open turn encloses the next approval audit pair.
 */
export function sessionHasOpenTurn(session: Session): boolean {
  for (let seq = session.seq - 1; seq >= 0; seq -= 1) {
    const type = session.eventAt(SessionSeq(seq))?.type
    if (type === 'turn/start') return true
    if (type === 'turn/end') return false
  }
  return false
}

/**
 * Next monotonic turn number for a Host-opened approval audit turn.
 * @param session - session whose turn boundaries are scanned.
 * @returns one greater than the highest logged turn, or `1` when none exist.
 */
export function nextSessionTurn(session: Session): number {
  let next = 1
  for (const event of session.snapshotEvents()) {
    if (event.type === 'turn/start' || event.type === 'turn/end') {
      next = Math.max(next, event.data.turn + 1)
    }
  }
  return next
}

/**
 * Open a Host-owned audit turn when the caller's session is idle or between turns.
 * Approval audit events must be turn-enclosed; Host RPC may call outside the loop.
 * @param session - caller's session receiving the approval audit pair.
 * @returns disposer that closes the synthetic turn, or `undefined` when already open.
 */
export function beginApprovalAuditTurn(session: Session): (() => void) | undefined {
  if (sessionHasOpenTurn(session)) return undefined
  const turn = nextSessionTurn(session)
  session.append('turn/start', { turn })
  return () => {
    session.append('turn/end', { turn, reason: { kind: 'completed' } })
  }
}

/**
 * Map a closed {@link ApprovalOutcome} to Host connector-tool allow/deny.
 * @param toolName - public tool name for deny detail.
 * @param outcome - closed approval outcome from `ctx.approval.request`.
 * @returns allow only for `allowed-once`; every other outcome is denied.
 */
export function mapApprovalOutcomeToConnectorGate(
  toolName: string,
  outcome: ApprovalOutcome,
): ConnectorToolApprovalDecision {
  switch (outcome) {
    case 'allowed-once':
      return { kind: 'allow' }
    case 'rejected':
      return {
        kind: 'denied',
        detail: `connector tool "${toolName}" denied (user-deny or standing never)`,
      }
    case 'cancelled':
      return {
        kind: 'denied',
        detail: `connector tool "${toolName}" approval cancelled`,
      }
    case 'unavailable':
      return {
        kind: 'denied',
        detail: `connector tool "${toolName}" requires approval, but no approval channel is available`,
      }
    default: {
      const _exhaustive: never = outcome
      return _exhaustive
    }
  }
}

/**
 * Gate one connector tool invoke through `dsh-user-approval` when composed.
 * @param ctx - Host context that may mount `ctx.approval`.
 * @param request - agent, tool identity, call id, and cancellation for the ask.
 * @returns allow to proceed with MCP execute, or denied without executing.
 */
export async function gateConnectorToolApproval(
  ctx: Context,
  request: {
    readonly agent: Agent
    readonly toolName: string
    readonly callId: ToolCallId
    readonly signal: AbortSignal
  },
): Promise<ConnectorToolApprovalDecision> {
  const approval = ctx.get('approval')
  if (approval === undefined) return { kind: 'allow' }
  const endTurn = beginApprovalAuditTurn(request.agent.session)
  try {
    const outcome = await approval.request({
      agent: request.agent,
      toolName: request.toolName,
      callId: request.callId,
      reason: 'connector tool invoke requires approval',
      signal: request.signal,
    })
    return mapApprovalOutcomeToConnectorGate(request.toolName, outcome)
  } finally {
    endTurn?.()
  }
}
