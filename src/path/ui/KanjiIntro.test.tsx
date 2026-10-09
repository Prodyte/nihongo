// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ITEMS } from '../course'
import { KanjiIntro } from './KanjiIntro'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('shows meanings, on readings in katakana, kun readings, stroke count and example words; draws the strokes in order', async () => {
  const fetch = vi.fn(async () => new Response(JSON.stringify({ 日: ['M1,1', 'M2,2', 'M3,3', 'M4,4'] })))
  vi.stubGlobal('fetch', fetch)
  const onDone = vi.fn()
  render(<KanjiIntro item={ITEMS.get('kanji:日')!} onDone={onDone} />)
  expect(screen.getByText('day, sun, japan')).toBeTruthy()
  expect(screen.getByText('ニチ、ジツ')).toBeTruthy()
  expect(screen.getByText('ひ、〜び、〜か')).toBeTruthy()
  expect(screen.getByText('4')).toBeTruthy()
  expect(document.querySelectorAll('ul.examples li').length).toBeGreaterThan(0)
  const svg = await screen.findByRole('img', { name: '日, written in 4 strokes' })
  const strokes = [...svg.querySelectorAll<SVGPathElement>('path.stroke')]
  expect(strokes.map((p) => p.getAttribute('d'))).toEqual(['M1,1', 'M2,2', 'M3,3', 'M4,4'])
  expect(strokes.map((p) => p.style.animationDelay)).toEqual(['0s', '0.6s', '1.2s', '1.8s'])
  await userEvent.click(screen.getByRole('button', { name: 'Got it' }))
  expect(onDone).toHaveBeenCalledWith([])
})

it('without the stroke data (offline, first visit) it still shows the character', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
  render(<KanjiIntro item={ITEMS.get('kanji:国')!} onDone={() => {}} />)
  expect(document.querySelector('.kana')!.textContent).toBe('国')
  expect(screen.queryByRole('img')).toBeNull()
})
