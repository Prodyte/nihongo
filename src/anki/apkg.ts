import { decompress } from 'fzstd'
import JSZip from 'jszip'
import type { Database, SqlJsStatic } from 'sql.js'
import { parsePb, pbNum, pbText } from './proto'
import { mediaRefs } from './refs'
import { renderTemplate } from './render'

export class ApkgError extends Error {
  name = 'ApkgError'
}

export interface ParsedCard { id: string; deckId: string; front: string; back: string }
export interface Parsed {
  decks: { id: string; name: string }[]
  cards: ParsedCard[]
  media: Map<string, Uint8Array> // only files some card references, keyed by NFC name
  skipped: number
}

interface Model { type: number; flds: { name: string }[]; tmpls: { ord: number; qfmt: string; afmt: string }[] }
interface Collection { models: Record<string, Model>; deckNames: Record<string, string>; rows: unknown[][] }

const CARDS_SQL = 'select c.id, case when c.odid then c.odid else c.did end, c.ord, n.mid, n.flds from cards c join notes n on n.id = c.nid'

function readLegacy(db: Database): Collection {
  const [col] = db.exec('select models, decks from col')
  const decks: Record<string, { name: string }> = JSON.parse(String(col.values[0][1]))
  return {
    models: JSON.parse(String(col.values[0][0])),
    deckNames: Object.fromEntries(Object.entries(decks).map(([id, d]) => [id, d.name])),
    rows: db.exec(CARDS_SQL)[0]?.values ?? [],
  }
}

/** Latest format (schema 18): notetypes/fields/templates/decks tables with protobuf blobs. */
function readLatest(db: Database): Collection {
  // `not indexed`: those tables' name indexes use Anki's custom `unicase` collation, which sql.js lacks.
  const q = (sql: string) => db.exec(sql)[0]?.values ?? []
  const models: Record<string, Model> = {}
  for (const [id, cfg] of q('select id, config from notetypes not indexed'))
    models[String(id)] = { type: pbNum(parsePb(cfg as Uint8Array), 1), flds: [], tmpls: [] } // config.kind: 0 normal, 1 cloze
  for (const [ntid, , name] of q('select ntid, ord, name from fields not indexed order by ntid, ord')) models[String(ntid)]?.flds.push({ name: String(name) })
  for (const [ntid, ord, cfg] of q('select ntid, ord, config from templates not indexed order by ntid, ord')) {
    const f = parsePb(cfg as Uint8Array)
    models[String(ntid)]?.tmpls.push({ ord: Number(ord), qfmt: pbText(f, 1), afmt: pbText(f, 2) })
  }
  return {
    models,
    deckNames: Object.fromEntries(q('select id, name from decks not indexed').map(([id, name]) => [String(id), String(name).replaceAll('\x1f', '::')])),
    rows: q(CARDS_SQL),
  }
}

/** Media file name -> name inside the zip. Legacy: JSON map. Latest: zstd protobuf list (zip name = index unless given). */
async function mediaManifest(zip: JSZip, latest: boolean): Promise<[zipName: string, name: string][]> {
  const f = zip.file('media')
  if (!f) return []
  if (!latest) return Object.entries(JSON.parse(await f.async('string')) as Record<string, string>)
  return parsePb(decompress(await f.async('uint8array')))
    .filter((e) => e.no === 1 && e.bytes)
    .map((e, i) => {
      const inner = parsePb(e.bytes!)
      const legacyName = inner.find((x) => x.no === 255)?.num // optional explicit zip file name
      return [String(legacyName ?? i), pbText(inner, 1)]
    })
}

/**
 * Read an .apkg of any format: latest (.anki21b, zstd), or legacy (.anki21 / .anki2).
 * ponytail: decompression is unbounded (a zip bomb can exhaust memory); the 500 MB upload cap is the only guard.
 */
export async function parseApkg(bytes: ArrayBuffer | Uint8Array, SQL: SqlJsStatic): Promise<Parsed> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new ApkgError('That file is not a valid .apkg (not a zip archive).')
  }
  const latest = zip.file('collection.anki21b') // newest exports; collection.anki2 is then just a stub
  const file = latest ?? zip.file('collection.anki21') ?? zip.file('collection.anki2')
  if (!file) throw new ApkgError('Not an Anki deck: no collection found inside.')

  let db: Database
  try {
    const raw = await file.async('uint8array')
    db = new SQL.Database(latest ? decompress(raw) : raw)
  } catch {
    throw new ApkgError('Could not read the deck database. The file may be damaged.')
  }
  try {
    let col: Collection
    try {
      col = latest ? readLatest(db) : readLegacy(db)
    } catch (e) {
      throw new ApkgError(`Unrecognised deck format (${e instanceof Error ? e.message : e}).`)
    }
    const { models, deckNames, rows } = col

    const cards: ParsedCard[] = []
    const used = new Set<string>()
    let skipped = 0
    for (const [cid, did, ord, mid, flds] of rows) {
      const model = models[String(mid)]
      const tmpl = model?.tmpls.find((t) => t.ord === (model.type === 1 ? 0 : Number(ord)))
      if (!model || !tmpl) { skipped++; continue }
      const values = String(flds).split('\x1f')
      const fields = Object.fromEntries(model.flds.map((f, i) => [f.name, values[i] ?? '']))
      const ctx = { ord: Number(ord), answer: false, frontSide: '' }
      const front = renderTemplate(tmpl.qfmt, fields, ctx)
      const back = renderTemplate(tmpl.afmt, fields, { ...ctx, answer: true, frontSide: front })
      if (!front.replace(/<[^>]*>|&nbsp;|\s/g, '')) { skipped++; continue } // blank question
      used.add(String(did))
      cards.push({ id: String(cid), deckId: String(did), front, back })
    }

    // Only read (and decompress) media that some card actually refers to.
    const wanted = new Set(cards.flatMap((c) => mediaRefs(c.front + c.back)))
    const media = new Map<string, Uint8Array>()
    await Promise.all(
      (await mediaManifest(zip, !!latest)).map(async ([zipName, name]) => {
        const nfc = name.normalize('NFC')
        const f = wanted.has(nfc) ? zip.file(zipName) : null
        if (f) {
          const data = await f.async('uint8array')
          media.set(nfc, latest ? decompress(data) : data)
        }
      }),
    )
    return { decks: [...used].map((id) => ({ id, name: deckNames[id] ?? `Deck ${id}` })), cards, media, skipped }
  } finally {
    db.close()
  }
}
