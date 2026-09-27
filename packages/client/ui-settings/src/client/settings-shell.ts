/**
 * Cross-plugin Settings shell navigation face (`ctx.settingsShell`).
 *
 * Feature packages (Chat, Agent Team, …) open a registered section without
 * importing the shell component. The shell binds its `openSection` while the
 * Settings root is mounted; callers no-op when the shell is absent.
 */
import { Service, type Context } from '@deepseek-ai/cordis'

/**
 * Stable `settings.section` id for the Models credential page
 * (`dsh-client-ui-settings-models`).
 */
export const MODELS_SECTION_ID = 'models'

/** Cross-plugin Settings panel navigation exposed through `ctx.settingsShell`. */
export interface ISettingsShell {
  /**
   * Open the Settings panel on one registered section id.
   * No-ops when the shell has not bound a handler (unmounted or not composed).
   * @param id - `settings.section` registration id (for example {@link MODELS_SECTION_ID}).
   */
  openSection(id: string): void
  /**
   * Bind the live shell `openSection` while SettingsRoot is mounted.
   * @param handler - opens the panel and selects `id`.
   * @returns disposer that unbinds only this handler.
   */
  bindOpenSection(handler: (id: string) => void): () => void
}

/**
 * Settings shell navigation controller.
 * The shell registers its open handler; other plugins only call `openSection`.
 * Handler state lives in a constructor-owned box so Cordis method wrapping
 * cannot split bind/open/unbind across divergent `this` identities.
 */
export class SettingsShellController extends Service implements ISettingsShell {
  private readonly binding: { handler: ((id: string) => void) | undefined }

  /**
   * @param ctx - providing plugin context.
   */
  constructor(ctx: Context) {
    const binding: { handler: ((id: string) => void) | undefined } = { handler: undefined }
    super(ctx, 'settingsShell')
    this.binding = binding
  }

  /**
   * Open Settings on `id` when a shell handler is bound.
   * @param id - registered section id.
   */
  openSection(id: string): void {
    this.binding.handler?.(id)
  }

  /**
   * Bind the SettingsRoot open handler for this mount.
   * @param handler - shell-owned openSection.
   * @returns disposer clearing this binding only.
   */
  bindOpenSection(handler: (id: string) => void): () => void {
    const { binding } = this
    binding.handler = handler
    return () => {
      if (binding.handler === handler) binding.handler = undefined
    }
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Settings panel navigation; bound by ui-settings-general's shell root. */
    settingsShell: ISettingsShell
  }
}
