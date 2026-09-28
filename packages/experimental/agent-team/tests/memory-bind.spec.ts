import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createScope, type ScopeKey } from '@deepseek-ai/dsh-scope'
import SystemPrompt, { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import {
  MEMORY_RECALL_SECTION,
  bindTeammateMemoryRecall,
  composeMemoryRecall,
  type MemoryBindRef,
} from '../src/memory-bind.ts'

const BOT_A = SessionId('bot-a')
const BOT_B = SessionId('bot-b')

function agentWithCtx(ctx: Context): Agent {
  return {
    session: Session.create(SessionId('teammate')),
    options: {},
    ctx,
  } as Agent
}

describe('composeMemoryRecall()', () => {
  it('joins eligible non-empty rows and isolates agent-layer by botId', () => {
    expect(composeMemoryRecall([], BOT_A)).toBe('')
    expect(composeMemoryRecall([
      { layer: 'agent', botId: BOT_A, content: '   ' },
      { layer: 'user', botId: null, content: '' },
    ], BOT_A)).toBe('')

    expect(composeMemoryRecall([
      { layer: 'agent', botId: BOT_A, content: '  Alpha prefers UTC  ' },
      { layer: 'agent', botId: BOT_B, content: 'Beta secret agent fact' },
      { layer: 'user', botId: null, content: 'Account timezone America/New_York' },
    ], BOT_A)).toBe('Alpha prefers UTC\n\nAccount timezone America/New_York')

    expect(composeMemoryRecall([
      { layer: 'agent', botId: BOT_A, content: 'Alpha prefers UTC' },
      { layer: 'agent', botId: BOT_B, content: 'Beta secret agent fact' },
      { layer: 'user', botId: null, content: 'Account timezone America/New_York' },
    ], BOT_B)).toBe('Beta secret agent fact\n\nAccount timezone America/New_York')
  })
})

describe('bindTeammateMemoryRecall()', () => {
  it('registers memory-recall from the mutable ref and updates on subsequent assemble', async () => {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt, { personaPrefix: 'Deployment default.' })
    const key: ScopeKey = { agent: 'bound-memory' }
    const scope = createScope(ctx, key)
    const ref: MemoryBindRef = {
      current: 'Alpha prefers UTC',
    }
    await scope.ctx.inject(['systemPrompt'], (runtimeCtx) => {
      bindTeammateMemoryRecall(agentWithCtx(runtimeCtx), ref)
    })
    const first = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(first).toContain('Alpha prefers UTC')
    expect((await ctx.systemPrompt.assemble({ scope: key })).sections
      .some(section => section.name === MEMORY_RECALL_SECTION
        && section.text.includes('Alpha prefers UTC')))
      .toBe(true)

    ref.current = 'Shipped memory log write'
    const second = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(second).toContain('Shipped memory log write')
    expect(second).not.toContain('Alpha prefers UTC')

    ref.current = ''
    const empty = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(empty).not.toContain('Shipped memory log write')
    expect(renderPrompt(await ctx.systemPrompt.assemble())).toContain('Deployment default.')
    await ctx.fiber.dispose()
  })
})
