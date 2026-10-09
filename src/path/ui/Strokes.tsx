import { useEffect, useState } from 'react'

let strokes: Promise<Record<string, string[]>> | null = null
/** Stroke paths for the course's kanji (KanjiVG, CC BY-SA 3.0), fetched once on first use and cached offline by the PWA. */
const load = () => {
  strokes ??= fetch(`${import.meta.env.BASE_URL}strokes.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
  strokes.catch(() => { strokes = null }) // let a later card try again (e.g. back online)
  return strokes
}

const STEP = 0.6 // seconds per stroke

/** The kanji drawn stroke by stroke, with numbered strokes; falls back to the plain character until (or unless) the data loads. */
export function Strokes({ char }: { char: string }) {
  const [paths, setPaths] = useState<string[] | null>(null)
  const [run, setRun] = useState(0) // bump to replay
  useEffect(() => {
    let live = true
    load().then((all) => live && setPaths(all[char] ?? null), () => {})
    return () => {
      live = false
    }
  }, [char])

  if (!paths) return <div className="kana" lang="ja">{char}</div>
  return (
    <div className="strokes">
      <svg key={run} viewBox="0 0 109 109" role="img" aria-label={`${char}, written in ${paths.length} strokes`}>
        {paths.map((d, i) => <path key={`g${i}`} d={d} className="guide" />)}
        {paths.map((d, i) => <path key={i} d={d} pathLength={1} className="stroke" style={{ animationDelay: `${(i * STEP).toFixed(1)}s` }} />)}
      </svg>
      <button type="button" onClick={() => setRun((r) => r + 1)}>Replay strokes</button>
    </div>
  )
}
