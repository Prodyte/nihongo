// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it } from 'vitest'
import App from './App'

const media = (o: { dark: boolean; wide: boolean }) => {
  window.matchMedia = ((q: string) => ({
    matches: q.includes('prefers-color-scheme') ? o.dark : q.includes('min-width') ? o.wide : false,
    media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false,
  })) as unknown as typeof matchMedia
}
beforeEach(() => { localStorage.clear(); localStorage.setItem('nihongo.onboarded', '1'); document.documentElement.removeAttribute('data-theme'); media({ dark: false, wide: false }) })
afterEach(cleanup)

const toDark = () => screen.queryByRole('button', { name: 'Switch to dark theme' })
const toLight = () => screen.queryByRole('button', { name: 'Switch to light theme' })

it('phone: system with OS light -> button says dark; tap saves dark, applies, and flips label', async () => {
  const user = userEvent.setup()
  render(<App />)
  const b = await screen.findByRole('button', { name: 'Switch to dark theme' })
  expect(b.tagName).toBe('BUTTON')
  expect(b.closest('header.appbar')).toBeTruthy()
  await user.click(b)
  expect(localStorage.getItem('nihongo.theme')).toBe('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(toLight()).toBeTruthy()
  expect(toDark()).toBeNull()
  await user.click(toLight()!)
  expect(localStorage.getItem('nihongo.theme')).toBe('light')
  expect(document.documentElement.dataset.theme).toBe('light')
})

it('system with OS dark switches to Light', async () => {
  media({ dark: true, wide: false })
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: 'Switch to light theme' }))
  expect(localStorage.getItem('nihongo.theme')).toBe('light')
})

it('explicit saved theme wins over the OS', async () => {
  localStorage.setItem('nihongo.theme', 'light')
  media({ dark: true, wide: false })
  render(<App />)
  expect(await screen.findByRole('button', { name: 'Switch to dark theme' })).toBeTruthy()
})

it('invalid saved value is treated as system', async () => {
  localStorage.setItem('nihongo.theme', 'purple')
  media({ dark: true, wide: false })
  render(<App />)
  expect(await screen.findByRole('button', { name: 'Switch to light theme' })).toBeTruthy()
})

it('survives a reload', async () => {
  const user = userEvent.setup()
  const { unmount } = render(<App />)
  await user.click(await screen.findByRole('button', { name: 'Switch to dark theme' }))
  unmount()
  render(<App />)
  expect(await screen.findByRole('button', { name: 'Switch to light theme' })).toBeTruthy()
})

it('wide screens: the button is in the navigation', async () => {
  media({ dark: false, wide: true })
  const user = userEvent.setup()
  render(<App />)
  const b = await screen.findByRole('button', { name: 'Switch to dark theme' })
  expect(b.closest('nav')).toBeTruthy()
  expect(document.querySelector('header.appbar')).toBeNull()
  await user.click(b)
  expect(localStorage.getItem('nihongo.theme')).toBe('dark')
})

it('is keyboard reachable and activates with Enter', async () => {
  const user = userEvent.setup()
  render(<App />)
  const b = await screen.findByRole('button', { name: 'Switch to dark theme' })
  b.focus()
  expect(document.activeElement).toBe(b)
  await user.keyboard('{Enter}')
  expect(localStorage.getItem('nihongo.theme')).toBe('dark')
})

it('Settings theme select agrees with the toggle and can return to System', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: 'Switch to dark theme' }))
  await user.click(screen.getByRole('button', { name: /^More$/ }))
  await user.click(screen.getByRole('button', { name: /^Settings/ }))
  const sel = (await screen.findByLabelText(/^Theme/)) as HTMLSelectElement
  expect(sel.value).toBe('dark')
  expect(Array.from(sel.options).map((o) => o.value)).toEqual(['system', 'light', 'dark'])
  await user.selectOptions(sel, 'system')
  expect(localStorage.getItem('nihongo.theme')).toBe('system')
  expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
})

it('hidden during a full-screen lesson', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: /^Next lesson:/ }))
  await screen.findByRole('button', { name: 'Got it' })
  expect(toDark()).toBeNull()
  expect(toLight()).toBeNull()
})
