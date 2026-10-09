// Speech recognition (the Web Speech API). Chrome and Safari, including on iPad, recognise Japanese; Firefox doesn't.
// Note: browsers send the audio to their provider (Google, Apple) to transcribe it.

interface Recognition {
  lang: string
  maxAlternatives: number
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}
type Ctor = new () => Recognition
const Recognizer = (): Ctor | undefined => (globalThis as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor }).SpeechRecognition
  ?? (globalThis as unknown as { webkitSpeechRecognition?: Ctor }).webkitSpeechRecognition

export const canRecognise = () => !!Recognizer()

export class SpeechError extends Error {
  code: string
  constructor(code: string) {
    super(code === 'not-allowed' || code === 'service-not-allowed' ? 'Microphone access was blocked. Allow it in your browser settings, or skip speaking.'
      : code === 'no-speech' ? 'Didn’t hear anything. Tap the microphone and speak.'
      : code === 'network' ? 'Speech recognition needs a connection.'
      : `Speech recognition failed (${code}).`)
    this.code = code
    this.name = 'SpeechError'
  }
}

const LISTEN_MS = 10_000

/** Listen once in Japanese; resolves with what was heard (best guess first). `stop` aborts. */
export function listen(): { result: Promise<string[]>; stop: () => void } {
  const R = Recognizer()
  if (!R) return { result: Promise.reject(new SpeechError('unsupported')), stop: () => {} }
  const rec = new R()
  rec.lang = 'ja-JP'
  rec.maxAlternatives = 5
  rec.interimResults = false
  const result = new Promise<string[]>((resolve, reject) => {
    let heard: string[] = []
    rec.onresult = (e) => { heard = Array.from(e.results[0] ?? [], (a) => a.transcript) }
    rec.onerror = (e) => reject(new SpeechError(e.error))
    rec.onend = () => (heard.length ? resolve(heard) : reject(new SpeechError('no-speech')))
  })
  rec.start()
  const timer = setTimeout(() => rec.abort(), LISTEN_MS) // a recogniser that never answers must not leave us "listening" forever
  void result.finally(() => clearTimeout(timer)).catch(() => {})
  return { result, stop: () => rec.abort() }
}

/** Did any of the transcripts say `expected`? Compared as written (kanji) or as kana, ignoring spaces and punctuation. */
export function saidIt(heard: string[], forms: string[]): boolean {
  const norm = (s: string) => s.normalize('NFKC').replace(/[\s。、．，.,!?！？「」]/g, '').replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
  const want = new Set(forms.filter(Boolean).map(norm))
  return heard.some((h) => want.has(norm(h)))
}
