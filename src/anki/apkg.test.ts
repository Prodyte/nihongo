// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import JSZip from 'jszip'
import initSqlJs from 'sql.js'
import { Rating, State } from 'ts-fsrs'
import { describe, expect, it } from 'vitest'
import { deleteDeck, getDeck, gradeCard, openDb, saveImport, studyCards } from '../db/db'
import { ApkgError, parseApkg } from './apkg'

const SQL = await initSqlJs()

/** Build a legacy-schema .apkg: 1 basic note (2 cards via reverse template), 1 cloze note, 1 blank note, 1 image. */
async function makeApkg(extra: Record<string, Uint8Array | string> = {}) {
  const db = new SQL.Database()
  db.run('create table col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)')
  db.run('create table notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)')
  db.run('create table cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)')
  const models = {
    1: { type: 0, flds: [{ name: 'Front' }, { name: 'Back' }], tmpls: [
      { ord: 0, qfmt: '{{Front}}', afmt: '{{FrontSide}}<hr id=answer>{{Back}}' },
      { ord: 1, qfmt: '{{Back}}', afmt: '{{FrontSide}}<hr id=answer>{{furigana:Front}}' },
    ] },
    2: { type: 1, flds: [{ name: 'Text' }], tmpls: [{ ord: 0, qfmt: '{{cloze:Text}}', afmt: '{{cloze:Text}}' }] },
  }
  db.run('insert into col values (1,0,0,0,11,0,0,0,"{}",?,?,"{}","{}")', [
    JSON.stringify(models), JSON.stringify({ 10: { name: 'Japanese::Basics' }, 11: { name: 'Empty' } }),
  ])
  const note = (id: number, mid: number, flds: string[]) => db.run('insert into notes values (?,?,?,0,0,"",?,"",0,0,"")', [id, `g${id}`, mid, flds.join('\x1f')])
  const card = (id: number, nid: number, ord: number) => db.run('insert into cards values (?,?,10,?,0,0,0,0,0,0,0,0,0,0,0,0,0,"")', [id, nid, ord])
  note(100, 1, ['犬[いぬ]', 'dog <img src="dog.png"><img src=a&amp;b.png><img src="が.png">']); card(1000, 100, 0); card(1001, 100, 1)
  note(101, 2, ['{{c1::Tokyo}} is the capital']); card(1002, 101, 0)
  note(102, 1, ['', '']); card(1003, 102, 0) // blank question
  const zip = new JSZip()
  zip.file('collection.anki2', db.export())
  zip.file('media', JSON.stringify({ 0: 'dog.png', 1: 'unused.png', 2: 'a&b.png', 3: 'か\u3099.png' }))
  zip.file('0', new Uint8Array([137, 80, 78, 71]))
  zip.file('1', new Uint8Array([1]))
  zip.file('2', new Uint8Array([2]))
  zip.file('3', new Uint8Array([3]))
  for (const [k, v] of Object.entries(extra)) zip.file(k, v)
  return zip.generateAsync({ type: 'uint8array' })
}

describe('parseApkg', () => {
  it('renders standard + cloze cards, skips blank ones, reads media and deck names', async () => {
    const p = await parseApkg(await makeApkg(), SQL)
    expect(p.decks).toEqual([{ id: '10', name: 'Japanese::Basics' }]) // empty deck omitted
    expect(p.cards.map((c) => c.id)).toEqual(['1000', '1001', '1002'])
    expect(p.skipped).toBe(1)
    const [fwd, rev, cloze] = p.cards
    expect(fwd.front).toBe('犬[いぬ]')
    expect(fwd.back).toContain('dog <img src="dog.png">')
    expect(rev.back).toContain('<ruby>犬<rt>いぬ</rt></ruby>') // reverse card answer uses furigana filter
    expect(cloze.front).toBe('<span class="cloze">[...]</span> is the capital')
    expect(p.media.get('dog.png')).toEqual(new Uint8Array([137, 80, 78, 71]))
  })
  it('explains the newest format instead of importing the stub', async () => {
    const err = await parseApkg(await makeApkg({ 'collection.anki21b': 'x' }), SQL).catch((e) => e)
    expect(err).toBeInstanceOf(ApkgError)
    expect(err.message).toMatch(/Support older Anki versions/)
  })
  it('rejects non-zip and empty zips', async () => {
    await expect(parseApkg(new Uint8Array([1, 2, 3]), SQL)).rejects.toThrow(/not a zip/)
    await expect(parseApkg(await new JSZip().generateAsync({ type: 'uint8array' }), SQL)).rejects.toThrow(/no collection/)
  })
})

describe('saveImport / deleteDeck', () => {
  it('imports, keeps progress on re-import, filters html cards from typing/quiz, and deletes everything', async () => {
    const db = await openDb('apkg-test')
    const parsed = await parseApkg(await makeApkg(), SQL)
    expect(await saveImport(db, parsed)).toEqual({ added: 3, updated: 0, skipped: 1 })

    await gradeCard(db, 'anki:10:1000', Rating.Good)
    expect(await saveImport(db, parsed)).toEqual({ added: 0, updated: 3, skipped: 1 })
    expect((await db.get('cards', 'anki:10:1000'))!.fsrs.state).not.toBe(State.New)
    expect((await db.get('cards', 'anki:10:1001'))!.fsrs.state).toBe(State.New)

    expect(await studyCards(db, 'anki:10', 'flashcard')).toHaveLength(3)
    expect(await studyCards(db, 'anki:10', 'typing')).toHaveLength(0)
    expect(await db.get('media', 'anki:10\0dog.png')).toMatchObject({ type: 'image/png' })
    expect(await db.get('media', 'anki:10\0unused.png')).toBeUndefined() // not referenced by any card
    expect(await db.get('media', 'anki:10\0a&b.png')).toBeDefined() // unquoted src + &amp; entity
    expect(await db.get('media', 'anki:10\0が.png')).toBeDefined() // NFD manifest name, NFC html name

    await deleteDeck(db, 'anki:10')
    expect(await getDeck(db, 'anki:10')).toHaveLength(0)
    expect(await db.count('reviews')).toBe(0)
    expect(await db.count('media')).toBe(0)
    expect(await db.count('decks')).toBe(0)
  })
})

describe('resolveMedia', () => {
  it('sanitizes scripts/handlers, drops remote images, wires local media', async () => {
    const { resolveMedia } = await import('./resolve')
    const db = await openDb('media-test')
    await saveImport(db, await parseApkg(await makeApkg(), SQL))
    const html = [
      '<b>ok</b><script>alert(1)</script>',
      '<img src="dog.png" onerror="alert(2)">',
      '<img src="https://evil.example/pixel.gif">',
      '<img src="nope.png">',
      '<a href="javascript:alert(3)">x</a>',
      '[sound:dog.png]',
      '<img src="dog.png" srcset="https://evil.example/2x.png 2x">',
      '<div style="background:url(https://evil.example/x)">s</div><style>body{display:none}</style>',
      '<form action="https://evil.example"><input name="pw"></form>',
      '<img src="dog%.png">', // malformed % must not blank the card
    ].join('')
    const out = await resolveMedia(db, 'anki:10', html, () => 'blob:test')
    expect(out).toContain('<b>ok</b>')
    expect(out).not.toMatch(/script|onerror|javascript:|evil\.example|nope\.png|srcset|style|<form|<input/)
    expect(out).toContain('<img src="blob:test">')
    expect(out).toContain('<audio controls="" data-media="dog.png" src="blob:test"></audio>')
  })
})
