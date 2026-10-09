import { useEffect, useState } from 'react'
import type { Db } from '../db/db'
import { resolveMedia } from './resolve'

export function Html({ db, deck, html }: { db: Db; deck: string; html: string }) {
  const [out, setOut] = useState('')
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
  return <div className="html" dangerouslySetInnerHTML={{ __html: out }} />
}
