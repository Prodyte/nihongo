// Per-device conveniences in localStorage. It can throw (private mode, blocked storage): fall back quietly.
export const readBool = (key: string, fallback: boolean) => {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === '1'
  } catch {
    return fallback
  }
}
export const writeBool = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, value ? '1' : '0')
  } catch {
    /* the setting just won't persist */
  }
}

export const readInt = (key: string, fallback: number) => {
  try {
    const s = localStorage.getItem(key)
    return s !== null && /^-?\d+$/.test(s) ? Number(s) : fallback
  } catch {
    return fallback
  }
}
export const writeInt = (key: string, value: number) => {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    /* the setting just won't persist */
  }
}

export const readStr = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  try {
    const s = localStorage.getItem(key)
    return allowed.includes(s as T) ? (s as T) : fallback
  } catch {
    return fallback
  }
}
export const writeStr = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* the setting just won't persist */
  }
}

export const GOALS = [10, 20, 50]
export const readGoal = () => { const g = readInt('nihongo.goal', 20); return GOALS.includes(g) ? g : 20 }

export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]
/** 'system' follows the OS; light/dark pin the colours via data-theme on <html> (see index.css). */
export const applyTheme = (t: Theme) => {
  if (t === 'system') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.dataset.theme = t
}
