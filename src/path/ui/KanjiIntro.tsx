import { toKata } from '../../data/kana'
import { ITEMS, written, type Item } from '../course'
import { Mnemonic } from './Mnemonic'
import { Strokes } from './Strokes'

/** A new kanji: stroke order, meanings, readings, and course words written with it. */
export function KanjiIntro({ item, onDone }: { item: Item; onDone: (missed: string[]) => void }) {
  const examples = (item.examples ?? []).flatMap((id) => ITEMS.get(id) ?? [])
  return (
    <div className="card">
      <p className="q">New kanji</p>
      <Strokes char={item.jp} />
      <div className="answer">{item.gloss}</div>
      <Mnemonic item={item} />
      <dl className="kanji-readings">
        {!!item.on?.length && <><dt>On reading</dt><dd lang="ja">{item.on.map(toKata).join('、')}</dd></>}
        {!!item.kun?.length && <><dt>Kun reading</dt><dd lang="ja">{item.kun.join('、')}</dd></>}
        <dt>Strokes</dt><dd>{item.strokes}</dd>
      </dl>
      {examples.length > 0 && (
        <ul className="examples">
          {examples.map((w) => (
            <li key={w.id}><span className="jp" lang="ja">{w.written ?? w.kanji ?? written(w)} <small>{w.jp}</small></span><span>{w.gloss}</span></li>
          ))}
        </ul>
      )}
      <button className="primary" autoFocus onKeyDown={(e) => e.repeat && e.preventDefault()} onClick={() => onDone([])}>Got it</button>
    </div>
  )
}
