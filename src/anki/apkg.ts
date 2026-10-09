import JSZip from 'jszip'
import type { SqlJsStatic } from 'sql.js'
import { renderTemplate } from './render'

export class ApkgError extends Error {}

export interface ParsedCard { id: string; deckId: string; front: string; back: string }
export interface Parsed {
  decks: { id: string; name: string }[]
  cards: ParsedCard[]
  media: Map<string, Uint8Array>
  skipped: number
}

interface Model { type: number; flds: { name: string }[]; tmpls: { ord: number; qfmt: string; afmt: string }[] }

/** Read a legacy-format .apkg (collection.anki2 / anki21). ponytail: loads all media into memory. */
export async function parseApkg(bytes: ArrayBuffer | Uint8Array, SQL: SqlJsStatic): Promise<Parsed> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(bytes)
  } catch {
    throw new ApkgError('That file is not a valid .apkg (not a zip archive).')
  }
  // Newest exports hold the real collection in a zstd-compressed .anki21b and a stub .anki2.
  if (!zip.file('collection.anki21') && zip.file('collection.anki21b'))
    throw new ApkgError('This deck uses the newest Anki format. In Anki, export it again with "Support older Anki versions" ticked.')
  const file = zip.file('collection.anki21') ?? zip.file('collection.anki2')
  if (!file) throw new ApkgError('Not an Anki deck: no collection found inside.')

  const db = new SQL.Database(await file.async('uint8array'))
  try {
    const [col] = db.exec('select models, decks from col')
    const models: Record<string, Model> = JSON.parse(String(col.values[0][0]))
    const deckNames: Record<string, { name: string }> = JSON.parse(String(col.values[0][1]))
    const rows = db.exec('select c.id, case when c.odid then c.odid else c.did end, c.ord, n.mid, n.flds from cards c join notes n on n.id = c.nid')[0]?.values ?? []

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

    const media = new Map<string, Uint8Array>()
    const mediaFile = zip.file('media')
    const map: Record<string, string> = mediaFile ? JSON.parse(await mediaFile.async('string')) : {}
    await Promise.all(
      Object.entries(map).map(async ([num, name]) => {
        const f = zip.file(num)
        if (f) media.set(name, await f.async('uint8array'))
      }),
    )
    return { decks: [...used].map((id) => ({ id, name: deckNames[id]?.name ?? `Deck ${id}` })), cards, media, skipped }
  } finally {
    db.close()
  }
}
