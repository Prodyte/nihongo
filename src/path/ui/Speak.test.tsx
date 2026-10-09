// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ITEMS } from '../course'
import { Speak } from './Speak'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
let said: string[] = []
class Rec {
  lang = ''; maxAlternatives = 1; interimResults = true
  onresult: ((e: unknown) => void) | null = null; onerror: ((e: unknown) => void) | null = null; onend: (() => void) | null = null
  start() { setTimeout(() => { this.onresult?.({ results: [said.map((transcript) => ({ transcript }))] }); this.onend?.() }) }
  abort() {}
}
const word = ITEMS.get('w:時間')!

it('saying the word marks it right', async () => {
  vi.stubGlobal('webkitSpeechRecognition', Rec)
  said = ['時間']
  const onDone = vi.fn()
  const user = userEvent.setup()
  render(<Speak ex={{ type: 'speak', item: word }} onDone={onDone} onSkip={() => {}} />)
  await user.click(screen.getByRole('button', { name: /Tap and speak/ }))
  await screen.findByText('✓ Correct')
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith([])
})

it('a mishearing shows what was heard; "I said it right" or "Show me" decide', async () => {
  vi.stubGlobal('webkitSpeechRecognition', Rec)
  said = ['事件']
  const onDone = vi.fn()
  const user = userEvent.setup()
  render(<Speak ex={{ type: 'speak', item: word }} onDone={onDone} onSkip={() => {}} />)
  await user.click(screen.getByRole('button', { name: /Tap and speak/ }))
  expect((await screen.findByText(/Heard:/)).textContent).toBe('Heard: 事件')
  await user.click(screen.getByRole('button', { name: 'Show me' }))
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  expect(onDone).toHaveBeenCalledWith(['w:時間'])
})

it('"Can’t speak now" skips', async () => {
  vi.stubGlobal('webkitSpeechRecognition', Rec)
  const onSkip = vi.fn()
  render(<Speak ex={{ type: 'speak', item: word }} onDone={() => {}} onSkip={onSkip} />)
  await userEvent.click(screen.getByRole('button', { name: 'Can’t speak now' }))
  expect(onSkip).toHaveBeenCalled()
})
