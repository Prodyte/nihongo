import logo from './logo-paths.json'

// 24px outline icons, decorative (whatever uses them carries a text label or aria-label).
const P = {
  today: 'M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z',
  path: 'M4 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h11M20 7h.01',
  review: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4',
  lookup: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  speaker: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5 10 17 19 7.5',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
  flame: 'M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.4 2.6-5.3 3.7-8.4.3 2 1.5 3.3 2.6 3.8.4-2.7 1.8-5.3 4.2-7.3-.4 3.1 2.5 5.4 2.5 9.9 0 4.2-2.6 8.1-6.5 8.1z',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z',
  play: 'M8 5.5v13l10.5-6.5z',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  repeat: 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4',
  wave: 'M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M21 12h0',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  cards: 'M7 3h11a2 2 0 0 1 2 2v13M4 7h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z',
  shuffle: 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
} as const
export type IconName = keyof typeof P

export const Icon = ({ name, size = 24 }: { name: IconName; size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
    <path d={P[name]} />
  </svg>
)

/** The ✕ that leaves a lesson, test or review session. */
export const ExitButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" className="icon-btn ghost" aria-label="Exit" onClick={onClick}><Icon name="close" size={26} /></button>
)

/** The app mark: 日 (sun, day; the first character of 日本語) in white on vermilion, drawn from KanjiVG strokes. */
export const Logo = ({ size = 28 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 109 109" className="logo">
    <rect width="109" height="109" rx="24" fill="var(--accent)" />
    <g transform="translate(21.8 21.8) scale(.6)" fill="none" stroke="var(--on-accent)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
      {logo.map((d, i) => <path key={i} d={d} />)}
    </g>
  </svg>
)
