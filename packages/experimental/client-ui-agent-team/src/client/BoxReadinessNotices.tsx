/** Host Computer `readiness` strip from settings Remotes (P7 T018 Path A). */

import type {
  HostObservable, InjectFace, PropsLocale, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import { NS, type TeamKey } from './locales.ts'
import css from './BoxReadinessNotices.module.css'

/** Host-projected box/computer backend readiness (data-model BoxBackend.readiness). */
export type BoxReadiness = 'not_ready' | 'starting' | 'ready' | 'failed'

/** Client projection of the Host `computer` settings namespace (read-only for Shell). */
export interface ComputerBoxProjection {
  /** Singleton Host box id for Pass (`desktop-local`). */
  readonly boxId: string
  /** Host readiness — not_ready / starting / failed MUST be distinguishable from ready. */
  readonly readiness: BoxReadiness
  /** Pass path is Host-local sandboxed Shell. */
  readonly local: boolean
  /** ISO-8601 timestamp of the last Host readiness commit. */
  readonly updatedAt: string
}

/** Snapshot of the Host computer settings mirror for the notices strip. */
export interface ComputerBoxSnapshot {
  /** Mirror readiness; `unavailable` when the Host namespace is not served. */
  readonly status: 'loading' | 'ready' | 'unavailable'
  /** Last accepted Host projection; undefined before the first acceptance. */
  readonly value: ComputerBoxProjection | undefined
}

/** Injected Host computer settings mirror (settingsScope → Remotes; no Main IPC). */
export type BoxReadinessNoticesInjected = {
  hooks: {
    /**
     * Host `computer` settings projection. Reached through a hook rather than
     * injected as values so document-updated refreshes stay live.
     */
    computerBox: HostObservable<ComputerBoxSnapshot>
  }
}

/** Full props of the conversation.session.notices box-readiness strip. */
export type BoxReadinessNoticesProps =
  PropsRuntime<'conversation.session.notices'>
  & InjectFace<BoxReadinessNoticesInjected>
  & PropsLocale<typeof NS>

function readinessKey(readiness: BoxReadiness): TeamKey {
  switch (readiness) {
    case 'not_ready': return 'boxReadiness.not_ready'
    case 'starting': return 'boxReadiness.starting'
    case 'ready': return 'boxReadiness.ready'
    case 'failed': return 'boxReadiness.failed'
  }
}

/**
 * Narrow one Host `computer` settings section to the Shell/box readiness fields.
 * @param section - wire section from settings.describe / settingsScope.
 * @returns projection when fields are well-formed; otherwise undefined.
 */
export function decodeComputerBoxProjection(section: unknown): ComputerBoxProjection | undefined {
  if (typeof section !== 'object' || section === null || Array.isArray(section)) return undefined
  const record = section as Record<string, unknown>
  const { boxId, readiness, local, updatedAt } = record
  if (typeof boxId !== 'string' || boxId.trim() === '') return undefined
  if (
    readiness !== 'not_ready'
    && readiness !== 'starting'
    && readiness !== 'ready'
    && readiness !== 'failed'
  ) {
    return undefined
  }
  if (typeof local !== 'boolean') return undefined
  if (typeof updatedAt !== 'string' || updatedAt.trim() === '') return undefined
  return { boxId, readiness, local, updatedAt }
}

/**
 * Project Host BoxBackend readiness into the conversation notices strip so
 * not-ready / starting / failed are visually distinct from ready (FR-002).
 * Reads Host settings over HTTP/WS only — Electron Main is not SoT.
 */
export function BoxReadinessNotices({
  useComputerBox, t,
}: BoxReadinessNoticesProps) {
  const snapshot = useComputerBox(s => s)
  if (snapshot.status === 'loading' || snapshot.status === 'unavailable') return null
  const value = snapshot.value
  if (value === undefined) return null

  return (
    <section
      className={css.root}
      data-shell-box-readiness
      data-box-readiness={value.readiness}
      data-box-local={value.local ? 'true' : 'false'}
      data-box-id={value.boxId}
      aria-label={t('boxReadiness.title')}
    >
      <div className={css.header}>
        <strong>{t('boxReadiness.title')}</strong>
        <span
          className={css.state}
          data-box-readiness-label={value.readiness}
        >
          {t(readinessKey(value.readiness))}
        </span>
      </div>
      <p className={css.hint}>{t('boxReadiness.hint')}</p>
    </section>
  )
}
