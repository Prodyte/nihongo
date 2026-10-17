import { useEffect, useRef, useState } from 'react'
import { audiosToPlay, playInOrder } from '../audio'
import type { Db } from '../db/db'
import { unescape } from './refs'
import { resolveMedia } from './resolve'

export function Html({ db, deck, html, autoplay = false }: { db: Db; deck: string; html: string; autoplay?: boolean }) {
  const [out, setOut] = useState({ h: '', answer: false })
  // The first html shown is the question (Flashcard swaps in the back on the same Html). Like Anki, the answer side
  // doesn't autoplay the question's [sound:]s again ({{FrontSide}} repeats them). ponytail: by file name, not position.
  const [asked] = useState(() => ({ html, sounds: new Set([...html.matchAll(/\[sound:([^\]]+)\]/g)].map((m) => unescape(m[1]))) }))
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let live = true
    const urls: string[] = []
    resolveMedia(db, deck, html, (b) => (urls.push(URL.createObjectURL(b)), urls.at(-1)!))
      .then((h) => live && setOut({ h, answer: html !== asked.html }))
      .catch(() => live && setOut({ h: '', answer: false }))
    return () => {
      live = false
      urls.forEach(URL.revokeObjectURL)
    }
  }, [db, deck, html, asked])
  useEffect(() => {
    if (autoplay && out.h && ref.current) // cleanup stops it when the card changes
      return playInOrder(audiosToPlay(ref.current).filter((a) => !(out.answer && asked.sounds.has(a.dataset.media ?? ''))))
  }, [out, autoplay, asked])
  return <div ref={ref} className="html" dangerouslySetInnerHTML={{ __html: out.h }} />
}
