// Minimal Anki template renderer: fields, {{#S}}/{{^S}} sections, {{FrontSide}}, and the
// text/hint/type/cloze/furigana/kana/kanji/tts filters. ponytail: no {{Tags}}/{{Deck}}; a cloze body can't contain {{ or }}.
export interface RenderCtx {
  ord: number // card ordinal; for cloze notes this is cloze number - 1
  answer: boolean // rendering the back side
  frontSide: string
}

const strip = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
/** Anki's rule: a field is empty if it holds only whitespace, &nbsp;, <br> and <div> (an image-only field is not empty). */
export const isEmpty = (v: string | undefined) => !v || /^(?:\s|&nbsp;|<\/?(?:br|div)\b[^>]*>)*$/i.test(v)

const SECTION = /\{\{([#^])\s*([^{}]+?)\s*\}\}([\s\S]*?)\{\{\/\s*\2\s*\}\}/g
const NOBRACE = '(?:(?!\\{\\{|\\}\\})[\\s\\S])*?' // so the innermost cloze matches first
const CLOZE = new RegExp(`\\{\\{c(\\d+)::(${NOBRACE})(?:::(${NOBRACE}))?\\}\\}`, 'g')
const FURIGANA = / ?([^ >\n]+?)\[(?!sound:)(.+?)\]/g

function cloze(text: string, ord: number, answer: boolean) {
  for (let prev = ''; prev !== text; ) { // nested: {{c1::a {{c2::b}} c}} resolves c2, then c1
    prev = text
    text = text.replace(CLOZE, (_, n, body, hint) =>
      Number(n) === ord + 1 ? `<span class="cloze">${answer ? body : `[${hint ?? '...'}]`}</span>` : body,
    )
  }
  return text
}

function applyFilter(filter: string, v: string, ctx: RenderCtx) {
  switch (filter) {
    case 'cloze': return cloze(v, ctx.ord, ctx.answer)
    case 'text': return strip(v)
    case 'hint': return isEmpty(v) ? '' : `<details><summary>Hint</summary>${v}</details>`
    case 'type': return '' // typed-answer boxes aren't supported
    case 'furigana': return v.replace(FURIGANA, '<ruby>$1<rt>$2</rt></ruby>')
    case 'kana': return v.replace(FURIGANA, '$2')
    case 'kanji': return v.replace(FURIGANA, '$1')
    default: return /^tts\b/.test(filter) ? '' : v // {{tts ja_JP:F}} would print (and spoil) a listening card's text
  }
}

const SPECIAL = new Set(['Tags', 'Type', 'Deck', 'Subdeck', 'Card', 'CardFlag'])

export function renderTemplate(tpl: string, fields: Record<string, string>, ctx: RenderCtx): string {
  const field = (n: string) => (Object.hasOwn(fields, n) ? fields[n] : '') // {{constructor}} must not hit Object.prototype
  let t = tpl
  for (let prev = ''; prev !== t; ) {
    prev = t
    t = t.replace(SECTION, (_, kind, name, body) => ((kind === '#') === !isEmpty(field(name)) ? body : ''))
  }
  return t.replace(/\{\{([^{}]+?)\}\}/g, (_, spec: string) => {
    const filters = spec.trim().split(':')
    const name = filters.pop()!
    if (SPECIAL.has(name)) return ''
    let v = name === 'FrontSide' ? ctx.frontSide : field(name)
    for (const f of filters.reverse()) v = applyFilter(f, v, ctx)
    return v
  })
}
