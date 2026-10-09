// Tab icons: simple 24px outline glyphs, decorative (each tab also has a text label).
const P = {
  today: 'M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z',
  path: 'M4 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h11M20 7h.01',
  review: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4',
  lookup: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
} as const

export const Icon = ({ name }: { name: keyof typeof P }) => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={P[name]} />
  </svg>
)
