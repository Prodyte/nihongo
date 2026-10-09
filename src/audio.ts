import { useEffect, useState } from 'react'

const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null)
const jaVoice = () => synth()?.getVoices().find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('ja'))

/** Speak Japanese with the device's voice. Returns false when there is none (nothing is played). */
export function speak(text: string): boolean {
  const s = synth()
  const voice = jaVoice()
  if (!s || !voice) return false
  s.cancel() // never queue up overlapping speech
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
  u.voice = voice
  s.speak(u)
  return true
}

/** Speak several texts one after another; `onStart(i)` fires as each begins (to highlight it). Returns a stop function. */
export function speakAll(texts: string[], onStart: (i: number) => void, onEnd: () => void): () => void {
  const s = synth()
  const voice = jaVoice()
  if (!s || !voice) { onEnd(); return () => {} }
  s.cancel()
  texts.forEach((text, i) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.voice = voice
    u.onstart = () => onStart(i)
    if (i === texts.length - 1) u.onend = onEnd
    s.speak(u)
  })
  return () => { s.cancel(); onEnd() }
}

/** Browsers load the voice list lazily on first use; ask early so the first spoken card isn't silent. */
export const warmUpVoices = () => void synth()?.getVoices()

/** Whether a Japanese voice exists. Voices load asynchronously in most browsers. */
export function useJaVoice(): boolean {
  const [has, setHas] = useState(() => !!jaVoice())
  useEffect(() => {
    const s = synth()
    if (!s) return
    const update = () => setHas(!!jaVoice())
    s.addEventListener('voiceschanged', update)
    return () => s.removeEventListener('voiceschanged', update)
  }, [])
  return has
}

/** Like Anki: if the card has `<hr id=answer>`, only audio after it plays (not the question's again). */
export function audiosToPlay(root: ParentNode): HTMLAudioElement[] {
  const all = [...root.querySelectorAll('audio')]
  const hr = root.querySelector('hr#answer')
  return hr ? all.filter((a) => hr.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING) : all
}

/** Play clips one after another. Returns a stop function. A clip that fails to play is skipped. */
export function playInOrder(audios: HTMLAudioElement[]): () => void {
  let i = 0
  let stopped = false
  const next = () => {
    const a = audios[i++]
    if (!a || stopped) return
    let done = false
    const advance = () => { // a failing clip can raise both `error` and a play() rejection: advance once
      if (done) return
      done = true
      next()
    }
    a.onended = advance
    a.onerror = advance
    a.currentTime = 0
    a.play().catch(advance) // autoplay can be blocked by the browser; then each clip is skipped quietly
  }
  next()
  return () => {
    stopped = true
    audios.forEach((a) => a.pause())
  }
}
