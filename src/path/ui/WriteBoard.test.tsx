// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Pt } from '../strokes'
import { WriteBoard } from './WriteBoard'

const line = (a: Pt, b: Pt, n = 8): Pt[] => Array.from({ length: n }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / (n - 1), a[1] + ((b[1] - a[1]) * i) / (n - 1)])
// a two-stroke character: a horizontal, then a vertical
const samples = [line([20, 30], [90, 30]), line([55, 10], [55, 100])]
const paths = ['M20,30 L90,30', 'M55,10 L55,100']

beforeEach(() => { Element.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, width: 109, height: 109 }) as DOMRect })
afterEach(cleanup)

function draw(pts: Pt[]) {
  const svg = screen.getByRole('img')
  fireEvent.pointerDown(svg, { clientX: pts[0][0], clientY: pts[0][1], pointerId: 1 })
  for (const [x, y] of pts.slice(1)) fireEvent.pointerMove(svg, { clientX: x, clientY: y, pointerId: 1 })
  fireEvent.pointerUp(svg, { pointerId: 1 })
}

it('strokes in order complete the kanji; a wrong stroke is not drawn and is counted', () => {
  const onDone = vi.fn()
  render(<WriteBoard paths={paths} samples={samples} guide={false} onDone={onDone} />)
  expect(screen.getByText('Stroke 1 of 2')).toBeTruthy()
  draw(samples[1]) // the vertical first: out of order
  expect(screen.getByText('Not quite. Try that stroke again.')).toBeTruthy()
  expect(document.querySelectorAll('path.ink')).toHaveLength(0)
  draw([...samples[0]].reverse() as Pt[]) // right line, backwards
  expect(screen.getByText(/Wrong direction/)).toBeTruthy()
  expect(document.querySelector('path.hint')).toBeTruthy() // two misses: the stroke is shown as a hint
  draw(samples[0])
  expect(screen.getByText('Stroke 2 of 2')).toBeTruthy()
  expect(document.querySelectorAll('path.ink')).toHaveLength(1)
  expect(document.querySelector('path.hint')).toBeNull() // a new stroke starts without a hint
  draw(samples[1])
  expect(onDone).toHaveBeenCalledWith(2)
  expect(screen.getByText('Done!')).toBeTruthy()
})

it('tracing shows every stroke faintly', () => {
  render(<WriteBoard paths={paths} samples={samples} guide={true} onDone={() => {}} />)
  expect(document.querySelectorAll('path.guide')).toHaveLength(2)
})
