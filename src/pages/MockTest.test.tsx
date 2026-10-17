// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { openDb, seedKana } from '../db/db'
import { MOCK_MINUTES, MOCK_QUESTIONS, mockBestKey } from '../path/mock'
import { getProgress } from '../path/progress'
import { MockTest } from './MockTest'

afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear() })

const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })

it('counts down, warns at 5 and 1 minutes left, and time up ends the test with unanswered questions wrong', () => {
  vi.useFakeTimers()
  render(<MockTest level={5} onExit={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: 'Start' }))
  expect(screen.getByText(`Mock N5 · Vocabulary · 1 of ${MOCK_QUESTIONS}`)).toBeTruthy()
  expect(screen.getByRole('timer').textContent).toBe(`${MOCK_MINUTES}:00 left`)
  const live = document.querySelector('[aria-live="polite"]')!
  tick(60_000)
  expect(screen.getByRole('timer').textContent).toBe(`${MOCK_MINUTES - 1}:00 left`)
  expect(live.textContent).toBe('')
  tick((MOCK_MINUTES - 6) * 60_000)
  expect(live.textContent).toBe('5 minutes left')
  tick(4 * 60_000)
  expect(live.textContent).toBe('1 minute left')
  tick(60_000)
  expect(screen.getByRole('heading', { name: 'Not this time' })).toBeTruthy()
  expect(screen.getByText(`0% · 0 of ${MOCK_QUESTIONS} right · 60% to pass`)).toBeTruthy()
  expect(screen.getByText(/Time’s up/)).toBeTruthy()
  expect(document.querySelectorAll('.mock-missed li')).toHaveLength(MOCK_QUESTIONS) // every question, with its answer
})

it('scores per section, keeps the best score, and leaves cards, reviews and lessons alone', async () => {
  const db = await openDb('mock-0')
  await seedKana(db)
  const before = JSON.stringify([await db.getAll('cards'), await db.getAll('reviews'), await db.getAll('lessons'), await db.getAll('activity')])
  localStorage.setItem(mockBestKey(4), '90')
  vi.useFakeTimers()
  render(<MockTest level={4} onExit={() => {}} />)
  expect(screen.getByText('Your best: 90%')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Start' }))
  for (let i = 0; i < MOCK_QUESTIONS; i++) {
    fireEvent.click(screen.getByRole('group', { name: 'Answers' }).querySelector('button')!)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  }
  const right = MOCK_QUESTIONS - document.querySelectorAll('.mock-missed li').length
  const pct = Math.round((100 * right) / MOCK_QUESTIONS)
  expect(screen.getByText(`${pct}% · ${right} of ${MOCK_QUESTIONS} right · 60% to pass`)).toBeTruthy()
  expect(screen.queryByText(/Time’s up/)).toBeNull()
  const sections = [...document.querySelectorAll('.mock-sections dd')].map((d) => Number(d.textContent!.split(' / ')[0]))
  expect(sections.reduce((a, b) => a + b)).toBe(right)
  expect(localStorage.getItem(mockBestKey(4))).toBe('90') // a worse score keeps the best
  vi.useRealTimers()
  expect(JSON.stringify([await db.getAll('cards'), await db.getAll('reviews'), await db.getAll('lessons'), await db.getAll('activity')])).toBe(before)
  expect((await getProgress(db)).xpToday).toBe(0)
})

it('a first attempt becomes the best score', () => {
  vi.useFakeTimers()
  render(<MockTest level={3} onExit={() => {}} />)
  fireEvent.click(screen.getByRole('button', { name: 'Start' }))
  tick(MOCK_MINUTES * 60_000)
  expect(screen.getByText('A new best for N3.')).toBeTruthy()
  expect(localStorage.getItem(mockBestKey(3))).toBe('0')
})
