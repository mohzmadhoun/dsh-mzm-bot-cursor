/** computerUse observation derivation for Pass screenshot tool cards (P7 T022). */
import { describe, expect, it } from 'vitest'
import type { RunningToolCall, ToolResultNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import {
  COMPUTER_USE_PASS_SCREENSHOT_TOOL,
  computerUseObservation,
  isComputerUsePassScreenshotTool,
} from '../src/client/tool/models/computer-use-observation.ts'

const sampleImage = {
  attachmentId: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  mediaType: 'image/png' as const,
  bytes: 68,
  width: 1,
  height: 1,
  name: 'pass.png',
} as const

function running(over?: Partial<RunningToolCall>): RunningToolCall {
  return {
    callId: 'c1',
    name: COMPUTER_USE_PASS_SCREENSHOT_TOOL,
    argsRaw: '{}',
    ...over,
  } as RunningToolCall
}

function settled(over?: Partial<ToolResultNode>): ToolResultNode {
  return {
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
    ...over,
  } as ToolResultNode
}

describe('computerUseObservation', () => {
  it('recognizes the Host Pass screenshot tool by name', () => {
    expect(isComputerUsePassScreenshotTool(COMPUTER_USE_PASS_SCREENSHOT_TOOL)).toBe(true)
    expect(isComputerUsePassScreenshotTool('bash')).toBe(false)
  })

  it('returns null for unrelated tools without computerUse meta', () => {
    expect(computerUseObservation('bash', settled({
      call: { name: 'bash', argsRaw: '{"command":"echo"}' },
      content: [{ type: 'text', text: 'hi' }],
    }))).toBeNull()
  })

  it('projects running while the Pass observation tool is in flight', () => {
    expect(computerUseObservation(COMPUTER_USE_PASS_SCREENSHOT_TOOL, running())).toEqual({
      status: 'running',
      images: null,
      text: null,
    })
  })

  it('projects observed with durable screenshot refs (SC-002 artifact)', () => {
    const result = computerUseObservation(COMPUTER_USE_PASS_SCREENSHOT_TOOL, settled())
    expect(result?.status).toBe('observed')
    expect(result?.images).toEqual([{ attachment: sampleImage }])
    expect(result?.text).toBe('Pass fixture desktop observation.')
  })

  it('projects observed from Host capabilityClass meta without Pass tool name', () => {
    const result = computerUseObservation('cua_screenshot', settled({
      call: { name: 'cua_screenshot', argsRaw: '{}' },
      meta: { capabilityClass: 'computerUse', observation: true },
    }))
    expect(result?.status).toBe('observed')
    expect(result?.images?.[0]?.attachment.attachmentId).toBe(sampleImage.attachmentId)
  })

  it('projects error for isError Pass results', () => {
    expect(computerUseObservation(COMPUTER_USE_PASS_SCREENSHOT_TOOL, settled({
      isError: true,
      content: [{ type: 'text', text: 'admission failed' }],
    }))).toEqual({
      status: 'error',
      images: null,
      text: 'admission failed',
    })
  })

  it('projects observed from Pass text fallback when no image was admitted', () => {
    expect(computerUseObservation(COMPUTER_USE_PASS_SCREENSHOT_TOOL, settled({
      content: [{ type: 'text', text: 'Pass fixture desktop observation.' }],
    }))).toEqual({
      status: 'observed',
      images: null,
      text: 'Pass fixture desktop observation.',
    })
  })
})
