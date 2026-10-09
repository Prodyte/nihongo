// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { openDb } from '../db/db'
import { Settings } from './Settings'

beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute('data-theme') })
afterEach(cleanup)

it('speech speed, theme and "choose any lesson" are remembered; theme applies at once; autoplay is reported', async () => {
  const onAutoplay = vi.fn()
  const onFurigana = vi.fn()
  const user = userEvent.setup()
  const db = await openDb('settings-1')
  render(<Settings db={db} autoplay={true} onAutoplay={onAutoplay} furigana="auto" onFurigana={onFurigana} />)
  expect(screen.queryByRole('combobox', { name: 'Daily goal' })).toBeNull()
  await user.selectOptions(screen.getByRole('combobox', { name: 'Speech speed' }), '60')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Theme' }), 'dark')
  await user.click(screen.getByRole('checkbox', { name: /choose any lesson/ }))
  await user.click(screen.getByRole('checkbox', { name: /play audio automatically/i }))
  expect(localStorage.getItem('nihongo.rate')).toBe('60')
  expect(localStorage.getItem('nihongo.theme')).toBe('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(localStorage.getItem('nihongo.skipAhead')).toBe('1')
  expect(onAutoplay).toHaveBeenCalledWith(false)
  await user.selectOptions(screen.getByRole('combobox', { name: /Furigana/ }), 'never')
  expect(onFurigana).toHaveBeenCalledWith('never')

  cleanup()
  render(<Settings db={db} autoplay={true} onAutoplay={() => {}} furigana="auto" onFurigana={() => {}} />)
  expect((screen.getByRole('combobox', { name: 'Speech speed' }) as HTMLSelectElement).value).toBe('60')
  expect((screen.getByRole('combobox', { name: 'Theme' }) as HTMLSelectElement).value).toBe('dark')
  expect((screen.getByRole('checkbox', { name: /choose any lesson/ }) as HTMLInputElement).checked).toBe(true)

  await user.selectOptions(screen.getByRole('combobox', { name: 'Theme' }), 'system') // back to following the device
  expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
})

it('backup lives here', async () => {
  render(<Settings db={await openDb('settings-2')} autoplay={true} onAutoplay={() => {}} furigana="auto" onFurigana={() => {}} />)
  expect(screen.getByRole('heading', { name: 'Backup' })).toBeTruthy()
})
