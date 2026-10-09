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
