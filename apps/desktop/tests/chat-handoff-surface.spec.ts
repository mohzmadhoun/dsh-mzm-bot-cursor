/**
 * T031 chat-handoff surface inventory: Desktop Host profile wires US2 Host
 * mailbox projections (client-ui-agent-team → conversation.session.notices +
 * ui-chat handoff rows) so 1:1 handoff / recipient action is understandable
 * without leaving the app. No Main-synthesized mailbox IPC.
 */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { composeEntries, loadProfileDirectory } from '@deepseek-ai/dsh-app-boot'
import { createPluginProfile, DESKTOP_PROFILE_BUNDLES } from '../src/project-manager.ts'

const ROOT = process.cwd()
const homes: string[] = []

afterEach(() => {
  for (const home of homes.splice(0)) rmSync(home, { recursive: true, force: true })
})

function readWorkspace(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8')
}

describe('Desktop chat handoff surface (T031)', () => {
  it('composes ui-chat, ui-conversation, and ui-agent-team without a profile patch', () => {
    const home = mkdtempSync(join(tmpdir(), 'dsh-desktop-chat-handoff-'))
    homes.push(home)
    const profileDir = join(home, 'profiles', 'desktop')
    createPluginProfile(profileDir)

    const installAnchor = fileURLToPath(new URL('../../cli/package.json', import.meta.url))
    const profile = loadProfileDirectory('dsh desktop', profileDir, installAnchor)
    expect(profile.layers.map(layer => layer.packageName)).toEqual([...DESKTOP_PROFILE_BUNDLES])

    const warnings: string[] = []
    const rows = composeEntries([
      ...profile.layers.map(layer => layer.patches),
      profile.patches,
    ], message => warnings.push(message))

    expect(rows.find(row => row.id === 'ui-chat')).toMatchObject({
      id: 'ui-chat',
      name: '@deepseek-ai/dsh-client-ui-chat',
    })
    expect(rows.find(row => row.id === 'ui-conversation')).toMatchObject({
      id: 'ui-conversation',
      name: '@deepseek-ai/dsh-client-ui-conversation',
    })
    expect(rows.find(row => row.id === 'ui-agent-team')).toMatchObject({
      id: 'ui-agent-team',
      name: '@deepseek-ai/dsh-experimental-client-ui-agent-team',
    })

    const patch = readFileSync(join(profileDir, 'cordis.patch.yml'), 'utf8')
    expect(patch.replaceAll('\r\n', '\n').trimEnd()).toMatch(/\n\[\]$/)
    expect(patch).not.toMatch(/handoff|mailbox|ui-agent-team|ui-chat/)
    expect(warnings).toEqual([])
  })

  it('wires Host TeamView.handoffs into conversation.session.notices and chat rows', () => {
    const teamMount = readWorkspace('packages/experimental/client-ui-agent-team/src/client/mount.ts')
    const notices = readWorkspace('packages/experimental/client-ui-agent-team/src/client/HandoffNotices.tsx')
    const conversation = readWorkspace(
      'packages/client/ui-conversation/src/client/skeleton/ConversationContent.tsx',
    )
    const conversationSlots = readWorkspace(
      'packages/client/ui-conversation/src/client/contract/slots.ts',
    )
    const chatRow = readWorkspace('packages/client/ui-chat/src/client/chat/MailboxHandoffRow.tsx')
    const messageItem = readWorkspace('packages/client/ui-chat/src/client/chat/MessageItem.tsx')
    const main = readWorkspace('apps/desktop/src/main.ts')
    const ipc = readWorkspace('apps/desktop/src/ipc.ts')

    expect(teamMount).toContain("'conversation.session.notices'")
    expect(teamMount).toContain("id: 'agent-team-handoffs'")
    expect(teamMount).toContain('HandoffNotices')
    expect(teamMount).toContain('openTeammate')
    expect(teamMount).toContain('agentTeams.view')

    expect(notices).toContain('data-chat-handoff-notices')
    expect(notices).toContain('data-handoff-source={handoff.source.kind}')
    expect(notices).toContain('deliveryState.acted')
    expect(notices).toContain('openTeammate')

    expect(conversationSlots).toContain("'conversation.session.notices'")
    expect(conversation).toContain("renderSlot('conversation.session.notices'")

    expect(chatRow).toContain('data-chat-handoff')
    expect(chatRow).toContain('data-handoff-source="host-mailbox"')
    expect(messageItem).toContain('chatHandoffDeliveryState')
    expect(messageItem).toContain('MailboxHandoffRow')

    // Main may name the absence of mailbox in JSDoc; forbid product routers / channels.
    expect(main).not.toMatch(/\bSendTeamMessage\b/)
    expect(main).not.toMatch(/\bagentTeams\b/)
    expect(main).not.toMatch(/dsh-desktop:(?:mailbox|bot-message|handoff)/i)
    expect(ipc).toMatch(/no mailbox/i)
    expect(ipc).not.toMatch(/dsh-desktop:(?:mailbox|bot-message|handoff)/i)
  })
})
