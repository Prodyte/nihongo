import DOMPurify from 'dompurify'
import { mediaKey, type Db } from '../db/db'

/**
 * Turn untrusted deck HTML into safe HTML: sanitize, then point <img>/[sound:] at the deck's own
 * stored media. Anything not in the deck's media (remote images, tracking pixels) is removed.
 * `makeUrl` returns a URL for a stored file; callers revoke what it creates.
 */
export async function resolveMedia(db: Db, deck: string, html: string, makeUrl: (m: Blob) => string): Promise<string> {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  const withAudio = html.replace(/\[sound:([^\]]+)\]/g, (_, n: string) => `<audio controls data-media="${esc(n)}"></audio>`)
  const tpl = document.createElement('template') // inert: nothing loads until we set blob URLs
  tpl.innerHTML = DOMPurify.sanitize(withAudio, {
    ADD_ATTR: ['controls'],
    // no remote loads (srcset/source/picture/video), no page-wide CSS (style), no spoofed forms
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea', 'video', 'source', 'picture', 'svg', 'math'],
    FORBID_ATTR: ['style', 'srcset', 'action', 'formaction'],
  })

  const decode = (n: string) => {
    try { return decodeURIComponent(n) } catch { return n } // malformed % in a filename
  }
  const lookup = async (name: string) => (await db.get('media', mediaKey(deck, name))) ?? (await db.get('media', mediaKey(deck, decode(name))))
  for (const el of tpl.content.querySelectorAll<HTMLElement>('img, audio')) {
    const name = el.getAttribute(el.tagName === 'IMG' ? 'src' : 'data-media') ?? ''
    const m = name ? await lookup(name) : undefined
    if (!m) el.remove()
    else el.setAttribute('src', makeUrl(new Blob([m.data as BlobPart], { type: m.type })))
  }
  return tpl.innerHTML
}
