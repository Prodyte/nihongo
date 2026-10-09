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
