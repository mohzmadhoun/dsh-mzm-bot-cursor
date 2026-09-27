/** Source-safe Agent Teams browser registration and Remote mount lifecycle. */

import type {
  AssignSectionInput,
  CreateBotInput,
  CreateSectionInput,
  DeleteBotInput,
  RenameBotInput,
  RenameSectionInput,
  SetAvatarInput,
  TeamMemberView as TeamRosterMember,
  TeamView,
  UpdatePersonaInput,
} from '@deepseek-ai/dsh-experimental-agent-team/client'
import type {} from '@deepseek-ai/dsh-experimental-agent-team/remote'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import {
  HandoffNotices, type HandoffNoticesInjected,
} from './HandoffNotices.tsx'
import {
  TeamAction, type TeamActionInjected, type TeamActionResult,
  type TeamAssignSectionActionResult, type TeamCreateBotActionResult,
  type TeamCreateSectionActionResult, type TeamDeleteBotActionResult,
  type TeamRenameBotActionResult, type TeamRenameSectionActionResult,
  type TeamSetAvatarActionResult, type TeamTaskActionResult, type TeamUpdatePersonaActionResult,
} from './TeamAction.tsx'
import { en, NS, zh, type TeamKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Agent Teams roster, sections, bot-create, persona/rename/avatar/delete editors, and task-board copy. */
    'agent-team': TeamKey
  }
}

/** Required browser services for RPC, navigation, slots, and localized copy. */
export const inject = ['sessions', 'uiWorkspace', 'remote', 'slots', 'locale']

function registerUi(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'client-ui-agent-team: dictionaries')
  // Host `dsh-session` and Client session-controller both merge `Context.sessions`;
  // this browser plugin reads the Client `ISessions` face.
  const sessions = ctx.sessions as unknown as ISessions
  const leadSessionId = (sessionId: SessionId): SessionId => {
    const address = sessions.binding(sessionId)?.session.getSnapshot().subagent?.address
    return address?.parentSessionId ?? sessionId
  }

  const actions: TeamActionInjected = {
    async load(sessionId): Promise<TeamActionResult<TeamView>> {
      return await ctx.remote.agentTeams.view(leadSessionId(sessionId))
    },
    async createBot(sessionId, input: CreateBotInput): Promise<TeamCreateBotActionResult> {
      return await ctx.remote.agentTeams.createBot(leadSessionId(sessionId), input)
    },
    async updatePersona(sessionId, input: UpdatePersonaInput): Promise<TeamUpdatePersonaActionResult> {
      return await ctx.remote.agentTeams.updatePersona(leadSessionId(sessionId), input)
    },
    async renameBot(sessionId, input: RenameBotInput): Promise<TeamRenameBotActionResult> {
      return await ctx.remote.agentTeams.renameBot(leadSessionId(sessionId), input)
    },
    async setAvatar(sessionId, input: SetAvatarInput): Promise<TeamSetAvatarActionResult> {
      return await ctx.remote.agentTeams.setAvatar(leadSessionId(sessionId), input)
    },
    async deleteBot(sessionId, input: DeleteBotInput): Promise<TeamDeleteBotActionResult> {
      return await ctx.remote.agentTeams.deleteBot(leadSessionId(sessionId), input)
    },
    async createSection(sessionId, input: CreateSectionInput): Promise<TeamCreateSectionActionResult> {
      return await ctx.remote.agentTeams.createSection(leadSessionId(sessionId), input)
    },
    async renameSection(sessionId, input: RenameSectionInput): Promise<TeamRenameSectionActionResult> {
      return await ctx.remote.agentTeams.renameSection(leadSessionId(sessionId), input)
    },
    async assignSection(sessionId, input: AssignSectionInput): Promise<TeamAssignSectionActionResult> {
      return await ctx.remote.agentTeams.assignSection(leadSessionId(sessionId), input)
    },
    async createTask(sessionId, input): Promise<TeamTaskActionResult> {
      return await ctx.remote.agentTeams.createTask(leadSessionId(sessionId), input)
    },
    async updateTask(sessionId, input) {
      const { owner, ...rest } = input
      return await ctx.remote.agentTeams.updateTask(leadSessionId(sessionId), {
        ...rest,
        ...owner === undefined ? {} : { owner },
      })
    },
    async openTeammate(sessionId: SessionId, member: TeamRosterMember): Promise<void> {
      if (member.role !== 'teammate') return
      const parentSessionId = leadSessionId(sessionId)
      await sessions.refreshSubagents(parentSessionId)
      if ((sessions.retainInfo(sessionId).getSnapshot().retainedBy.mainView ?? 0) === 0) return
      ctx.uiWorkspace.openSession({
        parentSessionId,
        childSessionId: member.id,
        mode: 'continuable',
      })
    },
    // Models section id matches ui-settings-models; optional when settings shell absent.
    openModelsSettings: () => {
      ctx.get('settingsShell')?.openSection('models')
    },
  }

  ctx.slots.inject(
    'conversation.session.header.actions',
    () => ctx.slots.register({
      name: 'conversation.session.header.actions',
      id: 'agent-team',
      order: 20,
      locale: NS,
      inject: () => actions,
    }, TeamAction),
  )

  const notices: HandoffNoticesInjected = {
    load: actions.load,
    openTeammate: actions.openTeammate,
  }
  // Sticky strip between Chat View and composer — Host TeamView.handoffs only.
  ctx.slots.inject(
    'conversation.session.notices',
    () => ctx.slots.register({
      name: 'conversation.session.notices',
      id: 'agent-team-handoffs',
      order: 10,
      locale: NS,
      inject: () => notices,
    }, HandoffNotices),
  )
}

/**
 * Mount one generated Team Remote contribution, then register its browser UI.
 * @param ctx - Client Context carrying navigation, locale, slot, and Remote services.
 * @param contribution - generated Team descriptors selected by the browser entry.
 * @returns disposer for both the UI registrations and Remote namespace.
 */
export async function mountAgentTeamUi(
  ctx: ClientContext,
  contribution: TypertRemoteContribution,
): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(contribution)
  const ui = ctx.inject(['sessions', 'uiWorkspace', 'remote.agentTeams', 'slots', 'locale'], registerUi)
  try {
    await ui
  } catch (error) {
    await ui.dispose()
    await disposeRemote()
    throw error
  }
  return async () => {
    await ui.dispose()
    await disposeRemote()
  }
}
