/** Turn-scoped Host mailbox attribution for Chat finals (T030 / FR-006). */

import type { Context } from '@deepseek-ai/cordis'
import type {
  ConversationNodeDefinition,
} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { isAppendSurfaceEvent } from '@deepseek-ai/dsh-session/surface'
import { readLinkedMailboxMessageId } from './event-projection.ts'

declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
  interface ConversationTurnDataMap {
    /** Host mailbox message id when a mid-turn team-message receipt caused work. */
    linkedMailboxMessageId: string
  }
}

/**
 * Publish Chat-turn `linkedMailboxMessageId` when a `team-message` receipt is
 * located inside an open Turn. Cold-resume receipts before `turn/start` stay
 * on turn-tail start via `reader.previous('input-message')`.
 */
export const linkedMailboxDefinition: ConversationNodeDefinition<string> = {
  kind: 'linkedMailboxMessageId',
  match: (event) => {
    if (event.type !== 'user/message' || !isAppendSurfaceEvent(event)) return null
    const linked = readLinkedMailboxMessageId(event.data.source)
    return linked === null ? null : { id: linked, role: 'start' }
  },
  start: (_context, match) => {
    if (match.event.type !== 'user/message') {
      throw new Error('linkedMailboxMessageId start requires user/message')
    }
    const linked = readLinkedMailboxMessageId(match.event.data.source)
    if (linked === null) {
      throw new Error('linkedMailboxMessageId start requires team-message source')
    }
    return linked
  },
  update: context => context.state,
  buildLocationData: (context, scope) => {
    if (scope !== 'turn' || context.state === undefined) return null
    const location = context.start?.location ?? context.matches[0]?.location
    const turn = location?.kind === 'turn' || location?.kind === 'step'
      ? location.turn.turn
      : undefined
    if (turn === undefined) return null
    return {
      kind: 'turn',
      turn,
      key: 'linkedMailboxMessageId',
      value: context.state,
    }
  },
}

/**
 * Register Host mailbox Chat-turn attribution publication.
 * @param ctx - owning UI Conversation context.
 */
export function registerLinkedMailboxConversationNode(ctx: Context): void {
  ctx.uiConversation.events.register(linkedMailboxDefinition)
}
