const unescape = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

/** File names a card's HTML refers to (<img src>, [sound:]), in the NFC form media is stored under. */
export function mediaRefs(html: string): string[] {
  const out: string[] = []
  for (const m of html.matchAll(/src=(?:"([^"]*)"|'([^']*)'|([^\s>]+))|\[sound:([^\]]+)\]/g)) {
    const raw = unescape(m[1] ?? m[2] ?? m[3] ?? m[4]).normalize('NFC')
    out.push(raw)
    try { out.push(decodeURIComponent(raw)) } catch { /* keep raw only */ }
  }
  return out
}
