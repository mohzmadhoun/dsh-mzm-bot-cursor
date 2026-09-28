/** Projection decoder for Host `computer` settings — Client-side only. */

import { describe, expect, it } from 'vitest'
import { decodeComputerSettingsProjection } from '../src/client/computer-projection.ts'

describe('decodeComputerSettingsProjection', () => {
  it('accepts a well-formed Host computer section', () => {
    expect(decodeComputerSettingsProjection({
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
      computerUseEnabled: true,
    })
  })

  it('rejects malformed readiness values', () => {
    expect(decodeComputerSettingsProjection({
      boxId: 'desktop-local',
      readiness: 'ok',
      local: true,
      updatedAt: '2026-09-28T00:00:00.000Z',
      computerUseEnabled: false,
    })).toBeUndefined()
  })

  it('rejects missing computerUseEnabled', () => {
    expect(decodeComputerSettingsProjection({
      boxId: 'desktop-local',
      readiness: 'not_ready',
      local: true,
      updatedAt: '2026-09-28T00:00:00.000Z',
    })).toBeUndefined()
  })

  it('rejects non-objects', () => {
    expect(decodeComputerSettingsProjection(null)).toBeUndefined()
    expect(decodeComputerSettingsProjection([])).toBeUndefined()
    expect(decodeComputerSettingsProjection('computer')).toBeUndefined()
  })
})
