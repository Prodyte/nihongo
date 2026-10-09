import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { checkStroke, samplePath, type Pt } from '../strokes'

const SIZE = 109 // KanjiVG coordinates

const WHY = { direction: 'Wrong direction: strokes go top to bottom, left to right.', shape: 'Not quite. Try that stroke again.', short: 'Draw the whole stroke in one go.' }

/**
 * Write a kanji stroke by stroke, in order. With `guide`, the strokes show faintly to trace. A wrong stroke is not
 * drawn; after two misses on the same stroke, it is shown as a hint. Reports the number of misses when done.
 */
export function WriteBoard({ paths, samples, guide, onDone }: { paths: string[]; samples?: Pt[][]; guide: boolean; onDone: (mistakes: number) => void }) {
  const expected = useMemo(() => samples ?? paths.map((d) => samplePath(d)), [paths, samples])
  const [next, setNext] = useState(0)
  const [line, setLine] = useState<Pt[]>([])
  const [misses, setMisses] = useState(0)
  const [missesHere, setMissesHere] = useState(0)
  const [msg, setMsg] = useState(`Stroke 1 of ${paths.length}`)
  const svg = useRef<SVGSVGElement>(null)
  const pts = useRef<Pt[] | null>(null) // the stroke being drawn (a ref: pointer events can outrun renders)
  const finished = next >= paths.length

  const at = (e: PointerEvent): Pt => {
    const r = svg.current!.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE]
  }
  function down(e: PointerEvent<SVGSVGElement>) {
    if (finished) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pts.current = [at(e)]
    setLine(pts.current)
  }
  function move(e: PointerEvent) {
    if (!pts.current) return
    pts.current = [...pts.current, at(e)]
    setLine(pts.current)
  }
  function up() {
    const drawn = pts.current
    if (!drawn) return
    pts.current = null
    const r = checkStroke(drawn, expected[next])
    setLine([])
    if (r.ok) {
      const n = next + 1
      setNext(n)
      setMissesHere(0)
      setMsg(n < paths.length ? `Stroke ${n + 1} of ${paths.length}` : 'Done!')
      if (n === paths.length) onDone(misses)
    } else {
      setMisses((m) => m + 1)
      setMissesHere((m) => m + 1)
      setMsg(WHY[r.why])
    }
  }

  const hint = guide || missesHere >= 2
  return (
    <div className="writeboard">
      <svg ref={svg} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Writing area. ${msg}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <path d="M54.5 0V109M0 54.5H109" className="grid" />
        {guide && paths.map((d, i) => <path key={`g${i}`} d={d} className="guide" />)}
        {!guide && hint && !finished && <path d={paths[next]} className="hint-stroke" />}
        {hint && !finished && <circle cx={expected[next][0][0]} cy={expected[next][0][1]} r={3} className="start" />}
        {paths.slice(0, next).map((d, i) => <path key={i} d={d} className="ink" />)}
        {line.length > 1 && <polyline points={line.map((p) => p.join(',')).join(' ')} className="pen" />}
      </svg>
      <p aria-live="polite" className={msg.startsWith('Stroke') || msg === 'Done!' ? 'hint' : 'hint bad'}>{msg}</p>
    </div>
  )
}
