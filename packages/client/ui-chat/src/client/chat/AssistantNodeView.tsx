import { memo, useCallback, useMemo } from 'react'
import type { ChatNodeViewProps, TurnTailOwnerProps } from '../contract/slots.ts'
import { AssistantMarkdown } from './AssistantMarkdown.tsx'

/** Streaming, settled, and interrupted Assistant states share one keyed renderer instance. */
export const AssistantNodeView = memo(function AssistantNodeView({
  node, useTurnData, turnProcess, openFile, renderMessageImages, fileMentions, t,
}: ChatNodeViewProps<'assistant-step'>) {
  const data = node.data
  const turn = node.location.kind === 'turn' || node.location.kind === 'step'
    ? node.location.turn
    : undefined
  const tail = useTurnData('turn-tail')
  // Mid-turn team-message steer publishes this Location key; cold-resume lands
  // on turn-tail (peer Location data is not visible in the same flush).
  const linkedFromTurn = useTurnData('linkedMailboxMessageId')
  const owner = useMemo<TurnTailOwnerProps | undefined>(() => {
    if (turn?.status !== 'closed' || data.finalNode === undefined) return undefined
    if (tail?.closing?.finalNode.seq !== data.finalNode.seq) return undefined
    return { turn, seq: data.finalNode.seq, openFile }
  }, [data.finalNode, openFile, tail, turn])
  const mentions = useMemo(
    () => owner === undefined ? undefined : fileMentions(owner),
    [fileMentions, owner],
  )
  const reasoningHidden = turnProcess !== undefined
    && turnProcess.foldable
    && turnProcess.spec.answerStep === data.step
    && turnProcess.spec.inlineReasoning
    && !turnProcess.open
  const revealProcess = useCallback(() => { turnProcess?.setOpen(true) }, [turnProcess])
  // Final delivery + mailbox attribution ride Host session-log / turn Location —
  // never Electron IPC (contracts/chat-progress-final.md, T030).
  const finalDelivery = data.status !== 'running' && data.finalNode !== undefined
  const isClosingFinal = finalDelivery
    && tail?.closing?.finalNode.seq === data.finalNode?.seq
  const linkedMailboxMessageId = !finalDelivery
    ? undefined
    : typeof linkedFromTurn === 'string' && linkedFromTurn.length > 0
      ? linkedFromTurn
      : isClosingFinal
        ? tail?.linkedMailboxMessageId
        : undefined
  return (
    <AssistantMarkdown
      blocks={data.blocks}
      streaming={data.status === 'running'}
      interrupted={data.status === 'interrupted'}
      finalDelivery={finalDelivery}
      linkedMailboxMessageId={linkedMailboxMessageId}
      renderMessageImages={renderMessageImages}
      reasoningHidden={reasoningHidden}
      revealProcess={revealProcess}
      mentions={mentions}
      t={t}
    />
  )
})
