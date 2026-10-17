import type { StoredCard } from '../db/db'

export const shuffle = <T,>(a: T[], rand: () => number) => {
  const out = [...a]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** n shuffled answer options: the card's answer plus distinct wrong ones from its own deck (the whole pool if that has too few). */
export function choices(card: StoredCard, pool: StoredCard[], n = 4, rand = Math.random): string[] {
  // never offer a second correct answer (e.g. ぢ vs じ)
  const wrongIn = (cards: StoredCard[]) => [...new Set(cards.map((c) => c.back[0]))].filter((a) => !card.back.includes(a))
  const same = wrongIn(pool.filter((c) => c.deck === card.deck)) // in the "all" deck: no romaji among word meanings
  const wrong = same.length >= n - 1 ? same : wrongIn(pool)
  return shuffle([card.back[0], ...shuffle(wrong, rand).slice(0, n - 1)], rand)
}
