/** Config smoke: Desktop `$DSH_HOME/profiles/desktop` mounts Agent Teams mailbox layers. */

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, expect, it } from 'vitest'
import { composeEntries, loadProfileDirectory, OPTIONAL_BUNDLES } from '@deepseek-ai/dsh-app-boot'
import { createPluginProfile, DESKTOP_PROFILE_BUNDLES } from '../src/project-manager.ts'

const homes: string[] = []
afterEach(() => {
  for (const home of homes.splice(0)) rmSync(home, { recursive: true, force: true })
})

it('composes Agent Teams Host mailbox and Client panel rows for the Desktop profile', () => {
  expect(DESKTOP_PROFILE_BUNDLES).toEqual([
    '@deepseek-ai/dsh-base',
    '@deepseek-ai/dsh-web-app',
    ...OPTIONAL_BUNDLES,
  ])
  const home = mkdtempSync(join(tmpdir(), 'dsh-desktop-agent-teams-'))
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
  expect(rows.find(row => row.id === 'agent-team')).toMatchObject({
    id: 'agent-team',
    name: '@deepseek-ai/dsh-experimental-agent-team',
  })
  expect(rows.find(row => row.id === 'tool-agent-team')).toMatchObject({
    id: 'tool-agent-team',
    name: '@deepseek-ai/dsh-experimental-tool-agent-team',
  })
  expect(rows.find(row => row.id === 'ui-agent-team')).toMatchObject({
    id: 'ui-agent-team',
    name: '@deepseek-ai/dsh-experimental-client-ui-agent-team',
  })
  expect(rows.find(row => row.id === 'tool-subagent')?.disabled).toBe(true)
  expect(warnings).toEqual([])
})
