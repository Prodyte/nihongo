import { describe, expect, it } from 'vitest'
import { parsePb, pbNum, pbText } from './proto'

const bytes = (...n: number[]) => new Uint8Array(n)

describe('parsePb', () => {
  it('reads varint and length-delimited fields, plus text/num helpers', () => {
    const f = parsePb(bytes(0x0a, 2, 0x68, 0x69, 0x10, 0xac, 0x02)) // f1="hi", f2=300
    expect(pbText(f, 1)).toBe('hi')
    expect(pbNum(f, 2)).toBe(300)
    expect(pbText(f, 9)).toBe('')
    expect(pbNum(f, 9)).toBe(0)
  })
  it('accepts 10-byte int64 varints (Anki stores template ids this way)', () => {
    const f = parsePb(bytes(0x40, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01, 0x0a, 1, 0x41))
    expect(f.find((x) => x.no === 8)?.num).toBeGreaterThan(2 ** 63)
    expect(pbText(f, 1)).toBe('A') // parsing continues correctly after it
  })
  it('skips fixed32/fixed64 fields', () => {
    const f = parsePb(bytes(0x0d, 1, 2, 3, 4, 0x11, 1, 2, 3, 4, 5, 6, 7, 8, 0x1a, 1, 0x7a))
    expect(f.map((x) => x.no)).toEqual([3])
  })
  it.each([
    ['truncated length-delimited field', bytes(0x0a, 5, 0x61)],
    ['truncated varint', bytes(0x10, 0x80)],
    ['over-long varint', bytes(0x10, ...Array(11).fill(0xff), 0x01)],
    ['deprecated group wire type', bytes(0x0b)],
  ])('rejects %s', (_, buf) => {
    expect(() => parsePb(buf)).toThrow('Malformed protobuf')
  })
})
