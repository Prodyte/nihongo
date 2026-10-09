// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { openDb } from '../db/db'
import { ITEMS, lessonById } from '../path/course'
import { completeLesson } from '../path/progress'
import { Grammar } from './Grammar'

afterEach(cleanup)

it('lists all 28 grammar points with learned state; filtering finds one; opening shows its explanation and sentences', async () => {
  const db = await openDb('grammar-ref')
  await completeLesson(db, lessonById('grammar-1-1')!, ITEMS, {}, 1)
  const user = userEvent.setup()
  render(<Grammar db={db} />)
  await screen.findByText('1 of 28 learned')
  expect(document.querySelectorAll('ul.results > li')).toHaveLength(28)
  await user.type(screen.getByRole('searchbox'), 'より')
  expect(document.querySelectorAll('ul.results > li')).toHaveLength(1)
  const item = document.querySelector('ul.results > li')!
  await user.click(item.querySelector('summary')!)
  expect(item.textContent).toMatch(/The train is faster than the bus\./)
  expect(item.querySelectorAll('ul.examples li')).toHaveLength(6)
})
