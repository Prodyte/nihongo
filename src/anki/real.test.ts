// Optional check against a real deck: REAL_APKG=/path/to/deck.apkg npm test -- real
import fs from 'node:fs'
import initSqlJs from 'sql.js'
import { expect, it } from 'vitest'
import { parseApkg } from './apkg'

it.skipIf(!process.env.REAL_APKG)('parses a real .apkg', { timeout: 120_000 }, async () => {
  const SQL = await initSqlJs()
  const t0 = Date.now()
  const p = await parseApkg(fs.readFileSync(process.env.REAL_APKG!), SQL)
  console.log(`parsed in ${Date.now() - t0} ms: ${p.decks.map((d) => d.name).join(', ')}; ${p.cards.length} cards, ${p.skipped} skipped, ${p.media.size} media files (${Math.round([...p.media.values()].reduce((n, b) => n + b.length, 0) / 1048576)} MB)`)
  const c = p.cards[1] ?? p.cards[0]
  console.log('FRONT:', c.front.slice(0, 700))
  console.log('BACK:', c.back.slice(0, 1200))
  const names = [...p.media.keys()]
  console.log('media sample:', names.slice(0, 4).join(', '), '| exts:', [...new Set(names.map((n) => n.split('.').pop()))].join(','))
  expect(p.cards.length).toBeGreaterThan(0)
})
