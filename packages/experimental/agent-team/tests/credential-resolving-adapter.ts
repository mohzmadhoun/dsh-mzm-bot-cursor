/**
 * Test adapter that mirrors Host `packages/llm/` credential resolve:
 * each provider route names one CredentialRef; the value comes only from
 * Host `ctx.credentials.resolve(ref)` — never from another provider's key.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { CredentialRef } from '@deepseek-ai/dsh-credentials'
import {
  assertUsableApiKey,
  LlmAdapter,
  LlmError,
  type GenerateOptions,
  type LlmResolvedModelInfo,
  type StreamChunk,
} from '@deepseek-ai/dsh-llm'

/** One Host credential resolve observed during a model call. */
export interface CredentialResolveHit {
  readonly provider: string
  readonly model: string
  readonly ref: CredentialRef
  readonly value: string
}

/**
 * Scripted LLM adapter that resolves API keys through Host credentials only.
 * Matches the `llm-deepseek` / `llm-pi-ai` posture: missing ref → `MISSING_CREDENTIAL`.
 */
export class CredentialResolvingAdapter extends LlmAdapter {
  /** Every GenerateOptions that reached {@link stream}. */
  readonly requests: GenerateOptions[] = []
  /** Successful Host credential resolves (one per accepted stream). */
  readonly resolves: CredentialResolveHit[] = []

  constructor(
    private readonly ctx: Context,
    /** Provider route → CredentialRef (apiKeyEnv), as real adapters configure. */
    private readonly refsByProvider: ReadonlyMap<string, CredentialRef>,
    private readonly script: (StreamChunk[] | ((options: GenerateOptions) => StreamChunk[]))[],
  ) {
    super()
  }

  override resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return Promise.resolve({ provider, id: model, name: model })
  }

  async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options)
    const ref = this.refsByProvider.get(options.provider)
    if (ref === undefined) {
      throw new LlmError(
        `credential-resolving-adapter: no CredentialRef configured for provider "${options.provider}"`,
        'NO_ADAPTER',
      )
    }
    const credentials = this.ctx.get('credentials')
    if (credentials === undefined) {
      throw new LlmError(
        `credential-resolving-adapter: Host credentials seam is not mounted for provider "${options.provider}"`,
        'MISSING_CREDENTIAL',
      )
    }
    // Resolve only this route's ref — never scan peer providers' keys (FR-002 / credentials contract).
    const hit = await credentials.resolve(ref)
    if (hit === undefined) {
      throw new LlmError(
        `credential-resolving-adapter: no API key for provider route "${options.provider}";`
          + ` store ${ref} through Host credentials (Models page) — no silent fallback to another bot's credential`,
        'MISSING_CREDENTIAL',
      )
    }
    const value = assertUsableApiKey(hit.value, 'credential-resolving-adapter', ref)
    this.resolves.push({
      provider: options.provider,
      model: options.model,
      ref,
      value,
    })
    const entry = this.script.shift()
    if (entry === undefined) {
      throw new LlmError('credential-resolving-adapter: script exhausted', 'UNKNOWN')
    }
    const chunks = typeof entry === 'function' ? entry(options) : entry
    yield * chunks
  }
}
