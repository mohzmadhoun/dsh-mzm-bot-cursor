/**
 * Bind a Team Bot's eligible Host Memory catalog rows into scoped
 * system-prompt assembly (`agent-teams:memory-recall`) so subsequent
 * turns see curated recall text (FR-016 / SC-004; Candidate A).
 *
 * Sibling to P2 {@link bindTeammatePersona} and P3 {@link bindTeammateSkillInstructions}.
 * Verifier observes assembly wiring — not LLM reply wording (FR-014; clarify).
 */

import type { Agent } from '@deepseek-ai/dsh-agent'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { MemoryRecord } from './types.ts'
import { memoryEligibleForBot } from './validation.ts'

/**
 * Scoped system-prompt section that carries curated Host Memory recall text.
 * Distinct from `deployment:persona-prefix` and `agent-teams:skill-instructions`.
 */
export const MEMORY_RECALL_SECTION = 'agent-teams:memory-recall'

/** Mutable Host memory-recall snapshot coupled to one live teammate Agent. */
export interface MemoryBindRef {
  /**
   * Pre-composed recall text for this Bot (catalog order).
   * Empty string means no curated prose for the current eligible rows.
   */
  current: string
}

/**
 * Join non-empty trimmed contents from rows eligible for one Bot.
 * Agent-layer rows must match `botId`; user-layer rows are account-wide
 * ({@link memoryEligibleForBot} — US5 T027 / FR-006/007).
 * Blank contents contribute no prose (FR-016 compose / empty-catalog rule).
 * @param rows - durable Host Memory catalog rows (full Team catalog or subset).
 * @param botId - teammate Session identity receiving the turn.
 * @returns joined non-empty parts, or `''` when nothing is eligible.
 */
export function composeMemoryRecall(
  rows: readonly Pick<MemoryRecord, 'layer' | 'botId' | 'content'>[],
  botId: SessionId,
): string {
  const parts: string[] = []
  for (const row of rows) {
    if (!memoryEligibleForBot(row, botId)) continue
    const trimmed = row.content.trim()
    if (trimmed.length > 0) parts.push(trimmed)
  }
  return parts.join('\n\n')
}

/**
 * Register a scoped `agent-teams:memory-recall` section that reads {@link MemoryBindRef}.
 * Empty text contributes no prose at render. The Agent-scoped effect disposes with the Agent.
 * @param agent - exact live teammate Agent whose scoped context owns the bind.
 * @param ref - mutable memory-recall snapshot owned by TeamService.
 * @param onDispose - optional cleanup when the Agent-scoped effect ends.
 * @returns the same ref for live updates after Host `writeMemory`.
 */
export function bindTeammateMemoryRecall(
  agent: Agent,
  ref: MemoryBindRef,
  onDispose?: () => void,
): MemoryBindRef {
  agent.ctx.effect(() => {
    const disposeSection = agent.ctx.systemPrompt.section({
      name: MEMORY_RECALL_SECTION,
      order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_SUFFIX'),
      // Catalog rows are trusted Host prose; keep `{{` literal.
      interpolate: false,
      text: () => ref.current,
    })
    return () => {
      disposeSection()
      onDispose?.()
    }
  }, 'agentTeams.memoryRecall')
  return ref
}
