// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'
import { usePinnedBrowserLanguages } from '@deepseek-ai/dsh-client-test-runtime'
import { RemoteError, TestRemote } from '@deepseek-ai/dsh-client-test-runtime'
import {
  apply as settingsApply, inject as settingsInject,
} from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  apply, inject, COMPUTER_SECTION_ID, COMPUTER_SETTINGS_NAMESPACE,
} from '../src/client/index.ts'
import { ComputerSection } from '../src/client/ComputerSection.tsx'
import type { ComputerSectionInjected } from '../src/client/ComputerSection.tsx'
import { apply as hostApply } from '../src/index.ts'

usePinnedBrowserLanguages('zh-CN')
afterEach(cleanup)

async function bench(served?: Record<string, unknown>) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  const describeSettings = vi.fn(() => Promise.resolve(served === undefined
    ? { ok: false, error: new RemoteError('gateway/internal', 'no provider', {}) }
    : {
      ok: true,
      value: {
        writable: true,
        hasDocument: true,
        namespaces: [{
          ns: COMPUTER_SETTINGS_NAMESPACE,
          schema: {},
          value: served,
          applies: 'live',
          secrets: [],
          revision: 1,
        }],
      },
    }))
  const mutate = vi.fn(() => Promise.resolve({
    ok: true,
    value: {
      ns: COMPUTER_SETTINGS_NAMESPACE,
      schema: {},
      value: { ...served, computerUseEnabled: false },
      applies: 'live',
      secrets: [],
      revision: 2,
    },
  }))
  new TestRemote(ctx, {
    settings: { describe: describeSettings, mutate },
  })
  await ctx.plugin({ inject: [...settingsInject], apply: settingsApply }).await()
  return { ctx, slots: ctx.get('slots') as SlotRegistry, locale, mutate, describeSettings }
}

function declare(slots: SlotRegistry): () => void {
  return slots.register({
    name: 'root',
    children: { 'settings.section': { kind: 'list', scope: 'root' } },
  } as never, () => null)
}

describe('ui-settings-computer browser plugin', () => {
  it('keeps the host Loader entry inert', () => {
    expect(hostApply).not.toThrow()
  })

  it('declares only the services used by the page and Host Remotes', () => {
    expect(inject).toEqual(['slots', 'locale', 'settingsScope'])
  })

  it('registers Global Settings → Computer with localized Shell + Computer use labels', async () => {
    const b = await bench({
      boxId: 'desktop-local',
      readiness: 'ready',
      local: true,
      updatedAt: '2026-09-28T00:00:00.000Z',
      computerUseEnabled: true,
    })
    declare(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()

    const entry = b.slots.entries('settings.section')[0]!
    expect(entry.component).toBe(ComputerSection)
    expect(entry.options).toMatchObject({ id: COMPUTER_SECTION_ID, order: 12 })
    expect(entry.locale).toBe('settings.computer')
    expect(resolveSlotLabel(entry.options.label)).toBe('电脑')

    b.locale.setLocale('en')
    expect(resolveSlotLabel(b.slots.entries('settings.section')[0]!.options.label)).toBe('Computer')

    const injected = (entry.inject as unknown as () => ComputerSectionInjected)()
    expect(injected.hooks.computerSettings.getSnapshot().status).toBe('loading')
    await vi.waitFor(() => {
      expect(injected.hooks.computerSettings.getSnapshot().status).toBe('ready')
    })
    expect(injected.hooks.computerSettings.getSnapshot().value).toMatchObject({
      readiness: 'ready',
      computerUseEnabled: true,
    })
    await expect(injected.setComputerUseEnabled(false)).resolves.toBeUndefined()
    expect(b.mutate).toHaveBeenCalled()
    await b.ctx.fiber.dispose()
  })

  it('follows a late declaration and a declarer reload', async () => {
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries('settings.section')).toHaveLength(0)

    const stop = declare(b.slots)
    await vi.waitFor(() => { expect(b.slots.entries('settings.section')).toHaveLength(1) })

    stop()
    expect(b.slots.entries('settings.section')).toHaveLength(0)
    declare(b.slots)
    await vi.waitFor(() => {
      expect(b.slots.entries('settings.section')[0]?.component).toBe(ComputerSection)
    })

    await fiber.dispose()
    expect(b.slots.entries('settings.section')).toHaveLength(0)
    expect(() => b.locale.register('settings.computer', 'zh', {})).not.toThrow()
    await b.ctx.fiber.dispose()
  })
})
