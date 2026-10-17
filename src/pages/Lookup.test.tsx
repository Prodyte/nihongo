// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { openDb } from '../db/db'
import { ITEMS, LESSONS } from '../path/course'
import { completeLesson } from '../path/progress'
import { Lookup } from './Lookup'

afterEach(cleanup)

it('typing a search lists matches with level and learning state, and a Jisho link', async () => {
  const db = await openDb('lookup-1')
  await completeLesson(db, LESSONS.find((l) => l.items.includes('w:時間'))!, ITEMS, {}, 1)
  const user = userEvent.setup()
  render(<Lookup db={db} />)
  await user.type(screen.getByRole('searchbox', { name: /Search/ }), 'jikan')
  const row = (await screen.findAllByRole('listitem'))[0]
  expect(row.textContent).toMatch(/時間 じかん time/)
  expect(within(row).getByText('N5')).toBeTruthy()
  expect(await within(row).findByText('Apprentice')).toBeTruthy()
  expect(within(row).queryByRole('link')).toBeNull() // a closed row renders only its summary
  await user.click(row.querySelector('summary')!)
  expect(within(row).getByRole('link', { name: /Jisho/ }).getAttribute('href')).toBe(`https://jisho.org/search/${encodeURIComponent('時間')}`)
  await user.clear(screen.getByRole('searchbox', { name: /Search/ }))
  await user.type(screen.getByRole('searchbox', { name: /Search/ }), 'zzzzqq')
  expect(screen.getByRole('status').textContent).toBe('Nothing found in the course.')
})

it('Study this saves a word and makes its card; with an empty search the saved words are listed', async () => {
  const db = await openDb('lookup-2')
  const user = userEvent.setup()
  render(<Lookup db={db} />)
  await user.type(screen.getByRole('searchbox', { name: /Search/ }), 'jikan')
  const row = (await screen.findAllByRole('listitem'))[0]
  await user.click(row.querySelector('summary')!)
  await user.click(within(row).getByRole('button', { name: 'Study this' }))
  expect((await within(row).findByRole('button', { name: 'Studying' })).getAttribute('aria-pressed')).toBe('true')
  expect((await db.get('cards', 'w:時間'))!.saved).toBeGreaterThan(0)
  await user.clear(screen.getByRole('searchbox', { name: /Search/ }))
  expect(screen.getByRole('heading', { name: 'Saved words' })).toBeTruthy()
  expect(screen.getAllByRole('listitem')[0].textContent).toMatch(/時間/)
})

it('Kanji by parts: picking parts lists the kanji made of all of them and dims parts that would find none', async () => {
  const user = userEvent.setup()
  render(<Lookup db={await openDb('lookup-3')} />)
  await user.click(screen.getByRole('button', { name: 'Kanji by parts' }))
  await user.click(screen.getByRole('button', { name: '亻 person' }))
  await user.click(screen.getByRole('button', { name: '木 tree' }))
  expect(screen.getAllByRole('listitem').map((li) => li.querySelector('.jp')!.textContent)).toEqual(['休'])
  expect((screen.getByRole('button', { name: '門 gate' }) as HTMLButtonElement).disabled).toBe(true)
  await user.click(screen.getByRole('button', { name: 'Clear parts' }))
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Clear parts' })) // focus stays put
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  expect((screen.getByRole('button', { name: '門 gate' }) as HTMLButtonElement).disabled).toBe(false)
})
