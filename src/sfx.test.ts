// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); vi.resetModules() })

function fakeAudio() {
  const started: number[] = []
  class Ctx {
    currentTime = 0
    destination = {}
    resume() { return Promise.resolve() }
    createOscillator() { const o = { type: '', frequency: { value: 0 }, connect: (g: unknown) => g, start: () => started.push(o.frequency.value), stop() {} }; return o }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (d: unknown) => d } }
  }
  vi.stubGlobal('AudioContext', Ctx)
  return started
}

it('plays a rising pair for right, a low pair and a vibration for wrong', async () => {
  const started = fakeAudio()
  const vibrate = vi.fn()
  Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
  const { sfx } = await import('./sfx')
  sfx('right')
  expect(started).toEqual([660, 990])
  sfx('wrong')
  expect(started.slice(2)).toEqual([220, 196])
  expect(vibrate).toHaveBeenCalledTimes(1)
})

it('is silent when switched off, and never throws without audio', async () => {
  const started = fakeAudio()
  localStorage.setItem('nihongo.sfx', '0')
  const { sfx } = await import('./sfx')
  sfx('done')
  expect(started).toEqual([])
  localStorage.clear()
  vi.stubGlobal('AudioContext', class { constructor() { throw new Error('no audio') } })
  vi.resetModules()
  const fresh = await import('./sfx')
  expect(() => fresh.sfx('right')).not.toThrow()
})
