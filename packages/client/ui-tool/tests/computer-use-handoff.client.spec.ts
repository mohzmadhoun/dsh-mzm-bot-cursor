/** computerUse parent handoff derivation for subagent cards (P7 T022). */
import { describe, expect, it } from 'vitest'
import type { RunningToolCall, ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import {
  computerUseHandoff,
  isSubagentTool,
} from '../src/client/tool/models/computer-use-handoff.ts'

const COMPUTER_ARGS = JSON.stringify({
  description: 'computerUse screenshot observation',
  prompt: 'Capture a Pass fixture desktop observation screenshot.',
})

const ORDINARY_ARGS = JSON.stringify({
  description: 'Summarize the README',
  prompt: 'Read README.md and return a short summary.',
})

function running(argsRaw: string, over?: Partial<RunningToolCall>): RunningToolCall {
  return {
    callId: 'c1',
    name: 'subagent',
    argsRaw,
    ...over,
  } as RunningToolCall
}

function settled(argsRaw: string, over?: Partial<ToolResultNode>): ToolResultNode {
  return {
    kind: 'tool-result',
    seq: 2,
    time: 2,
    callId: 'c1',
    call: { name: 'subagent', argsRaw },
    callTime: 1,
    content: [{ type: 'text', text: 'observation complete' }],
    isError: false,
    subCalls: [],
    ...over,
  }
}

describe('computerUseHandoff', () => {
  it('recognizes the Path A subagent tool', () => {
    expect(isSubagentTool('subagent')).toBe(true)
    expect(isSubagentTool('bash')).toBe(false)
  })

  it('returns null for ordinary subagent paths without computerUse marks', () => {
    expect(computerUseHandoff('subagent', running(ORDINARY_ARGS))).toBeNull()
    expect(computerUseHandoff('subagent', settled(ORDINARY_ARGS))).toBeNull()
    expect(computerUseHandoff('bash', settled(COMPUTER_ARGS, {
      call: { name: 'bash', argsRaw: COMPUTER_ARGS },
    }))).toBeNull()
  })

  it('projects running handoff from computerUse-class args (SC-002 progress)', () => {
    expect(computerUseHandoff('subagent', running(COMPUTER_ARGS))).toEqual({
      status: 'running',
      childId: null,
    })
  })

  it('projects settled handoff from Host capabilityClass meta', () => {
    expect(computerUseHandoff('subagent', settled(ORDINARY_ARGS, {
      meta: { capabilityClass: 'computerUse', handoff: true, childId: 'child-1' },
    }))).toEqual({
      status: 'handoff',
      childId: 'child-1',
    })
  })

  it('projects settled handoff from computerUse args + result text child id', () => {
    expect(computerUseHandoff('subagent', settled(COMPUTER_ARGS, {
      content: [{ type: 'text', text: 'started subagent child-pass-9' }],
    }))).toEqual({
      status: 'handoff',
      childId: 'child-pass-9',
    })
  })

  it('projects error handoff for failed computerUse-class subagent results', () => {
    expect(computerUseHandoff('subagent', settled(COMPUTER_ARGS, {
      isError: true,
      content: [{ type: 'text', text: 'child failed' }],
      meta: { capabilityClass: 'computerUse' },
    }))).toEqual({
      status: 'error',
      childId: null,
    })
  })
})
