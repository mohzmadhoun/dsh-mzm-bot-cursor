import { useMemo, useState, type KeyboardEvent } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import clsx from 'clsx'
import {
  IconApiOutline14, IconChevronDownOutline14, IconInspectOutline12, StateDot, TerminalBlock,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ToolCallViewProps } from '../../contract/slots.ts'
import {
  isSettledPersistentShellCall,
  isSpilledShellCall,
  localizeTerminalCardModel,
  terminalBlockLabels,
  terminalCardModel,
  terminalFailed,
} from '../models/terminal-card-model.ts'
import { shellBoxOutcome, type ShellBoxOutcome } from '../models/shell-box-outcome.ts'
import { formatToolBody, toolRowModel, type ToolRowState } from '../models/tool-call-model.ts'
import { CONVERSATION_NS as NS } from '../../locale.ts'
import css from './bash-sample.module.css'

type BashRowProps = ToolCallViewProps & PropsLocale<'conversation'>

function leadingFor(state: ToolRowState, outcome: ShellBoxOutcome | null) {
  if (outcome === 'not_ready') return <StateDot state="warning" />
  switch (state) {
    case 'error': return <StateDot state="error" />
    case 'stopped': return <StateDot state="warning" />
    default: return <IconApiOutline14 size={14} />
  }
}

function stateStatus(
  state: ToolRowState,
  outcome: ShellBoxOutcome | null,
  t: BashRowProps['t'],
): string | null {
  if (outcome === 'not_ready') return t('shellBox.notReady')
  if (outcome === 'success') return t('shellBox.success')
  switch (state) {
    case 'running': return t('bash.running')
    case 'error': return t('bash.failed')
    case 'stopped': return t('bash.stopped')
    default: return null
  }
}

function outcomeLabel(outcome: ShellBoxOutcome | null, t: BashRowProps['t']): string | null {
  switch (outcome) {
    case 'success': return t('shellBox.success')
    case 'not_ready': return t('shellBox.notReady')
    case 'error': return t('shellBox.error')
    default: return null
  }
}

/** Renders expandable Bash/Pwsh output with Shell/box success and not-ready indicators. */
export function BashRow({ toolName, block, sessionId, useSessions, inspect, t }: BashRowProps) {
  const model = toolRowModel(toolName, block)
  const cwd = useSessions(list => list.byId[sessionId]?.cwd)
  const terminalModel = terminalCardModel(block, cwd)
  const terminal = terminalModel === null ? null : localizeTerminalCardModel(terminalModel, t)
  const boxOutcome = shellBoxOutcome(toolName, block)
  const state: ToolRowState = boxOutcome === 'not_ready'
    ? 'stopped'
    : model.state === 'ok' && terminalModel !== null && terminalFailed(terminalModel)
      ? 'error'
      : model.state
  const status = stateStatus(state, boxOutcome, t)
  const boxLabel = outcomeLabel(boxOutcome, t)
  const [expanded, setExpanded] = useState(false)
  const genericBody = terminal === null
    && (model.state === 'error' || isSettledPersistentShellCall(block) || isSpilledShellCall(block))
    && (model.bodyRaw !== null || model.output !== null)
  const expandable = terminal !== null || genericBody
  const open = expanded && expandable
  const body = useMemo(
    () => open && genericBody && model.bodyRaw !== null
      ? formatToolBody(model.variant, model.bodyRaw)
      : null,
    [genericBody, model.bodyRaw, model.variant, open],
  )
  const failureLine = model.state === 'error' ? model.errorSummary : null
  const toggleExpand = () => { setExpanded(v => !v) }
  const toggleFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!expandable || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    toggleExpand()
  }
  const leading = open
    ? <IconChevronDownOutline14 className={css.chevron} />
    : expandable
      ? (
        <>
          <span className={css.iconIdle}>{leadingFor(state, boxOutcome)}</span>
          <IconChevronDownOutline14 className={clsx(css.chevron, css.chevronHover)} />
        </>
      )
      : leadingFor(state, boxOutcome)
  return (
    <div className={css.card}>
      <div
        className={css.root}
        data-sample="bash"
        data-variant="bash"
        data-state={state}
        data-shell-box-outcome={boxOutcome ?? undefined}
        data-expandable={expandable || undefined}
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={expandable ? open : undefined}
        onClick={expandable ? toggleExpand : undefined}
        onKeyDown={expandable ? toggleFromKeyboard : undefined}
      >
        <span className={css.leading}>{leading}</span>
        {status !== null && <span className={css.visuallyHidden}>{status}</span>}
        <span className={css.title}>{t(model.titleKey)}</span>
        <span className={css.sep} aria-hidden />
        <span className={clsx(
          css.summary,
          failureLine !== null && css.errorSummary,
          boxOutcome === 'not_ready' && css.notReadySummary,
        )}
        >
          {failureLine ?? terminal?.description ?? model.summary}
        </span>
        {boxLabel !== null && (
          <span
            className={clsx(
              css.shellBoxOutcome,
              boxOutcome === 'success' && css.shellBoxSuccess,
              boxOutcome === 'not_ready' && css.shellBoxNotReady,
              boxOutcome === 'error' && css.shellBoxError,
            )}
            data-shell-box-outcome-label={boxOutcome ?? undefined}
          >
            {boxLabel}
          </span>
        )}
      </div>
      {open && (
        <div className={css.bodyWrap}>
          {terminal !== null
            ? (
              <TerminalBlock
                {...terminal.card}
                maxLines={Infinity}
                labels={terminalBlockLabels(t)}
                className={css.terminal}
              />
            )
            : (
              <div className={css.ioCard}>
                {body !== null && (
                  <div className={css.ioSection}>
                    <span className={css.ioLabel}>{t('row.input')}</span>
                    <span className={css.ioText}>{body}</span>
                  </div>
                )}
                {body !== null && model.output !== null && (
                  <span className={css.ioDivider} aria-hidden />
                )}
                {model.output !== null && (
                  <div className={css.ioSection}>
                    <span className={css.ioLabel}>{t('row.output')}</span>
                    <span className={css.ioText} data-error={state === 'error' || undefined}>
                      {model.output}
                    </span>
                  </div>
                )}
              </div>
            )}
          {inspect !== undefined && (
            <button type="button" className={css.inspectButton} onClick={inspect}>
              <IconInspectOutline12 />
              {t('row.inspect')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** Registers Bash and Pwsh conversation-row Shell/box projections (Path A). */
export const bashToolviewSample = {
  name: 'bash-toolview-sample',
  inject: ['slots'],
  apply(ctx: Context): void {
    ctx.slots.inject('tool.call.toolview', function* () {
      yield ctx.slots.register({ name: 'tool.call.toolview', key: 'bash', locale: NS }, BashRow)
      yield ctx.slots.register({ name: 'tool.call.toolview', key: 'pwsh', locale: NS }, BashRow)
    })
  },
}
