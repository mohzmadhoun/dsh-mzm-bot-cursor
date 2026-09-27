import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createScope, type ScopeKey } from '@deepseek-ai/dsh-scope'
import SystemPrompt, { PERSONA_PREFIX_SECTION, renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import {
  bindTeammatePersona,
  composePersonaPrefix,
  type PersonaBindRef,
} from '../src/persona-bind.ts'

function agentWithCtx(ctx: Context): Agent {
  return {
    session: Session.create(SessionId('teammate')),
    options: {},
    ctx,
  } as Agent
}

describe('composePersonaPrefix()', () => {
  it('joins non-empty job, voice, and anti-jobs and omits empty fields', () => {
    expect(composePersonaPrefix(undefined)).toBe('')
    expect(composePersonaPrefix({ job: '', voice: '', antiJobs: [] })).toBe('')
    expect(composePersonaPrefix({
      job: 'review PRs',
      voice: '',
      antiJobs: [],
    })).toBe('Job: review PRs')
    expect(composePersonaPrefix({
      job: '',
      voice: 'terse',
      antiJobs: ['merge', 'deploy'],
    })).toBe('Voice: terse\nAnti-jobs:\n- merge\n- deploy')
    expect(composePersonaPrefix({
      job: 'ship',
      voice: 'warm',
      antiJobs: ['docs'],
    })).toBe('Job: ship\nVoice: warm\nAnti-jobs:\n- docs')
  })
})

describe('bindTeammatePersona()', () => {
  it('registers persona-prefix from the mutable ref and updates on subsequent assemble', async () => {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt, { personaPrefix: 'Deployment default.' })
    const key: ScopeKey = { agent: 'bound-persona' }
    const scope = createScope(ctx, key)
    const ref: PersonaBindRef = {
      current: { job: 'review', voice: 'terse', antiJobs: ['merge'] },
    }
    await scope.ctx.inject(['systemPrompt'], (runtimeCtx) => {
      bindTeammatePersona(agentWithCtx(runtimeCtx), ref)
    })
    const first = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(first).toContain('review')
    expect(first).toContain('terse')
    expect(first).toContain('merge')
    expect(first).not.toContain('Deployment default.')
    expect((await ctx.systemPrompt.assemble({ scope: key })).sections
      .some(section => section.name === PERSONA_PREFIX_SECTION && section.text.includes('review')))
      .toBe(true)

    ref.current = { job: 'ship', voice: '', antiJobs: [] }
    const second = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(second).toContain('ship')
    expect(second).not.toContain('review')
    expect(second).not.toContain('terse')
    expect(second).not.toContain('merge')

    ref.current = { job: '', voice: '', antiJobs: [] }
    const empty = renderPrompt(await ctx.systemPrompt.assemble({ scope: key }))
    expect(empty).not.toContain('Job:')
    expect(empty).not.toContain('ship')
    expect(renderPrompt(await ctx.systemPrompt.assemble())).toContain('Deployment default.')
    await ctx.fiber.dispose()
  })
})
