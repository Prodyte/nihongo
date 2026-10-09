import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { applyTheme, readStr, THEMES } from './settings'

applyTheme(readStr('nihongo.theme', THEMES, 'system'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerSW({ immediate: true }) // autoUpdate: a new version installs in the background, then the page reloads once to switch to it
