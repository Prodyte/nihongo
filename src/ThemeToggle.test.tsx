// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'

function media(o: { dark: boolean; tablet: boolean; wide: boolean }) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('prefers-color-scheme: dark') ? o.dark : q.includes('64rem') ? o.wide : q.includes('48rem') ? o.tablet : false,
    media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
}
const phone = (dark = false) => media({ dark, tablet: false, wide: false })
const toggle = () => screen.getByRole('button', { name: /^Switch to (light|dark) theme$/ })

function label(text: string) {
  expect(toggle().getAttribute('aria-label')).toBe(text)
  expect(toggle().getAttribute('title')).toBe(text)
}

const ready = () => screen.findByRole('button', { name: /^Switch to (light|dark) theme$/ })

beforeEach(() => {
  localStorage.clear(); localStorage.setItem('nihongo.onboarded', '1')
  document.documentElement.removeAttribute('data-theme')
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('System with OS light: toggle offers dark, tapping saves dark and applies it', async () => {
  phone(false)
  const user = userEvent.setup()
  render(<App />)
  await ready()
  label('Switch to dark theme')
  await user.click(toggle())
  expect(localStorage.getItem('nihongo.theme')).toBe('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  label('Switch to light theme')
})

it('System with OS dark: tapping switches to Light', async () => {
  phone(true)
  const user = userEvent.setup()
  render(<App />)
  await ready()
  label('Switch to light theme')
  await user.click(toggle())
  expect(localStorage.getItem('nihongo.theme')).toBe('light')
  label('Switch to dark theme')
  expect(document.documentElement.dataset.theme).toBe('light')
})

it('toggles back and forth; stored light/dark overrides the OS', async () => {
  phone(true)
  localStorage.setItem('nihongo.theme', 'light')
  const user = userEvent.setup()
  render(<App />)
  await ready()
  label('Switch to dark theme')
  await user.click(toggle())
  label('Switch to light theme')
  await user.click(toggle())
  label('Switch to dark theme')
  expect(localStorage.getItem('nihongo.theme')).toBe('light')
})

it('the choice survives a reload', async () => {
  phone(false)
  const user = userEvent.setup()
  render(<App />)
  await ready()
  await user.click(toggle())
  cleanup()
  render(<App />)
  await ready()
  label('Switch to light theme')
})

it('an invalid stored theme is treated as System', async () => {
  phone(true)
  localStorage.setItem('nihongo.theme', 'purple')
  render(<App />)
  await ready()
  label('Switch to light theme')
})

it('is a real button, keyboard operable, and sits beside the account button in the phone top bar', async () => {
  phone(false)
  const user = userEvent.setup()
  render(<App />)
  await ready()
  const b = toggle()
  expect(b.tagName).toBe('BUTTON')
  expect(b.closest('header.appbar')).toBeTruthy()
  expect(b.parentElement).toBe(screen.getByRole('button', { name: /Sign in|Account and sync/ }).parentElement)
  b.focus()
  expect(document.activeElement).toBe(b)
  await user.keyboard('{Enter}')
  expect(localStorage.getItem('nihongo.theme')).toBe('dark')
  await user.keyboard(' ')
  expect(localStorage.getItem('nihongo.theme')).toBe('light')
})

it('on wider screens the toggle is in the navigation', async () => {
  media({ dark: false, tablet: true, wide: true })
  const user = userEvent.setup()
  render(<App />)
  await ready()
  expect(document.querySelector('header.appbar')).toBeNull()
  expect(toggle().closest('nav')).toBe(screen.getByRole('navigation', { name: 'Main' }))
  await user.click(toggle())
  expect(localStorage.getItem('nihongo.theme')).toBe('dark')
})

it('Settings and the toggle agree, both ways; only Settings offers System', async () => {
  phone(false)
  const user = userEvent.setup()
  render(<App />)
  await ready()
  await user.click(screen.getByRole('button', { name: /^More$/ }))
  await user.click(screen.getByRole('button', { name: /^Settings/ }))
  const sel = (await screen.findByRole('combobox', { name: 'Theme' })) as HTMLSelectElement
  expect([...sel.options].map((o) => o.value)).toEqual(['system', 'light', 'dark'])
  expect(sel.value).toBe('system')
  await user.click(toggle())
  expect(sel.value).toBe('dark')
  await user.selectOptions(sel, 'light')
  label('Switch to dark theme')
  await user.selectOptions(sel, 'system')
  label('Switch to dark theme')
  await user.click(toggle())
  expect(sel.value).toBe('dark') // the toggle never returns to System
})

it('is hidden during full-screen lessons', async () => {
  phone(false)
  const user = userEvent.setup()
  render(<App />)
  await ready()
  await user.click(await screen.findByRole('button', { name: /^Next lesson:/ }))
  await screen.findByRole('button', { name: 'Got it' })
  expect(screen.queryByRole('button', { name: /^Switch to/ })).toBeNull()
})

it('CSS: visible focus ring on buttons, and the actions group does not shrink or wrap the bar', () => {
  const css = readFileSync('src/index.css', 'utf8')
  expect(css).toMatch(/button:focus-visible[^{]*\{[^}]*outline:\s*3px/)
  expect(css).toMatch(/\.appbar-actions\s*\{[^}]*display:\s*flex[^}]*flex:\s*none/)
  expect(css).not.toMatch(/\.appbar-actions\s*\{[^}]*flex-wrap:\s*wrap/)
})

it('CSS: the brand subtitle is hidden below 22rem so the 320px bar stays on one row', () => {
  const css = readFileSync('src/index.css', 'utf8')
  expect(css).toMatch(/@media\s*\(max-width:\s*22rem\)\s*\{[^}]*\.brand small\s*\{[^}]*display:\s*none/)
})
