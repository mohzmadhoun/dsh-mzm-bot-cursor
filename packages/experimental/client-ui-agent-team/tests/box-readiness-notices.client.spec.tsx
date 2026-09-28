// @vitest-environment jsdom

/** Box readiness notices strip — Host computer settings over HTTP/WS (P7 T018). */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import {
  BoxReadinessNotices,
  decodeComputerBoxProjection,
  type BoxReadinessNoticesProps,
  type ComputerBoxSnapshot,
} from '../src/client/BoxReadinessNotices.tsx'
import { zh } from '../src/client/locales.ts'

afterEach(cleanup)

function props(snapshot: ComputerBoxSnapshot): BoxReadinessNoticesProps {
  return {
    sessionId: 's1',
    useComputerBox: (select: (s: ComputerBoxSnapshot) => unknown) => select(snapshot),
    t: makeTranslate(zh, commonZh),
  } as unknown as BoxReadinessNoticesProps
}

describe('decodeComputerBoxProjection', () => {
  it('accepts a well-formed Host computer section', () => {
    expect(decodeComputerBoxProjection({
      boxId: 'desktop-local',
      readiness: 'ready',
      local: true,
      updatedAt: '2026-09-28T00:00:00.000Z',
      computerUseEnabled: true,
    })).toEqual({
      boxId: 'desktop-local',
      readiness: 'ready',
      local: true,
      updatedAt: '2026-09-28T00:00:00.000Z',
    })
  })

  it('rejects malformed readiness values', () => {
    expect(decodeComputerBoxProjection({
      boxId: 'desktop-local',
      readiness: 'ok',
      local: true,
      updatedAt: '2026-09-28T00:00:00.000Z',
    })).toBeUndefined()
  })
})

describe('BoxReadinessNotices', () => {
  it('hides while Host computer settings are loading or unavailable', () => {
    const { container: loading } = render(<BoxReadinessNotices {...props({
      status: 'loading', value: undefined,
    })}
    />)
    expect(loading.querySelector('[data-shell-box-readiness]')).toBeNull()
    const { container: unavailable } = render(<BoxReadinessNotices {...props({
      status: 'unavailable', value: undefined,
    })}
    />)
    expect(unavailable.querySelector('[data-shell-box-readiness]')).toBeNull()
  })

  it('projects Host not_ready distinctly from ready (FR-002)', () => {
    render(<BoxReadinessNotices {...props({
      status: 'ready',
      value: {
        boxId: 'desktop-local',
        readiness: 'not_ready',
        local: true,
        updatedAt: '2026-09-28T00:00:00.000Z',
      },
    })}
    />)
    const root = document.querySelector('[data-shell-box-readiness]')
    expect(root?.getAttribute('data-box-readiness')).toBe('not_ready')
    expect(root?.getAttribute('data-box-local')).toBe('true')
    expect(screen.getByText(zh['boxReadiness.not_ready'])).toBeTruthy()
    expect(screen.queryByText(zh['boxReadiness.ready'])).toBeNull()
  })

  it.each([
    ['starting', zh['boxReadiness.starting']],
    ['ready', zh['boxReadiness.ready']],
    ['failed', zh['boxReadiness.failed']],
  ] as const)('projects Host readiness=%s', (readiness, label) => {
    render(<BoxReadinessNotices {...props({
      status: 'ready',
      value: {
        boxId: 'desktop-local',
        readiness,
        local: true,
        updatedAt: '2026-09-28T12:00:00.000Z',
      },
    })}
    />)
    expect(document.querySelector('[data-shell-box-readiness]')
      ?.getAttribute('data-box-readiness')).toBe(readiness)
    expect(screen.getByText(label)).toBeTruthy()
    expect(document.querySelector(`[data-box-readiness-label="${readiness}"]`)).toBeTruthy()
  })
})
