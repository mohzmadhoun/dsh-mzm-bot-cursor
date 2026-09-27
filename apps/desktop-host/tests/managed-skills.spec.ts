import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { expect, it } from 'vitest'
import * as desktopManagedSkills from '../src/managed-skills.ts'

it('mounts mzm-thin-pack from managed-skills and a Host-durable user skills root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'desktop-managed-skills-'))
  const ctx = new Context()
  try {
    const managed = join(root, 'managed-skills')
    const user = join(root, 'user-skills')
    await mkdir(join(managed, 'mzm-thin-pack'), { recursive: true })
    await writeFile(
      join(managed, 'mzm-thin-pack', 'SKILL.md'),
      [
        '---',
        'name: mzm-thin-pack',
        'description: MzM thin pack — single managed skill for Phase 3 Skills UX Pass.',
        '---',
        '',
        'Follow the MzM thin-pack playbook for Pass.',
        '',
      ].join('\n'),
    )
    await mkdir(user, { recursive: true })

    ctx.baseUrl = pathToFileURL(root).href + '/'
    await ctx.plugin(Loader)
    ctx.loader.builtins.include = Include
    expect('default' in desktopManagedSkills).toBe(false)
    expect(ctx.loader.unwrapExports(desktopManagedSkills)).toBe(desktopManagedSkills)
    const modules = new Map<string, unknown>([
      ['skills', SkillRegistry],
      ['managed-skills', desktopManagedSkills],
    ])
    ctx.loader.internal = {
      version: 'v2',
      async import(specifier: string) {
        if (!modules.has(specifier)) throw new Error(`unexpected plugin ${specifier}`)
        return modules.get(specifier)
      },
    } as unknown as NonNullable<typeof ctx.loader.internal>
    const config = join(root, 'cordis.yml')
    await writeFile(config, [
      '- name: skills',
      '- name: managed-skills',
      '  config:',
      `    managedRoot: ${JSON.stringify(managed)}`,
      `    userRoot: ${JSON.stringify(user)}`,
      '',
    ].join('\n'))
    await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(config).href } })
    await ctx.loader.await()
    for (const entry of ctx.loader.entries()) await entry.fiber?.await()

    const listed = await ctx.skills.list()
    expect(listed.map(skill => skill.name)).toContain('mzm-thin-pack')
    const thin = await ctx.skills.get('mzm-thin-pack')
    expect(thin?.content).toContain('Follow the MzM thin-pack playbook for Pass.')
    expect(thin?.source).toBe('bundled')

    const shipped = await readFile(
      new URL('../managed-skills/mzm-thin-pack/SKILL.md', import.meta.url),
      'utf8',
    )
    expect(shipped).toContain('name: mzm-thin-pack')
    expect(shipped).toContain('MzM thin pack')
    expect(shipped).toContain('Follow the MzM thin-pack playbook for Pass.')
  } finally {
    await ctx.fiber.dispose()
    await rm(root, { recursive: true, force: true })
  }
})
