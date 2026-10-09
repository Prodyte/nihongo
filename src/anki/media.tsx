import { useEffect, useRef, useState } from 'react'
import { audiosToPlay, playInOrder } from '../audio'
import type { Db } from '../db/db'
import { resolveMedia } from './resolve'

export function Html({ db, deck, html, autoplay = false }: { db: Db; deck: string; html: string; autoplay?: boolean }) {
  const [out, setOut] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let live = true
    const urls: string[] = []
    resolveMedia(db, deck, html, (b) => (urls.push(URL.createObjectURL(b)), urls.at(-1)!))
      .then((h) => live && setOut(h))
      .catch(() => live && setOut(''))
    return () => {
      live = false
      urls.forEach(URL.revokeObjectURL)
    }
  }, [db, deck, html])
  useEffect(() => {
    if (autoplay && out && ref.current) return playInOrder(audiosToPlay(ref.current)) // cleanup stops it when the card changes
  }, [out, autoplay])
  return <div ref={ref} className="html" dangerouslySetInnerHTML={{ __html: out }} />
}
