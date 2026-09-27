import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Agent, ModelSelection } from '@deepseek-ai/dsh-agent'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import {
  bindTeammateModelSelection,
  resolveTeammateModelSelection,
} from '../src/model-selection-bind.ts'
import type { TeamMemberSnapshot } from '../src/types.ts'

function agentWithOptions(options: Agent['options']): Agent {
  return {
    session: Session.create(SessionId('teammate')),
    options,
    ctx: new Context(),
  } as Agent
}

describe('resolveTeammateModelSelection()', () => {
  it('prefers the durable Host roster assignment over live Agent options', () => {
    const agent = agentWithOptions({ provider: 'live', model: 'live-model' })
    const member = {
      id: SessionId('teammate'),
      name: 'bound-bot',
      description: 'bound',
      provider: 'spawn',
      context: 'fresh',
      phase: 'active',
      modelSelection: {
        provider: 'mock',
        model: 'roster-model',
        reasoningEffort: ReasoningEffortId('high'),
      },
    } satisfies TeamMemberSnapshot
    expect(resolveTeammateModelSelection(agent, member)).toEqual({
      provider: 'mock',
      model: 'roster-model',
      reasoningEffort: ReasoningEffortId('high'),
    })
  })

  it('falls back to create-time Agent options when the snapshot omits modelSelection', () => {
    const agent = agentWithOptions({
      provider: 'mock',
      model: 'option-model',
      reasoningEffort: ReasoningEffortId('low'),
    })
    expect(resolveTeammateModelSelection(agent, undefined)).toEqual({
      provider: 'mock',
      model: 'option-model',
      reasoningEffort: ReasoningEffortId('low'),
    })
    expect(resolveTeammateModelSelection(agentWithOptions({}), undefined)).toBeUndefined()
    expect(resolveTeammateModelSelection(agentWithOptions({ provider: 'mock' }), undefined)).toBeUndefined()
  })
})

describe('bindTeammateModelSelection()', () => {
  it('installs ModelSelection onto the Agent scope for subsequent request routing', async () => {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt)
    const agent = {
      session: Session.create(SessionId('bound')),
      options: { provider: 'mock', model: 'seed' },
      ctx,
    } as Agent
    const selection: ModelSelection = { provider: 'mock', model: 'bound-model' }
    const ref = bindTeammateModelSelection(agent, selection)
    expect(ref.current).toEqual(selection)
    expect((await ctx.systemPrompt.assemble()).variables).toMatchObject({
      provider: 'mock',
      model: 'bound-model',
    })
    await ctx.fiber.dispose()
  })
})
