/**
 * computerUse Pass screenshot observation toolview (P7 T022).
 * Projects Host-admitted screenshot / GUI observation over HTTP/WS session
 * Tool blocks — never Electron Main SoT. Does not declare `tool.call.images`
 * (owned by read_image); loads admitted attachments through the owner
 * `loadImage` seat and surfaces dimensions when the gallery is unavailable.
 */
import { useEffect, useState, type KeyboardEvent } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import clsx from 'clsx'
import {
  IconBrowseOutline16, IconChevronDownOutline14, StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { MessageImageLoader } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ToolCallViewProps } from '../../contract/slots.ts'
import {
  computerUseObservation,
  type ComputerUseObservationStatus,
} from '../models/computer-use-observation.ts'
import { toolRowModel, type ToolRowState } from '../models/tool-call-model.ts'
import { CONVERSATION_NS as NS } from '../../locale.ts'
import css from './computer-use-cards.module.css'

type ObservationRowProps = ToolCallViewProps & PropsLocale<'conversation'>

function leadingFor(status: ComputerUseObservationStatus | null, state: ToolRowState) {
  if (status === 'error' || state === 'error') return <StateDot state="error" />
  if (status === 'running' || state === 'running') return <StateDot state="ongoing" />
  return <IconBrowseOutline16 size={14} />
}

function statusLabel(
  status: ComputerUseObservationStatus | null,
  t: ObservationRowProps['t'],
): string | null {
  switch (status) {
    case 'observed': return t('computerUse.observation')
    case 'running': return t('computerUse.observing')
    case 'error': return t('computerUse.observationError')
    default: return null
  }
}

/**
 * Load one admitted screenshot through the session-authorized loader.
 * @param attachment - durable Host image reference.
 * @param loadImage - session-authorized URL loader from the chat node.
 */
function ObservationImage({
  attachment,
  loadImage,
}: {
  attachment: ImageAttachmentRef
  loadImage: MessageImageLoader
}) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    void loadImage(attachment).then((resolved) => {
      if (!cancelled) setUrl(resolved)
    }, () => {
      // Loader rejection: keep metadata-only evidence visible.
      if (!cancelled) setUrl(null)
    })
    return () => { cancelled = true }
  }, [attachment, loadImage])
  return (
    <figure
      className={css.imageBody}
      data-computer-use-screenshot
      data-media-type={attachment.mediaType}
      data-width={attachment.width}
      data-height={attachment.height}
      data-bytes={attachment.bytes}
      data-attachment-id={attachment.attachmentId}
    >
      {url !== null
        ? <img src={url} alt="" width={attachment.width} height={attachment.height} />
        : (
          <div className={css.imageMeta}>
            {attachment.mediaType}
            {' '}
            {attachment.width}
            ×
            {attachment.height}
            {' '}
            (
            {attachment.bytes}
            {' '}
            bytes)
          </div>
        )}
    </figure>
  )
}

/**
 * Render Host computerUse screenshot/GUI observation on the Pass fixture tool card.
 * @param props - toolview runtime share and locale.
 */
export function ComputerUseObservationRow({
  toolName, block, loadImage, t,
}: ObservationRowProps) {
  const model = toolRowModel(toolName, block)
  const observation = computerUseObservation(toolName, block)
  const status = observation?.status ?? null
  const state: ToolRowState = status === 'error'
    ? 'error'
    : status === 'running'
      ? 'running'
      : model.state
  const label = statusLabel(status, t)
  const images = observation?.images ?? null
  const hasImages = images !== null && images.length > 0
  const expandable = hasImages || (observation?.text !== null && observation?.text !== undefined)
  const [expanded, setExpanded] = useState(hasImages)
  const open = expanded && expandable
  const toggleExpand = () => { setExpanded(v => !v) }
  const toggleFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!expandable || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    toggleExpand()
  }
  const leading = open
    ? <IconChevronDownOutline14 />
    : leadingFor(status, state)
  return (
    <div className={css.card}>
      <div
        className={css.root}
        data-computer-use-observation={status ?? undefined}
        data-expandable={expandable || undefined}
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={expandable ? open : undefined}
        onClick={expandable ? toggleExpand : undefined}
        onKeyDown={expandable ? toggleFromKeyboard : undefined}
      >
        <span className={css.leading}>{leading}</span>
        {label !== null && <span className={css.visuallyHidden}>{label}</span>}
        <span className={css.title}>{t('tool.title.computerUseObservation')}</span>
        <span className={css.sep} aria-hidden />
        <span className={clsx(css.summary, state === 'error' && css.errorSummary)}>
          {model.errorSummary ?? model.summary}
        </span>
        {label !== null && (
          <span
            className={clsx(
              css.badge,
              status === 'observed' && css.observed,
              status === 'running' && css.running,
              status === 'error' && css.error,
            )}
            data-computer-use-observation-label={status ?? undefined}
          >
            {label}
          </span>
        )}
      </div>
      {open && (
        <div className={css.bodyWrap} data-computer-use-observation-body>
          {hasImages && images !== null && (
            <>
              <div className={css.imageLabel}>{t('computerUse.screenshot')}</div>
              {images.map(({ attachment }) => (
                <ObservationImage
                  key={attachment.attachmentId}
                  attachment={attachment}
                  loadImage={loadImage}
                />
              ))}
            </>
          )}
          {observation?.text !== null && observation?.text !== undefined && (
            <div className={css.imageMeta}>{observation.text}</div>
          )}
        </div>
      )}
    </div>
  )
}

/** Registers the Host Pass computerUse screenshot observation toolview. */
export const computerUseObservationToolview = {
  name: 'computer-use-observation-toolview',
  inject: ['slots'],
  /**
   * Register the Pass screenshot observation row into the Tool-owned keyed view slot.
   * @param ctx - registrant context.
   */
  apply(ctx: Context): void {
    ctx.slots.inject('tool.call.toolview', () =>
      ctx.slots.register({
        name: 'tool.call.toolview',
        key: 'computer_use_pass_screenshot',
        locale: NS,
      }, ComputerUseObservationRow))
  },
}
