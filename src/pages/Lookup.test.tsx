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
  expect(within(row).getByRole('link', { name: /Jisho/ }).getAttribute('href')).toBe(`https://jisho.org/search/${encodeURIComponent('時間')}`)
  await user.clear(screen.getByRole('searchbox', { name: /Search/ }))
  await user.type(screen.getByRole('searchbox', { name: /Search/ }), 'zzzzqq')
  expect(screen.getByRole('status').textContent).toBe('Nothing found in the course.')
})
