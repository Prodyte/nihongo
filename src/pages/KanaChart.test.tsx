// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Rating } from 'ts-fsrs'
import { afterEach, expect, it } from 'vitest'
import { gradeCard, openDb, seedKana } from '../db/db'
import { KanaChart } from './KanaChart'

afterEach(cleanup)

it('shows all 104 kana per script with romaji, marks learned ones, and switches scripts', async () => {
  const db = await openDb('kana-chart')
  await seedKana(db)
  await gradeCard(db, 'kana:あ', Rating.Good)
  const user = userEvent.setup()
  render(<KanaChart db={db} onExit={() => {}} />)
  expect(document.querySelectorAll('button.kana-cell')).toHaveLength(46 + 25 + 33)
  expect(await screen.findByRole('button', { name: 'あ a, learned' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'しゃ sha' })).toBeTruthy()
  await user.click(screen.getByRole('tab', { name: /Katakana/ }))
  expect(screen.getByRole('button', { name: 'ア a, learned' })).toBeTruthy() // one card per sound: learning あ is learning ア
})

it('tapping a kana opens its writing practice under its row (in the script shown); a combined sound only plays', async () => {
  const db = await openDb('kana-chart-write')
  const user = userEvent.setup()
  render(<KanaChart db={db} onExit={() => {}} />)
  expect(screen.queryByRole('button', { name: 'Practise writing' })).toBeNull()
  await user.click(screen.getByRole('button', { name: 'か ka' }))
  expect(screen.getByRole('button', { name: 'か ka' }).getAttribute('aria-expanded')).toBe('true')
  expect(screen.getAllByRole('button', { name: 'Practise writing' })).toHaveLength(1)
  await user.click(screen.getByRole('tab', { name: /Katakana/ }))
  expect(screen.getByText('カ', { selector: '.detail .kana' })).toBeTruthy() // the stroke panel's fallback glyph (no stroke data in jsdom)
  await user.click(screen.getByRole('button', { name: 'カ ka' }))
  expect(screen.queryByRole('button', { name: 'Practise writing' })).toBeNull()
  await user.click(screen.getByRole('button', { name: 'キャ kya' }))
  expect(screen.queryByRole('button', { name: 'Practise writing' })).toBeNull()
})
