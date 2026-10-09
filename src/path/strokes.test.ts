import { describe, expect, it } from 'vitest'
import { checkStroke, resample, type Pt } from './strokes'

const line = (a: Pt, b: Pt, n = 10): Pt[] => Array.from({ length: n }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / (n - 1), a[1] + ((b[1] - a[1]) * i) / (n - 1)])
const horizontal = line([20, 50], [90, 50])

describe('resample', () => {
  it('spaces points evenly along the line, keeping both ends', () => {
    const r = resample([[0, 0], [10, 0], [10, 10]], 5)
    expect(r).toHaveLength(5)
    expect(r[0]).toEqual([0, 0])
    expect(r[4]).toEqual([10, 10])
    expect(r[2][0]).toBeCloseTo(10)
    expect(r[2][1]).toBeCloseTo(0)
  })
})

describe('checkStroke', () => {
  it('accepts a wobbly but faithful stroke, drawn with any number of points', () => {
    const wobbly: Pt[] = line([24, 46], [86, 55], 40).map(([x, y], i) => [x, y + (i % 2 ? 2 : -2)])
    expect(checkStroke(wobbly, horizontal)).toEqual({ ok: true })
    expect(checkStroke(line([20, 50], [90, 50], 3), horizontal)).toEqual({ ok: true })
  })
  it('says "direction" for the right line drawn backwards', () => {
    expect(checkStroke(line([90, 50], [20, 50]), horizontal)).toEqual({ ok: false, why: 'direction' })
  })
  it('rejects a different stroke (a vertical for a horizontal, or one far away)', () => {
    expect(checkStroke(line([55, 15], [55, 95]), horizontal)).toEqual({ ok: false, why: 'shape' })
    expect(checkStroke(line([20, 90], [90, 90]), horizontal)).toEqual({ ok: false, why: 'shape' })
  })
  it('rejects a tap or a stub as too short, but a short dot stroke can match', () => {
    expect(checkStroke([[20, 50]], horizontal)).toEqual({ ok: false, why: 'short' })
    expect(checkStroke(line([20, 50], [30, 50]), horizontal)).toEqual({ ok: false, why: 'short' })
    const dot = line([50, 20], [56, 28])
    expect(checkStroke(line([49, 19], [57, 29]), dot)).toEqual({ ok: true })
  })
})
