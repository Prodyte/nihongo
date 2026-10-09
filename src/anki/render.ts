// Minimal Anki template renderer: fields, {{#S}}/{{^S}} sections, {{FrontSide}}, and the
// text/hint/type/cloze/furigana/kana/kanji filters. ponytail: no nested clozes, no {{Tags}}/{{Deck}}.
export interface RenderCtx {
  ord: number // card ordinal; for cloze notes this is cloze number - 1
  answer: boolean // rendering the back side
  frontSide: string
}

const strip = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
export const isEmpty = (v: string | undefined) => !v || strip(v).trim() === ''

const SECTION = /\{\{([#^])\s*([^{}]+?)\s*\}\}([\s\S]*?)\{\{\/\s*\2\s*\}\}/g
const CLOZE = /\{\{c(\d+)::([\s\S]*?)(?:::([\s\S]*?))?\}\}/g
const FURIGANA = / ?([^ >\n]+?)\[(?!sound:)(.+?)\]/g

function cloze(text: string, ord: number, answer: boolean) {
  return text.replace(CLOZE, (_, n, body, hint) =>
    Number(n) === ord + 1 ? `<span class="cloze">${answer ? body : `[${hint ?? '...'}]`}</span>` : body,
  )
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
    default: return v
  }
}

const SPECIAL = new Set(['Tags', 'Type', 'Deck', 'Subdeck', 'Card', 'CardFlag'])

export function renderTemplate(tpl: string, fields: Record<string, string>, ctx: RenderCtx): string {
  let t = tpl
  for (let prev = ''; prev !== t; ) {
    prev = t
    t = t.replace(SECTION, (_, kind, name, body) => ((kind === '#') === !isEmpty(fields[name]) ? body : ''))
  }
  return t.replace(/\{\{([^{}]+?)\}\}/g, (_, spec: string) => {
    const filters = spec.trim().split(':')
    const name = filters.pop()!
    if (SPECIAL.has(name)) return ''
    let v = name === 'FrontSide' ? ctx.frontSide : (fields[name] ?? '')
    for (const f of filters.reverse()) v = applyFilter(f, v, ctx)
    return v
  })
}
