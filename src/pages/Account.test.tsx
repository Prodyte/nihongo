// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import type { Db } from '../db/db'

const auth = { resetPasswordForEmail: vi.fn(async () => ({ error: null })), updateUser: vi.fn(async () => ({ error: null })) }
const state = vi.hoisted(() => ({ email: null as string | null, recovery: { pending: false, error: null as string | null } }))
vi.mock('../sync', () => ({
  recovery: state.recovery,
  endRecovery: () => { state.recovery.pending = false },
  takeLinkError: () => { const e = state.recovery.error; state.recovery.error = null; return e },
  session: async () => (state.email ? { user: { email: state.email } } : null),
  supabase: async () => ({ auth }),
  sync: async () => false,
  lastSync: () => null,
}))
const { Account } = await import('./Account')

afterEach(() => { cleanup(); vi.clearAllMocks() })

it('forgot password asks for the email first, then sends a link back to the app', async () => {
  state.email = null
  const user = userEvent.setup()
  render(<Account db={{} as Db} onSynced={() => {}} />)
  await user.click(await screen.findByRole('button', { name: 'Forgot password?' }))
  expect(screen.getByRole('status').textContent).toMatch(/email above first/)
  expect(auth.resetPasswordForEmail).not.toHaveBeenCalled()
  await user.type(screen.getByRole('textbox', { name: 'Email' }), 'a@b.c')
  await user.click(screen.getByRole('button', { name: 'Forgot password?' }))
  expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.c', { redirectTo: location.origin + location.pathname })
  expect(screen.getByRole('status').textContent).toMatch(/on its way/)
})

it('arriving from a reset link asks for a new password once, then shows the account', async () => {
  state.email = 'a@b.c'
  state.recovery.pending = true
  const user = userEvent.setup()
  render(<Account db={{} as Db} onSynced={() => {}} />)
  expect(await screen.findByRole('heading', { name: 'Choose a new password' })).toBeTruthy()
  await user.type(screen.getByLabelText('Password'), 'secret12')
  await user.click(screen.getByRole('button', { name: 'Save password' }))
  expect(auth.updateUser).toHaveBeenCalledWith({ password: 'secret12' })
  expect(screen.getByRole('heading', { name: 'Account and sync' })).toBeTruthy()
  expect(state.recovery.pending).toBe(false)
})

it("an expired link's error is shown once", async () => {
  state.email = null
  state.recovery.error = 'Email link is invalid or has expired'
  render(<Account db={{} as Db} onSynced={() => {}} />)
  expect((await screen.findByRole('status')).textContent).toMatch(/expired\. Sign in, or use Forgot password/)
  cleanup()
  render(<Account db={{} as Db} onSynced={() => {}} />)
  await screen.findByRole('heading', { name: 'Sign in' })
  expect(screen.queryByRole('status')).toBeNull()
})
