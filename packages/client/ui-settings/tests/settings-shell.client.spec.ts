/** Settings shell navigation face for cross-plugin openSection handoff. */

import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { TestRemote } from '@deepseek-ai/dsh-client-test-runtime'
import { apply, inject, MODELS_SECTION_ID, SettingsShellController } from '../src/client/index.ts'

function bench() {
  const ctx = new Context()
  new TestRemote(ctx, {
    settings: {
      describe: vi.fn().mockResolvedValue({
        ok: true, value: { writable: true, hasDocument: true, namespaces: [] },
      }),
    },
  })
  return { ctx, fiber: ctx.plugin({ inject: [...inject], apply }) }
}

describe('settingsShell navigation (T020)', () => {
  it('publishes settingsShell beside settingsScope and retires on fiber dispose', async () => {
    const { ctx, fiber } = bench()
    await fiber.await()
    expect(ctx.get('settingsShell')).toBeInstanceOf(SettingsShellController)
    expect(MODELS_SECTION_ID).toBe('models')
    await fiber.dispose()
    expect(ctx.get('settingsShell')).toBeUndefined()
  })

  it('openSection no-ops until bound, then opens the bound section id', async () => {
    const { ctx, fiber } = bench()
    await fiber.await()
    const shell = ctx.get('settingsShell')!
    const open = vi.fn()
    shell.openSection(MODELS_SECTION_ID)
    expect(open).not.toHaveBeenCalled()
    const unbind = shell.bindOpenSection(open)
    shell.openSection(MODELS_SECTION_ID)
    expect(open).toHaveBeenCalledWith('models')
    unbind()
    shell.openSection(MODELS_SECTION_ID)
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('bindOpenSection replaces the prior handler and disposer clears only its own', async () => {
    const { ctx, fiber } = bench()
    await fiber.await()
    const shell = ctx.get('settingsShell')!
    const first = vi.fn()
    const second = vi.fn()
    const unbindFirst = shell.bindOpenSection(first)
    const unbindSecond = shell.bindOpenSection(second)
    shell.openSection('models')
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('models')
    unbindFirst()
    shell.openSection('general')
    expect(second).toHaveBeenCalledWith('general')
    unbindSecond()
    shell.openSection('models')
    expect(second).toHaveBeenCalledTimes(2)
  })
})
