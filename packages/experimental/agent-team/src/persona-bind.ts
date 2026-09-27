/**
 * Bind a Team Bot's durable persona into scoped system-prompt assembly
 * (`deployment:persona-prefix`) so subsequent turns see Host-authored
 * job / voice / anti-jobs (FR-013 / SC-008; clarify lock 1).
 */

import type { Agent } from '@deepseek-ai/dsh-agent'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { BotPersonaProfile } from './types.ts'

/** Mutable Host persona snapshot coupled to one live teammate Agent. */
export interface PersonaBindRef {
  /** Current durable persona; undefined means no Host persona yet. */
  current: BotPersonaProfile | undefined
}

/**
 * Compose Host persona fields into persona-prefix instruction text.
 * Empty job, voice, or antiJobs contribute no prose (FR-013).
 * @param persona - durable Host persona, or undefined when never saved.
 * @returns joined non-empty parts, or `''` when every field is empty.
 */
export function composePersonaPrefix(persona: BotPersonaProfile | undefined): string {
  if (persona === undefined) return ''
  const parts: string[] = []
  if (persona.job.length > 0) parts.push(`Job: ${persona.job}`)
  if (persona.voice.length > 0) parts.push(`Voice: ${persona.voice}`)
  if (persona.antiJobs.length > 0) {
    parts.push(`Anti-jobs:\n- ${persona.antiJobs.join('\n- ')}`)
  }
  return parts.join('\n')
}

/**
 * Register a scoped `deployment:persona-prefix` section that reads {@link PersonaBindRef}.
 * Host-composed text shadows preset / deployment persona for that Agent.
 * The Agent-scoped effect disposes the section with the Agent.
 * @param agent - exact live teammate Agent whose scoped context owns the bind.
 * @param ref - mutable persona snapshot owned by TeamService.
 * @param onDispose - optional cleanup when the Agent-scoped effect ends.
 * @returns the same ref for live updates after Host `updatePersona`.
 */
export function bindTeammatePersona(
  agent: Agent,
  ref: PersonaBindRef,
  onDispose?: () => void,
): PersonaBindRef {
  agent.ctx.effect(() => {
    const disposeSection = agent.ctx.systemPrompt.section({
      name: PERSONA_PREFIX_SECTION,
      order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
      text: () => composePersonaPrefix(ref.current),
    })
    return () => {
      disposeSection()
      onDispose?.()
    }
  }, 'agentTeams.persona')
  return ref
}
