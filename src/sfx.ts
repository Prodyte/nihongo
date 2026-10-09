import { readBool } from './settings'

export type Sfx = 'right' | 'wrong' | 'done'
// [frequency Hz, start s, length s] per note: a rising pair for right, a low double buzz for wrong, an arpeggio when done
const NOTES: Record<Sfx, [number, number, number][]> = {
  right: [[660, 0, 0.09], [990, 0.08, 0.14]],
  wrong: [[220, 0, 0.12], [196, 0.13, 0.18]],
  done: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.12], [1047, 0.3, 0.3]],
}
let ctx: AudioContext | null = null

/** A short feedback sound (and a buzz on phones for a wrong answer), unless switched off in Settings. Never throws. */
export function sfx(kind: Sfx) {
  if (!readBool('nihongo.sfx', true)) return
  try {
    if (kind === 'wrong') navigator.vibrate?.(60)
    ctx ??= new AudioContext()
    void ctx.resume()
    const t0 = ctx.currentTime
    for (const [freq, at, len] of NOTES[kind]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = kind === 'wrong' ? 'square' : 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t0 + at)
      gain.gain.exponentialRampToValueAtTime(kind === 'wrong' ? 0.05 : 0.12, t0 + at + 0.01) // quiet, and no click
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0 + at)
      osc.stop(t0 + at + len + 0.02)
    }
  } catch {
    /* no audio (old browser, blocked): stay silent */
  }
}
