// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { readBool, writeBool } from './settings'

afterEach(() => { vi.restoreAllMocks(); localStorage.clear() })

it('round-trips and defaults', () => {
  expect(readBool('k', true)).toBe(true)
  writeBool('k', false)
  expect(readBool('k', true)).toBe(false)
  writeBool('k', true)
  expect(readBool('k', false)).toBe(true)
})
it('survives storage that throws (private mode / blocked)', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  expect(readBool('k', true)).toBe(true)
  expect(() => writeBool('k', false)).not.toThrow()
})
