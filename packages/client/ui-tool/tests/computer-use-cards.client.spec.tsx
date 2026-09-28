// @vitest-environment jsdom
/** computerUse observation + subagent handoff cards (P7 T022). */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import type { RunningToolCall, ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { zh } from '@deepseek-ai/dsh-client-ui-conversation/src/client/locales.ts'
import type { ToolTreeProps } from '../src/client/contract/slots.ts'
import { COMPUTER_USE_PASS_SCREENSHOT_TOOL } from '../src/client/tool/models/computer-use-observation.ts'
import { ComputerUseObservationRow } from '../src/client/tool/toolviews/computer-use-observation-row.tsx'
import { ComputerUseSubagentRow } from '../src/client/tool/toolviews/computer-use-subagent-row.tsx'

afterEach(cleanup)

const SID = 's1' as SessionId
const t: ToolTreeProps['t'] = makeTranslate(zh, commonZh)

const sampleImage = {
  attachmentId: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  mediaType: 'image/png' as const,
  bytes: 68,
  width: 1,
  height: 1,
}

const loadImage = vi.fn().mockResolvedValue('blob:pass-shot')

function observationProps(block: RunningToolCall | ToolResultNode) {
  return {
    callId: 'c1',
    toolName: COMPUTER_USE_PASS_SCREENSHOT_TOOL,
    block,
    sessionId: SID,
    useSessions: () => undefined,
    openFile: () => {},
    loadImage,
    t,
  } as unknown as Parameters<typeof ComputerUseObservationRow>[0]
}

function subagentProps(block: RunningToolCall | ToolResultNode) {
  return {
    callId: 'c1',
    toolName: 'subagent',
    block,
    sessionId: SID,
    useSessions: () => undefined,
    openFile: () => {},
    loadImage,
    t,
  } as unknown as Parameters<typeof ComputerUseSubagentRow>[0]
}

describe('ComputerUseObservationRow', () => {
  it('projects observed screenshot label and durable image evidence (T022)', () => {
    const settled: ToolResultNode = {
      kind: 'tool-result',
      seq: 2,
      time: 2,
      callId: 'c1',
      call: { name: COMPUTER_USE_PASS_SCREENSHOT_TOOL, argsRaw: '{}' },
      callTime: 1,
      content: [
        { type: 'text', text: 'Pass fixture desktop observation.' },
        { type: 'image', attachment: sampleImage },
      ],
      isError: false,
      subCalls: [],
    } as ToolResultNode
    const view = render(<ComputerUseObservationRow {...observationProps(settled)} />)
    expect(view.container.querySelector('[data-computer-use-observation="observed"]')).not.toBeNull()
    expect(view.container.querySelector('[data-computer-use-observation-label="observed"]')?.textContent)
      .toBe(zh['computerUse.observation'])
    expect(view.container.querySelector('[data-computer-use-screenshot]')).not.toBeNull()
    expect(view.container.querySelector('[data-media-type="image/png"]')).not.toBeNull()
    expect(view.getByText(zh['computerUse.screenshot'])).toBeTruthy()
  })
})

describe('ComputerUseSubagentRow', () => {
  it('projects computerUse handoff label on parent subagent card (T022)', () => {
    const settled: ToolResultNode = {
      kind: 'tool-result',
      seq: 2,
      time: 2,
      callId: 'c1',
      call: {
        name: 'subagent',
        argsRaw: JSON.stringify({
          description: 'computerUse screenshot observation',
          prompt: 'Capture a screenshot.',
        }),
      },
      callTime: 1,
      content: [{ type: 'text', text: 'started subagent child-9' }],
      isError: false,
      meta: { capabilityClass: 'computerUse', handoff: true },
      subCalls: [],
    }
    const view = render(<ComputerUseSubagentRow {...subagentProps(settled)} />)
    expect(view.container.querySelector('[data-subagent-card]')).not.toBeNull()
    expect(view.container.querySelector('[data-computer-use-handoff="handoff"]')).not.toBeNull()
    expect(view.container.querySelector('[data-computer-use-handoff-label="handoff"]')?.textContent)
      .toBe(zh['computerUse.handoff'])
    expect(view.container.querySelector('[data-computer-use-child-id="child-9"]')).not.toBeNull()
  })

  it('keeps ordinary subagent cards without computerUse handoff chrome', () => {
    const settled: ToolResultNode = {
      kind: 'tool-result',
      seq: 2,
      time: 2,
      callId: 'c1',
      call: {
        name: 'subagent',
        argsRaw: JSON.stringify({
          description: 'Summarize README',
          prompt: 'Summarize README.md',
        }),
      },
      callTime: 1,
      content: [{ type: 'text', text: 'done' }],
      isError: false,
      subCalls: [],
    }
    const view = render(<ComputerUseSubagentRow {...subagentProps(settled)} />)
    expect(view.container.querySelector('[data-subagent-card]')).not.toBeNull()
    expect(view.container.querySelector('[data-computer-use-handoff]')).toBeNull()
    expect(view.container.querySelector('[data-computer-use-handoff-label]')).toBeNull()
  })
})
