import type { LevelCoverage } from '../path/progress'

const pct = ([a, b]: [number, number]) => (b ? Math.round((100 * a) / b) : 0)

/** Progress bars for each JLPT level: words, kanji, grammar. */
export function Levels({ levels }: { levels: LevelCoverage[] }) {
  return (
    <div className="levels">
      {levels.map((c) => (
        <section key={c.level} aria-label={`JLPT N${c.level}`}>
          <h3>N{c.level}</h3>
          {([['Words', c.words], ['Kanji', c.kanji], ...(c.grammar[1] ? [['Grammar', c.grammar] as const] : [])] as const).map(([name, v]) => (
            <label key={name} className="meter">
              <span>{name}</span>
              <progress max={v[1]} value={v[0]} aria-label={`N${c.level} ${name.toLowerCase()}`} />
              <small>{v[0]}/{v[1]} · {pct(v)}%</small>
            </label>
          ))}
        </section>
      ))}
    </div>
  )
}
