/**
 * Bind a Team Bot's durable {@link ModelSelection} onto its live Agent via
 * `installModelSelection` so subsequent chats keep that bot's assignment only.
 */

import type { Agent, ModelSelection, ModelSelectionRef } from '@deepseek-ai/dsh-agent'
import { installModelSelection } from '@deepseek-ai/dsh-agent'
import type { TeamMemberSnapshot } from './types.ts'

/**
 * Resolve the ModelSelection to install for one teammate Agent.
 * Prefers the durable Host roster row; falls back to create-time Agent options
 * for teammates whose snapshot predates the modelSelection field.
 * @param agent - exact live teammate Agent.
 * @param member - durable Team member row when known.
 * @returns the assignment to bind, or undefined when none is retained.
 */
export function resolveTeammateModelSelection(
  agent: Agent,
  member: TeamMemberSnapshot | undefined,
): ModelSelection | undefined {
  if (member?.modelSelection !== undefined) {
    return {
      provider: member.modelSelection.provider,
      model: member.modelSelection.model,
      ...member.modelSelection.reasoningEffort === undefined
        ? {}
        : { reasoningEffort: member.modelSelection.reasoningEffort },
    }
  }
  const { provider, model, reasoningEffort } = agent.options
  if (provider === undefined || model === undefined) return undefined
  return {
    provider,
    model,
    ...reasoningEffort === undefined ? {} : { reasoningEffort },
  }
}

/**
 * Install {@link installModelSelection} on one teammate Agent for its assignment.
 * The Agent-scoped effect disposes the waterfall listeners with the Agent.
 * @param agent - exact live teammate Agent whose scoped context owns the bind.
 * @param selection - durable or create-time ModelSelection for this Bot.
 * @returns the mutable selection ref coupled to prompt assembly and request routing.
 */
export function bindTeammateModelSelection(
  agent: Agent,
  selection: ModelSelection,
): ModelSelectionRef {
  const ref: ModelSelectionRef = {
    current: {
      provider: selection.provider,
      model: selection.model,
      ...selection.reasoningEffort === undefined
        ? {}
        : { reasoningEffort: selection.reasoningEffort },
    },
    assembled: undefined,
  }
  agent.ctx.effect(() => installModelSelection(agent.ctx, ref), 'agentTeams.modelSelection')
  return ref
}
