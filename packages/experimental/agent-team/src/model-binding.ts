/**
 * Pin a teammate activation to the ModelSelection recorded at Bot create.
 * @module @deepseek-ai/dsh-experimental-agent-team/model-binding
 */

import type { Agent, ModelSelection, ModelSelectionRef } from '@deepseek-ai/dsh-agent'
import { installModelSelection } from '@deepseek-ai/dsh-agent'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { foldSubagentDescriptor } from '@deepseek-ai/dsh-subagent'

/** Activations that already route through their recorded assignment. */
const installed = new WeakSet<Agent>()

/**
 * Read the provider, model, and optional effort stored on a continuable child.
 * @param events - the child session's own events.
 * @returns the recorded assignment, or undefined when the child has no route.
 */
export function botModelSelection(events: readonly SessionEvent[]): ModelSelection | undefined {
  const descriptor = foldSubagentDescriptor(events)
  if (descriptor?.mode !== 'continuable') return undefined
  const provider = descriptor.agentProvider
  const model = descriptor.agentModel
  if (provider === undefined || model === undefined) return undefined
  return descriptor.agentReasoningEffort === undefined
    ? { provider, model }
    : { provider, model, reasoningEffort: descriptor.agentReasoningEffort }
}

/**
 * Install one teammate's recorded ModelSelection for this activation.
 * Later chats on the activation assemble and route through that assignment,
 * including after a cold resume rebuilt the child.
 * @param agent - published teammate whose descriptor records the assignment.
 * @returns whether this call installed the assignment.
 */
export function bindBotModelSelection(agent: Agent): boolean {
  if (installed.has(agent)) return false
  const selection = botModelSelection(agent.session.ownEvents())
  if (selection === undefined) return false
  installed.add(agent)
  const ref: ModelSelectionRef = { current: selection, assembled: undefined }
  agent.ctx.effect(() => installModelSelection(agent.ctx, ref), 'agentTeams.botModelSelection')
  return true
}
