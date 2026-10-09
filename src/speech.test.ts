import { afterEach, expect, it, vi } from 'vitest'
import { canRecognise, listen, saidIt, SpeechError } from './speech'

afterEach(() => vi.unstubAllGlobals())

it('saidIt accepts the kana or the written form, ignoring spaces, punctuation and katakana/hiragana', () => {
  expect(saidIt(['食べる'], ['たべる', '食べる'])).toBe(true)
  expect(saidIt(['たべる。'], ['たべる', '食べる'])).toBe(true)
  expect(saidIt(['私は 学生です。'], ['わたしはがくせいです', '私は学生です'])).toBe(true)
  expect(saidIt(['コーヒー'], ['こーひー'])).toBe(true)
  expect(saidIt(['飲む', '読む'], ['よむ', '読む'])).toBe(true) // any alternative
  expect(saidIt(['飲む'], ['よむ', '読む'])).toBe(false)
})

function fakeRecognizer(outcome: { said?: string[]; error?: string }) {
  class Rec {
    lang = ''; maxAlternatives = 1; interimResults = true
    onresult: ((e: unknown) => void) | null = null; onerror: ((e: unknown) => void) | null = null; onend: (() => void) | null = null
    start() {
      setTimeout(() => {
        if (outcome.error) this.onerror?.({ error: outcome.error })
        else this.onresult?.({ results: [outcome.said!.map((transcript) => ({ transcript }))] })
        this.onend?.()
      })
    }
    abort() {}
  }
  vi.stubGlobal('webkitSpeechRecognition', Rec)
}

it('listen resolves with the alternatives heard, in Japanese', async () => {
  expect(canRecognise()).toBe(false)
  fakeRecognizer({ said: ['水', 'みず'] })
  expect(canRecognise()).toBe(true)
  await expect(listen().result).resolves.toEqual(['水', 'みず'])
})

it('a blocked microphone or silence gives a helpful error', async () => {
  fakeRecognizer({ error: 'not-allowed' })
  await expect(listen().result).rejects.toThrow(/Microphone access was blocked/)
  fakeRecognizer({ error: 'no-speech' })
  await expect(listen().result).rejects.toBeInstanceOf(SpeechError)
})
