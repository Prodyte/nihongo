// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, it } from 'vitest'
import { openDb } from '../db/db'
import { newFsrsCard } from '../srs/scheduler'
import { Study } from './Study'

afterEach(cleanup)

it('a learning card due within the session stays in it until it graduates', async () => {
  const db = await openDb('study-1')
  await db.put('cards', { id: 'x', deck: 'd', front: '犬', back: ['dog'], fsrs: newFsrsCard() })
  const user = userEvent.setup()
  render(<Study db={db} deck="d" mode="flashcard" autoplay={false} onExit={() => {}} />)
  const good = async () => {
    await user.click(await screen.findByRole('button', { name: /show answer/i }))
    await user.click(screen.getByRole('button', { name: /^Good/ }))
  }
  await good() // new -> learning, due in 10 min
  await screen.findByText('1 left')
  await good() // graduates (days away)
  await screen.findByText('Session complete 🎉')
})
