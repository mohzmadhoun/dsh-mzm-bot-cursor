/**
 * Host-durable user-skill authoring helper for directory-bundle `SKILL.md` roots.
 * Agent Teams (and Desktop Host) call this after FR-013 validation; Electron Main
 * must not invent skill files.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { stringify as stringifyYaml } from 'yaml'
import { isSkillName } from '@deepseek-ai/dsh-skill'

/** Fields written into one user-authored skill directory bundle. */
export interface WriteSkillBundleInput {
  /** Kebab-case skill id (directory name + frontmatter `name`). */
  readonly name: string
  /** Short discovery description (frontmatter `description`). */
  readonly description: string
  /** Instructional Markdown body after the frontmatter fence. */
  readonly body: string
}

/**
 * Persist one directory-bundle skill under a Host-owned skill root.
 * Creates `<root>/<name>/SKILL.md` with YAML frontmatter `name` + `description`
 * and the instructional body. Callers MUST validate non-empty product fields
 * before invoking (FR-013); this helper rejects invalid skill names only.
 * @param root - absolute Host-durable user (or custom) skills root.
 * @param skill - kebab name, description, and instructional body.
 * @returns absolute path of the written `SKILL.md`.
 */
export async function writeSkillBundle(
  root: string,
  skill: WriteSkillBundleInput,
): Promise<string> {
  if (!isSkillName(skill.name)) {
    throw new TypeError(`skill name "${skill.name}" is not a valid kebab-case skill id`)
  }
  const description = skill.description.trim()
  if (description.length === 0) {
    throw new TypeError('skill description must be non-empty')
  }
  const body = skill.body.trim()
  if (body.length === 0) {
    throw new TypeError('skill body must be non-empty')
  }
  const directory = join(root, skill.name)
  await mkdir(directory, { recursive: true })
  const frontmatter = stringifyYaml(
    { name: skill.name, description },
    { lineWidth: 0 },
  ).trimEnd()
  const path = join(directory, 'SKILL.md')
  await writeFile(path, `---\n${frontmatter}\n---\n\n${body}\n`, 'utf8')
  return path
}
