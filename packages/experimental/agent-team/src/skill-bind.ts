/**
 * Bind a Team Bot's attached skill instructional bodies into scoped
 * system-prompt assembly (`agent-teams:skill-instructions`) so subsequent
 * turns see Host-attached skill text (FR-014 / SC-007; Candidate B).
 *
 * Sibling to P2 {@link bindTeammatePersona}; does not overwrite persona prefix.
 * Verifier observes assembly wiring — not LLM reply wording (clarify lock 5).
 */

import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-system-prompt'

/**
 * Scoped system-prompt section that carries attached skill instructional bodies.
 * Distinct from `deployment:persona-prefix` / `deployment:persona-suffix`.
 */
export const SKILL_INSTRUCTIONS_SECTION = 'agent-teams:skill-instructions'

/** Mutable Host skill-instruction snapshot coupled to one live teammate Agent. */
export interface SkillBindRef {
  /**
   * Pre-composed instructional text for this Bot (stable attachment order).
   * Empty string means no skill prose for the current attachments/catalog.
   */
  current: string
}

/**
 * Join non-empty trimmed skill instructional bodies in Host attachment order.
 * Missing or whitespace-only bodies contribute no prose (FR-014 compose rule).
 * @param bodies - raw skill `content` strings already loaded from the Host catalog.
 * @returns joined non-empty parts, or `''` when every body is empty/missing.
 */
export function composeSkillInstructions(bodies: readonly (string | undefined)[]): string {
  const parts: string[] = []
  for (const body of bodies) {
    if (body === undefined) continue
    const trimmed = body.trim()
    if (trimmed.length > 0) parts.push(trimmed)
  }
  return parts.join('\n\n')
}

/**
 * Register a scoped `agent-teams:skill-instructions` section that reads {@link SkillBindRef}.
 * Empty text contributes no prose at render. The Agent-scoped effect disposes with the Agent.
 * @param agent - exact live teammate Agent whose scoped context owns the bind.
 * @param ref - mutable skill-instruction snapshot owned by TeamService.
 * @param onDispose - optional cleanup when the Agent-scoped effect ends.
 * @returns the same ref for live updates after Host `attachSkill`.
 */
export function bindTeammateSkillInstructions(
  agent: Agent,
  ref: SkillBindRef,
  onDispose?: () => void,
): SkillBindRef {
  agent.ctx.effect(() => {
    const disposeSection = agent.ctx.systemPrompt.section({
      name: SKILL_INSTRUCTIONS_SECTION,
      order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_SUFFIX'),
      // Skill bodies are trusted Host catalog text; keep `{{` literal.
      interpolate: false,
      text: () => ref.current,
    })
    return () => {
      disposeSection()
      onDispose?.()
    }
  }, 'agentTeams.skillInstructions')
  return ref
}
