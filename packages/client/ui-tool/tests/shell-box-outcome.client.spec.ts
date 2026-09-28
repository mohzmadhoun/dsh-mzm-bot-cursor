/** Shell/box outcome derivation for bash/pwsh conversation cards (P7 T018). */
import { describe, expect, it } from 'vitest'
import type { RunningToolCall, ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import { shellBoxOutcome } from '../src/client/tool/models/shell-box-outcome.ts'

const ARGS = '{"command":"echo hi","description":"Say hi"}'

function running(over?: Partial<RunningToolCall>): RunningToolCall {
  return {
    callId: 'c1', name: 'bash', argsRaw: ARGS, ...over,
  } as RunningToolCall
}

function settled(over?: Partial<ToolResultNode>): ToolResultNode {
  return {
    kind: 'tool-result',
    seq: 2,
    time: 2,
    callId: 'c1',
    call: { name: 'bash', argsRaw: ARGS },
    callTime: 1,
    content: [{ type: 'text', text: 'hi\n' }],
    isError: false,
    subCalls: [],
    ...over,
  }
}

describe('shellBoxOutcome', () => {
  it('returns null while running or for non-shell tools', () => {
    expect(shellBoxOutcome('bash', running())).toBeNull()
    expect(shellBoxOutcome('read', settled({
      call: { name: 'read', argsRaw: '{"path":"a.ts"}' },
    }))).toBeNull()
  })

  it('projects success for a settled bash/pwsh exit-0 result (SC-001 indicator)', () => {
    expect(shellBoxOutcome('bash', settled())).toBe('success')
    expect(shellBoxOutcome('pwsh', settled({
      call: { name: 'pwsh', argsRaw: ARGS },
    }))).toBe('success')
  })

  it('projects error for isError results that are not readiness Failures', () => {
    expect(shellBoxOutcome('bash', settled({
      isError: true,
      content: [{ type: 'text', text: 'boom' }],
      error: { name: 'ToolError', code: 'EXEC_FAILED' },
    }))).toBe('error')
  })

  it('projects not_ready from Host meta.outcome / shellBoxOutcome (FR-002)', () => {
    expect(shellBoxOutcome('bash', settled({
      isError: true,
      meta: { outcome: 'not_ready' },
      content: [{ type: 'text', text: 'box starting' }],
    }))).toBe('not_ready')
    expect(shellBoxOutcome('bash', settled({
      meta: { shellBoxOutcome: 'not_ready', readiness: 'starting' },
      content: [{ type: 'text', text: 'deferred' }],
    }))).toBe('not_ready')
  })

  it('projects not_ready from SANDBOX_UNAVAILABLE / BOX_NOT_READY error codes', () => {
    expect(shellBoxOutcome('bash', settled({
      isError: true,
      error: { name: 'SandboxError', code: 'SANDBOX_UNAVAILABLE' },
      content: [{ type: 'text', text: 'SANDBOX_UNAVAILABLE' }],
    }))).toBe('not_ready')
    expect(shellBoxOutcome('bash', settled({
      isError: true,
      error: { name: 'BoxNotReadyError', code: 'BOX_NOT_READY' },
      content: [],
    }))).toBe('not_ready')
  })

  it('projects error for a non-zero exit terminal result (not SC-001 success)', () => {
    expect(shellBoxOutcome('bash', settled({
      content: [{ type: 'text', text: 'oops\n[exit code: 2]' }],
    }))).toBe('error')
  })

  it('does not treat a background acknowledgement as Shell/box success', () => {
    expect(shellBoxOutcome('bash', settled({
      call: {
        name: 'bash',
        argsRaw: '{"command":"sleep 30","description":"Wait","run_in_background":true}',
      },
      content: [{ type: 'text', text: 'Backgrounded bash-1' }],
    }))).toBeNull()
  })
})
