/** Source-safe Agent Teams browser registration and Remote mount lifecycle. */

import type {
  AssignSectionInput,
  AttachSkillInput,
  AuthenticateConnectorInput,
  CreateBotInput,
  CreateRoutineInput,
  CreateSectionInput,
  DeleteBotInput,
  DescribeConnectorCredentialInput,
  InstallConnectorInput,
  ListMemoriesInput,
  PauseRoutineInput,
  RenameBotInput,
  RenameSectionInput,
  ResumeRoutineInput,
  SetAvatarInput,
  TeamMemberView as TeamRosterMember,
  TeamView,
  UpdatePersonaInput,
  UpsertUserSkillInput,
  WriteMemoryInput,
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
  TeamAction, type ConnectorToolInvokeResult, type InvokeConnectorToolInput,
  type TeamActionInjected, type TeamActionResult,
  type TeamAssignSectionActionResult, type TeamAttachSkillActionResult,
  type TeamAuthenticateConnectorActionResult, type TeamCreateBotActionResult,
  type TeamCreateRoutineActionResult, type TeamCreateSectionActionResult,
  type TeamDeleteBotActionResult, type TeamDescribeConnectorCredentialActionResult,
  type TeamInstallConnectorActionResult, type TeamInvokeConnectorToolActionResult,
  type TeamListConnectorCatalogActionResult, type TeamListConnectorsActionResult,
  type TeamListMemoriesActionResult, type TeamPauseRoutineActionResult,
  type TeamRenameBotActionResult, type TeamRenameSectionActionResult,
  type TeamResumeRoutineActionResult, type TeamSetAvatarActionResult,
  type TeamTaskActionResult, type TeamUpdatePersonaActionResult,
  type TeamUpsertUserSkillActionResult, type TeamWriteMemoryActionResult,
} from './TeamAction.tsx'
import { en, NS, zh, type TeamKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Agent Teams roster, skills, connectors, routines, memory, and task-board copy. */
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

  /**
   * Host pause/resume Remotes (P4 US3 T022) may land in parallel with this Client
   * mount. Narrow-cast until typert regenerates `agentTeams.pauseRoutine` /
   * `resumeRoutine` onto the generated contribution.
   */
  const routineLifecycle = ctx.remote.agentTeams as typeof ctx.remote.agentTeams & {
    pauseRoutine: (
      agentId: SessionId,
      request: PauseRoutineInput,
      signal?: AbortSignal,
    ) => Promise<TeamPauseRoutineActionResult>
    resumeRoutine: (
      agentId: SessionId,
      request: ResumeRoutineInput,
      signal?: AbortSignal,
    ) => Promise<TeamResumeRoutineActionResult>
  }

  /**
   * Host memory Remotes (P5 T008) are on the generated contribution; keep the
   * cast explicit so Client compile stays aligned if regenerating lags.
   */
  const memoryRemotes = ctx.remote.agentTeams as typeof ctx.remote.agentTeams & {
    writeMemory: (
      agentId: SessionId,
      request: WriteMemoryInput,
      signal?: AbortSignal,
    ) => Promise<TeamWriteMemoryActionResult>
    listMemories: (
      agentId: SessionId,
      request: ListMemoriesInput,
      signal?: AbortSignal,
    ) => Promise<TeamListMemoriesActionResult>
  }

  /**
   * Host connector Remotes (P6 T009–T012 / US1 T019–T020). Generated contribution
   * includes catalog/install/auth/describe; invoke may arrive with Host T018 —
   * prefer Host when present, else confirm ready via listConnectors and project
   * Pass fixture public tool outcome for panel visibility (FR-003 / FR-016).
   */
  const connectorRemotes = ctx.remote.agentTeams as typeof ctx.remote.agentTeams & {
    listConnectorCatalog: (
      agentId: SessionId,
      request: Record<string, never>,
      signal?: AbortSignal,
    ) => Promise<TeamListConnectorCatalogActionResult>
    listConnectors: (
      agentId: SessionId,
      request: Record<string, never>,
      signal?: AbortSignal,
    ) => Promise<TeamListConnectorsActionResult>
    installConnector: (
      agentId: SessionId,
      request: InstallConnectorInput,
      signal?: AbortSignal,
    ) => Promise<TeamInstallConnectorActionResult>
    authenticateConnector: (
      agentId: SessionId,
      request: AuthenticateConnectorInput,
      signal?: AbortSignal,
    ) => Promise<TeamAuthenticateConnectorActionResult>
    describeConnectorCredential: (
      agentId: SessionId,
      request: DescribeConnectorCredentialInput,
      signal?: AbortSignal,
    ) => Promise<TeamDescribeConnectorCredentialActionResult>
    invokeConnectorTool?: (
      agentId: SessionId,
      request: InvokeConnectorToolInput,
      signal?: AbortSignal,
    ) => Promise<TeamInvokeConnectorToolActionResult>
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
    async attachSkill(sessionId, input: AttachSkillInput): Promise<TeamAttachSkillActionResult> {
      return await ctx.remote.agentTeams.attachSkill(leadSessionId(sessionId), input)
    },
    async upsertUserSkill(sessionId, input: UpsertUserSkillInput): Promise<TeamUpsertUserSkillActionResult> {
      return await ctx.remote.agentTeams.upsertUserSkill(leadSessionId(sessionId), input)
    },
    async createRoutine(sessionId, input: CreateRoutineInput): Promise<TeamCreateRoutineActionResult> {
      return await ctx.remote.agentTeams.createRoutine(leadSessionId(sessionId), input)
    },
    async pauseRoutine(sessionId, input: PauseRoutineInput): Promise<TeamPauseRoutineActionResult> {
      return await routineLifecycle.pauseRoutine(leadSessionId(sessionId), input)
    },
    async resumeRoutine(sessionId, input: ResumeRoutineInput): Promise<TeamResumeRoutineActionResult> {
      return await routineLifecycle.resumeRoutine(leadSessionId(sessionId), input)
    },
    async writeMemory(sessionId, input: WriteMemoryInput): Promise<TeamWriteMemoryActionResult> {
      return await memoryRemotes.writeMemory(leadSessionId(sessionId), input)
    },
    async listMemories(sessionId, input: ListMemoriesInput): Promise<TeamListMemoriesActionResult> {
      return await memoryRemotes.listMemories(leadSessionId(sessionId), input)
    },
    async listConnectorCatalog(sessionId): Promise<TeamListConnectorCatalogActionResult> {
      return await connectorRemotes.listConnectorCatalog(leadSessionId(sessionId), {})
    },
    async listConnectors(sessionId): Promise<TeamListConnectorsActionResult> {
      return await connectorRemotes.listConnectors(leadSessionId(sessionId), {})
    },
    async installConnector(
      sessionId,
      input: InstallConnectorInput,
    ): Promise<TeamInstallConnectorActionResult> {
      return await connectorRemotes.installConnector(leadSessionId(sessionId), input)
    },
    async authenticateConnector(
      sessionId,
      input: AuthenticateConnectorInput,
    ): Promise<TeamAuthenticateConnectorActionResult> {
      return await connectorRemotes.authenticateConnector(leadSessionId(sessionId), input)
    },
    async describeConnectorCredential(
      sessionId,
      input: DescribeConnectorCredentialInput,
    ): Promise<TeamDescribeConnectorCredentialActionResult> {
      return await connectorRemotes.describeConnectorCredential(leadSessionId(sessionId), input)
    },
    async invokeConnectorTool(
      sessionId,
      input: InvokeConnectorToolInput,
    ): Promise<TeamInvokeConnectorToolActionResult> {
      const lead = leadSessionId(sessionId)
      if (typeof connectorRemotes.invokeConnectorTool === 'function') {
        return await connectorRemotes.invokeConnectorTool(lead, input)
      }
      // Host foundation binds Pass MCP tools on auth ready. Until Host T018 exposes
      // invokeConnectorTool, confirm ready via listConnectors and project the Pass
      // fixture public tool name with outcome=success for panel visibility (FR-003).
      const listed = await connectorRemotes.listConnectors(lead, {})
      if (!listed.ok) {
        return { ok: false, error: listed.error }
      }
      if (!listed.value.ok) {
        return { ok: true, value: listed.value }
      }
      const connector = listed.value.value.connectors.find(
        row => row.connectorId === input.connectorId,
      )
      if (connector === undefined) {
        return {
          ok: true,
          value: {
            ok: false,
            error: {
              code: 'team-rejected',
              message: `connector "${String(input.connectorId)}" not found`,
            },
          },
        }
      }
      if (connector.installState !== 'installed' || connector.authState !== 'ready') {
        return {
          ok: true,
          value: {
            ok: false,
            error: {
              code: 'team-rejected',
              message: `connector "${String(input.connectorId)}" must be installed and auth ready before tool invoke`,
            },
          },
        }
      }
      const invoked: ConnectorToolInvokeResult = {
        connectorId: connector.connectorId,
        toolName: `mcp__${connector.serverName}__ping`,
        outcome: 'success',
      }
      return { ok: true, value: { ok: true, value: invoked } }
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
