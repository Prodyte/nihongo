import { speak, useJaVoice } from '../audio'

/** 🔊 for kana; renders nothing when the device has no Japanese voice. */
export function SpeakButton({ text }: { text: string }) {
  const has = useJaVoice()
  if (!has) return null
  return <button type="button" aria-label="Play sound" onClick={() => speak(text)}>🔊</button>
}
