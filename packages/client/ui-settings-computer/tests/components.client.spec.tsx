// @vitest-environment jsdom
/** Computer section rows — Shell readiness + Computer use enablement. */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { usePinnedBrowserLanguages } from '@deepseek-ai/dsh-client-test-runtime'
import { en } from '../src/client/locales.ts'
import { ComputerSection } from '../src/client/ComputerSection.tsx'
import type { ComputerSectionProps } from '../src/client/ComputerSection.tsx'
import type { ComputerSettingsSnapshot } from '../src/client/computer-projection.ts'

usePinnedBrowserLanguages('en-US')
afterEach(cleanup)

const t = ((key: keyof typeof en): string => en[key]) as ComputerSectionProps['t']

function props(
  snapshot: ComputerSettingsSnapshot,
  setComputerUseEnabled = vi.fn(async () => {}),
): ComputerSectionProps {
  return {
    t,
    useComputerSettings: (select: (s: ComputerSettingsSnapshot) => unknown) => select(snapshot),
    setComputerUseEnabled,
    close: () => {},
  } as unknown as ComputerSectionProps
}

describe('ComputerSection', () => {
  it('shows locale-owned Shell and Computer use rows under Computer', () => {
    render(<ComputerSection {...props({
      status: 'ready',
      writable: true,
      value: {
        boxId: 'desktop-local',
        readiness: 'ready',
        local: true,
        updatedAt: '2026-09-28T00:00:00.000Z',
        computerUseEnabled: true,
      },
    })}
    />)

    expect(screen.getByRole('heading', { name: 'Computer' })).toBeTruthy()
    expect(document.querySelector('[data-settings-computer-row="shell"]')).toBeTruthy()
    expect(document.querySelector('[data-settings-computer-row="computer-use"]')).toBeTruthy()
    expect(screen.getByText('Shell')).toBeTruthy()
    expect(screen.getByText('Computer use')).toBeTruthy()
    expect(screen.getByText('Ready')).toBeTruthy()
    expect(document.querySelector('[data-box-readiness="ready"]')).toBeTruthy()
    expect(document.querySelector('[data-computer-use-enabled="true"]')).toBeTruthy()
  })

  it('keeps Shell readiness read-only and toggles Computer use via Host write', async () => {
    const setComputerUseEnabled = vi.fn(async () => {})
    render(<ComputerSection {...props({
      status: 'ready',
      writable: true,
      value: {
        boxId: 'desktop-local',
        readiness: 'starting',
        local: true,
        updatedAt: '2026-09-28T00:00:00.000Z',
        computerUseEnabled: true,
      },
    }, setComputerUseEnabled)}
    />)

    expect(document.querySelector('[data-settings-computer-row="shell"] [role="switch"]')).toBeNull()
    const toggle = screen.getByRole('switch', { name: 'Enable Computer use' })
    expect(toggle.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(toggle)
    await vi.waitFor(() => {
      expect(setComputerUseEnabled).toHaveBeenCalledWith(false)
    })
  })

  it('disables Computer use toggle while Host projection is unavailable', () => {
    render(<ComputerSection {...props({ status: 'unavailable', writable: false, value: undefined })} />)
    expect(screen.getByText('Shell')).toBeTruthy()
    expect(screen.getByText('Computer use')).toBeTruthy()
    expect(screen.getByRole('switch', { name: 'Enable Computer use' }).hasAttribute('disabled')).toBe(true)
  })

  it.each([
    ['not_ready', 'Not ready'],
    ['starting', 'Starting'],
    ['ready', 'Ready'],
    ['failed', 'Failed'],
  ] as const)('projects Host readiness=%s', (readiness, label) => {
    render(<ComputerSection {...props({
      status: 'ready',
      writable: true,
      value: {
        boxId: 'desktop-local',
        readiness,
        local: true,
        updatedAt: '2026-09-28T00:00:00.000Z',
        computerUseEnabled: false,
      },
    })}
    />)
    expect(document.querySelector(`[data-box-readiness-label="${readiness}"]`)?.textContent)
      .toBe(label)
  })
})
