/**
 * computerUse-class subagent parent handoff toolview (P7 T022).
 * Projects Host subagent progress/result over HTTP/WS — never Electron Main SoT.
 * Ordinary subagent paths keep a generic subagent card; computerUse-class paths
 * (Host meta / args) show the SC-002 handoff indicator.
 */
import type { Context } from '@deepseek-ai/cordis'
import clsx from 'clsx'
import { IconBranchOutline16, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ToolCallViewProps } from '../../contract/slots.ts'
import {
  computerUseHandoff,
  type ComputerUseHandoffStatus,
} from '../models/computer-use-handoff.ts'
import { parsedToolCall } from '../models/raw-tool-call.ts'
import { toolRowModel, type ToolRowState } from '../models/tool-call-model.ts'
import { CONVERSATION_NS as NS } from '../../locale.ts'
import css from './computer-use-cards.module.css'

type SubagentRowProps = ToolCallViewProps & PropsLocale<'conversation'>

function leadingFor(status: ComputerUseHandoffStatus | null, state: ToolRowState) {
  if (status === 'error' || state === 'error') return <StateDot state="error" />
  if (status === 'running' || state === 'running') return <StateDot state="ongoing" />
  return <IconBranchOutline16 size={14} />
}

function handoffLabel(
  status: ComputerUseHandoffStatus | null,
  t: SubagentRowProps['t'],
): string | null {
  switch (status) {
    case 'handoff': return t('computerUse.handoff')
    case 'running': return t('computerUse.handoffRunning')
    case 'error': return t('computerUse.handoffError')
    default: return null
  }
}

/**
 * Summary prefers Host description arg, then model-derived summary / output.
 * @param block - tool block.
 * @param modelSummary - generic row summary.
 * @param modelOutput - settled result text.
 * @param errorSummary - error first line when failed.
 * @returns one-line summary for the collapsed row.
 */
function summaryLine(
  block: ToolCallViewProps['block'],
  modelSummary: string,
  modelOutput: string | null,
  errorSummary: string | null,
): string {
  if (errorSummary !== null) return errorSummary
  const parsed = parsedToolCall(block)
  const description = parsed?.args.description
  if (typeof description === 'string' && description.trim() !== '') return description.trim()
  if (modelOutput !== null && modelOutput.trim() !== '') return modelOutput.trim()
  return modelSummary
}

/**
 * Render parent-visible subagent card; stamps computerUse handoff when Host marks the path.
 * @param props - toolview runtime share and locale.
 */
export function ComputerUseSubagentRow({
  toolName, block, t,
}: SubagentRowProps) {
  const model = toolRowModel(toolName, block)
  const handoff = computerUseHandoff(toolName, block)
  const status = handoff?.status ?? null
  const state: ToolRowState = status === 'error'
    ? 'error'
    : status === 'running'
      ? 'running'
      : model.state
  const label = handoffLabel(status, t)
  const summary = summaryLine(block, model.summary, model.output, model.errorSummary)
  return (
    <div className={css.card}>
      <div
        className={css.root}
        data-subagent-card
        data-computer-use-handoff={status ?? undefined}
        data-computer-use-child-id={handoff?.childId ?? undefined}
      >
        <span className={css.leading}>{leadingFor(status, state)}</span>
        {label !== null && <span className={css.visuallyHidden}>{label}</span>}
        <span className={css.title}>{t('tool.title.subagent')}</span>
        <span className={css.sep} aria-hidden />
        <span className={clsx(css.summary, state === 'error' && css.errorSummary)}>
          {summary}
        </span>
        {label !== null && (
          <span
            className={clsx(
              css.badge,
              status === 'handoff' && css.handoff,
              status === 'running' && css.running,
              status === 'error' && css.error,
            )}
            data-computer-use-handoff-label={status ?? undefined}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

/** Registers the Path A subagent toolview (computerUse handoff when Host marks it). */
export const computerUseSubagentToolview = {
  name: 'computer-use-subagent-toolview',
  inject: ['slots'],
  /**
   * Register the subagent row into the Tool-owned keyed view slot.
   * @param ctx - registrant context.
   */
  apply(ctx: Context): void {
    ctx.slots.inject('tool.call.toolview', () =>
      ctx.slots.register({
        name: 'tool.call.toolview',
        key: 'subagent',
        locale: NS,
      }, ComputerUseSubagentRow))
  },
}
