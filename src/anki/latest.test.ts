// @vitest-environment jsdom
import { zstdCompressSync } from 'node:zlib'
import JSZip from 'jszip'
import initSqlJs from 'sql.js'
import { describe, expect, it } from 'vitest'
import { ApkgError, parseApkg } from './apkg'

const SQL = await initSqlJs()
const enc = new TextEncoder()
const zstd = (b: Uint8Array) => new Uint8Array(zstdCompressSync(b))

// minimal protobuf writer
const varint = (n: number) => { const o: number[] = []; do { const x = n % 128; n = Math.floor(n / 128); o.push(n ? x | 128 : x) } while (n); return o }
const ld = (no: number, d: Uint8Array | string) => { const b = typeof d === 'string' ? enc.encode(d) : d; return [...varint(no * 8 + 2), ...varint(b.length), ...b] }
const vi = (no: number, n: number) => [...varint(no * 8), ...varint(n)]
const bin = (a: number[]) => new Uint8Array(a)

/** Latest-format (.anki21b, schema 18) package: zstd collection, protobuf blobs, zstd media. */
async function makeLatest(opts: { badCollection?: boolean; legacyDbInSlot?: boolean } = {}) {
  const db = new SQL.Database()
  db.run('create table notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)')
  db.run('create table cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)')
  db.run('create table notetypes (id, name, mtime_secs, usn, config)')
  db.run('create table fields (ntid, ord, name, config)')
  db.run('create table templates (ntid, ord, name, mtime_secs, usn, config)')
  db.run('create table decks (id, name, mtime_secs, usn, common, kind)')
  // notetype 1 = Basic with spaced field names (kind omitted = normal), 2 = Cloze (kind = 1)
  db.run('insert into notetypes values (1,"Basic",0,0,?), (2,"Cloze",0,0,?)', [bin([...ld(3, 'css')]), bin([...vi(1, 1), ...ld(3, 'css')])])
  for (const [i, n] of ['Word Front', 'Word Back'].entries()) db.run('insert into fields values (1,?,?,zeroblob(0))', [i, n])
  db.run('insert into fields values (2,0,"Text",zeroblob(0))')
  const tmpl = (nt: number, ord: number, q: string, a: string) =>
    db.run('insert into templates values (?,?,"Card",0,0,?)', [nt, ord, bin([...ld(1, q), ...ld(2, a), 0x40, ...Array(9).fill(0xff), 0x01])]) // + a 10-byte varint like real Anki
  tmpl(1, 0, '{{Word Front}}', '{{FrontSide}}<hr id=answer>{{Word Back}}<img src="pic.png">[sound:beep.mp3]')
  tmpl(2, 0, '{{cloze:Text}}', '{{cloze:Text}}')
  db.run('insert into decks values (10,?,0,0,zeroblob(0),zeroblob(0))', ['Japanese\x1fBasics'])
  db.run('insert into decks values (1,"Default",0,0,zeroblob(0),zeroblob(0))')
  const note = (id: number, mid: number, f: string[]) => db.run('insert into notes values (?,?,?,0,0,"",?,"",0,0,"")', [id, `g${id}`, mid, f.join('\x1f')])
  const card = (id: number, nid: number) => db.run('insert into cards values (?,?,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"")', [id, nid])
  note(100, 1, ['犬', 'dog']); card(1000, 100)
  note(101, 2, ['{{c1::Tokyo}} is the capital']); card(1001, 101)
  note(102, 1, ['', '']); card(1002, 102) // blank question

  const zip = new JSZip()
  zip.file('meta', bin([8, 3]))
  zip.file('collection.anki2', 'stub')
  const raw = opts.legacyDbInSlot ? new Uint8Array([1, 2, 3]) : db.export()
  zip.file('collection.anki21b', opts.badCollection ? bin([1, 2, 3, 4]) : opts.legacyDbInSlot ? zstd(new SQL.Database().export()) : zstd(raw))
  // media list: entry 0 pic.png (zip file "0"), entry 1 beep.mp3 with an explicit zip name "7", entry 2 unused.bin (zip file "2", deliberately NOT valid zstd)
  const entries = [ld(1, bin([...ld(1, 'pic.png'), ...vi(2, 4)])), ld(1, bin([...ld(1, 'beep.mp3'), ...vi(255, 7)])), ld(1, bin([...ld(1, 'unused.bin')]))]
  zip.file('media', zstd(bin(entries.flat())))
  zip.file('0', zstd(bin([137, 80, 78, 71])))
  zip.file('7', zstd(bin([1, 2, 3])))
  zip.file('2', bin([0, 0, 0])) // never read: no card references unused.bin
  return zip.generateAsync({ type: 'uint8array' })
}

describe('parseApkg: latest (.anki21b) format', () => {
  it('reads zstd collection, protobuf templates and notetype kind, deck names and media', async () => {
    const p = await parseApkg(await makeLatest(), SQL)
    expect(p.decks).toEqual([{ id: '10', name: 'Japanese::Basics' }]) // \x1f hierarchy separator -> '::'
    expect(p.cards.map((c) => c.id)).toEqual(['1000', '1001'])
    expect(p.skipped).toBe(1)
    expect(p.cards[0].front).toBe('犬')
    expect(p.cards[0].back).toBe('犬<hr id=answer>dog<img src="pic.png">[sound:beep.mp3]')
    expect(p.cards[1].front).toBe('<span class="cloze">[...]</span> is the capital') // kind=1 -> cloze handling
    expect([...p.media.keys()].sort()).toEqual(['beep.mp3', 'pic.png']) // unused.bin never read
    expect(p.media.get('pic.png')).toEqual(bin([137, 80, 78, 71]))
    expect(p.media.get('beep.mp3')).toEqual(bin([1, 2, 3])) // via explicit zip file name 7
  })
  it('rejects a package with no usable cards', async () => {
    const db = new SQL.Database()
    for (const t of ['notes (id,guid,mid,mod,usn,tags,flds,sfld,csum,flags,data)', 'cards (id,nid,did,ord,mod,usn,type,queue,due,ivl,factor,reps,lapses,left,odue,odid,flags,data)', 'notetypes (id,name,mtime_secs,usn,config)', 'fields (ntid,ord,name,config)', 'templates (ntid,ord,name,mtime_secs,usn,config)', 'decks (id,name,mtime_secs,usn,common,kind)']) db.run(`create table ${t}`)
    const zip = new JSZip()
    zip.file('collection.anki21b', zstd(db.export()))
    await expect(parseApkg(await zip.generateAsync({ type: 'uint8array' }), SQL)).rejects.toThrow(/No cards found/)
  })
  it('reports unreadable and unrecognised collections as ApkgError', async () => {
    await expect(parseApkg(await makeLatest({ badCollection: true }), SQL)).rejects.toThrow(/Could not read the deck database/)
    const err = await parseApkg(await makeLatest({ legacyDbInSlot: true }), SQL).catch((e) => e)
    expect(err).toBeInstanceOf(ApkgError)
    expect(err.message).toMatch(/Unrecognised deck format/)
  })
})
