// Checking a hand-drawn stroke against KanjiVG's stroke, in KanjiVG's 109x109 coordinates.

export type Pt = [number, number]

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1])
const length = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + dist(pts[i], p), 0)

/** `n` points evenly spaced along a polyline (so a slow and a fast stroke compare alike). */
export function resample(pts: Pt[], n: number): Pt[] {
  if (pts.length < 2) return Array.from({ length: n }, () => pts[0] ?? [0, 0])
  const step = length(pts) / (n - 1)
  if (step === 0) return Array.from({ length: n }, () => pts[0])
  const out: Pt[] = [pts[0]]
  let need = step
  for (let i = 1; i < pts.length && out.length < n; i++) {
    let [a, b] = [pts[i - 1], pts[i]]
    let d = dist(a, b)
    while (d >= need && out.length < n) {
      const t = need / d
      a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
      out.push(a)
      d -= need
      need = step
    }
    need -= d
  }
  while (out.length < n) out.push(pts.at(-1)!)
  return out
}

const N = 16
const END_SLACK = 20 // how far the start and end may be from KanjiVG's (the box is 109 wide)
const SHAPE_SLACK = 13 // average distance between the strokes, point by point

export type StrokeCheck = { ok: true } | { ok: false; why: 'direction' | 'shape' | 'short' }

/** Does a drawn stroke match the expected one? Start, end, direction and shape must agree, loosely. */
export function checkStroke(drawn: Pt[], expected: Pt[]): StrokeCheck {
  if (drawn.length < 2 || length(drawn) < Math.max(4, length(expected) * 0.4)) return { ok: false, why: 'short' }
  const d = resample(drawn, N)
  const e = resample(expected, N)
  const mean = (x: Pt[], y: Pt[]) => x.reduce((s, p, i) => s + dist(p, y[i]), 0) / x.length
  const fits = (x: Pt[]) => dist(x[0], e[0]) <= END_SLACK && dist(x.at(-1)!, e.at(-1)!) <= END_SLACK && mean(x, e) <= SHAPE_SLACK
  if (fits(d)) return { ok: true }
  if (fits([...d].reverse())) return { ok: false, why: 'direction' } // the right line, drawn backwards
  return { ok: false, why: 'shape' }
}

let strokes: Promise<Record<string, string[]>> | null = null
/** Stroke paths for the course's kanji (KanjiVG, CC BY-SA 3.0), fetched once on first use and cached offline by the PWA. */
export const loadStrokes = () => {
  strokes ??= fetch(`${import.meta.env.BASE_URL}strokes.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
  strokes.catch(() => { strokes = null }) // let a later card try again (e.g. back online)
  return strokes
}

/** Points along an SVG path, measured by the browser (the stroke data is SVG path syntax). */
export function samplePath(d: string, n = 24): Pt[] {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  p.setAttribute('d', d)
  const len = p.getTotalLength()
  return Array.from({ length: n }, (_, i) => { const q = p.getPointAtLength((len * i) / (n - 1)); return [q.x, q.y] as Pt })
}
