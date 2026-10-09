// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { readBool, readInt, writeBool, writeInt } from './settings'

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

it('ints round-trip, default, and reject non-integers or throwing storage', () => {
  expect(readInt('goal', 20)).toBe(20)
  writeInt('goal', 50)
  expect(readInt('goal', 20)).toBe(50)
  localStorage.setItem('goal', 'lots')
  expect(readInt('goal', 20)).toBe(20)
  localStorage.setItem('goal', '2.5')
  expect(readInt('goal', 20)).toBe(20)
  for (const junk of ['', '  ', ' 5', '5 ']) { localStorage.setItem('goal', junk); expect(readInt('goal', 20), JSON.stringify(junk)).toBe(20) }
  localStorage.setItem('goal', '-3')
  expect(readInt('goal', 20)).toBe(-3)
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  expect(readInt('goal', 20)).toBe(20)
  expect(() => writeInt('goal', 10)).not.toThrow()
})
