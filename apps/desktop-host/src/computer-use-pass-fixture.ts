/**
 * Host Pass computerUse provider for Desktop when Cua is unreachable (P7 T009).
 * Registers on `ctx.computerUse` and exposes one screenshot observation tool
 * through the MCP image-admission adapter (durable attachment when available).
 * @module desktop-host/computer-use-pass-fixture
 */

import type { Context } from '@deepseek-ai/cordis'
import { ComputerUseProviderName } from '@deepseek-ai/dsh-computer-use/brand'
import { createMcpToolDefinition } from '@deepseek-ai/dsh-mcp-client'
import type {} from '@deepseek-ai/dsh-computer-use'
import type {} from '@deepseek-ai/dsh-tools'

/** Cordis plugin identity for the Desktop Host Pass fixture. */
export const name = 'desktop-computer-use-pass-fixture'

/** Registry + tools required before the Pass provider can publish. */
export const inject = ['computerUse', 'tools']

/** Branded provider name reserved for the Host Pass fixture slot. */
export const PASS_PROVIDER_NAME = ComputerUseProviderName('desktop-pass-fixture')

/** Model-facing tool that returns a durable one-pixel PNG observation. */
export const PASS_SCREENSHOT_TOOL = 'computer_use_pass_screenshot'

/**
 * Valid 1×1 PNG — keeps image admission on the real attachment path without
 * requiring a live desktop capture (screenshot-only Pass; FR-003).
 */
export const PASS_SCREENSHOT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWNgZGIGAAAOAAeCcsnOAAAAAElFTkSuQmCC'

/**
 * Reserve the exclusive computerUse slot and register the Pass screenshot tool.
 * @param ctx - context providing `computerUse` and `tools`.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => {
    const releaseProvider = ctx.computerUse.register(PASS_PROVIDER_NAME)
    const unregisterTool = ctx.tools.register(createMcpToolDefinition(ctx, {
      name: PASS_SCREENSHOT_TOOL,
      rawName: 'pass_screenshot',
      description:
        'Capture a Pass-fixture desktop observation screenshot for computerUse-class verification. Returns one durable PNG attachment when image admission is available.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      async call() {
        return {
          content: [
            { type: 'text', text: 'Pass fixture desktop observation.' },
            {
              type: 'image',
              mimeType: 'image/png',
              data: PASS_SCREENSHOT_PNG_BASE64,
            },
          ],
        }
      },
    }))
    return async () => {
      unregisterTool()
      await releaseProvider()
    }
  }, 'desktop-computer-use-pass-fixture')
}
