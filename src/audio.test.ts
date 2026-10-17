// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { audiosToPlay, playInOrder, slowly, speak, speakAll, unlockAudio } from './audio'

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
  it('a clip that raises error AND rejects play() advances only once', async () => {
    const [a, b, c] = [fakeAudio({ fail: true }), fakeAudio(), fakeAudio()]
    playInOrder([a, b, c] as unknown as HTMLAudioElement[])
    a.onerror!() // the error event fires first...
    await Promise.resolve(); await Promise.resolve() // ...then the play() rejection lands
    expect(b.play).toHaveBeenCalledOnce()
    expect(c.play).not.toHaveBeenCalled() // would have been skipped to by the double advance
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
    expect(u).toMatchObject({ text: 'あ', lang: 'ja-JP', voice: ja, rate: 1 })
  })
  it('speaks in Japanese without picking a voice while the voice list is still empty (Chrome and Android load it later)', () => {
    const s = synth([])
    vi.stubGlobal('speechSynthesis', s)
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    expect(speak('あ')).toBe(true)
    expect(s.speak.mock.calls[0][0]).toMatchObject({ text: 'あ', lang: 'ja-JP', voice: null })
  })
  it('plays at the Settings speed, or at the speed asked for (the turtle button)', () => {
    const s = synth([{ lang: 'ja-JP' }])
    vi.stubGlobal('speechSynthesis', s)
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    localStorage.setItem('nihongo.rate', '80')
    speak('あ')
    speak('い', 60)
    localStorage.removeItem('nihongo.rate')
    expect(s.speak.mock.calls.map((c) => (c[0] as Utterance & { rate: number }).rate)).toEqual([0.8, 0.6])
  })
  it('slow speech also pauses, for voices that ignore the rate: between chunks of a sentence, between syllables of a word', () => {
    expect(slowly('わたしは がくせいです。')).toBe('わたしは、がくせいです。')
    expect(slowly('きって')).toBe('きっ、て')
    expect(slowly('ちょっと')).toBe('ちょっ、と')
    expect(slowly('コーヒー')).toBe('コー、ヒー')
    expect(slowly('日')).toBe('日') // a lone kanji or one kana: as is
    expect(slowly('あ')).toBe('あ')
    const s = synth([{ lang: 'ja-JP' }])
    vi.stubGlobal('speechSynthesis', s)
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    speak('みず')
    speak('みず', 60)
    expect(s.speak.mock.calls.map((c) => (c[0] as Utterance).text)).toEqual(['みず', 'み、ず'])
  })
  it('speakAll ends once: when its last sentence ends, is cancelled by other speech (Chrome reports an error then), or is stopped', () => {
    const s = synth([{ lang: 'ja-JP' }])
    vi.stubGlobal('speechSynthesis', s)
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    const onEnd = vi.fn()
    const stop = speakAll(['あ', 'い'], () => {}, onEnd)
    const last = s.speak.mock.calls[1][0] as { onend: () => void; onerror: () => void }
    last.onerror()
    expect(onEnd).toHaveBeenCalledOnce()
    last.onend()
    stop()
    expect(onEnd).toHaveBeenCalledOnce()
  })
  it('the first tap or key speaks an empty utterance (iOS then plays later speech), only once', () => {
    const s = { ...synth([]), speaking: false }
    vi.stubGlobal('speechSynthesis', s)
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    unlockAudio()
    unlockAudio()
    expect(s.speak).not.toHaveBeenCalled()
    window.dispatchEvent(new KeyboardEvent('keydown'))
    window.dispatchEvent(new Event('pointerup'))
    expect(s.speak).toHaveBeenCalledOnce()
    expect(s.speak.mock.calls[0][0]).toMatchObject({ text: '' })
  })
})
