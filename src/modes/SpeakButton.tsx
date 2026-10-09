import { speak, useJaVoice } from '../audio'
import { Icon } from '../icons'

/** A round speaker button; renders nothing when the device has no Japanese voice. */
export function SpeakButton({ text }: { text: string }) {
  const has = useJaVoice()
  if (!has) return null
  return <button type="button" className="icon-btn" aria-label="Play sound" onClick={() => speak(text)}><Icon name="speaker" /></button>
}
