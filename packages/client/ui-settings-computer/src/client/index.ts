/**
 * Global Settings → Computer section, browser half. Registers one locale-owned
 * `settings.section` with Shell readiness (read-only) and Computer use
 * enablement rows over Host `computer` settings Remotes (Path A; no Main SoT).
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { ComputerSection } from './ComputerSection.tsx'
import type { ComputerSectionInjected } from './ComputerSection.tsx'
import {
  COMPUTER_SETTINGS_NAMESPACE,
  decodeComputerSettingsProjection,
  type ComputerSettingsSnapshot,
} from './computer-projection.ts'
import { en, zh, type ComputerLocaleKey } from './locales.ts'

export type { ComputerSectionInjected, ComputerSectionProps } from './ComputerSection.tsx'
export type {
  BoxReadiness, ComputerSettingsProjection, ComputerSettingsSnapshot,
} from './computer-projection.ts'
export {
  COMPUTER_SETTINGS_NAMESPACE, decodeComputerSettingsProjection,
} from './computer-projection.ts'
export type { ComputerLocaleKey } from './locales.ts'

/** Stable `settings.section` id for Global Settings → Computer. */
export const COMPUTER_SECTION_ID = 'computer'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Computer settings page copy (Shell + Computer use). */
    'settings.computer': ComputerLocaleKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'settings.computer'

/** Services required by the Settings registration and Host Remotes writes. */
export const inject = ['slots', 'locale', 'settingsScope']

/**
 * Contribute the Computer page to Global Settings.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-computer: dictionaries')

  const t = ctx.locale.bind(NS)
  const computerScope = ctx.settingsScope.bind({
    namespace: COMPUTER_SETTINGS_NAMESPACE,
    decode: decodeComputerSettingsProjection,
  })
  const computerSettings: ComputerSectionInjected['hooks']['computerSettings'] = {
    getSnapshot: (): ComputerSettingsSnapshot => {
      const snap = computerScope.getSnapshot()
      return { status: snap.status, value: snap.value, writable: snap.writable }
    },
    subscribe: listener => computerScope.subscribe(listener),
  }

  const injected = (): ComputerSectionInjected => ({
    hooks: { computerSettings },
    setComputerUseEnabled: enabled => computerScope.set('computerUseEnabled', enabled),
  })

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: COMPUTER_SECTION_ID,
    order: 12,
    label: () => t('nav'),
    locale: NS,
    inject: injected,
  }, ComputerSection))
}
