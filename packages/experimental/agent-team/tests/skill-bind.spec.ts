import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createScope, type ScopeKey } from '@deepseek-ai/dsh-scope'
import SystemPrompt, { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import {
  SKILL_INSTRUCTIONS_SECTION,
  bindTeammateSkillInstructions,
  composeSkillInstructions,
  type SkillBindRef,
} from '../src/skill-bind.ts'

function agentWithCtx(ctx: Context): Agent {
  return {
    session: Session.create(SessionId('teammate')),
    options: {},
    ctx,
  } as Agent
}

describe('composeSkillInstructions()', () => {
  it('joins non-empty trimmed bodies in order and skips empty/missing', () => {
    expect(composeSkillInstructions([])).toBe('')
    expect(composeSkillInstructions([undefined, '', '  '])).toBe('')
    expect(composeSkillInstructions(['Follow the MzM thin-pack playbook for Pass.'])).toBe(
      'Follow the MzM thin-pack playbook for Pass.',
    )
    expect(composeSkillInstructions([
      '  first body  ',
      undefined,
      '',
      'second body',
    ])).toBe('first body\n\nsecond body')
  })
})

describe('bindTeammateSkillInstructions()', () => {
  it('registers skill-instructions from the mutable ref and updates on subsequent assemble', async () => {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt, { personaPrefix: 'Deployment default.' })
    const key: ScopeKey = { agent: 'bound-skills' }
    const scope = createScope(ctx, key)
    const ref: SkillBindRef = {
      current: 'Follow the MzM thin-pack playbook for Pass.',
    }
    await scope.ctx.inject(['systemPrompt'], (runtimeCtx) => {
      bindTeammateSkillInstructions(agentWithCtx(runtimeCtx), ref)
    })
    const first = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(first).toContain('Follow the MzM thin-pack playbook for Pass.')
    expect((await ctx.systemPrompt.assemble({ scope: key })).sections
      .some(section => section.name === SKILL_INSTRUCTIONS_SECTION
        && section.text.includes('Follow the MzM thin-pack playbook for Pass.')))
      .toBe(true)

    ref.current = 'Second attached body.'
    const second = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(second).toContain('Second attached body.')
    expect(second).not.toContain('Follow the MzM thin-pack playbook for Pass.')

    ref.current = ''
    const empty = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(empty).not.toContain('Second attached body.')
    expect(renderPrompt(await ctx.systemPrompt.assemble())).toContain('Deployment default.')
    await ctx.fiber.dispose()
  })
})
