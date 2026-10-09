// Just enough protobuf to read Anki's template/notetype/media blobs: top-level varint and
// length-delimited fields. Anything else (fixed32/64 are skipped) means unfamiliar data.
export interface PbField { no: number; num?: number; bytes?: Uint8Array }

export function parsePb(buf: Uint8Array): PbField[] {
  const out: PbField[] = []
  let i = 0
  const bad = () => new Error('Malformed protobuf data')
  const varint = () => {
    let r = 0
    for (let shift = 0; ; shift += 7) {
      if (i >= buf.length || shift > 63) throw bad() // int64 varints take up to 10 bytes
      const b = buf[i++]
      r += (b & 0x7f) * 2 ** shift // multiply: `<<` would overflow 32 bits
      if (!(b & 0x80)) return r
    }
  }
  while (i < buf.length) {
    const tag = varint()
    const no = Math.floor(tag / 8)
    switch (tag % 8) {
      case 0: out.push({ no, num: varint() }); break
      case 2: {
        const len = varint()
        if (i + len > buf.length) throw bad()
        out.push({ no, bytes: buf.subarray(i, i + len) })
        i += len
        break
      }
      case 1: i += 8; break
      case 5: i += 4; break
      default: throw bad()
    }
  }
  return out
}

const utf8 = new TextDecoder()
export const pbText = (fs: PbField[], no: number) => { const f = fs.find((x) => x.no === no); return f?.bytes ? utf8.decode(f.bytes) : '' }
export const pbNum = (fs: PbField[], no: number) => fs.find((x) => x.no === no)?.num ?? 0
