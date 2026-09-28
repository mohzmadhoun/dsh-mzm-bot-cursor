/** Desktop Host Pass computerUse fixture (P7 T009). */

import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import ComputerUseRegistry from '@deepseek-ai/dsh-computer-use'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import * as PassFixture from '../src/computer-use-pass-fixture.ts'
import {
  PASS_PROVIDER_NAME,
  PASS_SCREENSHOT_TOOL,
} from '../src/computer-use-pass-fixture.ts'

describe('desktop-computer-use-pass-fixture', () => {
  let ctx: Context

  afterEach(async () => {
    await ctx.fiber.dispose()
  })

  it('registers the exclusive Pass provider and screenshot tool', async () => {
    ctx = new Context()
    await ctx.plugin(ComputerUseRegistry)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    expect('default' in PassFixture).toBe(false)
    const fiber = ctx.plugin(PassFixture)
    await fiber
    expect(ctx.computerUse.providerName).toBe(PASS_PROVIDER_NAME)
    expect(ctx.tools.schemas().map(tool => tool.name)).toContain(PASS_SCREENSHOT_TOOL)
    const result = await ctx.tools.execute({
      name: PASS_SCREENSHOT_TOOL,
      callId: ToolCallId('pass-shot'),
      arguments: {},
      signal: new AbortController().signal,
    })
    expect(result.isError).toBe(false)
    expect(result.content.some(block => block.type === 'text')).toBe(true)
    await fiber.dispose()
    expect(ctx.computerUse.providerName).toBeUndefined()
    expect(ctx.tools.schemas().map(tool => tool.name)).not.toContain(PASS_SCREENSHOT_TOOL)
  })
})
