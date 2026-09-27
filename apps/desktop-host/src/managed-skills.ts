/** Desktop Host mount for the P3 thin managed pack + Host-durable user skills root. */

import type { Context } from '@deepseek-ai/cordis'
import * as SkillFileSystem from '@deepseek-ai/dsh-skill-filesystem'
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths'

/** Loader identity for the application-owned managed-skills composition. */
export const name = 'desktop-managed-skills'

/** Skills registry required so the filesystem provider can register. */
export const inject = ['skills']

/** Application-selected managed pack directory and Host-durable user skills root. */
export interface Config {
  /**
   * Absolute path to `managed-skills/` (contains `mzm-thin-pack/SKILL.md`).
   * Mounted as the filesystem provider bundled root (`source: bundled` → product managed).
   */
  readonly managedRoot: string
  /**
   * Host-durable directory for user-authored skills.
   * Mounted via `customSkillDirs` (`source: custom` → product user).
   */
  readonly userRoot: string
}

/**
 * Mount managed + user skill roots into `ctx.skills` through `dsh-skill-filesystem`.
 * Electron Main must not invent a parallel catalog (research R2).
 * @param ctx - Profile scope with an injected skills registry.
 * @param config - Managed pack directory and Host-durable user skills root.
 */
export async function apply(ctx: Context, config: Config): Promise<void> {
  const dshHome = resolveDshHome()
  await ctx.plugin(SkillFileSystem, {
    includeDefaultRoots: false,
    bundledSkillDir: config.managedRoot,
    customSkillDirs: [config.userRoot],
    dshHome,
    agentsHome: dshHome,
    watch: true,
  })
}
