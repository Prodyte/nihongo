import type { StoredCard } from '../db/db'

export const shuffle = <T,>(a: T[], rand: () => number) => {
  const out = [...a]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** n shuffled answer options: the card's answer plus distinct wrong ones from the pool. */
export function choices(card: StoredCard, pool: StoredCard[], n = 4, rand = Math.random): string[] {
  const wrong = new Set(pool.map((c) => c.back[0]))
  card.back.forEach((a) => wrong.delete(a)) // never offer a second correct answer (e.g. ぢ vs じ)
  return shuffle([card.back[0], ...shuffle([...wrong], rand).slice(0, n - 1)], rand)
}
