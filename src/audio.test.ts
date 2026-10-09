// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { audiosToPlay, playInOrder, speak } from './audio'

afterEach(() => vi.unstubAllGlobals())

const dom = (html: string) => Object.assign(document.createElement('div'), { innerHTML: html })

describe('audiosToPlay', () => {
  it('plays everything when there is no answer divider', () => {
    expect(audiosToPlay(dom('<audio id=a></audio><audio id=b></audio>')).map((a) => a.id)).toEqual(['a', 'b'])
  })
  it('plays only audio after <hr id=answer> (not the question again)', () => {
    const root = dom('<audio id=q></audio><hr id=answer><audio id=a1></audio><p><audio id=a2></audio></p>')
    expect(audiosToPlay(root).map((a) => a.id)).toEqual(['a1', 'a2'])
  })
})

function fakeAudio(opts: { fail?: boolean } = {}) {
  return { currentTime: 5, paused: true, onended: null as null | (() => void), onerror: null as null | (() => void), played: false,
    play: vi.fn(function (this: { played: boolean; paused: boolean }) { this.played = true; this.paused = false; return opts.fail ? Promise.reject(new Error('blocked')) : Promise.resolve() }),
    pause: vi.fn(function (this: { paused: boolean }) { this.paused = true }) }
}

describe('playInOrder', () => {
  it('plays clips one at a time, in order, rewinding each', async () => {
    const [a, b] = [fakeAudio(), fakeAudio()]
    playInOrder([a, b] as unknown as HTMLAudioElement[])
    expect(a.play).toHaveBeenCalledOnce()
    expect(a.currentTime).toBe(0)
    expect(b.play).not.toHaveBeenCalled() // waits for the first to end
    a.onended!()
    expect(b.play).toHaveBeenCalledOnce()
  })
  it('skips a clip that cannot play and continues with the next', async () => {
    const [a, b] = [fakeAudio({ fail: true }), fakeAudio()]
    playInOrder([a, b] as unknown as HTMLAudioElement[])
    await Promise.resolve(); await Promise.resolve()
    expect(b.play).toHaveBeenCalledOnce()
  })
  it('stop() pauses everything and prevents the next clip starting', () => {
    const [a, b] = [fakeAudio(), fakeAudio()]
    const stop = playInOrder([a, b] as unknown as HTMLAudioElement[])
    stop()
    a.onended!()
    expect(a.pause).toHaveBeenCalled()
    expect(b.play).not.toHaveBeenCalled()
  })
})

describe('speak', () => {
  class Utterance { text: string; lang = ''; voice: unknown = null; constructor(t: string) { this.text = t } }
  const synth = (voices: { lang: string }[]) => ({ getVoices: () => voices, speak: vi.fn(), cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })

  it('returns false and says nothing when there is no speech support or no Japanese voice', () => {
    expect(speak('あ')).toBe(false) // jsdom has no speechSynthesis
    const s = synth([{ lang: 'en-US' }])
    vi.stubGlobal('speechSynthesis', s)
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    expect(speak('あ')).toBe(false)
    expect(s.speak).not.toHaveBeenCalled()
  })
  it('speaks with the Japanese voice (ja_JP and ja-JP both match) and cancels earlier speech', () => {
    const ja = { lang: 'ja_JP' }
    const s = synth([{ lang: 'en-US' }, ja])
    vi.stubGlobal('speechSynthesis', s)
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    expect(speak('あ')).toBe(true)
    expect(s.cancel).toHaveBeenCalledBefore(s.speak)
    const u = s.speak.mock.calls[0][0] as Utterance
    expect(u).toMatchObject({ text: 'あ', lang: 'ja-JP', voice: ja })
  })
})
