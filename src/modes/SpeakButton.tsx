import { speak, useJaVoice } from '../audio'
import { Icon } from '../icons'
import { SLOW } from '../settings'

/** Round speaker and slow (turtle) buttons; render nothing when the device has no Japanese voice. */
export function SpeakButton({ text }: { text: string }) {
  const has = useJaVoice()
  if (!has) return null
  return (
    <span className="speak-btns">
      <button type="button" className="icon-btn" aria-label="Play sound" onClick={() => speak(text)}><Icon name="speaker" /></button>
      <button type="button" className="icon-btn slow" aria-label="Play slowly" onClick={() => speak(text, SLOW)}><Icon name="turtle" /></button>
    </span>
  )
}
