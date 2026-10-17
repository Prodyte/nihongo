import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { applyTheme, readStr, THEMES } from './settings'
import { update } from './sync'

applyTheme(readStr('nihongo.theme', THEMES, 'system'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// a new version installs in the background; App switches to it (a reload) on a tab screen, so no lesson is cut short.
// onNeedReload: the new version has taken over (from this tab or another), and the page would otherwise reload at once
const ready = (apply: () => void) => { update.apply = apply; update.ready() }
const updateSW = registerSW({ immediate: true, onNeedRefresh: () => ready(() => void updateSW(true)), onNeedReload: () => ready(() => location.reload()) })
