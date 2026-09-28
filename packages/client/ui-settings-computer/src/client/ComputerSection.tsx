/**
 * Global Settings → Computer: locale-owned Shell + Computer use rows over the
 * Host `computer` settings namespace (HTTP/WS Remotes only; no Main SoT).
 */
import { useState, type ReactNode } from 'react'
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  HostObservable, InjectFace, PropsLocale, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { BoxReadiness, ComputerSettingsSnapshot } from './computer-projection.ts'
import type { ComputerLocaleKey } from './locales.ts'
import css from './ComputerSection.module.css'

/** Injected Host computer settings mirror (settingsScope → Remotes). */
export interface ComputerSectionInjected {
  hooks: {
    /**
     * Host `computer` settings projection. Reached through a hook rather than
     * injected as values so document-updated refreshes stay live.
     */
    computerSettings: HostObservable<ComputerSettingsSnapshot>
  }
  /**
   * Write Computer use enablement through Host settings Remotes.
   * @param enabled - next `computerUseEnabled` value.
   */
  setComputerUseEnabled: (enabled: boolean) => Promise<void>
}

/** Full component props assembled by the Settings slot renderer. */
export type ComputerSectionProps =
  PropsRuntime<'settings.section'>
  & PropsLocale<'settings.computer'>
  & InjectFace<ComputerSectionInjected>

function readinessKey(readiness: BoxReadiness): ComputerLocaleKey {
  switch (readiness) {
    case 'not_ready': return 'shell.readiness.not_ready'
    case 'starting': return 'shell.readiness.starting'
    case 'ready': return 'shell.readiness.ready'
    case 'failed': return 'shell.readiness.failed'
  }
}

/**
 * Render the Computer settings page with Shell readiness and Computer use rows.
 * @param props - composed slot props (see {@link ComputerSectionProps}).
 * @returns the settings page element tree.
 */
export function ComputerSection({
  t, useComputerSettings, setComputerUseEnabled,
}: ComputerSectionProps): ReactNode {
  const snapshot = useComputerSettings(s => s)
  const [saving, setSaving] = useState(false)
  const value = snapshot.value

  return (
    <div
      className={css.section}
      data-settings-computer
      data-computer-status={snapshot.status}
    >
      <h2 className={css.heading}>{t('nav')}</h2>
      {snapshot.status === 'loading' ? <p className={css.status}>{t('loading')}</p> : null}
      {snapshot.status === 'unavailable' ? <p className={css.status}>{t('unavailable')}</p> : null}
      <ul className={css.rows}>
        <li
          className={css.row}
          data-settings-computer-row="shell"
          data-box-readiness={value?.readiness}
          data-box-local={value === undefined ? undefined : value.local ? 'true' : 'false'}
          data-box-id={value?.boxId}
        >
          <div className={css.rowCopy}>
            <div className={css.rowTitle}>{t('shell.title')}</div>
            <p className={css.rowHint}>{t('shell.hint')}</p>
            {value !== undefined ? (
              <div className={css.rowMeta}>
                <span
                  className={css.readiness}
                  data-box-readiness-label={value.readiness}
                >
                  {t(readinessKey(value.readiness))}
                </span>
                <span className={css.locality}>
                  {value.local ? t('shell.local') : t('shell.remote')}
                </span>
              </div>
            ) : null}
          </div>
        </li>
        <li
          className={css.row}
          data-settings-computer-row="computer-use"
          data-computer-use-enabled={
            value === undefined ? undefined : value.computerUseEnabled ? 'true' : 'false'
          }
        >
          <div className={css.rowCopy}>
            <div className={css.rowTitle}>{t('computerUse.title')}</div>
            <p className={css.rowHint}>{t('computerUse.description')}</p>
          </div>
          <div className={css.rowControl}>
            <Switch
              checked={value?.computerUseEnabled ?? false}
              label={t('computerUse.enable')}
              disabled={
                snapshot.status !== 'ready'
                || value === undefined
                || !snapshot.writable
                || saving
              }
              onChange={(next) => {
                setSaving(true)
                void setComputerUseEnabled(next).finally(() => { setSaving(false) })
              }}
            />
          </div>
        </li>
      </ul>
    </div>
  )
}
