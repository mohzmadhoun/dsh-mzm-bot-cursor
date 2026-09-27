import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { writeSkillBundle } from '../src/write-skill-bundle.ts'

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('writeSkillBundle', () => {
  it('writes a directory-bundle SKILL.md under the Host user skills root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-write-skill-'))
    roots.push(root)
    const path = await writeSkillBundle(root, {
      name: 'my-playbook',
      description: 'My Playbook',
      body: 'Do the thing.',
    })
    expect(path).toBe(join(root, 'my-playbook', 'SKILL.md'))
    const content = await readFile(path, 'utf8')
    expect(content).toContain('name: my-playbook')
    expect(content).toContain('description: My Playbook')
    expect(content).toContain('Do the thing.')
  })

  it('rejects invalid skill names and empty description or body without writing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-write-skill-reject-'))
    roots.push(root)
    await expect(writeSkillBundle(root, {
      name: 'Not Valid',
      description: 'desc',
      body: 'body',
    })).rejects.toThrow(/kebab-case/)
    await expect(writeSkillBundle(root, {
      name: 'ok-name',
      description: '   ',
      body: 'body',
    })).rejects.toThrow(/description must be non-empty/)
    await expect(writeSkillBundle(root, {
      name: 'ok-name',
      description: 'desc',
      body: '\n\t',
    })).rejects.toThrow(/body must be non-empty/)
    await expect(readFile(join(root, 'ok-name', 'SKILL.md'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  it('overwrites an existing bundle on update', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-write-skill-update-'))
    roots.push(root)
    await writeSkillBundle(root, {
      name: 'edit-me',
      description: 'First',
      body: 'First body.',
    })
    await writeSkillBundle(root, {
      name: 'edit-me',
      description: 'Second',
      body: 'Second body.',
    })
    const content = await readFile(join(root, 'edit-me', 'SKILL.md'), 'utf8')
    expect(content).toContain('description: Second')
    expect(content).toContain('Second body.')
    expect(content).not.toContain('First body.')
  })
})
