/**
 * T028 session-chrome inventory: Desktop Host profile composes create-bot +
 * assign-model into operable Web session chrome under Electron — no cordis.yml
 * edit on the happy path. Leaves ui-settings-models credential UX to T033/T035.
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

describe('Desktop session chrome create/assign (T028)', () => {
  it('composes Web session chrome Client rows plus Agent Teams create UI without a profile patch', () => {
    const home = mkdtempSync(join(tmpdir(), 'dsh-desktop-session-chrome-'))
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

    // packages/client session chrome (from dsh-web-app) — assign-model seat + header host.
    expect(rows.find(row => row.id === 'ui-conversation')).toMatchObject({
      id: 'ui-conversation',
      name: '@deepseek-ai/dsh-client-ui-conversation',
    })
    expect(rows.find(row => row.id === 'ui-model-selection')).toMatchObject({
      id: 'ui-model-selection',
      name: '@deepseek-ai/dsh-client-ui-model-selection',
    })
    // Experimental Agent Teams Web layer (Desktop-enabled) — create-bot + model assign form.
    expect(rows.find(row => row.id === 'ui-agent-team')).toMatchObject({
      id: 'ui-agent-team',
      name: '@deepseek-ai/dsh-experimental-client-ui-agent-team',
    })

    // Happy path: empty user patch — no cordis.yml editing required.
    const patch = readFileSync(join(profileDir, 'cordis.patch.yml'), 'utf8')
    expect(patch.replaceAll('\r\n', '\n').trimEnd()).toMatch(/\n\[\]$/)
    expect(patch).not.toMatch(/createBot|modelSelection|ui-agent-team|ui-model-selection/)
    expect(warnings).toEqual([])
  })

  it('keeps create-bot + assign-model on Client session chrome slots, not Electron Main', () => {
    const teamMount = readWorkspace('packages/experimental/client-ui-agent-team/src/client/mount.ts')
    const teamAction = readWorkspace('packages/experimental/client-ui-agent-team/src/client/TeamAction.tsx')
    const modelSelection = readWorkspace('packages/client/ui-model-selection/src/client/index.ts')
    const main = readWorkspace('apps/desktop/src/main.ts')

    expect(teamMount).toContain("'conversation.session.header.actions'")
    expect(teamMount).toContain("id: 'agent-team'")
    expect(teamMount).toMatch(/createBot\s*\(/)
    expect(teamMount).toContain('agentTeams.createBot')

    expect(teamAction).toContain('data-team-create-bot')
    expect(teamAction).toMatch(/aria-label=\{t\('displayName'\)\}/)
    expect(teamAction).toMatch(/aria-label=\{t\('provider'\)\}/)
    expect(teamAction).toMatch(/aria-label=\{t\('modelId'\)\}/)
    expect(teamAction).toContain('modelSelection:')

    expect(modelSelection).toContain("'conversation.input.model'")
    expect(modelSelection).toContain('directory.select')

    expect(main).not.toMatch(/\bcreateBot\b/)
    expect(main).not.toMatch(/\bModelSelection\b/)
    expect(main).not.toMatch(/conversation\.session\.header\.actions/)
    expect(main).not.toMatch(/conversation\.input\.model/)
  })
})
